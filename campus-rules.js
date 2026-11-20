// Regras compartilhadas pelo navegador e pelo servidor da escola.
(function (root) {
  'use strict';
  const areas = [
    { name: 'Pátio', x: 200, color: 0x749c73 },
    { name: 'Cozinha', x: 250, color: 0xb7c9bd },
    { name: 'Telhado', x: 300, color: 0xaa7764 }
  ];
  const gallery = { name:'Galeria coberta' }, stairs = { name:'Escada de serviço' };
  function areaAt(x) {
    if (x < 182 || x > 318) return;
    if (x < 218) return areas[0];
    if (x < 232) return gallery;
    if (x <= 268) return areas[1];
    if (x < 282) return stairs;
    return areas[2];
  }
  // A escada tem quatorze degraus. A mesma cota orienta o voo, os efeitos e a rede.
  const floorAt = x => -3.5 + Math.min(14, Math.max(0, Math.floor(x - 268) + 1)) * .32;
  const ceilingAt = x => x>=232 && x<=268 ? 6.65 : floorAt(x)+13.45;
  const footprint = [[182,218,16],[232,268,16],[282,318,16],[182,318,3.45]];
  const clamp = (v,min,max) => Math.max(min,Math.min(max,v));
  function constrain(pos,radius) {
    if (pos.x < 175) return false;
    let best=Infinity, x=pos.x, z=pos.z;
    for (const [left,right,depth] of footprint) {
      const px=clamp(pos.x,left+radius,right-radius);
      const pz=clamp(pos.z,-depth+radius,depth-radius);
      const distance=(px-pos.x)**2+(pz-pos.z)**2;
      if (distance<best) { best=distance; x=px; z=pz; }
    }
    pos.x=x; pos.z=z;
    pos.y=clamp(pos.y,floorAt(x)+radius+.02,ceilingAt(x)-radius);
    return true;
  }
  function validPosition([x,y,z]) {
    return footprint.some(([left,right,depth])=>x>=left && x<=right && Math.abs(z)<=depth)
      && y>=floorAt(x)-.1 && y<=ceilingAt(x)+.1;
  }
  const distance = (a,b) => Math.hypot(a[0]-b[0], a[1]-b[1], a[2]-b[2]);
  const switches = [[192,1,-10],[208,1,-10]];
  const folder = [-44,0,-82];
  const cleanerHead = [252,2.1,2];
  const secrets = [
    ['folhagem','Folha Seca',0x4d8049,0xbadc87,'Entre no duto verde do pátio.'],
    ['cobre','Cobre Polido',0xa9603a,0xffb569,'Vença a faxineira e procure atrás dos armários da cozinha.'],
    ['ardosia','Asa de Ardósia',0x435274,0xb8dafa,'Passe pela fresta entre as chaminés do telhado.']
  ];
  function cleaner() { return { hp:180, phase:'espera', time:0, turn:0, aim:[252,0,2], pools:[], stun:0 }; }
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
  const api={areas,areaAt,floorAt,constrain,validPosition,distance,switches,folder,cleanerHead,secrets,cleaner,stepCleaner,biteCleaner};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.EscolaCampus=api;
})(globalThis);
