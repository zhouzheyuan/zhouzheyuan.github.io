const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const lang='en';

const siteHeader=$('.site-header');
function updateHeader(){siteHeader.classList.toggle('is-scrolled',window.scrollY>32);}
window.addEventListener('scroll',updateHeader,{passive:true});
window.addEventListener('pageshow',updateHeader);
updateHeader();

function modelLabel(label){const wrap=document.createElement('span');wrap.className='model-label';let provider='';if(/^(GPT|VPT)/.test(label))provider='openai';else if(label.startsWith('Claude'))provider='anthropic';else if(label.startsWith('Gemini'))provider='google';else if(label.startsWith('Qwen'))provider='qwen';const src=label.startsWith('3A-VLA')?'assets/brand/v11/icon.svg':provider?`assets/providers/${provider}.png`:'';if(src){const image=document.createElement('img');image.src=src;image.className='model-logo';image.alt='';image.setAttribute('aria-hidden','true');image.width=24;image.height=24;wrap.append(image);}const name=document.createElement('span');name.textContent=label;wrap.append(name);return wrap;}

let mcMode='mini';
const tables=window.PAPER_DATA.tables;
function renderMinecraft(){
  const cols={mini:[2,5,8],all:[3,6,9],steps:[1,4,7]}[mcMode];
  const table=$('#table-mc');table.replaceChildren();
  const head=table.createTHead().insertRow();
  const headers=lang==='zh'?['模型','具身','战斗','GUI']:['Model','Embodied','Combat','GUI'];
  headers.forEach((t,i)=>{const th=document.createElement('th');th.scope='col';if(i){const icon=document.createElement('img');icon.className='task-icon';icon.src='assets/paper/task-icons/mc-'+['embodied','combat','gui'][i-1]+'.png';icon.alt='';icon.setAttribute('aria-hidden','true');icon.width=22;icon.height=22;th.append(icon);}th.append(document.createTextNode(t+(i&&mcMode!=='steps'?' SR (%)':'')));head.append(th);});
  const body=table.createTBody();
  for(const data of tables.mc.rows){const row=body.insertRow();row.classList.toggle('ours',data.ours);const th=document.createElement('th');th.scope='row';th.textContent=data.label;row.append(th);for(const index of cols){const td=row.insertCell();td.textContent=data.values[index];}}
  const descriptions={mini:['Mini: 10 tasks per group','Mini：每组 10 个任务'],all:['All: the full MCU task suite','All：完整 MCU 任务集合'],steps:['Average environment steps; lower is better','平均环境步数，越低越好']};
  $('#mc-protocol').textContent=descriptions[mcMode][lang==='zh'?1:0];
  $$('[data-mc]').forEach(b=>{const active=b.dataset.mc===mcMode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
}
function applyLanguage(){document.documentElement.lang='en';renderMinecraft();}
$$('[data-mc]').forEach(b=>b.addEventListener('click',()=>{mcMode=b.dataset.mc;renderMinecraft();}));

const dialog=$('#figure-dialog'),stage=$('#figure-stage'),detail=$('#figure-detail');let figureFocus=null;
$$('[data-figure]').forEach(b=>b.addEventListener('click',()=>{figureFocus=b;const name=b.dataset.figure;$('#figure-dialog-title').textContent=b.dataset.title;detail.src=`assets/paper/${name}.webp`;detail.alt=b.dataset.title;$('#figure-original').href=`assets/paper/${name}.pdf`;stage.classList.remove('zoomed');$('#figure-zoom').textContent='100%';$('#figure-zoom').setAttribute('aria-label','Zoom figure to original size');dialog.showModal();stage.scrollTo(0,0);}));
$('#figure-close').addEventListener('click',()=>dialog.close());
$('#figure-zoom').addEventListener('click',()=>{const zoomed=stage.classList.toggle('zoomed');$('#figure-zoom').textContent=zoomed?(lang==='zh'?'适应':'Fit'):'100%';$('#figure-zoom').setAttribute('aria-label',zoomed?'Fit figure to dialog':'Zoom figure to original size');});
dialog.addEventListener('close',()=>figureFocus?.focus());
dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});

const player=$('#research-film');
const startButton=$('#film-start');player.controls=false;let streamPromise=null,filmHls=null;
function prepareFilmStream(){if(streamPromise)return streamPromise;streamPromise=new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('Video loading timed out. Please try again.')),30000);player.addEventListener('loadedmetadata',()=>{clearTimeout(timeout);resolve();},{once:true});if(player.canPlayType('application/vnd.apple.mpegurl')){player.src=player.dataset.stream;player.load();}else if(window.Hls?.isSupported()){filmHls=new Hls({enableWorker:false,autoStartLoad:true,maxBufferLength:25,maxMaxBufferLength:30});filmHls.on(Hls.Events.ERROR,(_,data)=>{if(data.fatal){clearTimeout(timeout);reject(new Error('Video could not load. Please try again.'));}});filmHls.loadSource(player.dataset.stream);filmHls.attachMedia(player);}else{clearTimeout(timeout);reject(new Error('This browser does not support the film player.'));}});return streamPromise;}
startButton.addEventListener('click',async()=>{startButton.disabled=true;startButton.setAttribute('aria-label','Loading film');try{const ready=prepareFilmStream();const nativePlay=player.canPlayType('application/vnd.apple.mpegurl')?player.play():null;await ready;player.controls=true;startButton.hidden=true;if(nativePlay)await nativePlay;else await player.play();}catch(error){if(filmHls){filmHls.destroy();filmHls=null;}streamPromise=null;showToast(error.message);startButton.hidden=false;}finally{startButton.disabled=false;startButton.setAttribute('aria-label','Play the 3A-VLA film');}});

document.addEventListener('visibilitychange',()=>{if(document.hidden)$$('video').forEach(video=>video.pause());});
$('#copy-citation').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#bibtex').textContent);showToast(lang==='zh'?'BibTeX 已复制':'BibTeX copied');}catch{const r=document.createRange();r.selectNodeContents($('#bibtex'));const selection=getSelection();selection.removeAllRanges();selection.addRange(r);showToast(lang==='zh'?'引用已选中，可手动复制':'Citation selected. Copy with your keyboard.');}});
function showToast(text){$('#toast').textContent=text;$('#toast').classList.add('visible');setTimeout(()=>$('#toast').classList.remove('visible'),2400);}
function updateTableHints(){for(const region of $$('.table-scroll')){let hint=region.parentElement.querySelector('.scroll-hint');if(!hint){hint=document.createElement('p');hint.className='scroll-hint';region.after(hint);}hint.textContent=lang==='zh'?'左右滑动查看完整表格 →':'Scroll horizontally to compare all columns →';hint.classList.toggle('visible',region.scrollWidth>region.clientWidth+2);}}
new ResizeObserver(updateTableHints).observe(document.body);

$$('[data-mc]').forEach(b=>b.addEventListener('click',updateTableHints));
applyLanguage();
updateTableHints();
