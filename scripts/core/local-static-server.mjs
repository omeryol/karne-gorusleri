import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
const port = Number(process.env.PORT || 5000);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function safeResolve(urlPath) {
  const normalizedPath = decodeURIComponent(urlPath.split('?')[0]);
  const relativePath = normalizedPath === '/' ? '/index.html' : normalizedPath;
  const resolved = path.resolve(rootDir, `.${relativePath}`);

  if (!resolved.startsWith(rootDir)) {
    return null;
  }

  return resolved;
}

const server = http.createServer((req, res) => {
  const filePath = safeResolve(req.url || '/');

  if (!filePath) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (!statError && stats.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      serveFile(indexPath, res);
      return;
    }

    if (statError || !stats.isFile()) {
      const fallbackIndex = path.join(rootDir, 'index.html');
      serveFile(fallbackIndex, res, 200);
      return;
    }

    serveFile(filePath, res);
  });
});

function serveFile(filePath, res, successCode = 200) {
  const extension = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extension] || 'application/octet-stream';

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    res.writeHead(successCode, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}

server.listen(port, '0.0.0.0', () => {
  console.log(`Static app is running on http://localhost:${port}`);
});
