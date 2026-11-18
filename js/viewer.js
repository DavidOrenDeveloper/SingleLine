/* PDF viewer: vector zoom, pan, annotations, schematic marks */
Object.assign(IC,{pen:IC.edit,
 cur:svg('<path d="m3 3 7 18 2.5-7.5L20 11z"/>'),txt:svg('<path d="M4 7V4h16v3M9 20h6M12 4v16"/>'),
 hl:svg('<path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>'),
 ln:svg('<path d="M5 19 19 5"/>'),pl:svg('<path d="M3 18l6-9 5 6 7-10"/>'),ell:svg('<circle cx="12" cy="12" r="9"/>'),rc:svg('<rect x="3" y="4" width="18" height="16" rx="2"/>'),
 undo:svg('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>'),redo:svg('<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>'),
 fit:svg('<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>'),
 tag:svg('<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><path d="M7 7h.01"/>'),
 ext:svg('<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'),
 prev:svg('<path d="m9 18 6-6-6-6"/>'),next:svg('<path d="m15 18-6-6 6-6"/>')});
let V=null;const ANDEF={};
const TOOLS=[['sel','בחירה','cur'],['text','טקסט','txt'],['mark','מרקר','hl'],['line','קו','ln'],['poly','קו מתפצל','pl'],['pen','עט','pen'],['ell','עיגול','ell'],['rect','מרובע','rc']];
const aEntry=k=>{let e=S.a.find(x=>x.id===k);if(!e){e={id:k,items:[]};S.a.push(e)}return e};
const rgba=(h,a)=>{h=String(h||'#fff').replace('#','');if(h.length===3)h=h.replace(/./g,'$&$&');const n=parseInt(h,16)||0;return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`};
function openDoc(o){const from=V?V.from:tab;V=Object.assign({key:'',title:'',G:null,file:null,pg:1,k:1,x:0,y:0,fit:1,tool:'sel',sel:null,undo:[],redo:[],pdf:null,page:null,pw:0,ph:0,txt:{},gen:0,ptr:new Map(),from:from==='v'?'d':from,draft:null,drag:null,edit:null,first:true},o);V.e=aEntry(V.key);tab='v';render();scrollTo(0,0)}
function vClose(){const b=V.from||'d';try{V.pdf&&V.pdf.destroy()}catch(e){}V=null;G=null;tab=b;render()}
const vOpenRevTitle=k=>{const d=S.d.find(d=>d.revs.some(r=>r.key===k));return d?d.num+(d.name?' · '+d.name:''):'תוכנית'};
function vV(){return`<div class="vw"><div class="vbar"><button onclick="vClose()">${IC.back}חזרה</button><b class="vtitle" title="${esc(V.title)}">${esc(V.title)}</b><span class="sep"></span>
<button class="ic" onclick="vPgGo(-1)" aria-label="עמוד קודם">${IC.prev}</button><span class="sub" id="vpg"></span><button class="ic" onclick="vPgGo(1)" aria-label="עמוד הבא">${IC.next}</button><span class="sep"></span>
<button class="ic" onclick="vZoomBtn(1/1.3)" aria-label="הקטן">${IC.minus}</button><span class="sub" id="vzl" style="min-width:44px;text-align:center"></span><button class="ic" onclick="vZoomBtn(1.3)" aria-label="הגדל">${IC.plus}</button><button class="ic" onclick="vFit();vDraw()" title="התאם למסך" aria-label="התאם למסך">${IC.fit}</button><span class="sep"></span>
<button class="ic" onclick="vUndo()" title="בטל (Ctrl+Z)" aria-label="בטל">${IC.undo}</button><button class="ic" onclick="vRedo()" title="חזור (Ctrl+Y)" aria-label="חזור">${IC.redo}</button><button class="ic" onclick="vExt()" title="פתח בחלון חדש" aria-label="פתח בחלון חדש">${IC.ext}</button></div>
<div class="vtools" id="vtools"></div><div class="vprops" id="vprops"></div><div class="vstage" id="vs"><canvas id="vc"></canvas><svg id="vsvg" xmlns="http://www.w3.org/2000/svg"><g id="vg"></g></svg></div><div class="sub" id="vmsg">גלגלת = זום · Shift+גלגלת = ימינה/שמאלה · Ctrl+גלגלת = למעלה/למטה · גרירה = הזזה · Ctrl+Z / Ctrl+Y = ביטול / חזרה</div></div>`}
async function vLoad(){let f=V.file||await idb('get',V.key).catch(()=>null)||await dlFile(V.key);if(!f)throw 'missing';V.file=f;try{V.pdf=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise}catch(e){throw 'bad'}V.np=V.pdf.numPages;await vPage(V.pg)}
async function vPage(n){V.pg=Math.min(Math.max(1,n),V.np);V.page=await V.pdf.getPage(V.pg);const vp=V.page.getViewport({scale:1});V.pw=vp.width;V.ph=vp.height;V.draft=null;V.sel=null;vFit();vDraw();vProps()}
function vPgGo(d){if(V&&V.pdf)vPage(V.pg+d)}
function vFit(){const s=$('#vs');if(!s||!V.pw)return;const sw=s.clientWidth,sh=s.clientHeight;V.fit=Math.min(sw/V.pw,sh/V.ph)*.97;V.k=V.fit;V.x=(sw-V.pw*V.k)/2;V.y=(sh-V.ph*V.k)/2}
function vDraw(){if(!V||!V.page)return;clearTimeout(V.rt);V.rt=setTimeout(()=>{vRender();vOv()},70);vTransform();vOvT();vTaPlace();const z=$('#vzl');if(z)z.textContent=Math.round(V.k/V.fit*100)+'%';const g=$('#vpg');if(g)g.textContent=V.pg+' / '+V.np}
function vTransform(){const c=$('#vc');if(!c||!V.r)return;const r=V.r;c.style.transformOrigin='0 0';c.style.transform=`translate(${V.x}px,${V.y}px) scale(${V.k/r.k}) translate(${-r.x}px,${-r.y}px)`}
async function vRender(){const st=$('#vs'),c=$('#vc');if(!st||!c||!V||!V.page)return;const dpr=Math.min(devicePixelRatio||1,3),sw=st.clientWidth,sh=st.clientHeight,my=++V.gen,u={x:V.x,y:V.y,k:V.k};
 const off=document.createElement('canvas');off.width=Math.max(1,Math.round(sw*dpr));off.height=Math.max(1,Math.round(sh*dpr));const cx=off.getContext('2d');
 cx.fillStyle='#fff';cx.fillRect(u.x*dpr,u.y*dpr,V.pw*u.k*dpr,V.ph*u.k*dpr);
 if(V.task){try{V.task.cancel()}catch(e){}}
 const vp=V.page.getViewport({scale:u.k*dpr,offsetX:u.x*dpr,offsetY:u.y*dpr});V.task=V.page.render({canvasContext:cx,viewport:vp});
 try{await V.task.promise}catch(e){return}
 if(my!==V.gen)return;c.width=off.width;c.height=off.height;c.style.width=sw+'px';c.style.height=sh+'px';c.getContext('2d').drawImage(off,0,0);V.r=u;vTransform()}
function zoomAt(cx,cy,f){const nk=Math.min(Math.max(V.k*f,V.fit*.15),V.fit*400),r=nk/V.k;V.x=cx-(cx-V.x)*r;V.y=cy-(cy-V.y)*r;V.k=nk}
function vZoomBtn(f){const s=$('#vs');zoomAt(s.clientWidth/2,s.clientHeight/2,f);vDraw()}
const vExt=()=>{if(V&&V.file)window.open(URL.createObjectURL(V.file),'_blank')};
const vu=()=>Math.max(1,V.pw/700);
function vDef(t){const u=vu(),B={rect:{c:'#e11d48',sw:2*u,op:1,f:'',fo:.25},ell:{c:'#e11d48',sw:2*u,op:1,f:'',fo:.25},line:{c:'#e11d48',sw:2*u,op:1},poly:{c:'#e11d48',sw:2*u,op:1},pen:{c:'#2563eb',sw:2*u,op:1},mark:{c:'#ffe600',op:.4},text:{c:'#111111',fs:14*u,bg:'#ffffff',bgo:.9,bgOn:false,b:false,i:false,list:'',op:1}};return{...B[t],...(ANDEF[t]||{})}}
const toPage=e=>{const r=$('#vs').getBoundingClientRect();return{x:(e.clientX-r.left-V.x)/V.k,y:(e.clientY-r.top-V.y)/V.k}};
const pts=p=>{let s='';for(let i=0;i<p.length;i+=2)s+=p[i]+','+p[i+1]+' ';return s};
const pathD=p=>{if(p.length<4)return`M${p[0]} ${p[1]}l0.01 0`;let d=`M${p[0]} ${p[1]}`;for(let i=2;i<p.length;i+=2)d+=`L${p[i]} ${p[i+1]}`;return d};
const isBB=t=>t==='rect'||t==='ell'||t==='mark'||t==='text';
function bbox(it){if(isBB(it.t))return[it.x,it.y,it.x+it.w,it.y+(it.h||0)];const p=it.p;let a=1e9,b=1e9,c=-1e9,d=-1e9;for(let i=0;i<p.length;i+=2){a=Math.min(a,p[i]);c=Math.max(c,p[i]);b=Math.min(b,p[i+1]);d=Math.max(d,p[i+1])}return[a,b,c,d]}
function txStyle(it){const fs=it.fs;return`font:${it.i?'italic ':''}${it.b?'700 ':'400 '}${fs}px/1.3 Heebo,system-ui,Arial,sans-serif;color:${it.c};background:${it.bgOn?rgba(it.bg,it.bgo):'transparent'};padding:${fs*.25}px ${fs*.4}px;border-radius:${fs*.2}px;white-space:pre-wrap;word-break:break-word;box-sizing:border-box;width:${it.w}px`}
function fixTx(it){const d=document.createElement('div');d.dir='auto';d.style.cssText=txStyle(it)+';position:absolute;visibility:hidden;left:-9999px';d.textContent=it.text||' ';document.body.append(d);it.h=Math.max(it.fs*1.6,d.offsetHeight);d.remove()}
function itemSvg(it,k){const hw=Math.max(it.sw||0,12/k),o=`opacity="${it.op??1}"`;
 if(it.t==='text')return`<foreignObject x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h||it.fs*2}" style="overflow:visible"><div dir="auto" style="${txStyle(it)};opacity:${it.op}">${esc(it.text)}</div></foreignObject>`;
 const sh=(a)=>{switch(it.t){case'rect':case'mark':return`<rect x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" ${a}/>`;case'ell':return`<ellipse cx="${it.x+it.w/2}" cy="${it.y+it.h/2}" rx="${it.w/2}" ry="${it.h/2}" ${a}/>`;case'line':return`<line x1="${it.p[0]}" y1="${it.p[1]}" x2="${it.p[2]}" y2="${it.p[3]}" ${a}/>`;case'poly':return`<polyline points="${pts(it.p)}" ${a}/>`;default:return`<path d="${pathD(it.p)}" ${a}/>`}};
 const lin=it.t==='line'||it.t==='poly'||it.t==='pen',filled=it.t==='mark'||((it.t==='rect'||it.t==='ell')&&it.f);
 const vis=it.t==='mark'?`fill="${it.c}" fill-opacity="${it.op}" style="mix-blend-mode:multiply"`:lin?`fill="none" stroke="${it.c}" stroke-width="${it.sw}" stroke-linecap="round" stroke-linejoin="round" ${o}`:`fill="${it.f||'none'}" fill-opacity="${it.fo}" stroke="${it.c}" stroke-width="${it.sw}" ${o}`;
 return sh(vis)+sh(`fill="${filled?'#000':'none'}" fill-opacity="0" stroke="#000" stroke-opacity="0" stroke-width="${hw}" pointer-events="${filled?'all':'stroke'}"`)}
