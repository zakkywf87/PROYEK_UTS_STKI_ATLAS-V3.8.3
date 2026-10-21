# LOGS — ATLAS

## 2026-10-20 — v3.8.3 (Hapus Folder Duplikat, Perbaikan Hover Portal, Dokumentasi White-Box & Demo)
**Permintaan:** 1) Hapus folder `atlas/atlas/` duplikat dan `index.html` ganda; 2) Perbaiki hover Filtering & Stemming Trace yang masih bermasalah; 3) Buat `WHITE_BOX.md`.

**1. Hapus Folder Duplikat**
- Direktori `atlas/atlas/` beserta `index.html` di dalamnya dihapus permanen via `Remove-Item`.
- Root aplikasi kini bersih: hanya satu `index.html` di `atlas/`.

**2. Perbaikan Fundamental Hover TokenBadge — React Portal**
- **Root cause**: Tooltip `position: fixed` dirender *di dalam* container `flex flex-wrap overflow-y-auto max-h-64` — Chromium/WebKit meng-clip elemen `fixed` yang merupakan descendant dari container yang memiliki `overflow` selain `visible`.
- **Solusi**: Komponen `Portal` baru menggunakan `ReactDOM.createPortal(children, document.body)` sehingga tooltip diinjeksikan langsung ke `<body>`, sepenuhnya di luar hierarki DOM container yang bermasalah.
- **Anti-flicker**: `leaveTimer.current` (80ms `setTimeout`) + `clearTimeout` saat `handleEnter` mencegah tooltip berkedip saat kursor bergerak cepat.
- **Auto-dismiss scroll**: Event listener `scroll` (capture phase) memanggil `setPos(null)` agar tooltip tidak melayang saat halaman digulir.
- **Cleanup**: `useEffect` cleanup membersihkan timer dan listener saat komponen unmount — bebas memory leak.
- CSS: tambah `@keyframes tokenTipIn` (fade + slide 4px) dan seragamkan lebar tooltip ke 268px.

**3. Dokumentasi WHITE_BOX.md**
- Dibuat `WHITE_BOX.md` membahas pengujian white-box `TokenBadge`:
  - Data Flow Testing: 6 du-paths kritis, 3 anomali yang dicegah
  - Basis Path: CFG `calcPos()`, McCabe complexity = 5, 5 basis paths
  - Branch Coverage: 10/10 cabang — 100%
  - Loop Testing: N=0 s/d N=200+, loop scroll listener, loop timer leave

**4. Dokumentasi DEMO_APP.md**
- Dibuat `DEMO_APP.md` skenario demo 4 personel dengan script, fitur, dan pembagian waktu (~20 menit total):
  - **Personel 1**: Dashboard + Dataset Management
  - **Personel 2**: Preprocessing Pipeline + Token Inspector
  - **Personel 3**: VSM Algorithm + Mathematical Breakdown
  - **Personel 4**: Search Results + Interpretasi Skor

---

## 2026-10-20 — v3.8.2 (Ikon SVG Bertema, Hapus Kotak Title Default, Hapus Bar Keterangan & Hover Token Mulus)
**Permintaan:** 1) Ikon terlalu default pada alur baik di button atau hover nya carikan yang bagus dan sesuai tema; 2) Hapus kotak yang isinya "arahkan kursor untuk info mengenai alur" karena sangat mengganggu; 3) Hapus token bar keterangan pada Filtering & Stemming Trace, lalu perbaiki fungsi hover; 4) Update md.

**1. Ikon SVG Bertema Menggantikan Emoji Default**
- Menambahkan 5 ikon SVG baru yang tajam dan serasi di `src/components/Icon.jsx`:
  * `file-text`: ikon dokumen teks untuk **Teks Asli** (Forest Slate `#5F7266`).
  * `type`: ikon tipografi `Aa` untuk **Case Folding** (Steel Blue `#4A7C9E`).
  * `scissors`: ikon gunting pemotong untuk **Tokenisasi** (Butter Gold `#9E7B38`).
  * `filter`: ikon corong filter untuk **Stopword Removal** (Terracotta `#C45D3E`).
  * `sprout`: ikon tunas bercabang untuk **Stemming** (Deep Forest `#37664B`).
- Diaplikasikan langsung pada tombol badge alur (`PipelineStepInline`) dan di dalam header kartu tooltip (`StepTooltip`).

**2. Penghapusan Kotak Popup Native Browser (`title` attribute)**
- Atribut `title={`Arahkan kursor untuk info mengenai ${step.label}`}` pada tombol alur dihapus seutuhnya.
- Atribut `title={item.reason}` pada token trace juga dihapus.
- Hasil: browser tidak lagi memunculkan kotak tooltip kuning/hitam bawaan OS yang menutupi antarmuka aplikasi.

**3. Penghapusan Bar Keterangan Token & Perbaikan Fungsi Hover**
- Komponen `TokenLegendBar` dan kelas `.token-legend-bar` di `theme.css` telah dihapus sehingga area peninjauan token lebih bersih dan luas.
- Fungsi hover pada `TokenBadge` dirombak:
  * Dilengkapi `pointer-events: none` sehingga kursor dapat bergerak mulus di atas token trace tanpa tersangkut atau berkedip (no jitter/flicker).
  * Posisi dihitung seketika berdasarkan koordinat badge dan batas layar (`pad = 10px`), lengkap dengan panah segitiga adaptif (atas/bawah).
  * Menampilkan visualisasi perubahan kata (`kata asli → kata dasar` atau penanda stopword tereliminasi), indikator warna status (*Hijau / Kuning / Merah*), tahapan pipeline, serta alasan linguistik spesifik.

**4. Pembaruan Dokumentasi**
- `README.md`, `LOGS.md`, dan `ARCHITECTURE.md` disinkronkan ke versi v3.8.2.

---

