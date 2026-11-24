/* Cooperativo: o servidor controla a sala e o chefe; o progresso pessoal permanece local. */
(() => {
 'use strict';
 class MosquitoOnline {
  constructor(game,{THREE,GameState,construirMosquito,CFG}){
   Object.assign(this,{g:game,THREE,GameState,build:construirMosquito,CFG});
   this.active=false;this.remotes=new Map();this.members=[];this.elapsed=0;this.sendClock=0;this.lastSnapshot=0;this.boss=null;this.ws=null;
   this.names=document.createElement('div');this.names.className='mp-names';document.body.appendChild(this.names);
   this.createUI();
   document.addEventListener('visibilitychange',()=>{if(this.active)this.sendState();});
   window.addEventListener('pagehide',()=>this.ws?.close());
  }
  read(key,fallback=''){try{return localStorage.getItem('mosquito-online-'+key)||fallback;}catch{return fallback;}}
  save(key,value){try{localStorage.setItem('mosquito-online-'+key,value);}catch{}}
  createUI(){
   const box=document.createElement('details');box.className='mp-menu';box.id='mp-menu';
   box.innerHTML=`<summary>🌐 Multijogador cooperativo</summary><p>Até 4 mosquitos na mesma escola. Enfrentem o chefe juntos; cada um mantém suas skins e seu progresso.</p>
   <div id="mp-setup"><div class="mp-fields"><label>Seu nome<input id="mp-name" maxlength="20" autocomplete="nickname" placeholder="Mosquito"></label><label>Código da sala<input id="mp-code" maxlength="6" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="ABC234"></label></div>
   <div class="mp-actions"><button id="mp-create" class="mp-primary" type="button">Criar sala</button><button id="mp-join" type="button">Entrar com código</button></div>
   <details><summary>Endereço do servidor</summary><label>Servidor online<input id="mp-server" type="url" placeholder="https://seu-jogo.onrender.com" autocomplete="off"></label><small>Se o jogo estiver hospedado com o servidor, deixe em branco. Em outro site, informe o endereço fornecido por quem hospeda a sala.</small></details></div>
   <div id="mp-room" hidden><p>Sala <strong class="mp-code" id="mp-room-code"></strong> · <span id="mp-count"></span></p><ul id="mp-members"></ul><div class="mp-actions"><button id="mp-play" class="mp-primary" type="button">Jogar na sala</button><button id="mp-copy" type="button">Copiar código</button><button id="mp-leave" type="button">Sair da sala</button></div><small>A escola online continua enquanto você abre menus. Seu mosquito fica em pausa e não recebe ataques do chefe. Na Sala 1, um amigo distrai a professora e outro pega a pasta. Levem-na aos dois relés do pátio. Use Pegar perto de um amigo caído para reanimá-lo.</small></div>
   <p id="mp-status" class="mp-status" role="status" aria-live="polite">Solo disponível sem conexão.</p>`;
   document.querySelector('#hx-painel-inicio').appendChild(box);this.box=box;
   this.el=id=>box.querySelector('#mp-'+id);
   this.el('name').value=this.read('name','Mosquito');this.el('server').value=this.read('server');
   const code=new URLSearchParams(location.search).get('sala');if(/^[A-Z2-9]{6}$/i.test(code||'')){this.el('code').value=code.toUpperCase();box.open=true;}
   this.el('create').onclick=()=>this.connect('create');this.el('join').onclick=()=>this.connect('join');
   this.el('play').onclick=()=>{this.g.iniciar();};
   this.el('leave').onclick=()=>{this.disconnect();this.status('Você saiu da sala. Modo solo disponível.');};
   this.el('copy').onclick=async()=>{try{await navigator.clipboard.writeText(this.room);this.status('Código copiado! Envie para seus amigos.');}catch{this.status('Compartilhe este código: '+this.room);}};
  }
  status(text){this.el('status').textContent=text;}
  endpoint(){
   const value=this.el('server').value.trim(),base=value||location.origin;
   if(base==='null')throw Error('Informe o endereço do servidor para jogar online.');
   const url=new URL(base);if(!['http:','https:','ws:','wss:'].includes(url.protocol)||url.username||url.password)throw Error('Use um endereço http(s) ou ws(s) válido.');
   url.protocol=['https:','wss:'].includes(url.protocol)?'wss:':'ws:';
   if(location.protocol==='https:'&&url.protocol!=='wss:')throw Error('Neste site, use um servidor com HTTPS.');
   url.pathname='/online';url.search='';url.hash='';return url.href;
  }
  connect(type){
   if(this.ws)return;
   const code=this.el('code').value.trim().toUpperCase();
   if(type==='join'&&!/^[A-Z2-9]{6}$/.test(code))return this.status('Digite o código de 6 caracteres da sala.');
   let endpoint;try{endpoint=this.endpoint();}catch(e){return this.status(e.message);}
   this.save('name',this.el('name').value);this.save('server',this.el('server').value.trim());
   this.el('create').disabled=this.el('join').disabled=true;this.status('Conectando ao servidor…');
   const ws=new WebSocket(endpoint);this.ws=ws;
   this.timeout=setTimeout(()=>{if(this.ws===ws&&!this.active){this.disconnect();this.status('O servidor não respondeu. Confira o endereço ou tente novamente após ele iniciar.');}},20000);
   ws.onopen=()=>{if(this.ws===ws)this.send({type,protocol:window.EscolaCampus.protocol,name:this.el('name').value,code});};
   ws.onmessage=e=>{if(this.ws!==ws)return;let m;try{m=JSON.parse(e.data);}catch{return;}this.receive(m);};
   ws.onerror=()=>{if(this.ws===ws)this.status('Não foi possível conectar. Confira se o servidor online está hospedado e ativo.');};
   ws.onclose=()=>{if(this.ws!==ws)return;this.disconnect();this.status('Conexão encerrada. Seu progresso está salvo; você pode entrar novamente pelo código.');};
  }
  send(m){if(this.ws?.readyState===WebSocket.OPEN&&this.ws.bufferedAmount<64000)this.ws.send(JSON.stringify(m));}
  sendState(){
   if(!this.active)return;
   const g=this.g,S=g.estado,j=g.jogador;
   this.send({type:'state',state:{pos:j.pos.toArray(),rot:j.obj.quaternion.toArray(),nv:S.nv,skin:S.skin,mantis:S.mantis,pixelCor:S.pixelCor,auraTusk:S.auraTusk,active:g.jogando&&!g.menuAberto&&!document.hidden,speed:j.vel.length(),health:j.vida/S.vidaMax,door:S.portaSala3Aberta}});
  }
  receive(m){
   if(m.type==='welcome'){
    if(m.protocol!==window.EscolaCampus.protocol){this.disconnect();return this.status('Atualize o jogo para usar este servidor.');}
    clearTimeout(this.timeout);this.g.campus?.resetProps();this.active=true;this.id=m.id;this.room=m.code;this.lastSnapshot=performance.now();this.resetBoss();this.sendState();this.renderMembers();this.status('Sala pronta. Compartilhe o código e clique em Jogar na sala.');
   }else if(m.type==='error'){const text=m.message;if(!this.active)this.disconnect();this.status(text);}
   else if(m.type==='snapshot'&&this.active){
    this.lastSnapshot=performance.now();this.boss=m.boss;this.campus=m.campus;
    const key=m.players.map(p=>p.id+p.name+!!p.state?.active).join('|');this.members=m.players;
    if(key!==this.memberKey){this.memberKey=key;this.renderMembers();}
    const present=new Set(m.players.map(p=>p.id));for(const [id,r]of this.remotes)if(!present.has(id)){this.disposeRemote(r);this.remotes.delete(id);}
    for(const p of m.players)if(p.id!==this.id&&p.state)this.remote(p);
    if(m.door&&!this.g.estado.portaSala3Aberta){this.g.estado.portaSala3Aberta=true;this.g.estado.salvar();this.g.mundo.abrirSala3();this.g.ui.toast('🔓 Um amigo abriu a Sala 3 para o grupo!');}
   }else if(m.type==='down' && this.active){this.fallen=true;this.rescueEnd=performance.now()+m.seconds*1000;this.g.ui.toast('Você caiu! Um amigo pode reanimar você com Pegar.');}
   else if(m.type==='respawn' && this.active && this.fallen){this.fallen=false;this.g.reaparecerAposQueda();}
   else if(m.type==='revived' && this.active && this.fallen){this.fallen=false;this.g.jogador.vida=this.g.estado.vidaMax*.45;this.g.jogador.invul=3;this.g.ui.toast('Seu amigo te reanimou!');}
   else if(m.type==='shield' && this.active){this.g.jogador.escudo=Math.max(this.g.jogador.escudo,5);this.g.ui.toast('Cadeado aliado • escudo por 5 s');}
   else if(m.type==='lab-fall' && this.active)this.g.ganhar('pote_caido');
   else if(m.type==='cleaner-win' && this.active)this.g.desbloquear('faxineira');
   else if(m.type==='cleaner-hit' && this.active && this.g.jogando && !this.g.menuAberto)this.g.campus.hurt(m.damage);
   else if(m.type==='notice')this.g.ui.toast(m.message);
   else if(m.type==='hit'&&this.active&&this.g.jogando&&!this.g.menuAberto&&!document.hidden){
    this.g.mundo.chefe.ferir(this.g,m.damage,new this.THREE.Vector3(...m.origin));
   }else if(m.type==='bite-ok'&&this.active){
    const g=this.g;g.estado.picadas++;g.audio.picada();g.mundo.emitir(g.mundo.chefe.alvo,0xffb34d,18,4);g.ui.toast('🩸 Chefe atingido em equipe!');if(g.estado.picadas>=10)g.desbloquear('vampiro');g.estado.salvar();
   }else if(m.type==='boss-win'&&this.active){this.g.ganhar('boss_raquete');this.g.desbloquear('raquete');this.g.ui.toast('🏆 Vitória da equipe! Chefe da raquete derrotado.');}
  }
  renderMembers(){
   this.el('setup').hidden=this.active;this.el('room').hidden=!this.active;
   this.el('create').disabled=this.el('join').disabled=!!this.ws&&!this.active;
   this.el('room-code').textContent=this.room||'';this.el('count').textContent=this.members.length+'/4 jogadores';
   const ul=this.el('members');ul.replaceChildren();for(const p of this.members){const li=document.createElement('li');li.textContent=p.name+(p.id===this.id?' (você)':'')+(p.state?.active?' · jogando':' · no menu');ul.appendChild(li);}
  }
  remote(p){
   const T=this.THREE,s=p.state,key=JSON.stringify([s.skin,s.nv,s.mantis,s.pixelCor,s.auraTusk]);let r=this.remotes.get(p.id);
   if(!r||r.key!==key){
    if(r)this.disposeRemote(r);
    const state=new this.GameState({nv:s.nv,skins:s.skin?[s.skin]:[],skin:s.skin,mantis:s.mantis,pixelCor:s.pixelCor,auraTusk:s.auraTusk}),model=this.build(state);model.aplicar();model.mosquito.scale.setScalar(model.escala*this.CFG.ESCALA_JOGADOR);
    const label=document.createElement('span');label.className='mp-name';this.names.appendChild(label);this.g.cena.add(model.mosquito);
    r={key,model,label,pos:new T.Vector3(...s.pos),rot:new T.Quaternion(...s.rot),project:new T.Vector3()};model.mosquito.position.copy(r.pos);model.mosquito.quaternion.copy(r.rot);this.remotes.set(p.id,r);
   }
   r.pos.fromArray(s.pos);r.rot.fromArray(s.rot);r.active=s.active;r.label.textContent=p.name+(p.down?' · SOS':s.active?'':' · pausa');
  }
  disposeRemote(r){this.g.cena.remove(r.model.mosquito);r.label.remove();r.model.mosquito.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of [].concat(o.material))m.dispose();});}
  resetBoss(){const b=this.g.mundo.chefe;b.derrotado=false;b.reiniciar();this.lastBossPhase='espera';this.fall=false;}
  disconnect(){
   const ws=this.ws;this.ws=null;clearTimeout(this.timeout);if(ws)ws.close();const was=this.active;this.active=false;this.boss=null;this.members=[];this.memberKey='';this.room='';
   for(const r of this.remotes.values())this.disposeRemote(r);this.remotes.clear();if(was){this.resetBoss();this.g.campus?.resetProps();if(this.fallen)this.g.reaparecerAposQueda();}this.fallen=false;this.campus=null;this.renderMembers();
  }
  bite(){
   const b=this.g.mundo.chefe;if(!this.active||!this.boss||this.boss.life<=0||this.boss.phase==='espera'||b.alvo.distanceTo(this.g.jogador.pos)>Math.min(3.2,this.g.estado.raioColeta+.9))return false;
   this.sendState();this.send({type:'bite'});return true;
  }
  bossVisual(dt){
   const s=this.boss;if(!s)return;const g=this.g,b=g.mundo.chefe,T=this.THREE;
   if(s.phase==='espera'&&this.lastBossPhase!=='espera')this.resetBoss();
   if(s.life===0){
    if(!this.fall){
     b.g.position.fromArray(s.pos);b.g.rotation.set(0,s.yaw,0);const dir=b.g.position.x<139?1:-1;
     const fim=new T.Quaternion().setFromAxisAngle(b.eixoY,dir>0?-Math.PI/2:Math.PI/2).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),-Math.PI/2));
     b.queda={pos:b.g.position.clone(),rot:b.g.quaternion.clone(),braco:b.braco.quaternion.clone(),fim,dir,impacto:false};b.tempoDerrota=s.phase==='derrotado'?2.8:Math.max(0,2.8-s.timer);b.solta=null;b.limparDescargas();b.derrotado=true;b.ativo=false;b.fase='caindo';this.fall=true;
    }
    b.atualizarQueda(dt);b.vida=0;b.atualizarHUD();b.visivel(g);this.lastBossPhase=s.phase;return;
   }
   b.derrotado=false;b.ativo=s.phase!=='espera';b.fase=s.phase;b.vida=s.life;b.vidaMax=s.max;b.furia=s.furia;b.golpeCombo=s.combo;b.comboTotal=s.furia?3:2;b.tipoGolpe=s.kind;b.timer=s.timer;
   const target=new T.Vector3(...s.pos);b.g.position.lerp(target,1-Math.exp(-18*dt));b.g.rotation.set(0,s.yaw,0);b.mira.fromArray(s.aim);
   b.aviso.visible=['preparar','golpear'].includes(s.phase);b.aviso.position.copy(b.mira);b.aviso.scale.setScalar(s.radius/1.65);b.aviso.material.color.setHex(s.phase==='golpear'?0xff335b:0xffc45b);b.aviso.rotation.y+=dt*4;
   if(s.phase==='preparar')b.apontar(-.7);else if(s.phase==='golpear')b.apontar(-.7+1.4*Math.max(0,1-s.timer/.42));else b.braco.rotation.set(.2,0,s.phase==='cansado'?-2.3:-.4);
   b.pernas.forEach((l,i)=>{l.rotation.x=s.phase==='perseguir'?Math.sin(this.elapsed*9+i*Math.PI)*.35:0;l.userData.joelho.rotation.x=Math.max(0,-l.rotation.x);});
   b.faísca.visible=['preparar','golpear','furia'].includes(s.phase);b.metalRaquete.emissive.setHex(b.faísca.visible?0x174b65:0);
   b.g.updateMatrixWorld(true);b.cab.getWorldPosition(b.alvo);b.trilha.setAttribute('aria-valuemax',String(s.max));b.atualizarHUD();b.visivel(g);
   if(s.kind==='descarga'&&s.phase==='golpear'&&this.lastAttack!==s.attack){g.mundo.emitir(b.mira,0x80dfff,18,3);this.lastAttack=s.attack;}
   this.lastBossPhase=s.phase;
  }
  tick(dt){
   if(!this.active)return;this.elapsed+=dt;this.sendClock+=dt;
   if(performance.now()-this.lastSnapshot>10000){this.disconnect();this.status('O servidor parou de responder. Seu progresso está salvo.');return;}
   if(this.sendClock>=.1){this.sendClock=0;this.sendState();}
   const T=this.THREE,k=1-Math.exp(-14*dt);
   for(const r of this.remotes.values()){
    const m=r.model,o=m.mosquito;if(o.position.distanceTo(r.pos)>12)o.position.copy(r.pos);else o.position.lerp(r.pos,k);o.quaternion.slerp(r.rot,k);
    const beat=Math.sin(this.elapsed*40)*.55;m.asas[0].rotation.z=beat;m.asas[1].rotation.z=-beat;m.tick(this.elapsed,dt);m.luzSkin.intensity=Math.min(m.luzSkin.intensity,.1);
    r.project.copy(o.position).add(new T.Vector3(0,.5,0)).project(this.g.camera);
    const shown=this.g.jogando&&!this.g.menuAberto&&r.project.z>-1&&r.project.z<1&&Math.abs(r.project.x)<1.1&&Math.abs(r.project.y)<1.1&&o.position.distanceTo(this.g.jogador.pos)<40&&window.EscolaCampus.sameLevel(r.pos.toArray(),this.g.jogador.pos.toArray());
    r.label.hidden=!shown;if(shown){r.label.style.left=((r.project.x+1)*innerWidth/2)+'px';r.label.style.top=((-r.project.y+1)*innerHeight/2)+'px';}
   }
   this.bossVisual(dt);
  }
 }
 window.MosquitoOnline=MosquitoOnline;
})();