function marksSvg(){if(!V.G)return'';const live=V.tool==='sel'||V.tool==='tag';return V.G.marks.filter(m=>m.pg==V.pg).map(m=>{const p=S.p.find(x=>x.id===m.pid),ok=p&&has(p),x=m.x/100*V.pw,y=m.y/100*V.ph,w=m.w/100*V.pw,h=m.h/100*V.ph,n=p?p.name:'?',fs=Math.max(6,Math.min(h*.55,w/Math.max(2,n.length*.62),V.pw/30));
 return`<g data-m="${m.id}" ${live?'':'pointer-events="none"'}><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${ok?S.c.ok:S.c.miss}" fill-opacity=".62" stroke="${ok?'#2e8b4a':'#c0392b'}" stroke-width="${2/V.k}"/><foreignObject x="${x}" y="${y}" width="${w}" height="${h}"><div style="display:flex;align-items:center;justify-content:center;height:100%;overflow:hidden;font:700 ${fs}px/1 Heebo,system-ui,Arial;color:#000;pointer-events:none">${esc(n)}</div></foreignObject></g>`}).join('')}
function selSvg(){const it=V.sel&&V.e.items.find(x=>x.id===V.sel);if(!it||it.pg!==V.pg)return'';const k=V.k,[a,b,c,d]=bbox(it),hs=10/k,pad=4/k;
 let s=`<rect x="${a-pad}" y="${b-pad}" width="${c-a+2*pad}" height="${d-b+2*pad}" fill="none" stroke="#2563eb" stroke-width="${1.5/k}" stroke-dasharray="${5/k} ${4/k}" pointer-events="none"/>`;
 if(isBB(it.t))[[a,b],[c,b],[c,d],[a,d]].forEach((q,i)=>{s+=`<rect data-h="${i}" x="${q[0]-hs/2}" y="${q[1]-hs/2}" width="${hs}" height="${hs}" fill="#fff" stroke="#2563eb" stroke-width="${1.5/k}" style="cursor:nwse-resize"/>`});
 else if(it.t!=='pen')for(let i=0;i<it.p.length;i+=2)s+=`<circle data-p="${i/2}" cx="${it.p[i]}" cy="${it.p[i+1]}" r="${hs/2}" fill="#fff" stroke="#2563eb" stroke-width="${1.5/k}" style="cursor:move"/>`;return s}