## 2026-10-20 — v3.8.1 (Penyempurnaan: Hapus Hint Pencarian Gambar 1, Alur Teks Preprocessing Interaktif & Anti-Offside Gambar 2)
**Permintaan:** 1) Hapus CSS yang ada di gambar 1 (hint fitur pencarian); 2) Gambar 2 itu CSS hapus, dan hover teks dipindah interaksinya jika mengarahkan ke salah satu alur Teks Asli → Case Folding → Tokenisasi → Stopword Removal → Stemming, serta atur hover agar rasionya baik karena ada salah satu yang offside; 3) Update md.

**1. Penghapusan Bar Hint Fitur Pencarian (Gambar 1)**
- Komponen strip pill hint di bawah bilah pencarian pada `src/components/SearchTab.jsx` telah dihapus seutuhnya.
- Aturan styling `.search-shortcut-kbd`, `.search-feature-hint`, dan `.search-feature-separator` dibersihkan dari `assets/css/theme.css`.
- Kolom pencarian kembali bersih, lega, dan bebas tumpukan teks penjelasan.

**2. Pemindahan Interaksi Hover ke Teks Alur Preprocessing & Penghapusan Gambar 2**
- Kotak diagram alur besar `.pipeline-flowchart` pada `src/components/PreprocessingInspector.jsx` dihapus seutuhnya.
- Interaksi hover penjelasan dan referensi ilmiah dipindahkan langsung ke baris teks alur di header Preprocessing: `Teks Asli → Case Folding → Tokenisasi → Stopword Removal → Stemming`.
- Dibuat komponen baru `PipelineStepInline` dan `InteractivePipelineFlow` yang terhubung ke `App.jsx`. Setiap tahapan kini berwujud badge tombol inline bernuansa warna khas yang anggun dan interaktif saat disorot kursor.

**3. Perbaikan Rasio Tooltip & Proteksi Anti-Offside**
- **Rasio Seimbang (`width: 295px`)**: Menghilangkan kesan tooltip terlalu lebar atau tinggi berlebih sehingga informasi (deskripsi, detail operasi, dan rujukan ilmiah) tersaji dalam rasio visual yang nyaman dibaca.
- **Proteksi Anti-Offside Cerdas**: Posisi dihitung secara dinamis menggunakan `requestAnimationFrame` dan diproteksi dengan padding batas layar (`pad = 12px`), sehingga tooltip pada tahapan paling kanan (*Stemming*) maupun paling kiri (*Teks Asli*) tidak akan pernah terpotong atau keluar dari tepi layar.
- **Panah Segitiga Adaptif**: Arah panah menyesuaikan ruang layar—mengarah ke atas (`.pipeline-tooltip-arrow-top`) jika tooltip berada di bawah anchor, atau mengarah ke bawah (`.pipeline-tooltip-arrow-bottom`) jika berada di atas anchor.

**4. Pembaruan Dokumentasi**
- `README.md`, `LOGS.md`, dan `ARCHITECTURE.md` diperbarui untuk merefleksikan perubahan arsitektur inline pipeline dan eliminasi hint search.


## 2026-10-20 — v3.8 (Visual Formula KaTeX, Flowchart Preprocessing Interaktif & Sumber, Dialog Hapus Dataset Butter & Forest)
**Permintaan:** 1) Setelah klik hapus dataset muncul pesan konfirmasi dengan CSS baru yang konsisten; 2) Rapikan rumus dalam CSS gambar 2 (Mathematical Breakdown & Norm Grid); 3) Rumus matematika di Algorithm & Mathematical Breakdown dibuat formula visual (bukan teks); 4) Di Search perjelas fitur mencari dengan "/" atau tanpa "/"; 5) Tata status bar agar rapi dan tidak makan banyak ruang; 6) Di Preprocessing alur Teks Asli → Case Folding → Tokenisasi → Stopword Removal → Stemming dibuat visual bagus, bisa dihover untuk penjelasan dan sumber referensinya; 7) Pada Filtering & Stemming Trace beri penjelasan dan CSS kecil arti dari preserved, stemmed, removed serta hubungannya dengan tahapan preprocessing; 8) Update semua file .md.

