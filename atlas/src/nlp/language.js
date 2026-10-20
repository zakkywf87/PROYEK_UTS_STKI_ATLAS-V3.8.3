/* Deteksi bahasa dokumen/kueri (ID vs EN vs MIXED) */
(function () {
  const { INDONESIAN_STOPWORDS, ENGLISH_STOPWORDS, normalizeText, isIndonesianRoot } = ATLAS.nlp;
  let enWordSet = null;

  function getEnglishWordSet() {
    if (!enWordSet) {
      enWordSet = new Set(ATLAS.nlp.kstemLexicon || []);
      if (ATLAS.nlp.EN_ROOT_OVERRIDES) {
        for (const [k] of ATLAS.nlp.EN_ROOT_OVERRIDES) {
          enWordSet.add(k);
        }
      }
    }
    return enWordSet;
  }

  // Deteksi bahasa: hitung kemunculan kata & stopword ID vs EN
  function detectLanguage(text) {
    if (!text) return 'id';
    let id = 0, en = 0;
    const enDict = getEnglishWordSet();
    const tokens = normalizeText(text).split(/\s+/).filter(t => t.length > 1 || /\d/.test(t));

    if (tokens.length === 0) return 'id';

    tokens.forEach(t => {
      if (INDONESIAN_STOPWORDS.has(t)) id += 2;
      else if (isIndonesianRoot(t)) id += 1;

      if (ENGLISH_STOPWORDS.has(t)) en += 2;
      else if (enDict.has(t)) en += 1;
    });

    // Bila tidak ada stopword sama sekali (mis. kueri singkat "Intelligent Tutoring System")
    if (en > id) return 'en';
    return 'id';
  }

  ATLAS.nlp.detectLanguage = detectLanguage;
})();
