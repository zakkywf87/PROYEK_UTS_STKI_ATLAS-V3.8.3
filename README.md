# ATLAS — Search Beyond Keywords

Aplikasi web mesin pencari berbasis **Vector Space Model (VSM)**, pembobotan **TF-IDF**, dan perangkingan **Cosine Similarity**. Berjalan penuh di browser (React + Tailwind + Animate.css via CDN) — tanpa backend, tanpa build step.

## Fitur Utama
| Fitur | Lokasi |
|---|---|
| Dashboard Pencarian VSM & Kueri Dinamis | Tab **Search** (`src/components/SearchTab.jsx`) |
| Alur Teks Pra-proses Interaktif + Tooltip Akademik | Tab **Preprocessing** Subtitle & `src/components/PreprocessingInspector.jsx` |
| Legend & Trace Filtering/Stemming Interaktif | Tab **Preprocessing** (Indikator Hijau/Kuning/Merah + Tooltip Edukasi) |
| Mesin VSM & Perangkingan Cosine | `src/engine/vsm-engine.js` |
| Hasil Pencarian + Mathematical Breakdown (KaTeX) | Tab **Search** & Modal Breakdown (`src/components/Modals.jsx`) |
| Penjelasan Algoritma dengan Visual Formula KaTeX | Tab **Algorithm** (`src/components/AlgorithmExplanation.jsx`) |
| Dialog Hapus Dataset Kustom (Butter & Forest) | Modal Konfirmasi (`src/components/Modals.jsx`) |
| Corpus Explorer & Status Bar Kompak | Tab terpisah & Bar bawah (`src/App.jsx`) |

## Cara Menjalankan (Mudah & Bebas Ribet)

1. **Cara 1 — Satu Klik di Windows:**
   Klik ganda **`buka-atlas.bat`** di folder utama. Server statis menyala otomatis dan browser langsung terbuka di `http://localhost:8000`.

2. **Cara 2 — Terminal / npm:**
   ```bash
   npm start
   ```

> **Catatan:** Server lokal berjalan via `scripts/serve.js` (Node.js zero-dependency, header `Cache-Control: no-store`). Aplikasi memerlukan internet saat pertama memuat CDN (React, Tailwind, Babel, Animate.css, KaTeX).

3. **Impor & Kelola Dataset:**
   - **Impor:** Klik **Import CSV** (kanan atas) atau seret `.csv` ke halaman → petakan kolom → **Konfirmasi & Re-Indeks**. Dataset tersimpan di IndexedDB browser.
   - **Peringatan Belum Impor:** Mencari tanpa dataset memunculkan banner interaktif bergaris terrakota (animasi `headShake`) dengan tombol pintasan impor CSV.
   - **Hapus Dataset Berdialog Kustom:** Klik ikon tempat sampah di status bar → muncul dialog konfirmasi bertema Butter & Forest (bukan prompt browser standar) → konfirmasi untuk mereset IndexedDB, indeks VSM, dan riwayat pencarian seketika.

---

## Fitur Baru v3.8

### 1. Visual Formula Matematika (KaTeX Integration)
Rumus-rumus pada tab **Algorithm** dan modal **Mathematical Breakdown ("Why this result?")** tidak lagi berupa teks mentah/ASCII, melainkan dirender visual menggunakan **KaTeX**:
- Persamaan diberi label formal (Eq. 1 s/d Eq. 5).
- Menampilkan pecahan ($\frac{f_{t,d}}{\|d\|}$), notasi logaritma alami ($\ln$), sigma jumlahan ($\sum$), dan norma Euclidean ($\|\cdot\|$).
- Grid normalisasi pada modal breakdown disusun rapi dalam kartu 7 kolom bergaris pemisah bertema Butter & Forest.

### 2. Alur Teks Preprocessing Interaktif dengan Ikon SVG Bertema
Interaksi edukatif disematkan langsung pada alur teks `Teks Asli → Case Folding → Tokenisasi → Stopword Removal → Stemming` di header tab Preprocessing:
- Setiap tahapan memiliki **ikon SVG bertema** (`file-text`, `type`, `scissors`, `filter`, `sprout`), menggantikan emoji default agar serasi dengan identitas Butter & Forest.
- **Bebas Native Tooltip Mengganggu**: Atribut `title` bawaan browser dihilangkan sepenuhnya sehingga kotak kuning/hitam OS tidak lagi muncul dan menutupi tampilan.
- **Rasio Tooltip Terukur & Anti-Offside**: Tooltip mengambang dirancang dengan lebar proporsional (295px), batas viewport terproteksi (`requestAnimationFrame` clamping), serta arah panah segitiga dinamis (muncul di bawah atau di atas anchor secara adaptif).
- Memuat penjelasan esensi tahapan, operasi teknis, dan sumber referensi ilmiah primer (Manning et al., 2008; Salton & McGill, 1983; Webster & Kit, 1992; Luhn, 1958; Tala, 2003; Krovetz, 1993; Adriani et al., 2007).

