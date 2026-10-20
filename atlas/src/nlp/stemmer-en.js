/* Stemmer Bahasa Inggris: KStem (Krovetz) + Kamus Penyelarasan Istilah Teknis/Informatika
   Implementasi KStem inti: src/nlp/kstem/
   Menyelesaikan masalah overstemming (router->route, troubleshooting->troubleshoote) dan understemming (learning->learn). */
(function () {
  const cache = new Map();

  // Kamus override istilah teknis bahasa Inggris dan pemetaan bilingual agar akurat untuk korpus informatika/TKJ
  const EN_ROOT_OVERRIDES = new Map([
    ['troubleshooting', 'troubleshoot'],
    ['troubleshoote', 'troubleshoot'],
    ['troubleshooted', 'troubleshoot'],
    ['troubleshoots', 'troubleshoot'],
    ['learning', 'learn'],
    ['learnings', 'learn'],
    ['e-learning', 'elearn'],
    ['elearning', 'elearn'],
    ['router', 'router'],
    ['routers', 'router'],
    ['routing', 'routing'],
    ['modelling', 'model'],
    ['modeling', 'model'],
    ['models', 'model'],
    ['modeled', 'model'],
    ['modelled', 'model'],
    ['gamification', 'gamifikasi'],
    ['gamified', 'gamifikasi'],
    ['gamifying', 'gamifikasi'],
    ['gaming', 'game'],
    ['games', 'game'],
    ['game', 'game'],
    ['switching', 'switch'],
    ['switches', 'switch'],
    ['monitoring', 'monitor'],
    ['monitored', 'monitor'],
    ['testing', 'test'],
    ['tested', 'test'],
    ['tests', 'test'],
    ['tracking', 'track'],
    ['tracker', 'tracker'],
    ['trackers', 'tracker'],
    ['training', 'train'],
    ['trainer', 'trainer'],
    ['trainers', 'trainer'],
    ['clustering', 'cluster'],
    ['clusters', 'cluster'],
    ['networks', 'network'],
    ['networking', 'network'],
    ['networked', 'network'],
    ['computers', 'computer'],
    ['computing', 'compute'],
    ['servers', 'server'],
    ['services', 'service'],
    ['clients', 'client'],
    ['users', 'user'],
    ['systems', 'system'],
    ['tutoring', 'tutor'],
    ['tutors', 'tutor'],
    ['assistants', 'assistant'],
    ['environments', 'environment'],
    ['platforms', 'platform'],
    ['frameworks', 'framework'],
    ['educational', 'educational'],
    ['interactive', 'interaktif'],
    ['augmented', 'augment'],
    ['simulations', 'simulation'],
    ['simulated', 'simulation'],
    ['chatbots', 'chatbot']
  ]);

  function stemEnglishWord(w) {
    if (!w) return '';
    if (/\d/.test(w)) return w;
    let r = cache.get(w);
    if (r !== undefined) return r;

    // 1. Cek kamus istilah teknis & penyesuaian khusus
    if (EN_ROOT_OVERRIDES.has(w)) {
      r = EN_ROOT_OVERRIDES.get(w);
      cache.set(w, r);
      return r;
    }

    // 2. Jalankan KStem Krovetz
    r = ATLAS.nlp.kstem(w);

    // 3. Tangani hasil KStem jika masih ada di daftar penyesuaian (mis. troubleshoote -> troubleshoot)
    if (EN_ROOT_OVERRIDES.has(r)) {
      r = EN_ROOT_OVERRIDES.get(r);
    }

    cache.set(w, r);
    return r;
  }

  ATLAS.nlp.stemEnglishWord = stemEnglishWord;
  ATLAS.nlp.EN_ROOT_OVERRIDES = EN_ROOT_OVERRIDES;
})();
