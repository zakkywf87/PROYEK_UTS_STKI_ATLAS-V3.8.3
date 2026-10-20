/* Modal: "Why this result?", detail dokumen, import CSV + pemetaan kolom, confirm delete */
(function () {
const { useState, useEffect, useMemo, useRef, useCallback } = React;
const { Icon, CopyButton } = ATLAS.components;

/* ── KaTeX formula helper (sama seperti di AlgorithmExplanation) ── */
function KatexFormula({ latex, block = false }) {
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
        setTimeout(tryRender, 200);
      }
    };
    tryRender();
  }, [latex, block]);
  return <span ref={ref} />;
}

/* ── Custom Confirm Delete Dialog ── */
function ConfirmDeleteModal({ onConfirm, onCancel }) {
  /* Keyboard: Escape → cancel, Enter → confirm */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter')  onConfirm();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="atlas-confirm-overlay" onClick={onCancel}>
      <div className="atlas-confirm-box" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="atlas-confirm-header">
          <div className="atlas-confirm-header-icon">
            <Icon name="trash-2" className="w-5 h-5" style={{ color: '#C45D3E' }} />
          </div>
          <h4>Hapus Dataset Saat Ini?</h4>
        </div>

        {/* Body */}
        <div className="atlas-confirm-body">
          <p>
            Anda akan menghapus <strong>dataset yang sedang dimuat</strong> dari memori
            browser dan mengosongkan seluruh indeks pencarian.
          </p>
          <div className="atlas-confirm-warning">
            <Icon name="alert-triangle" className="w-3.5 h-3.5 shrink-0" />
            <span>Tindakan ini tidak dapat dibatalkan. Dataset perlu diimpor ulang.</span>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="atlas-confirm-footer">
          <button className="atlas-confirm-btn-cancel" onClick={onCancel}>
            Batal
          </button>
          <button className="atlas-confirm-btn-danger" onClick={onConfirm}>
            <Icon name="trash-2" className="w-3.5 h-3.5" />
            Ya, Hapus Dataset
          </button>
        </div>

      </div>
    </div>
  );
}

