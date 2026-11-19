'use strict';
const {randomInt,randomUUID}=require('node:crypto');
const SKINS=new Set('pixel dengue relojoeiro radioativo jogador fantasma vampiro mosquito carreta eletrizado pintado extintor cadeado tusk mosquito8000 encadernado raquete'.split(' '));
const PARTS=['cabeca','foices','torax','abdomen'];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const dist=(a,b)=>Math.hypot(...a.map((n,i)=>n-b[i]));
function sanitizeState(s){
 if(!s||!Array.isArray(s.pos)||s.pos.length!==3||!s.pos.every(finite)||!Array.isArray(s.rot)||s.rot.length!==4||!s.rot.every(finite))return null;
 const norm=Math.hypot(...s.rot);if(norm<.9||norm>1.1)return null;
 if(s.pos[0]<-120||s.pos[0]>159||s.pos[1]<-4||s.pos[1]>14||Math.abs(s.pos[2])>110)return null;
 const nv={};for(const k of ['asas','tromba','estomago','corpo'])nv[k]=clamp(Math.floor(Number(s.nv?.[k])||0),0,30);
 if(Object.values(nv).some(v=>!finite(v)))return null;
 return {pos:s.pos,rot:s.rot.map(v=>v/norm),nv,skin:SKINS.has(s.skin)?s.skin:null,mantis:PARTS.filter(id=>Array.isArray(s.mantis)&&s.mantis.includes(id)),pixelCor:/^#[\da-f]{6}$/i.test(s.pixelCor)?s.pixelCor:'#e8294b',auraTusk:s.auraTusk!==false,active:s.active===true,door:s.door===true,speed:finite(s.speed)?clamp(s.speed,0,80):0,health:finite(s.health)?clamp(s.health,0,1):1};
}
function freshBoss(){return {pos:[144,-3.5,0],yaw:-Math.PI/2,phase:'espera',timer:0,life:300,max:300,furia:false,combo:0,aim:[144,2,0],kind:'varredura',attack:0,radius:2,idle:0,participants:new Set(),hits:new Map(),stunUntil:0};}
class RoomService{
 constructor({send,now=()=>Date.now(),maxRooms=100}={}){this.rooms=new Map();this.send=send;this.now=now;this.maxRooms=maxRooms;}
 error(peer,text){this.send(peer,{type:'error',message:text});}
 create(peer,name){
  if(this.rooms.size>=this.maxRooms)return this.error(peer,'Servidor cheio. Tente novamente mais tarde.');
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let code;
  do{code=Array.from({length:6},()=>chars[randomInt(chars.length)]).join('');}while(this.rooms.has(code));
  this.rooms.set(code,{code,players:new Map(),door:false,boss:freshBoss(),emptySince:this.now()});this.join(peer,code,name);
 }
 join(peer,code,name){
  if(peer.room)return this.error(peer,'Você já está em uma sala.');
  const room=this.rooms.get(String(code||'').toUpperCase());
  if(!room)return this.error(peer,'Sala não encontrada. Confira o código.');
  if(room.players.size>=4)return this.error(peer,'Sala cheia: o limite é de 4 jogadores.');
  const label=String(name||'Mosquito').replace(/[\x00-\x1f\x7f]/g,'').trim().slice(0,20)||'Mosquito';
  peer.id=randomUUID();peer.room=room;peer.name=label;peer.state=null;peer.lastState=0;peer.lastBite=0;peer.lastStun=0;
  room.players.set(peer.id,peer);room.emptySince=0;
  this.send(peer,{type:'welcome',id:peer.id,code:room.code,maxPlayers:4,protocol:1});this.snapshot(room);
 }
 leave(peer){const room=peer.room;if(!room)return;room.players.delete(peer.id);peer.room=null;if(!room.players.size)room.emptySince=this.now();else this.snapshot(room);}
 message(peer,m){
  if(!m||typeof m!=='object')return;
  if(m.type==='create'||m.type==='join'){
   if(peer.room)return this.error(peer,'Você já está em uma sala.');
   if(m.protocol!==1)return this.error(peer,'Versão incompatível. Atualize o jogo.');
   return m.type==='create'?this.create(peer,m.name):this.join(peer,m.code,m.name);
  }
  const room=peer.room;if(!room)return;
  if(m.type==='state'){const s=sanitizeState(m.state);if(!s)return;peer.state=s;peer.lastState=this.now();if(s.door)room.door=true;}
  else if(m.type==='bite')this.bite(peer);
  else if(m.type==='stun')this.stun(peer);
 }
 active(p){return p.state?.active&&p.state.health>0&&this.now()-p.lastState<2000;}
 arena(p){const a=p.state?.pos;return this.active(p)&&a[0]>120&&a[0]<157.5&&Math.abs(a[2])<17.5;}
 bite(p){
  const r=p.room,b=r.boss,s=p.state;if(!r.door||!this.arena(p)||b.phase==='espera'||b.life<=0)return;
  const act=Math.max(1,s.mantis.length),colhe=s.skin==='tusk'?[1.1,1.25,1.4,1.6][act-1]:s.skin==='encadernado'?1.1:s.skin==='mosquito8000'?1.2:1;
  const reach=Math.min(3.2,(.9+s.nv.tromba*.15)*colhe+.9);
  if(dist(s.pos,[b.pos[0],b.pos[1]+6.667,b.pos[2]])>reach)return;
  if(b.phase!=='cansado')return this.send(p,{type:'notice',message:'⚡ Espere o fim do combo para picar o chefe!'});
  if(this.now()-p.lastBite<900)return;p.lastBite=this.now();b.participants.add(p.id);
  b.life=Math.max(0,b.life-Math.min(35,20+s.nv.tromba));
  this.send(p,{type:'bite-ok',life:b.life});
  if(b.life===0){b.phase='caindo';b.timer=2.8;for(const player of r.players.values())if(b.participants.has(player.id))this.send(player,{type:'boss-win'});}
  else if(!b.furia&&b.life<=b.max/2){b.furia=true;b.phase='furia';b.timer=1.2;}
  this.snapshot(r);
 }
 stun(p){
  const b=p.room.boss;if(!this.arena(p)||b.life<=0||['espera','cansado','furia'].includes(b.phase))return;
  const skills={raquete:[18,10],eletrizado:[18,10],extintor:[22,8],encadernado:[24,14],carreta:[20,22]};
  const skill=skills[p.state.skin];if(!skill||this.now()-p.lastStun<skill[0]*1000||this.now()<b.stunUntil)return;
  if(dist(p.state.pos,[b.pos[0],b.pos[1]+6.667,b.pos[2]])>skill[1])return;
  p.lastStun=this.now();b.stunUntil=this.now()+7000;b.phase='cansado';b.timer=b.furia?.75:1.15;
 }
 tick(dt){
  for(const r of this.rooms.values()){
   if(!r.players.size&&this.now()-r.emptySince>90000){this.rooms.delete(r.code);continue;}
   const b=r.boss,players=[...r.players.values()].filter(p=>this.arena(p));
   if(!players.length||!r.door){b.idle+=dt;if(b.idle>15)r.boss=freshBoss();continue;}b.idle=0;
   if(b.life<=0){b.timer=Math.max(0,b.timer-dt);if(!b.timer)b.phase='derrotado';continue;}
   for(const p of players)b.participants.add(p.id);
   const target=players.reduce((a,p)=>dist(p.state.pos,b.pos)<dist(a.state.pos,b.pos)?p:a),pos=target.state.pos;
   if(b.phase==='espera'){b.max=300+120*(players.length-1);b.life=b.max;b.phase='perseguir';b.timer=.6;}
   b.timer-=dt;
   const dx=pos[0]-b.pos[0],dz=pos[2]-b.pos[2],d=Math.hypot(dx,dz);b.yaw=Math.atan2(dx,dz);
   if(b.phase==='perseguir'){
    const speed=d>3.6?(b.furia?6.8:5.2):d<2?-3:0;
    if(d>.01){b.pos[0]=clamp(b.pos[0]+dx/d*speed*dt,126,151);b.pos[2]=clamp(b.pos[2]+dz/d*speed*dt,-3,3);}
    if(b.timer<=0){b.combo=0;this.prepare(b,pos);}
   }else if(b.phase==='preparar'){
    if(b.timer>.4)b.aim=[...pos];
    if(b.timer<=0){b.phase='golpear';b.timer=.42;b.hits.clear();}
   }else if(b.phase==='golpear'){
    for(const p of players)if(!b.hits.has(p.id)&&dist(p.state.pos,b.aim)<b.radius+.15){b.hits.set(p.id,true);this.send(p,{type:'hit',damage:b.furia?46:36,origin:b.pos});}
    if(b.timer<=0){b.phase=b.combo<(b.furia?3:2)?'intervalo':'cansado';b.timer=b.phase==='intervalo'?.18:(b.furia?1.3:1.7);}
   }else if(b.phase==='intervalo'&&b.timer<=0)this.prepare(b,pos);
   else if((b.phase==='cansado'||b.phase==='furia')&&b.timer<=0){b.phase='perseguir';b.timer=.4;}
  }
 }
 prepare(b,pos){b.combo++;b.attack++;b.phase='preparar';b.timer=b.furia?.85:1.05;b.aim=[...pos];b.kind=dist(b.pos,pos)<7?'varredura':'descarga';b.radius=b.furia?2.3:1.9;}
 snapshot(r){
  const b=r.boss,packet={type:'snapshot',code:r.code,door:r.door,players:[...r.players.values()].map(p=>({id:p.id,name:p.name,state:p.state?{...p.state,active:!!this.active(p)}:null})),boss:{pos:b.pos,yaw:b.yaw,phase:b.phase,timer:b.timer,life:b.life,max:b.max,furia:b.furia,combo:b.combo,aim:b.aim,kind:b.kind,attack:b.attack,radius:b.radius}};
  for(const p of r.players.values())this.send(p,packet);
 }
 broadcast(){for(const r of this.rooms.values())if(r.players.size)this.snapshot(r);}
}
module.exports={RoomService,sanitizeState};