### 3. Tooltip Cerdas Trace Filtering/Stemming (Tanpa Bar Keterangan)
Pada bagian *Filtering & Stemming Trace*:
- **Bar Keterangan Dihapus**: Menghilangkan strip legenda statis agar ruang tinjauan token lebih lega dan fokus.
- **Fungsi Hover Ditingkatkan**:
  * Tooltip token (`TokenBadge`) beroperasi secara instan tanpa flicker atau jeda di koordinat (0,0).
  * Dilengkapi `pointer-events: none` sehingga pergerakan kursor di atas daftar kata mengalir mulus tanpa tersangkut.
  * Menampilkan visualisasi perubahan kata (`kata asli → kata dasar` atau penanda stopword tereliminasi), indikator warna status (*Hijau / Kuning / Merah*), tahapan pipeline, serta alasan linguistik spesifik.

### 4. Status Bar Kompak & Dialog Hapus Dataset
- Status bar di bagian bawah layar ditata ulang menjadi satu baris ramping horizontal berpemisah titik/garis (`│`, `·`), menjaga ruang pandang layar tetap lapang.
- Dialog konfirmasi hapus dataset bertema Butter & Forest dengan bayangan lembut, tombol batalkan/hapus bergaris tegas, dan dukungan keyboard (`Escape` untuk batal, `Enter` untuk konfirmasi).

---

## Contoh Kueri Dinamis (Menyesuaikan Dataset Aktif)

Baris contoh kueri di bawah bilah pencarian **tidak statis** — diekstrak otomatis dari dataset yang sedang aktif setiap kali dataset berubah (impor baru / setelah hapus).

| Sumber Kueri | Cara Kerja |
|---|---|
| **Kategori dokumen** | Membersihkan nomor awalan, memecah sub-frasa per pemisah (/ & ,) |
| **Bigram/Trigram judul** | Menghitung frekuensi n-gram dari seluruh judul, mengambil 30 teratas (frekuensi >= 2) |
| **Filter redundansi** | Frasa yang saling mengandung satu sama lain dibuang agar kueri beragam |
| **Tampil 5 sekaligus** | Diputar offset +3 per klik tombol shuffle |

- Jika belum ada dataset, area kueri menampilkan: Impor dataset CSV untuk melihat rekomendasi kueri otomatis.
- Logika ekstraksi berada sepenuhnya di useMemo dalam SearchTab.jsx, reaktif terhadap prop documents.

---

## Tampilan Dataset Kosong / Setelah Hapus Dataset (Butter & Forest)

Saat documents.length === 0, SearchTab menampilkan kartu panduan bertema Butter & Forest yang elegan:

- Strip gradien tiga warna: #37664B -> #EBD58A -> #C45D3E di bagian atas kartu.
- Ikon database dalam lingkaran bergaris-putus berwarna Butter yang membesar saat hover.
- Badge terrakota bertuliskan KOLEKSI DOKUMEN KOSONG.
- 3 langkah panduan dalam grid: Pilih CSV -> Petakan Kolom -> Mulai Cari.
- Tombol btn-forest-primary hijau Forest dengan bayangan halus dan lift hover.

Semua token CSS ada di assets/css/theme.css:
.empty-dataset-card, .empty-state-badge, .empty-state-icon-pulse, .empty-guide-step, .btn-forest-primary, .btn-butter-secondary.

---

## Identitas Visual & Animasi
- **Palet Butter & Forest**: Background #FAF4DF, Surface #FFFDF6, Text #263B31, Primary #37664B, Accent #C45D3E. Turunan: Butter #EBD58A, garis #DDD5B8, teks redup #5F7266. Font: **Plus Jakarta Sans**.
- **Animasi CTA (Animate.css)**: Tombol Cari, Import CSV, Konfirmasi, chip kueri, dan tombol pagination menggunakan micro-animation pulse, rubberBand, headShake.
- **Formula Visual (KaTeX)**: Rendering persamaan matematika tajam berbasis web font MathJax/KaTeX.

---

## Pipeline NLP & Dukungan Judul Campur (Bilingual)
Dataset tugas akhir sering mencampurkan Bahasa Indonesia dan Inggris. Pipeline NLP ATLAS menangani ini lewat:

1. **Normalisasi & Kata Majemuk:** e-learning -> elearning, wi-fi -> wifi, game-based -> game based, dll.
2. **Stopwords Diperluas:** ID (320+) + EN (300+), dengan bilingual-aware filtering.
3. **Perbaikan Kata Rusak Sastrawi** (ID_ROOT_OVERRIDES & DAMAGED_STEM_FIXES):
   pengenalan -> kenal, menengah -> tengah, penilaian -> nilai, berbasis -> basis, pemasaran -> pasar, pemetaan -> peta, pergerakan -> gerak, kerusakan -> rusak, pemupukan -> pupuk, penyiraman -> siram, keterampilan -> terampil, pemberdayaan -> daya, pengembangan -> kembang, dll.
4. **Kamus Istilah Teknis KStem** (EN_ROOT_OVERRIDES):
   troubleshooting -> troubleshoot, learning -> learn, router -> router, modelling -> model, gamification -> gamifikasi, switching -> switch, monitoring -> monitor, dll.

---

## Dataset
Dataset 1.000 Judul Referensi Tugas Akhir - Gamifikasi Web, AI Virtual Tutor & TKJ SMK (dataset/).
- ~140 ms terindeks, 2.527 vocab unik, 8 kategori.
- Kolom: No (ID), Nama Judul, Sumbernya, Kategori Topik, Tautan.

## Pengujian
```bash
npm test
```
Memeriksa integritas indeks, pemetaan kolom, dan akurasi pra-proses kueri VSM (100% lulus, 1.000 dokumen).

