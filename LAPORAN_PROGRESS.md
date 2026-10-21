# LAPORAN PROGRESS PENGEMBANGAN WEBSITE SISTEM TEMU KEMBALI INFORMASI (STKI) Kelompok 8
## Proyek UTS: ATLAS (Automated Text Retrieval & Linguistic Analysis System)
> **Mata Kuliah**: Sistem Temu Kembali Informasi (STKI) — Semester 7  
> **Institusi**: Program Studi S1 Pendidikan Teknologi Informasi Universitas Negeri Surabaya
> **Tujuan Dokumen**: **Bukti Presensi Kehadiran Kuliah STKI (Pertemuan Minggu Lalu: 15 Oktober 2026)** & Laporan Progres Pra-Demo UTS  
> **Model IR**: Vector Space Model (VSM) · TF-IDF (Term Frequency - Inverse Document Frequency) · Cosine Similarity  
> **Dataset**: *Dataset 1.000 Judul Referensi Tugas Akhir — Gamifikasi Web, AI Virtual Tutor & TKJ SMK*  
> **Periode Pengembangan**: 15–16 Oktober 2026 s.d. 21 Oktober 2026  
> **Status Keseluruhan**: **100% SELESAI (Production-Ready & Fully Tested)**  
> **Prasyarat Pengumpulan**: Presensi Perkuliahan STKI, Video Demonstrasi, dan Tautan Repositori GitHub  

---

> [!IMPORTANT]
> **LEMBAR PENGESAHAN PRESENSI PERKULIAHAN STKI (15 OKTOBER 2026)**  
> Dokumen ini secara resmi berfungsi ganda sebagai **Bukti Kehadiran & Presensi Pertemuan STKI Minggu Lalu (Kamis, 15 Oktober 2026)**. Pada pertemuan tersebut, Dosen Pengampu memberikan arahan mengenai spesifikasi implementasi 4 fitur sistem pencarian temu kembali informasi (Information Retrieval) untuk penilaian Ujian Tengah Semester (UTS). Sebagai bentuk pertanggungjawaban presensi dan penugasan langsung, laporan komprehensif ini mendokumentasikan progres perancangan, algoritma, serta implementasi nyata pada aplikasi web ATLAS dari tanggal 15–16 Oktober hingga selesai 100% pada 21 Oktober 2026.

---

## 1. Ringkasan Eksekutif & Status 4 Fitur Utama

Laporan ini disusun sebagai dokumen resmi pemenuhan **presensi pertemuan STKI tanggal 15 Oktober 2026** sekaligus pertanggungjawaban progres pengembangan aplikasi web temu kembali informasi **ATLAS** sebelum pengunggahan video demonstrasi dan penyerahan tautan repositori GitHub ke Dosen Pengampu.

Sesuai dengan instruksi dan silabus tugas Ujian Tengah Semester (UTS) yang diamanatkan oleh Dosen Pengampu pada pertemuan 15 Oktober 2026, sistem wajib mengimplementasikan **4 fitur fundamental Information Retrieval (IR)** secara nyata, interaktif, dan dapat dipertanggungjawabkan secara matematis serta linguistik. Seluruh 4 fitur tersebut telah berhasil diselesaikan 100% dan terintegrasi penuh ke dalam antarmuka web.

### Tabel Ringkasan Ketercapaian 4 Fitur Dosen

