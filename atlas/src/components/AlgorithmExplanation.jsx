/* AlgorithmExplanationComponent — Visual math formulas via KaTeX */
(function () {
const { useState, useEffect, useRef } = React;

/* Helper: render KaTeX ke dalam sebuah <span> */
function KatexFormula({ latex, block = true }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const tryRender = () => {
      if (typeof window.katex !== 'undefined') {
        try {
          window.katex.render(latex, ref.current, {
            throwOnError: false,
            displayMode: block,
            output: 'html',
          });
        } catch (e) {
          ref.current.textContent = latex;
        }
      } else {
        /* KaTeX belum siap — coba lagi setelah 200ms */
        setTimeout(tryRender, 200);
      }
    };
    tryRender();
  }, [latex, block]);

  return (
    <span
      ref={ref}
      className={block ? 'katex-display-wrap' : 'katex-inline-wrap'}
    />
  );
}

    function AlgorithmExplanationComponent() {
      return (
        <div className="space-y-6 text-sm text-mutedText leading-relaxed">

          {/* ── 1. Term Frequency ── */}
          <section className="p-5 bg-archive rounded-xl border border-subtleBorder space-y-3">
            <h3 className="text-lg font-bold text-warmPaper flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              1. Term Frequency (TF)
            </h3>
            <p>
              Mengukur seberapa sering sebuah kata muncul di dalam dokumen tertentu
              relatif terhadap total token dokumen.
            </p>
            {/* Visual formula */}
            <div className="formula-block">
              <span className="formula-label">Eq. 1 — TF</span>
              <KatexFormula latex={"\\text{TF}(t,\\, d) \\;=\\; \\dfrac{f(t,\\, d)}{|d|}"} block={true} />
            </div>
            <p className="text-xs text-mutedText pt-1">
              di mana <span className="formula-block-inline">f(t,d)</span> = frekuensi kemunculan term{" "}
              <span className="formula-block-inline">t</span> dalam dokumen{" "}
              <span className="formula-block-inline">d</span>, dan{" "}
              <span className="formula-block-inline">|d|</span> = total token dalam{" "}
              <span className="formula-block-inline">d</span>.
            </p>
          </section>

          {/* ── 2. IDF Smooth ── */}
          <section className="p-5 bg-archive rounded-xl border border-subtleBorder space-y-3">
            <h3 className="text-lg font-bold text-warmPaper flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              2. Inverse Document Frequency (IDF) Smooth
            </h3>
            <p>
              Memberikan bobot lebih tinggi pada kata yang langka di dalam seluruh
              koleksi dokumen (N) dan meredam kata yang terlalu sering muncul.
            </p>
            <div className="formula-block">
              <span className="formula-label">Eq. 2 — IDF Smooth</span>
              <KatexFormula latex={"\\text{IDF}(t) \\;=\\; \\ln\\!\\left(\\dfrac{N + 1}{\\text{DF}(t) + 1}\\right) + 1"} block={true} />
            </div>
            <p className="text-xs text-mutedText pt-1">
              di mana <span className="formula-block-inline">N</span> = total dokumen dalam koleksi, dan{" "}
              <span className="formula-block-inline">DF(t)</span> = jumlah dokumen yang mengandung term{" "}
              <span className="formula-block-inline">t</span>.
            </p>
          </section>

          {/* ── 3. TF-IDF Weight ── */}
          <section className="p-5 bg-archive rounded-xl border border-subtleBorder space-y-3">
            <h3 className="text-lg font-bold text-warmPaper flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              3. Bobot TF-IDF
            </h3>
            <p>
              Skor akhir bobot sebuah term dalam vektor dokumen atau kueri diperoleh
              dari perkalian nilai TF dan IDF.
            </p>
            <div className="formula-block">
              <span className="formula-label">Eq. 3 — TF-IDF</span>
              <KatexFormula latex={"w(t,\\,d) \\;=\\; \\text{TF}(t,\\,d) \\;\\times\\; \\text{IDF}(t)"} block={true} />
            </div>
          </section>

          {/* ── 4. Cosine Similarity ── */}
          <section className="p-5 bg-archive rounded-xl border border-subtleBorder space-y-3">
            <h3 className="text-lg font-bold text-warmPaper flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              4. Vector Space Model &amp; Cosine Similarity
            </h3>
            <p>
              Merepresentasikan kueri <span className="formula-block-inline">q</span> dan dokumen{" "}
              <span className="formula-block-inline">d</span> sebagai vektor dalam ruang
              multidimensi. Kemiripan diukur dari kosinus sudut antara kedua vektor.
            </p>
            <div className="formula-block">
              <span className="formula-label">Eq. 4 — Cosine Similarity</span>
              <KatexFormula latex={"\\text{Cosine}(q,\\,d) \\;=\\; \\dfrac{q \\cdot d}{\\|q\\|\\,\\|d\\|} \\;=\\; \\dfrac{\\displaystyle\\sum_{t} q_t \\cdot d_t}{\\|q\\|\\,\\|d\\|}"} block={true} />
            </div>
            <p className="text-xs text-mutedText pt-1">
              di mana <span className="formula-block-inline">q_t</span> dan{" "}
              <span className="formula-block-inline">d_t</span> adalah bobot TF-IDF term
              dalam vektor kueri dan dokumen, serta{" "}
              <span className="formula-block-inline">‖q‖</span>,{" "}
              <span className="formula-block-inline">‖d‖</span> adalah norma Euclidean masing-masing vektor.
            </p>
          </section>

          {/* ── 5. Euclidean Norm ── */}
          <section className="p-5 bg-archive rounded-xl border border-subtleBorder space-y-3">
            <h3 className="text-lg font-bold text-warmPaper flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              5. Norma Euclidean Vektor
            </h3>
            <p>
              Panjang (magnitude) sebuah vektor bobot TF-IDF dihitung sebagai akar
              kuadrat dari jumlah kuadrat seluruh komponennya.
            </p>
            <div className="formula-block">
              <span className="formula-label">Eq. 5 — Euclidean Norm</span>
              <KatexFormula latex={"\\|v\\| \\;=\\; \\sqrt{\\,\\sum_{t} v_t^{\\,2}}"} block={true} />
            </div>
          </section>

        </div>
      );
    }

ATLAS.components.AlgorithmExplanationComponent = AlgorithmExplanationComponent;
})();