function Modals({ selectedWhyResult, setSelectedWhyResult, selectedDocDetail, setSelectedDocDetail, showUploadModal, setShowUploadModal, csvUploadError, csvRawData, setCsvRawData, handleCsvFileSelect, columnMapping, setColumnMapping, handleConfirmCsvImport,
  /* confirm delete props */
  showConfirmDelete, onConfirmDelete, onCancelDelete
}) {
  return (
    <>
          {/* ── Custom Confirm Delete ── */}
          {showConfirmDelete && (
            <ConfirmDeleteModal onConfirm={onConfirmDelete} onCancel={onCancelDelete} />
          )}

          {selectedWhyResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/60 backdrop-blur-sm animate-fadeIn">
              <div className="bg-archive border border-subtleBorder rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative">
                
                <button
                  onClick={() => setSelectedWhyResult(null)}
                  className="absolute top-4 right-4 text-mutedText hover:text-warmPaper p-1 rounded-lg bg-archiveLight"
                >
                  <Icon name="x" className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="border-b border-subtleBorder pb-3">
                  <div className="inline-block px-2 py-0.5 rounded text-[10px] font-mono accent-bg font-bold mb-1">
                    MATHEMATICAL BREAKDOWN
                  </div>
                  <h3 className="text-lg font-bold text-warmPaper">
                    Mengapa dokumen "{selectedWhyResult.document.title}" relevan?
                  </h3>
                  <p className="text-xs text-mutedText font-mono">
                    ID: {selectedWhyResult.document.id} | Total Cosine Score:{" "}
                    <strong className="accent-text text-sm">{selectedWhyResult.score.toFixed(6)}</strong>
                  </p>
                </div>

                {/* ── Norm Grid (rapi dengan CSS classes) ── */}
                <div className="grid grid-cols-7 bg-ink border border-subtleBorder rounded-xl overflow-hidden">
                  {/* Cell 1 */}
                  <div className="col-span-2 norm-grid-card border-r border-subtleBorder">
                    <span className="norm-label">Norm Vektor Kueri</span>
                    <span className="norm-value">
                      <KatexFormula latex={"\\|q\\|"} block={false} />
                    </span>
                    <span className="norm-value mt-1">{selectedWhyResult.queryNorm.toFixed(6)}</span>
                  </div>
                  {/* Divider × */}
                  <div className="col-span-1 norm-grid-divider border-r border-subtleBorder">×</div>
                  {/* Cell 2 */}
                  <div className="col-span-2 norm-grid-card border-r border-subtleBorder">
                    <span className="norm-label">Norm Vektor Dokumen</span>
                    <span className="norm-value">
                      <KatexFormula latex={"\\|d\\|"} block={false} />
                    </span>
                    <span className="norm-value mt-1">{selectedWhyResult.docNorm.toFixed(6)}</span>
                  </div>
                  {/* Divider = */}
                  <div className="col-span-1 norm-grid-divider border-r border-subtleBorder">=</div>
                  {/* Cell 3 */}
                  <div className="col-span-1 norm-grid-card">
                    <span className="norm-label">
                      <KatexFormula latex={"\\|q\\|\\cdot\\|d\\|"} block={false} />
                    </span>
                    <span className="norm-value accent">{(selectedWhyResult.queryNorm * selectedWhyResult.docNorm).toFixed(6)}</span>
                  </div>
                </div>

                {/* ── Term Contribution Section ── */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-xs font-bold text-warmPaper font-mono uppercase tracking-wider">
                      Kontribusi Term terhadap Cosine Similarity:
                    </h4>
                    {/* Formula strip rapi */}
                    <div className="math-breakdown-formula-strip shrink-0">
                      <span className="strip-label">per-term formula</span>
                      <div className="strip-formula">
                        <KatexFormula latex={"c_t = \\dfrac{q_t \\cdot d_t}{\\|q\\|\\cdot\\|d\\|}"} block={false} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedWhyResult.termContributions.map(tc => (
                      <div key={tc.term} className="p-3 bg-archiveLight/60 rounded-lg border border-subtleBorder space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="font-bold accent-text text-sm">{tc.term}</span>
                          <span className="text-warmPaper font-bold">
                            Skor Kontribusi: {tc.contribution.toFixed(6)}{" "}
                            <span className="text-mutedText">({tc.percent.toFixed(1)}%)</span>
                          </span>
                        </div>
                        
                        {/* Horizontal Bar */}
                        <div className="w-full h-2 bg-ink rounded-full overflow-hidden border border-subtleBorder">
                          <div
                            className="h-full accent-bg"
                            style={{ width: `${Math.min(100, tc.percent)}%` }}
                          ></div>
                        </div>

                        <div className="grid grid-cols-2 text-[10px] font-mono text-mutedText pt-1">
                          <span>
                            Bobot TF-IDF Kueri{" "}
                            <span className="formula-block-inline">q_t</span>:{" "}
                            <strong className="text-warmPaper">{tc.queryWeight.toFixed(6)}</strong>
                          </span>
                          <span className="text-right">
                            Bobot TF-IDF Dokumen{" "}
                            <span className="formula-block-inline">d_t</span>:{" "}
                            <strong className="text-warmPaper">{tc.docWeight.toFixed(6)}</strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Penjelasan Formal dengan formula visual ── */}
                <div className="p-4 bg-ink rounded-lg border border-subtleBorder text-xs text-mutedText leading-relaxed space-y-3">
                  <strong className="text-warmPaper block font-mono">Penjelasan Ringkas:</strong>
                  <p>
                    Skor akhir <strong>{selectedWhyResult.score.toFixed(6)}</strong> diperoleh
                    dengan menjumlahkan seluruh kontribusi perkalian bobot TF-IDF kueri dan
                    dokumen yang beririsan, kemudian dibagi oleh perkalian norma Euclidean
                    kedua vektor:
                  </p>
                  {/* Visual formula ringkasan */}
                  <div className="formula-block" style={{ background: 'rgba(255,253,246,0.04)', borderColor: 'rgba(55,102,75,0.35)' }}>
                    <KatexFormula latex={"\\text{score} = \\sum_{t\\,\\in\\,q\\cap d} \\frac{q_t \\cdot d_t}{\\|q\\|\\cdot\\|d\\|} \\;=\\; " + selectedWhyResult.score.toFixed(6)} block={true} />
                  </div>
                </div>

              </div>
            </div>
          )}

          {}
          {selectedDocDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/60 backdrop-blur-sm">
              <div className="bg-archive border border-subtleBorder rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
                <button
                  onClick={() => setSelectedDocDetail(null)}
                  className="absolute top-4 right-4 text-mutedText hover:text-warmPaper p-1 rounded-lg bg-archiveLight"
                >
                  <Icon name="x" className="w-5 h-5" />
                </button>

                <div className="border-b border-subtleBorder pb-3">
                  <span className="px-2 py-0.5 rounded bg-archiveLight text-xs font-mono text-mutedText border border-subtleBorder">
                    {selectedDocDetail.category || 'General'}
                  </span>
                  <div className="flex items-start gap-1 mt-2 pr-10">
                    <h3 className="text-lg font-bold text-warmPaper">{selectedDocDetail.title}</h3>
                    <CopyButton text={selectedDocDetail.title} title="Salin judul" className="shrink-0 mt-0.5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-mutedText">ID Dokumen: {selectedDocDetail.id}
                    <CopyButton text={String(selectedDocDetail.id)} title="Salin ID" className="!p-0.5" />
                  </span>
                  {selectedDocDetail.url && (
                    <a href={selectedDocDetail.url} target="_blank" rel="noopener noreferrer" className="ml-3 text-xs font-mono accent-text underline">Buka sumber ↗</a>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono text-mutedText uppercase">Isi Teks Lengkap:</h4>
                    <CopyButton text={selectedDocDetail.content} title="Salin isi teks" label="Salin isi" />
                  </div>
                  <div className="p-4 bg-ink rounded-lg border border-subtleBorder text-xs text-warmPaper leading-relaxed font-sans max-h-60 overflow-y-auto">
                    {selectedDocDetail.content}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedDocDetail(null)}
                    className="px-4 py-2 bg-archiveLight text-warmPaper rounded text-xs font-mono hover:bg-subtleBorder"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}

          {}
          {showUploadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/60 backdrop-blur-sm">
              <div className="bg-archive border border-subtleBorder rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
                
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="absolute top-4 right-4 text-mutedText hover:text-warmPaper p-1 rounded-lg bg-archiveLight"
                >
                  <Icon name="x" className="w-5 h-5" />
                </button>

                <div>
                  <h3 className="text-lg font-bold text-warmPaper flex items-center gap-2">
                    <Icon name="file-up" className="w-5 h-5 accent-text" />
                    Import Dataset CSV
                  </h3>
                  <p className="text-xs text-mutedText mt-1">
                    Pilih atau tarik berkas CSV untuk membangun indeks VSM. Dataset disimpan di browser dan dimuat otomatis saat halaman dibuka lagi.
                  </p>
                </div>

                {csvUploadError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs rounded-lg flex items-center gap-2">
                    <Icon name="alert-triangle" className="w-4 h-4 shrink-0" />
                    <span>{csvUploadError}</span>
                  </div>
                )}

                {!csvRawData ? (
                  <div className="border-2 border-dashed border-subtleBorder hover:border-accent rounded-xl p-8 text-center space-y-3 bg-ink/50 transition">
                    <Icon name="upload-cloud" className="w-10 h-10 text-mutedText mx-auto" />
                    <div className="text-xs text-warmPaper font-medium">
                      Klik, atau tarik berkas CSV dari file explorer ke halaman ini
                    </div>
                    <p className="text-[10px] text-mutedText">Mendukung CSV UTF-8 (pemisah koma atau titik-koma)</p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvFileSelect}
                      className="hidden"
                      id="csv-file-input"
                    />
                    <label
                      htmlFor="csv-file-input"
                      className="inline-block px-5 py-2.5 accent-bg text-xs font-bold rounded-lg cursor-pointer hover:opacity-90 transition hover:animate__animated hover:animate__pulse active:animate__rubberBand shadow-sm"
                    >
                      Pilih File CSV
                    </label>
                  </div>
                ) : (
                  /* Column Mapper Form */
                  <div className="space-y-4">
                    <div className="p-3 bg-ink rounded-lg border border-subtleBorder text-xs flex justify-between items-center font-mono">
                      <span>Total Baris Terbaca: <strong className="accent-text">{csvRawData.totalLines}</strong></span>
                      <button
                        onClick={() => setCsvRawData(null)}
                        className="text-xs text-mutedText hover:text-warmPaper underline"
                      >
                        Ganti File
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-mutedText block mb-1">Kolom ID Dokumen:</label>
                        <select
                          value={columnMapping.id}
                          onChange={(e) => setColumnMapping({ ...columnMapping, id: e.target.value })}
                          className="w-full bg-ink border border-subtleBorder rounded p-2 text-warmPaper"
                        >
                          <option value="">-- Buat Otomatis (DOC-001) --</option>
                          {csvRawData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="text-mutedText block mb-1">Kolom Judul Dokumen:</label>
                        <select
                          value={columnMapping.title}
                          onChange={(e) => setColumnMapping({ ...columnMapping, title: e.target.value })}
                          className="w-full bg-ink border border-subtleBorder rounded p-2 text-warmPaper"
                        >
                          <option value="">-- Ambil dari Teks Awal --</option>
                          {csvRawData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="text-mutedText block mb-1">Kolom Isi Teks Dokumen (Wajib):</label>
                        <select
                          value={columnMapping.content}
                          onChange={(e) => setColumnMapping({ ...columnMapping, content: e.target.value })}
                          className="w-full bg-ink border border-accent rounded p-2 text-warmPaper font-bold"
                        >
                          <option value="">-- Pilih Kolom Isi Teks --</option>
                          {csvRawData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="text-mutedText block mb-1">Kolom Kategori (Opsional):</label>
                        <select
                          value={columnMapping.category}
                          onChange={(e) => setColumnMapping({ ...columnMapping, category: e.target.value })}
                          className="w-full bg-ink border border-subtleBorder rounded p-2 text-warmPaper"
                        >
                          <option value="">-- Set Kategori Default 'Umum' --</option>
                          {csvRawData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="text-mutedText block mb-1">Kolom Tautan/URL (Opsional):</label>
                        <select
                          value={columnMapping.url}
                          onChange={(e) => setColumnMapping({ ...columnMapping, url: e.target.value })}
                          className="w-full bg-ink border border-subtleBorder rounded p-2 text-warmPaper"
                        >
                          <option value="">-- Tanpa Tautan --</option>
                          {csvRawData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setShowUploadModal(false)}
                        className="px-4 py-2 rounded bg-archiveLight text-mutedText text-xs font-mono"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleConfirmCsvImport}
                        className="px-5 py-2.5 rounded-lg accent-bg text-xs font-bold font-mono transition hover:animate__animated hover:animate__pulse active:animate__rubberBand shadow-md cursor-pointer"
                      >
                        Konfirmasi &amp; Re-Indeks
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

    </>
  );
}

ATLAS.components.Modals = Modals;
ATLAS.components.ConfirmDeleteModal = ConfirmDeleteModal;
})();