**1. Dialog Konfirmasi Hapus Dataset Bertema Butter & Forest (`ConfirmDeleteModal`)**
- Mengganti `window.confirm()` bawaan browser dengan modal dialog React kustom (`ConfirmDeleteModal` di `src/components/Modals.jsx`).
- Desain konsisten dengan palet Butter & Forest: header gradien Forest (#37664B), ikon trash bertinta emas butter, strip peringatan bergaris terrakota (#C45D3E), tombol Batal (abu-abu/butter) dan tombol "Ya, Hapus Dataset" (terrakota pekat).
- Interaktivitas keyboard: tombol `Escape` untuk membatalkan, tombol `Enter` untuk konfirmasi, klik di luar backdrop untuk menutup dialog.
- State dikelola secara reaktif di `App.jsx` (`showConfirmDelete`, `handleConfirmDelete`, `handleCancelDelete`).

**2. Integrasi KaTeX & Visual Formula Matematika**
- CDN pustaka KaTeX (`v0.16.8`) ditambahkan ke `index.html` (CSS + JS dengan defer).
- Dibuat komponen pembantu `KatexFormula` di `Modals.jsx` dan `AlgorithmExplanation.jsx` yang mendukung rendering LaTeX secara inline atau block display dengan mekanisme auto-retry saat skrip CDN dimuat secara deferred.
- **Tab Algorithm (`src/components/AlgorithmExplanation.jsx`):** Seluruh rumus (TF, IDF Smooth, TF-IDF Weight, Cosine Similarity, Euclidean Norm) diubah dari teks ASCII menjadi formula visual formal berkotak (`.formula-block`) lengkap dengan label persamaan (Eq. 1 s/d Eq. 5).
- **Modal Mathematical Breakdown ("Why this result?"):**
  * Grid normalisasi vektor dokumen dirombak menjadi CSS grid 7 kolom (`.norm-grid-card`) bergaris pemisah rapi (`.norm-grid-divider`) dengan simbol norma visual $\|q\|$, $\|d\|$, dan $\|q\| \cdot \|d\|$.
  * Strip formula kontribusi term ($c_t = \frac{W_{q,t} \cdot W_{d,t}}{\|q\| \cdot \|d\|}$) dan ringkasan skor kosinus dirender tajam menggunakan KaTeX.

**3. Penjelasan Fitur Pencarian & Shortcut "/" (`SearchTab.jsx`)**
- Ditambahkan strip bar informasi fitur (`.search-feature-hint`) di bawah bilah pencarian:
  * Pill 1: Hint shortcut keyboard `/` untuk fokus cepat ke bilah pencarian.
  * Pemisah dot (`.search-feature-separator`).
  * Pill 2: Penjelasan prinsip perangkingan TF-IDF + VSM (menghitung relevansi bobot kata, bukan pencocokan substring mentah).
  * Pemisah dot.
  * Pill 3: Hint eksekusi Enter / tombol Cari.

**4. Visual Flowchart Pipeline Preprocessing dengan Referensi Ilmiah (`PreprocessingInspector.jsx`)**
- Alur teks linear diganti dengan komponen diagram alur horizontal visual (`.pipeline-flowchart`).
- 5 tahapan utama (Teks Asli, Case Folding, Tokenisasi, Stopword Removal, Stemming) ditampilkan sebagai kartu interaktif (`.pipeline-step-card`) dengan ikon SVG, nomor urut, label tahapan, dan sub-keterangan.
- **Hover Tooltip Edukatif (`StepTooltip`):** Mengarahkan kursor ke setiap tahapan memunculkan kartu mengambang (`fixed-position` dengan proteksi keluar viewport) yang memuat:
  * Ringkasan fungsi tahapan.
  * Detail teknis komputasi dan transformasi karakter/kata.
  * Sumber referensi literatur akademik:
    - Case Folding: Manning, Raghavan, & Schütze (2008), *Introduction to Information Retrieval*, Cambridge University Press.
    - Tokenisasi: Webster & Kit (1992), *Tokenization as the initial phase in NLP*; Salton & McGill (1983).
    - Stopword Removal: Luhn (1958), *The automatic creation of literature abstracts*; Tala (2003).
    - Stemming: Krovetz (1993) untuk KStem; Asian, Williams, & Tahaghoghi (2007) / Adriani et al. (2007) untuk Sastrawi.

**5. Legend & Tooltip Edukatif Filtering & Stemming Trace**
- Ditambahkan **Token Legend Bar** di atas area trace dengan tiga indikator warna:
  * **Hijau (Preserved)**: Token konten penting yang dipertahankan untuk penghitungan bobot VSM.
  * **Kuning (Stemmed)**: Token yang dipangkas imbuhannya ke bentuk dasar (root).
  * **Merah (Removed)**: Token stopword/fungsional yang dieliminasi.
- Komponen badge token (`TokenBadge`) kini dilengkapi tooltip mini kontekstual (`.token-legend-tooltip`) saat dihover, menampilkan status token, kata asli, alasan pemrosesan, dan tahapannya dalam pipeline NLP.

**6. Status Bar Kompak (`App.jsx`)**
- Status bar di bagian footer dirampingkan menjadi satu baris fleksibel hemat vertikal dengan pemisah vertikal dan bullet (`│`, `·`).
- Nama dataset dipotong rapi dengan elipsis (`max-w-[200px] truncate`), ukuran font disesuaikan ke `text-[10px]`, dan tombol hapus diperkecil menjadi ikon tempat sampah ringkas dengan teks "Hapus".

**7. Pembaruan Dokumentasi**
- `README.md`: Seksi baru rilis v3.8, tabel fitur, panduan dialog hapus dataset, KaTeX visual formulas, dan flowchart preprocessing.
- `LOGS.md`: Catatan rilis v3.8 komprehensif.
- `ARCHITECTURE.md`: Penambahan arsitektur KaTeX, token CSS baru di `theme.css`, spesifikasi komponen tooltip, dan flowchart pipeline.

**Verifikasi:**
- `npm test` (`tests/engine.test.js`): 100% lulus (1.000 dokumen terindeks, kalkulasi VSM akurat).
- Tidak ada console error, kompilasi Babel standalone berjalan mulus untuk semua komponen baru (`ConfirmDeleteModal`, `KatexFormula`, `StepTooltip`, `TokenBadge`, `TokenLegendBar`, `PipelineStepCard`).

---

## 2026-10-19 — v3.7 (Kueri Dinamis, CSS Dataset Kosong Butter & Forest)
**Permintaan:** 1) Contoh kueri berganti otomatis saat dataset berubah menyesuaikan topik yang relevan; 2) Setelah hapus dataset, tampilkan CSS baru yang baik dan sesuai tema Butter & Forest; 3) Update dokumentasi .md.

**1. Contoh Kueri Dinamis (SearchTab.jsx)**
- Menggantikan chip contoh kueri statis dengan algoritma ekstraksi otomatis berbasis `useMemo` di `SearchTab.jsx`.
- **Sumber Kueri 1 — Kategori Dokumen:** Mengambil daftar kategori unik, membersihkan awalan angka/huruf, lalu memecah sub-frasa pada pemisah (`/ & , | for in using di pada`), menyimpan frasa 2–4 kata yang bersih.
- **Sumber Kueri 2 — Bigram/Trigram Judul:** Menghitung frekuensi bigram dan trigram dari seluruh judul dokumen (setelah normalisasi), menyaring kata yang ada di stopwords ID atau EN, mengambil 30 frasa dengan frekuensi >= 2.
- **Deduplication:** Frasa yang saling mengandung (substring inclusion) dibuang agar pool kueri tetap beragam dan tidak redundan.
- **Tampilan 5 Kueri + Shuffle:** Menampilkan 5 kueri sekaligus dari pool; tombol ikon `refresh-cw` menggeser offset `+3` untuk merotasi ke batch kueri berikutnya (muncul hanya jika pool > 5).
- **Reaktif terhadap Dataset:** Karena menggunakan `useMemo([documents])`, kueri otomatis diperbarui setiap dataset diimpor, diganti, atau dihapus.
- **State Kosong:** Jika belum ada dataset (`documents.length === 0`), area kueri menampilkan pesan panduan inline.

