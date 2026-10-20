/* Stemmer Bahasa Indonesia: SastrawiJs (npm "sastrawijs", port Sastrawi PHP, MIT).
   Berkas pustaka: src/nlp/vendor/sastrawijs.umd.js (disalin dari node_modules lewat `npm run vendor`).
   Dilengkapi kamus koreksi pemulihan kata rusak (pengenalan->kenal, menengah->tengah, penilaian->nilai, berbasis->basis, dll.) */
(function () {
  const USE_NASAL_FIX = true;
  const stemmer = new window.sastrawijs.Stemmer();
  const cache = new Map();

  // Kamus perbaikan kata dasar spesifik yang sering rusak akibat overstemming / understemming Sastrawi
  const EXACT_ROOT_OVERRIDES = new Map([
    ['pengenalan', 'kenal'],
    ['mengenal', 'kenal'],
    ['dikenal', 'kenal'],
    ['terkenal', 'kenal'],
    ['menengah', 'tengah'],
    ['penilaian', 'nilai'],
    ['menilai', 'nilai'],
    ['dinilai', 'nilai'],
    ['berbasis', 'basis'],
    ['berdasar', 'dasar'],
    ['berdasarkan', 'dasar'],
    ['pemasaran', 'pasar'],
    ['pemetaan', 'peta'],
    ['pergerakan', 'gerak'],
    ['kerusakan', 'rusak'],
    ['merusak', 'rusak'],
    ['pemupukan', 'pupuk'],
    ['penyiraman', 'siram'],
    ['keterampilan', 'terampil'],
    ['terampil', 'terampil'],
    ['pemberdayaan', 'daya'],
    ['pelatihan', 'latih'],
    ['berlatih', 'latih'],
    ['penugasan', 'tugas'],
    ['pembina', 'bina'],
    ['pembinaan', 'bina'],
    ['pengawasan', 'awas'],
    ['pengendalian', 'kendali'],
    ['pengerjaan', 'kerja'],
    ['pekerjaan', 'kerja'],
    ['pengelolaan', 'kelola'],
    ['pengembangan', 'kembang'],
    ['mengembangkan', 'kembang'],
    ['dikembangkan', 'kembang'],
    ['pembelajaran', 'ajar'],
    ['pelajaran', 'ajar'],
    ['pengajaran', 'ajar'],
    ['belajar', 'ajar'],
    ['mengajar', 'ajar'],
    ['pendidikan', 'didik'],
    ['mendidik', 'didik'],
    ['didik', 'didik'],
    ['pemrograman', 'program'],
    ['pemrogram', 'program'],
    ['perancangan', 'rancang'],
    ['merancang', 'rancang'],
    ['dirancang', 'rancang'],
    ['kejuruan', 'kejuruan'],
    ['perangkat', 'perangkat'],
    ['keberhasilan', 'hasil'],
    ['kebutuhan', 'butuh'],
    ['kemampuan', 'mampu'],
    ['kelayakan', 'layak'],
    ['kevalidan', 'valid'],
    ['kepraktisan', 'praktis'],
    ['keefektifan', 'efektif'],
    ['kemudahan', 'mudah'],
    ['kemenarikan', 'tarik'],
    ['keterbacaan', 'baca'],
    ['keterpahaman', 'paham'],
    ['pengujian', 'uji'],
    ['menguji', 'uji'],
    ['diuji', 'uji'],
    ['pengukuran', 'ukur'],
    ['mengukur', 'ukur'],
    ['diukur', 'ukur'],
    ['pengaturan', 'atur'],
    ['mengatur', 'atur'],
    ['diatur', 'atur'],
    ['penelitian', 'teliti'],
    ['meneliti', 'teliti'],
    ['pemeriksaan', 'periksa'],
    ['perbaikan', 'baik'],
    ['memperbaiki', 'baik'],
    ['perawatan', 'rawat'],
    ['merawat', 'rawat'],
    ['pencarian', 'cari'],
    ['mencari', 'cari'],
    ['penyajian', 'saji'],
    ['menyajikan', 'saji'],
    ['pengolahan', 'olah'],
    ['mengolah', 'olah'],
    ['pengguna', 'guna'],
    ['penggunaan', 'guna'],
    ['menggunakan', 'guna'],
    ['digunakan', 'guna'],
    ['pembuatan', 'buat'],
    ['membuat', 'buat'],
    ['dibuat', 'buat'],
    ['permainan', 'main'],
    ['bermain', 'main'],
    ['memainkan', 'main'],
    ['peningkatan', 'tingkat'],
    ['meningkatkan', 'tingkat'],
    ['penerapan', 'terap'],
    ['menerapkan', 'terap'],
    ['diterapkan', 'terap'],
    ['pengaruh', 'pengaruh'],
    ['mempengaruhi', 'pengaruh'],
    ['dipengaruhi', 'pengaruh'],
    ['binuang', 'binuang']
  ]);

  // Pemetaan stem rusak ke akar kata bahasa Indonesia yang benar
  const DAMAGED_STEM_FIXES = new Map([
    ['nal', 'kenal'],
    ['engah', 'tengah'],
    ['ilai', 'nilai'],
    ['bas', 'basis'],
    ['asar', 'pasar'],
    ['eta', 'peta'],
    ['gera', 'gerak'],
    ['rusa', 'rusak'],
    ['pupu', 'pupuk'],
    ['iram', 'siram']
  ]);

  // Tambahan leksikon kata dasar Indonesia untuk mendukung deteksi bahasa & validasi akar kata
  const EXTRA_ID_ROOTS = new Set([
    'kenal', 'tengah', 'nilai', 'basis', 'pasar', 'peta', 'gerak', 'rusak', 'pupuk', 'siram',
    'terampil', 'daya', 'bina', 'kendali', 'kelola', 'kembang', 'ajar', 'didik', 'program',
    'rancang', 'kejuruan', 'perangkat', 'hasil', 'butuh', 'mampu', 'layak', 'valid', 'praktis',
    'efektif', 'mudah', 'tarik', 'baca', 'paham', 'uji', 'ukur', 'atur', 'teliti', 'periksa',
    'baik', 'rawat', 'cari', 'saji', 'olah', 'guna', 'buat', 'main', 'tingkat', 'terap',
    'pengaruh', 'jaringan', 'komputer', 'smk', 'tkj', 'media', 'edukasi', 'interaktif',
    'multimedia', 'metode', 'model', 'data', 'informasi', 'sistem', 'sekolah', 'siswa',
    'guru', 'materi', 'modul', 'evaluasi', 'analisis', 'studi', 'tugas', 'praktik', 'belajar'
  ]);

  // true bila kata ada di kamus kata dasar Sastrawi atau kamus suplemen ATLAS
  const isIndonesianRoot = (w) => {
    if (!w) return false;
    return EXTRA_ID_ROOTS.has(w) || stemmer.find(w);
  };

  // Celah SastrawiJs: awalan peng-/meng-/peny-/meny-/pem-/mem-/pen-/men- + kata dasar berawalan k/s/p/t
  const NASAL = [
    ['peng', 'k'], ['meng', 'k'],
    ['peny', 's'], ['meny', 's'],
    ['pem', 'p'],  ['mem', 'p'],
    ['pen', 't'],  ['men', 't']
  ];

  function recoverNasalPrefix(word) {
    for (const [prefix, restored] of NASAL) {
      if (!word.startsWith(prefix)) continue;
      const candidate = stemmer.stem(restored + word.slice(prefix.length));
      if (isIndonesianRoot(candidate)) return candidate;
    }
    return null;
  }

  function stemIndonesianWord(w) {
    if (!w) return '';
    let r = cache.get(w);
    if (r !== undefined) return r;

    // 1. Cek kamus override langsung
    if (EXACT_ROOT_OVERRIDES.has(w)) {
      r = EXACT_ROOT_OVERRIDES.get(w);
      cache.set(w, r);
      return r;
    }

    // 2. Jika sudah kata dasar, langsung kembalikan
    if (isIndonesianRoot(w)) {
      cache.set(w, w);
      return w;
    }

    // 3. Jalankan SastrawiJs
    r = stemmer.stem(w);

    // 4. Koreksi celah nasal bila hasil bukan kata dasar
    if (USE_NASAL_FIX && !isIndonesianRoot(r)) {
      const recovered = recoverNasalPrefix(w);
      if (recovered) r = recovered;
    }

    // 5. Perbaiki bila menghasilkan stem rusak yang diketahui
    if (DAMAGED_STEM_FIXES.has(r)) {
      r = DAMAGED_STEM_FIXES.get(r);
    }

    cache.set(w, r);
    return r;
  }

  ATLAS.nlp.stemIndonesianWord = stemIndonesianWord;
  ATLAS.nlp.isIndonesianRoot = isIndonesianRoot;
  ATLAS.nlp.ID_ROOT_OVERRIDES = EXACT_ROOT_OVERRIDES;
  ATLAS.nlp.DAMAGED_STEM_FIXES = DAMAGED_STEM_FIXES;
})();
