// Uji mesin tanpa browser: node tests/engine.test.js [path-csv]
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const root = path.join(__dirname, '..');
globalThis.window = globalThis;
const order = ['namespace', 'nlp/stopwords-id', 'nlp/stopwords-en', 'nlp/normalize', 'nlp/vendor/sastrawijs.umd',
  'nlp/stemmer-id', 'nlp/kstem/kstem-lists', 'nlp/kstem/kstem-data', 'nlp/kstem/kstem', 'nlp/stemmer-en',
  'nlp/language', 'nlp/pipeline', 'engine/vsm-engine', 'utils/csv'];
order.forEach(f => vm.runInThisContext(fs.readFileSync(path.join(root, 'src', f + '.js'), 'utf8'), { filename: f }));
module.exports = { ATLAS };
const { VSMEngine } = ATLAS.engine, { parseCSVText, autoMapHeaders, rowsToDocs } = ATLAS.utils.csv;
const csv = process.argv[2] || path.join(root, 'dataset', fs.readdirSync(path.join(root, 'dataset')).find(f => f.endsWith('.csv')));
const rows = parseCSVText(fs.readFileSync(csv, 'utf8'));
const headers = rows[0], map = autoMapHeaders(headers), docs = rowsToDocs(headers, rows.slice(1), map);
console.log('CSV:', path.basename(csv), '| baris:', rows.length - 1, '| dokumen:', docs.length, '\nPemetaan kolom:', JSON.stringify(map));
const e = new VSMEngine(); e.buildIndex(docs);
const lc = { id: 0, en: 0 }; e.documents.forEach(d => lc[d.lang]++);
console.log(`Indeks: ${e.indexTimeMs} ms | vocab ${e.vocabulary.size} | bahasa ${JSON.stringify(lc)} | kategori ${new Set(docs.map(d => d.category)).size}`);
assert(docs.length > 0 && e.isIndexed);
['Intelligent Tutoring System', 'gamifikasi pembelajaran', 'AI chatbot virtual tutor', 'jaringan komputer SMK', 'game-based learning'].forEach(q => {
  const r = e.search(q);
  console.log(`\nQ: ${q} [${r.queryPipeline.lang}] -> ${r.queryPipeline.stemmedTokens.join(',')} | ${r.results.length} hasil, ${r.searchTimeMs} ms`);
  r.results.slice(0, 3).forEach(x => console.log(`  ${x.score.toFixed(3)} #${x.document.id} ${x.document.title.slice(0, 70)}`));
  assert(r.results.length > 0, 'kueri tanpa hasil: ' + q);
});
console.log('\nOK');