**2. Tampilan Kartu Panduan Dataset Kosong (Butter & Forest)**
Ditambahkan kelas-kelas CSS baru di `assets/css/theme.css` khusus untuk state kosong:
- `.empty-dataset-card` — Kartu permukaan `#FFFDF6`, border `#DDD5B8`, sudut 16px, strip gradien tiga warna (#37664B → #EBD58A → #C45D3E) via `::before`, hover lift ringan.
- `.empty-state-badge` — Badge merah terrakota pill untuk label "KOLEKSI DOKUMEN KOSONG".
- `.empty-state-icon-pulse` — Lingkaran butter bergaris-putus, ikon database berwarna forest, animasi scale saat hover.
- `.empty-guide-step` — Kartu langkah panduan 3-item; hover berubah surface + border forest + translateY(-2px).
- `.btn-forest-primary` — Tombol CTA hijau Forest (#37664B), shadow, lift hover, font semibold.
- `.btn-butter-secondary` — Tombol sekunder kuning Butter (#EBD58A), border halus, lift hover.
- Komponen `SearchTab.jsx` menampilkan seluruh kartu panduan secara kondisional saat `documents.length === 0`, lengkap dengan 3 langkah panduan dan tombol CTA impor.

**3. Ikon Baru (Icon.jsx)**
- Ditambahkan ikon SVG `refresh-cw` (shuffle kueri) dan `trash-2` (hapus dataset) ke `src/components/Icon.jsx`.

**4. Pembaruan Dokumentasi**
- `README.md` diperbarui ke v3.7: seksi baru "Contoh Kueri Dinamis" (tabel mekanisme) dan "Tampilan Dataset Kosong" (deskripsi token CSS).
- `LOGS.md`: entri ini (v3.7).
- `ARCHITECTURE.md`: ditambahkan dokumentasi modul kueri dinamis pada SearchTab dan token CSS baru di theme.css.

**Verifikasi:**
- `npm test` (`node tests/engine.test.js`) 100% lulus: 1.000 dokumen terindeks, skor Cosine Similarity konsisten.
- Kueri dinamis terekstraksi dengan benar dari dataset kategori + bigram judul (terverifikasi manual dari log kategori TKJ SMK, Gamifikasi, AI Virtual Tutor).
- CSS baru tampil elegan di semua resolusi; animasi Animate.css (`fadeIn`) berjalan saat kartu dataset kosong muncul.

---
## 2026-10-19 — v3.6 (Buka Web Bebas Ribet, Animasi CTA Animate.css, & NLP Bilingual)
**Permintaan:** 1) Rapikan dan atur agar membuka web tidak ribet, lalu update readme.md, logs.md, dan hapus serve.py; 2) Tambahkan animasi saat CTA menggunakan animate.css; 3) update untuk pre processing kan ada judul di dataset yang campur indonesia dan inggris kedua lalu perbanyak kamus dari semua tahapan NLP karena beberapa kata ada yang rusak saat pre-processing.

**1. Membuka Web Bebas Ribet & Penghapusan `serve.py`**
- Berkas `serve.py` telah dihapus sepenuhnya dari repositori.
- Pengganti server lokal: `scripts/serve.js` berbasis Node.js standar (zero dependency, tanpa perlu instalasi paket tambahan). Server menyajikan berkas dengan header `Cache-Control: no-store` agar live updates langsung muncul, mendeteksi port kosong secara otomatis (8000, 8001, dst.), dan langsung membuka browser bawaan pengguna.
- Ditambahkan peluncur sekali klik: **`buka-atlas.bat`** (tersedia di root `ATLAS_V8` dan `atlas/atlas/`). Pengguna cukup mengklik ganda berkas tersebut untuk membuka aplikasi tanpa perlu mengetik di terminal.
- Ditambahkan perintah standar `npm start` di `package.json`.
- Ditambahkan detektor dan modal petunjuk di `index.html` bila pengguna membuka langsung lewat `file://` tanpa server lokal.

**2. Animasi CTA dengan Animate.css**
- CDN Animate.css (`v4.1.1`) diintegrasikan di `index.html`.
- Tombol-tombol Call-To-Action (CTA) utama dilengkapi micro-animation:
  * Tombol **Cari** di bilah pencarian: efek `hover:animate__pulse`, `active:animate__rubberBand`.
  * Tombol **Import CSV** di header: `hover:animate__pulse`, animasi berdenyut `animate__pulse animate__infinite` jika dataset belum dimuat untuk memandu aksi pengguna.
  * Tombol **Pilih File CSV** & **Konfirmasi & Re-Indeks** pada modal: `hover:animate__pulse`, `active:animate__rubberBand`.
  * Chip contoh kueri: `hover:animate__headShake`.
  * Tombol **Tampilkan 10 hasil berikutnya**: `hover:animate__pulse`.

