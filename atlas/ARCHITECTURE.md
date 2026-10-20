# Arsitektur Kode ATLAS (v3.8)

Aplikasi pencarian informasi berbasis **Vector Space Model (VSM)**, pembobotan **TF-IDF**, dan **Cosine Similarity**. Berjalan penuh di sisi klien (browser) tanpa bundler rumit: berkas JavaScript biasa dimuat secara berurutan oleh `index.html` dan saling terhubung lewat namespace global `window.ATLAS`. Berkas `.js` dibungkus IIFE; berkas komponen `.jsx` dikompilasi oleh Babel standalone di browser, juga dibungkus IIFE.

---

## Struktur Direktori
```
atlas/
   index.html                  Kerangka aplikasi, pemuatan CDN (React, Tailwind, Babel, Animate.css, KaTeX) & urutan skrip
   buka-atlas.bat              Peluncur sekali klik Windows (menyalakan server & membuka browser otomatis)
   package.json                Konfigurasi npm (skrip start, serve, test, vendor)
   LOGS.md                     Catatan rilis historis & hasil verifikasi fitur
   ARCHITECTURE.md             Dokumentasi arsitektur, alur data, dan modul NLP
   assets/
      css/theme.css            Token Butter & Forest, CSS flowchart pipeline, token legend, formula visual, modal confirm, status bar
      brand/                   Aset identitas visual (logo mark, horizontal, vertikal, app-icon, favicon, brand board)
   dataset/                    CSV praktikum tugas akhir (1.000 dokumen)
   samples/                    Contoh dataset CSV alternatif
   scripts/
      serve.js                 Server lokal statis Node.js standar (zero-dependency, bebas cache, auto open browser)
      vendor-sastrawijs.js     Skrip penyalin pustaka sastrawijs UMD dari node_modules
   tests/
      engine.test.js           Pengujian otomatis VSM Engine, indexing, dan akurasi kueri (Node.js)
   src/
      namespace.js             Deklarasi namespace global: window.ATLAS = { config, data, nlp, engine, utils, components }
      config/
         tailwind.config.js   Konfigurasi token warna Butter & Forest, tipografi Plus Jakarta Sans, dan styling Tailwind
      nlp/                     Modul pra-proses teks & NLP
         normalize.js          Case folding, pembersihan karakter, penanganan kata majemuk (e-learning, wi-fi, dll.)
         stopwords-id.js       Kamus stopword Bahasa Indonesia (320+ kata; standar Tala + istilah ilmiah)
         stopwords-en.js       Kamus stopword Bahasa Inggris (300+ kata; kata fungsi umum + publikasi)
         vendor/               Pustaka sastrawijs.umd.js + lisensi
         stemmer-id.js         Adapter SastrawiJs + koreksi awalan nasal + kamus kata rusak (ID_ROOT_OVERRIDES & DAMAGED_STEM_FIXES)
         kstem/                Port Apache Lucene KStem (Krovetz) untuk Bahasa Inggris
            kstem-lists.js     Pengecualian, conflation list, nama diri, negara
            kstem-data.js      Leksikon 27.495 kata bahasa Inggris
            kstem.js           Implementasi algoritma KStemmer
         stemmer-en.js         Adapter KStem + kamus penyesuaian istilah teknologi/TI (EN_ROOT_OVERRIDES)
         language.js           Deteksi bahasa dokumen/kueri (ID, EN) menggunakan leksikon dan stopword
         pipeline.js           Pipeline pra-proses: normalisasi > tokenisasi > stopword bilingual > stemming bilingual
      engine/
         vsm-engine.js         VSMEngine: inverted index, TF-IDF logaritmik, Cosine Similarity, kontribusi per-term
      utils/
         csv.js                Parser CSV robust (RFC 4180), auto-mapping header multibahasa, konversi baris ke dokumen
         storage.js            Persistensi IndexedDB (saveDataset, loadDataset, clearDataset)
      components/              Komponen UI React
         Icon.jsx              Komponen SVG icon inline (search, upload, database, cpu, refresh-cw, trash-2, alert-triangle, dll.)
         Logo.jsx              Komponen logo brand ATLAS SVG
         CopyButton.jsx        Tombol salin ke papan klip dengan umpan balik visual
         SearchTab.jsx         Tab utama: hero pencarian, kueri dinamis, kartu dataset kosong, filter, hasil
         Modals.jsx            Modal impor CSV, detail dokumen, Mathematical Breakdown (KaTeX), ConfirmDeleteModal
         PreprocessingInspector.jsx  Alur teks interaktif (InteractivePipelineFlow), tooltip akademik terukur, trace legend
         CorpusExplorer.jsx    Tab eksplorasi koleksi dokumen yang terindeks
         AlgorithmExplanation.jsx   Tab edukasi matematika VSM dengan visual KaTeX formula (Eq. 1-5)
      App.jsx                  Orkestrator state global, routing tab, status bar kompak, modal konfirmasi hapus dataset
      main.jsx                 Titik masuk React: merender AtlasApp ke DOM (#root)
README.md                      Dokumentasi proyek, panduan instalasi, panduan penggunaan
```