| No | Fitur yang Diminta Dosen | Modul / Komponen Web | Tanggal Implementasi | Status | Keterangan Verifikasi |
|---|---|---|---|:---:|---|
| **1** | **Text Preprocessing Pipeline (Pra-pemrosesan Teks Otomatis)** | `src/nlp/` (`normalize.js`, `stopwords-*.js`, `stemmer-*.js`, `pipeline.js`), `PreprocessingInspector.jsx` | 16 – 20 Okt 2026 | **100% Selesai** | Pipeline 5 tahap bilingual (ID & EN), kamus kata rusak, flowchart interaktif ber-referensi ilmiah, token trace portal-based tooltip. |
| **2** | **Indexing & Pembobotan Term (TF-IDF Logaritmik / Smoothed)** | `src/engine/vsm-engine.js`, `AlgorithmExplanation.jsx`, `CorpusExplorer.jsx` | 16 – 20 Okt 2026 | **100% Selesai** | Inverted Index 2.527 vocabulary dari 1.000 dokumen korpus, bobot TF proporsional, Smoothed IDF, visualisasi KaTeX Eq. 1–5. |
| **3** | **Perangkingan Dokumen (VSM & Cosine Similarity) + Breakdown Matematis** | `src/engine/vsm-engine.js`, `SearchTab.jsx`, `Modals.jsx` (`WhyResultModal`) | 16 – 20 Okt 2026 | **100% Selesai** | Perangkingan Cosine Similarity descending, penyorotan kata kunci (*term highlight*), dialog transparansi matematika (*norm grid* & kontribusi bobot per-term KaTeX). |
| **4** | **Manajemen Dataset Dinamis & Antarmuka Interaktif Pengguna (UI/UX)** | `src/utils/` (`csv.js`, `storage.js`), `App.jsx`, `SearchTab.jsx`, `theme.css` | 16 – 21 Okt 2026 | **100% Selesai** | Unggah CSV (drag & drop + file picker), auto-map kolom, persistensi IndexedDB, dialog konfirmasi hapus bertema *Butter & Forest*, kueri rekomendasi dinamis, filter kategori & skor. |

---

## 2. Linimasa Kronologis Pengerjaan (15 Oktober – 21 Oktober 2026)

Pengembangan dilakukan secara terstruktur, teruji, dan bertahap dimulai dari arahan pertemuan kuliah STKI pada **15 Oktober 2026** hingga **21 Oktober 2026**:

```
[15 Okt 2026] ──> Pertemuan STKI: Arahan Dosen, Presensi Kuliah, Spesifikasi 4 Fitur & Desain Kebutuhan
       │
[16 Okt 2026] ──> Modularisasi src/, Parsing CSV, VSM Engine Awal, Tema Brand Board Butter & Forest
       │
[18 Okt 2026] ──> Persistensi IndexedDB, Drag & Drop CSV Global, Filter Sticky, Tombol Salin
       │
[19 Okt 2026] ──> Stemmer Bilingual (SastrawiJs + KStem Krovetz), Perbaikan Kata Rusak, Zero-Dependency Server
       │
[20 Okt 2026] ──> Formula Visual KaTeX, Flowchart Ilmiah Interaktif, Modal Hapus Butter & Forest, White-Box Testing
       │
[21 Okt 2026] ──> Verifikasi Akhir Mesin VSM (100% Pass), Finalisasi UI Portal, Laporan Progress & Arsitektur
```

### Rincian Progres Harian:

* **Kamis, 15 Oktober 2026 (Pertemuan Kuliah STKI — Presensi & Spesifikasi Proyek UTS)**
  - Mengikuti perkuliahan STKI tatap muka / daring mingguan bersama Dosen Pengampu (Presensi Pertemuan 15 Oktober 2026).
  - Menerima dan membedah silabus tugas UTS sistem temu kembali informasi dengan 4 pilar fitur wajib: Preprocessing, Indexing/TF-IDF, VSM Cosine Ranking + Formula, dan Manajemen Dataset/UI Interaktif.
  - Menetapkan topik dataset korpus: *Dataset 1.000 Judul Referensi Tugas Akhir (Gamifikasi Web, AI Virtual Tutor & TKJ SMK)* berformat CSV.
  - Menyusun rancangan arsitektur awal sistem temu kembali informasi ATLAS berbobot TF-IDF dan Cosine Similarity.

