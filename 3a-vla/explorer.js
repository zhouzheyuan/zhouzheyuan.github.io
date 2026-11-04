/* Figure 2: an interactive conceptual illustration, never model telemetry. */
(()=>{
 const root=document.querySelector('#mechanism-explorer'),canvas=document.querySelector('#flow-canvas');
 if(!root||!canvas)return;
 const ctx=canvas.getContext('2d'),motion=document.querySelector('#flow-motion');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const states=['inputs','ia','esa','alignment','action'];
 const copy={
  inputs:['INPUTS','One instruction. The whole scene.','The original image and “Shoot the nearby enemy.” enter one shared model. Keywords and semantic regions are outputs, not inputs.','ia'],
  ia:['IA / INTENTION','A goal becomes a compact intention.','The shared representation learns task-relevant concepts such as enemy and wall, supervised by offline intention targets.','ia'],
  esa:['ESA / ENVIRONMENT','Pixels become useful scene structure.','Person and cover are part of a compact semantic target. The highlighted regions illustrate the abstraction; they are not measured model predictions.','esa'],
  alignment:['AAR / ALIGNMENT','Bring intention and environment together.','Enemy corresponds to person; wall corresponds to cover. AAR uses the relation between their hidden representations to reweight action-imitation loss during training.','weighting'],
  action:['ACTION / INFERENCE','Use the learned policy to act.','At inference, the instruction and image predict actions directly. IA and ESA are auxiliary training outputs and are omitted.','combined']
 };
 const images={};let ready=false,visible=false,paused=reduced.matches,mode=reduced.matches?'alignment':'inputs',manualUntil=0,start=performance.now(),raf=0,hover=null,paths=[],layout,started=false,lastDraw=0;
 const colors={ia:'#D1811C',esa:'#197CD1',alignment:'#6E32F0',action:'#D95235',inputs:'#617D8D'};
 const clip=document.createElement('video');clip.muted=true;clip.playsInline=true;clip.preload='none';
 clip.addEventListener('loadedmetadata',()=>{clip.playbackRate=2;clip.defaultPlaybackRate=2;clip.currentTime=5.2;if(mode==='action'&&visible&&!paused)clip.play().catch(()=>{});});
 clip.addEventListener('ended',()=>{clip.currentTime=5.2;if(mode==='action'&&visible&&!paused)clip.play().catch(()=>{});});
 function activate(next,manual=false){
  if(!states.includes(next))return;
  if(manual)manualUntil=performance.now()+8500;
  mode=next;root.dataset.state=next;
  root.querySelectorAll('[data-flow]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.flow===next)));
  const c=copy[next];document.querySelector('#flow-phase').textContent=c[0];document.querySelector('#flow-title').textContent=c[1];document.querySelector('#flow-description').textContent=c[2];document.querySelector('#flow-evidence').href='#ablation-'+c[3];
  if(next==='action'&&visible&&!paused){if(!clip.src)clip.src='assets/explorer-v21/combat.mp4';else clip.play().catch(()=>{});}else clip.pause();
  draw(performance.now());
 }
 function geometry(){
  const mobile=root.clientWidth<650;canvas.width=mobile?700:1400;canvas.height=mobile?1090:760;
  const brain=mobile?[100,350,500,375]:[470,185,500,375];
  const bp=(x,y)=>[brain[0]+x*brain[2]/1448,brain[1]+y*brain[2]/1448];
  layout={mobile,brain,bp,image:mobile?[30,180,300,169]:[35,277,360,202],instruction:mobile?[30,105,640,57]:[35,171,360,64],ia:mobile?[370,205]:[1050,190],esa:mobile?[370,795,300,169]:[1050,355,310,174],action:mobile?[35,905]:[1050,606]};
  layout.vision=bp(250,560);layout.text=bp(725,670);layout.shared=bp(685,540);layout.workspace=bp(1092,470);layout.motor=bp(810,200);
  for(const [name,point] of Object.entries({vision:layout.vision,workspace:layout.workspace,motor:layout.motor})){
   const b=root.querySelector(`[data-region="${name}"]`);b.style.left=point[0]/canvas.width*100+'%';b.style.top=point[1]/canvas.height*100+'%';
  }
 }
 function text(s,x,y,size=20,color='#152331',bold=false){ctx.fillStyle=color;ctx.font=`${bold?'600':'400'} ${size}px ${bold?'Oxanium':'DM Sans'}, sans-serif`;ctx.fillText(s,x,y);}
 function box(x,y,w,h,fill='#FFFFFF',stroke='#DFE4E8',radius=10){ctx.beginPath();ctx.roundRect(x,y,w,h,radius);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
 function curve(a,b,c,d,name,color,active,now){
  const points=[];for(let i=0;i<=90;i++){const t=i/90,u=1-t;points.push([u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]]);}
  paths.push({name,points});ctx.beginPath();ctx.moveTo(...a);ctx.bezierCurveTo(...b,...c,...d);ctx.strokeStyle=color;ctx.globalAlpha=active?.42:.13;ctx.lineWidth=active?2:1;ctx.stroke();ctx.globalAlpha=1;
  if(!active&&!hover)return;
  let q=(now/1900)%1;
  if(hover){let min=65,closest=-1;points.forEach((p,i)=>{const dist=Math.hypot(p[0]-hover[0],p[1]-hover[1]);if(dist<min){min=dist;closest=i;}});if(closest>=0)q=closest/90;else if(!active)return;}
  if(paused&&!hover)return;
  for(let j=14;j>=0;j--){const i=Math.round(((q-j*.005+1)%1)*90),p=points[i];ctx.beginPath();ctx.arc(...p,j<2?4:2.5,0,Math.PI*2);ctx.fillStyle=color;ctx.globalAlpha=(1-j/15)*.95;ctx.shadowColor=color;ctx.shadowBlur=15;ctx.fill();}
  ctx.shadowBlur=0;ctx.globalAlpha=1;
 }
 const glowCanvas=document.createElement('canvas'),glow=glowCanvas.getContext('2d'),maskCanvas=document.createElement('canvas'),mask=maskCanvas.getContext('2d');
 function region(point,color,rx,ry,energy=1){
  const b=layout.brain;glowCanvas.width=b[2];glowCanvas.height=b[3];glow.clearRect(0,0,b[2],b[3]);
  glow.filter='blur(10px)';glow.fillStyle=color;glow.beginPath();glow.ellipse(point[0]-b[0],point[1]-b[1],rx,ry,0,0,Math.PI*2);glow.fill();glow.filter='none';glow.globalCompositeOperation='destination-in';glow.drawImage(images.brain,0,0,b[2],b[3]);glow.globalCompositeOperation='source-over';
  // Tint the original relief once, instead of multiplying overlapping regions
  // into each other, which would create muddy brown/black activation areas.
  maskCanvas.width=b[2];maskCanvas.height=b[3];mask.drawImage(glowCanvas,0,0);
  glow.clearRect(0,0,b[2],b[3]);glow.drawImage(images.brain,0,0,b[2],b[3]);
  glow.globalCompositeOperation='multiply';glow.fillStyle=color;glow.fillRect(0,0,b[2],b[3]);
  glow.globalCompositeOperation='destination-in';glow.drawImage(maskCanvas,0,0);glow.globalCompositeOperation='source-over';
  ctx.save();ctx.globalAlpha=.80*energy;ctx.drawImage(glowCanvas,b[0],b[1]);ctx.restore();
 }
 function segmentation(x,y,w,h){
  ctx.drawImage(images.scene,x,y,w,h);ctx.save();ctx.translate(x,y);ctx.scale(w/958,h/538);ctx.fillStyle='#197CD180';ctx.strokeStyle='#197CD1';ctx.lineWidth=3;
  for(const poly of [[[480,252],[490,252],[494,275],[491,306],[484,309],[480,287],[476,304],[478,274]],[[316,172],[484,183],[477,309],[446,309],[435,290],[420,287],[400,309],[311,309]]]){ctx.beginPath();poly.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();ctx.stroke();}ctx.restore();
 }
 function draw(now){
  if(!ready||!layout)return;const L=layout,{mobile,bp}=L;paths=[];ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#FAFAF8';ctx.fillRect(0,0,canvas.width,canvas.height);
  const [ix,iy,iw,ih]=L.image,[tx,ty,tw,th]=L.instruction,[ox,oy]=L.ia,[sx,sy,sw,sh]=L.esa,[ax,ay]=L.action;
  text('FULL INSTRUCTION',tx,ty-14,14,'#72808D',true);box(tx,ty,tw,th);text('Shoot the nearby enemy.',tx+16,ty+38,mobile?22:23);
  text('WHOLE IMAGE',ix,iy-14,14,'#72808D',true);ctx.drawImage(mode==='action'&&clip.readyState>=2?clip:images.scene,ix,iy,iw,ih);
  if(mode==='action'){ctx.strokeStyle=colors.action;ctx.lineWidth=4;ctx.strokeRect(ix-3,iy-3,iw+6,ih+6);}
  ctx.drawImage(images.brain,...L.brain);const active=mode==='alignment';
  if(mode==='inputs'){region(L.vision,colors.esa,63,55);region(L.text,colors.ia,53,40);}
  if(mode==='ia'||active){region(bp(1150,549),colors.ia,49,32);region(bp(1150,640),colors.ia,43,31);}
  if(mode==='esa'||active){region(bp(1243,549),colors.esa,48,32);region(bp(1243,640),colors.esa,43,31);}
  if(mode==='action')region(L.motor,colors.action,37,56);
  text('GLOBAL WORKSPACE',mobile?380:785,mobile?348:168,14,'#72808D',true);text('MOTOR',mobile?220:595,mobile?364:178,13,colors.action,true);
  text('3A-VLA',mobile?35:645,mobile?755:624,32,'#152331',true);text('One shared model',mobile?35:623,mobile?788:652,19,'#72808D');
  const signal=mode==='inputs';curve([ix+iw,iy+ih*.5],[ix+iw+70,iy+ih*.5],[L.vision[0]-50,L.vision[1]],L.vision,'inputs',colors.esa,signal,now);
  curve([tx+tw,ty+th/2],[tx+tw+60,ty+th/2],[L.text[0]-25,L.text[1]+20],L.text,'inputs',colors.ia,signal,now);
  curve(L.vision,bp(360,500),bp(555,505),L.shared,'inputs',colors.esa,signal,now);curve(L.text,bp(720,625),bp(700,575),L.shared,'inputs',colors.ia,signal,now);curve(L.shared,bp(820,510),bp(960,455),L.workspace,'alignment','#7894A0',signal||active,now);
  curve(bp(1150,549),bp(1182,510),bp(1210,510),bp(1243,549),'alignment','#7C9DAA',active,now);
  curve(bp(1150,640),bp(1182,610),bp(1210,610),bp(1243,640),'alignment','#7C9DAA',active,now);
  const ia=mode==='ia'||active,esa=mode==='esa'||active;
  curve(L.workspace,[L.workspace[0]+60,L.workspace[1]-80],[ox-60,oy+55],[ox,oy+55],'ia',colors.ia,ia,now);
  curve(L.workspace,[L.workspace[0]+120,L.workspace[1]+10],[sx-60,sy+sh/2],[sx,sy+sh/2],'esa',colors.esa,esa,now);
  curve(L.workspace,bp(1085,330),bp(950,160),L.motor,'action',colors.action,mode==='action',now);
  curve(L.motor,[L.motor[0]+110,L.motor[1]-90],[ax-45,ay-25],[ax,ay+16],'action',colors.action,mode==='action',now);
  text('IA / INTENTION',ox,oy,15,colors.ia,true);ctx.globalAlpha=ia?1:.3;box(ox,oy+25,135,48,'#FFF6E9','#F2DDC2');box(ox+151,oy+25,135,48,'#FFF6E9','#F2DDC2');text('enemy',ox+23,oy+56,25,colors.ia,true);text('wall',ox+177,oy+56,25,colors.ia,true);ctx.globalAlpha=1;
  text('ESA / SCENE SEMANTICS',sx,sy-18,15,colors.esa,true);ctx.globalAlpha=esa?1:.25;segmentation(sx,sy,sw,sh);text('person ↔ enemy    cover ↔ wall',sx,sy+sh+27,16,colors.esa);ctx.globalAlpha=1;
  text('ACTION',ax,ay-18,15,colors.action,true);box(ax,ay,133,52,mode==='action'?'#FFF1EA':'#FFFFFF',mode==='action'?colors.action:'#DFE4E8');box(ax+148,ay,133,52,mode==='action'?'#FFF1EA':'#FFFFFF',mode==='action'?colors.action:'#DFE4E8');text('AIM',ax+34,ay+34,23,mode==='action'?colors.action:'#ADB5BD',true);text('SHOOT',ax+174,ay+34,23,mode==='action'?colors.action:'#ADB5BD',true);
  if(!mobile){text('Original inputs',ix,iy+ih+36,16,'#72808D');text(mode==='action'?'Action-only inference':'IA + ESA: auxiliary training targets',ox,700,16,'#72808D');}
 }
 function tick(now){
  if(!visible||document.hidden){raf=0;return;}
  if(paused){draw(now);raf=0;return;}
  if(!paused&&now>manualUntil){const next=states[Math.floor((now-start)/3200)%states.length];if(next!==mode)activate(next);}
  if(now-lastDraw>1000/30){draw(now);lastDraw=now;}raf=requestAnimationFrame(tick);
 }
 function wake(){if(visible&&!raf&&!document.hidden)raf=requestAnimationFrame(tick);}
 root.querySelectorAll('[data-flow]').forEach(b=>{b.addEventListener('click',()=>activate(b.dataset.flow,true));b.addEventListener('pointerenter',()=>{if(matchMedia('(hover:hover)').matches)activate(b.dataset.flow,true);});});
 root.querySelectorAll('[data-region]').forEach(b=>{const state={vision:'inputs',workspace:'alignment',motor:'action'}[b.dataset.region];b.addEventListener('click',()=>activate(state,true));b.addEventListener('pointerenter',()=>{if(matchMedia('(hover:hover)').matches)activate(state,true);});});
 canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();hover=[(e.clientX-r.left)*canvas.width/r.width,(e.clientY-r.top)*canvas.height/r.height];let best=45,next=null;paths.forEach(p=>p.points.forEach(q=>{const d=Math.hypot(q[0]-hover[0],q[1]-hover[1]);if(d<best){best=d;next=p.name;}}));if(next)activate(next,true);});
 canvas.addEventListener('pointerleave',()=>{hover=null;});
 motion.addEventListener('click',()=>{paused=!paused;motion.textContent=paused?'Resume motion':'Pause motion';motion.setAttribute('aria-pressed',String(paused));activate(mode);wake();});
 document.querySelectorAll('[data-explore]').forEach(a=>a.addEventListener('click',()=>activate(a.dataset.explore,true)));
 const observer=new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible){if(!started){started=true;start=performance.now();}activate(mode);wake();}else clip.pause();},{threshold:.12});observer.observe(root);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clip.pause();else{activate(mode);wake();}});
 new ResizeObserver(()=>{geometry();draw(performance.now());}).observe(root);
 Promise.all([['brain','assets/explorer-v21/brain.png'],['scene','assets/explorer-v21/observation.jpg']].map(([key,src])=>new Promise(resolve=>{const img=new Image();img.onload=()=>{images[key]=img;resolve();};img.src=src;}))).then(async()=>{await document.fonts.ready;ready=true;geometry();activate(mode);motion.textContent=paused?'Resume motion':'Pause motion';motion.setAttribute('aria-pressed',String(paused));wake();root.dataset.ready='true';});
})();

