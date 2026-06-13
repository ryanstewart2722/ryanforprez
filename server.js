const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const mime = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4',
  '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.json': 'application/json'
};

http.createServer((req, res) => {
  const p = path.join(root, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]));
  fs.stat(p, (err, stat) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const contentType = mime[path.extname(p)] || 'application/octet-stream';
    const total = stat.size;
    const rangeHeader = req.headers['range'];

    if (rangeHeader) {
      const [, startStr, endStr] = rangeHeader.match(/bytes=(\d*)-(\d*)/) || [];
      const start = startStr ? parseInt(startStr) : 0;
      const end   = endStr   ? parseInt(endStr)   : total - 1;
      res.writeHead(206, {
        'Content-Type': contentType,
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1
      });
      fs.createReadStream(p, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Content-Length': total
      });
      fs.createReadStream(p).pipe(res);
    }
  });
}).listen(3456, () => console.log('Server running on http://localhost:3456'));