* **Jumat, 16 Oktober 2026 (Fondasi Sistem & Desain Identitas)**
  - Mengonversi arsitektur monolitik `index.html` menjadi struktur modular berbasis IIFE di direktori `src/` (`namespace`, `config`, `nlp`, `engine`, `utils`, `components`).
  - Mengintegrasikan *Dataset 1.000 Judul Referensi Tugas Akhir (Gamifikasi, AI Virtual Tutor, TKJ SMK)*.
  - Membangun modul parser CSV RFC 4180 (`src/utils/csv.js`) yang mampu mendeteksi header secara otomatis (*fuzzy matching*) dalam Bahasa Indonesia dan Bahasa Inggris.
  - Mengimplementasikan penghitungan VSM dasar dan pengujian otomatis tanpa browser via `node tests/engine.test.js`.
  - Menerapkan palet resmi *Butter & Forest* (Background `#FAF4DF`, Surface `#FFFDF6`, Text `#263B31`, Primary Forest `#37664B`, Accent Terracotta `#C45D3E`) dan tipografi *Plus Jakarta Sans*.

* **Minggu, 18 Oktober 2026 (Persistensi Data & Peningkatan Interaktivitas UX)**
  - Mengimplementasikan modul penyimpanan browser lokal `src/utils/storage.js` berbasis **IndexedDB** (`saveDataset`, `loadDataset`, `clearDataset`), sehingga 1.000 dokumen tetap tersimpan saat tab di-refresh tanpa membebani memori LocalStorage.
  - Menambahkan kapabilitas *Drag & Drop* berkas CSV secara global di seluruh permukaan antarmuka web dengan overlay visual.
  - Menjadikan panel filter dan pengatur ambang batas skor (*similarity threshold*) bersifat `sticky` di sisi kanan layar untuk kenyamanan navigasi dokumen panjang.
  - Menyediakan komponen `CopyButton` dengan umpan balik visual animasi untuk menyalin detail dokumen ke clipboard.

* **Senin, 19 Oktober 2026 (NLP Bilingual, Pemulihan Kata Rusak & Akses Tanpa Hambatan)**
  - Mengganti stemmer lama dengan kombinasi resmi: **SastrawiJs** (Bahasa Indonesia) dan **KStem (Krovetz)** port Apache Lucene berleksikon 27.495 kata (`src/nlp/kstem/`) untuk Bahasa Inggris.
  - Menambahkan kamus pemulihan kata rusak (`ID_ROOT_OVERRIDES` dan `DAMAGED_STEM_FIXES`) untuk mengatasi kelemahan algoritma pemotongan affiks standar, seperti mengembalikan `pengenalan` $\rightarrow$ `kenal`, `menengah` $\rightarrow$ `tengah`, `berbasis` $\rightarrow$ `basis`, `penilaian` $\rightarrow$ `nilai`, `troubleshooting` $\rightarrow$ `troubleshoot`.
  - Mengintegrasikan pustaka animasi **Animate.css (v4.1.1)** pada komponen Call-To-Action (tombol Cari, tombol Impor, kartu peringatan).
  - Menggantikan ketergantungan Python dengan server lokal Node.js standar *zero-dependency* (`scripts/serve.js`) serta menyertakan peluncur sekali-klik Windows `buka-atlas.bat`.
  - Membangun fitur **Contoh Kueri Dinamis** (`SearchTab.jsx`) yang mengekstrak topik kategori dan n-gram (bigram/trigram) frekuensi tinggi langsung dari korpus aktif beserta fitur *shuffle*.