/* Full original recordings; scrolling chooses a world, ended advances its playlist. */
(()=>{
 const panels=[...document.querySelectorAll('.world-panel')],ratios=new Map(),film=document.querySelector('#research-film');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let active=null;
 for(const panel of panels){
  const video=panel.querySelector('video'),list=JSON.parse(panel.dataset.playlist);panel.sequenceIndex=0;video.muted=true;video.defaultPlaybackRate=2;
  video.addEventListener('loadedmetadata',()=>{video.playbackRate=2;if(panel===active&&!document.hidden&&!reduced.matches)video.play().catch(()=>{});});
  panel.loadRecording=(index)=>{panel.sequenceIndex=index;video.src=list[index].file;video.poster=list[index].poster;video.dataset.recording=list[index].id;panel.dataset.recordingLoaded='true';panel.querySelectorAll('.world-sequence i').forEach((dot,i)=>dot.classList.toggle('active',i===index));};
  video.addEventListener('ended',()=>{panel.loadRecording((panel.sequenceIndex+1)%list.length);if(panel===active&&!document.hidden)video.play().catch(()=>{});});
  video.addEventListener('play',()=>{film.pause();for(const other of panels)if(other!==panel)other.querySelector('video').pause();});
 }
 function update(){
  const ranked=[...ratios].filter(([p,r])=>r>.18).sort((a,b)=>b[1]-a[1]);const next=ranked[0]?.[0]||null;
  if(next!==active){if(active)active.querySelector('video').pause();active=next;}
  for(const p of panels){p.classList.toggle('world-active',p===active);if(p!==active)p.querySelector('video').pause();}
  if(active){const v=active.querySelector('video');if(!active.dataset.recordingLoaded)active.loadRecording(0);if(!reduced.matches&&!document.hidden)v.play().catch(()=>{});}
 }
 const observer=new IntersectionObserver(entries=>{entries.forEach(e=>ratios.set(e.target,e.intersectionRatio));update();},{threshold:[0,.18,.3,.5,.7,.9]});panels.forEach(p=>observer.observe(p));
 film.addEventListener('play',()=>panels.forEach(p=>p.querySelector('video').pause()));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)panels.forEach(p=>p.querySelector('video').pause());else update();});
})();
