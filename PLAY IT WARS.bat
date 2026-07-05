@echo off
title IT WARS
rem One-click launcher: starts a tiny local server (needed for ES modules)
rem and opens the game in your default browser. Keep this window open while
rem playing; press Ctrl+C or close it to stop.

where node >nul 2>nul || (
  echo Node.js is required to run IT WARS. Install it from https://nodejs.org
  pause
  exit /b 1
)

cd /d "%~dp0"

node -e "const h=require('http'),f=require('fs'),p=require('path');const t={'.html':'text/html','.js':'text/javascript','.css':'text/css','.md':'text/plain'};const s=h.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/shutdown'){r.writeHead(200,{'Content-Type':'text/plain'});r.end('bye');console.log('Quit from the game menu - server stopped, port 8484 freed.');setTimeout(()=>process.exit(0),300);return}if(u.endsWith('/'))u+='index.html';const x=p.join(process.cwd(),u);if(!x.startsWith(process.cwd())){r.writeHead(403);r.end();return}f.readFile(x,(e,d)=>{if(e){r.writeHead(404);r.end('not found');return}r.writeHead(200,{'Content-Type':t[p.extname(x)]||'application/octet-stream'});r.end(d)})});s.on('error',e=>{if(e.code==='EADDRINUSE'){console.log('IT WARS is already running - opening browser.');require('child_process').exec('start http://localhost:8484/');setTimeout(()=>process.exit(0),1500)}else{console.error(e.message);process.exit(1)}});s.listen(8484,()=>{console.log('IT WARS running at http://localhost:8484');console.log('Keep this window open while playing, or use QUIT GAME in the main menu.');require('child_process').exec('start http://localhost:8484/')})"