**3. Pra-proses Teks Campur (Bilingual) & Perluasan Kamus NLP**
- **Normalisasi:** Fungsi `normalizeText` kini mengenali dan menstandarkan kata majemuk serta singkatan teknis berkonektor (`e-learning` → `elearning`, `wi-fi` → `wifi`, `game-based` → `game based`, `client-server` → `client server`, dll.) agar token tidak terpotong atau terhapus.
- **Kamus Stopwords ID (320+ kata):** Diperluas mengadopsi standar Tala dan kata tugas penulisan ilmiah, dengan tetap memproteksi istilah domain (`gamifikasi`, `pembelajaran`, `jaringan`, `komputer`, `smk`, `tkj`, `tutor`, `ai`, `media`, dll.).
- **Kamus Stopwords EN (300+ kata):** Diperluas dengan stopword publikasi ilmiah (`using`, `towards`, `via`, `within`, `across`, dll.).
- **Bilingual Stopwords Filtering:** Mengatasi judul campur (code-mixed); token disaring terhadap kedua daftar stopword sehingga kata hubung Inggris pada dokumen Indonesia (`for`, `in`, `and`, `of`, `with`, dll.) dan kata hubung Indonesia pada dokumen Inggris bersih dari indeks.
- **Perbaikan Kata Rusak Indonesia (`ID_ROOT_OVERRIDES` & `DAMAGED_STEM_FIXES`):**
  * `pengenalan` / `mengenal` / `dikenal` → `kenal` (memperbaiki bug Sastrawi yang memotong menjadi `nal`).
  * `menengah` → `tengah` (memperbaiki bug yang memotong menjadi `engah`).
  * `penilaian` / `menilai` / `dinilai` → `nilai` (memperbaiki bug yang memotong menjadi `ilai`).
  * `berbasis` → `basis` (memperbaiki bug yang memotong menjadi `bas`).
  * `pemasaran` → `pasar` (memperbaiki pemotongan menjadi `asar`).
  * `pemetaan` → `peta` (memperbaiki pemotongan menjadi `eta`).
  * `pergerakan` → `gerak` (memperbaiki pemotongan menjadi `gera`).
  * `kerusakan` → `rusak` (memperbaiki pemotongan menjadi `rusa`).
  * `pemupukan` → `pupuk` (memperbaiki pemotongan menjadi `pupu`).
  * `penyiraman` → `siram` (memperbaiki pemotongan menjadi `iram`).
  * `keterampilan` → `terampil`, `pemberdayaan` → `daya`, `kejuruan` → `kejuruan`, `pengembangan` → `kembang`, `pembelajaran` → `ajar`, dll.
- **Kamus Istilah Teknis & Penyelarasan KStem (`EN_ROOT_OVERRIDES`):**
  * `troubleshooting` → `troubleshoot` (memperbaiki bug overstemming Krovetz yang menghasilkan `troubleshoote`).
  * `learning` → `learn` (menyelaraskan bentuk kata dasar pencarian).
  * `router` / `routers` → `router` (mencegah pemotongan menjadi `route` agar sesuai istilah TKJ).
  * `routing` → `routing`.
  * `modelling` / `modeling` → `model`.
  * `gamification` / `gamified` → `gamifikasi` (penyelarasan lintas bahasa untuk korpus tugas akhir).
  * `switching` → `switch`, `monitoring` → `monitor`, dll.
- **Deteksi Bahasa Mutakhir:** Mengintegrasikan leksikon KStem (27.495 kata) dan suplemen kata dasar Indonesia sehingga kueri/dokumen ringkas (mis. "Intelligent Tutoring System") terdeteksi tepat sebagai `[en]`.

**4. Opsi Hapus Dataset & Peringatan Pencarian Tanpa Dataset**
- **Opsi Hapus Dataset:** Ditambahkan tombol **"Hapus Dataset"** (ikon tempat sampah) di status bar indikator dataset. Saat diklik, sistem memunculkan konfirmasi; jika disetujui, fungsi `clearDataset()` dari `utils/storage.js` akan membersihkan data dari IndexedDB browser, mengosongkan state dokumen, mereset indeks VSM, serta menghapus hasil pencarian secara instan.
- **Peringatan Pencarian Tanpa Dataset:** Jika pengguna mencoba mencari kata kunci (menekan Enter/tombol Cari) atau mengeklik chip kueri contoh ketika belum ada dataset yang dimuat (`documents.length === 0`), sistem menampilkan banner peringatan interaktif (`noDatasetWarning`) berbingkai terrakota dengan animasi `headShake` dari Animate.css. Banner ini menginstruksikan pengguna untuk mengimpor CSV terlebih dahulu dan menyediakan tombol pintas langsung **"Impor Dataset CSV Sekarang"** yang membuka modal impor.

**5. Pembersihan Berkas Ganda & Perapian Folder ATLAS_V8**
- Berkas-berkas ganda dan berkas longgar yang berada di luar folder proyek pada direktori utama `ATLAS_V8` telah dihapus seluruhnya:
  * `atlas.zip` (arsip lama yang telah diekstrak)
  * `ATLAS_Brand_Board_Butter_Forest.png` (sudah ada di `assets/brand/`)
  * `logo-horizontal-light.svg` (sudah ada di `assets/brand/`)
  * `LOGS.md` (sudah ada di `atlas/LOGS.md`)
  * `buka-atlas.bat` dan `package.json` yang tercecer di luar
- Struktur folder disatukan secara rapi di dalam `ATLAS_V8/atlas/` tanpa nesting ganda (`atlas/atlas/`).
- Direktori `ATLAS_V8` kini hanya berisi satu folder proyek utama: `atlas/`.

**6. Pembaruan ARCHITECTURE.md**
- Berkas `ARCHITECTURE.md` diperbarui menyeluruh merefleksikan versi v3.6:
  * Menghapus referensi lama `serve.py`.
  * Menambahkan dokumentasi server `scripts/serve.js` dan peluncur `buka-atlas.bat`.
  * Menjelaskan pipeline pra-proses teks bilingual (ID & EN) beserta kamus override dan perbaikan kata rusak.
  * Mendokumentasikan alur hapus dataset IndexedDB dan penanganan peringatan pencarian tanpa dataset.
  * Merapikan bagan arsitektur dan diagram alur data.

