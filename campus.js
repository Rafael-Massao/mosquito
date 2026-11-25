/* Escola em três níveis. A planta e o servidor usam o mesmo espaço de voo. */
window.SchoolCampus = class SchoolCampus {
  constructor(game) {
    this.g=game;
    this.rules=window.EscolaCampus;
    this.localCleaner=this.rules.cleaner();
    this.gateLift=0;
    this.secrets=[];
    this.splashes=new Map();
    this.poolMeshes=[];
    this.healMeshes=[];
    this.clock=0;
    this.hitAt=0;
    this.firstVisit=new Set();
    this.orange=0xf3a545;
    this.materials=new Map();
    this.createRooms();
    this.cleanerHud=game.mundo.chefe.hud.cloneNode(true);
    this.cleanerHud.setAttribute('aria-label','Chefe da zeladoria');
    this.cleanerHud.querySelector('b').textContent='🧹 FAXINEIRA';
    this.cleanerTrack=this.cleanerHud.querySelector('[role="progressbar"]');
    this.cleanerTrack.setAttribute('aria-valuemax',String(this.localCleaner.hp));
    this.cleanerLife=this.cleanerHud.querySelector('.boss-hp');
    this.cleanerBar=this.cleanerTrack.querySelector('i');
    this.cleanerHint=this.cleanerHud.querySelector('small');
    document.body.appendChild(this.cleanerHud);
    this.bodies=[...game.mundo.lab.corpos,...game.mundo.tintas.corpos];
    this.origins=this.bodies.map(b=>b.g.position.clone());
  }
  mesh(geometry,color,x,y,z,solid=false,parent=null) {
    if(!this.materials.has(color))this.materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.74}));
    const obj=new THREE.Mesh(geometry,this.materials.get(color));
    if(solid)this.g.mundo.fixo(obj,x,y,z);
    else{obj.position.set(x,y,z);(parent||this.g.cena).add(obj);}
    return obj;
  }
  box(x,y,z,w,h,d,color,solid=false,parent=null){
    return this.mesh(new THREE.BoxGeometry(w,h,d),color,x,y,z,solid,parent);
  }
  ball(x,y,z,r,color,parent=null){
    return this.mesh(new THREE.SphereGeometry(r,12,8),color,x,y,z,false,parent);
  }
  createRooms(){
    const art=this.art=new CampusScenery(this.g);
    const rules=this.rules;
    art.skybox();art.surroundings();
    art.setRoom('escada',0,0);art.stairs();art.serviceShaft();
    art.setRoom('pátio',0,0,rules.ground);art.courtyard();
    art.setRoom('cozinha',rules.kitchen.x,rules.kitchen.z,rules.ground+3.5,-Math.PI/2);art.kitchen();
    art.setRoom('zeladoria',0,0,rules.ground);art.cleaningRoom();
    art.setRoom('terraço',0,0,rules.terrace);art.terraceDeck();
    this.relays=rules.switches.map(([x,y,z])=>{
      const light=this.ball(x,y,z,.26,this.orange);
      light.scale.x=.48;
      light.material=light.material.clone();light.material.emissiveIntensity=.22;
      return light;
    });
    this.fileMesh=this.box(...this.rules.folder,1.4,.25,.95,0xffbe59);
    this.water=new THREE.Group();this.water.position.fromArray(rules.sprinkler);this.g.cena.add(this.water);
    const jets=[];
    for(let j=0;j<5;j++){
      const angle=j*2*Math.PI/5;
      for(let k=0;k<14;k++){
        const t=k/14,u=(k+.73)/14;
        for(const phase of [t,u])jets.push(1.52*phase*Math.cos(angle),12.7*phase*(1-phase)-.55*phase,1.52*phase*Math.sin(angle));
      }
    }
    const waterGeo=new THREE.BufferGeometry();waterGeo.setAttribute('position',new THREE.Float32BufferAttribute(jets,3));
    this.water.add(new THREE.LineSegments(waterGeo,new THREE.LineBasicMaterial({color:0x9ae8e7,transparent:true,opacity:.85})));
    this.steam=new THREE.Group();this.steam.position.fromArray(rules.steam);this.g.cena.add(this.steam);
    const puff=new THREE.IcosahedronGeometry(1,1);
    for(let i=0;i<5;i++){
      const cloud=new THREE.Mesh(puff,new THREE.MeshBasicMaterial({color:0xfff4df,transparent:true,depthWrite:false,opacity:.25}));
      this.steam.add(cloud);
    }
    this.vane=new THREE.Group();this.vane.position.fromArray(rules.vane);this.g.cena.add(this.vane);
    this.box(0,0,0,3.8,.13,.12,0x8c6958,false,this.vane);
    this.box(-1.34,.23,0,.87,.61,.12,0xcf8558,false,this.vane);
    this.mesh(new THREE.ConeGeometry(.37,.82,3),0xe2a663,1.93,0,0,false,this.vane).rotation.z=-Math.PI/2;
    rules.hidingPlaces.forEach((pos,i)=>this.hideSkin(i,pos));
    art.finish();
    this.cleanerGroup=new THREE.Group();
    this.cleanerGroup.position.set(rules.cleanerHead[0],rules.ground,rules.cleanerHead[2]);
    this.cleanerGroup.rotation.y=-Math.PI/2;this.g.cena.add(this.cleanerGroup);
    const g=this.cleanerGroup;
    for(const x of [-.36,.36]){this.box(x,1.2,0,.55,2.4,.58,0x334660,false,g);this.box(x,.22,.18,.66,.4,.9,0x303342,false,g);}
    this.mesh(new THREE.CylinderGeometry(.72,.94,2.16,16),0x318e90,0,3.47,0,false,g);
    this.mesh(new THREE.CylinderGeometry(.25,.32,.6,12),0x9d654b,0,4.76,-.02,false,g);
    this.box(0,3.17,.84,1.0,1.4,.08,0xead5a9,false,g);
    this.box(0,3.96,.76,.76,.74,.09,0xead5a9,false,g);
    this.box(0,3.12,.90,.58,.36,.05,0xcfa977,false,g);
    for(const x of [-.29,.29])this.box(x,4.34,.65,.11,.46,.08,0xead5a9,false,g);
    this.ball(0,5.55,0,.66,0x9d654b,g);
    this.mesh(new THREE.SphereGeometry(.69,16,10,0,Math.PI*2,0,1.47),0x49332f,0,5.60,-.04,false,g);
    this.ball(0,6.07,-.48,.36,0x49332f,g);
    for(const x of [-.23,.23]){
      this.ball(x,5.63,.59,.092,0xf8dfbf,g).scale.set(1,.85,.54);
      this.ball(x,5.63,.635,.052,0x392b2a,g);
      this.box(x,5.77,.58,.18,.046,.057,0x46312c,false,g).rotation.z=x*.35;
      this.ball(x*2.65,5.49,0,.13,0x9d654b,g).scale.set(.7,1,.79);
      this.ball(x*3.40,4.26,.02,.34,0x327e81,g);
    }
    this.ball(0,5.47,.61,.104,0xaf7252,g);
    this.box(0,5.29,.58,.18,.036,.045,0x653c36,false,g);
    this.arm=new THREE.Group();this.arm.position.set(.9,4.2,0);g.add(this.arm);
    this.box(0,-.5,.1,.38,1.1,.42,0x9d654b,false,this.arm);
    this.box(0,-1,.55,.55,.78,.4,0x5eb9ea,false,this.arm);
    this.box(0,-.5,.68,.25,.22,.55,0xf7c678,false,this.arm);
    this.box(-1,3.8,0,.42,1.3,.42,0x9d654b,false,g);
    this.cloth=this.box(-1.1,3,.3,1.15,.16,1.75,0xe0aa72,false,g);
    this.warning=this.mesh(new THREE.TorusGeometry(1,.06,6,36),0xffab42,...this.rules.cleanerHead);
    this.mist=Array.from({length:10},()=>{const drop=this.ball(0,0,0,.13,0x83ddd9);drop.visible=false;return drop;});
    this.warning.rotation.x=-Math.PI/2;this.warning.visible=false;
  }
  hideSkin(index,pos){
    const [x,y,z]=pos,color=this.rules.secrets[index][2];
    const mesh=this.mesh(new THREE.OctahedronGeometry(.4),color,x,y,z);
    this.secrets.push({id:this.rules.secrets[index][0],pos,mesh});
  }
  get online(){return this.g.online?.active?this.g.online:null;}
  get player(){return this.g.jogador.pos.toArray();}
  get shared(){return this.online?.campus;}
  nearby(pos,r){return this.rules.distance(this.player,pos)<r;}
  bound(pos,radius){
    return this.rules.constrain(pos,radius,!!this.shared?.gate);
  }
  action(){
    const peers=this.online?.members||[];
    const ally=peers.find(p=>p.down&&p.id!==this.online.id&&p.state&&this.nearby(p.state.pos,3.5)&&this.rules.sameLevel(this.player,p.state.pos));
    if(ally)return {text:'Reanimar '+ally.name,run:()=>this.online.send({type:'rescue',id:ally.id})};
    const secret=this.secrets.find(s=>s.mesh.visible&&this.nearby(s.pos,1.25));
    if(secret?.id==='neon' && (this.shared?.cleaner||this.localCleaner).hp>0){
      return {text:'Armário vigiado pela faxineira',run:()=>this.g.ui.toast('Vença a faxineira para encontrar o Vaga-lume Neon.')};
    }
    if(secret)return {text:'Descoberta • '+this.rules.secrets.find(s=>s[0]===secret.id)[1],run:()=>this.g.desbloquear(secret.id)};
    if(!this.online || peers.filter(p=>p.state?.active&&!p.down).length<2)return null;
    let task,text;
    if(!this.shared?.file && this.nearby(this.rules.folder,3)){task='folder';text='Pegar a pasta enquanto um amigo distrai a professora';}
    else if(!this.shared?.file && this.nearby(this.g.mundo.humanos[0].alvo.toArray(),3.8)){task='distract';text='Distrair a professora para um amigo pegar a pasta';}
    else if(!this.shared?.gate){const i=this.rules.switches.findIndex((_,i)=>this.rules.atSwitch(this.player,i));if(i>=0){task=i?'right':'left';text=this.shared?.file?'Acionar relé e manter a posição':'Recuperem a pasta na Sala 1';}}
    if(task)return {text,run:()=>{this.online.sendState();this.online.send({type:'campus-task',action:task});}};
    return null;
  }
  interact(){const a=this.action();if(!a)return false;a.run();return true;}
  bite(){
    if(this.rules.areaAt(...this.player)!==this.rules.cleaning||!this.nearby(this.rules.cleanerHead,3.1))return false;
    const c=this.shared?.cleaner||this.localCleaner;if(!c.hp)return false;
    if(c.phase!=='cansada'){this.g.ui.toast('Espere a faxineira baixar o spray.');return true;}
    if(this.online){this.online.sendState();this.online.send({type:'cleaner-bite'});}
    else if(this.clock>=this.biteAt||!this.biteAt){if(this.rules.biteCleaner(c,this.player,this.g.estado.nv.tromba)&&!c.hp)this.g.desbloquear('faxineira');this.biteAt=this.clock+.85;this.g.audio.picada();}
    return true;
  }
  showCleanerHud(playing){
    const c=this.shared?.cleaner||this.localCleaner;
    const visible=playing&&c.hp>0&&this.rules.areaAt(...this.player)===this.rules.cleaning;
    this.cleanerHud.hidden=!visible;
    if(visible){
      const key=c.hp+'|'+c.phase+'|'+c.attack;
      if(this.cleanerHudKey!==key){
        this.cleanerHudKey=key;
        const max=this.cleanerTrack.getAttribute('aria-valuemax');
        this.cleanerLife.textContent=c.hp+'/'+max;
        this.cleanerTrack.setAttribute('aria-valuenow',String(c.hp));
        this.cleanerBar.style.width=(100*c.hp/max)+'%';
        this.cleanerHud.dataset.fase=c.phase==='cansada'?'cansado':c.phase;
        this.cleanerHint.textContent=c.phase==='cansada'?'🩸 Vulnerável! Pique a cabeça agora.':
          c.phase==='aviso'?(c.attack==='spray'?'⚠ Spray! Saia da área marcada.':'⚠ Pano! Afaste-se da faxineira.'):'Desvie dos ataques e espere a abertura.';
      }
    }
    return visible;
  }
  hurt(amount){
    if(this.clock<this.hitAt||this.g.online?.fallen)return;
    this.hitAt=this.clock+1;this.g.dano(amount);this.g.jogador.shake=.35;
  }
  syncProps(dt){
    const data=this.shared;if(!data)return;
    const g=this.g,paint=g.mundo.tintas;
    for(const [i,x,y,z,angle,spill] of data.pots){
      const b=this.bodies[i];if(!b)continue;
      b.g.position.set(x,y,z);b.g.rotation.set(angle*.65,0,angle);
      if(spill&&!this.splashes.has(i)){
        const stain=paint.mancha(new THREE.Vector3(spill[0],-3.42,spill[1]),b.cor,b.raio>.4?1.2:.85);
        stain.scale.setScalar(stain.userData.raio);this.splashes.set(i,stain);if(b.liquido)b.liquido.visible=false;if(b.tampa)b.tampa.visible=false;
      }
    }
    if(g.jogador.vel.length()>.5&&this.clock>=(this.pushAt||0)){
      const index=this.bodies.findIndex(b=>b.g.visible&&b.g.position.distanceTo(g.jogador.pos)<b.raio+.48);
      if(index>=0){this.online.sendState();this.online.send({type:'push-pot',index,dir:g.jogador.vel.toArray()});this.pushAt=this.clock+.24;}
    }
    const allied=data.heals.filter(h=>h.owner!==this.online.id);
    allied.forEach((h,i)=>{
      if(!this.healMeshes[i]){
        const circle=this.mesh(new THREE.CircleGeometry(5,32),0xbb487c,0,0,0);
        circle.material=new THREE.MeshBasicMaterial({color:0xf35589,transparent:true,opacity:.38,depthWrite:false});
        circle.rotation.x=-Math.PI/2;this.healMeshes.push(circle);
      }
      this.healMeshes[i].position.set(h.pos[0],this.rules.floorAt(...h.pos)+.11,h.pos[2]);
    });
    this.healMeshes.forEach((mesh,i)=>mesh.visible=i<allied.length);
    const pos=this.player;
    if(allied.some(h=>{
      const floor=this.rules.floorAt(...h.pos);
      return this.rules.sameLevel(pos,h.pos)&&Math.hypot(h.pos[0]-pos[0],h.pos[2]-pos[2])<5&&pos[1]>=floor&&pos[1]<floor+6;
    })){
      g.jogador.vida=Math.min(g.estado.vidaMax,g.jogador.vida+12*dt);
    }
  }
  resetProps(){
    this.healMeshes.forEach(mesh=>mesh.visible=false);
    this.bodies.forEach((b,i)=>{b.g.position.copy(this.origins[i]);b.g.quaternion.identity();b.v.set(0,0,0);b.w.set(0,0,0);b.dormindo=true;b.caiu=b.vazou=b.poca=false;b.restante=1;if(b.liquido){b.liquido.visible=true;b.liquido.scale.setScalar(1);}if(b.tampa)b.tampa.visible=true;});
    for(const m of this.g.mundo.tintas.manchas)this.g.cena.remove(m);
    this.g.mundo.tintas.manchas.length=0;this.splashes.clear();
    this.g.mundo.tintas.gotas.forEach(d=>d.m.visible=false);
  }
  tick(dt){
    this.clock+=dt;const g=this.g,p=this.player,area=this.rules.areaAt(...p);
    this.art.update(g.jogador.pos);
    const roof=this.rules.roof;
    if(area===roof&&!g.estado.skins.includes('astronauta')){
      // Fantasma usa o raio dos limites gerais enquanto atravessa os móveis.
      const radius=g.estado.attr.intang ? .18 : g.jogador.raio;
      if(this.rules.atFlightCeiling(p,radius))g.desbloquear('astronauta');
    }
    this.relays.forEach((light,i)=>{
      const color=this.shared?.gate?0x8ddeae:(this.shared?.switches?.[i]?0xfbd371:this.orange);
      if(light.material.emissive.getHex()!==color){light.material.color.setHex(color);light.material.emissive.setHex(color);}
    });
    this.syncProps(dt);this.fileMesh.visible=!!this.online&&!this.shared?.file;
    this.secrets.forEach(s=>{s.mesh.visible=!g.estado.skins.includes(s.id);s.mesh.rotation.y+=dt;});
    this.gateLift=THREE.MathUtils.clamp(this.gateLift+(this.shared?.gate?2:-2)*dt,0,1);
    this.art.shutter.scale.x=1-this.gateLift*.985;
    this.art.fan.rotation.y+=dt*1.4;
    if(area&&area!==this.rules.main&&area!==this.rules.arena){
      const level=this.rules.levels.find(level=>level.id===this.rules.levelAt(...p)).name;
      g.ui.sala(level===area.name?level:level+' · '+area.name);
      if(!this.firstVisit.has(area.name)){
        this.firstVisit.add(area.name);
        const hint={'Escada central':'A escada liga o pátio, o corredor e o terraço.',Pátio:'A cozinha abre ao lado da quadra. A zeladoria fica no fundo do pátio.',
          Cozinha:'Cuidado com o vapor do fogão.',Zeladoria:'Desvie do spray e pique a faxineira quando ela baixar a guarda.',
          Terraço:'Do terraço, voe até o limite do céu para ganhar a skin Astronauta.',
          'Duto dos relés':this.shared?.gate?'Duto aberto entre o térreo e o terraço.':'A grade do duto abre com os dois relés do pátio.'}[area.name];
        if(hint)g.ui.toast(hint);
      }
    }
    const wet=Math.sin((this.shared?.time??this.clock)*1.4)>.1;this.water.visible=wet;this.steam.visible=!wet;
    this.water.rotation.y=this.clock*1.45;
    if(!wet && area===this.rules.kitchen)this.steam.children.forEach((puff,i)=>{
      const t=(this.clock*.46+i/5)%1, size=.18+.56*t;
      puff.position.set(.36*Math.sin(t*5+i),3.55*t,.23*Math.cos(t*5+i));
      puff.scale.set(size,size*.8,size);puff.material.opacity=.34*(1-t);
    });
    this.vane.rotation.y=.6+Math.sin(this.clock*1.4)*.42;
    if(wet&&area===this.rules.courtyard&&Math.hypot(p[0]-this.water.position.x,p[2]-this.water.position.z)<1.6&&p[1]<this.rules.ground+5.5)this.hurt(9);
    if(!wet&&area===this.rules.kitchen&&Math.hypot(p[0]-this.steam.position.x,p[2]-this.steam.position.z)<1.6&&p[1]>this.steam.position.y-.7&&p[1]<this.steam.position.y+4)this.hurt(13);
    if(area===this.rules.roof&&this.nearby(this.rules.vane,8)&&wet)g.jogador.vel.x+=14*dt;
    if(!this.online)this.rules.stepCleaner(this.localCleaner,dt,area===this.rules.cleaning?[{pos:p}]:[],(_,n)=>this.hurt(n));
    const c=this.shared?.cleaner||this.localCleaner;
    this.cleanerGroup.rotation.z=c.hp?0:1.45;this.cleanerGroup.position.y=this.rules.ground+(c.hp?0:.7);
    const [cx,cy,cz]=this.rules.cleanerHead;
    if(c.phase==='aviso')this.cleanerGroup.rotation.y=Math.atan2(c.aim[0]-cx,c.aim[2]-cz);
    this.mist.forEach((drop,i)=>{
      drop.visible=c.hp>0&&c.attack==='spray'&&c.phase==='cansada'&&c.time>1.7;
      if(drop.visible){
        const t=Math.min(1,(2.4-c.time)*2+i*.04);
        drop.position.set(cx+(c.aim[0]-cx)*t+Math.sin(i*3)*t,cy+(c.aim[1]-cy)*t-i*.06,cz+(c.aim[2]-cz)*t+Math.cos(i*3)*t);
      }
    });
    this.arm.rotation.x=c.phase==='aviso'?-1.35:.1;this.cloth.rotation.z=c.attack==='pano'&&c.phase==='aviso'?Math.sin(this.clock*9)*.65:0;
    this.warning.visible=c.phase==='aviso';this.warning.position.fromArray(c.attack==='spray'?c.aim:this.rules.cleanerHead);this.warning.scale.setScalar(c.attack==='spray'?3.3:5.8);
    c.pools.forEach((pool,i)=>{if(!this.poolMeshes[i]){const mesh=this.mesh(new THREE.CircleGeometry(2.4,24),0x50b4a9,0,0,0);mesh.rotation.x=-Math.PI/2;this.poolMeshes.push(mesh);}this.poolMeshes[i].position.set(pool.x,this.rules.ground+.055,pool.z);});
    this.poolMeshes.forEach((m,i)=>m.visible=i<c.pools.length);
    const action=this.action();
    this.prompt=action?.text;
    if(action)g.eggMsg='B / Pegar · '+action.text;
    else if(area===roof&&!g.estado.skins.includes('astronauta')&&p[1]>roof.floor+9){
      g.eggMsg='Teto de Voo · altitude '+Math.floor(p[1]-roof.floor)+' / '+(roof.top-roof.floor);
    }
    else if(area===this.rules.cleaning&&!c.hp)g.eggMsg='Faxineira vencida • zeladoria livre';
  }
};
