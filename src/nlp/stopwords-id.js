/* Stopword Bahasa Indonesia yang Diperluas (Standar Tala + Korpus Akademik/TA)
   Catatan: Istilah domain bermakna (mis. 'sistem', 'gamifikasi', 'pembelajaran', 'jaringan', 'komputer', 'smk', 'tkj', 'tutor', 'ai') 
   sengaja dipertahankan dan TIDAK dijadikan stopword agar hasil pencarian tetap akurat. */
(function () {
  const INDONESIAN_STOPWORDS = new Set([
    // Kata tugas, konjungsi, dan preposisi dasar
    "ada", "adalah", "adanya", "adapun", "agak", "agaknya", "agar", "akan", "akankah", "akhir",
    "akhiri", "akhirnya", "aku", "akulah", "amat", "amatlah", "anda", "andalah", "antar",
    "antara", "antaralain", "antara lain", "apa", "apabila", "apakah", "apalagi", "artinya",
    "asal", "asalkan", "atas", "atau", "ataukah", "ataupun", "awal", "awalnya",
    "bagai", "bagaikan", "bagaimana", "bagaimanakah", "bagaimanapun", "bagi", "bagian",
    "bahkan", "bahwa", "bahwasanya", "baik", "bakal", "balik", "banyak", "bawah", "beberapa",
    "begini", "beginian", "begitu", "begitupun", "belum", "belakangan", "beliau", "bila",
    "bilamana", "bisa", "bisakah", "boleh", "bolehlah", "buat", "bukan", "bukankah", "bukanlah",
    // Kata sambung & penjelas
    "cukup", "cuma", "dahulu", "dalam", "dan", "dapat", "dari", "daripada", "dekat", "demi",
    "demikian", "demikianlah", "dengan", "depan", "di", "dia", "dialah", "diantara", "diantaranya",
    "dikarenakan", "dini", "diri", "dirinya", "disini", "disinilah", "dong", "dulu",
    "empat", "enggak", "gak", "guna", "hampir", "hanya", "harus", "harusnya", "hendak",
    "hendaknya", "hingga", "ia", "ialah", "ibarat", "ingin", "ini", "inikah", "inilah",
    "itu", "itukah", "itulah", "jadi", "jangan", "jangankan", "jauh", "jika", "jikalau",
    "juga", "justru", "kala", "kalau", "kalaulah", "kalaupun", "kalian", "kami", "kamu",
    "kapan", "kapankah", "kapanpun", "karena", "karenanya", "ke", "kebetulan", "kecuali",
    "kelak", "kembali", "kemudian", "kemungkinan", "kenapa", "kepada", "kepadanya",
    "ketika", "khususnya", "kini", "kira", "kiranya", "kita", "kitalah", "kurang",
    // Lanjutan Tala
    "lagi", "lagian", "lah", "lain", "lainnya", "lalu", "lama", "lamanya", "lanjut", "lanjutnya",
    "lebih", "lewat", "lima", "luar", "macam", "maka", "makanya", "makin", "malah", "malahan",
    "mana", "manakala", "manalagi", "masa", "masih", "masihkah", "masing", "masing-masing",
    "maupun", "melainkan", "melalui", "melihat", "memang", "mengenai", "menjadi", "menurut",
    "menurutnya", "menyatakan", "merasa", "mereka", "merekalah", "merupakan", "meski",
    "meskipun", "mirip", "misal", "misalkan", "misalnya", "mula", "mulai", "mulanya",
    "mungkin", "mungkinkah", "nah", "namun", "nanti", "nantinya", "nyaris", "nyatanya",
    "oleh", "oleh karena itu", "olehnya", "pada", "padahal", "padanya", "para", "pasti",
    "pastilah", "per", "pernah", "pula", "pun", "punya", "rasanya", "rupanya",
    "saat", "saatnya", "saja", "sajalah", "saling", "sama", "sama-sama", "sambil",
    "sampai", "sampai-sampai", "sana", "sangat", "sangatlah", "satu", "saya", "sayalah",
    "sebab", "sebabnya", "sebagai", "sebagaimana", "sebagaimanakah", "sebagian", "sebaik",
    "sebaiknya", "sebaliknya", "sebanyak", "sebelum", "sebelumnya", "sebenarnya", "seberapa",
    "sebuah", "secara", "sedang", "sedangkan", "sedemikian", "sedikit", "sedikitnya",
    "segera", "seharusnya", "sehingga", "sejak", "sejauh", "sejumlah", "sekadar",
    "sekali", "sekalian", "sekaligus", "sekalipun", "sekarang", "sekaranglah", "sekiranya",
    "sekitar", "sekitarnya", "sela", "selain", "selalu", "selama", "selamanya", "selanjutnya",
    "seluruh", "seluruhnya", "semacam", "semakin", "sementara", "semisal", "semisalnya",
    "sempat", "semua", "semuanya", "semula", "sendiri", "sendirinya", "seolah", "seolah-olah",
    "seorang", "sepanjang", "seperti", "sepertinya", "sering", "seringnya", "serta", "serupa",
    "sesaat", "sesama", "seseorang", "sesuatu", "sesuatunya", "sesudah", "sesudahnya",
    "setelah", "seterusnya", "setiap", "setidaknya", "seusai", "sewaktu", "siapa", "siapakah",
    "siapapun", "sini", "sinilah", "suatu", "sudah", "sudahkah", "sudahlah", "supaya",
    "tadi", "tadinya", "tak", "tanpa", "tapi", "telah", "tentang", "tentu", "tentulah",
    "tentunya", "tepat", "terhadap", "terhadapnya", "termasuk", "ternyata", "tersebut",
    "tersebutlah", "tertentu", "terus", "terutama", "tetap", "tetapi", "tiap", "tidak",
    "tidakkah", "tidaklah", "tiga", "turut", "untuk", "usai", "walau", "walaupun",
    "yaitu", "yakin", "yakni", "yang",
    // Singkatan bahasa Indonesia informal / teks ilmiah
    "yg", "dg", "dgn", "utk", "thd", "tsb", "dsb", "dll", "dst"
  ]);

  ATLAS.nlp.INDONESIAN_STOPWORDS = INDONESIAN_STOPWORDS;
})();
