/* Mesin VSM: TF, IDF smooth, inverted index, cosine similarity */
(function () {
  const { preprocessTextWithPipeline, detectLanguage } = ATLAS.nlp;
    class VSMEngine {
      constructor() {
        this.documents = [];
        this.vocabulary = new Set();
        this.df = Object.create(null);
        this.idf = Object.create(null);
        this.inverted = Object.create(null); // term -> [[docIndex, bobot TF-IDF], ...]
        this.isIndexed = false;
        this.indexTimeMs = '0.00';
      }

      calculateTF(tokens) {
        const freq = Object.create(null);
        tokens.forEach(t => { freq[t] = (freq[t] || 0) + 1; });
        const total = tokens.length || 1;
        for (const t in freq) freq[t] = freq[t] / total; // TF = f(t,d) / |d|
        return freq;
      }

      buildIndex(docs) {
        const t0 = performance.now();
        this.df = Object.create(null);
        this.idf = Object.create(null);
        this.inverted = Object.create(null);
        this.vocabulary = new Set();

        // 1) Pra-proses + TF
        this.documents = docs.map(doc => {
          const lang = detectLanguage(doc.title + ' ' + doc.content); // satu bahasa per dokumen
          const tokens = [
            ...preprocessTextWithPipeline(doc.title, lang).stemmedTokens,
            ...preprocessTextWithPipeline(doc.content, lang).stemmedTokens
          ];
          return { ...doc, lang, allStemmedTokens: tokens, tf: this.calculateTF(tokens) };
        });

        // 2) DF & IDF (smooth): ln((N+1)/(DF+1)) + 1
        const N = this.documents.length;
        this.documents.forEach(doc => {
          for (const term in doc.tf) {
            this.vocabulary.add(term);
            this.df[term] = (this.df[term] || 0) + 1;
          }
        });
        this.vocabulary.forEach(term => {
          this.idf[term] = Math.log((N + 1) / (this.df[term] + 1)) + 1;
        });

        // 3) Bobot TF-IDF, norma vektor, dan inverted index
        this.documents.forEach((doc, idx) => {
          let sumSq = 0;
          const vector = Object.create(null);
          for (const term in doc.tf) {
            const w = doc.tf[term] * this.idf[term];
            vector[term] = w;
            sumSq += w * w;
            (this.inverted[term] = this.inverted[term] || []).push([idx, w]);
          }
          doc.vector = vector;
          doc.norm = Math.sqrt(sumSq);
        });

        this.isIndexed = true;
        this.indexTimeMs = (performance.now() - t0).toFixed(2);
      }

      search(rawQuery) {
        const empty = { results: [], queryPipeline: null, searchTimeMs: '0.00', queryNorm: 0, unknownTerms: [] };
        if (!this.isIndexed || !rawQuery.trim()) return empty;
        const t0 = performance.now();
        const queryPipeline = preprocessTextWithPipeline(rawQuery);
        const qTF = this.calculateTF(queryPipeline.stemmedTokens);

        // Vektor kueri: hanya term yang ada di korpus (term di luar kosakata tidak punya IDF)
        const qVec = Object.create(null);
        const unknownTerms = [];
        let qSumSq = 0;
        for (const term in qTF) {
          if (!(term in this.idf)) { unknownTerms.push(term); continue; }
          const w = qTF[term] * this.idf[term];
          qVec[term] = w;
          qSumSq += w * w;
        }
        const queryNorm = Math.sqrt(qSumSq);
        if (queryNorm === 0) return { ...empty, queryPipeline, unknownTerms };

        // Dot product lewat inverted index (hanya dokumen yang memuat term kueri)
        const acc = new Map();
        for (const term in qVec) {
          for (const [di, dw] of this.inverted[term]) {
            let e = acc.get(di);
            if (!e) { e = { dot: 0, terms: [] }; acc.set(di, e); }
            const prod = qVec[term] * dw;
            e.dot += prod;
            e.terms.push({ term, queryWeight: qVec[term], docWeight: dw, prod });
          }
        }

        // Cosine similarity + perangkingan
        const results = [];
        acc.forEach((e, di) => {
          const doc = this.documents[di];
          const denom = queryNorm * doc.norm;
          if (!denom) return;
          const score = e.dot / denom;
          const termContributions = e.terms
            .map(t => ({ term: t.term, queryWeight: t.queryWeight, docWeight: t.docWeight,
                         contribution: t.prod / denom, percent: (t.prod / e.dot) * 100 }))
            .sort((a, b) => b.contribution - a.contribution);
          results.push({
            document: doc, score, queryVector: qVec, docVector: doc.vector,
            queryNorm, docNorm: doc.norm,
            matchedTerms: termContributions.map(t => t.term), termContributions
          });
        });
        results.sort((a, b) => b.score - a.score);
        return { results, queryPipeline, searchTimeMs: (performance.now() - t0).toFixed(2), queryNorm, unknownTerms };
      }
    }
  ATLAS.engine.VSMEngine = VSMEngine;
})();
