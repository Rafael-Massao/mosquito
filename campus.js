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
  sign(text,x,y,z,width=6){
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#223b43';ctx.fillRect(0,0,512,96);
    ctx.fillStyle='#ffe9a5';ctx.fillRect(0,0,8,96);ctx.font='bold 37px sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,48,480);
    const sign=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas)}));
    sign.position.set(x,y,z);sign.scale.set(width,width*96/512,1);this.g.cena.add(sign);return sign;
  }
  door(label,at,dest,gate=false){
    const [x,y,z]=at;
    const panel=this.box(x,y,z,2.7,4,.32,gate?0xb45638:0x367b79);
    this.box(x-1.5,y,z,.25,4.4,.5,0x304850);
    this.box(x+1.5,y,z,.25,4.4,.5,0x304850);
    this.box(x,y+2.15,z,3.25,.25,.5,0x304850);
    this.ball(x+.85,y-.25,z+.23,.14,0xfacc70);this.sign(label,x,y+2.9,z);
    this.points.push({label,at,dest,gate,panel});
  }
  createRooms(){
    for(const area of this.rules.areas){
      const x=area.x;
      this.box(x,-3.8,0,36,.6,32,area.color,true);
      for(const z of [-16,16])this.box(x,-2.5,z,36,2,.4,0x68777b,true);
      for(const dx of [-18,18])this.box(x+dx,-2.5,0,.4,2,32,0x68777b,true);
      const light=new THREE.PointLight(0xffebce,.8,36);light.position.set(x,6,0);this.g.cena.add(light);
    }
    this.door('PÁTIO • B',[-114,2,0],[186,1,0]);
    this.door('Corredor',[184,1,-3],[-111,2,0]);
    this.door('Cozinha',[215,1,0],[236,1,0]);
    this.door('Pátio',[234,1,-3],[212,1,0]);
    this.door('Escada do telhado',[265,1,0],[286,1,0]);
    this.door('Cozinha',[284,1,-3],[262,1,0]);
    this.door('Atalho • Telhado',[200,1,-14],[303,1,-11],true);
    this.door('Atalho • Pátio',[300,1,-14],[200,1,-11],true);
    for(const [x,z] of [[188,9],[210,9],[186,-9]]){
      this.box(x,-.8,z,.75,5.4,.75,0x85583a,true);this.ball(x,2.6,z,2.6,0x548656);
      this.box(x+3,-2.25,z,4,.3,1.2,0x98623d,true);
      for(const d of [1.5,4.5])this.box(x+d,-2.95,z,.35,1.1,.75,0x344948);
    }
    for(const [i,at] of this.rules.switches.entries()){
      this.box(...at,1.4,1.8,.7,0x344950);this.ball(at[0],at[1],at[2]+.5,.39,this.orange);
      this.sign(i?'RELÉ B':'RELÉ A',at[0],at[1]+1.8,at[2],3);
    }
    this.fileMesh=this.box(...this.rules.folder,1.4,.25,.95,0xffbe59);
    this.sprinkler=this.mesh(new THREE.CylinderGeometry(.45,.65,.6,12),0x418377,200,-3.1,2);
    this.water=this.mesh(new THREE.ConeGeometry(1.4,4,12,1,true),0x82d7de,200,-1,2);
    this.water.material=new THREE.MeshBasicMaterial({color:0x83d8ec,wireframe:true,transparent:true,opacity:.55});
    for(const z of [-12,12]){
      this.box(250,-2,z,19,3,2.2,0x647b78,true);this.box(250,-.42,z,19.4,.18,2.4,0xd3dedb,true);
      for(let x=244;x<=256;x+=4)this.box(x,-2,z-Math.sign(z)*1.14,3.5,2.5,.12,0x879c91);
    }
    for(const z of [-15.8,15.8]){
      this.box(250,1.4,z,36,9.8,.32,0xa4b5ab,true);
      for(const dx of [-10,0,10]){
        this.box(250+dx,3.5,z-Math.sign(z)*.24,7.2,3.2,.15,0x506b70);
        this.box(250+dx,3.5,z-Math.sign(z)*.35,6.8,2.8,.12,0xaccfd0);
        this.box(250+dx,3.5,z-Math.sign(z)*.45,.14,2.9,.12,0x506b70);
      }
    }
    for(const x of [232.1,267.9])this.box(x,1.4,0,.3,9.8,32,0xb7c5b9,true);
    this.box(250,7,0,36,.45,32,0xd8d7c6,true);
    for(const x of [242,258])this.box(x,6.7,0,4,.12,.8,0xffefc6);
    this.steam=this.mesh(new THREE.ConeGeometry(1.5,4,12,1,true),0xffffff,246,1.8,-10);
    this.steam.material=new THREE.MeshBasicMaterial({color:0xffecdb,wireframe:true,transparent:true,opacity:.65});
    this.mesh(new THREE.CylinderGeometry(1.2,1,1.3,14),0x879399,246,-.8,-10);
    for(const x of [289,309])for(const z of [-8,9]){
      this.box(x,-1.8,z,2.2,3.4,2.2,0xb67d60,true);this.box(x,.05,z,2.6,.3,2.6,0x77594c,true);
    }
    for(const dx of [-14,-7,0,7,14]){
      for(const z of [-15.5,15.5])this.box(300+dx,-1.1,z,.14,4,.14,0x5f656d);
    }
    for(const z of [-15.5,15.5])this.box(300,.75,z,33,.15,.15,0x858e9c);
    for(let i=0;i<8;i++){
      const h=5+i%3*4;this.box(277+i*7,-11+h/2,34+i%2*7,5,h,5,0x536273);
    }
    this.vane=this.box(300,2,3,5,.32,.55,0xe39750);this.box(300,-.6,3,.25,5,.25,0x44546b,true);
    this.hideSkin(0,[199,-2,9],'duct');
    this.hideSkin(1,[255,-1.9,14.45],'locker');
    this.hideSkin(2,[309,-1.9,4],'crack');
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
  hideSkin(index,pos,type){
    const [x,y,z]=pos,color=this.rules.secrets[index][2];
    if(type==='duct'){
      this.box(x,y+1.25,z,4,.25,3,0x739b7d,true);
      for(const dz of [-1.5,1.5])this.box(x,y,z+dz,4,2.6,.25,0x739b7d,true);
    }else if(type==='crack'){
      for(const dx of [-1.3,1.3])this.box(x+dx,y+.2,z,1.3,3.2,4,0xbd866c,true);
    }
    const mesh=this.mesh(new THREE.OctahedronGeometry(.4),color,x,y,z);
    this.secrets.push({id:this.rules.secrets[index][0],pos,mesh});
  }
  get online(){return this.g.online?.active?this.g.online:null;}
  get player(){return this.g.jogador.pos.toArray();}
  get shared(){return this.online?.campus;}
  nearby(pos,r){return this.rules.distance(this.player,pos)<r;}
  bound(pos,radius){
    if(pos.x<175)return false;
    const a=this.rules.areas.reduce((a,b)=>Math.abs(pos.x-a.x)<Math.abs(pos.x-b.x)?a:b);
    pos.x=THREE.MathUtils.clamp(pos.x,a.x-17.6+radius,a.x+17.6-radius);
    pos.z=THREE.MathUtils.clamp(pos.z,-15.6+radius,15.6-radius);
    pos.y=THREE.MathUtils.clamp(pos.y,-3.46+radius,(a.name==='Cozinha'?6.7:10)-radius);
    return true;
  }
  action(){
    const peers=this.online?.members||[];
    const ally=peers.find(p=>p.down&&p.id!==this.online.id&&p.state&&this.nearby(p.state.pos,3.5));
    if(ally)return {text:'Reanimar '+ally.name,run:()=>this.online.send({type:'rescue',id:ally.id})};
    const portal=this.points.find(d=>this.nearby(d.at,3));
    if(portal)return {text:portal.gate&&!this.shared?.gate?'Atalho trancado • dois relés':portal.label,run:()=>{
      if(portal.gate&&!this.shared?.gate)return this.g.ui.toast('Atalho cooperativo. Use a escada da cozinha para chegar ao telhado.');
      const j=this.g.jogador;j.pos.fromArray(portal.dest);j.vel.set(0,0,0);j.foco.copy(j.pos);
      this.online?.sendState();this.g.ui.toast(this.rules.areaAt(j.pos.x)?.name||'Corredor');
    }};
    const secret=this.secrets.find(s=>s.mesh.visible&&this.nearby(s.pos,1.25));
    if(secret?.id==='cobre' && (this.shared?.cleaner||this.localCleaner).hp>0){
      return {text:'Armário vigiado pela faxineira',run:()=>this.g.ui.toast('Vença a faxineira para recuperar o Cobre Polido.')};
    }
    if(secret)return {text:'Descoberta • '+this.rules.secrets.find(s=>s[0]===secret.id)[1],run:()=>this.g.desbloquear(secret.id)};
    if(!this.online)return null;
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
      this.healMeshes[i].position.set(h.pos[0],-3.39,h.pos[2]);
    });
    this.healMeshes.forEach((mesh,i)=>mesh.visible=i<allied.length);
    if(data.heals.some(h=>h.owner!==this.online.id&&Math.hypot(h.pos[0]-g.jogador.pos.x,h.pos[2]-g.jogador.pos.z)<5&&g.jogador.pos.y<2.5)){
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
    this.syncProps(dt);this.fileMesh.visible=!!this.online&&!this.shared?.file;
    this.secrets.forEach(s=>{s.mesh.visible=!g.estado.skins.includes(s.id);s.mesh.rotation.y+=dt;});
    this.points.filter(d=>d.gate).forEach(d=>{d.panel.visible=!this.shared?.gate;});
    if(area){
      g.ui.sala(area.name);
      if(!this.firstVisit.has(area.name)){this.firstVisit.add(area.name);g.ui.toast({Pátio:'Siga as portas verdes. O aspersor liga em ciclos.',Cozinha:'Cuidado com o vapor. Pique a faxineira quando ela baixar a guarda.',Telhado:'Rajadas de vento passam pela antena. Procure uma fresta nas chaminés.'}[area.name]);}
    }
    const wet=Math.sin((this.shared?.time??this.clock)*1.4)>.1;this.water.visible=wet;this.steam.visible=!wet;this.vane.rotation.y=this.clock;
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
