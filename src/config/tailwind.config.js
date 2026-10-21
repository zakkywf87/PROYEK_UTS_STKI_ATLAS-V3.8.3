/* Konfigurasi Tailwind: palet "Butter & Forest" (tema hangat, editorial) */
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: '#263B31',        // Text (hijau tua) juga dipakai untuk garis & overlay
        terracotta: '#C45D3E',    // Accent (penekanan: skor, label, kata sorot)
        butter: '#EBD58A',        // Highlight turunan dari Butter (penanda, tepi)
        ink: '#FAF4DF',          // Background
        archive: '#FFFDF6',      // Surface (kartu)
        archiveLight: '#F3EBCF', // permukaan sekunder
        warmPaper: '#263B31',    // warna teks utama
        mutedText: '#5F7266',
        subtleBorder: '#DDD5B8',
        accent: 'var(--accent-color, #37664B)',   // Primary (aksi utama, tab aktif)
        accentText: 'var(--accent-text, #FFFFFF)'
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"Plus Jakarta Sans"', 'sans-serif']
      }
    }
  }
}
