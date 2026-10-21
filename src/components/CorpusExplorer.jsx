/* CorpusExplorerComponent */
(function () {
const { useState, useEffect, useMemo, useRef, useCallback } = React;

    function CorpusExplorerComponent({ documents, onSelectDoc }) {
      const [filterText, setFilterText] = useState('');
      const [categoryFilter, setCategoryFilter] = useState('ALL');
      const [shown, setShown] = useState(30);

      const filteredDocs = useMemo(() => {
        return documents.filter(doc => {
          const matchCat = categoryFilter === 'ALL' || doc.category === categoryFilter;
          const matchText = doc.title.toLowerCase().includes(filterText.toLowerCase()) ||
                            doc.content.toLowerCase().includes(filterText.toLowerCase()) ||
                            doc.id.toLowerCase().includes(filterText.toLowerCase());
          return matchCat && matchText;
        });
      }, [documents, filterText, categoryFilter]);

      return (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-archive p-3 rounded-lg border border-subtleBorder">
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Cari dokumen dalam repositori..."
              className="bg-ink border border-subtleBorder px-3 py-1.5 rounded text-xs text-warmPaper w-full sm:w-64 focus:outline-none focus:border-accent font-sans"
            />
            <div className="text-xs font-mono text-mutedText">
              Menampilkan {Math.min(shown, filteredDocs.length)} dari {filteredDocs.length} dokumen{filteredDocs.length > shown && <button onClick={() => setShown(s => s + 60)} className="ml-3 underline accent-text">muat lebih banyak</button>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.slice(0, shown).map(doc => (
              <div
                key={doc.id}
                onClick={() => onSelectDoc(doc)}
                className="p-4 bg-archive rounded-xl border border-subtleBorder hover:border-accent cursor-pointer transition space-y-2 group"
              >
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-mutedText">{doc.id}</span>
                  <span className="px-2 py-0.5 rounded bg-archiveLight text-[10px] text-warmPaper border border-subtleBorder">
                    {doc.category || 'General'}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-warmPaper group-hover:accent-text transition line-clamp-1">
                  {doc.title}
                </h4>
                <p className="text-xs text-mutedText line-clamp-3">
                  {doc.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

ATLAS.components.CorpusExplorerComponent = CorpusExplorerComponent;
})();