---

## Lapisan & Hubungan Antarmodul
```
[config / assets]
       |
       v
    [nlp] -----------> [engine (vsm-engine)] <--- [utils/csv]
       |                        ^                      ^
       |                        |                      |
       +------------------------+----------------------+
                                |
                          [App.jsx]
                         ^    ^    ^
        +----------------+    |    +----------------+
        v                     v                     v
[SearchTab.jsx]         [Modals.jsx]        [CorpusExplorer.jsx]
```
- Modul `nlp` dan `engine` murni tanpa ketergantungan DOM/React — dapat diuji otomatis tanpa browser.
- State global diatur di `App.jsx`: status indeks, persistensi IndexedDB, status pencarian, peringatan dataset kosong.

---

## Alur Data Lengkap (Data Lifecycle)

### 1. Impor & Indeksasi Dataset
```
Berkas CSV -> parseCSVText (Pemisah , atau ;) -> autoMapHeaders (Deteksi kolom)
     |
     v
rowsToDocs (Pembersihan URL & normalisasi kategori) -> applyDocs
     |
     +-> storage.saveDataset (Disimpan ke IndexedDB browser)
     |
     +-> VSMEngine.buildIndex(docs):
          a. Deteksi bahasa dokumen (detectLanguage)
          b. Pra-proses: normalizeText -> split tokens -> filter stopwords ID & EN
          c. Bilingual stemming: SastrawiJs + koreksi kata rusak / KStem + leksikon TI
          d. TF(t,d) = f(t,d) / |d|
          e. IDF(t) = ln((N+1)/(DF+1)) + 1
          f. Inverted Index, Vektor Bobot W(d), Normalisasi Euclidean ||d||
```

### 2. Penghapusan Dataset (Clear Dataset)
```
Tombol "Hapus" di Status Bar -> ConfirmDeleteModal (Tema Butter & Forest)
     |
     +- [Batal / Esc / Klik Luar] -> Tutup modal, dataset tetap utuh
     |
     +- [Konfirmasi / Enter] ->
          +-> storage.clearDataset() (Hapus store IndexedDB)
          +-> Reset state: documents=[], datasetName='', searchResults=null, vsmEngine.buildIndex([])
          +-> SearchTab menampilkan kartu panduan Butter & Forest (empty-dataset-card)
          +-> Contoh kueri otomatis kosong (sampleQueries = [])
```

### 3. Kueri & Perangkingan Cosine Similarity
```
Input Pengguna:
     |
     +- [Jika documents = 0] -> Tampilkan noDatasetWarning Banner (headShake animation)
     |
     +- [Jika documents > 0] -> VSMEngine.search(query):
          a. Pra-proses kueri q (normalisasi, stopword, stemming bilingual)
          b. Vektor kueri W(q,t) = TF(q,t) * IDF(t)
          c. Cos(q,d) = (W(q) . W(d)) / (||q|| * ||d||)
          d. Urutkan descending
          e. Hitung kontribusi per-term untuk "Why this result?"
```

### 4. Ekstraksi Contoh Kueri Dinamis
```
[documents prop berubah] -> useMemo (SearchTab.jsx):
     |
     +-> Sumber 1 — Kategori dokumen:
     |     Ambil kategori unik -> bersihkan awalan angka/huruf
     |     -> pecah sub-frasa (/ & , | for in using di) -> simpan frasa 2-4 kata
     |
     +-> Sumber 2 — Bigram/Trigram judul:
     |     Normalisasi judul -> tokenisasi
     |     -> hitung frekuensi bigram & trigram (skip stopwords ID & EN)
     |     -> ambil 30 teratas (frekuensi >= 2) -> format Title Case
     |
     +-> Deduplication: buang frasa yang saling mengandung
     |
     +-> Pool allDynamicQueries (n frasa unik)
          |
          +-> sampleQueries = slice(offset, offset+5) [wrap-around]
          +-> Tombol shuffle: offset += 3 (tampil jika pool > 5)
```