* **Selasa, 20 Oktober 2026 (Visualisasi KaTeX, Flowchart Akademik & Pengujian White-Box)**
  - Mengintegrasikan pustaka matematika **KaTeX (v0.16.8)** di browser untuk merender persamaan formal TF, Smoothed IDF, Vektor Bobot, Cosine Similarity, dan Norma Euclidean (Eq. 1 s/d Eq. 5).
  - Merombak modal transparansi *Why this result?* dengan tata letak *Norm Grid* 7 kolom dan formula kontribusi term KaTeX.
  - Mengembangkan komponen alur pra-pemrosesan interaktif inline (`InteractivePipelineFlow`) dengan ikon SVG khusus (`file-text`, `type`, `scissors`, `filter`, `sprout`) dan tooltip edukatif yang mencantumkan rujukan literatur primer (Manning, Salton, Luhn, Krovetz, Adriani).
  - Menyediakan modal konfirmasi hapus dataset kustom `ConfirmDeleteModal` bertema Butter & Forest untuk menggantikan dialog `window.confirm` bawaan peramban.
  - Menyelesaikan masalah pemotongan elemen (*overflow-clip*) pada hover trace dengan mengadopsi **React Portal** (`ReactDOM.createPortal`) yang menginjeksi tooltip langsung ke `document.body` tanpa kedip (*anti-flicker*).
  - Melakukan pengujian sistematis *White-Box Testing* (`WHITE_BOX.md`) mencakup *Data Flow Testing* (6 du-paths), *Basis Path* (McCabe Cyclomatic Complexity = 5), dan *Branch Coverage* (10/10 cabang - 100%).

* **Rabu, 21 Oktober 2026 (Verifikasi Final & Finalisasi Pra-Pengumpulan Demo)**
  - Menjalankan uji regresi mesin VSM via `npm test` dengan hasil 100% berhasil (*5 kueri evaluasi valid, indeksasi 1.000 dokumen dalam 97.89 ms*).
  - Melakukan audit menyeluruh terhadap pemenuhan 4 fitur dosen di lingkungan peramban.
  - Menyusun dokumen resmi Laporan Progres (`LAPORAN_PROGRESS.md`) serta memperbarui dokumen arsitektur teknis (`ARCHITECTURE.md`).

---

## 3. Detail Implementasi 4 Fitur Dosen & Bukti Antarmuka Web

Berikut adalah elaborasi komprehensif implementasi teknis dan visual dari keempat fitur yang diminta oleh Dosen Pengampu:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         FITUR SISTEM TEMU KEMBALI INFORMASI                      │
├───────────────────────┬────────────────────────┬─────────────────────────────────┤
│ 1. Preprocessing NLP  │ 2. Indexing & TF-IDF   │ 3. VSM & Cosine Similarity      │
│  - Case Folding       │  - Inverted Index      │  - Dot Product Scoring          │
│  - Tokenisasi         │  - TF Proporsional     │  - Ranking Descending           │
│  - Stopword Bilingual │  - Smoothed IDF        │  - "Why this result?" KaTeX     │
│  - Stemming Bilingual │  - Normalisasi ||d||   │  - Term Highlighting            │
├───────────────────────┴────────────────────────┴─────────────────────────────────┤
│ 4. Manajemen Dataset & Interaktivitas UI/UX (IndexedDB, CSV Parser, Dynamic Q)   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1. Fitur 1: Text Preprocessing Pipeline (Pra-pemrosesan Teks Otomatis)
* **Permintaan Dosen**: Sistem harus mampu menerima teks input (baik dokumen maupun kueri pencarian) dan menjalankan tahapan pra-pemrosesan teks terstruktur (Case Folding, Tokenisasi, Filtering/Stopword Removal, dan Stemming) serta memperlihatkan transparansi hasil tiap tahapannya kepada pengguna.
* **Implementasi Kode**:
  - `src/nlp/normalize.js`: Melakukan pembersihan tanda baca, normalisasi spasi berlebih, standardisasi istilah berkonektor (`e-learning` $\rightarrow$ `elearning`, `game-based` $\rightarrow$ `game based`, `wi-fi` $\rightarrow$ `wifi`).
  - `src/nlp/stopwords-id.js` & `stopwords-en.js`: Kamus stopword Bahasa Indonesia (320+ kata; berbasis algoritma Tala dan istilah artikel ilmiah) dan Bahasa Inggris (300+ kata tugas akademik).
  - `src/nlp/stemmer-id.js` & `stemmer-en.js`: Pemotongan imbuhan Bahasa Indonesia menggunakan SastrawiJs dengan perbaikan awalan sengau (*nasal prefix*) dan kamus kata rusak (`ID_ROOT_OVERRIDES`), serta Bahasa Inggris menggunakan port KStem (Krovetz) dengan leksikon 27.495 kata.
  - `src/nlp/pipeline.js`: Mengorkestrasi rantai pra-pemrosesan dokumen dan kueri, mencatat metadata status tiap token (`preserved`, `stemmed`, `removed`).
