/* Komponen akar: state global, header, tab, modal */
(function () {
  const { useState, useEffect, useMemo, useRef, useCallback } = React;
  const { VSMEngine } = ATLAS.engine;
  const { parseCSVText, autoMapHeaders, rowsToDocs } = ATLAS.utils.csv;
  const { loadDataset, saveDataset, clearDataset } = ATLAS.utils.storage;
  const { Icon, Logo, SearchTab, Modals, PreprocessingInspectorComponent, CorpusExplorerComponent, AlgorithmExplanationComponent } = ATLAS.components;

  function AtlasApp() {
    // System States
    const [vsmEngine] = useState(() => new VSMEngine());
    const [documents, setDocuments] = useState([]);
    const [datasetName, setDatasetName] = useState('');
    const [restoring, setRestoring] = useState(true);
    const [isDragging, setIsDragging] = useState(false);

    // Navigation View
    const [activeTab, setActiveTab] = useState('search'); // search | preprocessing | corpus | algorithm

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [minScore, setMinScore] = useState(0.0);
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [visibleCount, setVisibleCount] = useState(10);
    const [noDatasetWarning, setNoDatasetWarning] = useState(false);

    // Selected Modal Details
    const [selectedWhyResult, setSelectedWhyResult] = useState(null);
    const [selectedDocDetail, setSelectedDocDetail] = useState(null);

    // CSV Upload Modal
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [csvRawData, setCsvRawData] = useState(null);
    const [columnMapping, setColumnMapping] = useState({ id: '', title: '', content: '', category: '', url: '' });
    const [csvUploadError, setCsvUploadError] = useState('');
    const [csvFileName, setCsvFileName] = useState('');

    // Confirm Delete Dataset State
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    // Focus Shortcut Handler
    const searchInputRef = useRef(null);

    // Keyboard Shortcut "/" for quick search focus
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === '/' && document.activeElement !== searchInputRef.current && activeTab === 'search') {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeTab]);

    // Categories extraction
    const categories = useMemo(() => {
      const cats = new Set(documents.map(d => d.category || 'Uncategorized'));
      return ['ALL', ...Array.from(cats)];
    }, [documents]);

    // Execute Search
    const handleExecuteSearch = useCallback((q = searchQuery) => {
      if (!q.trim()) {
        setSearchResults(null);
        setActiveSearch('');
        setNoDatasetWarning(false);
        return;
      }

      // Peringatan jika mencari kata saat belum impor dataset
      if (!documents || documents.length === 0) {
        setNoDatasetWarning(true);
        setIsSearching(false);
        return;
      }

      setNoDatasetWarning(false);
      setIsSearching(true);
      setVisibleCount(10);
      setActiveSearch(q);

      setTimeout(() => {
        const res = vsmEngine.search(q);
        setSearchResults(res);
        setIsSearching(false);
      }, 150);
    }, [vsmEngine, searchQuery, documents]);

    // Opsi Hapus Dataset — buka custom confirm dialog
    const handleClearDataset = () => {
      setShowConfirmDelete(true);
    };

    const handleConfirmDelete = () => {
      setShowConfirmDelete(false);
      clearDataset().catch(err => console.warn('Gagal menghapus dataset dari IndexedDB:', err));
      setDocuments([]);
      setDatasetName('');
      setSearchResults(null);
      setActiveSearch('');
      setSearchQuery('');
      setNoDatasetWarning(false);
      vsmEngine.buildIndex([]);
    };

    const handleCancelDelete = () => {
      setShowConfirmDelete(false);
    };

    // Handle CSV File Selection
    const processCsvFile = (file) => {
      if (!file) return;
      setCsvFileName(file.name);
      setCsvRawData(null);
      setCsvUploadError('');
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const rawText = evt.target.result;
          const rows = parseCSVText(rawText);

          if (rows.length < 2) {
            setCsvUploadError('Berkas CSV harus memiliki minimal 1 baris header dan 1 baris data.');
            return;
          }

          const headers = rows[0].map(h => h.trim());
          const sampleRows = rows.slice(1);

          // Auto-detect columns
          const autoMap = autoMapHeaders(headers); // sama dengan loader dataset.csv (ID + EN)

          setCsvRawData({ headers, rows: sampleRows, totalLines: sampleRows.length });
          setColumnMapping(autoMap);
        } catch (err) {
          setCsvUploadError('Gagal membaca berkas CSV. Pastikan format UTF-8 valid.');
        }
      };
      reader.readAsText(file);
    };

    const handleCsvFileSelect = (e) => {
      processCsvFile(e.target.files[0]);
      e.target.value = ''; // izinkan memilih berkas yang sama lagi
    };

    // Drag & drop berkas CSV dari file explorer ke mana saja di halaman
    useEffect(() => {
      let depth = 0;
      const hasFiles = (e) => e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files');
      const onEnter = (e) => { if (!hasFiles(e)) return; e.preventDefault(); depth++; setIsDragging(true); };
      const onOver = (e) => { if (!hasFiles(e)) return; e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; };
      const onLeave = (e) => { if (!hasFiles(e)) return; depth = Math.max(0, depth - 1); if (!depth) setIsDragging(false); };
      const onDrop = (e) => {
        if (!hasFiles(e)) return;
        e.preventDefault(); depth = 0; setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (!file) return;
        setShowUploadModal(true);
        if (!/\.(csv|tsv|txt)$/i.test(file.name) && !/csv|text/.test(file.type)) {
          setCsvRawData(null);
          setCsvUploadError(`Berkas "${file.name}" bukan CSV. Gunakan berkas berekstensi .csv.`);
          return;
        }
        processCsvFile(file);
      };
      window.addEventListener('dragenter', onEnter);
      window.addEventListener('dragover', onOver);
      window.addEventListener('dragleave', onLeave);
      window.addEventListener('drop', onDrop);
      return () => {
        window.removeEventListener('dragenter', onEnter); window.removeEventListener('dragover', onOver);
        window.removeEventListener('dragleave', onLeave); window.removeEventListener('drop', onDrop);
      };
    }, []);

    const applyDocs = (parsedDocs, name = '', persist = true) => {
      vsmEngine.buildIndex(parsedDocs);
      setDocuments(parsedDocs);
      setDatasetName(name);
      setSearchResults(null);
      setActiveSearch('');
      setSearchQuery('');
      setSelectedCategory('ALL');
      setVisibleCount(10);
      if (persist) saveDataset(parsedDocs, name).catch(err => console.warn('Dataset tidak tersimpan di browser:', err));
    };

    // Pulihkan dataset yang tersimpan saat halaman dibuka / di-reload
    useEffect(() => {
      loadDataset()
        .then(rec => { if (rec && rec.docs && rec.docs.length) applyDocs(rec.docs, rec.name || '', false); })
        .catch(err => console.warn('Gagal memuat dataset tersimpan:', err))
        .finally(() => setRestoring(false));
    }, []);

    const handleConfirmCsvImport = () => {
      if (!csvRawData || !columnMapping.content) {
        setCsvUploadError('Kolom Isi Dokumen wajib dipetakan.');
        return;
      }
      const parsedDocs = rowsToDocs(csvRawData.headers, csvRawData.rows, columnMapping);
      if (parsedDocs.length === 0) {
        setCsvUploadError('Tidak ditemukan baris data valid yang memiliki isi teks.');
        return;
      }
      applyDocs(parsedDocs, csvFileName);
      setShowUploadModal(false);
      setCsvRawData(null);
    };

    // Filtered search results
    const filteredResultsList = useMemo(() => {
      if (!searchResults) return [];
      return searchResults.results.filter(res => {
        if (selectedCategory !== 'ALL' && res.document.category !== selectedCategory) {
          return false;
        }
        return res.score >= minScore;
      });
    }, [searchResults, selectedCategory, minScore]);

    return (
      <div className="flex flex-col min-h-screen">
        {/* Header Bar */}
        <header className="bg-archive/95 backdrop-blur border-b border-subtleBorder sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

            {/* Product Identity */}
            <Logo tone="light" size={36} />

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 sm:gap-2">
              {[
                { id: 'search', label: 'Search', icon: 'search' },
                { id: 'preprocessing', label: 'Preprocessing', icon: 'cpu' },
                { id: 'corpus', label: 'Corpus Explorer', icon: 'database' },
                { id: 'algorithm', label: 'Algorithm', icon: 'book-open' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${activeTab === tab.id
                      ? 'bg-accent text-white font-semibold'
                      : 'text-mutedText hover:text-warmPaper hover:bg-archiveLight'
                    }`}
                >
                  <Icon name={tab.icon} className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Dataset Upload Trigger */}
            <button
              onClick={() => setShowUploadModal(true)}
              className={`px-3 py-1.5 rounded-md border border-subtleBorder bg-archive hover:border-accent text-xs font-mono flex items-center gap-1.5 text-warmPaper transition hover:animate__animated hover:animate__pulse active:animate__rubberBand cursor-pointer ${documents.length === 0 ? 'animate__animated animate__pulse animate__infinite' : ''
                }`}
              title="Impor berkas dataset CSV"
            >
              <Icon name="upload" className="w-3.5 h-3.5 accent-text" />
              <span className="hidden sm:inline">Import CSV</span>
            </button>

          </div>
        </header>

        { }
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Status Dataset Indicator Bar — compact single row */}
          <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 px-3 py-1.5 rounded-md border border-subtleBorder bg-archive/50 text-[10px] leading-tight font-mono overflow-x-auto">
            {/* Status badge */}
            <span className={`inline-flex items-center gap-1 px-1.5 py-px rounded font-semibold shrink-0 ${documents.length ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${documents.length ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
              <span className="truncate max-w-[220px]">{documents.length ? `DATASET: ${datasetName}` : restoring ? 'MEMUAT…' : 'BELUM ADA DATASET'}</span>
            </span>

            {documents.length > 0 && (
              <button
                onClick={handleClearDataset}
                className="inline-flex items-center gap-0.5 px-1.5 py-px rounded text-[10px] text-terracotta border border-terracotta/40 bg-terracotta/10 hover:bg-terracotta hover:text-white transition cursor-pointer shrink-0"
                title="Hapus dataset yang dimuat saat ini"
              >
                <Icon name="trash-2" className="w-2.5 h-2.5" />
                <span>Hapus</span>
              </button>
            )}

            {/* Divider */}
            <span className="text-subtleBorder shrink-0">│</span>
            <span className="text-mutedText shrink-0">Dok: <strong className="text-warmPaper">{documents.length}</strong></span>
            <span className="text-subtleBorder shrink-0">·</span>
            <span className="text-mutedText shrink-0">Vocab: <strong className="text-warmPaper">{vsmEngine.vocabulary.size}</strong></span>
            <span className="text-subtleBorder shrink-0">·</span>
            <span className="text-mutedText shrink-0">ID <strong className="text-warmPaper">{vsmEngine.documents.filter(d => d.lang === 'id').length}</strong> / EN <strong className="text-warmPaper">{vsmEngine.documents.filter(d => d.lang === 'en').length}</strong></span>
            <span className="text-subtleBorder shrink-0">│</span>
            <span className="text-mutedText shrink-0">Indeks: <strong className="accent-text">{vsmEngine.indexTimeMs} ms</strong></span>
            <span className="text-subtleBorder shrink-0">·</span>
            <span className="text-mutedText shrink-0">Model: <strong className="text-warmPaper">TF-IDF + VSM</strong></span>
          </div>


          {/* TAB 1: SEARCH DASHBOARD & RESULTS */}
          {activeTab === 'search' && <SearchTab {...{ documents, searchInputRef, searchQuery, setSearchQuery, handleExecuteSearch, isSearching, searchResults, minScore, setMinScore, selectedCategory, setSelectedCategory, categories, filteredResultsList, visibleCount, setVisibleCount, activeSearch, setSelectedDocDetail, setSelectedWhyResult, noDatasetWarning, setNoDatasetWarning, setShowUploadModal }} />}

          {/* TAB 2: PREPROCESSING INSPECTOR */}
          {activeTab === 'preprocessing' && (
            <div className="space-y-6">
              <div className="border-b border-subtleBorder pb-4">
                <h2 className="text-xl font-bold text-warmPaper">Preprocessing Pipeline Inspector</h2>
                <div className="text-xs text-mutedText mt-1.5 flex flex-wrap items-center gap-2 leading-relaxed">
                  <span>Uji dan amati bagaimana teks dalam DOC ditransformasikan melalui alur:</span>
                  {ATLAS.components.InteractivePipelineFlow ? (
                    <ATLAS.components.InteractivePipelineFlow />
                  ) : (
                    <span className="font-semibold text-warmPaper">Teks Asli → Case Folding → Tokenisasi → Stopword Removal → Stemming.</span>
                  )}
                </div>
              </div>

              <PreprocessingInspectorComponent defaultText={activeSearch || ""} />
            </div>
          )}

          {/* TAB 3: CORPUS EXPLORER */}
          {activeTab === 'corpus' && (
            <div className="space-y-6">
              <div className="border-b border-subtleBorder pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-warmPaper">Corpus Explorer</h2>
                  <p className="text-xs text-mutedText">
                    Eksplorasi koleksi {documents.length} dokumen terindeks dalam ruang repositori digital.
                  </p>
                </div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-3 py-1.5 rounded accent-bg text-xs font-mono font-bold flex items-center gap-1.5"
                >
                  <Icon name="plus" className="w-4 h-4" />
                  Unggah CSV Baru
                </button>
              </div>

              <CorpusExplorerComponent documents={documents} onSelectDoc={(doc) => setSelectedDocDetail(doc)} />
            </div>
          )}

          {/* TAB 4: ABOUT THE ALGORITHM */}
          {activeTab === 'algorithm' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="border-b border-subtleBorder pb-4">
                <h2 className="text-2xl font-extrabold text-warmPaper">Algoritma VSM & TF-IDF: Formulasi Matematika</h2>
                <p className="text-xs text-mutedText">
                  Landasan akademik Sistem Temu Kembali Informasi (Information Retrieval) yang diimplementasikan pada ATLAS.
                </p>
              </div>

              <AlgorithmExplanationComponent />
            </div>
          )}

        </main>

        { }
        <Modals {...{ selectedWhyResult, setSelectedWhyResult, selectedDocDetail, setSelectedDocDetail, showUploadModal, setShowUploadModal, csvUploadError, csvRawData, setCsvRawData, handleCsvFileSelect, columnMapping, setColumnMapping, handleConfirmCsvImport, showConfirmDelete, onConfirmDelete: handleConfirmDelete, onCancelDelete: handleCancelDelete }} />

        {isDragging && (
          <div className="fixed inset-0 z-[60] bg-forest/70 backdrop-blur-sm p-6 pointer-events-none flex items-center justify-center">
            <div className="w-full max-w-xl text-center p-10 rounded-2xl border-2 border-dashed border-butter bg-white/10 text-white space-y-2">
              <Icon name="upload-cloud" className="w-12 h-12 mx-auto text-butter" />
              <div className="text-lg font-bold">Lepaskan berkas CSV di sini</div>
              <div className="text-xs text-slate-300">Dataset akan dibaca, lalu Anda bisa memeriksa pemetaan kolom</div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-auto border-t border-subtleBorder bg-archive/50 py-6 text-center text-xs text-mutedText font-mono">
          <p>ATLAS — Information Retrieval Lab • Powered by VSM & TF-IDF • PTI Academic Workspace 2026</p>
        </footer>

      </div>
    );
  }

  ATLAS.components.App = AtlasApp;
})();
