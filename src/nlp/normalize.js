/* Normalisasi teks: huruf kecil, tangani kata majemuk & singkatan teknis, buang diakritik/apostrof, sisakan a-z 0-9 */
(function () {
  const COMPOUND_MAP = [
    [/\be-learning\b/gi, 'elearning'],
    [/\be-modul\b/gi, 'emodul'],
    [/\be-book\b/gi, 'ebook'],
    [/\be-commerce\b/gi, 'ecommerce'],
    [/\bwi-fi\b/gi, 'wifi'],
    [/\bclient-server\b/gi, 'client server'],
    [/\bmulti-agent\b/gi, 'multi agent'],
    [/\bgame-based\b/gi, 'game based'],
    [/\bproject-based\b/gi, 'project based'],
    [/\bproblem-based\b/gi, 'problem based'],
    [/\bai-powered\b/gi, 'ai powered'],
    [/\bai-supported\b/gi, 'ai supported'],
    [/\bai-driven\b/gi, 'ai driven'],
    [/\bai-based\b/gi, 'ai based'],
    [/\bweb-based\b/gi, 'web based']
  ];

  function normalizeText(t) {
    if (!t) return '';
    let str = t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (const [pattern, replacement] of COMPOUND_MAP) {
      str = str.replace(pattern, replacement);
    }
    // Buang apostrof dan karakter non-alfanumerik jadi spasi
    return str.replace(/['\u2019`]/g, '').replace(/[^a-z0-9\s]/g, ' ');
  }

  ATLAS.nlp.normalizeText = normalizeText;
})();
