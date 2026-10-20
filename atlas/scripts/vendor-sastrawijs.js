// Menyalin bundel browser SastrawiJs dari node_modules ke src/nlp/vendor (jalankan: npm install && npm run vendor)
const fs = require('fs'), path = require('path');
const dist = path.join(__dirname, '..', 'node_modules', 'sastrawijs');
const out = path.join(__dirname, '..', 'src', 'nlp', 'vendor');
fs.mkdirSync(out, { recursive: true });
fs.copyFileSync(path.join(dist, 'dist', 'sastrawijs.umd.js'), path.join(out, 'sastrawijs.umd.js'));
fs.copyFileSync(path.join(dist, 'LICENSE'), path.join(out, 'sastrawijs.LICENSE'));
console.log('sastrawijs disalin ke', out);