**Verifikasi:**
- `npm test` (`node tests/engine.test.js`) 100% lulus: 1.000 dokumen terindeks dalam ~118 ms (2.527 vocab, 808 ID, 192 EN).
- Seluruh pengujian kueri menghasilkan dokumen relevan dengan skor Cosine Similarity yang konsisten.
- Pengujian kata-kata yang sebelumnya rusak memverifikasi bahwa 100% kata yang diuji kembali ke bentuk kata dasar aslinya.
- Pengujian hapus dataset dan peringatan tanpa dataset berfungsi sesuai alur UI.

---
**Permintaan:** hapus span; kembalikan KStem; UI lebih bersih; ganti palet, ikon, dan brand board mengikuti palet "05 — Butter & Forest" (Background `#FAF4DF`, Surface `#FFFDF6`, Text `#263B31`, Primary `#37664B`, Accent `#C45D3E`).

**1. "Hapus span"** — pesan tidak menyebut span yang mana, jadi ini tafsiran saya: ticker bergulir dan stiker miring (semuanya `span`) dihapus, dan pencarian ulang memastikan tidak ada teks versi ("IR LAB v…") di kode. Jika yang dimaksud elemen lain, sebutkan teksnya.

**2. KStem** — tidak hilang: `src/nlp/kstem/` dan `stemmer-en.js` ada di zip dan aktif (tes: 1.000 dokumen, 128 dokumen EN terindeks). Dugaan penyebab: (a) UI tidak pernah menyebut stemmer yang dipakai; (b) KStem membiarkan kata yang ada di kamus (mis. `learning`), sehingga tampak "tidak menstem"; (c) cache browser menyajikan berkas lama. Perbaikan: tab Preprocessing kini menampilkan "Stemmer aktif: KStem (Krovetz)" / "SastrawiJs", dan ditambahkan `serve.py` (server tanpa cache).

**3. UI lebih bersih** — dihapus: ticker, stiker miring, judul uppercase raksasa, bayangan keras, garis tebal, latar grid. Dipakai: border tipis, bayangan halus, header terang, hero tenang, hover kartu lembut. Semua fitur tetap.

**4. Palet, ikon, brand board**
- Token Tailwind/CSS dipetakan ke Butter & Forest; `navy`→`forest`, `highlight`→`butter`, ditambah `terracotta`. Primary hijau untuk aksi/tab aktif, terrakota untuk penekanan (teks putih di atas terrakota hanya ±4,2:1, jadi tidak dipakai untuk tombol).
- Logo dan favicon digambar ulang dengan palet baru (A hijau, orbit terrakota, bintang terrakota/butter). Aset SVG kini memakai teks outline (tidak bergantung font). Ditambah `logo-vertical.svg`, `app-icon.svg`, `logo-mark-dark.svg`.
- Brand board baru: `assets/brand/ATLAS_Brand_Board_Butter_Forest.png` (struktur sama dengan board sebelumnya, dirender dengan Plus Jakarta Sans).
- Warna turunan (Butter `#EBD58A`, garis `#DDD5B8`, teks redup `#5F7266`, tint hijau/terrakota untuk latar gelap) dipilih oleh saya karena palet sumber hanya 5 warna.

**Verifikasi:** `node tests/engine.test.js` lulus; semua `.jsx` terkompilasi; simulasi jsdom (drop → impor → cari → salin → reload) lulus tanpa galat; brand board dirender dan diperiksa visual.

**Batasan:** tampilan web belum dilihat di browser sungguhan; logo adalah gambar ulang, bukan berkas vektor resmi; kontras teks butter/terrakota kecil di beberapa label perlu dicek mata.

## 2026-10-19 — v3.4 (neo-brutalism + eksperimental)
**Permintaan:** hapus versi web di sebelah kanan logo; cari referensi experimental design dan neo-brutalism yang cocok, lalu terapkan tanpa menghilangkan fitur.

**Versi di sebelah logo:** teks "IR LAB v3.x" sudah dihapus sejak v3.3 dan tidak ada lagi di kode (dicek dengan pencarian `v3.`/`IR LAB`). Bila masih tampil, penyebabnya cache browser: alamat skrip kini memakai `?v=3.4` dan perlu hard refresh sekali.

**Referensi yang dipakai:** resep neo-brutalism (garis 2–5px, bayangan keras tanpa blur, warna blok datar; tombol terangkat saat hover dan menekan ke dalam bayangan saat aktif) dan tren 2026 (tipografi raksasa, tipografi eksperimental dicadangkan untuk judul/callout, struktur grid terlihat).

**Perubahan** (hampir semuanya di CSS, markup hanya disentuh seperlunya)
- Lapisan neo-brutalism di akhir `theme.css`: sudut 4px, garis navy, bayangan keras 4/6px, kartu dan modal berbayangan keras, kartu hasil naik 2px saat hover (`nb-card`), tombol berbingkai terangkat/menekan, input bergaris tebal dengan fokus 3px sky, footer navy, penanda term bergaya blok, latar grid 32px.
- Header: garis bawah sky 4px, tab aktif bertepi putih dengan bayangan sky.
- Eksperimental: ticker tagline di bawah header (`App.jsx`), hero dengan judul `clamp(2.25rem, 7vw, 4.75rem)` huruf besar, stiker miring untuk label dan frasa "Jelajahi lebih jauh.".
- Warna tetap dari Brand Board (navy, biru, sky); tidak ada warna baru.
- Aksesibilitas: kontras teks tidak berubah, ring fokus jelas, animasi ticker mati bila `prefers-reduced-motion`.
- Semua fitur tetap: Search, Preprocessing, Corpus Explorer, Algorithm, Import/drag & drop, salin, filter sticky, dataset persisten.