function draftSvg(){const d=V.draft;if(!d)return'';if(d.t==='tag')return`<rect x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}" fill="#1f3a5f22" stroke="#1f3a5f" stroke-width="${2/V.k}" stroke-dasharray="${6/V.k}"/>`;
 let it=d;if(d.t==='poly'&&V.cur)it={...d,p:[...d.p,V.cur.x,V.cur.y]};return`<g pointer-events="none">${itemSvg(it,V.k)}</g>`}
function hlSvg(){const h=V.hl;if(!h||h.pg!==V.pg)return'';const p=8/V.k;return`<rect x="${h.x-p}" y="${h.y-p}" width="${h.w+2*p}" height="${h.h+2*p}" fill="#ffd54a44" stroke="#e11d48" stroke-width="${3/V.k}" rx="${4/V.k}" pointer-events="none"><animate attributeName="opacity" values="1;.25;1" dur="1.2s" repeatCount="5"/></rect>`}
function vOvT(){const g=$('#vg');if(g)g.setAttribute('transform',`translate(${V.x} ${V.y}) scale(${V.k})`)}
function vOv(){const g=$('#vg');if(!g||!V||!V.page)return;vOvT();g.innerHTML=marksSvg()+V.e.items.filter(i=>i.pg===V.pg&&i.id!==V.edit).map(i=>`<g data-id="${i.id}">${itemSvg(i,V.k)}</g>`).join('')+hlSvg()+draftSvg()+selSvg()}
const vOvSoon=()=>{if(V.raf)return;V.raf=requestAnimationFrame(()=>{V.raf=0;if(V)vOv()})};
/* tools + props */
function vTools(){const e=$('#vtools');if(!e)return;e.innerHTML=TOOLS.map(([id,l,ic])=>`<button class="tl ${V.tool===id?'on':''}" onclick="vTool('${id}')">${IC[ic]}<span>${l}</span></button>`).join('')+(V.G?`<span class="sep"></span><button class="tl ${V.tool==='tag'?'on':''}" onclick="vTool('tag')">${IC.tag}<span>סימון לוח</span></button>`:'')+`<span class="sep"></span><button class="tl danger" ${V.sel?'':'disabled'} onclick="vDel()">${IC.trash}<span>מחק</span></button>`;
 const s=$('#vs');if(s)s.className='vstage '+(V.tool==='sel'?'t-sel':'t-draw')}
