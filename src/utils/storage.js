/* Penyimpanan dataset di browser (IndexedDB) agar tidak hilang saat halaman di-reload.
   Yang disimpan: dokumen hasil impor + nama berkas. Indeks VSM dibangun ulang saat dimuat. */
(function () {
  const DB = 'atlas-db', STORE = 'kv', KEY = 'dataset';
  const open = () => new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  async function run(mode, fn) {
    const db = await open();
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      tx.oncomplete = () => { db.close(); res(req.result); };
      tx.onerror = tx.onabort = () => { db.close(); rej(tx.error); };
    });
  }
  const saveDataset = (docs, name) => run('readwrite', s => s.put({ docs, name, savedAt: Date.now() }, KEY));
  const loadDataset = () => run('readonly', s => s.get(KEY));
  const clearDataset = () => run('readwrite', s => s.delete(KEY));
  ATLAS.utils.storage = { saveDataset, loadDataset, clearDataset };
})();