* **Implementasi Antarmuka Web (Tab Preprocessing & Search)**:
  - **Header Preprocessing Interaktif**: Menyajikan alur sekuensial `Teks Asli` $\rightarrow$ `Case Folding` $\rightarrow$ `Tokenisasi` $\rightarrow$ `Stopword Removal` $\rightarrow$ `Stemming` dengan ikon SVG khusus.
  - **Tooltip Referensi Akademik**: Mengarahkan kursor ke tiap tahap memunculkan ringkasan fungsi, transformasi matematis, dan rujukan ilmiah formal (Manning, Raghavan, & Schütze, 2008; Webster & Kit, 1992; Salton & McGill, 1983; Luhn, 1958; Krovetz, 1993; Adriani et al., 2007).
  - **Token Trace Inspector**: Setiap kata hasil pemrosesan ditampilkan dalam bentuk badge berwarna (*Hijau: Preserved*, *Kuning: Stemmed*, *Merah: Removed*).
  - **Portal Tooltip Bebas Flicker**: Mengarahkan kursor pada token menampilkan popup kartu detail (*kata asli, perubahan kata dasar, alasan eliminasi, dan tahap pemrosesan*) yang diinjeksi via `ReactDOM.createPortal(..., document.body)` dengan proteksi anti-offside batas layar.

---

### 3.2. Fitur 2: Indexing & Pembobotan Term (TF-IDF Logaritmik / Smoothed)
* **Permintaan Dosen**: Membangun struktur indeks terbalik (*Inverted Index*) dari seluruh koleksi dokumen yang diimpor, menghitung frekuensi kemunculan kata (Term Frequency), menghitung keunikan kata antar dokumen (Inverse Document Frequency), serta menghitung vektor bobot dan panjang vektor dokumen.
* **Implementasi Kode (`src/engine/vsm-engine.js`)**:
  - **Inverted Index**: Pemetaan efisien `Map<term, Set<docId>>` untuk mempercepat proses pencarian kandidat dokumen tanpa melakukan pemindaian linear seluruh teks.
  - **Term Frequency (TF) Proporsional**:
    $$\text{TF}(t, d) = \frac{f_{t,d}}{|d|}$$
    di mana $f_{t,d}$ adalah frekuensi kemunculan term $t$ dalam dokumen $d$, dan $|d|$ adalah total token dalam dokumen tersebut. Pendekatan proporsional mencegah dokumen panjang mendominasi skor secara tidak adil.
  - **Smoothed Inverse Document Frequency (IDF)**:
    $$\text{IDF}(t) = \ln\left(\frac{N + 1}{\text{DF}(t) + 1}\right) + 1$$
    Penambahan $+1$ (*smoothing*) menjamin tidak terjadi pembagian nol (*division by zero*) dan mencegah nilai IDF menjadi nol atau negatif untuk kata yang muncul di seluruh dokumen.
  - **Panjang Vektor Euclidean (Norm)**:
    $$\|d\| = \sqrt{\sum_{t \in d} W(t, d)^2}$$
    dihitung dan dicatat di awal (*pre-calculated*) saat proses indexing untuk mempercepat waktu respons pencarian.