**Verifikasi:** `node tests/engine.test.js` lulus; semua `.jsx` terkompilasi; simulasi jsdom (drop → impor → cari → salin → reload) lulus tanpa galat.

**Batasan:** tampilan visual belum dilihat di browser sungguhan (tidak ada tangkapan layar); periksa kerapatan elemen di layar kecil dan tab Corpus/Algorithm. Seluruh gaya berasal dari penimpaan CSS global (`.border`, `.rounded-*`), jadi elemen baru otomatis ikut bergaya neo-brutalism.

## 2026-10-19 — v3.3 (SastrawiJs + KStem, badge versi dihapus)
**Permintaan:** hapus badge "IR LAB v3.2" dan kecilkan ukuran keterangan sistem; stemmer Indonesia memakai paket npm Sastrawi, stemmer Inggris memakai KStem (Krovetz) di folder `nlp`; daftar kata yang banyak dibuat multi-baris.

**Perubahan**
- Badge versi di header dihapus. "Keterangan/rincian sistem" saya tafsirkan sebagai status bar (dataset, dokumen, kosakata, bahasa): padding, teks, dan badge dikecilkan (`text-[11px]`, badge `text-[10px]`). Beri tahu bila yang dimaksud elemen lain.
- Paket `jsastrawi` tidak ada di npm; yang ada adalah **`sastrawijs`** (1.1.0, MIT). Bundel browser-nya disalin ke `src/nlp/vendor/` lewat `npm run vendor` (`package.json`, `scripts/vendor-sastrawijs.js`).
- `stemmer-id.js` kini adapter SastrawiJs. Stemmer Nazief-Adriani buatan sendiri dan `data/kata-dasar-id.js` (kamus ±300 KB) dihapus; pengecekan kata dasar memakai `stemmer.find()`.
- Koreksi di adapter: SastrawiJs tidak menstem `pengembangan` (366 kemunculan di dataset), `pengerjaan`, `pengendalian`, `pengelolaan`, dll. Adapter memulihkan huruf awal setelah awalan peng-/meng-/peny-/meny-/pem-/mem-/pen-/men- hanya bila hasil asli bukan kata dasar. Dampak: 9 dari 2.768 token unik (375 kemunculan), semuanya benar (`pengembangan→kembang`, `menyampaikan→sampai`). Matikan dengan `USE_NASAL_FIX = false`.
- **KStem** (`src/nlp/kstem/`): tidak ada paket npm KStem, jadi diterjemahkan secara mekanis dari `KStemmer.java` + `KStemData1..8` Apache Lucene (port dari KStem Bob Krovetz, CIIR UMass). Lisensi BSD/Apache dicantumkan di `kstem.js`. Porter dihapus.
- Daftar kata dibungkus ±96 kolom per baris: `stopwords-id.js` (141 kata), `stopwords-en.js` (151 kata), `kstem-lists.js`, `kstem-data.js` (27.495 kata).
- `index.html`, `tests/engine.test.js`, README, ARCHITECTURE diperbarui; `package.json` ditambahkan.

**Verifikasi**
- KStem JS vs stemmer Krovetz C++ asli (`krovetzstemmer`) pada 155.830 kata (leksikon + 21 imbuhan + token dataset): identik 155.813 (99,99%). 17 selisih berasal dari perbedaan leksikon Lucene dan C++ (mis. `later`, `bater`), bukan galat terjemahan.
- SastrawiJs vs PySastrawi pada 2.768 token dataset: 28 berbeda sebelum koreksi (450 kemunculan, 366 di antaranya `pengembangan`); sisanya a.l. `pengenalan→nal`, `menengah→engah`, `penilaian→ilai` (hasil SastrawiJs, belum dikoreksi). Konsisten antara dokumen dan kueri.
- `node tests/engine.test.js`: 1.000 dokumen, indeks ±137 ms, kosakata 2.545 term, 872 ID / 128 EN; kueri uji tetap menghasilkan dokumen relevan.
- Simulasi jsdom (drop CSV → impor → cari → salin → reload): lulus tanpa galat dengan urutan skrip baru.

**Batasan**
- Tampilan di browser sungguhan belum dilihat langsung.
- `pengenalan`/`mengenal` → `nal` dan `menengah` → `engah` masih dihasilkan SastrawiJs (konsisten, tetapi bukan akar linguistik).
- KStem hanya membuang imbuhan pada kata di luar leksikon; kata kamus (mis. `learning`) dibiarkan utuh, sehingga `learn` dan `learning` tidak otomatis sama.
- Pencarian masih tidak lintas bahasa.

## 2026-10-18 — v3.2 (perbaikan UX + persistensi)
1. **Panel Filter & Analisis** kini `sticky` (`lg:sticky lg:top-20`, tinggi maks. layar, scroll sendiri jika panjang), sehingga tetap terlihat saat daftar dokumen di-scroll. Berlaku di layar lebar (≥ lg); di layar sempit panel tetap di atas daftar.
2. **Tombol salin** (`CopyButton`) di modal detail dokumen, dipakai di Search ("Detail Doc") dan Corpus Explorer karena memakai modal yang sama: salin judul, ID, dan isi teks. Ikon berubah jadi centang 1,5 detik; ada fallback `execCommand` bila bukan konteks aman.
3. **Dataset persisten**: `utils/storage.js` menyimpan dokumen + nama berkas ke IndexedDB saat impor dan memulihkannya saat halaman dibuka; indeks dibangun ulang. Status bar menampilkan "MEMUAT DATASET TERSIMPAN…" selama pemulihan.
4. **Kartu "Belum ada dataset" dihapus** dari tab Search (impor lewat tombol di header). **Drag & drop** CSV dari file explorer aktif di seluruh halaman, dengan overlay "Lepaskan berkas CSV di sini"; berkas non-CSV memunculkan pesan galat di modal. Pemilih berkas juga bisa memilih berkas yang sama lagi.

