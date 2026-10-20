/* PreprocessingInspectorComponent — Interactive Inline Pipeline + Token Trace */
(function () {
const { useState, useEffect, useMemo, useRef, useCallback } = React;
const { preprocessTextWithPipeline } = ATLAS.nlp;
const Icon = ATLAS.components.Icon || function() { return null; };
/* Portal: render ke document.body agar terhindar dari overflow-clip container */
function Portal({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
  if (!mounted) return null;
  return ReactDOM.createPortal(children, document.body);
}

/* ─── Data pipeline steps dengan ikon SVG bertema dan penjelasan ringkas ─── */
const PIPELINE_STEPS = [
  {
    id: 'raw',
    label: 'Teks Asli',
    sub: 'Raw Input',
    iconName: 'file-text',
    color: '#5F7266',
    softBg: 'rgba(95,114,102,0.12)',
    description: 'Teks mentah sebelum melalui transformasi NLP. Memuat huruf kapital, angka, tanda baca, dan format asli kalimat.',
    detail: 'Menjadi input dasar string sebelum dibersihkan dan dipecah ke dalam unit-unit term penentu.',
    ref: 'Salton & McGill (1983). Introduction to Modern IR. McGraw-Hill.',
  },
  {
    id: 'casefold',
    label: 'Case Folding',
    sub: '& Cleaning',
    iconName: 'type',
    color: '#4A7C9E',
    softBg: 'rgba(74,124,158,0.12)',
    description: 'Mengubah semua karakter menjadi huruf kecil (lowercase), serta membersihkan angka dan tanda baca non-alfabet.',
    detail: 'Menormalkan kata majemuk (e-learning → elearning, wi-fi → wifi) agar term yang sama tidak dibedakan kapitalisasinya.',
    ref: 'Manning, Raghavan, & Schütze (2008). Introduction to IR. Cambridge Univ. Press.',
  },
  {
    id: 'tokenize',
    label: 'Tokenisasi',
    sub: 'Tokenization',
    iconName: 'scissors',
    color: '#9E7B38',
    softBg: 'rgba(158,123,56,0.12)',
    description: 'Memecah deretan teks menjadi unit-unit kata individual (token) berdasarkan spasi dan tanda pemisah kata.',
    detail: 'Token pendek (< 2 karakter) langsung dieliminasi agar tidak mencemari ruang dimensi vektor.',
    ref: 'Webster & Kit (1992). Tokenization in NLP; Salton (1983).',
  },
  {
    id: 'stopword',
    label: 'Stopword Removal',
    sub: 'Filtering',
    iconName: 'filter',
    color: '#C45D3E',
    softBg: 'rgba(196,93,62,0.12)',
    description: 'Mengeliminasi kata tugas umum (dan, yang, di, the, of) yang tidak memiliki signifikansi diskriminatif.',
    detail: 'Kamus bilingual ID (320+ kata) & EN (300+ kata), dengan proteksi istilah domain (gamifikasi, router, ai, tutor).',
    ref: 'Luhn (1958). The Automatic Creation of Literature Abstracts; Tala (2003).',
  },
  {
    id: 'stemming',
    label: 'Stemming',
    sub: 'Root Extraction',
    iconName: 'sprout',
    color: '#37664B',
    softBg: 'rgba(55,102,75,0.14)',
    description: 'Mereduksi kata berimbuhan ke bentuk akarnya (root word) sehingga variasi morfologi dipetakan ke term yang sama.',
    detail: 'ID: SastrawiJs (Nazief-Adriani + Confix Stripping). EN: KStem (Krovetz). Dilengkapi kamus koreksi kata rusak.',
    ref: 'Adriani et al. (2007) [ID]; Krovetz (1993) [EN].',
  },
];

/* ─── Token status legend data ─── */
const TOKEN_STATUS_LEGEND = [
  {
    status: 'removed',
    colorClass: 'bg-rose-500/10 text-rose-600 border border-rose-500/30',
    dotColor: '#ef4444',
    label: 'Removed (Dihapus)',
    description: 'Token dihapus karena tergolong stopword atau terlalu pendek (< 2 huruf). Token ini tidak masuk ke indeks VSM.',
    stage: 'Tahap 2: Stopword Removal',
    stageColor: '#B05A3A',
  },
  {
    status: 'stemmed',
    colorClass: 'bg-amber-500/10 text-amber-600 border border-amber-500/30',
    dotColor: '#f59e0b',
    label: 'Stemmed (Diubah ke Akar)',
    description: 'Imbuhan dipangkas ke bentuk akar. Term yang masuk ke indeks VSM adalah kata dasar hasil stemming.',
    stage: 'Tahap 3: Stemming (Root Extraction)',
    stageColor: '#7C6F3E',
  },
  {
    status: 'preserved',
    colorClass: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30',
    dotColor: '#10b981',
    label: 'Preserved (Dipertahankan)',
    description: 'Token dipertahankan apa adanya karena sudah merupakan kata dasar atau istilah teknis yang dilindungi.',
    stage: 'Tahap 3: Protected / Base Term',
    stageColor: '#37664B',
  },
];

/* ─── Tooltip floating component dengan rasio terukur & proteksi offside ─── */
function StepTooltip({ step, visible, anchorRef }) {
  const tooltipRef = useRef(null);
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!visible || !anchorRef?.current) {
      setPos(null);
      return;
    }

    const calcPos = () => {
      if (!anchorRef.current) return;
      const anchor = anchorRef.current.getBoundingClientRect();
      const tooltipEl = tooltipRef.current;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const pad = 12;

      // Estimasi dimensi terukur
      const tooltipW = tooltipEl ? tooltipEl.offsetWidth : 295;
      const tooltipH = tooltipEl ? tooltipEl.offsetHeight : 210;

      // 1. Horizontal: Pusatkan pada anchor, pastikan tidak keluar batas layar
      let left = anchor.left + (anchor.width / 2) - (tooltipW / 2);
      if (left < pad) left = pad;
      if (left + tooltipW > vw - pad) {
        left = vw - pad - tooltipW;
      }

      // 2. Vertical: Tentukan penempatan di bawah vs di atas
      const spaceBelow = vh - anchor.bottom - 10;
      const spaceAbove = anchor.top - 10;
      let placeBelow = true;

      if (spaceBelow >= tooltipH) {
        placeBelow = true;
      } else if (spaceAbove >= tooltipH) {
        placeBelow = false;
      } else {
        placeBelow = spaceBelow >= spaceAbove;
      }

      let top = placeBelow ? (anchor.bottom + 8) : (anchor.top - tooltipH - 8);
      if (top < pad) top = pad;
      if (top + tooltipH > vh - pad) {
        top = Math.max(pad, vh - pad - tooltipH);
      }

      // Posisi panah segitiga relatif terhadap tooltip
      const arrowX = Math.max(14, Math.min(tooltipW - 14, anchor.left + (anchor.width / 2) - left));

      setPos({ top, left, arrowX, placeBelow });
    };

    const rafId = requestAnimationFrame(calcPos);
    window.addEventListener('scroll', calcPos, true);
    window.addEventListener('resize', calcPos);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', calcPos, true);
      window.removeEventListener('resize', calcPos);
    };
  }, [visible, anchorRef]);

  if (!visible) return null;

  return (
    <div
      ref={tooltipRef}
      className="pipeline-tooltip"
      style={{
        position: 'fixed',
        top: pos ? `${pos.top}px` : '-9999px',
        left: pos ? `${pos.left}px` : '-9999px',
        opacity: pos ? 1 : 0,
        zIndex: 9999,
        pointerEvents: 'none',
        transition: 'opacity 0.14s ease',
        '--tooltip-accent': step.color,
      }}
    >
      {/* Panah segitiga dinamis (atas/bawah sesuai penempatan) */}
      {pos && (
        <div
          className={pos.placeBelow ? 'pipeline-tooltip-arrow-top' : 'pipeline-tooltip-arrow-bottom'}
          style={{ left: `${pos.arrowX}px` }}
        />
      )}

      {/* Header berbobot warna tahapan dengan ikon SVG bertema */}
      <div className="pipeline-tooltip-header" style={{ background: step.color }}>
        <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.22)' }}>
          <Icon name={step.iconName} className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <div className="pipeline-tooltip-title">{step.label}</div>
          <div className="pipeline-tooltip-sub">{step.sub}</div>
        </div>
      </div>

      {/* Konten penjelasan seimbang */}
      <div className="pipeline-tooltip-body">
        <p className="pipeline-tooltip-desc">{step.description}</p>
        <p className="pipeline-tooltip-detail">{step.detail}</p>
        <div className="pipeline-tooltip-ref">
          <Icon name="book-open" className="w-3.5 h-3.5 shrink-0 mt-0.5 text-forest" />
          <span>{step.ref}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Tombol interaktif untuk setiap langkah pada teks alur (tanpa title default) ─── */