* **Implementasi Antarmuka Web (Tab Algorithm & Corpus Explorer)**:
  - **Tab Algorithm**: Menyajikan penurunan teori dan visualisasi persamaan formal (Eq. 1 s/d Eq. 5) yang dirender tajam menggunakan mesin tipografi LaTeX **KaTeX**.
  - **Tab Corpus Explorer**: Memungkinkan pengguna melihat langsung seluruh dokumen terindeks, representasi token hasil pra-pemrosesan tiap dokumen, distribusi kategori korpus, dan panjang kata per dokumen.
  - **Kecepatan Indexing**: Status bar menampilkan durasi indexing nyata (1.000 dokumen korpus selesai diindeks hanya dalam **~97 milidetik**).

---

### 3.3. Fitur 3: Perangkingan Dokumen (VSM & Cosine Similarity) + Breakdown Matematis
* **Permintaan Dosen**: Mengimplementasikan algoritma perangkingan berbasis Vector Space Model dengan mengukur sudut kosinus kemiripan antara vektor kueri dan vektor dokumen (Cosine Similarity), menyajikan hasil berurutan dari skor tertinggi, serta menyediakan pembuktian perhitungan matematika di balik skor yang dihasilkan.
* **Implementasi Kode (`src/engine/vsm-engine.js`)**:
  - **Formulasi Cosine Similarity**:
    $$\text{Cos}(q, d) = \frac{\mathbf{W}_q \cdot \mathbf{W}_d}{\|q\| \cdot \|d\|} = \frac{\sum_{t \in q \cap d} W(t, q) \cdot W(t, d)}{\sqrt{\sum_{t \in q} W(t, q)^2} \cdot \sqrt{\sum_{t \in d} W(t, d)^2}}$$
  - **Kontribusi Per-Term ($c_t$)**:
    $$c_t = \frac{W(t, q) \cdot W(t, d)}{\|q\| \cdot \|d\|}$$
    di mana $\sum c_t = \text{Cos}(q, d)$. Nilai kontribusi ini dipisahkan untuk membuktikan secara transparan bobot kata apa yang paling memengaruhi keterpilihan dokumen.
* **Implementasi Antarmuka Web (Tab Search & Modal Breakdown)**:
  - **Kartu Hasil Pencarian**: Menampilkan nomor peringkat, judul dokumen, skor kesamaan (*similarity score*) hingga 4 desimal, persentase kecocokan visual, kategori, tautan jurnal asli, dan cuplikan isi teks.
  - **Term Highlighting**: Kata kunci yang cocok disorot secara dinamis dengan penanda visual berlatar butter lembut di dalam teks judul dan abstrak.
  - **Fitur "Why this result?" (`WhyResultModal`)**: Tombol inspeksi pada setiap kartu hasil yang membuka jendela dekonstruksi matematika lengkap:
    * **Grid Normalisasi 7 Kolom**: Menampilkan nilai panjang vektor kueri $\|q\|$, nilai panjang vektor dokumen $\|d\|$, dan penyebut perkalian norm $\|q\| \cdot \|d\|$.
    * **Tabel Kontribusi Term KaTeX**: Menguraikan setiap kata kueri yang cocok, nilai $TF_{query}$, $TF_{doc}$, $IDF$, perkalian bobot $W_q \cdot W_d$, dan persentase kontribusi akhirnya terhadap skor total kosinus.

---