function vTool(t){if(V.edit)vTextEnd();vCancelDraft();V.tool=t;if(t!=='sel')V.sel=null;vTools();vProps();vOv()}
function vCancelDraft(){V.draft=null;V.cur=null;V.drag=null}
function vTarget(){if(V.sel)return V.e.items.find(x=>x.id===V.sel)||null;if(V.tool!=='sel'&&V.tool!=='tag')return{t:V.tool,...vDef(V.tool),_def:1};return null}
function vProps(){const e=$('#vprops');if(!e||!V)return;const it=vTarget();if(!it){e.innerHTML=V.tool==='tag'?'<span class="sub">גרור מלבן סביב לוח בסכמה, וחפש/בחר איזה לוח זה. הטקסט שבתוך המלבן יוזן לחיפוש אוטומטית.</span>':'<span class="sub">בחר כלי מהסרגל, או לחץ על אובייקט כדי לערוך אותו.</span>';return}
 const u=vu(),C=(l,k,v)=>`<label class="pp">${l}<input type="color" value="${v}" oninput="vSet('${k}',this.value)" onchange="vSet('${k}',this.value,1)"></label>`,
 R=(l,k,v,a,b,s)=>`<label class="pp">${l}<input type="range" min="${a}" max="${b}" step="${s}" value="${v}" oninput="vSet('${k}',+this.value)" onchange="vSet('${k}',+this.value,1)"></label>`,
 K=(l,k,v)=>`<label class="pp tog"><input type="checkbox" ${v?'checked':''} onchange="vSet('${k}',this.checked,1)">${l}</label>`;
 const SW=['#ffe600','#7CFC00','#ff9800','#ff4fa3','#22d3ee'].map(c=>`<button class="swb" style="background:${c}" onclick="vSet('c','${c}',1)" aria-label="${c}"></button>`).join('');let h='';
 if(it.t==='text')h=C('צבע טקסט','c',it.c)+R('גודל','fs',it.fs,4*u,80*u,u/4)+`<button class="ic ${it.b?'pri':''}" onclick="vSet('b',${!it.b},1)" title="מודגש"><b>B</b></button><button class="ic ${it.i?'pri':''}" onclick="vSet('i',${!it.i},1)" title="נטוי"><i>I</i></button><select onchange="vSet('list',this.value,1)"><option value="">ללא רשימה</option><option value="num" ${it.list==='num'?'selected':''}>רשימה ממוספרת</option><option value="bul" ${it.list==='bul'?'selected':''}>רשימת נקודות</option></select>`+K('רקע','bgOn',it.bgOn)+(it.bgOn?C('צבע רקע','bg',it.bg)+R('שקיפות רקע','bgo',it.bgo,.05,1,.05):'')+R('שקיפות','op',it.op,.1,1,.05);
 else if(it.t==='mark')h=C('צבע','c',it.c)+SW+R('שקיפות','op',it.op,.1,1,.05);
 else{h=C('צבע קו','c',it.c)+R('עובי','sw',it.sw,.5*u,14*u,u/4)+R('שקיפות','op',it.op,.1,1,.05);if(it.t==='rect'||it.t==='ell')h+=K('מילוי','fon',!!it.f)+(it.f?C('צבע מילוי','f',it.f)+R('שקיפות מילוי','fo',it.fo,.05,1,.05):'')}
 e.innerHTML=h+(V.sel?`<button class="ic danger" onclick="vDel()" title="מחק (Delete)">${IC.trash}</button>`:'')}
function vSet(k,v,fin){const it=vTarget();if(!it)return;if(V.sel&&!V.pre)V.pre=JSON.stringify(V.e.items);
 const D=ANDEF[it.t]=ANDEF[it.t]||{};
 if(k==='fon'){k='f';v=v?(D.f||'#ffe600'):''}
 if(k==='list'){if(V.sel){it.list=v;it.text=relist(it.text||'',v);fixTx(it)}D.list=v}
 else{if(V.sel)it[k]=v;D[k]=v;if(it.t==='text'&&V.sel)fixTx(it)}

 vOv();if(fin){if(V.sel){if(V.pre!==JSON.stringify(V.e.items)){V.undo.push(V.pre);V.redo=[];save()}V.pre=null}vProps()}}
