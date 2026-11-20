'use strict';
const rules = require('../campus-rules.js');
const {distance} = rules;
const routes = [
  [-56,-85,-42,-85],[-14,-85,0,-85],[-110,-52,-78,-52],[-110,2,110,2],
  [60,-2,-60,-2],[23,-92,23,-20],[46,-74,62,-74],[-90,93,-42,93],
  [-43.5,80,-43.5,16],[5,22,30,34],[94,-92,94,-20],[80,92,108,92,2],[94,14,94,80],[110,-1,62,-1]
];
function makePots(){
  const pots=[];
  function add(x,y,z,r,ex,ez,cx,cz,paint=false){
    pots.push({pos:[x,y,z],r,ex,ez,cx,cz,paint,top:y,vel:[0,0,0],angle:0,spilled:false,moving:false,changed:false});
  }
  for(const z of [-92,-82,-50,-40,-30,-20])for(let i=0;i<4;i++)add(49+i*4.5,1.25,z,.75,10,2.4,55,z);
  for(const z of [-86,-72,-46])for(const dx of [-14,14])for(let i=0;i<4;i++)add(-94+dx-3.6+i*2.4,.27,z,.32,4.8,2,-94+dx,z,true);
  for(const [x,z] of [[-108,-86],[-80,-72],[-108,-46]])add(x,.65,z,.74,4.8,2,x,z,true);
  return pots;
}
class Campus {
  constructor(service){
    this.service=service;this.humans=routes.map(([x,z])=>({x,z,forward:true,yaw:0,stun:0}));
    this.pots=makePots();this.cleaner=rules.cleaner();this.heals=[];
    this.file=false;this.gate=false;this.buttons=[null,null];this.distraction=null;
  }
  live(room){return [...room.players.values()].filter(p=>this.service.active(p));}
  notice(p,message){this.service.send(p,{type:'notice',message});}
  act(p,m){
    const now=this.service.now(), room=p.room, teammates=this.live(room);
    if(m.type==='fall'){
      if(p.downUntil)return;
      if(!p.state)return this.service.send(p,{type:'respawn'});
      if(!teammates.some(q=>q!==p))return this.service.send(p,{type:'respawn'});
      p.downUntil=now+12000;return this.service.send(p,{type:'down',seconds:12});
    }
    if(!teammates.includes(p))return;
    const pos=p.state.pos;
    if(m.type==='rescue'){
      const ally=room.players.get(m.id);
      if(ally && ally!==p && ally.downUntil>now && distance(pos,ally.state.pos)<3.5){
        ally.downUntil=0;ally.state.health=.45;this.service.send(ally,{type:'revived'});this.notice(p,'Amigo de volta ao voo!');
      }
    }else if(m.type==='team-power'){
      const skin=p.state.skin,cd={carreta:20,cadeado:20,pintado:24}[skin];
      if(!cd || now<(p.powerAt||0))return;
      p.powerAt=now+cd*1000;
      if(skin==='pintado')this.heals.push({pos:[...pos],end:now+8000,owner:p.id});
      if(skin==='cadeado')for(const ally of teammates)if(ally!==p&&distance(pos,ally.state.pos)<9)this.service.send(ally,{type:'shield'});
      if(skin==='carreta'){
        this.humans.forEach((h,i)=>{if(distance([h.x,2.15+(routes[i][4]||0),h.z],pos)<22)h.stun=6;});
        if(distance(pos,rules.cleanerHead)<22&&this.cleaner.hp>0){this.cleaner.stun=2;this.cleaner.phase='cansada';}
      }
    }else if(m.type==='cleaner-bite' && now>=(p.cleanerBiteAt||0)){
      if(rules.biteCleaner(this.cleaner,pos,p.state.nv.tromba)){p.cleanerBiteAt=now+850;this.notice(p,this.cleaner.hp?'Picada certeira!':'Faxineira vencida!');}
    }else if(m.type==='campus-task'){
      if(teammates.length<2)return this.notice(p,'Esta missão precisa de dois jogadores ativos na sala.');
      const h=this.humans[0];
      if(m.action==='distract'&&!this.file&&distance(pos,[h.x,2.15,h.z])<4){
        this.distraction=p.id;this.until=now+8000;this.notice(p,'Mantenha o professor ocupado. Seu amigo pode pegar a pasta.');
      }
      if(m.action==='folder'&&!this.file&&distance(pos,rules.folder)<3&&teammates.some(q=>q!==p&&q.id===this.distraction&&distance(q.state.pos,[h.x,2.15,h.z])<5)&&now<this.until){
        this.file=true;for(const q of room.players.values())this.notice(q,'Pasta recuperada! Acionem os dois interruptores do pátio.');
      }
      const index=['left','right'].indexOf(m.action);
      if(index>=0&&this.file&&!this.gate&&distance(pos,rules.switches[index])<3){
        this.buttons[index]={id:p.id,until:now+5000};const other=this.buttons[1-index];
        if(other&&other.until>now&&teammates.some(q=>q!==p&&q.id===other.id&&distance(q.state.pos,rules.switches[1-index])<3)){
          this.gate=true;for(const q of room.players.values())this.notice(q,'Passagem de serviço aberta entre o pátio e o telhado!');
        }else this.notice(p,'Segure a posição. Seu amigo tem 5 s para ligar o outro interruptor.');
      }
    }else if(m.type==='push-pot'){
      const pot=this.pots[m.index];
      if(!Number.isInteger(m.index)||!pot||now<(p.pushAt||0)||distance(pos,pot.pos)>pot.r+1.5||p.state.speed<.5)return;
      if(!Array.isArray(m.dir)||m.dir.length!==3||!m.dir.every(Number.isFinite))return;
      const length=Math.hypot(...m.dir)||1,speed=Math.min(16,Math.max(5,p.state.speed*1.6));
      pot.vel=m.dir.map(n=>n/length*speed);pot.vel[1]+=2;pot.moving=true;pot.changed=true;pot.owner=p.id;p.pushAt=now+220;
    }
  }
  tick(room,dt){
    const now=this.service.now(), players=this.live(room);
    for(const p of room.players.values())if(p.downUntil && p.downUntil<=now){p.downUntil=0;this.service.send(p,{type:'respawn'});}
    this.heals=this.heals.filter(h=>h.end>now&&room.players.has(h.owner));
    if(!room.players.size)return;
    this.humans.forEach((h,i)=>{
      if(h.stun>0){h.stun-=dt;return;}
      if(i===0&&now<this.until&&players.some(p=>p.id===this.distraction&&distance(p.state.pos,[h.x,2.15,h.z])<5))return;
      if(i===0)this.distraction=null;
      const r=routes[i],dx=r[h.forward?2:0]-h.x,dz=r[h.forward?3:1]-h.z,d=Math.hypot(dx,dz);
      if(d<.12){h.forward=!h.forward;return;}
      const step=Math.min(d,dt*(1.6+i%4*.15));h.x+=dx/d*step;h.z+=dz/d*step;h.yaw=Math.atan2(dx,dz);
    });
    for(const pot of this.pots){
      if(!pot.moving)continue;
      const a=pot.pos,v=pot.vel;
      a[0]+=v[0]*dt;a[2]+=v[2]*dt;v[1]-=18*dt;a[1]+=v[1]*dt;
      const onTable=Math.abs(a[0]-pot.cx)<pot.ex&&Math.abs(a[2]-pot.cz)<pot.ez&&a[1]>pot.top-.35;
      const floor=onTable?pot.top:-3.5+pot.r;
      if(a[1]<=floor){
        a[1]=floor;v[1]=Math.abs(v[1])>1.5?-v[1]*.22:0;
        v[0]*=Math.exp(-3*dt);v[2]*=Math.exp(-3*dt);
        if(!onTable&&!pot.fell){pot.fell=true;pot.spilled=pot.paint?[a[0],a[2]]:false;if(!pot.paint){const owner=room.players.get(pot.owner);if(owner)this.service.send(owner,{type:'lab-fall'});}}
        if(Math.hypot(...v)<.14)pot.moving=false;
      }
      pot.angle+=Math.hypot(v[0],v[2])*dt*1.1;
    }
    const targets=players.filter(p=>rules.areaAt(p.state.pos[0])?.name==='Cozinha').map(p=>({p,pos:p.state.pos}));
    rules.stepCleaner(this.cleaner,dt,targets,({p},damage)=>{
      if(now<(p.wetUntil||0))return;p.wetUntil=now+950;this.service.send(p,{type:'cleaner-hit',damage});
    });
  }
  snapshot(){
    return {time:this.service.now()/1000,humans:this.humans.map(h=>[+h.x.toFixed(2),+h.z.toFixed(2),+h.yaw.toFixed(2),h.stun>0]),
      pots:this.pots.flatMap((p,i)=>p.changed?[[i,...p.pos.map(n=>+n.toFixed(2)),+p.angle.toFixed(2),p.spilled]]:[]),
      cleaner:this.cleaner,heals:this.heals.map(h=>({pos:h.pos,owner:h.owner})),file:this.file,gate:this.gate};
  }
}
module.exports=Campus;
