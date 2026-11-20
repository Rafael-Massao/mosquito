// Arquitetura fixa da ala oeste. Peças repetidas compartilham geometria e uma chamada
// de desenho por forma e setor. Somente os volumes acessíveis entram na colisão.
window.CampusScenery = class CampusScenery {
  constructor(game) {
    this.game=game;
    this.sectors=new Map();
    this.batches=new Map();
    this.standard=new THREE.MeshStandardMaterial({roughness:.83});
    this.dummy=new THREE.Object3D();
    const arch=new THREE.Shape();
    arch.moveTo(-.5,0);arch.absarc(0,0,.5,Math.PI,0,true);
    arch.lineTo(.5,.54);arch.lineTo(-.5,.54);arch.closePath();
    this.geo={
      block:new THREE.BoxGeometry(1,1,1), drum:new THREE.CylinderGeometry(.5,.5,1,18),
      leaf:new THREE.IcosahedronGeometry(.54,1), cone:new THREE.ConeGeometry(.5,1,10),
      arc:new THREE.ExtrudeGeometry(arch,{depth:1,bevelEnabled:false,curveSegments:12}).translate(0,0,-.5)
    };
    this.sectorCenters=[-115,200,250,300];
    this.sectorCenters.forEach(x=>{const group=new THREE.Group();game.cena.add(group);this.sectors.set(x,group);});
  }
  sector(x){return x<175?-115:x<231?200:x<278?250:300;}
  piece(shape,x,y,z,w,h,d,color,solid=false,ry=0,rz=0,rx=0){
    const obj=this.dummy;
    obj.position.set(x,y,z);obj.rotation.set(rx,ry,rz);obj.scale.set(w,h,d);obj.updateMatrix();
    const sector=this.sector(x), key=sector+'/'+shape;
    if(!this.batches.has(key))this.batches.set(key,{sector,shape,parts:[]});
    this.batches.get(key).parts.push([obj.matrix.clone(),color]);
    if(solid){
      const collider=new THREE.Mesh(this.geo[shape],this.standard);
      collider.matrixAutoUpdate=false;collider.matrix.copy(obj.matrix);collider.updateMatrixWorld(true);
      this.game.mundo.col.push({mesh:collider,box:new THREE.Box3().setFromObject(collider)});
    }
  }
  block(...args){this.piece('block',...args);}
  drum(...args){this.piece('drum',...args);}
  beam(a,b,width,depth,color){
    const start=new THREE.Vector3(...a), end=new THREE.Vector3(...b), delta=end.clone().sub(start);
    const mid=start.add(end).multiplyScalar(.5),rot=new THREE.Euler().setFromQuaternion(
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize()));
    this.block(mid.x,mid.y,mid.z,width,delta.length(),depth,color,false,rot.y,rot.z,rot.x);
  }
  finish(){
    for(const {sector,shape,parts} of this.batches.values()){
      const mesh=new THREE.InstancedMesh(this.geo[shape],this.standard,parts.length);
      parts.forEach(([matrix,tint],i)=>{mesh.setMatrixAt(i,matrix);mesh.setColorAt(i,new THREE.Color(tint));});
      this.sectors.get(sector).add(mesh);
    }
    this.batches.clear();this.update(this.game.jogador.pos.x);
  }
  update(x){
    for(const [center,group] of this.sectors)group.visible=center<0?x<32:x>=175&&Math.abs(x-center)<112;
    this.sky.visible=x>=175;
    if(this.sky.visible)this.sky.position.set(x,this.game.jogador.pos.y,this.game.jogador.pos.z);
  }
  skybox(){
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;
    const c=canvas.getContext('2d'),bg=c.createLinearGradient(0,0,0,512);
    [[0,'#22294c'],[.34,'#506088'],[.46,'#928a9e'],[.51,'#edbb9f'],[.59,'#9a959d'],[1,'#545d71']].forEach(([p,v])=>bg.addColorStop(p,v));
    c.fillStyle=bg;c.fillRect(0,0,1024,512);
    for(let i=1;i<=105;i++){const x=(i*431)%1024,y=(i*79+i*i)%218;c.fillStyle='rgba(255,245,218,'+(.16+i%5*.11)+')';c.fillRect(x,y,1+i%2,1);}
    c.fillStyle='#fff0ce';c.beginPath();c.ellipse(735,199,9,9,0,0,2*Math.PI);c.fill();
    this.sky=new THREE.Mesh(new THREE.SphereGeometry(1,48,24),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),side:THREE.BackSide,fog:false,depthWrite:false,toneMapped:false}));
    this.sky.scale.setScalar(Math.min(125,this.game.camera.far*.8));this.sky.renderOrder=-100;this.game.cena.add(this.sky);
  }
  sign(text,x,y,z,width,yaw=0,bg='#224c4b'){
    const canvas=document.createElement('canvas');canvas.width=640;canvas.height=108;
    const c=canvas.getContext('2d');c.fillStyle=bg;c.fillRect(0,0,640,108);c.strokeStyle='#f0cf88';c.lineWidth=3;c.strokeRect(9,9,622,90);
    c.fillStyle='#fff1d5';c.font='bold 55px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text,320,56,590);
    const mat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),toneMapped:false});
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,width*108/640),mat);
    mesh.position.set(x,y,z);mesh.rotation.y=yaw;this.sectors.get(this.sector(x)).add(mesh);return mesh;
  }
  floor(x,width,depth,type){
    const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');
    const palettes={patio:['#a98671','#d4b197','#dabc9e','#cfaa8e'],kitchen:['#839c93','#e4e4ca','#e0e1c9','#dce1c8'],roof:['#645d69','#9e8a90','#9c868c','#a08b8d']};
    const palette=palettes[type];ctx.fillStyle=palette[0];ctx.fillRect(0,0,256,256);
    const rows=type==='kitchen'?4:8,cols=type==='kitchen'?4:2;
    const w=256/cols,h=256/rows;
    for(let j=0;j<rows;j++)for(let i=-1;i<cols;i++){
      const l=i*w+(type==='kitchen'?0:j%2*w/2),t=j*h;
      ctx.fillStyle=palette[1+Math.abs(7*i+5*j)%3];ctx.fillRect(l+1,t+1,w-2,h-2);
      if(type==='kitchen'&&(i+j)%2===0){ctx.fillStyle='#659496';ctx.beginPath();ctx.moveTo(l+2,t+2);ctx.lineTo(l+12,t+2);ctx.lineTo(l+2,t+12);ctx.fill();}
    }
    const tex=new THREE.CanvasTexture(c);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(width/7,depth/7);tex.anisotropy=Math.min(4,this.game.render.capabilities.getMaxAnisotropy());
    const m=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),new THREE.MeshStandardMaterial({color:type==='kitchen'?0xafb8ad:type==='roof'?0xb9a69c:0xb7a28c,map:tex,roughness:.91}));
    m.rotation.x=-Math.PI/2;m.position.set(x,EscolaCampus.floorAt(x)+.013,0);this.sectors.get(this.sector(x)).add(m);
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
    this.sectors.get(this.sector(x)).add(mesh);
  }
  windowBay(x,y,z,w,h,glass,side=1){
    const f=0x475560;
    this.block(x,y,z,w+.22,h+.24,.23,f);
    this.block(x,y,z+side*.16,w,h,.10,glass);
    this.block(x,y-.06,z+side*.23,.10,h,.12,f);
    this.block(x,y+h*.17,z+side*.23,w,.10,.12,f);
    this.block(x,y-h*.5-.1,z+side*.16,w+.45,.16,.58,0xe6cea7);
  }
  tree(x,z,height,tone){
    const soil=-3.5,base=soil+.65;
    this.drum(x,soil+.26,z,5.1,.52,5.1,0xbc8068,true);
    this.drum(x,base-.10,z,4.78,.19,4.78,0x847960);
    this.drum(x,base+height*.34,z,.78,height*.68,.78,0x735548,true);
    for(let i=0;i<5;i++){
      const a=i*2.4,dx=Math.cos(a)*1.36,dz=Math.sin(a)*1.36;
      this.beam([x,base+height*.46,z],[x+dx,base+height*.78,z+dz],.29,.29,0x765849);
      this.piece('leaf',x+dx,base+height*.86+(i%2)*.61,z+dz,3.72,3.05,3.64,tone[i%tone.length],false,a);
    }
    this.piece('leaf',x-.3,base+height*1.06,z-.18,3.45,3.35,3.67,tone[1]);
  }
  bench(x,z){
    for(let i=0;i<4;i++)this.block(x,-1.96,z+i*.27,4.3,.19,.22,0xab7050,i===0);
    for(let i=0;i<2;i++)this.block(x,-1.45+i*.32,z+.98,4.3,.23,.13,0xca9163);
    for(const dx of [-1.55,1.55]){
      this.block(x+dx,-2.75,z+.45,.22,1.5,.78,0x465959);
      this.block(x+dx,-1.78,z+.99,.16,1.5,.14,0x465959);
    }
  }
  entry(x,y,z,yaw,label,gate=false){
    const at=(dx,dy,dz)=>[x+dx*Math.cos(yaw)+dz*Math.sin(yaw),y+dy,z-dx*Math.sin(yaw)+dz*Math.cos(yaw)];
    const piece=(dx,dy,dz,w,h,d,color)=>this.block(...at(dx,dy,dz),w,h,d,color,false,yaw);
    for(const dx of [-2.55,2.55]){
      piece(dx,2.7,0,.48,5.4,.65,0xe6c7a8);piece(dx,.32,.04,.72,.64,.85,0xb98069);
    }
    piece(0,5.55,0,5.65,.58,.86,0xc6866b);piece(0,6.1,0,6.05,.57,.99,0x804f49);
    this.sign(label,...at(0,5.65,.46),4.95,yaw);
    if(gate){
      const group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=yaw;this.game.cena.add(group);
      const shutter=new THREE.Mesh(new THREE.BoxGeometry(4.67,5.2,.2),new THREE.MeshStandardMaterial({color:0x466061}));
      shutter.position.y=2.6;group.add(shutter);
      const barMat=new THREE.MeshStandardMaterial({color:0x76928e});
      for(let i=0;i<7;i++){const bar=new THREE.Mesh(new THREE.BoxGeometry(4.66,.07,.28),barMat);bar.position.y=.42+i*.72;group.add(bar);}
      return group;
    }
    piece(0,2.61,0,4.6,5.22,.24,0x336c67);
    for(const dx of [-1.14,1.14]){
      piece(dx,3.65,.16,1.74,1.77,.12,0x9bc2ba);piece(dx,1.32,.16,1.74,1.86,.13,0x285851);
      piece(dx*.25,2.46,.28,.14,.54,.18,0xe6c780);
    }
  }
  gardenMural(){
    // Pintura aplicada no reboco, com folhas e uma mariposa em serigrafia.
    const canvas=document.createElement('canvas');canvas.width=640;canvas.height=240;
    const c=canvas.getContext('2d');c.fillStyle='#d4aa84';c.fillRect(0,0,640,240);
    const leaf=(x,y,rx,ry,angle,color)=>{
      c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,angle,0,Math.PI*2);c.fill();
    };
    for(let i=0;i<7;i++){
      const x=i*94;c.strokeStyle='#586d59';c.lineWidth=5;c.beginPath();c.moveTo(x+8,240);c.quadraticCurveTo(x-6,164,x+76,90-i%3*26);c.stroke();
      for(let j=0;j<5;j++){
        const px=x+10+j*12,py=216-j*24;
        leaf(px+(j%2?13:-9),py,23,8,j%2?-.57:.72,['#659077','#869957','#a77457'][i%3]);
      }
    }
    c.save();c.translate(353,87);c.rotate(-.19);
    for(const side of [-1,1]){
      c.save();c.scale(side,1);c.fillStyle='#3b5653';c.beginPath();c.moveTo(0,0);c.bezierCurveTo(22,-11,70,-64,90,-48);c.bezierCurveTo(86,-8,45,3,15,8);c.bezierCurveTo(57,-1,47,35,31,46);c.quadraticCurveTo(6,33,0,0);c.fill();
      leaf(45,-18,28,7,-.50,'#e4ad67');leaf(24,20,9,5,.68,'#cd815e');c.restore();
    }
    leaf(0,0,4,21,0,'#3b4b47');c.restore();
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(10.3,3.86),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas)}));
    mesh.rotation.y=Math.PI/2;mesh.position.set(182.31,-.42,7.54);this.sectors.get(200).add(mesh);
  }
  courtyard(){
    const stone=0xe6c8a6, brick=0xbe7e65, trim=0x93594e, mint=0x709381;
    this.block(200,-4.5,0,36,2,32,stone);this.floor(200,36,32,'patio');
    // Ala de salas com loggia: pilares e arcos têm profundidade, as janelas ficam ao fundo.
    this.block(200,2.3,-19.45,38,11.6,2.8,brick);
    this.block(200,8.19,-18,39,.5,5,trim);this.block(200,8.55,-18,39.4,.22,5.4,stone);
    for(let i=0;i<6;i++){
      const x=184.75+i*6.1;
      this.windowBay(x,5.7,-17.97,3.5,2.45, i%3===0?0xe9b578:0x91aaa7);
      this.piece('arc',x,-.48,-15.75,6.1,6.1,1,stone);
      this.block(x-3.05,-1.98,-15.75,.62,3.04,1,stone,true);
      this.block(x-3.05,-2.95,-15.75,.82,1.1,1.2,brick);
      this.block(x,2.98,-15.74,6.1,.55,1.1,stone);
    }
    this.block(200,3.4,-15.68,37,.31,1.35,trim);
    this.block(182,-.65,0,.55,5.7,32,brick,true);
    this.block(182,2.28,0,.83,.24,32.5,stone);
    for(const x of [187,209])this.tree(x,9,x===187?6.0:7.1,[0x547c61,0x799766,0x668c67]);
    this.tree(185.7,-8.7,5.4,[0x8a786e,0xbb8e98,0xac8390]);
    this.bench(191.5,8.55);this.bench(212.8,10.4);
    // Pergolado no jardim e duto acessível pelas duas bocas.
    for(const x of [194.2,203.3])for(const z of [6.8,12.3])this.block(x,-.02,z,.38,6.95,.38,0x875f4d,true);
    for(const z of [6.8,12.3])this.block(198.75,3.43,z,10.45,.46,.39,0x996c53);
    for(let i=0;i<11;i++)this.block(193.75+i,3.72,9.52,.36,.27,6.81,0xb48863);
    for(const z of [-3.2,3.2])this.block(200,-3.464,z,35.4,.03,.18,0x765c54);
    this.block(200,-2.85,15.8,36,1.3,.58,mint,true);this.block(200,-2.13,15.8,36.3,.17,.73,stone);
    for(const side of [-1,1])this.block(217.9,-2.8,side*9.8,.38,1.4,12.35,mint,true);
    // A fachada oeste esconde o fundo das salas anteriores e ancora a saída no prédio.
    this.block(180.2,1.45,0,3.05,9.9,32.6,0xc99478);
    this.block(180.1,6.55,0,3.64,.42,33.1,trim);
    for(const z of [-12,-5,2,9]){
      this.block(181.81,4.1,z,.19,2.45,4.67,0x5e6a6b);
      this.block(181.94,4.1,z,.09,2.17,4.38,0x91aba8);
      this.block(182.02,4.1,z,.08,2.2,.11,0x596a6a);
      this.block(182.07,2.83,z,.44,.19,4.84,stone);
    }
    // Maciços de folhagem quebram a linha do muro e emolduram a entrada do duto.
    for(const [cx,cz,n] of [[189.8,14,7],[211.5,-13.6,5],[207.3,14.15,6]]){
      this.block(cx,-3.14,cz,n*.92,.68,2.06,0xbb8870,true);
      this.block(cx,-2.78,cz,n*.91,.09,1.87,0x685e50);
      for(let i=0;i<n;i++){
        const px=cx+(i-(n-1)/2)*.83,pz=cz+Math.sin(i*1.8)*.34;
        this.piece('leaf',px,-2.42+.12*(i%3),pz,1.62,1.4,1.56,i%2?0x73986f:0x537d67,false,i);
        if(i%2===0)this.piece('leaf',px+.22,-1.88,pz+.14,.32,.33,.35,0xdba47c);
      }
    }
    for(const [x,z,w,d] of [[188,8.4,8,6],[210,8.4,8,6],[186.2,-9,7,5],[199,9,11,6],[200,-14.6,35,2.8]])
      this.shade(x,z,w,d,-3.5,.30);
    this.gardenMural();
    this.entry(182.40,-3.5,-3,Math.PI/2,'CORREDOR');
    this.courtyardGate=this.entry(200,-3.5,-15.03,0,'ATALHO • TELHADO',true);
  }
  gallery(){
    this.block(225,-4.2,0,14,1.4,7.35,0xcead91);
    this.floor(225,14,6.9,'patio');
    for(const z of [-3.63,3.63]){
      for(const x of [218.4,224.8,231.6]){
        this.block(x,-.13,z,.38,6.75,.38,0x416c68,true);
        this.block(x,-3.18,z,.65,.64,.66,0xc7aa8f);
      }
      this.block(225,3.28,z,14.65,.37,.42,0x335f59);
      this.block(225,-1.99,z,14.3,.14,.16,0xb19373);
    }
    for(let i=0;i<15;i++)this.block(218.3+i,3.58,0,.18,.22,8.15,0xb58a68);
    for(const sign of [-1,1]){
      this.block(225,3.95,sign*2.04,14.9,.2,4.28,0xbd8067,false,0,0,sign*.16);
      this.block(225,3.6,sign*4.11,15,.28,.22,0x795e58);
    }
    for(const sign of [-1,1]){
      this.block(225,-4.54,sign*10.1,14.35,1.28,12.8,0x93a17f);
      this.block(225,-3.91,sign*14.6,14.15,.16,1.1,0xba9a7a);
      for(let i=0;i<6;i++){
        const x=219.25+2.17*i,z=sign*(8.55+i%2*2.78);
        this.piece('leaf',x,-3.35,z,2.11,1.84,2.02,i%2?0x778f6b:0x5b856c,false,1.3*i);
      }
    }
    this.block(225,4.37,0,15,.18,.42,0xd1a183);
  }
  kitchen(){
    const tile=0xb2c8b7, enamel=0xe4dec1, teal=0x397975, metal=0x637575, edge=0xb0bab1, F=-3.5;
    this.block(250,-4.4,0,36,1.8,32,0xb8ab98);this.floor(250,36,32,'kitchen');
    for(const sign of [-1,1]){
      const z=sign*15.9,inside=z-sign*.3;
      this.block(250,1.7,z,36,10.4,.48,enamel,true);
      this.block(250,-1.6,inside,36,3.8,.18,tile);
      this.block(250,.32,inside-sign*.05,36,.23,.24,teal);
      for(let i=0;i<18;i++)this.block(233+i*2,-1.6,inside-sign*.10,.032,3.65,.02,0x839f95);
      for(const y of [-2.56,-1.59,-.63])this.block(250,y,inside-sign*.11,36,.035,.025,0x839f95);
      for(const x of [238,249,261])this.windowBay(x,3.76,inside-sign*.15,7.4,2.7,sign<0?0xbcd3cf:0xb5c6b7,-sign);
    }
    this.block(250,6.98,0,36.6,.58,32.8,0xe7dfc7,true);
    for(const x of [232,268]){
      for(const sign of [-1,1]){
        this.block(x,1.7,sign*9.97,.48,10.4,12,enamel,true);
        this.block(x,-1.53,sign*9.97,.55,3.91,12,tile);
        this.block(x,.46,sign*9.97,.58,.22,12,teal);
        this.block(x,-.2,sign*3.76,.76,6.6,.42,teal,true);
      }
      this.block(x,5.0,0,.53,3.96,7.8,enamel,true);
      this.block(x,3.12,0,.83,.33,7.95,teal);
    }
    // A face externa do refeitório fecha a vista da galeria, com janelas e beiral.
    for(const x of [231.64,268.36]){
      const side=x<250?-1:1;
      this.block(x,6.76,0,.82,.46,32.75,0xb67f67);
      for(const z of [-10,10]){
        this.block(x,2.31,z,.22,2.28,6.2,0x526e71);
        this.block(x+side*.15,2.31,z,.11,1.96,5.88,0x8fafaa);
        for(const dz of [-1.92,0,1.92])this.block(x+side*.23,2.31,z+dz,.09,2,.10,0x546e6e);
        this.block(x+side*.34,3.61,z,.91,.19,6.59,0xb98d6e);
      }
    }
    this.sign('COZINHA',231.70,4.28,0,6,-Math.PI/2);
    this.sign('PÁTIO',232.30,4.28,0,5,Math.PI/2);
    this.sign('TELHADO',267.70,4.28,0,6,-Math.PI/2);
    this.sign('COZINHA',268.30,4.28,0,6,Math.PI/2);
    for(const x of [238,249,260]){
      this.block(x,6.52,0,.35,.27,31,0xbcb5a3);
      for(const z of [-5.9,5.9]){
        this.block(x,5.82,z,.14,1.43,.13,metal);
        this.block(x,5.05,z,4.1,.21,.83,metal);
        this.block(x,4.91,z,3.87,.11,.65,0xffe4a0);
      }
    }
    // Linha quente: fornos, fogão, coifa e panelas.
    this.block(245,-2.12,-11.9,15.7,2.76,3.6,teal,true);
    this.block(245,-.63,-11.9,16.05,.24,3.88,edge,true);
    for(const x of [239.4,243.2,247,250.8]){
      this.block(x,-2.13,-10.06,3.33,1.96,.17,metal);
      this.block(x,-2.13,-9.94,2.76,1.21,.09,0x354e54);
      this.block(x,-1.25,-9.85,2.9,.12,.18,edge);
      for(const dx of [-1.18,-.64])this.drum(x+dx,-.44,-10.35,.24,.13,.24,0x454f4e);
      this.drum(x,-.43,-11.65,1.73,.19,1.73,0x425252);
    }
    this.block(245,3.5,-11.75,11,.51,4.25,metal);this.block(245,3.85,-11.8,9.9,.38,3.6,edge);
    for(const x of [241.4,248.7])this.block(x,5.23,-12,1.86,2.65,1.7,edge);
    for(const x of [241.5,246]){
      this.drum(x,-.05,-10.75,1.64,.83,1.55,edge);
      this.drum(x,.39,-10.75,1.70,.12,1.6,0x586d6d);
      for(const dx of [-.91,.91])this.block(x+dx,.13,-10.75,.37,.13,.28,0x354e54);
    }
    // Bancada de preparo e armários. Há espaço de voo entre os armários e a parede.
    this.block(252,-2.02,11.25,20.5,2.96,2.85,0x67958a,true);
    this.block(252,-.45,11.25,20.85,.20,3.1,enamel,true);
    for(let i=0;i<9;i++){
      const x=242.9+i*2.28;
      this.block(x,-2.01,9.79,2.09,2.31,.14,i%2?0x7fa396:0x82a998);
      this.block(x+.65,-1.29,9.67,.32,.10,.14,metal);
    }
    for(const x of [244.6,248.1]){
      this.block(x,-.31,11.05,2.7,.15,1.7,edge);this.block(x,-.22,11.06,2.16,.055,1.23,metal);
      this.beam([x,-.24,12.04],[x,.71,12.04],.12,.12,metal);this.block(x,.67,11.75,.12,.12,.63,metal);
    }
    for(const x of [254,258.5]){
      this.block(x,-1.4,12.32,3.05,4.2,1.02,0x597f78,true);
      this.block(x,-1.37,11.75,2.72,3.84,.12,0x8aa999);
    }
    for(const x of [236.5,263.1]){
      this.block(x,-.79,-12.25,3.15,5.42,3.0,metal,true);
      this.block(x,-.67,-10.68,2.87,5.06,.19,edge);
      this.block(x,-.82,-10.54,.08,4.78,.13,metal);this.block(x-.24,-.44,-10.42,.14,1.15,.15,0x465656);
    }
    this.block(259.6,1.65,-15.3,5.18,2.17,.17,0xa97c55);
    this.sign('PRATO DO DIA',259.6,1.7,-15.19,4.85,0,'#364b42');
    for(const [x,z,w,d] of [[246,-11.2,19,6],[252,11,23,5],[252,2,4.2,2.75],[263.5,6.85,4.2,2.9]])
      this.shade(x,z,w,d,F,.28);
    // Prateleira de louça e temperos junto à pia, com a via da faxineira livre.
    for(const y of [1.12,2.03]){
      this.block(248.5,y,15.16,9.6,.15,.95,0xb08a68);
      for(const x of [244.35,252.55])this.block(x,y-.25,15.38,.11,.49,.37,metal);
    }
    for(let i=0;i<9;i++){
      const x=244.6+i*.92,shade=[0xbf805b,0xd2af72,0x92a186][i%3];
      this.drum(x,1.55,15.04,.54,.70,.54,shade);this.drum(x,1.92,15.04,.56,.08,.56,metal);
      this.block(x,1.54,14.765,.35,.20,.027,enamel);
    }
    for(let i=0;i<4;i++)for(let j=0;j<4;j++)
      this.drum(245.1+i*2.12,2.17+j*.085,15.03,1.32,.07,1.12,i%2?0xd4c9ad:0x8ea79a);
    this.block(245.7,2.95,-10.12,6.9,.12,.16,metal);
    for(let i=0;i<4;i++){
      const x=243.1+i*1.55;
      this.block(x,2.48,-10.12,.085,.91,.10,metal);
      this.piece('leaf',x,1.94,-10.12,.48,.59,.14,i%2?0xa5886c:edge);
    }
    // Carro de limpeza estacionado junto a uma coluna, fora da arena de combate.
    for(const x of [262.6,264.6])for(const z of [6.3,7.5])this.drum(x,F+.27,z,.42,.47,.42,0x394c50);
    this.block(263.6,-2.86,6.9,2.75,.24,1.73,metal,true);
    this.drum(263.55,-2.13,6.9,1.44,1.27,1.35,0xd6a95e,true);
    this.beam([264.1,-2.52,7],[264.87,1.23,7.3],.13,.13,0xab845c);
    this.block(264.85,1.23,7.29,.44,.19,.33,teal);
  }
  stairs(){
    for(let i=0;i<14;i++){
      const x=268.5+i,top=EscolaCampus.floorAt(x);
      this.block(x,(-5+top)/2,0,1,5+top,7.35,0xbcaa9e);
      this.block(x-.41,top+.014,0,.15,.026,7.28,0xe3c28b);
      if(i%3===0)for(const sign of [-1,1])this.block(x,top+.9,sign*3.58,.13,1.82,.14,0x617b7a);
    }
    for(const sign of [-1,1])this.beam([268,-1.49,sign*3.58],[282,2.99,sign*3.58],.15,.17,0x476968);
  }
  roof(){
    const f=EscolaCampus.floorAt(300),brick=0xb07c71,cap=0xd5af95,steel=0x546777;
    this.block(300,f-7.1,0,36,14.2,32,brick);this.floor(300,36,32,'roof');
    for(const z of [-16,16]){
      this.block(300,f+.72,z,36,1.44,.52,brick,true);this.block(300,f+1.49,z,36.5,.17,.75,cap);
      for(let i=0;i<10;i++)this.windowBay(284+i*3.55,f-3.7,z+Math.sign(z)*.1,2.15,2.68,0xa7b8b9,Math.sign(z));
    }
    for(const side of [-1,1]){
      this.block(282,f+.68,side*10,.43,1.36,12,brick,true);
      this.block(282,f+1.41,side*10,.63,.15,12,cap);
    }
    this.block(318,f+.68,0,.43,1.36,32,brick,true);
    // Torre de água sobre cavaletes e contraventamento.
    for(const dx of [-1.85,1.85])for(const dz of [-1.85,1.85])
      this.block(311+dx,f+1.85,-9+dz,.32,3.7,.32,steel,true);
    for(const dz of [-1.85,1.85])for(const d of [-1,1])
      this.beam([311-d*1.85,f+.25,-9+dz],[311+d*1.85,f+3.6,-9+dz],.15,.15,steel);
    this.block(311,f+3.73,-9,5.25,.32,5.25,steel,true);
    this.drum(311,f+5.75,-9,5.22,3.86,5.22,0x6b928e,true);
    for(const y of [4.08,5.08,6.38,7.59])this.drum(311,f+y,-9,5.35,.13,5.35,0x3f6869);
    this.piece('cone',311,f+8.08,-9,5.75,.97,5.75,0x456a6c);
    for(const dx of [-.51,.51])this.block(311+dx,f+3.82,-6.27,.1,7.55,.1,steel);
    for(let i=0;i<12;i++)this.block(311,f+.35+i*.62,-6.27,1.05,.105,.12,steel);
    // Claraboias de duas águas.
    for(const x of [286.65,294.0]){
      this.block(x,f+.36,8.4,5.2,.72,4.5,steel,true);
      for(const sign of [-1,1]){
        this.block(x,f+1.03,8.4+sign*1.05,5.05,.16,2.34,0x86adae,false,0,0,sign*.35);
        for(const dx of [-2.42,-.8,.8,2.42])this.block(x+dx,f+1.16,8.4+sign*1.05,.09,.12,2.4,steel,false,0,0,sign*.35);
      }
    }
    for(const dx of [-1.3,1.3]){
      this.block(309+dx,f+1.72,4,1.27,3.44,3.85,brick,true);
      this.block(309+dx,f+3.51,4,1.52,.22,4.12,cap);
      this.block(309+dx,f+3.624,4,1.05,.045,3.58,0x66585a);
      for(let i=0;i<5;i++)this.block(309+dx,f+.46+i*.63,5.946,1.23,.052,.05,0x8d6763);
    }
    for(const [x,z,w,d] of [[310.8,-8.7,7.2,6.4],[309,4,5.7,5.1],[300,3,2.4,1.9],[286.7,8.35,6.6,5.7],[294,8.35,6.6,5.7]])
      this.shade(x,z,w,d,f,.30);
    this.roofGate=this.entry(300,f,-15.17,0,'ATALHO • PÁTIO',true);
    this.block(300,f+2.85,-17.54,7.05,5.69,4.4,brick);
    this.block(300,f+5.89,-17.6,7.63,.41,4.91,cap);
    for(const x of [295.98,296.39])this.drum(x,f+1.51,-15.29,.19,3.02,.19,steel);
    this.block(300,f+5.89,-15.77,6.83,.41,1.71,cap);
    for(const x of [286.6,289.2])this.drum(x,f+1.48,-8,1.49,2.96,1.49,steel,true);
    for(const x of [286.6,289.2])this.piece('cone',x,f+3.19,-8,2.02,.57,2.02,0x72818a);
    // Calha de ventilação segue a borda leste deixando a fresta livre nos dois lados.
    for(const dx of [-1.12,1.12])this.block(315+dx,f+.63,7.2,.26,1.25,1.26,steel,true);
    this.block(315,f+1.68,7.15,3.45,.9,1.52,0x829394,true);
    this.block(316.15,f+1.69,10.06,1.18,.89,4.8,0x829394,true);
    for(let i=0;i<4;i++)this.block(316.15,f+2.16,8.22+i*1.24,1.29,.11,.12,steel);
    this.drum(300,f+.32,3,1.45,.64,1.45,steel,true);
    this.drum(300,f+2.87,3,.18,5.4,.18,steel,true);
  }
  surroundings(){
    // Quarteirão visto acima das platibandas. Não participa da física nem das missões.
    this.block(253,-12.1,0,205,1,112,0x535d67);
    for(let i=0;i<8;i++){
      const x=342+(i%3)*5.2,z=(i-3.5)*11,h=13+(7*i)%12;
      this.block(x,-12+h/2,z,8.0,h,8.7,[0x9b8e97,0x8d8e9c,0xaaa09c][i%3]);
      this.block(x,-11.8+h,z,8.35,.4,8.98,0x777780);
      for(let row=0;row<4;row++)for(let j=0;j<3;j++)
        this.block(x-4.08,-14+h-row*2.4,z+(j-1)*2.3,.12,1.17,1.28,(i+row+j)%5===0?0xd2b399:0x737d8d);
    }
    for(const side of [-1,1])for(let i=0;i<12;i++){
      const x=176+i*13.5+(side>0?4:0),z=side*(35+(i*7)%17),w=8+i%4,h=7+(i*11+3)%17;
      const wall=[0x8f8790,0xa1938a,0x798695,0x918797][i%4];
      this.block(x,-12+h/2,z,w,h,8,wall);
      this.block(x,-11.85+h,z,w+.43,.41,8.4,0x717782);
      for(let row=0;row<Math.min(4,Math.floor(h/3));row++)for(let j=0;j<3;j++)
        this.block(x+(j-1)*w*.29,-13+h-row*2.5,z-side*4.09,1.37,1.27,.13,(i+row+j)%4===0?0xd0ad89:0x657589);
    }
  }
};
