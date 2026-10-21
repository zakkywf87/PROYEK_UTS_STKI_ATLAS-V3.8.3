/* Pipeline pra-proses: normalisasi -> token -> stopword -> stemming (mendukung teks campur ID-EN) */
(function () {
  const {
    INDONESIAN_STOPWORDS,
    ENGLISH_STOPWORDS,
    isIndonesianRoot,
    stemIndonesianWord,
    stemEnglishWord,
    normalizeText,
    detectLanguage
  } = ATLAS.nlp;

  // Stem sesuai bahasa dan karakteristik kata (mendukung terminologi bilingual/campur)
  function stemToken(tok, lang) {
    if (!tok) return '';
    if (/\d/.test(tok)) return tok;

    // 1. Cek override kamus langsung
    if (ATLAS.nlp.ID_ROOT_OVERRIDES && ATLAS.nlp.ID_ROOT_OVERRIDES.has(tok)) {
      return ATLAS.nlp.ID_ROOT_OVERRIDES.get(tok);
    }
    if (ATLAS.nlp.EN_ROOT_OVERRIDES && ATLAS.nlp.EN_ROOT_OVERRIDES.has(tok)) {
      return ATLAS.nlp.EN_ROOT_OVERRIDES.get(tok);
    }

    if (lang === 'en') {
      const sEn = stemEnglishWord(tok);
      // Fallback bila kata ternyata kata bahasa Indonesia dalam korpus Inggris
      if (sEn === tok && (isIndonesianRoot(tok) || (ATLAS.nlp.ID_ROOT_OVERRIDES && ATLAS.nlp.ID_ROOT_OVERRIDES.has(tok)))) {
        return stemIndonesianWord(tok);
      }
      return sEn;
    }

    // Dokumen/Kueri Bahasa Indonesia:
    // Cek apakah kata merupakan istilah teknis/Inggris
    if (ATLAS.nlp.EN_ROOT_OVERRIDES && ATLAS.nlp.EN_ROOT_OVERRIDES.has(tok)) {
      return ATLAS.nlp.EN_ROOT_OVERRIDES.get(tok);
    }

    const sId = stemIndonesianWord(tok);
    // Bila hasil adalah kata dasar Indonesia yang valid atau ada angka, pertahankan
    if (isIndonesianRoot(sId)) {
      return sId;
    }

    // Bila bukan kata dasar Indonesia, coba stem dengan stemmer Inggris (KStem)
    const sEn = stemEnglishWord(sId);
    return sEn || sId;
  }

  function preprocessTextWithPipeline(text, forcedLang) {
    const empty = { raw: '', lang: forcedLang || 'id', caseFolded: '', tokens: [], filteredTokens: [], stemmedTokens: [], trace: [] };
    if (!text) return empty;

    const detected = detectLanguage(text);
    const lang = forcedLang || detected;

    // 1. Normalisasi teks (tangani kata majemuk: e-learning -> elearning, wi-fi -> wifi, dll.)
    const caseFolded = normalizeText(text);

    // 2. Tokenisasi (token alfabet 1 huruf dibuang kecuali angka)
    const rawTokens = caseFolded.split(/\s+/).filter(t => t.length > 1 || /\d/.test(t));

    // 3. Stopword removal & stemming (bilingual-aware untuk judul campur Indonesia & Inggris)
    const filteredTokens = [], stemmedTokens = [], trace = [];

    rawTokens.forEach(token => {
      // Periksa stopword: bila bahasa dipaksa spesifik, prioritaskan daftar bahasa tersebut
      // Namun untuk teks umum/campur, filter stopword kedua bahasa agar kata penghubung asing/lokal tidak mengotori indeks
      let isStop = false;
      let stopLang = '';

      if (forcedLang) {
        const stopSet = forcedLang === 'en' ? ENGLISH_STOPWORDS : INDONESIAN_STOPWORDS;
        if (stopSet.has(token)) {
          isStop = true;
          stopLang = forcedLang.toUpperCase();
        }
      } else {
        if (INDONESIAN_STOPWORDS.has(token)) {
          isStop = true;
          stopLang = 'ID';
        } else if (ENGLISH_STOPWORDS.has(token)) {
          isStop = true;
          stopLang = 'EN';
        }
      }

      if (isStop) {
        trace.push({
          token,
          status: 'removed',
          reason: `Stopword (${stopLang})`
        });
        return;
      }

      const stemmed = stemToken(token, lang);
      filteredTokens.push(token);
      stemmedTokens.push(stemmed);

      trace.push({
        token,
        stemmed,
        status: token !== stemmed ? 'stemmed' : 'kept',
        reason: token !== stemmed ? `Stemmed to "${stemmed}"` : 'Preserved'
      });
    });

    return { raw: text, lang, caseFolded, tokens: rawTokens, filteredTokens, stemmedTokens, trace };
  }

  ATLAS.nlp.stemToken = stemToken;
  ATLAS.nlp.preprocessTextWithPipeline = preprocessTextWithPipeline;
})();
