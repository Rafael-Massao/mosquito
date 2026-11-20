'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {WebSocketServer,WebSocket}=require('ws');
const {RoomService}=require('./rooms.cjs');
function createGameServer({root=path.resolve(__dirname,'..'),allowedOrigins=process.env.ALLOWED_ORIGINS||''}={}){
 const allowed=new Set(allowedOrigins.split(',').map(s=>s.trim()).filter(Boolean));
 const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav'};
 const server=http.createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);}catch{res.writeHead(400);return res.end();}
  if(pathname==='/health'){res.writeHead(200,{'content-type':'application/json'});return res.end(JSON.stringify({ok:true,protocol:1}));}
  // Servir apenas os arquivos públicos; nunca código do servidor, testes ou segredos.
  const publicPath=pathname==='/'?'index.html':pathname.slice(1);
  if(!['index.html','script.js','style.css','multiplayer.js','multiplayer.css','campus.js','campus-rules.js','campus-scenery.js'].includes(publicPath)&&!/^((icons|sound)\/[a-zA-Z0-9_ /.-]+)$/.test(publicPath)){res.writeHead(404);return res.end('Não encontrado');}
  const file=path.resolve(root,publicPath);if(!file.startsWith(root+path.sep)||publicPath.split('/').some(part=>part.startsWith('.'))||!mime[path.extname(file)]){res.writeHead(404);return res.end();}
  fs.stat(file,(err,stat)=>{if(err||!stat.isFile()){res.writeHead(404);return res.end();}res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','content-length':stat.size,'cache-control':'no-cache','x-content-type-options':'nosniff'});if(req.method==='HEAD')return res.end();const stream=fs.createReadStream(file);stream.on('error',()=>res.destroy());stream.pipe(res);});
 });
 const wss=new WebSocketServer({noServer:true,maxPayload:4096,perMessageDeflate:false});
 const peers=new Set(),ips=new Map();
 const rooms=new RoomService({send:(p,msg)=>{if(p.ws.readyState===WebSocket.OPEN){if(p.ws.bufferedAmount>256000)return p.ws.terminate();p.ws.send(JSON.stringify(msg));}}});
 server.on('upgrade',(req,socket,head)=>{
  const ip=req.socket.remoteAddress;
  if(req.url!=='/online'||(allowed.size&&!allowed.has(req.headers.origin))||peers.size>=200||(ips.get(ip)||0)>=20){socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');return;}
  wss.handleUpgrade(req,socket,head,ws=>{ws.clientIP=ip;wss.emit('connection',ws,req);});
 });
 wss.on('connection',ws=>{
  const p={ws,alive:true,budget:60,budgetAt:Date.now(),joinedAt:Date.now()};peers.add(p);ips.set(ws.clientIP,(ips.get(ws.clientIP)||0)+1);
  ws.on('pong',()=>{p.alive=true;});ws.on('error',()=>{});
  ws.on('message',(raw,isBinary)=>{if(isBinary)return ws.close(1003,'JSON required');const now=Date.now();p.budget=Math.min(60,p.budget+(now-p.budgetAt)*.03);p.budgetAt=now;if(--p.budget<0)return ws.close(1008,'Too many messages');let m;try{m=JSON.parse(raw.toString());}catch{return ws.close(1007,'Invalid JSON');}rooms.message(p,m);});
  ws.on('close',()=>{rooms.leave(p);peers.delete(p);const n=(ips.get(ws.clientIP)||1)-1;if(n)ips.set(ws.clientIP,n);else ips.delete(ws.clientIP);});
 });
 let last=Date.now(),frame=0;
 const tick=setInterval(()=>{const now=Date.now();rooms.tick(Math.min(.1,(now-last)/1000));last=now;if(++frame%2===0)rooms.broadcast();for(const p of peers)if(!p.room&&now-p.joinedAt>15000)p.ws.close(1008,'Join timeout');},50);
 const heartbeat=setInterval(()=>{for(const p of peers){if(!p.alive){p.ws.terminate();continue;}p.alive=false;p.ws.ping();}},20000);
 function close(){clearInterval(tick);clearInterval(heartbeat);for(const p of peers)p.ws.terminate();wss.close();return new Promise(resolve=>server.close(resolve));}
 return {server,rooms,close};
}
if(require.main===module){const app=createGameServer();const port=Number(process.env.PORT)||3000;app.server.listen(port,'0.0.0.0',()=>console.log(`Mosquito Evolution: http://localhost:${port}`));for(const signal of ['SIGTERM','SIGINT'])process.once(signal,()=>app.close().then(()=>process.exit(0)));}
module.exports={createGameServer};