### 3.4. Fitur 4: Manajemen Dataset Dinamis & Antarmuka Interaktif Pengguna (UI/UX)
* **Permintaan Dosen**: Aplikasi tidak boleh hanya menggunakan dataset statis yang ditanam (*hardcoded*). Pengguna harus dapat mengimpor dataset baru (berformat CSV), sistem harus mampu menangani dataset kosong, menyediakan opsi penghapusan dataset, serta antarmuka harus mudah digunakan dan responsif.
* **Implementasi Kode**:
  - `src/utils/csv.js`: Parser CSV standar RFC 4180 yang menangani pemisah koma atau titik koma, tanda kutip ganda bertingkat, karakter baris baru (*multiline values*), dan pencocokan kolom cerdas (*auto-mapping* kolom ID, Judul, Isi/Abstrak, Kategori, URL).
  - `src/utils/storage.js`: Adapter penyimpanan asinkron **IndexedDB** (`STKI_ATLAS_STORE`) untuk menyimpan dokumen korpus berkapasitas besar tanpa batas 5MB seperti LocalStorage.
  - `src/components/SearchTab.jsx`: Pengelolaan state visual kosong, peringatan tanpa dataset, dan algoritma ekstraksi kueri rekomendasi dinamis.
* **Implementasi Antarmuka Web**:
  - **Drag & Drop CSV Global**: Pengguna dapat menarik berkas CSV langsung dari File Explorer Windows ke bagian mana pun di layar web, memunculkan modal pratinjau pemetaan kolom.
  - **Kartu Panduan Dataset Kosong (`.empty-dataset-card`)**: Jika dataset dihapus atau belum dimuat, sistem menampilkan panduan interaktif 3-langkah bertema Butter & Forest untuk memandu pengguna.
  - **Peringatan Pencarian Tanpa Dataset**: Jika pengguna menekan tombol Cari saat korpus kosong, sistem menampilkan banner peringatan bergaris terrakota dengan animasi getar Animate.css `headShake` dan tombol jalan pintas impor.
  - **Dialog Konfirmasi Hapus Dataset (`ConfirmDeleteModal`)**: Dialog kustom berbasis React dengan tema konsisten (bukan alert native browser) yang mendukung interaksi tombol keyboard `Escape` untuk batal dan `Enter` untuk konfirmasi.
  - **Kueri Rekomendasi Dinamis**: Mengidentifikasi kategori unik dan n-gram (bigram/trigram) berfrekuensi tinggi dari korpus aktif, menyajikan 5 chip saran pencarian yang dapat dirotasi secara instan (*shuffle button*).
  - **Shortcut Keyboard Cepat**: Menekan tombol `/` pada keyboard akan memfokuskan kursor secara instan ke bilah pencarian.
  - **Kemudahan Eksekusi Web**: Aplikasi dapat dibuka langsung cukup dengan mengklik ganda berkas peluncur `buka-atlas.bat` tanpa konfigurasi terminal manual.

---

## 4. Hasil Pengujian & Evaluasi Kinerja Sistem

Pengujian otomatis dijalankan secara berkala pada korpus tugas akhir (1.000 dokumen, 8 kategori) dengan hasil sebagai berikut:

### 4.1. Hasil Uji Pengambilan Informasi (Information Retrieval Test)

| No | Kueri Uji | Bahasa Terdeteksi | Token Hasil Stemming | Jumlah Dokumen Ditemukan | Waktu Pencarian | Dokumen Peringkat 1 (Top Match) | Skor Cosine |
|---|---|:---:|---|:---:|:---:|---|:---:|
| 1 | `Intelligent Tutoring System` | English (`[en]`) | `intelligent`, `tutor`, `system` | 65 dokumen | 0.59 ms | #474 — *Intelligent Tutoring Systems In Education* | **0.594** |
| 2 | `gamifikasi pembelajaran` | Indonesia (`[id]`) | `gamifikasi`, `ajar` | 591 dokumen | 0.95 ms | #287 — *Efektivitas Multimedia Pembelajaran Gamifikasi...* | **0.399** |
| 3 | `AI chatbot virtual tutor` | Indonesia (`[id]`) | `ai`, `chatbot`, `virtual`, `tutor` | 139 dokumen | 0.39 ms | #453 — *Chatbot AI, Pembelajaran Digital, Asisten Virtual* | **0.439** |
| 4 | `jaringan komputer SMK` | Indonesia (`[id]`) | `jaringan`, `komputer`, `smk` | 289 dokumen | 0.39 ms | #580 — *Pelatihan dasar jaringan komputer untuk siswa...* | **0.518** |
| 5 | `game-based learning` | English (`[en]`) | `game`, `base`, `learn` | 210 dokumen | 0.27 ms | #306 — *Pengembangan Multimedia Interaktif Game-Based...* | **0.486** |

