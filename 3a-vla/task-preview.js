/* Table 2 advances automatically; pointing at a task column loops that task. */
(()=>{
 const table=document.querySelector('#table-gp'),preview=document.querySelector('#gp-task-preview');if(!table||!preview)return;
 const panel=document.querySelector('#panel-gp'),scroller=table.closest('.table-scroll'),tasks=JSON.parse(document.querySelector('#gp-task-data').textContent);
 const video=document.querySelector('#gp-preview-video'),film=document.querySelector('#research-film'),progress=document.querySelector('#gp-preview-progress'),mode=document.querySelector('#gp-preview-mode');
 let active=-1,hls=null,visible=false,held=-1,heldBy='';
 function canPlay(){return visible&&!document.hidden&&(!film||film.paused);}
 function play(){if(canPlay()){video.muted=true;video.playbackRate=2;video.play().catch(()=>{});}}
 function revealColumn(index){
  const cell=table.tHead.rows[0].cells[index+1],bounds=scroller.getBoundingClientRect(),rect=cell.getBoundingClientRect();
  const stickyWidth=table.tHead.rows[0].cells[0].getBoundingClientRect().width;
  if(rect.right>bounds.right-8)scroller.scrollLeft+=rect.right-bounds.right+8;
  else if(rect.left<bounds.left+stickyWidth+8)scroller.scrollLeft-=bounds.left+stickyWidth+8-rect.left;
 }
 function load(index,reveal=true){
  active=index;const task=tasks[index];preview.dataset.task=task.id;video.dataset.task='';
  document.querySelector('#gp-preview-title').textContent=task.label;
  document.querySelector('#gp-preview-description').textContent=task.description;
  document.querySelector('#gp-preview-counter').textContent=String(index+1).padStart(2,'0')+' / '+String(tasks.length).padStart(2,'0');
  [...table.rows].forEach(row=>[...row.cells].forEach((cell,i)=>cell.classList.toggle('gp-active-column',i===index+1)));
  [...table.tHead.rows[0].cells].forEach((cell,i)=>{if(i===index+1)cell.setAttribute('aria-current','true');else cell.removeAttribute('aria-current');});
  progress.style.transform='scaleX(0)';if(reveal)revealColumn(index);
  if(hls){hls.destroy();hls=null;}video.pause();video.removeAttribute('src');video.load();
  video.poster=task.poster;video.setAttribute('aria-label','3A-VLA '+task.label+' demonstration at double speed');video.defaultPlaybackRate=2;video.playbackRate=2;
  if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=task.stream;video.load();}
  else if(window.Hls?.isSupported()){
   hls=new Hls({enableWorker:false,maxBufferLength:12,maxMaxBufferLength:20,backBufferLength:4});hls.loadSource(task.stream);hls.attachMedia(video);hls.on(Hls.Events.MANIFEST_PARSED,play);
  }
 }
 function taskColumn(target){
  const cell=target instanceof Element?target.closest('th,td'):null;
  return cell?.closest('table')===table&&cell.cellIndex>0&&cell.cellIndex<=tasks.length?cell.cellIndex-1:-1;
 }
 function hold(index,source){
  if(index<0)return;
  held=index;heldBy=source;video.loop=true;preview.dataset.playback='loop';mode.textContent='Looping this task';
  if(active!==index)load(index,source!=='pointer');else play();
 }
 function resume(source){
  if(source&&heldBy!==source)return;
  held=-1;heldBy='';video.loop=false;preview.dataset.playback='sequence';mode.textContent='Six tasks · Continuous playback';play();
 }
 video.muted=true;video.loop=false;video.controls=false;
 preview.dataset.playback='sequence';
 [...table.rows].forEach(row=>[...row.cells].forEach((cell,i)=>{
  if(i<1||i>tasks.length)return;
  cell.classList.add('gp-task-column');
  if(row===table.tHead.rows[0]){
   cell.tabIndex=0;cell.setAttribute('aria-controls',video.id);
   cell.setAttribute('aria-label',tasks[i-1].label+' — loop demonstration');
  }
 }));
 table.addEventListener('pointermove',event=>{
  if(event.pointerType==='touch')return;
  const index=taskColumn(event.target);if(index>=0)hold(index,'pointer');else resume('pointer');
 });
 table.addEventListener('pointerleave',()=>resume('pointer'));
 table.addEventListener('pointercancel',()=>resume('pointer'));
 table.addEventListener('focusin',event=>{if(event.target.matches(':focus-visible'))hold(taskColumn(event.target),'keyboard');});
 table.addEventListener('focusout',event=>{if(taskColumn(event.relatedTarget)<0)resume('keyboard');});
 table.addEventListener('keydown',event=>{if(event.key==='Escape')resume();});
 table.addEventListener('pointerup',event=>{if(event.pointerType==='touch')hold(taskColumn(event.target),'touch');});
 document.addEventListener('pointerdown',event=>{if(!table.contains(event.target))resume('touch');});
 video.addEventListener('loadedmetadata',()=>{video.dataset.task=tasks[active]?.id||'';video.playbackRate=2;play();});
 video.addEventListener('canplay',play);
 video.addEventListener('timeupdate',()=>{progress.style.transform='scaleX('+Math.min(1,video.currentTime/video.duration||0)+')';});
 video.addEventListener('ended',()=>{if(held>=0){video.currentTime=0;play();}else load((active+1)%tasks.length);});
 const observer=new IntersectionObserver(entries=>{
  visible=entries[0].isIntersecting;
  if(visible){if(active<0)load(0);else{revealColumn(active);play();}}
  else video.pause();
 },{threshold:.15});observer.observe(panel);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();else play();});
 film?.addEventListener('play',()=>video.pause());film?.addEventListener('pause',play);
 document.querySelectorAll('.world-panel video').forEach(v=>v.addEventListener('play',()=>video.pause()));
})();
