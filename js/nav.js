/* navigation history (Back button), soft render, colour picker */
const SC={};let ign=0,softT=null;
function go(t){if(t===tab&&!(t==='v'&&!$('#vs')))return;SC[tab]=scrollY;tab=t;history.pushState({t},'');render();scrollTo(0,t==='v'?0:SC[t]||0)}
history.replaceState({t:tab},'');
const _sm=HTMLDialogElement.prototype.showModal;
HTMLDialogElement.prototype.showModal=function(){_sm.call(this);history.pushState({dlg:1},'');this.addEventListener('close',()=>{if(this._bk)return;ign++;history.back()},{once:true})};
addEventListener('popstate',e=>{if(ign>0){ign--;return}
 const d=[...document.querySelectorAll('dialog[open]')].pop();if(d){d._bk=1;d.close();return}
 if(CP){cpClose(true);return}
 if(document.fullscreenElement){document.exitFullscreen().catch(()=>{});return}
 const t=(e.state&&e.state.t)||'p';if(t!==tab){SC[tab]=scrollY;tab=t;render();scrollTo(0,t==='v'?0:SC[t]||0)}});
function renderSoft(){clearTimeout(softT);if(tab==='v'&&typeof vSoft==='function'&&$('#vs')){vSoft();return}
 const a=document.activeElement;if(a&&a.closest&&a.closest('#m')&&/^(input|textarea|select)$/i.test(a.tagName)){softT=setTimeout(renderSoft,2500);return}
 const y=scrollY;render();scrollTo(0,y)}
/* colour picker with OK / Cancel */
let CP=null;
const PAL=['#000000','#434343','#666666','#999999','#cccccc','#ffffff','#e11d48','#f97316','#f59e0b','#ffe600','#84cc16','#22c55e','#14b8a6','#22d3ee','#3b82f6','#2563eb','#6366f1','#8b5cf6','#d946ef','#ec4899','#7f1d1d','#9a3412','#854d0e','#365314','#14532d','#134e4a','#164e63','#1e3a8a','#4c1d95','#831843','#fecaca','#fed7aa','#fef08a','#bbf7d0','#bae6fd','#ddd6fe'];
function cpClose(cancel){if(!CP)return;const c=CP;CP=null;document.removeEventListener('pointerdown',c.out,true);document.removeEventListener('keydown',c.key,true);c.d.remove();if(cancel&&c.o.cancel)c.o.cancel()}
function cpick(el,val,o){if(CP&&CP.el===el){cpClose(true);return}cpClose(true);val=/^#[0-9a-f]{6}$/i.test(val)?val:'#000000';
 const d=document.createElement('div');d.className='cpop';
 d.innerHTML=`<div class="cpg">${PAL.map(c=>`<button type="button" class="cps" style="background:${c}" data-c="${c}" aria-label="${c}"></button>`).join('')}</div><div class="cpr"><input type="color" class="cpn" value="${val}" aria-label="צבע מותאם"><input class="cph" value="${val}" dir="ltr" maxlength="7"></div><div class="dact"><button class="pri" data-a="ok">אישור</button><button data-a="no">ביטול</button></div>`;
 document.body.append(d);const r=el.getBoundingClientRect(),w=d.offsetWidth,h=d.offsetHeight;d.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2))+'px';d.style.top=(r.bottom+h+10<innerHeight?r.bottom+6:Math.max(8,r.top-h-6))+'px';
 let cur=val;const set=c=>{cur=c;d.querySelector('.cpn').value=c;d.querySelector('.cph').value=c;o.live&&o.live(c)};
 d.addEventListener('mousedown',e=>{if(!/^(input)$/i.test(e.target.tagName))e.preventDefault()});
 d.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.c)set(b.dataset.c);else if(b.dataset.a==='ok'){const c=cur;cpClose(false);o.ok&&o.ok(c)}else if(b.dataset.a==='no')cpClose(true)});
 d.querySelector('.cpn').oninput=e=>set(e.target.value);
 d.querySelector('.cph').oninput=e=>{let v=e.target.value.trim();if(v&&v[0]!=='#')v='#'+v;if(/^#[0-9a-f]{6}$/i.test(v)){cur=v;d.querySelector('.cpn').value=v;o.live&&o.live(v)}};
 const out=e=>{if(!d.contains(e.target)&&!el.contains(e.target))cpClose(true)},key=e=>{if(e.key==='Escape'){e.stopPropagation();cpClose(true)}};
 document.addEventListener('pointerdown',out,true);document.addEventListener('keydown',key,true);CP={el,d,o,out,key}}
