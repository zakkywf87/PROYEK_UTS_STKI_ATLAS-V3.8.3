/* Util CSV: parser (koma/titik-koma, BOM, kutip), pemetaan kolom, konversi ke dokumen */
(function () {
    // ---------- Util CSV (mendukung koma/titik-koma, BOM, kutip ganda) ----------
    function parseCSVText(text) {
      text = text.replace(/^\uFEFF/, '');
      const firstLine = text.split(/\r?\n/)[0] || '';
      const delim = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';
      const rows = [];
      let row = [], cell = '', inQ = false;
      for (let i = 0; i < text.length; i++) {
        const c = text[i], n = text[i + 1];
        if (c === '"') {
          if (inQ && n === '"') { cell += '"'; i++; } else inQ = !inQ;
        } else if (c === delim && !inQ) {
          row.push(cell.trim()); cell = '';
        } else if ((c === '\r' || c === '\n') && !inQ) {
          if (c === '\r' && n === '\n') i++;
          row.push(cell.trim());
          if (row.some(x => x !== '')) rows.push(row);
          row = []; cell = '';
        } else cell += c;
      }
      if (cell || row.length) { row.push(cell.trim()); if (row.some(x => x !== '')) rows.push(row); }
      return rows;
    }

    // Pemetaan kolom otomatis (header Indonesia/Inggris, fuzzy)
    function autoMapHeaders(headers) {
      const rules = {
        url: /(^|\W)(url|link|tautan|href)(\W|$)/,
        id: /^(id|doc_?id|docno|doc_no|kode|no|nomor)$/,
        title: /(title|judul|headline|heading|subject|^name$|^nama$)/,
        category: /(category|kategori|label|tag|topik|topic|class|genre|section)/,
        content: /(content|isi|text|teks|deskripsi|description|body|dokumen|document|abstrak|abstract|konten|review|summary|article|message|comment|sumber|source|publisher)/
      };
      const map = { id: '', title: '', content: '', category: '', url: '' };
      const free = h => !Object.values(map).includes(h);
      ['url', 'id', 'title', 'category', 'content'].forEach(k => {
        const hit = headers.find(x => free(x) && rules[k].test(x.toLowerCase().trim()));
        if (hit) map[k] = hit;
      });
      if (!map.title) map.title = headers.find(free) || '';
      if (!map.content) map.content = headers.find(free) || map.title;
      return map;
    }

    // Baris CSV -> dokumen. URL di dalam teks dibuang agar tidak mencemari indeks; awalan "2. " pada kategori dibuang.
    function rowsToDocs(headers, rows, m) {
      const ix = k => (m[k] ? headers.indexOf(m[k]) : -1);
      const iId = ix('id'), iT = ix('title'), iC = ix('content'), iK = ix('category'), iU = ix('url');
      const stripUrl = s => s.replace(/\(?https?:\/\/[^\s)]+\)?/g, '').replace(/\s{2,}/g, ' ').trim();
      const docs = [];
      rows.forEach((row, i) => {
        const title = ((iT >= 0 && row[iT]) || '').trim();
        const content = stripUrl(iC >= 0 ? (row[iC] || '') : '');
        if (!title && !content) return;
        docs.push({
          id: (iId >= 0 && row[iId]) || `DOC-${String(i + 1).padStart(4, '0')}`,
          title: title || content.substring(0, 60) + '...',
          content: content || title,
          category: ((iK >= 0 && row[iK]) || 'Umum').replace(/^\d+\.\s*/, ''),
          url: (iU >= 0 && row[iU]) || ''
        });
      });
      return docs;
    }
  ATLAS.utils.csv = { parseCSVText, autoMapHeaders, rowsToDocs };
})();
