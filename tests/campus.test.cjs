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
  const [x,y,z]=campus.switches[0];
  assert.equal(campus.atSwitch([-96,y,z],0),false);
  assert.equal(campus.atSwitch([x-.8,y,z],0),false);
  assert.ok(campus.atSwitch([x+.8,y,z],0));
  place(a,[x+.8,y,z]);task(a,'left');place(b,campus.switches[1]);task(b,'right');assert.equal(room.campus.gate,true);
});
test('resgate exige aliado próximo; prazo e desconexão nunca duplicam a morte',()=>{
  const {a,b,room,place,act,join,step}=setup();join();place(a,[-82,campus.ground+3,0]);act(a,'fall');
  act(b,'rescue',{id:a.id});assert.ok(a.downUntil);place(b,[-82,campus.ground+3,1]);act(b,'rescue',{id:a.id});
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

test('escada com retorno em cada patamar liga os três pisos nos dois sentidos',()=>{
  const {sanitizeState}=require('../server/rooms.cjs');
  const p={x:-110,y:0,z:0},zones=new Set();
  function fly(x,z){
    const dx=x-p.x,dz=z-p.z,n=Math.ceil(Math.hypot(dx,dz)/.10);
    for(let i=0;i<n;i++){
      p.x+=dx/n;p.z+=dz/n;campus.constrain(p,.18);
      const v=[p.x,p.y,p.z],area=campus.areaAt(...v);assert.ok(area);zones.add(area.name);
      assert.ok(sanitizeState({pos:v,rot:[0,0,0,1]}));
    }
    assert.ok(Math.hypot(p.x-x,p.z-z)<.21,'passagem bloqueada para '+[x,z]+' em '+Object.values(p));
  }
  function stairs(up){
    const lane=up?-4.5:4.5;
    for(const [x,z] of [[-123,0],[-123,lane],[-150,lane],[-150,-lane],[-123,-lane],[-123,0],[-110,0]])fly(x,z);
  }
  stairs(true);assert.equal(campus.areaAt(p.x,p.y,p.z),campus.roof);
  stairs(false);assert.equal(campus.areaAt(p.x,p.y,p.z),campus.main);
  stairs(false);assert.equal(campus.areaAt(p.x,p.y,p.z),campus.courtyard);
  p.y=campus.ground+3;fly(-45,0);fly(-45,40);assert.equal(campus.areaAt(p.x,p.y,p.z),campus.kitchen);
  fly(-45,0);fly(66,0);assert.equal(campus.areaAt(p.x,p.y,p.z),campus.cleaning);
  fly(-110,0);stairs(true);assert.equal(campus.areaAt(p.x,p.y,p.z),campus.main);
  assert.ok(zones.has('Patamar da escada'));
});
test('lajes e grade do duto separam os andares para o cliente e o servidor',()=>{
  const {sanitizeState}=require('../server/rooms.cjs');
  const {x,z}=campus.shaft;
  for(const dir of [-1,1]){
    const p={x,y:campus.gateY-dir*4,z};
    for(let i=0;i<10;i++){p.y+=dir;campus.constrain(p,.18);}
    assert.ok(dir*(p.y-campus.gateY)<-campus.gateDepth);
    for(let i=0;i<8;i++){p.y+=dir;campus.constrain(p,.18,true);}
    assert.ok(dir*(p.y-campus.gateY)>4);
  }
  const state={pos:[x,campus.gateY,z],rot:[0,0,0,1]};
  assert.equal(sanitizeState(state),null);assert.ok(sanitizeState(state,true));
  for(const level of campus.levels){
    const pos=[0,level.floor+2,0];
    assert.equal(campus.levelAt(...pos),level.id);assert.equal(campus.floorAt(...pos),level.floor);
    assert.ok(sanitizeState({...state,pos}));
  }
  for(const pos of [[250,1,0],[0,-4.5,0],[0,13,0],[0,-20,65],[-142,2,35],[-120,2,14]])
    assert.equal(sanitizeState({...state,pos}),null);
  for(const [y,dir] of [[10,1],[campus.terrace+1,-1],[campus.ground+13,1],[campus.first+1,-1]]){
    const p={x:0,y,z:0},floor=campus.levelAt(0,y,0);
    for(let n=0;n<60;n++){p.y+=dir;campus.constrain(p,.18);}
    assert.equal(campus.levelAt(p.x,p.y,p.z),floor);
  }
});
test('faxineira, resgate e escudo só afetam o andar em que acontecem',()=>{
  const {a,b,room,place,act,join,step}=setup();join();
  place(a,[66,0,0]);place(b,[66,campus.terrace+1,0]);step(.2);
  assert.equal(room.campus.cleaner.phase,'espera');
  place(a,campus.cleanerHead);step(.2);assert.equal(room.campus.cleaner.phase,'aviso');
  step(1.7);assert.ok(a.log.some(m=>m.type==='cleaner-hit'));assert.ok(!b.log.some(m=>m.type==='cleaner-hit'));
  place(a,[0,11.85,0],'cadeado');place(b,[0,campus.terrace+.25,0]);
  act(a,'team-power');assert.ok(!b.log.some(m=>m.type==='shield'));
  act(b,'fall');act(a,'rescue',{id:b.id});assert.ok(b.downUntil);
  place(a,[0,campus.terrace+.25,1]);act(a,'rescue',{id:b.id});assert.equal(b.downUntil,0);
});
test('a altura máxima segue o teto do terraço e o raio usado para colidir',()=>{
  const {sanitizeState}=require('../server/rooms.cjs');
  for(const radius of [.075,.18,.1875]){
    for(const x of [-104,0,83]){
      const p={x,y:campus.roof.floor+1,z:5};
      while(p.y<campus.roof.top-radius){
        assert.equal(campus.atFlightCeiling([p.x,p.y,p.z],radius),false);
        p.y+=.53;campus.constrain(p,radius);
      }
      const pos=[p.x,p.y,p.z];
      assert.equal(campus.areaAt(...pos),campus.roof);
      assert.equal(campus.atFlightCeiling(pos,radius),true);
      assert.equal(sanitizeState({pos,rot:[0,0,0,1],skin:'astronauta'}).skin,'astronauta');
    }
  }
  assert.equal(campus.atFlightCeiling([0,campus.main.top,0],.18),false);
  assert.equal(campus.atFlightCeiling([0,campus.courtyard.top,0],.18),false);
  assert.equal(campus.atFlightCeiling([campus.shaft.x,campus.roof.top-.18,campus.shaft.z],.18),false);
  assert.equal(campus.validPosition([4,campus.roof.top+1,0]),false);
});

test('a superfície da escada acompanha o voo sem saltos nos espelhos dos degraus',()=>{
  for(const flight of campus.flights){
    for(const radius of [.075,.18,.1875]){
      const p={x:flight.from,y:flight.floor+radius+.01,z:flight.z};
      for(let i=1;i<=200;i++){
        const old=p.y;
        p.x=flight.from+(flight.to-flight.from)*i/200;
        campus.constrain(p,radius);
        assert.ok(p.y-old<.055,'salto ao subir o degrau');
        assert.ok(p.y>=flight.floor+campus.stepOffset(flight,p.x)+radius-.001);
        assert.ok(campus.validPosition([p.x,p.y,p.z]));
      }
      assert.ok(Math.abs(p.y-flight.floor-flight.rise-radius-.01)<.055);
    }
  }
});

test('a vitória da faxineira premia uma vez cada participante conectado',()=>{
  const {a,b,room,service,place,act,join,step}=setup();join();
  const spectator={log:[]};service.join(spectator,room.code,'C');place(spectator,[0,2,0]);
  place(a,campus.cleanerHead);place(b,campus.cleanerHead);step(.1);
  room.campus.cleaner.hp=20;room.campus.cleaner.phase='cansada';
  act(a,'cleaner-bite');step(1);act(b,'cleaner-bite');
  for(const p of [a,b])assert.equal(p.log.filter(m=>m.type==='cleaner-win').length,1);
  assert.ok(!spectator.log.some(m=>m.type==='cleaner-win'));
  for(const skin of ['neon','faxineira']){
    place(a,campus.cleanerHead,skin);assert.equal(a.state.skin,skin);
  }
});

test('espuma limpa as poças próximas para a sala e respeita a recarga',()=>{
  const {a,room,place,act}=setup();
  place(a,campus.cleanerHead,'faxineira');
  room.campus.cleaner.pools=[{x:66,z:1,time:7},{x:77,z:5,time:7}];
  act(a,'team-power');assert.deepEqual(room.campus.snapshot().cleaner.pools.map(p=>p.x),[77]);
  place(a,[77,campus.cleanerHead[1],5],'faxineira');act(a,'team-power');
  assert.equal(room.campus.cleaner.pools.length,1);
});

test('voo atravessa os vãos centrais e laterais nos quatro lances, inclusive online',()=>{
  const {sanitizeState}=require('../server/rooms.cjs');
  for(const f of campus.flights)for(const r of [.075,.1875]){
    const side=Math.sign(f.z),x=(f.from+f.to)/2,y=f.floor+f.rise/2+1;
    const p={x,y,z:side*9.5};
    for(const dir of [-side,side]){
      for(let i=0;i<160;i++){
        p.z+=dir*.1;campus.constrain(p,r);
        assert.ok(Math.abs(p.y-y)<.001);
        assert.ok(sanitizeState({pos:[p.x,p.y,p.z],rot:[0,0,0,1]}));
      }
      assert.ok(Math.abs(p.z-(dir===side?9.5:-6.5)*side)<.001);
    }
    assert.equal(campus.validPosition([x,y,side*11]),false);
    assert.equal(campus.validPosition([x,f.floor+f.rise/2-.3,f.z]),false);
  }
  const p={x:-136,y:campus.ground+.2,z:0};
  for(let i=0;i<500;i++){p.y+=.1;campus.constrain(p,.18);}
  assert.ok(Math.abs(p.y-campus.stairwell.top+.18)<.001);
});
