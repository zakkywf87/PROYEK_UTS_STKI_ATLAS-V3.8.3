/**
 * ATLAS Search - Local Static Server (Zero-Dependency Node.js)
 * Menyajikan aplikasi ATLAS tanpa cache dan otomatis membuka browser.
 * Jalankan: npm start  atau  node scripts/serve.js [port]
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const initialPort = parseInt(process.argv[2], 10) || 8000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.jsx': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.csv': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function startServer(port, maxAttempts = 10) {
  const server = http.createServer((req, res) => {
    // Buang query string (mis. ?v=3.5)
    const cleanUrl = req.url.split('?')[0];
    let filePath = path.join(rootDir, cleanUrl === '/' ? 'index.html' : cleanUrl);

    // Keamanan traversal
    if (!filePath.startsWith(rootDir)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`404 Not Found: ${cleanUrl}`);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      // Header tanpa cache agar perubahan berkas langsung terlihat seketika
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*'
      });

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && maxAttempts > 0) {
      console.log(`Port ${port} sedang digunakan, mencoba port ${port + 1}...`);
      startServer(port + 1, maxAttempts - 1);
    } else {
      console.error('Gagal menjalankan server:', err.message);
    }
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log('\n==================================================');
    console.log('   ATLAS — Search Beyond Keywords');
    console.log('==================================================');
    console.log(` ✓ Server aktif  : ${url}`);
    console.log(` ✓ Direktori     : ${rootDir}`);
    console.log(' ✓ Mode          : Bebas Cache (Live Update)');
    console.log(' ✓ Browser terbuka otomatis...');
    console.log('--------------------------------------------------');
    console.log(' Tekan Ctrl + C untuk mematikan server.');
    console.log('==================================================\n');

    // Buka browser secara otomatis sesuai sistem operasi
    const openCommand = process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
      ? `open "${url}"`
      : `xdg-open "${url}"`;

    exec(openCommand, (err) => {
      if (err) {
        console.log(`Buka tautan ini di browser Anda: ${url}`);
      }
    });
  });
}

startServer(initialPort);