function relist(t,m){let n=0;return t.split('\n').map(l=>{l=l.replace(/^(\d+\.|•)\s/,'');if(!m||!l.trim())return l;return m==='num'?(++n)+'. '+l:'• '+l}).join('\n')}
/* history */
const vSnap=()=>JSON.stringify(V.e.items);
function vPush(before){if(before!==vSnap()){V.undo.push(before);V.redo=[];if(V.undo.length>100)V.undo.shift();save()}vTools()}
function vUndo(){if(V.edit)return;if(!V.undo.length)return;V.redo.push(vSnap());V.e.items=JSON.parse(V.undo.pop());V.sel=null;save();vTools();vProps();vOv()}
function vRedo(){if(V.edit)return;if(!V.redo.length)return;V.undo.push(vSnap());V.e.items=JSON.parse(V.redo.pop());V.sel=null;save();vTools();vProps();vOv()}
function vDel(){if(!V.sel)return;const b=vSnap();V.e.items=V.e.items.filter(x=>x.id!==V.sel);V.sel=null;vPush(b);vProps();vOv()}
/* text editing */
function vTaPlace(){const ta=$('#vta');if(!ta||!V.edit)return;const it=V.e.items.find(x=>x.id===V.edit);if(!it)return;const s=ta.style;s.left=V.x+it.x*V.k+'px';s.top=V.y+it.y*V.k+'px';s.width=it.w*V.k+'px';s.font=`${it.i?'italic ':''}${it.b?'700 ':'400 '}${it.fs*V.k}px/1.3 Heebo,system-ui,Arial,sans-serif`;s.color=it.c;s.background=it.bgOn?rgba(it.bg,it.bgo):'#ffffffcc';s.padding=`${it.fs*.25*V.k}px ${it.fs*.4*V.k}px`;s.height='auto';s.height=ta.scrollHeight+'px'}
function vTextEdit(id){const it=V.e.items.find(x=>x.id===id);if(!it)return;V.edit=id;V.preT=V.preT||vSnap();V.sel=id;vOv();
 const ta=document.createElement('textarea');ta.id='vta';ta.dir='auto';ta.value=it.text||'';$('#vs').append(ta);if(!ta.value&&it.list)ta.value=it.list==='num'?'1. ':'• ';
 vTaPlace();ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length);
 ta.oninput=()=>{it.text=ta.value;vTaPlace()};ta.onblur=()=>vTextEnd();
 ta.onkeydown=e=>{e.stopPropagation();if(e.key==='Escape'){ta.blur();return}
  if(e.key==='Enter'&&!e.shiftKey&&it.list){const v=ta.value,s=ta.selectionStart,ls=v.lastIndexOf('\n',s-1)+1,line=v.slice(ls,s),m=it.list==='num'?line.match(/^(\d+)\.\s/):line.match(/^•\s/);
   if(m){e.preventDefault();if(line.length===m[0].length){ta.value=v.slice(0,ls)+v.slice(s);ta.setSelectionRange(ls,ls)}else{const nx=it.list==='num'?(+m[1]+1)+'. ':'• ',ins='\n'+nx;ta.value=v.slice(0,s)+ins+v.slice(ta.selectionEnd);ta.setSelectionRange(s+ins.length,s+ins.length)}it.text=ta.value;vTaPlace()}}}}
function vTextEnd(){const ta=$('#vta');if(!ta||!V.edit)return;const id=V.edit,it=V.e.items.find(x=>x.id===id);V.edit=null;if(it)it.text=ta.value;ta.onblur=null;ta.remove();
 if(it&&!it.text.trim()){V.e.items=V.e.items.filter(x=>x!==it);V.sel=null}else if(it)fixTx(it);
 const b=V.preT;V.preT=null;if(b)vPush(b);vProps();vOv()}
/* pointer */
function vBind(){const st=$('#vs');if(!st)return;st.onpointerdown=vPD;st.onpointermove=vPM;st.onpointerup=vPU;st.onpointercancel=vPU;st.ondblclick=vDbl;st.oncontextmenu=e=>{e.preventDefault();if(V.draft&&V.tool==='poly')vFinishPoly()};
 st.addEventListener('wheel',e=>{e.preventDefault();const r=st.getBoundingClientRect();if(e.shiftKey)V.x-=(e.deltaY||e.deltaX);else if(e.ctrlKey)V.y-=e.deltaY;else if(Math.abs(e.deltaX)>Math.abs(e.deltaY))V.x-=e.deltaX;else zoomAt(e.clientX-r.left,e.clientY-r.top,Math.exp(-e.deltaY*(e.deltaMode?.05:.0017)));vDraw()},{passive:false})}
function vPinchInit(){const a=[...V.ptr.values()];return{d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1,cx:(a[0].x+a[1].x)/2,cy:(a[0].y+a[1].y)/2,k:V.k,x:V.x,y:V.y}}
function vPD(e){if(e.target.id==='vta')return;const st=$('#vs');try{st.setPointerCapture(e.pointerId)}catch(_){}V.ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(V.ptr.size===2){vCancelDraft();V.pinch=vPinchInit();return}if(V.ptr.size>2||e.button===2)return;if(V.edit)vTextEnd();
 const P=toPage(e),tg=e.target.closest&&e.target.closest('[data-h],[data-p],[data-id],[data-m]'),it=V.sel&&V.e.items.find(x=>x.id===V.sel);
 const sx=e.clientX,sy=e.clientY,before=vSnap();
 if(e.button===1){V.drag={m:'pan',sx,sy,x:V.x,y:V.y};return}
 if(tg&&tg.dataset.h!==undefined&&it){V.drag={m:'rs',hi:+tg.dataset.h,orig:JSON.stringify(it),before};return}
 if(tg&&tg.dataset.p!==undefined&&it){V.drag={m:'pt',pi:+tg.dataset.p,orig:JSON.stringify(it),before};return}
 const t=V.tool;
 if(t==='sel'){if(tg&&tg.dataset.id){V.sel=tg.dataset.id;const c=V.e.items.find(x=>x.id===V.sel);V.drag={m:'mv',sx:P.x,sy:P.y,orig:JSON.stringify(c),before};vTools();vProps();vOv();return}
  if(tg&&tg.dataset.m){V.drag={m:'mk',id:tg.dataset.m,sx,sy};return}
  if(V.sel){V.sel=null;vTools();vProps();vOv()}V.drag={m:'pan',sx,sy,x:V.x,y:V.y};return}
 if(t==='text'){const D=vDef('text'),n={id:uid(),t:'text',pg:V.pg,x:P.x,y:P.y,w:V.pw/6,h:0,text:'',...D};V.preT=vSnap();V.e.items.push(n);V.sel=n.id;V.tool='sel';vTools();vProps();vTextEdit(n.id);e.preventDefault();return}
 if(t==='poly'){if(!V.draft)V.draft={t:'poly',pg:V.pg,id:uid(),...vDef('poly'),p:[P.x,P.y]};else V.draft.p.push(P.x,P.y);V.cur=P;vOv();return}
 if(t==='pen'){V.draft={t:'pen',pg:V.pg,id:uid(),...vDef('pen'),p:[P.x,P.y]};V.drag={m:'draw'};return}
 if(t==='line'){V.draft={t:'line',pg:V.pg,id:uid(),...vDef('line'),p:[P.x,P.y,P.x,P.y]};V.drag={m:'draw',x0:P.x,y0:P.y};return}
 if(t==='tag'||isBB(t)){V.draft={t,pg:V.pg,id:uid(),...(t==='tag'?{}:vDef(t)),x:P.x,y:P.y,w:0,h:0};V.drag={m:'draw',x0:P.x,y0:P.y}}}
