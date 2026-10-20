/* Logo ATLAS (huruf A + orbit + bintang kompas), warna mengikuti palet Butter & Forest */
(function () {
  const TONES = {
    light: { a: ['#5E9C79', '#37664B'], o: ['#C45D3E', '#E08A6D'], star: '#C45D3E', word: '#263B31', tag: '#5F7266' },
    dark:  { a: ['#BBD9C6', '#6FA886'], o: ['#E08A6D', '#F2B49C'], star: '#EBD58A', word: '#FAF4DF', tag: '#EBD58A' }
  };

  function LogoMark({ size = 36, tone = 'light', uid = 'lm' }) {
    const c = TONES[tone] || TONES.light;
    const orbit = (d) => <g transform="rotate(-24 60 66)"><path d={d} fill="none" stroke={`url(#${uid}o)`} strokeWidth="6" strokeLinecap="round" /></g>;
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <linearGradient id={uid + 'a'} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={c.a[0]} /><stop offset="1" stopColor={c.a[1]} /></linearGradient>
          <linearGradient id={uid + 'o'} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={c.o[0]} /><stop offset="1" stopColor={c.o[1]} /></linearGradient>
        </defs>
        {orbit("M6 66 A54 15 0 0 1 114 66")}
        <path d="M60 6 L104 112 H82 L60 58 L38 112 H16 Z" fill={`url(#${uid}a)`} />
        {orbit("M6 66 A54 15 0 0 0 114 66")}
        <path d="M60 68 L64.5 80 L76 84 L64.5 88 L60 100 L55.5 88 L44 84 L55.5 80 Z" fill={c.star} />
      </svg>
    );
  }

  // tone="light": untuk latar krem/putih; tone="dark": untuk latar hijau tua
  function Logo({ tone = 'light', size = 38, tagline = true }) {
    const c = TONES[tone] || TONES.light;
    return (
      <div className="flex items-center gap-3">
        <LogoMark size={size} tone={tone} uid={'lg' + tone} />
        <div className="leading-none">
          <div className="font-extrabold text-xl" style={{ letterSpacing: '0.28em', color: c.word }}>ATLAS</div>
          {tagline && (
            <div className="hidden sm:block text-[10px] mt-1.5 tracking-wide" style={{ color: c.tag }}>
              Search · Understand · Explore
            </div>
          )}
        </div>
      </div>
    );
  }

  ATLAS.components.LogoMark = LogoMark;
  ATLAS.components.Logo = Logo;
})();
