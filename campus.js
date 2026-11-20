/* Ala de serviço da escola. Entradas, atalhos e segredos usam o mesmo botão Pegar. */
window.SchoolCampus = class SchoolCampus {
  constructor(game) {
    this.g=game;
    this.rules=window.EscolaCampus;
    this.localCleaner=this.rules.cleaner();
    this.points=[];
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
    const art=this.art=new CampusScenery(this.g), roof=this.rules.floorAt(300);
    art.skybox();art.surroundings();art.courtyard();art.gallery();art.kitchen();art.stairs();art.roof();
    art.entry(-117.48,-3.5,0,Math.PI/2,'PÁTIO');
    this.points.push(
      {label:'Sair para o pátio',at:[-114.9,1,0],dest:[186,1,0],yaw:-Math.PI/2},
      {label:'Voltar ao corredor',at:[184,1,-3],dest:[-111,2,0],yaw:-Math.PI/2},
      {label:'Atalho para o telhado',at:[200,.4,-13.9],dest:[300,roof+2.1,-10.5],yaw:Math.PI,gate:true,panel:art.courtyardGate},
      {label:'Atalho para o pátio',at:[300,roof+3.3,-13.9],dest:[200,.6,-10.7],yaw:Math.PI,gate:true,panel:art.roofGate});
    this.relays=this.rules.switches.map(([x,y,z],i)=>{
      // Conduítes ligam os dois comandos ao portão, inclusive vistos do ar.
      art.block(x,-1.27,z,.51,4.45,.56,0x637678,true);
      art.block(x,y,z,1.38,1.72,.68,0x345756,true);
      art.block(x,y+.55,z+.36,1.04,.28,.06,0x718479);
      art.sign(i?'RELÉ B':'RELÉ A',x,y+.56,z+.40,1.0);
      art.block(x,-3.40,-12.08,.14,.13,4.35,0x8c7253);
      art.block((x+200)/2,-3.40,-14.21,8,.13,.15,0x8c7253);
      const light=this.ball(x,y-.14,z+.43,.26,this.orange);
      light.material=light.material.clone();light.material.emissiveIntensity=.22;
      return light;
    });
    this.fileMesh=this.box(...this.rules.folder,1.4,.25,.95,0xffbe59);
    art.drum(200,-3.38,2,2.7,.21,2.7,0x788c7e);
    art.drum(200,-3.14,2,.59,.48,.59,0x477f7c);
    this.water=new THREE.Group();this.water.position.set(200,-2.91,2);this.g.cena.add(this.water);
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
    this.steam=new THREE.Group();this.steam.position.set(246,.4,-10.7);this.g.cena.add(this.steam);
    const puff=new THREE.IcosahedronGeometry(1,1);
    for(let i=0;i<5;i++){
      const cloud=new THREE.Mesh(puff,new THREE.MeshBasicMaterial({color:0xfff4df,transparent:true,depthWrite:false,opacity:.25}));
      this.steam.add(cloud);
    }
    this.vane=new THREE.Group();this.vane.position.set(300,roof+5.5,3);this.g.cena.add(this.vane);
    this.box(0,0,0,3.8,.13,.12,0x8c6958,false,this.vane);
    this.box(-1.34,.23,0,.87,.61,.12,0xcf8558,false,this.vane);
    this.mesh(new THREE.ConeGeometry(.37,.82,3),0xe2a663,1.93,0,0,false,this.vane).rotation.z=-Math.PI/2;
    // O duto é aberto nos dois extremos. Os outros esconderijos usam o próprio mobiliário.
    art.block(199,-.78,9,4,.22,2.85,0x779384,true);
    for(const dz of [-1.4,1.4])art.block(199,-2.13,9+dz,4,2.58,.21,0x688778,true);
    for(const dx of [-1.9,0,1.9]){
      art.block(199+dx,-.61,9,.18,.13,3.12,0x4e7169);
      for(const dz of [-1.52,1.52])art.block(199+dx,-2.12,9+dz,.18,2.93,.14,0x4e7169);
    }
    this.hideSkin(0,[199,-2,9]);this.hideSkin(1,[255,-1.9,14.45]);this.hideSkin(2,[309,roof+1.65,4]);
    art.finish();
    this.cleanerGroup=new THREE.Group();this.cleanerGroup.position.set(252,-3.5,2);this.g.cena.add(this.cleanerGroup);
    const g=this.cleanerGroup;
    for(const x of [-.36,.36]){this.box(x,1.2,0,.55,2.4,.58,0x334660,false,g);this.box(x,.22,.18,.66,.4,.9,0x303342,false,g);}
    this.mesh(new THREE.CylinderGeometry(.7,.95,2,16),0x318e90,0,3.5,0,false,g);
    this.box(0,3.7,.67,1.22,1.65,.12,0xefd6a2,false,g);
    this.ball(0,5.55,0,.66,0x9d654b,g);this.ball(0,5.96,-.12,.62,0x49332f,g);this.ball(0,6.22,-.48,.36,0x49332f,g);
    for(const x of [-.23,.23])this.ball(x,5.64,.59,.075,0x281e22,g);
    this.arm=new THREE.Group();this.arm.position.set(.9,4.2,0);g.add(this.arm);
    this.box(0,-.5,.1,.38,1.1,.42,0x9d654b,false,this.arm);
    this.box(0,-1,.55,.55,.78,.4,0x5eb9ea,false,this.arm);
    this.box(0,-.5,.68,.25,.22,.55,0xf7c678,false,this.arm);
    this.box(-1,3.8,0,.42,1.3,.42,0x9d654b,false,g);
    this.cloth=this.box(-1.1,3,.3,1.15,.16,1.75,0xe0aa72,false,g);
    this.warning=this.mesh(new THREE.TorusGeometry(1,.06,6,36),0xffab42,252,0,2);
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
    return this.rules.constrain(pos,radius);
  }
  action(){
    const peers=this.online?.members||[];
    const ally=peers.find(p=>p.down&&p.id!==this.online.id&&p.state&&this.nearby(p.state.pos,3.5));
    if(ally)return {text:'Reanimar '+ally.name,run:()=>this.online.send({type:'rescue',id:ally.id})};
    const portal=this.points.find(d=>this.nearby(d.at,3));
    if(portal)return {text:portal.gate&&!this.shared?.gate?'Atalho trancado • dois relés':portal.label,run:()=>{
      if(portal.gate&&!this.shared?.gate)return this.g.ui.toast('Atalho cooperativo. Use a escada da cozinha para chegar ao telhado.');
      const j=this.g.jogador;j.pos.fromArray(portal.dest);j.vel.set(0,0,0);j.foco.copy(j.pos);
      j.yaw=j.yawV=j.yawPrev=portal.yaw;j.pitch=j.pitchV=0;
      this.g.camera.position.copy(j.pos);j.olhar.copy(j.pos);j.camera3p(1);
      this.online?.sendState();this.g.ui.toast(this.rules.areaAt(j.pos.x)?.name||'Corredor');
    }};
    const secret=this.secrets.find(s=>s.mesh.visible&&this.nearby(s.pos,1.25));
    if(secret?.id==='cobre' && (this.shared?.cleaner||this.localCleaner).hp>0){
      return {text:'Armário vigiado pela faxineira',run:()=>this.g.ui.toast('Vença a faxineira para recuperar o Cobre Polido.')};
    }
    if(secret)return {text:'Descoberta • '+this.rules.secrets.find(s=>s[0]===secret.id)[1],run:()=>this.g.desbloquear(secret.id)};
    if(!this.online || peers.filter(p=>p.state?.active&&!p.down).length<2)return null;
    let task,text;
    if(!this.shared?.file && this.nearby(this.rules.folder,3)){task='folder';text='Pegar a pasta enquanto um amigo distrai a professora';}
    else if(!this.shared?.file && this.nearby(this.g.mundo.humanos[0].alvo.toArray(),3.8)){task='distract';text='Distrair a professora para um amigo pegar a pasta';}
    else if(!this.shared?.gate){const i=this.rules.switches.findIndex(pos=>this.nearby(pos,3));if(i>=0){task=i?'right':'left';text=this.shared?.file?'Acionar relé e manter a posição':'Recuperem a pasta na Sala 1';}}
    if(task)return {text,run:()=>{this.online.sendState();this.online.send({type:'campus-task',action:task});}};
    return null;
  }
  interact(){const a=this.action();if(!a)return false;a.run();return true;}
  bite(){
    if(!this.nearby(this.rules.cleanerHead,3.1))return false;
    const c=this.shared?.cleaner||this.localCleaner;if(!c.hp)return false;
    if(c.phase!=='cansada'){this.g.ui.toast('Espere a faxineira baixar o spray.');return true;}
    if(this.online){this.online.sendState();this.online.send({type:'cleaner-bite'});}
    else if(this.clock>=this.biteAt||!this.biteAt){this.rules.biteCleaner(c,this.player,this.g.estado.nv.tromba);this.biteAt=this.clock+.85;this.g.audio.picada();}
    return true;
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
      this.healMeshes[i].position.set(h.pos[0],this.rules.floorAt(h.pos[0])+.11,h.pos[2]);
    });
    this.healMeshes.forEach((mesh,i)=>mesh.visible=i<allied.length);
    if(data.heals.some(h=>h.owner!==this.online.id&&Math.hypot(h.pos[0]-g.jogador.pos.x,h.pos[2]-g.jogador.pos.z)<5&&g.jogador.pos.y<this.rules.floorAt(h.pos[0])+6)){
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
    this.clock+=dt;const g=this.g,p=this.player,area=this.rules.areaAt(p[0]);
    this.art.update(p[0]);
    this.relays.forEach((light,i)=>{
      const color=this.shared?.gate?0x8ddeae:(this.shared?.switches?.[i]?0xfbd371:this.orange);
      if(light.material.emissive.getHex()!==color){light.material.color.setHex(color);light.material.emissive.setHex(color);}
    });
    this.syncProps(dt);this.fileMesh.visible=!!this.online&&!this.shared?.file;
    this.secrets.forEach(s=>{s.mesh.visible=!g.estado.skins.includes(s.id);s.mesh.rotation.y+=dt;});
    this.points.filter(d=>d.gate).forEach(d=>{d.panel.visible=!this.shared?.gate;});
    if(area){
      g.ui.sala(area.name);
      if(!this.firstVisit.has(area.name)){this.firstVisit.add(area.name);g.ui.toast({Pátio:'A galeria coberta leva à cozinha. Cuidado com o aspersor.', 'Galeria coberta':'Atravesse a galeria para entrar na cozinha.', 'Escada de serviço':'Siga os degraus até o telhado.',Cozinha:'Cuidado com o vapor. Pique a faxineira quando ela baixar a guarda.',Telhado:'Rajadas de vento passam pela antena. Procure uma fresta nas chaminés.'}[area.name]);}
    }
    const wet=Math.sin((this.shared?.time??this.clock)*1.4)>.1;this.water.visible=wet;this.steam.visible=!wet;
    this.water.rotation.y=this.clock*1.45;
    if(!wet && area?.name==='Cozinha')this.steam.children.forEach((puff,i)=>{
      const t=(this.clock*.46+i/5)%1, size=.18+.56*t;
      puff.position.set(.36*Math.sin(t*5+i),3.55*t,.23*Math.cos(t*5+i));
      puff.scale.set(size,size*.8,size);puff.material.opacity=.34*(1-t);
    });
    this.vane.rotation.y=.6+Math.sin(this.clock*1.4)*.42;
    if(wet&&Math.hypot(p[0]-200,p[2]-2)<1.6&&p[1]<2)this.hurt(9);
    if(!wet&&Math.hypot(p[0]-246,p[2]+10)<1.6&&p[1]<4)this.hurt(13);
    if(area?.name==='Telhado'&&Math.abs(p[2]-3)<3&&wet)g.jogador.vel.x+=14*dt;
    if(!this.online)this.rules.stepCleaner(this.localCleaner,dt,area?.name==='Cozinha'?[{pos:p}]:[],(_,n)=>this.hurt(n));
    const c=this.shared?.cleaner||this.localCleaner;
    this.cleanerGroup.rotation.z=c.hp?0:1.45;this.cleanerGroup.position.y=c.hp?-3.5:-2.8;
    if(c.phase==='aviso')this.cleanerGroup.rotation.y=Math.atan2(c.aim[0]-252,c.aim[2]-2);
    this.mist.forEach((drop,i)=>{
      drop.visible=c.hp>0&&c.attack==='spray'&&c.phase==='cansada'&&c.time>1.7;
      if(drop.visible){
        const t=Math.min(1,(2.4-c.time)*2+i*.04);
        drop.position.set(252+(c.aim[0]-252)*t+Math.sin(i*3)*t,1.8+(c.aim[1]-1.8)*t-i*.06,2+(c.aim[2]-2)*t+Math.cos(i*3)*t);
      }
    });
    this.arm.rotation.x=c.phase==='aviso'?-1.35:.1;this.cloth.rotation.z=c.attack==='pano'&&c.phase==='aviso'?Math.sin(this.clock*9)*.65:0;
    this.warning.visible=c.phase==='aviso';this.warning.position.fromArray(c.attack==='spray'?c.aim:this.rules.cleanerHead);this.warning.scale.setScalar(c.attack==='spray'?3.3:5.8);
    c.pools.forEach((pool,i)=>{if(!this.poolMeshes[i]){const mesh=this.mesh(new THREE.CircleGeometry(2.4,24),0x50b4a9,0,0,0);mesh.rotation.x=-Math.PI/2;this.poolMeshes.push(mesh);}this.poolMeshes[i].position.set(pool.x,-3.46,pool.z);});
    this.poolMeshes.forEach((m,i)=>m.visible=i<c.pools.length);
    const action=this.action();
    this.prompt=action?.text;
    if(action)g.eggMsg='B / Pegar · '+action.text;
    else if(area?.name==='Cozinha')g.eggMsg=c.hp?'Faxineira · '+c.hp+'/180 · '+(c.phase==='aviso'?'Desvie do '+c.attack:c.phase==='cansada'?'Pique agora!':'Prepare-se'):'Faxineira vencida • cozinha livre';
  }
};