function vPM(e){if(!V.ptr.has(e.pointerId))return;V.ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(V.pinch&&V.ptr.size===2){const a=[...V.ptr.values()],p=V.pinch,d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1,r=$('#vs').getBoundingClientRect(),cx=(a[0].x+a[1].x)/2,cy=(a[0].y+a[1].y)/2,nk=Math.min(Math.max(p.k*d/p.d,V.fit*.15),V.fit*400),f=nk/p.k;
  V.k=nk;V.x=(cx-r.left)-((p.cx-r.left)-p.x)*f;V.y=(cy-r.top)-((p.cy-r.top)-p.y)*f;vDraw();return}
 const d=V.drag,P=toPage(e);
 if(!d){if(V.tool==='poly'&&V.draft){V.cur=P;vOvSoon()}return}
 if(d.m==='pan'){V.x=d.x+e.clientX-d.sx;V.y=d.y+e.clientY-d.sy;vDraw();return}
 if(d.m==='mk'){return}
 const it=V.sel&&V.e.items.find(x=>x.id===V.sel);
 if(d.m==='draw'){const f=V.draft;if(!f)return;if(f.t==='pen')f.p.push(P.x,P.y);else if(f.t==='line'){f.p[2]=P.x;f.p[3]=P.y}else{f.x=Math.min(d.x0,P.x);f.y=Math.min(d.y0,P.y);f.w=Math.abs(P.x-d.x0);f.h=Math.abs(P.y-d.y0)}vOvSoon();return}
 if(!it)return;const o=JSON.parse(d.orig);
 if(d.m==='mv'){const dx=P.x-d.sx,dy=P.y-d.sy;if(isBB(it.t)){it.x=o.x+dx;it.y=o.y+dy}else it.p=o.p.map((v,i)=>v+(i%2?dy:dx));vOvSoon();return}
 if(d.m==='pt'){it.p[d.pi*2]=P.x;it.p[d.pi*2+1]=P.y;vOvSoon();return}
 if(d.m==='rs'){let[a,b,c,dd]=[o.x,o.y,o.x+o.w,o.y+(o.h||0)];const hi=d.hi;if(hi===0||hi===3)a=P.x;else c=P.x;if(it.t!=='text'){if(hi===0||hi===1)b=P.y;else dd=P.y}
  it.x=Math.min(a,c);it.w=Math.max(Math.abs(c-a),it.t==='text'?vu()*20:1);if(it.t==='text')fixTx(it);else{it.y=Math.min(b,dd);it.h=Math.abs(dd-b)}vOvSoon()}}
function vPU(e){V.ptr.delete(e.pointerId);if(V.pinch){if(V.ptr.size<2)V.pinch=null;V.drag=null;return}const d=V.drag;V.drag=null;if(!d)return;
 if(d.m==='mk'){if(Math.hypot(e.clientX-d.sx,e.clientY-d.sy)<6)markMenu(d.id);return}
 if(d.m==='mv'||d.m==='rs'||d.m==='pt'){vPush(d.before);vOv();return}
 if(d.m==='draw'&&V.draft){const f=V.draft;V.draft=null;const k=V.k;
  if(f.t==='tag'){if(f.w*k>8&&f.h*k>8)vTagDone(f);else vOv();return}
  const ok=f.t==='pen'?f.p.length>=4:f.t==='line'?Math.hypot(f.p[2]-f.p[0],f.p[3]-f.p[1])*k>6:(f.w*k>5&&f.h*k>5);
  if(!ok){vOv();return}if(f.t==='pen'){const q=[f.p[0],f.p[1]];for(let i=2;i<f.p.length;i+=2)if(Math.hypot(f.p[i]-q[q.length-2],f.p[i+1]-q[q.length-1])*k>2||i>=f.p.length-2)q.push(f.p[i],f.p[i+1]);f.p=q}
  const b=vSnap();V.e.items.push(f);V.sel=f.id;V.tool='sel';vPush(b);vTools();vProps();vOv()}}
