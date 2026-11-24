// A escada, a planta e a simulação da sala usam as mesmas cotas e o mesmo espaço de voo.
(function (root) {
  'use strict';
  const protocol=4;
  const ground=-21.5, first=-3.5, terrace=14.12;
  const levels=[
    {id:'ground',name:'Térreo',floor:ground},
    {id:'first',name:'1º andar',floor:first},
    {id:'terrace',name:'Terraço',floor:terrace}
  ];
  const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  const contains=(box,x,z)=>x>=box[0]&&x<=box[1]&&z>=box[2]&&z<=box[3];
  function room(name,level,box,floor,top){
    return {name,level,box,floor,top,x:(box[0]+box[1])/2,z:(box[2]+box[3])/2};
  }
  const main=room('Prédio principal','first',[-118,118,-100,100],first,12);
  const arena=room('Sala 3','first',[118,158,-18,18],first,12);
  const courtyard=room('Pátio','ground',[-118,46,-22,22],ground,-5.53);
  const kitchen=room('Cozinha','ground',[-61,-29,22,58],ground,ground+10.17);
  const cleaning=room('Zeladoria','ground',[46,82,-16,16],ground,ground+11.8);
  const roof=room('Terraço','terrace',[-118,94,-18,18],terrace,terrace+40);
  const gateY=2,gateDepth=1.24;
  const shaft=room('Duto dos relés',null,[-132,-123,11,18],ground,terrace+6.5);
  const entrances=[
    room('Porta da cozinha','ground',[-48.45,-41.55,20.5,23.5],ground,ground+6.3),
    room('Porta da zeladoria','ground',[44.3,47.7,-3.65,3.65],ground,ground+7.2),
    room('Porta da Sala 3','first',[116,120,-5,5],first,first+9.5)
  ];
  const landings=[], flights=[];
  const east=-126,west=-146,steps=20,flightHeight=7.7;
  for(const level of levels){
    landings.push(room('Escada central',level.id,[-127,-120,-8,8],level.floor,level.floor+flightHeight));
    entrances.push(room('Entrada da escada',level.id,[-121.5,-116,-3.8,3.8],level.floor,level.floor+7.1));
    if(level.id!=='first')entrances.push(room('Acesso ao duto',level.id,[-124.5,-116,12,16.8],level.floor,level.floor+6.5));
  }
  for(let i=0;i<levels.length-1;i++){
    const bottom=levels[i],upper=levels[i+1],half=(bottom.floor+upper.floor)/2;
    landings.push(room('Patamar da escada',bottom.id,[-154,-145,-8,8],half,half+flightHeight));
    for(const outward of [true,false]){
      const low=outward?bottom.floor:half,high=outward?half:upper.floor;
      const flight=room('Escada central',outward?bottom.id:upper.id,
        [-147,-125,...(outward?[-8,-1.15]:[1.15,8])],low,low+flightHeight);
      Object.assign(flight,{from:outward?east:west,to:outward?west:east,rise:high-low,steps});
      flights.push(flight);
    }
  }
  // Mantém as lajes, a caixa da escada e as paredes externas válidas até para Fantasma.
  const stairCells=new Set([...landings,...flights,...entrances.filter(c=>c.name==='Entrada da escada')]);
  const fixed=[main,arena,courtyard,kitchen,cleaning,roof,...entrances,...landings,...flights];
  const unlocked=[...fixed,shaft],locked=[...fixed,{...shaft,top:gateY-gateDepth},{...shaft,floor:gateY+gateDepth}];
  const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
  function stepOffset(cell,x){
    if(!cell.steps)return 0;
    const t=clamp((x-cell.from)/(cell.to-cell.from),0,1);
    return Math.min(cell.steps,Math.floor(t*cell.steps+1e-8))*cell.rise/cell.steps;
  }
  function locate(x,y,z,cells,tolerance=0){
    for(const cell of cells){
      if(!contains(cell.box,x,z))continue;
      const dy=stepOffset(cell,x);
      if(y>=cell.floor+dy-tolerance&&y<=cell.top+dy+tolerance)return cell;
    }
  }
  function areaAt(x,y,z){return locate(x,y,z,unlocked,.08);}
  function levelAt(x,y,z){
    const area=areaAt(x,y,z);
    return area?.level||(y<first-2?'ground':y>=terrace-.12?'terrace':'first');
  }
  function floorAt(x,y,z){
    const cell=areaAt(x,y,z);
    return cell?cell.floor+stepOffset(cell,x):first;
  }
  function sameLevel(a,b){return levelAt(...a)===levelAt(...b);}
  function atFlightCeiling([x,y,z],radius){
    return contains(roof.box,x,z)&&y<=roof.top+.001&&y>=roof.top-radius-.001;
  }
  function inSchool(pos){
    return pos.x>=-118&&pos.x<=158&&pos.y>=first-.1&&pos.y<=12.1;
  }
  function constrain(pos,radius,gate=false){
    let best=Infinity,x=pos.x,y=pos.y,z=pos.z,stairY=null;
    for(const cell of gate?unlocked:locked){
      const b=cell.box,px=clamp(pos.x,b[0]+radius,b[1]-radius);
      const pz=clamp(pos.z,b[2]+radius,b[3]-radius);
      const flat=(px-pos.x)**2+(pz-pos.z)**2;
      if(flat>=best)continue;
      const dy=stepOffset(cell,px),py=clamp(pos.y,cell.floor+dy+radius+.01,cell.top+dy-radius);
      const cost=flat+(py-pos.y)**2;
      if(cost===0)return true;
      // Ao sair do patamar, um espelho de degrau deve levantar o mosquito antes que
      // a borda do patamar o empurre horizontalmente de volta. Vale também na descida.
      if(flat===0&&Math.abs(py-pos.y)<=.68&&stairCells.has(cell))stairY=py;
      if(cost<best){best=cost;x=px;y=py;z=pz;}
    }
    if(stairY!==null){pos.y=stairY;return true;}
    pos.x=x;pos.y=y;pos.z=z;return true;
  }
  function validPosition([x,y,z],gate=false){return !!locate(x,y,z,gate?unlocked:locked,.08);}
  const switches=[[-96,ground+3.05,-11],[-96,ground+3.05,8]];
  const folder=[-44,0,-82], cleanerHead=[66,ground+5.55,0];
  const sprinkler=[-80,ground+.58,-13],steam=[-34.25,ground+3.9,36],vane=[57,terrace+5.45,-10];
  const secrets=[
    ['folhagem','Folha Seca',0x4d8049,0xbadc87,'Procure o duto verde junto aos bancos do pátio, no térreo.'],
    ['cobre','Cobre Polido',0xa9603a,0xffb569,'Vença a faxineira e procure atrás dos armários da zeladoria no térreo.'],
    ['ardosia','Asa de Ardósia',0x435274,0xb8dafa,'Passe pela fresta entre os respiradouros perto do mirante do terraço.']
  ];
  const hidingPlaces=[[-67,ground+1.52,13],[77.2,ground+1.6,-10],[77,terrace+1.65,9]];
  function cleaner() { return { hp:180, phase:'espera', time:0, turn:0, aim:[...cleanerHead], pools:[], stun:0 }; }
  function stepCleaner(c,dt,targets,hit) {
    c.pools.forEach(p=>p.time-=dt);
    c.pools=c.pools.filter(p=>p.time>0);
    if (!targets.length || c.hp<=0) return;
    c.time-=dt;
    if(c.stun>0){c.stun-=dt;return;}
    for(const p of targets){
      if(c.pools.some(pool=>p.pos[1]<ground+2.7 && Math.hypot(p.pos[0]-pool.x,p.pos[2]-pool.z)<2.4))hit(p,12);
    }
    if(c.time>0)return;
    if(c.phase==='aviso'){
      for(const p of targets){
        if(c.attack==='spray'?distance(p.pos,c.aim)<3.3:distance(p.pos,cleanerHead)<5.8)hit(p,32);
      }
      c.pools.push({x:c.aim[0],z:c.aim[2],time:7});
      c.phase='cansada';c.time=2.4;
    }else{
      const target=targets[c.turn%targets.length];
      c.attack=c.turn++%2?'pano':'spray';c.aim=[...target.pos];c.phase='aviso';c.time=1.6;
    }
  }
  function biteCleaner(c,pos,level) {
    if(c.hp<=0 || c.phase!=='cansada' || distance(pos,cleanerHead)>3.1)return false;
    c.hp=Math.max(0,c.hp-20-Math.min(15,level));if(!c.hp)c.phase='vencida';
    return true;
  }
  const api={protocol,levels,ground,first,terrace,main,arena,courtyard,kitchen,cleaning,roof,shaft,
    landings,flights,gateY,gateDepth,stepOffset,areaAt,levelAt,inSchool,floorAt,sameLevel,constrain,
    validPosition,atFlightCeiling,distance,switches,folder,cleanerHead,secrets,hidingPlaces,sprinkler,steam,vane,cleaner,stepCleaner,biteCleaner};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.EscolaCampus=api;
})(globalThis);
