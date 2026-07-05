// Static server for IT Wars (ES modules refuse to load from file://).
// Usage: node .claude/skills/run-it-wars/serve.mjs [port]   (from repo root)
import http from 'http';
import { readFile } from 'fs/promises';
import { join, extname, normalize } from 'path';

const root = process.cwd();
const port = Number(process.argv[2] || 8321);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.md': 'text/plain' };

http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = normalize(join(root, p));
    if (!file.startsWith(normalize(root))) throw new Error('traversal');
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('not found');
  }
}).listen(port, () => console.log(`IT WARS serving ${root} on http://localhost:${port}`));