---

## Fitur & Penyempurnaan Khusus

### 1. Contoh Kueri Dinamis (v3.7)
Chip contoh kueri di bawah bilah pencarian diekstrak secara otomatis dari dataset aktif:
- Reaktif: `useMemo([documents])` — selalu sinkron saat impor baru atau setelah hapus.
- Dua sumber: kategori dokumen (topik utama) + bigram/trigram judul berfrekuensi tinggi.
- Deduplication berbasis substring inclusion untuk keragaman kueri.
- Tombol `refresh-cw` untuk rotasi ke 5 kueri berikutnya dari pool.

### 2. Kartu Panduan Dataset Kosong — Butter & Forest (v3.7)
Token CSS baru di `assets/css/theme.css`:
- `.empty-dataset-card` — kartu surface #FFFDF6, strip gradien forest->butter->terracotta.
- `.empty-state-badge` — pill terrakota untuk label status koleksi.
- `.empty-state-icon-pulse` — lingkaran butter bergaris-putus, ikon forest, scale hover.
- `.empty-guide-step` — kartu langkah panduan 3-item hoverable.
- `.btn-forest-primary` — tombol CTA hijau Forest dengan shadow dan lift hover.
- `.btn-butter-secondary` — tombol sekunder kuning Butter dengan border halus.

### 3. Penanganan Judul Campur Indonesia-Inggris (Bilingual NLP)
- Bilingual Stopwords Removal: menyaring token terhadap INDONESIAN_STOPWORDS dan ENGLISH_STOPWORDS sekaligus.
- Bilingual Stemming: token teridentifikasi sebagai Inggris (KStem) atau Indonesia (SastrawiJs + kamus pemulihan).
- Deteksi Bahasa Mutakhir: leksikon 27.495 kata KStem untuk mengenali kueri teknis ringkas.

### 4. Kamus Pemulihan Kata Rusak (Root Overrides)
- ID_ROOT_OVERRIDES & DAMAGED_STEM_FIXES: memulihkan pengenalan->kenal, menengah->tengah, penilaian->nilai, berbasis->basis, pemasaran->pasar, pemetaan->peta, pergerakan->gerak, kerusakan->rusak, pemupukan->pupuk, penyiraman->siram, keterampilan->terampil, pemberdayaan->daya, dll.
- EN_ROOT_OVERRIDES: memperbaiki troubleshooting->troubleshoot, learning->learn, router->router, modelling->model, gamification->gamifikasi, dll.

### 5. Peringatan Pencarian Tanpa Dataset
Jika documents = 0 saat cari, sistem menampilkan banner noDatasetWarning bergaris terrakota dengan animasi Animate.css headShake dan tombol pintasan impor CSV.

### 6. Animasi CTA Interaktif
Tombol Cari, Import CSV, Konfirmasi, Load More diintegrasikan Animate.css (animate__pulse, animate__rubberBand, animate__headShake).

### 7. Visual Formula KaTeX & Mathematical Breakdown (v3.8)
Rumus-rumus matematika di seluruh aplikasi dirender secara visual menggunakan KaTeX (v0.16.8):
- Komponen `KatexFormula` (`src/components/Modals.jsx` dan `AlgorithmExplanation.jsx`): mendukung render LaTeX inline maupun display block dengan mekanisme retry jika berkas CDN dimuat secara deferred.
- Tab **Algorithm**:
  * Eq. 1 (Term Frequency): $\text{TF}(t, d) = \frac{f_{t,d}}{|d|}$
  * Eq. 2 (Smoothed IDF): $\text{IDF}(t) = \ln\left(\frac{N + 1}{\text{DF}(t) + 1}\right) + 1$
  * Eq. 3 (TF-IDF Weight): $W(t, d) = \text{TF}(t, d) \times \text{IDF}(t)$
  * Eq. 4 (Cosine Similarity): $\text{Cos}(q, d) = \frac{\sum_{t \in q \cap d} W(t, q) \cdot W(t, d)}{\|q\| \cdot \|d\|}$
  * Eq. 5 (Euclidean Norm): $\|d\| = \sqrt{\sum_{t \in d} W(t, d)^2}$
