/* Tab Search: dashboard pencarian + halaman hasil */
(function () {
const { useState, useEffect, useMemo, useRef, useCallback } = React;
const { Icon } = ATLAS.components;

function SearchTab({ documents, searchInputRef, searchQuery, setSearchQuery, handleExecuteSearch, isSearching, searchResults, minScore, setMinScore, selectedCategory, setSelectedCategory, categories, filteredResultsList, visibleCount, setVisibleCount, activeSearch, setSelectedDocDetail, setSelectedWhyResult, noDatasetWarning, setNoDatasetWarning, setShowUploadModal }) {
  // Ekstrak contoh kueri dinamis yang relevan secara otomatis saat dataset berubah
  const allDynamicQueries = useMemo(() => {
    if (!documents || documents.length === 0) return [];

    const candidates = new Set();
    const stopID = ATLAS.nlp?.INDONESIAN_STOPWORDS || new Set();
    const stopEN = ATLAS.nlp?.ENGLISH_STOPWORDS || new Set();

    // 1. Ekstrak dari Kategori Dokumen (topik utama korpus)
    const cats = Array.from(new Set(documents.map(d => d.category).filter(Boolean)));
    cats.forEach(c => {
      const cleanCat = c.replace(/^[0-9a-zA-Z]+[\.\-\)]\s*/, '').trim();
      const parts = cleanCat.split(/[,&/|]|\s+(?:pada|dalam|untuk|di|with|using|in|for)\s+/i);
      parts.forEach(p => {
        const trimmed = p.trim().replace(/^[\W_]+|[\W_]+$/g, '');
        const words = trimmed.split(/\s+/);
        if (words.length >= 2 && words.length <= 4 && trimmed.length >= 5 && trimmed.length <= 35) {
          candidates.add(trimmed);
        }
      });
    });

    // 2. Ekstrak frasa bigram / trigram berfrekuensi tinggi dari Judul dokumen
    const nGramFreq = new Map();
    documents.forEach(d => {
      if (!d.title) return;
      const rawTokens = (ATLAS.nlp?.normalizeText ? ATLAS.nlp.normalizeText(d.title) : d.title.toLowerCase())
        .split(/\s+/)
        .filter(t => t.length > 1);

      for (let i = 0; i < rawTokens.length - 1; i++) {
        const w1 = rawTokens[i], w2 = rawTokens[i + 1];
        if (stopID.has(w1) || stopEN.has(w1) || stopID.has(w2) || stopEN.has(w2)) continue;
        const bigram = w1 + ' ' + w2;
        nGramFreq.set(bigram, (nGramFreq.get(bigram) || 0) + 1);

        if (i < rawTokens.length - 2) {
          const w3 = rawTokens[i + 2];
          if (!stopID.has(w3) && !stopEN.has(w3)) {
            const trigram = w1 + ' ' + w2 + ' ' + w3;
            nGramFreq.set(trigram, (nGramFreq.get(trigram) || 0) + 1);
          }
        }
      }
    });

    const sortedNgrams = Array.from(nGramFreq.entries())
      .filter(([phrase, count]) => count >= 2 && phrase.length >= 6)
      .sort((a, b) => b[1] - a[1]);

    sortedNgrams.slice(0, 30).forEach(([phrase]) => {
      const formatted = phrase.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      candidates.add(formatted);
    });

    // 3. Filter kemiripan agar kueri tidak redundan
    const selected = [];
    for (const q of Array.from(candidates)) {
      const qLower = q.toLowerCase();
      const isRedundant = selected.some(s => {
        const sLower = s.toLowerCase();
        return sLower.includes(qLower) || qLower.includes(sLower);
      });
      if (!isRedundant) {
        selected.push(q);
      }
    }
    return selected;
  }, [documents]);

  const [queryOffset, setQueryOffset] = useState(0);
  const sampleQueries = useMemo(() => {
    if (allDynamicQueries.length === 0) return [];
    const count = 5;
    const start = queryOffset % allDynamicQueries.length;
    let slice = allDynamicQueries.slice(start, start + count);
    if (slice.length < count && allDynamicQueries.length > count) {
      slice = slice.concat(allDynamicQueries.slice(0, count - slice.length));
    }
    return slice;
  }, [allDynamicQueries, queryOffset]);

  const handleShuffleQueries = () => {
    setQueryOffset(prev => prev + 3);
  };

  return (

              <div className="space-y-8">
                
                {/* Hero Section */}
                <div className="text-center py-6 sm:py-10 max-w-3xl mx-auto space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-subtleBorder bg-archive text-xs font-mono text-mutedText">
                    <span className="w-2 h-2 rounded-full bg-terracotta"></span>
                    Search · Understand · Explore
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-extrabold text-warmPaper tracking-tight leading-tight">
                    Temukan informasi. <span className="text-terracotta">Jelajahi lebih jauh.</span>
                  </h1>
                  <p className="text-sm sm:text-base text-mutedText max-w-2xl mx-auto">
                    Jelajahi dokumen, temukan hubungan antaristilah, dan pahami mengapa sebuah hasil dianggap relevan secara matematis melalui Vector Space Model.
                  </p>

                  {/* Search Input Box */}
                  <div className="pt-4">
                    <form onSubmit={(e) => { e.preventDefault(); handleExecuteSearch(); }} className="relative max-w-2xl mx-auto">
                      <div className="relative flex items-center">
                        <Icon name="search" className="absolute left-4 w-5 h-5 text-mutedText" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (noDatasetWarning) setNoDatasetWarning(false);
                          }}
                          placeholder="Cari dokumen, judul, atau kata kunci... (Tekan '/' untuk fokus)"
                          className="w-full pl-12 pr-28 py-4 bg-archive border-2 border-subtleBorder focus:border-accent rounded-xl text-warmPaper placeholder-mutedText text-base focus:outline-none focus:ring-2 accent-ring transition shadow-xl font-sans"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => { setSearchQuery(''); handleExecuteSearch(''); }}
                            className="absolute right-20 text-mutedText hover:text-warmPaper p-1"
                          >
                            <Icon name="x" className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={isSearching}
                          className="absolute right-2 px-4 py-2.5 rounded-lg accent-bg font-semibold text-sm flex items-center gap-1.5 hover:opacity-90 transition hover:animate__animated hover:animate__pulse active:animate__rubberBand cursor-pointer shadow-md"
                          title="Jalankan Pencarian VSM"
                        >
                          {isSearching ? (
                            <Icon name="loader-2" className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <span>Cari</span>
                              <Icon name="arrow-right" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {noDatasetWarning && (
                      <div className="mt-4 p-4 rounded-xl border-2 border-terracotta/40 bg-archive text-warmPaper max-w-2xl mx-auto flex items-start gap-3 shadow-lg animate__animated animate__headShake text-left">
                        <div className="p-2 rounded-lg bg-terracotta/10 text-terracotta shrink-0 mt-0.5">
                          <Icon name="alert-triangle" className="w-5 h-5 text-terracotta" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-sm text-terracotta flex items-center justify-between">
                            <span>Perhatian: Dataset Belum Diimpor</span>
                            <button
                              type="button"
                              onClick={() => setNoDatasetWarning(false)}
                              className="text-mutedText hover:text-warmPaper text-xs p-1"
                              title="Tutup peringatan"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="text-xs text-mutedText mt-1.5 leading-relaxed">
                            Anda harus mengimpor berkas dataset CSV terlebih dahulu sebelum dapat melakukan pencarian dokumen. Silakan klik tombol di bawah ini atau seret file CSV ke halaman ini.
                          </p>
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => { setNoDatasetWarning(false); setShowUploadModal(true); }}
                              className="px-4 py-2 rounded-lg accent-bg font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 transition hover:animate__animated hover:animate__pulse active:animate__rubberBand cursor-pointer shadow-md"
                            >
                              <Icon name="upload" className="w-3.5 h-3.5" />
                              <span>Impor Dataset CSV Sekarang</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Contoh Kueri Dinamis (Berubah sesuai Dataset) */}
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
                      {sampleQueries.length > 0 ? (
                        <>
                          <span className="text-mutedText flex items-center gap-1">
                            <span>Contoh kueri:</span>
                          </span>
                          {sampleQueries.map((sample, idx) => (
                            <button
                              key={idx}
                              onClick={() => { setSearchQuery(sample); handleExecuteSearch(sample); }}
                              className="px-2.5 py-1 rounded-md border border-subtleBorder bg-archive/60 text-mutedText hover:accent-border hover:accent-text transition hover:animate__animated hover:animate__headShake"
                              title={`Cari topik: "${sample}"`}
                            >
                              {sample}
                            </button>
                          ))}
                          {allDynamicQueries.length > 5 && (
                            <button
                              type="button"
                              onClick={handleShuffleQueries}
                              className="p-1 rounded-md text-mutedText hover:accent-text hover:bg-archive transition ml-1"
                              title="Acak rekomendasi kueri lain dari dataset"
                            >
                              <Icon name="refresh-cw" className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="text-mutedText text-[11px] flex items-center gap-1.5 py-0.5">
                          <span>💡 Impor dataset CSV untuk melihat rekomendasi kueri otomatis</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* State Jika Belum Ada / Setelah Hapus Dataset (Tampilan Baru Butter & Forest) */}
                {documents.length === 0 && (
                  <div className="empty-dataset-card max-w-3xl mx-auto p-6 sm:p-8 text-center animate__animated animate__fadeIn my-4">
                    <div className="empty-state-icon-pulse mb-4">
                      <Icon name="database" className="w-7 h-7" />
                    </div>
                    
                    <div className="inline-flex items-center gap-2 mb-3">
                      <span className="empty-state-badge">
                        <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse"></span>
                        KOLEKSI DOKUMEN KOSONG
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-warmPaper mb-2">
                      Dataset Belum Dimuat ke ATLAS
                    </h2>
                    <p className="text-sm text-mutedText max-w-lg mx-auto mb-6 leading-relaxed">
                      Ruang indeks pencarian saat ini kosong. Impor berkas dataset CSV untuk membangun matriks Vector Space Model dan memulai penelusuran dokumen berbasis TF-IDF.
                    </p>

                    {/* Panduan 3 Langkah Cepat */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left mb-6 font-sans">
                      <div className="empty-guide-step">
                        <span className="text-[10px] font-mono font-bold text-terracotta uppercase tracking-wider block mb-1">Langkah 1</span>
                        <h4 className="text-xs font-bold text-warmPaper mb-1">Pilih Berkas CSV</h4>
                        <p className="text-[11px] text-mutedText leading-relaxed">Klik tombol impor atau tarik berkas CSV dari explorer ke layar.</p>
                      </div>
                      <div className="empty-guide-step">
                        <span className="text-[10px] font-mono font-bold text-terracotta uppercase tracking-wider block mb-1">Langkah 2</span>
                        <h4 className="text-xs font-bold text-warmPaper mb-1">Petakan Kolom</h4>
                        <p className="text-[11px] text-mutedText leading-relaxed">Sistem mendeteksi otomatis kolom judul, isi, kategori, dan tautan.</p>
                      </div>
                      <div className="empty-guide-step">
                        <span className="text-[10px] font-mono font-bold text-terracotta uppercase tracking-wider block mb-1">Langkah 3</span>
                        <h4 className="text-xs font-bold text-warmPaper mb-1">Mulai Cari</h4>
                        <p className="text-[11px] text-mutedText leading-relaxed">Indeks VSM selesai dalam &lt;150ms dan siap dijelajahi seketika.</p>
                      </div>
                    </div>

                    {/* Tombol CTA */}
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowUploadModal(true)}
                        className="btn-forest-primary cursor-pointer hover:animate__animated hover:animate__pulse active:animate__rubberBand text-xs sm:text-sm"
                      >
                        <Icon name="upload" className="w-4 h-4" />
                        <span>Impor Dataset CSV Sekarang</span>
                      </button>
                    </div>
                  </div>
                )}

                {}
                {searchResults && (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start pt-4">
                    
                    {/* Left Sidebar Filter */}
                    <div className="lg:col-span-1 space-y-5 bg-archive p-5 rounded-xl border border-subtleBorder lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
                      <div className="flex items-center justify-between pb-3 border-b border-subtleBorder">
                        <h3 className="font-semibold text-warmPaper text-sm flex items-center gap-2">
                          <Icon name="sliders" className="w-4 h-4 accent-text" />
                          Filter & Analisis
                        </h3>
                        <span className="text-[10px] font-mono text-mutedText">{filteredResultsList.length} Hasil</span>
                      </div>

                      {/* Threshold Cosine Score Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <label className="text-mutedText">Min Similarity Threshold</label>
                          <span className="font-mono font-bold accent-text">{minScore.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="0.8"
                          step="0.05"
                          value={minScore}
                          onChange={(e) => setMinScore(parseFloat(e.target.value))}
                          className="w-full accent-accent bg-ink cursor-pointer"
                        />
                        <p className="text-[10px] text-mutedText">Sembunyikan dokumen di bawah skor kemiripan ini.</p>
                      </div>

                      {/* Category Selector */}
                      <div className="space-y-2">
                        <label className="text-xs text-mutedText block">Kategori Dokumen</label>
                        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                          {categories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono flex items-center justify-between transition ${
                                selectedCategory === cat
                                  ? 'accent-bg font-bold'
                                  : 'text-mutedText hover:bg-archiveLight hover:text-warmPaper'
                              }`}
                            >
                              <span>{cat}</span>
                              {cat === 'ALL' ? (
                                <span>({searchResults.results.length})</span>
                              ) : (
                                <span>({searchResults.results.filter(r => r.document.category === cat).length})</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Search Performance Stats */}
                      <div className="pt-3 border-t border-subtleBorder space-y-1.5 text-[11px] font-mono text-mutedText">
                        <div className="flex justify-between">
                          <span>Waktu Eksekusi:</span>
                          <span className="text-warmPaper font-bold">{searchResults.searchTimeMs} ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Norm Vektor Kueri ||q||:</span>
                          <span className="text-warmPaper font-bold">{searchResults.queryNorm.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Token Kueri Unik:</span>
                          <span className="text-warmPaper font-bold">{searchResults.queryPipeline.stemmedTokens.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Main Results Container */}
                    <div className="lg:col-span-3 space-y-4">
                      
                      {/* Search Query Summary Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-archiveLight/50 rounded-lg border border-subtleBorder text-xs">
                        <div>
                          Menampilkan hasil untuk kueri: <strong className="text-warmPaper font-mono accent-text">"{activeSearch}"</strong>
                        </div>
                        <div className="text-mutedText font-mono">
                          Menemukan {filteredResultsList.length} dari {documents.length} dokumen{searchResults.unknownTerms && searchResults.unknownTerms.length > 0 ? ' • diabaikan (tidak ada di korpus): ' + searchResults.unknownTerms.join(', ') : ''}
                        </div>
                      </div>

                      {/* Empty State */}
                      {filteredResultsList.length === 0 && (
                        <div className="p-12 text-center bg-archive rounded-xl border border-subtleBorder space-y-3">
                          <Icon name="search-x" className="w-12 h-12 text-mutedText mx-auto" />
                          <h4 className="text-lg font-semibold text-warmPaper">Tidak Ada Dokumen Relevan</h4>
                          <p className="text-xs text-mutedText max-w-md mx-auto">
                            Tidak ditemukan dokumen yang memenuhi ambang batas Cosine Similarity ({minScore.toFixed(2)}) untuk kueri ini. Cobalah menurunkan threshold atau gunakan kata kunci lain.
                          </p>
                        </div>
                      )}

                      {/* Results Cards List */}
                      {filteredResultsList.slice(0, visibleCount).map((res, index) => {
                        const rankNum = (index + 1).toString().padStart(2, '0');
                        const scorePercent = Math.min(100, Math.max(0, res.score * 100));

                        return (
                          <div
                            key={res.document.id}
                            className="card-hover p-5 bg-archive rounded-xl border border-subtleBorder space-y-3 group"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <span className="font-mono text-xs font-bold px-2 py-1 bg-ink border border-subtleBorder rounded text-mutedText group-hover:accent-border group-hover:accent-text transition">
                                  #{rankNum}
                                </span>
                                <div>
                                  <h3 className="font-bold text-base text-warmPaper group-hover:accent-text transition">
                                    {res.document.title}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1 text-xs font-mono text-mutedText">
                                    <span>ID: {res.document.id}</span>
                                    <span>•</span>
                                    <span className="px-2 py-0.5 rounded bg-archiveLight text-warmPaper border border-subtleBorder text-[10px]">
                                      {res.document.category || 'General'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Similarity Gauge Meter */}
                              <div className="text-right min-w-[100px]">
                                <div className="text-xs font-mono text-mutedText">Cosine Score</div>
                                <div className="text-lg font-extrabold font-mono accent-text">
                                  {res.score.toFixed(4)}
                                </div>
                                <div className="w-full h-1.5 bg-ink rounded-full overflow-hidden mt-1 border border-subtleBorder">
                                  <div
                                    className="h-full accent-bg transition-all duration-500"
                                    style={{ width: `${scorePercent}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            {/* Content Snippet */}
                            <p className="text-xs text-mutedText leading-relaxed line-clamp-3 font-sans">
                              {res.document.content}
                            </p>

                            {/* Matched Terms Badges & Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-subtleBorder/60 text-xs">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-mono text-mutedText">Term cocok:</span>
                                {res.matchedTerms.map(term => (
                                  <span key={term} className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold accent-bg">
                                    {term}
                                  </span>
                                ))}
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedDocDetail(res.document)}
                                  className="px-2.5 py-1 rounded bg-archiveLight hover:bg-subtleBorder text-warmPaper text-xs font-mono transition"
                                >
                                  Detail Doc
                                </button>
                                {res.document.url && (
                                  <a href={res.document.url} target="_blank" rel="noopener noreferrer"
                                    className="px-2.5 py-1 rounded border border-subtleBorder text-warmPaper text-xs font-mono hover:border-accent transition">Sumber ↗</a>
                                )}
                                <button
                                  onClick={() => setSelectedWhyResult(res)}
                                  className="px-3 py-1 rounded accent-bg font-semibold text-xs font-mono flex items-center gap-1 hover:opacity-90 transition shadow-sm"
                                >
                                  <Icon name="help-circle" className="w-3.5 h-3.5" />
                                  Why this result?
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {filteredResultsList.length > visibleCount && (
                        <button onClick={() => setVisibleCount(v => v + 10)} className="w-full py-3 rounded-xl border border-subtleBorder bg-archive text-xs font-mono text-warmPaper hover:border-accent transition hover:animate__animated hover:animate__pulse active:animate__rubberBand cursor-pointer shadow-sm">
                          Tampilkan 10 hasil berikutnya ({filteredResultsList.length - visibleCount} tersisa)
                        </button>
                      )}

                    </div>

                  </div>
                )}

              </div>
              );
}

ATLAS.components.SearchTab = SearchTab;
})();
