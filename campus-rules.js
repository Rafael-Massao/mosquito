// Regras compartilhadas pelo navegador e pelo servidor da escola.
(function (root) {
  'use strict';
  const protocol=2;
  const ground=-3.5, roofLevel=.98;
  // Coordenadas da escola usadas pela planta, pela colisão e pelas salas online.
  const courtyard={name:'Pátio',x:-142,z:0,box:[-160,-124,-16,16],fill:'#a9c4a2'};
  const kitchen={name:'Cozinha',x:-192,z:0,box:[-210,-174,-16,16],fill:'#e1c5a4'};
  const roof={name:'Telhado',x:-150,z:42,box:[-168,-132,26,58],fill:'#acbec9'};
  const porch={name:'Varanda do corredor',box:[-125,-116,-3.8,3.8],fill:'#e7d3ad'};
  const gallery={name:'Galeria coberta',box:[-175,-159,-3.45,3.45],fill:'#d4b59a'};
  const stairs={name:'Escada de serviço',box:[-201.45,-194.55,15,45.45],fill:'#a8b6ae'};
  const walkway={name:'Passarela',box:[-200,-167,38.55,45.45],fill:'#a8b6ae'};
  const bridge={name:'Rampa dos relés',box:[-144.4,-139.6,15,27],fill:'#d5b59b'};
  const zones=[courtyard,kitchen,roof,porch,gallery,stairs,walkway,bridge];
  const schoolEdge=[-118,-112,-100,100],gateZ=21;
  const gateDepth=1.2;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const inside=(x,z,[x0,x1,z0,z1])=>x>=x0&&x<=x1&&z>=z0&&z<=z1;
  function areaAt(x,z){return x<=-118?zones.find(zone=>inside(x,z,zone.box)):undefined;}
  function floorAt(x,z){
    if(inside(x,z,bridge.box))return ground+(roofLevel-ground)*clamp((z-16)/10,0,1);
    if(inside(x,z,stairs.box))return ground+.32*clamp(Math.floor(z-16)+1,0,14);
    if(inside(x,z,roof.box)||inside(x,z,walkway.box))return roofLevel;
    return ground;
  }
  function ceilingAt(x,z){
    if(inside(x,z,kitchen.box))return 6.65;
    if(inside(x,z,bridge.box)&&z>=16&&z<=26)return floorAt(x,z)+5;
    if(x>=-124&&x<=-118&&Math.abs(z)<=3.8)return 3.65;
    return x>=-118?12:floorAt(x,z)+13.45;
  }
  // As extremidades das passagens se sobrepõem às salas pela largura do mosquito.
  // A faixa do prédio impede sair pelas salas vizinhas, inclusive com Fantasma.
  const permanent=[schoolEdge,...zones.filter(zone=>zone!==bridge).map(zone=>zone.box)];
  const footprints=[...permanent,bridge.box];
  const lockedBridge=[
    [bridge.box[0],bridge.box[1],bridge.box[2],gateZ-gateDepth],
    [bridge.box[0],bridge.box[1],gateZ+gateDepth,bridge.box[3]]
  ];
  const closedFootprints=[...permanent,...lockedBridge];
  function constrain(pos,radius,gate=false){
    if(pos.x>=-115)return false;
    let best=Infinity,x=pos.x,y=pos.y,z=pos.z;
    for(const [x0,x1,z0,z1] of gate?footprints:closedFootprints){
      const px=clamp(pos.x,x0+radius,x1-radius),pz=clamp(pos.z,z0+radius,z1-radius);
      const py=clamp(pos.y,floorAt(px,pz)+radius+.02,ceilingAt(px,pz)-radius);
      const cost=(px-pos.x)**2+(py-pos.y)**2+(pz-pos.z)**2;
      if(cost<best){best=cost;x=px;y=py;z=pz;}
      if(best===0)break;
    }
    pos.x=x;pos.y=y;pos.z=z;return true;
  }
  function validPosition([x,y,z],gate=false){
    return (gate?footprints:closedFootprints).some(box=>inside(x,z,box))
      && y>=floorAt(x,z)-.1 && y<=ceilingAt(x,z)+.1;
  }
  const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
  const switches=[[-134,1,10],[-150,1,10]];
  const folder=[-44,0,-82], cleanerHead=[-194,2.1,-2];
  const secrets = [
    ['folhagem','Folha Seca',0x4d8049,0xbadc87,'Entre no duto verde do pátio.'],
    ['cobre','Cobre Polido',0xa9603a,0xffb569,'Vença a faxineira e procure atrás dos armários da cozinha.'],
    ['ardosia','Asa de Ardósia',0x435274,0xb8dafa,'Passe pela fresta entre as chaminés do telhado.']
  ];
  function cleaner() { return { hp:180, phase:'espera', time:0, turn:0, aim:[...cleanerHead], pools:[], stun:0 }; }
  function stepCleaner(c,dt,targets,hit) {
    c.pools.forEach(p=>p.time-=dt);
    c.pools=c.pools.filter(p=>p.time>0);
    if (!targets.length || c.hp<=0) return;
    c.time-=dt;
    if(c.stun>0){c.stun-=dt;return;}
    for(const p of targets){
      if(c.pools.some(pool=>p.pos[1]<-.8 && Math.hypot(p.pos[0]-pool.x,p.pos[2]-pool.z)<2.4))hit(p,12);
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
  const api={protocol,zones,courtyard,kitchen,roof,bridge,roofLevel,gateZ,gateDepth,areaAt,floorAt,constrain,validPosition,distance,switches,folder,cleanerHead,secrets,cleaner,stepCleaner,biteCleaner};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.EscolaCampus=api;
})(globalThis);