- Modal **Mathematical Breakdown ("Why this result?")**:
  * Grid normalisasi dokumen disusun rapi menggunakan CSS grid 7 kolom (`.norm-grid-card`) bergaris pemisah (`.norm-grid-divider`) dengan lambang norma KaTeX ($\|q\|$, $\|d\|$, $\|q\| \cdot \|d\|$).
  * Strip rumus kontribusi term $c_t = \frac{W_{q,t} \cdot W_{d,t}}{\|q\| \cdot \|d\|}$ dihias dengan latar forest lembut dan border rounded (`.math-breakdown-formula-strip`).

### 8. Alur Teks Preprocessing Interaktif dengan Ikon SVG Bertema (v3.8.2)
Alur kalimat teks `Teks Asli → Case Folding → Tokenisasi → Stopword Removal → Stemming` di header Preprocessing (`App.jsx`) ditransformasikan menjadi komponen interaktif:
- Menggunakan ikon SVG bertema (`file-text`, `type`, `scissors`, `filter`, `sprout`) dari `src/components/Icon.jsx` menggantikan emoji standar sistem.
- **Bebas Native Tooltip Browser**: Menghilangkan atribut `title` bawaan HTML pada tombol alur sehingga kotak kuning/hitam OS tidak lagi muncul menutupi antarmuka.
- **Rasio Terukur & Proteksi Anti-Offside**:
  * Lebar terstandar 295px (`.pipeline-tooltip`) dengan margin internal seimbang.
  * Clamping `requestAnimationFrame` memastikan posisi `left` dan `top` tidak pernah melintasi batas viewport layar (anti-offside di resolusi apa pun).
  * Panah segitiga adaptif: mengarah ke atas (`.pipeline-tooltip-arrow-top`) saat tooltip di bawah tombol, atau mengarah ke bawah (`.pipeline-tooltip-arrow-bottom`) saat di atas tombol.
  * Memuat deskripsi esensi, transformasi data, dan rujukan literatur ilmiah primer:
    - Case Folding: Manning, Raghavan, & Schütze (2008), *Introduction to Information Retrieval*.
    - Tokenisasi: Webster & Kit (1992); Salton & McGill (1983), *Introduction to Modern Information Retrieval*.
    - Stopword Removal: Luhn (1958), *The Automatic Creation of Literature Abstracts*; Tala (2003).
    - Stemming: Krovetz (1993) [KStem]; Asian, Williams, & Tahaghoghi (2007) / Adriani et al. (2007) [Sastrawi].

### 9. Tooltip Cerdas Trace Filtering & Stemming (v3.8.2)
- Bar keterangan legenda statis (`TokenLegendBar`) telah dihapus agar area peninjauan token trace lebih luas dan bersih.
- Fungsi hover pada komponen `TokenBadge` diperbaiki secara menyeluruh:
  * Dilengkapi `pointer-events: none` sehingga pergerakan kursor di atas token mengalir mulus tanpa flicker/jitter.
  * Menghapus atribut `title` native agar tidak memunculkan tooltip OS.
  * Kalkulasi posisi seketika dengan penempatan adaptif di atas/bawah badge dan panah segitiga terarah.
  * Menampilkan visualisasi perubahan kata (`kata asli → kata dasar` atau penanda stopword tereliminasi), indikator warna status (*Hijau / Kuning / Merah*), tahapan pipeline, serta alasan linguistik spesifik.

### 10. Dialog Konfirmasi Hapus Dataset Bertema Butter & Forest (v3.8)
- Menggantikan `window.confirm()` dengan komponen modal kustom `ConfirmDeleteModal` (`src/components/Modals.jsx`).
- Desain konsisten dengan tema: header gradien Forest (#37664B), ikon trash emas Butter (#EBD58A), strip peringatan terrakota (#C45D3E), tombol aksi tegas.
- Mendukung keyboard: tombol `Escape` untuk batal, tombol `Enter` untuk konfirmasi, dan klik backdrop luar untuk menutup.

### 11. Status Bar Kompak (v3.8)
- Dirampingkan menjadi satu baris horizontal fleksibel hemat ruang dengan font `text-[10px]` dan pemisah titik/garis (`│`, `·`).
- Nama dataset dipotong elipsis jika panjang (`max-w-[200px] truncate`), dan tombol hapus dibuat proporsional tanpa memakan tinggi layar.