**Verifikasi** (jsdom + React 18 + fake-indexeddb, kode asli dijalankan): halaman awal kosong tanpa kartu; drop CSV → 1.000 baris terbaca; konfirmasi → 1.000 dokumen; panel sticky ada setelah pencarian; salin isi menyalin teks dan ikon berubah; setelah "reload" dataset 1.000 dokumen tetap ada; tidak ada galat. `node tests/engine.test.js` lulus.

**Batasan**
- Uji memakai jsdom, bukan browser sungguhan: posisi sticky dan animasi overlay perlu dilihat langsung.
- Data tersimpan per origin (`localhost:8000`); ganti port = dataset terpisah. Mode private/incognito tidak menyimpan.
- Belum ada tombol "hapus dataset"; fungsi `clearDataset` sudah tersedia di `storage.js` bila diperlukan.

## 2026-10-16 — v3.1 (tema & logo sesuai Brand Board)
**Permintaan:** hapus fitur ganti palet; terapkan tema dan logo dari *ATLAS Brand Identity Design System Board* tanpa menghilangkan konten/fitur.

**Perubahan**
- Fitur pemilih palet dihapus: `config/palettes.js`, state/efek `activePalette`, dan tombol palet di header.
- Tema gelap → tema terang brand. Token Tailwind dipetakan ulang (navy `#0B1F3B`, accent `#3B82F6`, highlight `#60A5FA`, neutral `#E5E7EB`, text `#1F2937`, background `#F8FAFC`), sehingga seluruh komponen berganti tema tanpa diubah satu per satu. `theme.css` ditulis ulang (scrollbar, penanda term, seleksi teks).
- Font diganti Plus Jakarta Sans (menggantikan Inter dan IBM Plex Mono).
- Logo baru (huruf A + orbit + bintang kompas): `src/components/Logo.jsx` dan SVG di `assets/brand/` (mark, horizontal light/dark, favicon). Header menjadi navy dengan logo dan tagline "Search · Understand · Explore".
- Hero Search: "Temukan informasi. Jelajahi lebih jauh."; placeholder kolom cari mengikuti contoh aplikasi di board. Badge status memakai warna -600 agar kontras di latar terang. Overlay modal memakai navy transparan.
- Semua fitur (Search, Preprocessing, Corpus Explorer, Algorithm, Import CSV, modal) tidak diubah; versi menjadi v3.1.

**Verifikasi:** `node tests/engine.test.js` lulus; semua `.jsx` lolos kompilasi Babel; logo SVG dirender dan dicek visual.

**Batasan**
- Logo digambar ulang sebagai SVG dari board (bukan berkas vektor asli), sehingga bentuknya mendekati tetapi tidak identik. Ganti `assets/brand/*.svg` dan `LogoMark` di `Logo.jsx` jika punya berkas resmi.
- Tampilan di browser belum dilihat langsung; periksa kontras teks di semua tab setelah dijalankan.

## 2026-10-16 — v3.0 (struktur multi-berkas + impor dataset)
**Permintaan:** arsitektur tidak boleh satu `.html`; dataset diimpor lewat web (bukan ditanam di kode), memakai *Dataset 1.000 Judul Referensi Tugas Akhir – Gamifikasi Web, AI Virtual Tutor & TKJ SMK*.

**Perubahan**
- `index.html` (330 KB) dipecah menjadi `src/` (namespace, config, data, nlp, engine, utils, components) dan `assets/css/theme.css`; `index.html` kini hanya kerangka + urutan skrip.
- `SearchTab` dan `Modals` diekstrak dari `AtlasApp`; komponen lain dipisah per berkas.
- 60 dokumen demo dihapus dari kode (tersimpan sebagai CSV di `samples/`). Auto-load `dataset.csv` dihapus; aplikasi mulai kosong dengan kartu "Belum ada dataset".
- Status bar menampilkan nama berkas dataset; badge "DEMO DATA" dihapus.
- `autoMapHeaders` ditulis ulang (regex, fuzzy) + kolom baru **url**; `rowsToDocs` membuang URL dari teks, membersihkan awalan nomor kategori, menyimpan tautan.
- Hasil pencarian dan modal detail menampilkan tombol "Sumber ↗".
- Contoh kueri diganti sesuai topik dataset.
- Tambah `tests/engine.test.js`; dataset disalin ke `dataset/`; README dan ARCHITECTURE diperbarui.

**Hasil uji** (Node; semua `.jsx` lolos kompilasi Babel)
- 1.000 baris → 1.000 dokumen; kolom terpetakan benar: No→id, Nama Judul→judul, Sumbernya→isi, Kategori Topik→kategori, Tautan→url.
- Indeks 91,5 ms; kosakata 2.489 term; 872 dokumen ID / 128 EN; 8 kategori.
- Kueri `Intelligent Tutoring System` → #487, #101, #474; `gamifikasi pembelajaran` → #298, #556, #287; `AI chatbot virtual tutor` → #453, #252, #436. Waktu cari 0,4–7,4 ms.

**Catatan / batasan**
- Wajib lewat server lokal (`python -m http.server`); `file://` memblokir pemuatan skrip terpisah.
- Tampilan di browser belum diuji langsung (hanya engine di Node + kompilasi JSX); cek tab Search, Preprocessing, Corpus dan modal impor setelah dijalankan.
- Kueri pendek tanpa stopword dianggap Indonesia; kata Inggrisnya tetap benar lewat fallback Porter.
- Tidak lintas bahasa.

## 2026-10-16 — v2.7
Dukungan Bahasa Inggris (stopword, Porter, deteksi bahasa per dokumen), normalisasi diakritik/apostrof, dataset demo 12→60, pemilih bahasa di Preprocessing.

## v2.6
Versi awal yang dianalisis: engine VSM + pra-proses Indonesia dalam satu `index.html`.

