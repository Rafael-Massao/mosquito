'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {RoomService,sanitizeState}=require('../server/rooms.cjs');
const {createGameServer}=require('../server/index.cjs');
const WebSocket=require('ws');
const {protocol}=require('../campus-rules.js');
function fixture(){let clock=10000;const service=new RoomService({now:()=>clock,send:(p,m)=>p.messages.push(structuredClone(m))});return {service,peer:()=>({messages:[]}),advance(n){clock+=n;}};}
const state=(over={})=>({pos:[144,3.167,2],rot:[0,0,0,1],nv:{asas:0,tromba:30,estomago:0,corpo:0},mantis:[],skin:null,active:true,door:true,health:1,...over});
test('salas isoladas, lotação, código inválido, saída do criador e limpeza',()=>{
 const f=fixture(),s=f.service,people=Array.from({length:6},f.peer);s.create(people[0],'Criador');const code=people[0].room.code;assert.match(code,/^[A-Z2-9]{6}$/);
 for(let i=1;i<4;i++)s.join(people[i],code,'Amigo '+i);
 s.join(people[4],code,'Cheio');assert.equal(people[4].room,undefined);assert.match(people[4].messages.at(-1).message,/cheia/);
 s.join(people[4],'ZZZZZZ','Errado');assert.match(people[4].messages.at(-1).message,/encontrada/);
 s.create(people[4],'Outra');assert.notEqual(people[4].room.code,code);
 s.leave(people[0]);assert.equal(s.rooms.get(code).players.size,3);s.join(people[5],code,'Novo');assert.equal(s.rooms.get(code).players.size,4);
 for(const p of people)s.leave(p);f.advance(90001);s.tick(.05);assert.equal(s.rooms.size,0);
});
test('estado recebido tem valores finitos, limites e skins válidas',()=>{
 assert.equal(sanitizeState(state({pos:[NaN,0,0]})),null);assert.equal(sanitizeState(state({rot:[0,0,0,0]})),null);assert.equal(sanitizeState(state({pos:[999,0,0]})),null);
 const out=sanitizeState(state({nv:{asas:100},skin:'inventada',mantis:['cabeca','cabeca','fake']}));assert.equal(out.nv.asas,30);assert.equal(out.skin,null);assert.deepEqual(out.mantis,['cabeca']);
});
test('chefe compartilhado valida alcance, abertura e recarga; vitória e progresso da porta',()=>{
 const f=fixture(),s=f.service,a=f.peer(),b=f.peer(),outsider=f.peer();s.create(a,'A');s.join(b,a.room.code,'B');s.join(outsider,a.room.code,'Fora');
 for(const p of [a,b])s.message(p,{type:'state',state:state()});s.message(outsider,{type:'state',state:state({pos:[0,2,0]})});s.tick(.05);
 const boss=a.room.boss;assert.equal(a.room.door,true);assert.equal(boss.max,420);
 s.bite(a);assert.equal(boss.life,420);boss.phase='cansado';boss.timer=2;s.bite(a);assert.equal(boss.life,385);s.bite(a);assert.equal(boss.life,385);s.bite(b);assert.equal(boss.life,350);
 f.advance(1000);s.message(a,{type:'state',state:state({pos:[126,3,0]})});s.bite(a);assert.equal(boss.life,350);
 s.message(a,{type:'state',state:state()});boss.phase='cansado';boss.life=20;s.bite(a);assert.equal(boss.life,0);
 for(const p of [a,b])assert.equal(p.messages.filter(m=>m.type==='boss-win').length,1);assert.equal(outsider.messages.filter(m=>m.type==='boss-win').length,0);
 s.bite(b);assert.equal(a.messages.filter(m=>m.type==='boss-win').length,1);
});
test('ataques afetam ambos, pausa e estado vencido não recebem dano',()=>{
 const f=fixture(),s=f.service,a=f.peer(),b=f.peer();s.create(a,'A');s.join(b,a.room.code,'B');
 for(const p of [a,b])s.message(p,{type:'state',state:state()});s.tick(.05);const boss=a.room.boss;boss.phase='golpear';boss.timer=.4;boss.aim=[144,3.167,2];
 s.tick(.05);for(const p of [a,b])assert.equal(p.messages.filter(m=>m.type==='hit').length,1);s.tick(.05);assert.equal(a.messages.filter(m=>m.type==='hit').length,1);
 boss.hits.clear();s.message(b,{type:'state',state:state({active:false})});s.tick(.05);assert.equal(b.messages.filter(m=>m.type==='hit').length,1);
 f.advance(2500);boss.hits.clear();s.tick(.05);assert.equal(a.messages.filter(m=>m.type==='hit').length,2);
});
test('habilidades respeitam alcance, skin, recarga e resistência do chefe',()=>{
 const f=fixture(),s=f.service,p=f.peer();s.create(p,'A');s.message(p,{type:'state',state:state({skin:'carreta',pos:[130,3.167,0]})});s.tick(.05);
 f.advance(30000);s.message(p,{type:'state',state:state({skin:'carreta',pos:[130,3.167,0]})});const b=p.room.boss;b.phase='preparar';s.stun(p);assert.equal(b.phase,'cansado');
 b.phase='preparar';s.stun(p);assert.equal(b.phase,'preparar');f.advance(30000);s.message(p,{type:'state',state:state({skin:'extintor',pos:[130,3.167,0]})});s.stun(p);assert.equal(b.phase,'preparar');
 s.message(p,{type:'state',state:state({skin:'tusk'})});s.stun(p);assert.equal(b.phase,'preparar');
});
test('HTTP público e WebSocket real: conexão, entrada, isolamento e dados inválidos',async()=>{
 const app=createGameServer();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.server.address().port;
 const sockets=[];const connect=()=>new Promise((resolve,reject)=>{const ws=new WebSocket(base.replace('http:','ws:')+'/online');sockets.push(ws);ws.messages=[];ws.on('message',raw=>ws.messages.push(JSON.parse(raw)));ws.once('open',()=>resolve(ws));ws.once('error',reject);});
 const until=async fn=>{for(let i=0;i<100;i++){if(fn())return;await new Promise(r=>setTimeout(r,10));}throw Error('Timeout');};
 try{
  assert.equal((await fetch(base+'/health')).status,200);assert.equal((await fetch(base+'/server/index.cjs')).status,404);assert.equal((await fetch(base+'/.env')).status,404);
  const old=await connect();old.send(JSON.stringify({type:'create',protocol:1,name:'Antigo'}));
  await until(()=>old.messages.some(m=>m.type==='error'&&m.message.includes('Atualize')));old.close();
  const a=await connect();a.send(JSON.stringify({type:'create',protocol,name:'A'}));await until(()=>a.messages.some(m=>m.type==='welcome'));const code=a.messages.find(m=>m.type==='welcome').code;
  const b=await connect();b.send(JSON.stringify({type:'join',protocol,code,name:'B'}));await until(()=>b.messages.some(m=>m.type==='welcome'));
  a.send(JSON.stringify({type:'state',state:state()}));await until(()=>b.messages.some(m=>m.type==='snapshot'&&m.players.some(p=>p.name==='A'&&p.state?.pos[0]===144)));
  a.close();await until(()=>b.messages.some(m=>m.type==='snapshot'&&m.players.length===1));
  const bad=await connect();const closed=new Promise(r=>bad.once('close',r));bad.send('{broken');assert.equal(await closed,1007);
 }finally{for(const ws of sockets)ws.terminate();await app.close();}
});