function vFinishPoly(){const f=V.draft;if(!f)return;const p=[];for(let i=0;i<f.p.length;i+=2){if(i&&Math.hypot(f.p[i]-p[p.length-2],f.p[i+1]-p[p.length-1])*V.k<4)continue;p.push(f.p[i],f.p[i+1])}V.draft=null;V.cur=null;if(p.length<4){vOv();return}f.p=p;const b=vSnap();V.e.items.push(f);V.sel=f.id;V.tool='sel';vPush(b);vTools();vProps();vOv()}
function vDbl(e){if(V.tool==='poly'&&V.draft){vFinishPoly();return}const tg=e.target.closest&&e.target.closest('[data-id]');if(tg&&V.tool==='sel'){const it=V.e.items.find(x=>x.id===tg.dataset.id);if(it&&it.t==='text'){V.preT=vSnap();vTextEdit(it.id)}}}
function vKey(e){if(!V||tab!=='v')return;const tn=(e.target.tagName||'').toLowerCase();if(tn==='textarea'||(tn==='input'&&e.target.type!=='range'&&e.target.type!=='checkbox'&&e.target.type!=='color'))return;
 const c=e.ctrlKey||e.metaKey,k=e.key.toLowerCase();
 if(c&&k==='z'&&!e.shiftKey){e.preventDefault();vUndo()}else if(c&&(k==='y'||(k==='z'&&e.shiftKey))){e.preventDefault();vRedo()}
 else if((e.key==='Delete'||e.key==='Backspace')&&V.sel){e.preventDefault();vDel()}
 else if(e.key==='Escape'){if(V.draft&&V.tool==='poly')vFinishPoly();else{vCancelDraft();V.sel=null;V.tool='sel';vTools();vProps();vOv()}}
 else if(e.key==='Enter'&&V.sel){const it=V.e.items.find(x=>x.id===V.sel);if(it&&it.t==='text'){e.preventDefault();V.preT=vSnap();vTextEdit(it.id)}}}
document.addEventListener('keydown',vKey);addEventListener('resize',()=>{if(V&&tab==='v'&&V.page){V.r=null;vDraw()}});
/* text layer data */
async function vText(pg){if(V.txt[pg])return V.txt[pg];const p=await V.pdf.getPage(pg),vp=p.getViewport({scale:1}),tc=await p.getTextContent(),a=[];
 for(const it of tc.items){if(!it.str||!it.str.trim())continue;const t=pdfjsLib.Util.transform(vp.transform,it.transform),h=Math.hypot(t[2],t[3])||8;a.push({s:it.str,x:t[4],y:t[5]-h,w:it.width||h*it.str.length*.5,h})}return V.txt[pg]=a}
async function vFind(name){const n=s=>nrm(s).replace(/[^\p{L}\p{N}]/gu,''),t=n(name);if(!t)return;
 for(let pg=1;pg<=V.np;pg++){const it=(await vText(pg)).find(x=>n(x.s).includes(t));if(it){V.hl={pg,x:it.x,y:it.y,w:it.w,h:it.h};if(pg!==V.pg)await vPage(pg);const s=$('#vs'),k=Math.max(V.fit,Math.min(s.clientWidth/(Math.max(it.w,it.h*4)*7),V.fit*80));V.k=k;V.x=s.clientWidth/2-(it.x+it.w/2)*k;V.y=s.clientHeight/2-(it.y+it.h/2)*k;vDraw();return}}
 const m=$('#vmsg');if(m)m.textContent='לא נמצא הטקסט «'+name+'» בקובץ'}
async function vInit(){if(!V)return;vBind();vTools();vProps();const st=$('#vs');
 try{if(!V.pdf){V.lp=V.lp||vLoad();await V.lp}else{V.r=null;vDraw()}}catch(e){V.lp=null;if(st)st.innerHTML=`<div class="warn" style="margin:16px">${e==='bad'?'לא ניתן לפתוח את קובץ ה-PDF (ייתכן שהקובץ פגום).':'הקובץ לא נמצא במכשיר הזה — העלה אותו שוב בלשונית תוכניות/סכמות (או התחבר לענן).'}</div>`;return}
 if(V.first){V.first=false;vFit();vDraw();if(V.find)vFind(V.find)}vOv()}
/* schematic marks */
async function vTagDone(f){const r={x:f.x/V.pw*100,y:f.y/V.ph*100,w:f.w/V.pw*100,h:f.h/V.ph*100},tx=(await vText(V.pg)).filter(i=>{const cx=i.x+i.w/2,cy=i.y+i.h/2;return cx>=f.x&&cx<=f.x+f.w&&cy>=f.y&&cy<=f.y+f.h}).sort((a,b)=>Math.abs(a.y-b.y)<a.h/2?a.x-b.x:a.y-b.y).map(i=>i.s.trim()).join(' ');
 const o=await choosePanel({prefill:tx.slice(0,60),b:V.G.b});vOv();if(!o)return;let id=o.pid;if(o.nn){id=uid();S.p.push({id,name:o.nn,desc:'',b:V.G.b,f:'',dwg:''})}V.G.marks.push({id:uid(),pg:V.pg,pid:id,...r});save();vOv()}