### 4.2. Metrik Efisiensi Komputasi
* **Ukuran Korpus**: 1.000 dokumen referensi ilmiah lengkap dengan abstrak dan tautan.
* **Jumlah Kosakata Unik (Vocabulary)**: 2.527 term terindeks.
* **Komposisi Bahasa**: 808 dokumen Bahasa Indonesia, 192 dokumen Bahasa Inggris.
* **Waktu Indexing Inverted Index**: **97.89 milidetik**.
* **Rata-rata Waktu Pencarian (Query Latency)**: **0.51 milidetik** per kueri.
* **Keberhasilan Pengujian Unit (Unit Test)**: **100% Lulus (Assertion Passed)** via `tests/engine.test.js`.

---

## 5. Struktur Berkas Repositori

Letak berkas laporan progress ini diatur di direktori utama `atlas/LAPORAN_PROGRESS.md` agar berdampingan langsung dengan seluruh arsitektur dan dokumentasi teknis sistem:

```
ATLAS_V3.8.3/
├── atlas/
│   ├── LAPORAN_PROGRESS.md        <-- DOKUMEN LAPORAN PROGRESS UTAMA (BERKAS INI)
│   ├── ARCHITECTURE.md            <-- Dokumentasi Arsitektur Sistem Lengkap (Terbarui)
│   ├── LOGS.md                    <-- Catatan Historis Lengkap dari v2.6 s.d. v3.8.3
│   ├── WHITE_BOX.md               <-- Laporan Pengujian White-Box Data Flow & Basis Path
│   ├── index.html                 <-- Titik Masuk Aplikasi & Pemuatan Skrip Klien
│   ├── buka-atlas.bat             <-- Peluncur Sekali-Klik Windows
│   ├── package.json               <-- Konfigurasi Proyek & Perintah Uji (npm test)
│   ├── assets/
│   │   ├── css/theme.css          <-- Desain Tema Butter & Forest, Tooltip, KaTeX CSS
│   │   └── brand/                 <-- Aset Logo Resmi SVG & Brand Board
│   ├── dataset/                   <-- Dataset 1.000 Dokumen CSV Praktikum UTS
│   ├── samples/                   <-- Berkas Contoh Dataset CSV Alternatif
│   ├── scripts/
│   │   ├── serve.js               <-- Server Lokal Statis Standar Node.js
│   │   └── vendor-sastrawijs.js   <-- Penyalin Pustaka SastrawiJs UMD
│   ├── tests/
│   │   └── engine.test.js         <-- Pengujian Otomatis Mesin VSM & Cosine Similarity
│   └── src/
│       ├── namespace.js           <-- Deklarasi Namespace Global (window.ATLAS)
│       ├── config/                <-- Konfigurasi Token Warna & Tailwind
│       ├── nlp/                   <-- MODUL FITUR 1: Pipeline, Normalisasi, Stopwords, Stemmer
│       ├── engine/                <-- MODUL FITUR 2 & 3: VSMEngine, Inverted Index, TF-IDF
│       ├── utils/                 <-- MODUL FITUR 4: Parser CSV RFC 4180 & IndexedDB
│       └── components/            <-- Antarmuka React: SearchTab, Preprocessing, Modals, KaTeX
└── .git/                          <-- Repositori Git Bersih untuk Pengumpulan GitHub
```

---
*Laporan Progres Resmi ini disusun pada tanggal 21 Oktober 2026 untuk memenuhi syarat evaluasi Ujian Tengah Semester (UTS) mata kuliah Sistem Temu Kembali Informasi.*
