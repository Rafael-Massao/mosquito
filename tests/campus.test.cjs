const test=require('node:test');
const assert=require('node:assert/strict');
const {RoomService}=require('../server/rooms.cjs');
const campus=require('../campus-rules.js');

function setup(){
  let now=100_000;
  const service=new RoomService({now:()=>now,send:(peer,m)=>peer.log.push(m)});
  const a={log:[]},b={log:[]};
  service.create(a,'A');
  function place(p,pos,skin='pintado'){
    service.message(p,{type:'state',state:{pos,skin,rot:[0,0,0,1],health:1,speed:10,active:true}});
  }
  function act(p,type,data={}){service.message(p,{type,...data});}
  function join(){service.join(b,a.room.code,'B');place(b,[0,2,0]);}
  function step(dt){now+=dt*1000;service.tick(dt);}
  place(a,[0,2,0]);
  return {service,a,b,room:a.room,place,act,join,step};
}
test('missões exigem dois jogadores distintos ativos e posições simultâneas',()=>{
  const {a,b,room,place,act,join,step}=setup();
  const task=(p,action)=>act(p,'campus-task',{action});
  place(a,[-56,2,-85]);task(a,'distract');assert.equal(room.campus.distraction,null);
  join();task(a,'distract');place(a,campus.folder);task(a,'folder');assert.equal(room.campus.file,false);
  place(a,[-56,2,-85]);place(b,campus.folder);step(.05);task(b,'folder');assert.equal(room.campus.file,true);
  place(a,campus.switches[0]);task(a,'left');place(a,campus.switches[1]);task(a,'right');assert.equal(room.campus.gate,false);
  place(a,campus.switches[0]);task(a,'left');place(b,campus.switches[1]);task(b,'right');assert.equal(room.campus.gate,true);
});
test('resgate exige aliado próximo; prazo e desconexão nunca duplicam a morte',()=>{
  const {a,b,room,place,act,join,step}=setup();join();place(a,[200,1,0]);act(a,'fall');
  act(b,'rescue',{id:a.id});assert.ok(a.downUntil);place(b,[200,1,1]);act(b,'rescue',{id:a.id});
  assert.equal(a.downUntil,0);act(b,'rescue',{id:a.id});assert.equal(a.log.filter(m=>m.type==='revived').length,1);
  act(a,'fall');step(13);step(.1);assert.equal(a.log.filter(m=>m.type==='respawn').length,1);
  assert.equal(room.players.size,2);
});
test('poderes, pote, mancha e faxineira pertencem à sala',()=>{
  const {a,b,room,act,place,join,step}=setup();join();
  place(a,[0,1,0],'cadeado');act(a,'team-power');assert.ok(b.log.some(m=>m.type==='shield'));
  place(b,[-56,2,-85],'carreta');act(b,'team-power');assert.equal(room.campus.humans[0].stun,6);
  step(25);place(a,[0,1,0]);act(a,'team-power');assert.equal(room.campus.snapshot().heals[0].owner,a.id);
  const pot=room.campus.pots[24];place(a,[...pot.pos]);act(a,'push-pot',{index:24,dir:[0,0,1]});
  for(let i=0;i<110;i++){place(b,[0,2,0]);step(.05);}
  assert.ok(pot.fell);assert.equal(pot.spilled.length,2);assert.equal(room.campus.snapshot().pots[0][0],24);
  place(b,campus.cleanerHead);step(.05);assert.equal(room.campus.cleaner.phase,'aviso');act(b,'cleaner-bite');assert.equal(room.campus.cleaner.hp,180);
  step(1.7);assert.ok(b.log.some(m=>m.type==='cleaner-hit'));act(b,'cleaner-bite');assert.equal(room.campus.cleaner.hp,160);act(b,'cleaner-bite');assert.equal(room.campus.cleaner.hp,160);
});
