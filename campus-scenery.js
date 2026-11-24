// Arquitetura do térreo, da escada e da cobertura. Peças repetidas compartilham geometria e uma chamada
// de desenho por forma e setor. Somente os volumes acessíveis entram na colisão.
window.CampusScenery = class CampusScenery {
  constructor(game) {
    this.game=game;
    this.sectors=new Map();
    this.batches=new Map();
    this.standard=new THREE.MeshStandardMaterial({roughness:.83});
    this.dummy=new THREE.Object3D();
    this.geo={
      block:new THREE.BoxGeometry(1,1,1),drum:new THREE.CylinderGeometry(.5,.5,1,18),
      leaf:new THREE.IcosahedronGeometry(.54,1),cone:new THREE.ConeGeometry(.5,1,12)
    };
    this.geo.glass=this.geo.block;
    this.windowGlass=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.25,transparent:true,opacity:.28,depthWrite:false});
    this.indoorFog=game.cena.fog.color.getHex();
    this.setViewDistances(game.camera.far,game.cena.fog.near,game.cena.fog.far);
    this.root=new THREE.Group();game.cena.add(this.root);
    this.setRoom('exterior',0,0);
  }
  setRoom(name,x,z,y=0,yaw=0){
    if(!this.sectors.has(name)){
      const group=new THREE.Group();
      group.position.set(x,y,z);group.rotation.y=yaw;this.root.add(group);group.updateMatrixWorld(true);
      this.sectors.set(name,group);
    }
    this.section=this.sectors.get(name);this.sectionName=name;
  }
  piece(shape,x,y,z,w,h,d,color,solid=false,ry=0,rz=0,rx=0){
    const obj=this.dummy;
    obj.position.set(x,y,z);obj.rotation.set(rx,ry,rz);obj.scale.set(w,h,d);obj.updateMatrix();
    const sector=this.sectionName, key=sector+'/'+shape;
    if(!this.batches.has(key))this.batches.set(key,{sector,shape,parts:[]});
    this.batches.get(key).parts.push([obj.matrix.clone(),color]);
    if(solid){
      const collider=new THREE.Mesh(this.geo[shape],this.standard);
      collider.matrixAutoUpdate=false;collider.matrix.multiplyMatrices(this.section.matrixWorld,obj.matrix);collider.updateMatrixWorld(true);
      this.game.mundo.col.push({mesh:collider,cameraOnly:solid==='camera',box:new THREE.Box3().setFromObject(collider)});
    }
  }
  block(...args){this.piece('block',...args);}
  drum(...args){this.piece('drum',...args);}
  beam(a,b,width,depth,color,solid=false){
    const start=new THREE.Vector3(...a), end=new THREE.Vector3(...b), delta=end.clone().sub(start);
    const mid=start.add(end).multiplyScalar(.5),rot=new THREE.Euler().setFromQuaternion(
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize()));
    this.block(mid.x,mid.y,mid.z,width,delta.length(),depth,color,solid,rot.y,rot.z,rot.x);
  }
  finish(){
    for(const {sector,shape,parts} of this.batches.values()){
      const mesh=new THREE.InstancedMesh(this.geo[shape],shape==='glass'?this.windowGlass:this.standard,parts.length);
      parts.forEach(([matrix,tint],i)=>{mesh.setMatrixAt(i,matrix);mesh.setColorAt(i,new THREE.Color(tint));});
      this.sectors.get(sector).add(mesh);
    }
    this.batches.clear();this.update(this.game.jogador.pos);
  }
  setViewDistances(far,fogNear,fogFar){
    this.viewDistances={far,fogNear,fogFar};
  }
  update(p){
    const ground=p.y<EscolaCampus.first-1,top=p.y>12.05,atStairs=p.x< -110;
    this.sectors.get('pátio').visible=ground||atStairs;
    this.sectors.get('cozinha').visible=ground;
    this.sectors.get('zeladoria').visible=ground;
    this.sectors.get('terraço').visible=top||atStairs;
    this.sectors.get('escada').visible=atStairs||ground||top||p.x< -20;
    this.sectors.get('exterior').visible=ground||top||p.x< -50;
    const {camera,cena}=this.game,view=this.viewDistances;
    // No terraço a rua oposta fica além do alcance usado para móveis no modo Desempenho.
    const far=top?Math.max(view.far,246):view.far;
    if(camera.far!==far){camera.far=far;camera.updateProjectionMatrix();}
    cena.fog.near=top?72:view.fogNear;
    cena.fog.far=top?242:view.fogFar;
    cena.fog.color.setHex(top?0xb69ea4:ground||p.x< -118?0x807e81:this.indoorFog);
    this.sky.visible=this.sectors.get('exterior').visible;
    if(this.sky.visible)this.sky.position.copy(p);
  }
  skybox(){
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;
    const c=canvas.getContext('2d'),bg=c.createLinearGradient(0,0,0,512);
    [[0,'#22294c'],[.34,'#506088'],[.46,'#928a9e'],[.51,'#edbb9f'],[.59,'#9a959d'],[1,'#545d71']].forEach(([p,v])=>bg.addColorStop(p,v));
    c.fillStyle=bg;c.fillRect(0,0,1024,512);
    for(let i=1;i<=105;i++){const x=(i*431)%1024,y=(i*79+i*i)%218;c.fillStyle='rgba(255,245,218,'+(.16+i%5*.11)+')';c.fillRect(x,y,1+i%2,1);}
    c.fillStyle='#fff0ce';c.beginPath();c.ellipse(735,199,9,9,0,0,2*Math.PI);c.fill();
    // Duas silhuetas ao fundo completam as ruas no alcance de visão mais curto do celular.
    for(let band=0;band<2;band++){
      const base=257+band*11;let x=0,i=0;
      while(x<1024){
        const w=9+(i*17+band*7)%31,h=5+(i*11+band*4)%15,y=base-h,color=band?'#ac9199':'#bb9fa3';
        c.fillStyle=color;c.fillRect(x,y,w,h+18);
        switch((i+2*band)%4){
          case 0:c.fillRect(x+w*.21,y-4,w*.58,5);c.fillRect(x+w*.35,y-7,w*.32,4);break;
          case 1:c.beginPath();c.moveTo(x,y+1);c.lineTo(x+w*.49,y-5);c.lineTo(x+w,y+1);c.fill();break;
          case 2:c.fillRect(x+3,y-5,1,6);c.fillRect(x+8,y-5,1,6);c.fillRect(x+2,y-8,8,4);break;
        }
        if(band)for(let j=3;j<w-2;j+=4){c.fillStyle=(i+j)%6?'#b79ba0':'#d1afa3';c.fillRect(x+j,y+3,1.4,1.8);}
        x+=w+1+(i%3);i++;
      }
    }
    this.sky=new THREE.Mesh(new THREE.SphereGeometry(1,48,24),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),side:THREE.BackSide,fog:false,depthWrite:false,toneMapped:false}));
    this.sky.scale.setScalar(Math.min(125,this.game.camera.far*.8));this.sky.renderOrder=-100;this.game.cena.add(this.sky);
  }
  sign(text,x,y,z,width,yaw=0,bg='#224c4b'){
    const canvas=document.createElement('canvas');canvas.width=640;canvas.height=108;
    const c=canvas.getContext('2d');c.fillStyle=bg;c.fillRect(0,0,640,108);c.strokeStyle='#f0cf88';c.lineWidth=3;c.strokeRect(9,9,622,90);
    c.fillStyle='#fff1d5';c.font='bold 55px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text,320,56,590);
    const mat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),toneMapped:false});
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,width*108/640),mat);
    mesh.position.set(x,y,z);mesh.rotation.y=yaw;this.section.add(mesh);return mesh;
  }
  floor(x,width,depth,type,level=-3.5){
    const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');
    const palettes={paving:['#999487','#c7beaa','#cec4b1','#c5bdad'],terrace:['#937b6e','#d9b999','#dec4a3','#d8bca3'],kitchen:['#839c93','#e4e4ca','#e0e1c9','#dce1c8']};
    const palette=palettes[type];ctx.fillStyle=palette[0];ctx.fillRect(0,0,256,256);
    const rows=type==='kitchen'?4:5,cols=type==='kitchen'?4:3;
    const w=256/cols,h=256/rows;
    for(let j=0;j<rows;j++)for(let i=-1;i<cols;i++){
      const l=i*w+(type==='kitchen'?0:j%2*w/2),t=j*h;
      ctx.fillStyle=palette[1+Math.abs(7*i+5*j)%3];ctx.fillRect(l+1,t+1,w-2,h-2);
      if(type==='kitchen'&&(i+j)%2===0){ctx.fillStyle='#659496';ctx.beginPath();ctx.moveTo(l+2,t+2);ctx.lineTo(l+12,t+2);ctx.lineTo(l+2,t+12);ctx.fill();}
    }
    const tex=new THREE.CanvasTexture(c);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(width/7,depth/7);tex.anisotropy=Math.min(4,this.game.render.capabilities.getMaxAnisotropy());
    const m=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),new THREE.MeshStandardMaterial({color:type==='kitchen'?0xafb8ad:0xb7a28c,map:tex,roughness:.91}));
    m.rotation.x=-Math.PI/2;m.position.set(x,level+.013,0);this.section.add(m);
  }
  shade(x,z,w,d,y,opacity=.26,angle=0){
    if(!this.shadeMaterial){
      const canvas=document.createElement('canvas');canvas.width=canvas.height=64;
      const ctx=canvas.getContext('2d'),radial=ctx.createRadialGradient(32,32,2,32,32,32);
      radial.addColorStop(0,'#ffffff');radial.addColorStop(.49,'#ffffffc4');radial.addColorStop(1,'#ffffff00');
      ctx.fillStyle=radial;ctx.fillRect(0,0,64,64);
      this.shadeMaterial=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),color:0x4d3f41,transparent:true,depthWrite:false});
      this.shadeGeo=new THREE.PlaneGeometry(1,1);this.shades=new Map();
    }
    if(!this.shades.has(opacity)){const mat=this.shadeMaterial.clone();mat.opacity=opacity;this.shades.set(opacity,mat);}
    const mesh=new THREE.Mesh(this.shadeGeo,this.shades.get(opacity));
    mesh.position.set(x,y+.031,z);mesh.rotation.set(-Math.PI/2,0,angle);mesh.scale.set(w,d,1);
    this.section.add(mesh);
  }
  windowBay(x,y,z,w,h,glass,side=1){
    const f=0x475560;
    this.block(x,y,z,w+.22,h+.24,.23,f);
    this.block(x,y,z+side*.16,w,h,.10,glass);
    this.block(x,y-.06,z+side*.23,.10,h,.12,f);
    this.block(x,y+h*.17,z+side*.23,w,.10,.12,f);
    this.block(x,y-h*.5-.1,z+side*.16,w+.45,.16,.58,0xe6cea7);
  }
  bench(x,z){
    for(let i=0;i<4;i++)this.block(x,1.43,z+i*.30,5.2,.2,.26,0xa97553,i===0);
    for(let i=0;i<2;i++)this.block(x,2.02+i*.34,z+1.05,5.2,.24,.16,0xc89565);
    for(const dx of [-1.86,1.86]){
      this.block(x+dx,.69,z+.45,.23,1.4,.83,0x405e5a);
      this.block(x+dx,1.69,z+1.05,.16,1.55,.14,0x405e5a);
    }
  }
  archway(x,y,z,yaw,label,width){
    const at=(dx,dy,dz)=>[x+dx*Math.cos(yaw)+dz*Math.sin(yaw),y+dy,z-dx*Math.sin(yaw)+dz*Math.cos(yaw)];
    for(const side of [-1,1])this.block(...at(side*(width/2+.19),3.05,0),.38,6.1,.52,0x60837b,true,yaw);
    this.block(...at(0,6.31,0),width+.85,.62,.76,0xad8067,false,yaw);
    this.sign(label,...at(0,6.32,.40),Math.min(5.3,width),yaw);
  }
  kitchen(){
    const tile=0xb2c8b7, enamel=0xe4dec1, teal=0x397975, metal=0x637575, edge=0xb0bab1, F=-3.5;
    this.block(0,-4.4,0,36,1.8,32,0xb8ab98);this.floor(0,36,32,'kitchen');
    for(const sign of [-1,1]){
      const z=sign*15.9,inside=z-sign*.3;
      const panels=[[-18,18]];
      for(const [left,right] of panels){
        const cx=(left+right)/2,w=right-left;
        this.block(cx,1.7,z,w,10.4,.48,enamel,true);
        this.block(cx,-1.6,inside,w,3.8,.18,tile);
        this.block(cx,.32,inside-sign*.05,w,.23,.24,teal);
        for(let x=left+1;x<right;x+=2)this.block(x,-1.6,inside-sign*.10,.032,3.65,.02,0x839f95);
        for(const y of [-2.56,-1.59,-.63])this.block(cx,y,inside-sign*.11,w,.035,.025,0x839f95);
      }
      for(const x of (sign<0?[-12,-2,14]:[-12,-1,11]))this.windowBay(x,3.76,inside-sign*.15,sign<0?5.6:7.4,2.7,sign<0?0xbcd3cf:0xb5c6b7,-sign);
    }
    this.block(18,-.23,0,.46,6.54,7.5,tile,true);
    this.block(0,6.98,0,36.6,.58,32.8,0xe7dfc7,true);
    for(const x of [-18,18]){
      for(const sign of [-1,1]){
        this.block(x,1.7,sign*9.97,.48,10.4,12,enamel,true);
        this.block(x,-1.53,sign*9.97,.55,3.91,12,tile);
        this.block(x,.46,sign*9.97,.58,.22,12,teal);
        this.block(x,-.2,sign*3.76,.76,6.6,.42,teal,true);
      }
      this.block(x,5.0,0,.53,3.96,7.8,enamel,true);
      this.block(x,3.12,0,.83,.33,7.95,teal);
    }
    // Fachada da cozinha vista do pátio, com janelas e beiral.
    for(const x of [-18.36,18.36]){
      const side=x<0?-1:1;
      this.block(x,6.76,0,.82,.46,32.75,0xb67f67);
      for(const z of [-10,10]){
        this.block(x,2.31,z,.22,2.28,6.2,0x526e71);
        this.block(x+side*.15,2.31,z,.11,1.96,5.88,0x8fafaa);
        for(const dz of [-1.92,0,1.92])this.block(x+side*.23,2.31,z+dz,.09,2,.10,0x546e6e);
        this.block(x+side*.34,3.61,z,.91,.19,6.59,0xb98d6e);
      }
    }
    this.sign('COZINHA',-18.3,4.28,0,6,-Math.PI/2);
    this.sign('PÁTIO • TÉRREO',-17.7,4.28,0,5,Math.PI/2);
    for(const x of [-12,-1,10]){
      this.block(x,6.52,0,.35,.27,31,0xbcb5a3);
      for(const z of [-5.9,5.9]){
        this.block(x,5.82,z,.14,1.43,.13,metal);
        this.block(x,5.05,z,4.1,.21,.83,metal);
        this.block(x,4.91,z,3.87,.11,.65,0xffe4a0);
      }
    }
    // Linha quente: fornos, fogão, coifa e panelas.
    this.block(-5,-2.12,-11.9,15.7,2.76,3.6,teal,true);
    this.block(-5,-.63,-11.9,16.05,.24,3.88,edge,true);
    for(const x of [-10.6,-6.8,-3,0.8]){
      this.block(x,-2.13,-10.06,3.33,1.96,.17,metal);
      this.block(x,-2.13,-9.94,2.76,1.21,.09,0x354e54);
      this.block(x,-1.25,-9.85,2.9,.12,.18,edge);
      for(const dx of [-1.18,-.64])this.drum(x+dx,-.44,-10.35,.24,.13,.24,0x454f4e);
      this.drum(x,-.43,-11.65,1.73,.19,1.73,0x425252);
    }
    this.block(-5,3.5,-11.75,11,.51,4.25,metal);this.block(-5,3.85,-11.8,9.9,.38,3.6,edge);
    for(const x of [-8.6,-1.3])this.block(x,5.23,-12,1.86,2.65,1.7,edge);
    for(const x of [-8.5,-4]){
      this.drum(x,-.05,-10.75,1.64,.83,1.55,edge);
      this.drum(x,.39,-10.75,1.70,.12,1.6,0x586d6d);
      for(const dx of [-.91,.91])this.block(x+dx,.13,-10.75,.37,.13,.28,0x354e54);
    }
    // Bancada de preparo e armários. Há espaço de voo entre os armários e a parede.
    this.block(2,-2.02,11.25,20.5,2.96,2.85,0x67958a,true);
    this.block(2,-.45,11.25,20.85,.20,3.1,enamel,true);
    for(let i=0;i<9;i++){
      const x=-7.1+i*2.28;
      this.block(x,-2.01,9.79,2.09,2.31,.14,i%2?0x7fa396:0x82a998);
      this.block(x+.65,-1.29,9.67,.32,.10,.14,metal);
    }
    for(const x of [-5.4,-1.9]){
      this.block(x,-.31,11.05,2.7,.15,1.7,edge);this.block(x,-.22,11.06,2.16,.055,1.23,metal);
      this.beam([x,-.24,12.04],[x,.71,12.04],.12,.12,metal);this.block(x,.67,11.75,.12,.12,.63,metal);
    }
    for(const x of [4,8.5]){
      this.block(x,-1.4,12.32,3.05,4.2,1.02,0x597f78,true);
      this.block(x,-1.37,11.75,2.72,3.84,.12,0x8aa999);
    }
    for(const x of [-13.5,13.1]){
      this.block(x,-.79,-12.25,3.15,5.42,3.0,metal,true);
      this.block(x,-.67,-10.68,2.87,5.06,.19,edge);
      this.block(x,-.82,-10.54,.08,4.78,.13,metal);this.block(x-.24,-.44,-10.42,.14,1.15,.15,0x465656);
    }
    this.block(-8.4,1.65,-15.3,5.18,2.17,.17,0xa97c55);
    this.sign('PRATO DO DIA',-8.4,1.7,-15.19,4.85,0,'#364b42');
    for(const [x,z,w,d] of [[-4,-11.2,19,6],[2,11,23,5],[2,2,4.2,2.75],[13.5,6.85,4.2,2.9]])
      this.shade(x,z,w,d,F,.28);
    // Prateleira de louça e temperos junto à pia, com a via da faxineira livre.
    for(const y of [1.12,2.03]){
      this.block(-1.5,y,15.16,9.6,.15,.95,0xb08a68);
      for(const x of [-5.65,2.55])this.block(x,y-.25,15.38,.11,.49,.37,metal);
    }
    for(let i=0;i<9;i++){
      const x=-5.4+i*.92,shade=[0xbf805b,0xd2af72,0x92a186][i%3];
      this.drum(x,1.55,15.04,.54,.70,.54,shade);this.drum(x,1.92,15.04,.56,.08,.56,metal);
      this.block(x,1.54,14.765,.35,.20,.027,enamel);
    }
    for(let i=0;i<4;i++)for(let j=0;j<4;j++)
      this.drum(-4.9+i*2.12,2.17+j*.085,15.03,1.32,.07,1.12,i%2?0xd4c9ad:0x8ea79a);
    this.block(-4.3,2.95,-10.12,6.9,.12,.16,metal);
    for(let i=0;i<4;i++){
      const x=-6.9+i*1.55;
      this.block(x,2.48,-10.12,.085,.91,.10,metal);
      this.piece('leaf',x,1.94,-10.12,.48,.59,.14,i%2?0xa5886c:edge);
    }
  }
  courtyard(){
    const rules=EscolaCampus,p=rules.courtyard,w=p.box[1]-p.box[0],d=p.box[3]-p.box[2];
    const teal=0x547f77,clay=0xbd7e5e,beam=0xb7ada0;
    this.block(p.x,-.45,0,w,.9,d,0xc8b49b,'camera');this.floor(p.x,w,d,'paving',0);
    // O teto do pátio é a face inferior da laje do prédio onde o jogador começa.
    this.block(p.x,15.91,0,w,.15,d,0xd0c4ac);
    this.courtyardWalls();
    for(const x of [-112,-88,-64,-40,-16,8,32]){
      this.block(x,15.33,0,1.12,1.16,d,beam);
      for(const z of [-7.6,7.6]){
        this.block(x+.85,14.67,z,3.6,.21,.73,0x706e67);
        this.block(x+.85,14.54,z,3.41,.07,.56,0xffdf9c);
      }
    }
    for(const z of [-18.9,18.9])this.block(p.x,.032,z,w-.5,.025,.18,teal);
    this.courtMarkings(-35,0);
    for(const x of [-53.8,-16.2]){
      for(const z of [-2.7,2.7])this.block(x,1.65,z,.14,3.3,.14,0xeee6ce,true);
      this.block(x,3.32,0,.15,.15,5.55,0xf0ce91,true);
    }
    for(const x of [-103,-84,-62,-12,12,34])this.bench(x,14);
    for(const x of [-72,-2,18])this.bench(x,-18.8);
    // Mesas de recreio ficam na lateral para preservar o corredor de voo central.
    for(const x of [-77,3,24]){
      this.block(x,2.24,-9.1,5.7,.27,3.1,0x718c84,true);
      this.block(x,1.08,-9.1,.9,2.15,.84,0x9a8980,true);
      for(const dz of [-2.08,2.08]){
        this.block(x,1.24,-9.1+dz,5.42,.28,.83,clay,true);
        for(const dx of [-1.75,1.75])this.block(x+dx,.6,-9.1+dz,.51,1.2,.55,beam);
      }
    }
    this.hopscotch(6.5,7.5);
    const [hx,,hz]=rules.hidingPlaces[0];
    this.block(hx,2.8,hz,6.2,.22,3.06,0x64857b,true);
    for(const side of [-1,1]){
      this.block(hx,1.35,hz+side*1.49,6.18,2.7,.20,0x729489,true);
      for(const dx of [-2.85,0,2.85])this.block(hx+dx,1.45,hz+side*1.61,.11,2.88,.10,0x425e58);
    }
    for(const dx of [-2.85,0,2.85])this.block(hx+dx,2.95,hz,.14,.11,3.32,0x425e58);
    const [sx,,sz]=rules.sprinkler;
    this.drum(sx,.13,sz,2.8,.26,2.8,0x81908a);this.drum(sx,.4,sz,.55,.48,.55,teal);
    for(const [x,,z] of rules.switches){
      this.block(x,1.64,z,.55,3.28,.58,0x718b83,true);
      this.block(x,3.05,z,1.32,1.56,.66,teal,true);
      this.sign(z<0?'RELÉ A':'RELÉ B',x,3.53,z+.346,1.12);
      this.block(x,.055,(z+14.4)/2,.14,.09,Math.abs(14.4-z),0xb48a57);
    }
    this.block(-106.8,.055,14.4,21.7,.09,.16,0xb48a57);
    this.archway(-117.5,0,0,Math.PI/2,'ESCADAS',7.6);
    this.sign('DUTO DOS RELÉS',-117.5,5.37,14.4,5.35,Math.PI/2);
  }
  courtyardWalls(){
    const {courtyard,kitchen,cleaning}=EscolaCampus;
    const [west,east,north,south]=courtyard.box,top=courtyard.top-courtyard.floor+.22;
    const stucco=0xc5b597,tile=0x587e77,stone=0xb4a38b,brick=0xac7459,frame=0x3c5b5c;
    const sill=4.85,lintel=10.85,depth=1.12;
    // Une alvenaria, vergas e peitoris à laje. As janelas recuadas ocupam apenas o vão central de cada módulo.
    const wallRun=(left,right,z,side)=>{
      const width=right-left,cx=(left+right)/2,front=z-side*depth/2;
      this.block(cx,sill/2,z,width,sill,depth,stucco,true);
      this.block(cx,(top+lintel)/2,z,width,top-lintel,depth,stucco,true);
      this.block(cx,1.65,front-side*.08,width,3.3,.16,tile);
      this.block(cx,.28,front-side*.12,width,.56,.24,frame);
      this.block(cx,3.42,front-side*.13,width,.17,.25,brick);
      this.block(cx,top-.5,front-side*.19,width,.78,.38,stone);
      const bays=Math.max(1,Math.round(width/17)),bay=width/bays;
      for(let i=0;i<bays;i++){
        const x=left+(i+.5)*bay,opening=bay*.61,pier=(bay-opening)/2;
        for(const dir of [-1,1])this.block(x+dir*(opening+pier)/2,(sill+lintel)/2,z,pier,lintel-sill,depth,stucco,true);
        this.block(x,sill,front,opening+.82,.26,1.24,stone);
        this.block(x,lintel-.04,front,opening+.68,.24,.81,brick);
        this.piece('glass',x,(sill+lintel)/2,z,opening,lintel-sill,.09,0xabc7c0,true);
        for(const t of [-.5,-.25,0,.25,.5])this.block(x+t*opening,(sill+lintel)/2,z-side*.12,.12,lintel-sill,.19,frame);
        for(const y of [sill+.16,lintel-1.47,lintel-.16])this.block(x,y,z-side*.13,opening,.14,.20,frame);
        // Pilastra embutida e rodapé de ladrilhos dão espessura à parede vista da quadra.
        const px=left+i*bay+.48;
        this.block(px,top/2,front-side*.16,.97,top,.40,stone);
        this.block(px,1.60,front-side*.22,1.06,3.2,.41,tile);
        for(let joint=left+i*bay+.98;joint<px+bay-.45;joint+=1.58)this.block(joint,1.75,front-side*.17,.028,2.88,.036,0x698d82);
      }
    };
    wallRun(west,east,north-depth*.40,-1);
    // A fachada existente da cozinha já tem porta e janelas na face sul do pátio.
    const [k0,k1]=kitchen.box;
    wallRun(west,k0,south+depth*.40,1);wallRun(k1,east,south+depth*.40,1);
    this.block(kitchen.x,(10.75+top)/2,south+.46,k1-k0,top-10.75,depth,stucco,true);
    this.block(kitchen.x,11.04,south-.15,k1-k0,.38,.55,brick);
    const endPanel=(x,z0,z1,base,height,side)=>{
      const z=(z0+z1)/2,span=z1-z0;
      this.block(x,base+height/2,z,depth,height,span,stucco,true);
      if(base===0){
        this.block(x+side*.62,1.65,z,.16,3.3,span,tile);
        this.block(x+side*.70,3.42,z,.20,.17,span,brick);
      }
    };
    const wx=west-.58,ex=east+.59;
    for(const [z0,z1] of [[north,-3.95],[3.95,11.78],[17,south]])endPanel(wx,z0,z1,0,top,1);
    endPanel(wx,-3.95,3.95,7.14,top-7.14,1);
    endPanel(wx,11.78,17,6.56,top-6.56,1);
    const [, ,cz0,cz1]=cleaning.box;
    endPanel(ex,north,cz0,0,top,-1);endPanel(ex,cz1,south,0,top,-1);
    endPanel(ex,cz0,cz1,12.30,top-12.30,-1);
  }
  courtMarkings(x,z){
    const c=document.createElement('canvas');c.width=1024;c.height=512;
    const g=c.getContext('2d');g.fillStyle='#a95f4d';g.fillRect(0,0,1024,512);
    g.fillStyle='#6c948a';g.fillRect(35,34,954,444);
    g.fillStyle='#568179';
    g.save();g.beginPath();g.rect(35,34,954,444);g.clip();
    for(const edge of [35,989]){g.beginPath();g.arc(edge,256,123,0,2*Math.PI);g.fill();g.strokeStyle='#efe1bd';g.lineWidth=4;g.stroke();}
    g.restore();g.strokeStyle='#efe1bd';g.lineWidth=5;
    g.strokeRect(35,34,954,444);g.beginPath();g.moveTo(512,34);g.lineTo(512,478);g.stroke();
    g.beginPath();g.arc(512,256,74,0,2*Math.PI);g.stroke();g.beginPath();g.arc(512,256,6,0,2*Math.PI);g.fillStyle='#efe1bd';g.fill();
    const m=new THREE.Mesh(new THREE.PlaneGeometry(40.4,23.9),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),color:0xcfbfa9,roughness:.98}));
    m.position.set(x,.038,z);m.rotation.x=-Math.PI/2;this.section.add(m);
  }
  hopscotch(x,z){
    const c=document.createElement('canvas');c.width=256;c.height=640;const ctx=c.getContext('2d');
    ctx.strokeStyle='#f9e5b2';ctx.lineWidth=6;ctx.font='bold 43px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    let n=1;
    for(let row=0;row<7;row++){
      for(const center of (row===2||row===4||row===6?[66,190]:[128])){
        const y=575-row*85;
        ctx.fillStyle=['#d88b78','#73a69a','#d8ad69'][row%3];
        ctx.fillRect(center-54,y-35,108,70);ctx.strokeRect(center-54,y-35,108,70);
        ctx.fillStyle='#fff3cd';ctx.fillText(String(n++),center,y+1);
      }
    }
    const m=new THREE.Mesh(new THREE.PlaneGeometry(4.1,8.4),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));
    m.position.set(x,.052,z);m.rotation.x=-Math.PI/2;this.section.add(m);
  }
  cleaningRoom(){
    const r=EscolaCampus.cleaning,x=r.x,wall=0xe2cba2,teal=0x619a91,iron=0x526966,wood=0xb58a62;
    this.block(x,-.4,0,36,.8,32,teal);this.floor(x,36,32,'kitchen',0);
    this.block(x,12.06,0,36.5,.47,32.35,0xe1d9be,true);
    for(const z of [-16,16]){
      const s=Math.sign(z);
      this.block(x,6,z,36,12,.4,wall,true);this.block(x,1.92,z-s*.23,36,3.84,.16,teal);
      this.block(x,3.89,z-s*.25,36,.13,.23,wood);
      for(const dx of [-11,0,11])this.windowBay(x+dx,7.77,z-s*.28,7.3,2.7,0xadcbc0,-s);
    }
    this.block(82,6,0,.42,12,32,wall,true);
    for(const side of [-1,1]){
      this.block(46,6,side*10.04,.45,12,12.0,wall,true);
      this.block(45.74,1.72,side*10.04,.12,3.44,12,teal);
      this.block(45.64,3.51,side*10.04,.18,.13,12,wood);
    }
    this.block(46,9.55,0,.46,4.9,8.2,wall,true);
    this.archway(45.62,0,0,-Math.PI/2,'ZELADORIA',7.35);
    this.sign('PÁTIO',46.29,7.63,0,5.8,Math.PI/2);
    // Mural de azulejos nos dois painéis que emolduram a entrada da zeladoria.
    for(const side of [-1,1]){
      const c=document.createElement('canvas');c.width=512;c.height=208;const pen=c.getContext('2d');
      pen.fillStyle='#487f80';pen.fillRect(0,0,512,208);
      pen.fillStyle='#dfa65f';pen.beginPath();pen.arc(side<0?112:379,73,43,0,2*Math.PI);pen.fill();
      pen.fillStyle='#8eb5a0';pen.beginPath();pen.moveTo(0,122);pen.quadraticCurveTo(140,32,290,128);pen.quadraticCurveTo(400,178,512,66);pen.lineTo(512,208);pen.lineTo(0,208);pen.fill();
      pen.fillStyle='#bd785f';pen.beginPath();pen.moveTo(0,181);pen.lineTo(165,100);pen.lineTo(271,154);pen.lineTo(397,113);pen.lineTo(512,169);pen.lineTo(512,208);pen.lineTo(0,208);pen.fill();
      pen.strokeStyle='#e9d8b855';pen.lineWidth=1.5;
      for(let i=0;i<512;i+=32)pen.strokeRect(i,0,32,208);
      for(let j=0;j<208;j+=32)pen.strokeRect(0,j,512,32);
      const mural=new THREE.Mesh(new THREE.PlaneGeometry(9.65,3.92),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),roughness:.85}));
      mural.position.set(45.69,6.66,side*10.1);mural.rotation.y=-Math.PI/2;this.section.add(mural);
    }
    // Lavanderia: máquinas com escotilhas, tanque duplo e um ralo no piso quadriculado.
    for(const px of [52.6,56.6]){
      this.block(px,2.06,-12.82,3.75,4.12,3.55,0xc1cfbd,true);
      this.block(px,3.55,-10.98,3.42,.69,.14,iron);
      this.piece('drum',px,1.91,-10.97,2.39,.18,2.39,0x667e79,false,0,0,Math.PI/2);
      this.piece('drum',px,1.91,-10.82,1.93,.14,1.93,0x455a68,false,0,0,Math.PI/2);
    }
    this.block(64.1,1.61,-12.9,7.18,3.2,2.62,0x899e93,true);
    this.block(64.1,3.34,-12.9,7.44,.24,2.89,0xddd7be);
    for(const px of [62.5,65.72]){
      this.block(px,3.49,-12.9,2.83,.08,2.12,iron);
      this.block(px,4.16,-14.02,.14,1.44,.14,iron);this.block(px,4.8,-13.68,.14,.13,.81,iron);
    }
    for(const z of [-11.0,-7.7,-4.4]){
      this.block(74.5,2.62,z,2.45,5.24,3.15,0x628582,true);
      this.block(73.21,2.61,z,.13,4.85,2.91,0x7f9d92);
      for(let i=0;i<4;i++)this.block(73.12,4.12+i*.095,z,.06,.04,1.32,iron);
      this.block(73.09,2.25,z+.89,.18,.55,.12,iron);
    }
    for(const y of [1.32,3.45,5.55])this.block(65,y,13.5,13,.17,2.15,wood,true);
    for(const px of [58.6,71.4])for(const pz of [12.5,14.45])this.block(px,3.01,pz,.15,6.02,.15,iron);
    for(let i=0;i<10;i++){
      const px=59.45+i*1.18,y=i%3===0?3.6:1.47,colors=[0xce8f5b,0x739f9f,0xcba56e,0x7b94ab];
      this.drum(px,y+.41,13.4,.65,.79,.65,colors[i%4]);this.drum(px,y+.90,13.4,.31,.23,.31,0xe5cf9f);
    }
    for(let i=0;i<7;i++)this.block(60.6+i%3*1.83,5.83+Math.floor(i/3)*.23,13.4,1.64,.21,1.22,i%2?0xb1b7a0:0xd9b386);
    this.block(80.9,5.3,6.3,.18,.4,7.2,iron);
    for(let i=0;i<4;i++){
      const z=3.8+i*1.55;
      this.beam([79.85,.73,z],[80.72,5.86,z],.13,.13,wood);
      this.block(79.78,.61,z,.58,.25,1.15,iron);
      for(let j=0;j<5;j++)this.block(79.72,.33,z-.44+j*.22,.49,.42,.17,0xcbbfa3);
    }
    this.block(61,.05,-7,2.1,.07,1.36,iron);
    for(let i=0;i<7;i++)this.block(60.19+i*.27,.098,-7,.10,.035,1.13,0x9da69b);
    // Carrinho e placa de piso molhado deixam o centro livre para o combate.
    for(const dx of [-.89,.89])for(const dz of [-.55,.55])this.drum(55+dx,.32,7+dz,.42,.55,.42,iron);
    this.block(55,.7,7,2.75,.27,1.77,iron,true);this.drum(55,1.45,7,1.5,1.37,1.5,0xd69f54,true);
    this.beam([55.58,1.06,7.2],[56.07,4.92,7.5],.14,.14,wood);
    for(const dir of [-1,1])this.block(57.8,1.25,5.8+dir*.44,1.28,2.58,.14,0xf1bd58,false,0,0,dir*.29);
    this.shade(66,.4,4.3,3.8,0,.32);
    for(const px of [54,66,77]){
      this.block(px,11.73,0,4.3,.23,.85,iron);this.block(px,11.56,0,4.1,.09,.70,0xffe7b5);
    }
  }
  sail(corners,color){
    const a=new THREE.Vector3(...corners[0]),b=new THREE.Vector3(...corners[1]),c=new THREE.Vector3(...corners[2]);
    const positions=[],indices=[],n=7;
    for(let row=0;row<=n;row++){
      const start=positions.length/3;
      for(let col=0;col<=n-row;col++){
        const v=row/n,w=col/n,u=1-v-w;
        positions.push(a.x*u+b.x*v+c.x*w,a.y*u+b.y*v+c.y*w-25*u*v*w,a.z*u+b.z*v+c.z*w);
        if(col<n-row){
          const i=start+col,j=start+n-row+1+col;
          indices.push(i,j,i+1);if(col<n-row-1)indices.push(i+1,j,j+1);
        }
      }
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geo.setIndex(indices);geo.computeVertexNormals();
    const cloth=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,side:THREE.DoubleSide,roughness:1}));
    this.section.add(cloth);
    for(let i=0;i<3;i++)this.beam(corners[i],corners[(i+1)%3],.065,.065,0xe0c397);
  }
  planter(x,z,length){
    const clay=0xb88268;
    this.block(x,.66,z,length,1.32,2.12,clay,true);
    this.block(x,1.37,z,length+.17,.15,2.3,0xdbb99a);this.block(x,1.47,z,length-.27,.07,1.82,0x776958);
    const count=Math.floor(length/1.55);
    for(let i=0;i<count;i++){
      const px=x+(i-(count-1)/2)*1.53,odd=i%2;
      this.piece('leaf',px,1.97+.1*odd,z+.13*Math.cos(i),2.08,1.5,1.74,odd?0x759572:0x658875,false,i*.9);
      if(i%3!==1)this.piece('leaf',px+.25,2.59,z-.07,.42,.34,.4,odd?0xcc9982:0xd4ac70);
    }
  }
  terraceDeck(){
    const r=EscolaCampus.roof,brick=0xb48170,stone=0xd6bca0,rail=0x476763,wood=0xa57958;
    const w=r.box[1]-r.box[0],d=r.box[3]-r.box[2];
    this.block(r.x,-.065,0,w,.13,d,stone,'camera');this.floor(r.x,w,d,'terrace',0);
    // Platibanda baixa e guarda-corpo vazado: a vista continua aberta sobre a escola.
    for(const side of [-1,1]){
      const z=side*18;
      this.block(r.x,.54,z,w,1.08,.53,brick,true);
      this.block(r.x,1.11,z,w+.28,.14,.70,stone);
      for(const y of [1.62,2.51])this.block(r.x,y,z,w,.115,.135,rail);
      for(let x=-117.5;x<95;x+=5.2)this.block(x,1.74,z,.12,1.55,.12,rail);
      this.block(r.x,.045,side*16.33,w-.4,.027,.18,0x947969);
    }
    this.block(94,.56,0,.52,1.12,36,brick,true);this.block(94,2.5,0,.14,.14,36,rail);
    for(let z=-17.2;z<18;z+=4.6)this.block(94,1.78,z,.13,1.5,.13,rail);
    for(const [a,b] of [[-18,-3.84],[3.84,11.85],[16.95,18]]){
      this.block(-118,.65,(a+b)/2,.48,1.3,b-a,brick,true);
      this.block(-118,2.48,(a+b)/2,.14,.14,b-a,rail);
    }
    // Salas ao norte e ao sul têm seus próprios telhados, visíveis além da balaustrada.
    for(const side of [-1,1]){
      for(let bay=0;bay<7;bay++){
        const x=-101.5+bay*33.0,z=side*57,width=31.4;
        for(const face of [-1,1]){
          this.block(x+face*width/4,.78,z,width/2+.1,.18,69,0x9a8986,false,0,-face*.09);
          for(let seam=0;seam<6;seam++){
            const u=(seam+.5)/6;
            this.block(x+face*u*width/2,1.55-u*.70,z,.086,.10,69,0xaa9893);
          }
        }
        this.block(x,1.56,z,.34,.16,69,0x927d77);
        this.block(x+6,1.45,z-side*17.5,7.9,.64,3.9,0x687c7c);
        this.block(x+6,1.82,z-side*17.5,7.54,.11,3.58,0xa2bfba);
      }
    }
    // Jardineiras, bancos e mesas ocupam os lados do passeio.
    for(const x of [-102,-76,-48,-20,12,40,67,85]){
      this.planter(x,-13.65,7.1);this.bench(x,-10.7);
    }
    for(const x of [-100,-56,-19,16,53]){this.planter(x,14.3,8.1);this.bench(x,10.6);}
    for(const x of [-85,-50,-12,25,60]){
      this.drum(x,.21,5.8,1.84,.42,1.84,rail);this.drum(x,1.34,5.8,.26,2.3,.26,rail);
      this.drum(x,2.5,5.8,3.68,.22,3.68,0xcba16e,true);
      for(const dx of [-2.3,2.3]){
        this.drum(x+dx,.65,5.8,.48,1.29,.48,rail);this.drum(x+dx,1.33,5.8,1.32,.20,1.32,wood,true);
      }
    }
    // Velas de sombra em alturas diferentes deixam a faixa central aberta ao voo.
    for(const x of [-91,-13,43]){
      const anchors=[[x-8,7.8,-11],[x+7.6,6.1,-10],[x-.7,7.0,-1.2],[x+15,8.3,-2.4]];
      for(const [px,h,pz] of anchors)this.drum(px,h/2,pz,.21,h,.21,rail,true);
      this.sail(anchors.slice(0,3),0xc58565);this.sail([anchors[1],anchors[3],anchors[2]],0x679690);
    }
    // Dois respiradouros de alvenaria resguardam a Asa de Ardósia.
    const [hx,,hz]=EscolaCampus.hidingPlaces[2];
    for(const side of [-1,1]){
      const x=hx+side*1.36;
      this.block(x,1.54,hz,1.46,3.08,4.12,brick,true);
      this.block(x,3.18,hz,1.72,.22,4.39,stone);
      this.block(x,3.315,hz,1.21,.08,3.90,0x5b5c5b);
      for(let i=0;i<8;i++)this.block(x,3.38,hz-1.60+i*.46,1.25,.08,.09,rail);
    }
    for(const x of [73,88.5])for(const z of [-7.2,-.5])this.block(x,3.4,z,.35,6.8,.35,wood,true);
    for(const z of [-7.2,-.5])this.block(80.75,6.86,z,16.7,.36,.36,wood);
    for(let i=0;i<15;i++)this.block(72.7+i*1.16,7.12,-3.85,.32,.20,7.93,0xc39a71);
    this.sign('MIRANTE',73.2,6.81,-3.85,4.45,-Math.PI/2);
    const [vx,,vz]=EscolaCampus.vane;this.drum(vx,.22,vz,1.33,.44,1.33,rail);
    this.drum(vx,2.69,vz,.14,5.37,.14,rail,true);
    this.archway(-118,0,0,Math.PI/2,'ESCADAS',7.7);
  }
  stairs(){
    const rules=EscolaCampus,concrete=0xc8bba4,iron=0x4a6f6a,ochre=0xd9aa67;
    const floorDeck=(x0,x1,z0,z1,y)=>{
      this.block((x0+x1)/2,y-.23,(z0+z1)/2,x1-x0,.46,z1-z0,concrete,'camera');
    };
    for(const level of rules.levels){
      const y=level.floor;
      floorDeck(-126,-120,-8,8,y);floorDeck(-120,-118,-3.85,3.85,y);
      for(const side of [-1,1]){
        const z=side*8.22;
        this.block(-123, y+.62,z,6.1,1.24,.36,0xb5886e,true);
        this.block(-123,y+2.24,z,6.25,.13,.14,iron,true);
      }
      if(level.id!=='first')floorDeck(-123,-118,11.85,16.97,y);
      this.sign(level.name.toLocaleUpperCase('pt-BR'),-119.86,y+5.75,5.85,3.6,-Math.PI/2);
    }
    for(const l of rules.landings.filter(v=>v.name==='Patamar da escada')){
      floorDeck(-154,-146,-8,8,l.floor);
      this.block(-153.87,l.floor+.7,0,.37,1.4,16,0xa97962);
      this.block(-153.9,l.floor+2.16,0,.14,.13,16,iron);
    }
    for(const flight of rules.flights){
      const dx=(flight.to-flight.from)/flight.steps,z=flight.z,w=flight.box[3]-flight.box[2];
      const low=flight.floor,rise=flight.rise/flight.steps;
      for(let i=0;i<flight.steps;i++){
        const x=flight.from+(i+.5)*dx,top=low+rules.stepOffset(flight,x);
        this.block(x,top-.24,z,Math.abs(dx)+.012,.48,w,concrete,'camera');
        this.block(x-.41*dx,top+.012,z,.13,.025,w,ochre);
      }
      // A placa inferior fecha o intradorso, sem ocupar o lance logo abaixo.
      this.beam([flight.from,low-.64,z],[flight.to,low+flight.rise-.64,z],.35,w,0xa6a095);
      for(const side of [-1,1]){
        const edge=z+side*(w/2-.095);
        this.beam([flight.from,low+1.78,edge],[flight.to,low+flight.rise+1.78,edge],.13,.13,iron,true);
        for(let i=0;i<=flight.steps;i+=4){
          const x=flight.from+i*dx,top=low+i*rise;
          this.block(x,top+.85,edge,.13,1.8,.13,iron,true);
        }
      }
      const up=flight.from>flight.to,finish=up?flight.to:flight.from;
      // Platibanda contínua à base de cada lance.
      this.block(finish,low+(up?flight.rise:0)-.3,z,.55,.52,w,concrete);
    }
    // O fechamento externo fica além do corrimão: há ar dos dois lados das barras.
    const [x0,x1,z0,z1]=rules.stairwell.box,base=rules.ground,top=rules.stairwell.top;
    const width=x1-x0,depth=z1-z0,height=top-base,midY=(top+base)/2;
    this.block(-137,base-.24,0,width,.48,depth,concrete,'camera');
    for(const side of [-1,1]){
      const z=side*(z1+.22);
      this.piece('glass',-137,midY,z,width,height,.12,0x86aea9,'camera');
      for(const x of [x0,-146,-136,-126,x1])this.block(x,midY,z,.51,height,.44,iron);
      for(const y of [-19.5,-12,-2.6,5.8,15.12,21.5]){
        this.block(-137,y,z,width+.45,.27,.32,iron);
        this.block(-137,y+.56,z,width+.45,.64,.30,0xc4a080);
      }
    }
    this.block(x0-.2,midY,0,.4,height,depth,concrete,'camera');
    for(const side of [-1,1]){
      const w=z1-3.8;
      this.block(x1+.18,midY,side*(3.8+w/2),.36,height,w,concrete,'camera');
    }
    for(let i=0;i<rules.levels.length;i++){
      const lintel=rules.levels[i].floor+7.1,next=rules.levels[i+1]?.floor??top;
      this.block(x1+.18,(lintel+next)/2,0,.36,next-lintel,7.6,concrete,'camera');
    }
    this.block(-137,top+.255,0,width+.8,.51,depth+.9,0xaf8770);
    this.block(-120.04,rules.first+7.45,0,.20,.77,7.95,iron);
    this.sign('ESCADAS',-117.72,rules.first+7.64,0,5.8,Math.PI/2);
    for(const [z,name] of [[-4.6,'TERRAÇO  ↑'],[4.6,'TÉRREO  ↓']]){
      this.block(-128.7,rules.first+6.72,z,.19,.97,5.13,iron);
      this.sign(name,-128.58,rules.first+6.72,z,4.89,Math.PI/2);
    }
  }
  serviceShaft(){
    const {shaft,ground,terrace,gateY,gateDepth}=EscolaCampus;
    const [x0,x1,z0,z1]=shaft.box,h=shaft.top-ground,y=ground+h/2,steel=0x526e6e;
    for(const x of [x0,x1])for(const z of [z0,z1])this.block(x,y,z,.39,h,.39,steel);
    this.block(x0-.14,y,shaft.z,.32,h,z1-z0,0x82938b);
    this.block(shaft.x,ground-.22,shaft.z,x1-x0,.44,z1-z0,0xb0a893,true);
    this.block(shaft.x,shaft.top+.22,shaft.z,x1-x0+.67,.44,z1-z0+.66,0x738784);
    for(const z of [z0-.13,z1+.13]){
      for(let yy=ground+.24;yy<shaft.top;yy+=2.12)this.block(shaft.x,yy,z,9,.16,.16,steel);
      for(let xx=x0+.7;xx<x1;xx+=.94)this.block(xx,y,z,.06,h,.07,steel);
    }
    this.block(x1+.10,(terrace+ground+6.6)/2,shaft.z,.24,terrace-ground-6.6,6.9,0x80958e);
    for(const yy of [ground,terrace]){
      this.block(-120.4,yy+6.7,shaft.z,5.4,.29,5.28,steel);
      this.sign(yy===ground?'DUTO • TERRAÇO':'DUTO • TÉRREO',-117.67,yy+6.7,shaft.z,4.8,Math.PI/2);
      for(const z of [11.76,17.05])this.block(-120.4,yy+1.43,z,5.29,.13,.12,steel);
    }
    this.shutter=new THREE.Group();
    const barGeo=new THREE.BoxGeometry(8.89,.14,.10);
    const rails=new THREE.InstancedMesh(barGeo,new THREE.MeshStandardMaterial({color:0xae9369}),24);
    let count=0;const matrix=new THREE.Matrix4();
    for(const dy of [-gateDepth,gateDepth])for(let i=0;i<12;i++)
      rails.setMatrixAt(count++,matrix.makeTranslation(-4.45,gateY+dy,z0+.27+i*.585));
    this.shutter.add(rails);this.shutter.position.x=x1;
    this.section.add(this.shutter);
    this.fan=new THREE.Group();this.fan.position.set(shaft.x,shaft.top-.48,shaft.z);
    const blade=new THREE.BoxGeometry(1.2,.13,2.3),mat=new THREE.MeshStandardMaterial({color:0x5d7773});
    for(let i=0;i<5;i++){
      const angle=i*Math.PI*2/5,b=new THREE.Mesh(blade,mat);
      b.position.set(Math.sin(angle)*1.45,0,Math.cos(angle)*1.45);b.rotation.y=angle+.32;this.fan.add(b);
    }
    this.section.add(this.fan);
  }
  surroundings(){
    const f=EscolaCampus.ground;
    this.block(0,f-.81,0,1000,1,900,0x778071);
    for(const z of [-30.5,29.5]){
      for(let x=-112;x<=112;x+=15){
        if(z>0&&x>-67&&x<-23)continue;
        this.block(x,f+.45,z,12.6,.9,3.9,0xb38c71);
        for(let i=0;i<6;i++)this.piece('leaf',x-5+i*2,f+1.25,z+.36*Math.cos(i),2.65,1.89,2.34,i%2?0x779370:0x5f7d67);
      }
    }
    this.schoolBase(f);
    this.neighborhood(f);
  }
  schoolBase(f){
    const height=EscolaCampus.first-2-f,wall=0xb6a68e,base=0x607a72,cap=0xae8769;
    const wing=(x0,x1,z0,z1)=>{
      const x=(x0+x1)/2,z=(z0+z1)/2,w=x1-x0,d=z1-z0;
      this.block(x,f+height/2,z,w,height,d,wall);
      this.block(x,f+1.77,z,w+.18,3.54,d+.18,base);
      this.block(x,f+height-.38,z,w+.36,.76,d+.36,cap);
    };
    // Volumes fechados sob as salas e sob a Sala 3. Os recuos iluminam a quadra e respeitam a cozinha.
    wing(-118,118,-100,-44);wing(-118,118,62,100);
    wing(82.5,118,-44,62);wing(118,158,-18,18);
    wing(-118,-104,-44,-22.7);wing(-118,-104,22.7,62);
    wing(46.7,82.5,-44,-16.3);wing(46.7,82.5,16.3,62);
    for(const [z,face] of [[-44,1],[62,-1],[-100,-1],[100,1]]){
      for(let x=-107;x<=110;x+=17.5){
        if(z===62&&x>-64&&x<-26)continue;
        this.windowBay(x,f+8.7,z+face*.19,10.4,3.9,0x82a1a0,face);
        this.block(x,f+11.32,z+face*.48,11.4,.37,1.59,cap);
      }
    }
    // A caixa da escada se apoia em paredes laterais desde a fundação.
    for(const z of [-11.03,11.03]){
      this.block(-137,f+2.32,z,34.5,4.64,.68,base);
      this.block(-137,f+5.07,z,34.6,.40,.85,cap);
      for(const x of [-153.7,-144.3,-119.9])this.block(x,f+8,z,1.05,16,.78,wall);
    }
  }
  neighborhood(f){
    const road=0x5d6369,pave=0xb7a594,paint=0xd2bb78;
    const vertical=[-205,-163,167,205],horizontal=[-157,-109,109,157];
    for(const z of horizontal){
      this.block(0,f-.15,z,486,.28,10,road);
      for(let i=1;i<vertical.length;i++){
        const a=vertical[i-1]+5,b=vertical[i]-5;
        for(const side of [-1,1])this.block((a+b)/2,f+.02,z+side*6.2,b-a,.48,2.4,pave);
        for(let x=a+6;x<b-4;x+=13)this.block(x,f+.015,z,5.2,.04,.19,paint);
      }
    }
    for(const x of vertical){
      this.block(x,f-.17,0,9,.29,390,road);
      for(let i=1;i<horizontal.length;i++){
        const a=horizontal[i-1]+5,b=horizontal[i]-5;
        for(const side of [-1,1])this.block(x+side*5.7,f+.02,(a+b)/2,2.4,.48,b-a,pave);
        for(let z=a+5;z<b-4;z+=13)this.block(x,f+.015,z,.18,.04,5.2,paint);
      }
    }
    for(const x of [-163,167])for(const z of [-109,109]){
      for(let i=-3;i<=3;i++)this.block(x+i*1.12,f+.04,z-Math.sign(z)*7,.51,.06,2.8,0xc9c1a2);
    }
    // Cada fachada se volta para a rua. Os quarteirões têm ritmos, profundidades e silhuetas próprios.
    const N=0,S=Math.PI,E=-Math.PI/2,W=Math.PI/2;
    const lots=[
      [-112,-131,N,'oficina',33,21,26],[-74,-132,N,'varandas',26,21,50],
      [-34,-133,N,'cine',31,23,40],[7,-140,N,'torre',29,32,80],
      [46,-131,N,'varandas',26,21,61],[83,-132,N,'oficina',34,23,32],[122,-131,N,'varandas',24,22,48],
      [-118,132,S,'varandas',26,23,54],[-78,131,S,'cine',32,22,38],
      [-38,138,S,'torre',27,29,74],[2,132,S,'oficina',33,22,29],
      [42,130,S,'varandas',26,19,63],[81,134,S,'varandas',28,23,44],[123,136,S,'torre',26,27,67],
      [-181,-79,W,'varandas',28,21,67],[-184,-37,W,'oficina',32,24,29],[-184,6,W,'cine',30,25,42],
      [-183,49,W,'torre',28,25,75],[-182,89,W,'varandas',27,23,50],
      [186,-78,E,'oficina',33,25,31],[187,-36,E,'torre',26,25,73],[185,5,E,'varandas',28,22,63],
      [186,48,E,'cine',31,23,40],[185,89,E,'varandas',26,22,51]
    ];
    lots.forEach(([x,z,yaw,kind,w,d,h],i)=>this.cityBuilding(f,x,z,yaw,kind,w,d,h,i));
    for(const side of [-1,1]){
      for(let i=0;i<13;i++){
        const x=-189+i*31;
        this.cityBuilding(f,x,side*(178+i%2*3),side<0?N:S,'casa',20+i%3*2,15,11+i%4*1.4,i);
      }
      for(let i=0;i<10;i++){
        const z=-139+i*31;
        this.cityBuilding(f,side*(225+i%2*3),z,side<0?W:E,'casa',20+i%3*2,15,11+i%4*1.4,i+3);
      }
      for(let i=0;i<9;i++){
        const x=-144+i*36,z=side*117.9;
        this.drum(x,f+2,z,.62,4,.62,0x726257);
        this.piece('leaf',x,f+5.4,z,4.3+i%3,5.5,4.4,i%2?0x647b66:0x759073);
      }
      for(let i=0;i<6;i++){
        const x=side<0?-170.7:174.7,z=-87+i*34;
        this.drum(x,f+2,z,.62,4,.62,0x726257);
        this.piece('leaf',x,f+5.4,z,4.6,5.4,4.7,0x758a71);
      }
    }
  }
  cityBuilding(f,cx,cz,yaw,kind,w,d,h,variant){
    const sin=Math.sin(yaw),cos=Math.cos(yaw),front=d/2;
    const at=(u,y,v)=>[cx+u*cos+v*sin,f+y,cz-u*sin+v*cos];
    const block=(u,y,v,a,b,c,color)=>this.block(...at(u,y,v),a,b,c,color,false,yaw);
    const drum=(u,y,v,a,b,c,color)=>this.drum(...at(u,y,v),a,b,c,color);
    const cream=0xd2bca3,trim=0x5d7476,shale=0x66747e,brick=0xa56a59;
    const glass=[0x607f8c,0x7d999c,0xb0b8aa,0xd8b385];
    const walls=[0xb98066,0xbca693,0x95a49b,0xb79586];
    const wall=walls[variant%walls.length];
    block(0,.28,0,w+3,.56,d+3,0xbdac98);
    if(kind==='casa'){
      const eave=h*.7,peak=h-eave,roofColor=[0x966f61,0x667b81,0xb58770][variant%3];
      block(0,eave/2,0,w,eave,d,wall);
      if(variant%3===1){
        block(0,eave+.32,0,w+.95,.64,d+.85,cream);
        block(-w*.22,eave+1.4,-d*.16,w*.42,2.8,d*.55,wall);
      }else{
        for(let i=-2;i<=2;i++){
          const extra=peak*(1-Math.abs(i)/2.5);
          block(i*w/5,eave+extra/2,0,w/5+.02,extra,d,wall);
        }
        const slope=Math.atan2(peak,w/2);
        for(const side of [-1,1])this.block(...at(side*w/4,eave+peak/2,0),Math.hypot(w/2,peak)+.9,.48,d+1.5,roofColor,false,yaw,-side*slope);
        block(w*.25,h-.1,-d*.2,1.35,2.7,1.45,brick);
      }
      block(0,2,front+.16,2.1,4,.30,trim);
      for(const side of [-1,1]){
        block(side*w*.28,eave*.54,front+.16,w*.21,2.6,.30,glass[(variant+1)%4]);
        block(side*w*.28,eave*.54-1.39,front+.28,w*.23,.23,.59,cream);
      }
      return;
    }
    if(kind==='oficina'){
      const eave=h*.61;
      block(0,eave/2,0,w,eave,d,brick);
      for(const side of [-1,1]){
        const u=side*w/4,peak=eave+w*.19,slope=Math.atan2(peak-eave,w/2);
        this.block(...at(u,(eave+peak)/2,0),Math.hypot(w/2,peak-eave)+.7,.56,d+1.3,0x698386,false,yaw,-side*slope);
      }
      // Empena em madeira sob a cumeeira, com janelas altas no galpão.
      for(let i=0;i<9;i++){
        const u=(i-4)*w/9,extra=(1-Math.abs(u)/(w/2))*w*.19;
        block(u,eave+extra/2,0,w/9+.015,extra,d,0xaf826b);
      }
      for(let i=-2;i<=2;i++){
        const u=i*w*.178;
        block(u,eave*.53,front+.11,w*.134,eave*.41,.22,shale);
        block(u,eave*.54,front+.27,w*.108,eave*.34,.18,glass[(i+4)%3]);
        block(u,eave*.53,front+.38,w*.13,.15,.14,cream);
      }
      const tankX=w*.27,tankZ=-d*.17,tankY=h+3;
      for(const du of [-1.86,1.86])for(const dv of [-1.52,1.52]){
        block(tankX+du,(tankY+eave)/2,tankZ+dv,.34,tankY-eave,.34,trim);
      }
      drum(tankX,tankY,tankZ,6.35,5.5,6.35,0x698986);
      for(const y of [-2.52,0,2.5])drum(tankX,tankY+y,tankZ,6.52,.22,6.52,cream);
      this.piece('cone',...at(tankX,tankY+3.3,tankZ),6.7,1.6,6.7,shale);
      return;
    }
    if(kind==='torre'){
      const low=h*.61,mid=h*.27,crown=h-low-mid;
      block(0,low/2,0,w,low,d,0x77939a);
      block(-w*.06,low+mid/2,-d*.05,w*.80,mid,d*.78,0x74929b);
      block(-w*.10,low+mid+crown/2,-d*.08,w*.54,crown,d*.56,0x8ba2a2);
      for(const [u,v,width,depth,bottom,high] of [[0,0,w,d,0,low],[-w*.06,-d*.05,w*.8,d*.78,low,mid],[-w*.10,-d*.08,w*.54,d*.56,low+mid,crown]]){
        for(const side of [-1,1]){
          for(let n=-2;n<=2;n++)block(u+n*width*.19,bottom+high/2,v+side*(depth/2+.12),.30,high,.26,cream);
          for(let n=-1;n<=1;n++)block(u+side*(width/2+.1),bottom+high/2,v+n*depth*.35,.24,high,.29,shale);
        }
        for(let band=bottom+4;band<bottom+high-.7;band+=4.35)block(u,band,v,width+.21,.29,depth+.22,0x506a78);
        block(u,bottom+high,v,width+.76,.65,depth+.75,cream);
      }
      drum(-w*.1,h+2.7,-d*.08,.31,5.5,.31,shale);
      return;
    }
    if(kind==='cine'){
      const base=h*.60,tower=w*.265;
      block(0,base/2,0,w,base,d,0xb87763);
      block(-w*.23,(base+2)/2,front-.25,w*.51,base+2,2.3,cream);
      block(w*.22,h*.45,front-1.6,tower,h*.90,4.8,0xce9b73);
      block(w*.22,h*.91,front-1.8,tower*.76,h*.13,4.0,cream);
      block(w*.22,h*.99,front-1.8,tower*.47,1.0,3.2,trim);
      for(let i=-1;i<=1;i++)block(w*.22+i*1.38,h*.61,front+.94,.61,h*.56,.65,0x82655d);
      block(-w*.22,7.2,front+.8,w*.50,5.9,.43,0x42646b);
      block(-w*.22,10.6,front+2.1,w*.69,1.25,4.75,trim);
      block(-w*.22,11.5,front+2.1,w*.68,.46,4.6,0xe6c893);
      for(let i=-1;i<=1;i++)block(-w*.22+i*3.35,base*.71,front+1.06,1.85,3.4,.36,0x81a3a4);
      this.sign('CINE',...at(-w*.22,base*.91,front+1.16),8.65,yaw,'#396361');
      for(const side of [-1,1])for(let j=-1;j<=1;j++){
        block(side*(w/2+.16),base*.63,j*d*.28,.32,base*.6,.76,cream);
        block(side*(w/2+.19),base*.44,(j+.39)*d*.25,.34,2.7,d*.13,shale);
      }
      return;
    }
    // Bloco residencial com galerias sombreadas, guarda-corpos e caixa de escada saliente.
    block(0,h/2,0,w,h,d,wall);
    block(w*.38,h*.52,-d*.04,w*.18,h*1.04,d*1.03,cream);
    for(let row=1,y=5.5;y<h-2.3;y+=5.2,row++){
      const balcony=(row+variant)%2===0,u=balcony?-w*.15:0;
      for(let j=-2;j<=1;j++)block(j*w*.19,y,front+.13,w*.13,2.95,.30,glass[(row+j+variant+6)%4]);
      if(balcony){
        block(u,y-1.72,front+1.08,w*.64,.44,2.48,cream);
        block(u,y-.69,front+2.22,w*.64,1.37,.24,0x89a09d);
        block(u,y+.06,front+2.22,w*.65,.16,.29,cream);
      }
      for(const sign of [-1,1])for(const z of [-d*.25,d*.15])block(sign*(w/2+.11),y,z,.25,2.78,d*.17,glass[(row+variant)%3]);
    }
    block(0,h+.22,0,w+.87,.64,d+.8,cream);
    block(w*.24,h+2.0,-d*.14,w*.37,3.6,d*.44,wall);
    drum(-w*.21,h+2.0,-d*.22,3.47,3.8,3.47,0x6b8382);
    drum(-w*.21,h+3.99,-d*.22,3.66,.29,3.66,shale);
  }
};