function markMenu(id){const m=V.G.marks.find(x=>x.id===id);if(!m)return;const p=S.p.find(x=>x.id===m.pid),b=(a)=>`this.closest('dialog').close();mkAct('${a}','${id}')`;
 info(esc(p?p.name:'סימון ללא לוח'),(p?`${esc(p.desc)}<div class="sub">${esc(bn(p.b))} · ${p.f?'קומה '+esc(p.f):'ללא קומה'} · ${has(p)?esc(st(p)):'חסר תוכנית'}</div>`:'<div class="warn">הסימון לא מקושר ללוח</div>')+`<div class="acts" style="margin-top:12px">${p?`<button class="pri" onclick="${b('open')}">${IC.file}פתח תוכנית</button><button onclick="${b('edit')}">${IC.edit}ערוך לוח</button>`:''}<button onclick="${b('re')}">שנה לוח מקושר</button><button class="danger" onclick="${b('del')}">${IC.trash}מחק סימון</button></div>`)}
async function mkAct(a,id){const m=V.G.marks.find(x=>x.id===id);if(!m)return;
 if(a==='open')return openP(m.pid);if(a==='edit')return editP(m.pid);
 if(a==='del'){V.G.marks=V.G.marks.filter(x=>x!==m);save();vOv();return}
 const o=await choosePanel({prefill:'',b:V.G.b,cur:m.pid});if(!o)return;let pid=o.pid;if(o.nn){pid=uid();S.p.push({id:pid,name:o.nn,desc:'',b:V.G.b,f:'',dwg:''})}m.pid=pid;save();vOv()}
function choosePanel(o){return new Promise(res=>{const d=document.createElement('dialog');d.style.width='min(560px,96vw)';let sort='rel',val=o.prefill||'';
 d.innerHTML=`<h3>איזה לוח זה?</h3><div class="bar" style="margin:8px 0"><input id="cq" placeholder="חיפוש חכם: מספר, שם, בניין, קומה..." value="${esc(val)}"><select id="cs"><option value="rel">רלוונטיות</option><option value="bld">בניין וקומה</option><option value="name">שם</option></select></div><div class="implist" id="cl" style="max-height:44vh"></div><label class="f">או שם לוח חדש<div class="acts" style="margin-top:5px"><input id="cn" style="flex:1" placeholder="שם לוח חדש"><button id="cc">צור</button></div></label><div class="dact"><button id="cx">ביטול</button></div>`;
 document.body.append(d);let done=false;const fin=v=>{if(done)return;done=true;d.close();res(v)};d.onclose=()=>{d.remove();if(!done){done=true;res(null)}};
 const draw=()=>{const L=rankP(S.p,$('#cq').value,$('#cs').value).slice(0,60),c=d.querySelector('#cl');
  c.innerHTML=L.map(p=>`<button class="rs ${p.id===o.cur?'on':''}" data-id="${p.id}"><b>${esc(p.name)}</b><span>${esc(p.desc)}</span><small>${esc(bn(p.b))} · ${p.f?'קומה '+esc(p.f):'ללא קומה'} · ${has(p)?esc(st(p)):'חסר'}</small></button>`).join('')||'<div class="sub" style="padding:10px">אין תוצאות — אפשר ליצור לוח חדש למטה</div>';
  c.querySelectorAll('.rs').forEach(b=>b.onclick=()=>fin({pid:b.dataset.id}))};
 d.querySelector('#cq').oninput=draw;d.querySelector('#cs').onchange=draw;d.querySelector('#cx').onclick=()=>fin(null);d.querySelector('#cc').onclick=()=>{const n=d.querySelector('#cn').value.trim();if(n)fin({nn:n})};
 d.showModal();draw();d.querySelector('#cq').focus()})}
/* simple scrolling preview (import dialog) */
async function previewPdf(file,name){const d=document.createElement('dialog');d.className='pvd';let z=1;
 d.innerHTML=`<div class="row"><h3 style="margin:0">${esc(name||file.name)}</h3><div class="acts"><button class="ic" id="pz-" aria-label="הקטן">${IC.minus}</button><span class="sub" id="pzl">100%</span><button class="ic" id="pz+" aria-label="הגדל">${IC.plus}</button><button class="pri" id="pcl">סגור</button></div></div><div class="pvb" id="pvb"></div>`;
 document.body.append(d);d.onclose=()=>{d.remove();try{pdf&&pdf.destroy()}catch(e){}};d.querySelector('#pcl').onclick=()=>d.close();d.showModal();let pdf=null,gen=0;
 const draw=async()=>{const my=++gen,b=d.querySelector('#pvb');b.innerHTML='<div class="sub" style="padding:20px">טוען...</div>';try{if(!pdf)pdf=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise}catch(e){b.innerHTML='<div class="warn">לא ניתן להציג את הקובץ</div>';return}
  b.innerHTML='';const w=(b.clientWidth-4)*z,dpr=Math.min(devicePixelRatio||1,2);for(let i=1;i<=pdf.numPages;i++){if(my!==gen)return;const pg=await pdf.getPage(i),v1=pg.getViewport({scale:1});let sc=w/v1.width*dpr;const mx=Math.sqrt(36e6/(v1.width*v1.height));sc=Math.min(sc,mx);const vp=pg.getViewport({scale:sc}),c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;c.style.width=w+'px';c.style.height=w*v1.height/v1.width+'px';b.append(c);await pg.render({canvasContext:c.getContext('2d'),viewport:vp}).promise}};
 const zz=f=>{z=Math.min(4,Math.max(.5,z*f));d.querySelector('#pzl').textContent=Math.round(z*100)+'%';draw()};d.querySelector('#pz-').onclick=()=>zz(1/1.3);d.querySelector('#pz+').onclick=()=>zz(1.3);draw()}