function PipelineStepInline({ step }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={ref}
        type="button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="pipeline-inline-step"
        style={{
          borderColor: hovered ? step.color : '#DDD5B8',
          background: hovered ? step.softBg : 'rgba(255, 253, 246, 0.85)',
          color: hovered ? step.color : '#263B31',
        }}
      >
        <Icon name={step.iconName} className="w-3.5 h-3.5 shrink-0" style={{ color: step.color }} />
        <span>{step.label}</span>
      </button>
      <StepTooltip step={step} visible={hovered} anchorRef={ref} />
    </span>
  );
}

/* ─── Komponen Alur Teks Interaktif ─── */
function InteractivePipelineFlow() {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
      {PIPELINE_STEPS.map((step, idx) => (
        <React.Fragment key={step.id}>
          <PipelineStepInline step={step} />
          {idx < PIPELINE_STEPS.length - 1 && (
            <span className="select-none font-bold text-xs" style={{ color: '#CFC59B' }}>
              →
            </span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
}

/* ─── Token badge — Portal-based tooltip, bebas overflow-clip & flicker ─── */
function TokenBadge({ item }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);
  const leaveTimer = useRef(null);
  const legendData = TOKEN_STATUS_LEGEND.find(l => l.status === item.status) || TOKEN_STATUS_LEGEND[2];

  const calcPos = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = 268;
    const h = 180;

    let left = r.left + r.width / 2 - w / 2;
    if (left < 10) left = 10;
    if (left + w > vw - 10) left = vw - 10 - w;

    /* Utamakan tampil di atas badge */
    let top = r.top - h - 10;
    let placeBelow = false;
    if (top < 10) { top = r.bottom + 10; placeBelow = true; }
    if (top + h > vh - 10) top = Math.max(10, vh - 10 - h);

    const arrowX = Math.max(14, Math.min(w - 14, r.left + r.width / 2 - left));
    return { top, left, arrowX, placeBelow };
  }, []);

  const handleEnter = useCallback(() => {
    if (leaveTimer.current) { clearTimeout(leaveTimer.current); leaveTimer.current = null; }
    setPos(calcPos());
  }, [calcPos]);

  const handleLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => setPos(null), 80);
  }, []);

  /* Hapus tooltip saat scroll agar tidak melayang */
  useEffect(() => {
    const onScroll = () => setPos(null);
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, []);

  useEffect(() => () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); }, []);

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className={`px-2 py-1 rounded text-xs font-mono flex items-center gap-1 cursor-help transition-all hover:scale-105 select-none ${
          item.status === 'removed'
            ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30 line-through'
            : item.status === 'stemmed'
            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
            : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
        }`}
      >
        <span>{item.token}</span>
        {item.stemmed && item.token !== item.stemmed && (
          <span className="text-[10px] opacity-75">→ {item.stemmed}</span>
        )}
      </span>

      {/* Portal: dikirim ke document.body agar bebas dari overflow-clip */}
      {pos && (
        <Portal>
          <div
            className="token-legend-tooltip"
            style={{
              position: 'fixed',
              top: `${pos.top}px`,
              left: `${pos.left}px`,
              zIndex: 99999,
              pointerEvents: 'none',
              animation: 'tokenTipIn 0.13s ease',
            }}
          >
            {/* Panah segitiga mini */}
            <div
              style={{
                position: 'absolute',
                [pos.placeBelow ? 'top' : 'bottom']: '-6px',
                left: `${pos.arrowX}px`,
                width: '12px',
                height: '6px',
                transform: 'translateX(-50%)',
                clipPath: pos.placeBelow
                  ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                  : 'polygon(0% 0%, 100% 0%, 50% 100%)',
                background: pos.placeBelow ? legendData.dotColor : '#FFFDF6',
              }}
            />

            <div className="token-legend-header" style={{ background: legendData.dotColor }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.02em' }}>
                {legendData.label}
              </span>
            </div>

            <div className="token-legend-body">
              {/* Visualisasi perubahan kata */}
              <div className="p-1.5 rounded bg-warmPaper/40 border border-subtleBorder/50 font-mono text-[11px] flex items-center gap-1.5">
                {item.status === 'stemmed' ? (
                  <>
                    <span className="line-through text-mutedText">{item.token}</span>
                    <span className="text-amber-600 font-bold">→ {item.stemmed}</span>
                  </>
                ) : item.status === 'removed' ? (
                  <span className="text-rose-600 line-through font-bold">{item.token} (dieliminasi)</span>
                ) : (
                  <span className="text-emerald-700 font-bold">{item.token} (term aktif)</span>
                )}
              </div>

              <p className="token-legend-desc">{legendData.description}</p>

              <div className="token-legend-stage" style={{ color: legendData.stageColor }}>
                {legendData.stage}
              </div>

              {item.reason && (
                <div className="token-legend-reason">
                  ↳ Alasan: <em>{item.reason}</em>
                </div>
              )}
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}

function PreprocessingInspectorComponent({ defaultText }) {
  const [text, setText] = useState(defaultText);
  const [langMode, setLangMode] = useState('auto');
  const pipeline = useMemo(() => preprocessTextWithPipeline(text, langMode === 'auto' ? undefined : langMode), [text, langMode]);

  return (
    <div className="space-y-6">
      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-4">
          <label className="block text-xs font-mono text-mutedText">Masukkan Teks Uji Coba:</label>
          <textarea
            rows="6"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-archive border border-subtleBorder rounded-xl p-3 text-xs text-warmPaper focus:border-accent focus:outline-none font-sans"
            placeholder="Ketik kalimat Bahasa Indonesia atau English..."
          />
          <select value={langMode} onChange={(e) => setLangMode(e.target.value)}
            className="w-full bg-archive border border-subtleBorder rounded-lg p-2 text-xs font-mono text-warmPaper">
            <option value="auto">Bahasa: Auto (terdeteksi {pipeline.lang.toUpperCase()})</option>
            <option value="id">Bahasa: Indonesia</option>
            <option value="en">Bahasa: English</option>
          </select>
          <p className="text-[11px] text-mutedText">
            Stemmer aktif: <strong className="text-warmPaper">{pipeline.lang === 'en' ? 'KStem (Krovetz)' : 'SastrawiJs'}</strong>
            {pipeline.lang === 'en' ? ' — kata yang sudah ada di kamus dibiarkan utuh' : ' (kata asing dilanjutkan ke KStem)'}
          </p>
          <div className="p-3 bg-archive rounded-xl border border-subtleBorder space-y-2 text-xs font-mono">
            <div className="flex justify-between text-mutedText">
              <span>Total Karakter:</span>
              <span className="text-warmPaper">{text.length}</span>
            </div>
            <div className="flex justify-between text-mutedText">
              <span>Token Awal:</span>
              <span className="text-warmPaper">{pipeline.tokens.length}</span>
            </div>
            <div className="flex justify-between text-mutedText">
              <span>Token Setelah Preprocessing:</span>
              <span className="accent-text font-bold">{pipeline.stemmedTokens.length}</span>
            </div>
          </div>
        </div>

        {/* Steps Output */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-warmPaper font-mono uppercase">Langkah Transformed Pipeline</h3>

          <div className="space-y-3">
            {/* Step 1: Case Folding */}
            <div className="p-3 bg-archive rounded-lg border border-subtleBorder space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-mutedText uppercase mb-1">
                <span className="w-4 h-4 rounded text-center leading-4 text-white text-[9px] font-bold" style={{ background: '#4A7C9E' }}>1</span>
                Case Folding &amp; Cleaning
              </div>
              <p className="text-xs font-mono accent-text">{pipeline.caseFolded || '-'}</p>
            </div>

            {/* Step 2: Filtering & Stemming Trace */}
            <div className="p-3 bg-archive rounded-lg border border-subtleBorder space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-mutedText uppercase">
                <span className="w-4 h-4 rounded text-center leading-4 text-white text-[9px] font-bold" style={{ background: '#C45D3E' }}>2</span>
                Filtering &amp; Stemming Trace
              </div>

              {/* Token Trace List (Token bar keterangan dihapus sesuai permintaan) */}
              <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto pt-1">
                {pipeline.trace.map((item, i) => (
                  <TokenBadge key={i} item={item} i={i} />
                ))}
              </div>
            </div>

            {/* Step 3: Final Tokens */}
            <div className="p-3 bg-archive rounded-lg border border-subtleBorder space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-mutedText uppercase mb-1">
                <span className="w-4 h-4 rounded text-center leading-4 text-white text-[9px] font-bold" style={{ background: '#37664B' }}>3</span>
                Final Stemmed Tokens Array
              </div>
              <div className="flex flex-wrap gap-1">
                {pipeline.stemmedTokens.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded text-xs font-mono font-bold accent-bg">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ATLAS.components.PreprocessingInspectorComponent = PreprocessingInspectorComponent;
ATLAS.components.InteractivePipelineFlow = InteractivePipelineFlow;
})();
