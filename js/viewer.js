/* PDF viewer: vector zoom, pan, annotations, schematic marks */
Object.assign(IC,{pen:IC.edit,
 cur:svg('<path d="m3 3 7 18 2.5-7.5L20 11z"/>'),txt:svg('<path d="M4 7V4h16v3M9 20h6M12 4v16"/>'),
 hl:svg('<path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>'),
 ln:svg('<path d="M5 19 19 5"/>'),pl:svg('<path d="M3 18l6-9 5 6 7-10"/>'),ell:svg('<circle cx="12" cy="12" r="9"/>'),rc:svg('<rect x="3" y="4" width="18" height="16" rx="2"/>'),
 undo:svg('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>'),redo:svg('<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>'),
 fit:svg('<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>'),
 tag:svg('<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><path d="M7 7h.01"/>'),
 ext:svg('<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'),
 prev:svg('<path d="m9 18 6-6-6-6"/>'),next:svg('<path d="m15 18-6-6 6-6"/>'),
 expand:svg('<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l-7-7"/>'.replace('l-7-7','l7-7')),shrink:svg('<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>'),
 chevD:svg('<path d="m6 9 6 6 6-6"/>'),chevU:svg('<path d="m18 15-6-6-6 6"/>'),
 ul:svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),ol:svg('<path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>'),
 menu:svg('<path d="M3 6h18M3 12h18M3 18h18"/>'),er:svg('<path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4l9.6-9.6a1 1 0 0 1 1.4 0l5.6 5.6a1 1 0 0 1 0 1.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>')});
let V=null;const ANDEF={};
const TOOLS=[['sel','בחירה','cur'],['text','טקסט','txt'],['mark','מרקר','hl'],['line','קו','ln'],['poly','קו מתפצל','pl'],['pen','עט','pen'],['ell','עיגול','ell'],['rect','מרובע','rc'],['erase','מחיקה','er']];
const aEntry=k=>{let e=S.a.find(x=>x.id===k);if(!e){e={id:k,items:[]};S.a.push(e)}return e};
const rgba=(h,a)=>{h=String(h||'#fff').replace('#','');if(h.length===3)h=h.replace(/./g,'$&$&');const n=parseInt(h,16)||0;return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`};
function openDoc(o){if(V&&V.key===o.key&&!!V.G===!!o.G){V.G=o.G||V.G;V.title=o.title||V.title;V.find=o.find;go('v');return}
 if(V){try{V.pdf&&V.pdf.destroy()}catch(e){}}
 V={key:'',title:'',G:null,file:null,pg:1,k:1,x:0,y:0,fit:1,tool:'sel',sel:null,undo:[],redo:[],pdf:null,pages:null,px:{},txt:{},ap:1,gen:0,ptr:new Map(),draft:null,drag:null,edit:null,first:true,fs:false,fsm:false,tl:true,dr:false,...o};V.e=aEntry(V.key);go('v')}
function vClose(){if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});V.fs=false;if(history.state&&history.state.t==='v')history.back();else{tab=V.from||'d';render()}}
const vOpenRevTitle=k=>{const d=S.d.find(d=>d.revs.some(r=>r.key===k));return d?d.num+(d.name?' · '+d.name:''):'תוכנית'};
const vDoc=()=>V&&!V.G?S.d.find(d=>d.revs.some(r=>r.key===V.key)):null;
function vV(){return`<div class="vw ${V.fs?'fs':''} ${V.fsm?'fsm':''} ${V.tl?'':'notl'}" id="vw"><div class="vhead"><div class="vt1"><button class="ic" onclick="vClose()" title="חזרה" aria-label="חזרה">${IC.back}</button><h1 class="vtitle" id="vtitle">${esc(V.title)}</h1><div class="acts"><button class="ic ${V.dr?'pri':''}" onclick="vDrawerT()" title="פרטי התוכנית ועריכה" aria-label="פרטים">${IC.menu}</button><button class="ic" onclick="vTlT()" title="הצג / הסתר כלי עריכה" aria-label="כלים">${V.tl?IC.chevU:IC.chevD}</button><button class="ic" onclick="vFs()" title="מסך מלא" aria-label="מסך מלא">${IC.expand}</button></div></div></div>
<div class="vtl"><div class="vgrp" id="vtools"></div><div class="vgrp"><button class="ic" onclick="vZoomBtn(1/1.3)" aria-label="הקטן">${IC.minus}</button><span class="sub" id="vzl" style="min-width:46px;text-align:center"></span><button class="ic" onclick="vZoomBtn(1.3)" aria-label="הגדל">${IC.plus}</button><button class="ic" onclick="vFit();vDraw()" title="התאם את התוכנית למסך" aria-label="התאם למסך">${IC.fit}</button></div><div class="vgrp"><button class="ic" onclick="vUndo()" title="בטל (Ctrl+Z)" aria-label="בטל">${IC.undo}</button><button class="ic" onclick="vRedo()" title="חזור (Ctrl+Y)" aria-label="חזור">${IC.redo}</button><button class="ic" onclick="vExt()" title="פתח את הקובץ בחלון חדש" aria-label="חלון חדש">${IC.ext}</button></div><span class="sub" id="vpg"></span></div>
<div class="vstage" id="vs"><canvas id="vc"></canvas><svg id="vsvg" xmlns="http://www.w3.org/2000/svg"><g id="vg"></g></svg><div class="vprops" id="vprops"></div><div class="vtoast" id="vtoast"></div></div>
<aside class="vdrawer" id="vdrawer" ${V.dr?'':'hidden'}></aside>
<button class="vfab f1" onclick="vFs()" title="יציאה ממסך מלא" aria-label="יציאה ממסך מלא">${IC.shrink}</button><button class="vfab f2" onclick="vFsMenu()" title="תפריט כלים" aria-label="תפריט כלים">${IC.chevD}</button></div>`}
const vToast=m=>{const e=$('#vtoast');if(!e)return;e.textContent=m;e.classList.add('on');clearTimeout(V.tt);V.tt=setTimeout(()=>e.classList.remove('on'),3500)};
function vFs(){V.fs=!V.fs;V.fsm=false;const w=$('#vw');if(w){w.classList.toggle('fs',V.fs);w.classList.remove('fsm')}
 if(V.fs){document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen().catch(()=>{})}else if(document.fullscreenElement)document.exitFullscreen().catch(()=>{})}
const vFsMenu=()=>{V.fsm=!V.fsm;$('#vw').classList.toggle('fsm',V.fsm)};
function vTlT(){V.tl=!V.tl;$('#vw').classList.toggle('notl',!V.tl);render()}
function vDrawerT(){V.dr=!V.dr;const d=$('#vdrawer');d.hidden=!V.dr;if(V.dr)vDrawer();vSoft()}
document.addEventListener('fullscreenchange',()=>{if(V&&V.fs&&!document.fullscreenElement){V.fs=false;const w=$('#vw');if(w)w.classList.remove('fs','fsm')}});
function vSoft(){if(!V)return;const t=$('#vtitle');if(t)t.textContent=V.title;vTools();vProps();vOv();if(V.dr)vDrawer()}
const GAP=28,vpg=n=>V.pages[n-1];
async function vLoad(){let f=V.file||await idb('get',V.key).catch(()=>null)||await dlFile(V.key);if(!f)throw 'missing';V.file=f;try{V.pdf=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise}catch(e){throw 'bad'}V.np=V.pdf.numPages;
 const ps=await Promise.all(Array.from({length:V.np},(_,i)=>V.pdf.getPage(i+1)));let y=0;V.W=0;ps.forEach(p=>{V.W=Math.max(V.W,p.getViewport({scale:1}).width)});
 V.pages=ps.map((p,i)=>{V.px[i+1]=p;const v=p.getViewport({scale:1}),o={n:i+1,w:v.width,h:v.height,x:(V.W-v.width)/2,y};y+=v.height+GAP;return o});V.H=y-GAP;vFit();vDraw()}
const pageAtW=wy=>{let b=V.pages[0],bd=1e18;for(const p of V.pages){if(wy>=p.y&&wy<=p.y+p.h)return p;const d=Math.min(Math.abs(wy-p.y),Math.abs(wy-p.y-p.h));if(d<bd){bd=d;b=p}}return b};
function vFit(){const s=$('#vs');if(!s||!V.pages)return;const sw=s.clientWidth,sh=s.clientHeight;if(V.np===1){V.fit=Math.min(sw/V.W,sh/V.H)*.97;V.k=V.fit;V.x=(sw-V.W*V.k)/2;V.y=(sh-V.H*V.k)/2}else{V.fit=sw/V.W*.97;V.k=V.fit;V.x=(sw-V.W*V.k)/2;V.y=12}}
function vDraw(){if(!V||!V.pages)return;clearTimeout(V.rt);V.rt=setTimeout(()=>{vRender();vOv()},70);vTransform();vOvT();vTaPlace();const z=$('#vzl');if(z)z.textContent=Math.round(V.k/V.fit*100)+'%';const g=$('#vpg'),s=$('#vs');if(g&&s)g.textContent=V.np>1?'עמוד '+pageAtW((s.clientHeight/2-V.y)/V.k).n+' / '+V.np:''}
function vTransform(){const c=$('#vc');if(!c||!V.r)return;const r=V.r;c.style.transformOrigin='0 0';c.style.transform=`translate(${V.x}px,${V.y}px) scale(${V.k/r.k}) translate(${-r.x}px,${-r.y}px)`}
async function vRender(){const st=$('#vs'),c=$('#vc');if(!st||!c||!V||!V.pages)return;const dpr=Math.min(devicePixelRatio||1,3),sw=st.clientWidth,sh=st.clientHeight,my=++V.gen,u={x:V.x,y:V.y,k:V.k};
 const off=document.createElement('canvas');off.width=Math.max(1,Math.round(sw*dpr));off.height=Math.max(1,Math.round(sh*dpr));const cx=off.getContext('2d');
 const vis=V.pages.filter(p=>{const t=u.y+p.y*u.k,l=u.x+p.x*u.k;return t+p.h*u.k>0&&t<sh&&l+p.w*u.k>0&&l<sw});
 vis.forEach(p=>{cx.fillStyle='#fff';cx.fillRect((u.x+p.x*u.k)*dpr,(u.y+p.y*u.k)*dpr,p.w*u.k*dpr,p.h*u.k*dpr)});
 (V.tasks||[]).forEach(t=>{try{t.cancel()}catch(e){}});V.tasks=[];
 try{for(const p of vis){const pg=V.px[p.n],vp=pg.getViewport({scale:u.k*dpr,offsetX:(u.x+p.x*u.k)*dpr,offsetY:(u.y+p.y*u.k)*dpr}),tk=pg.render({canvasContext:cx,viewport:vp});V.tasks.push(tk);await tk.promise;if(my!==V.gen)return}}catch(e){return}
 if(my!==V.gen)return;c.width=off.width;c.height=off.height;c.style.width=sw+'px';c.style.height=sh+'px';c.getContext('2d').drawImage(off,0,0);V.r=u;vTransform()}
function zoomAt(cx,cy,f){const nk=Math.min(Math.max(V.k*f,V.fit*.15),V.fit*400),r=nk/V.k;V.x=cx-(cx-V.x)*r;V.y=cy-(cy-V.y)*r;V.k=nk}
function vZoomBtn(f){const s=$('#vs');zoomAt(s.clientWidth/2,s.clientHeight/2,f);vDraw()}
const vExt=()=>{if(V&&V.file)window.open(URL.createObjectURL(V.file),'_blank')};
const vu=()=>Math.max(1,V.W/700);
function vDef(t){const u=vu(),B={rect:{c:'#e11d48',sw:2*u,op:1,f:'',fo:.25},ell:{c:'#e11d48',sw:2*u,op:1,f:'',fo:.25},line:{c:'#e11d48',sw:2*u,op:1},poly:{c:'#e11d48',sw:2*u,op:1},pen:{c:'#2563eb',sw:2*u,op:1},mark:{c:'#ffe600',op:.4},text:{c:'#111111',fs:14*u,bg:'#ffffff',bgo:.9,bgOn:false,op:1}};return{...B[t],...(ANDEF[t]||{})}}
const vpt=e=>{const r=$('#vs').getBoundingClientRect();return{x:(e.clientX-r.left-V.x)/V.k,y:(e.clientY-r.top-V.y)/V.k}};
const toPage=e=>{const w=vpt(e),p=vpg(V.ap||1);return{x:w.x-p.x,y:w.y-p.y}};
const pts=p=>{let s='';for(let i=0;i<p.length;i+=2)s+=p[i]+','+p[i+1]+' ';return s};
const pathD=p=>{if(p.length<4)return`M${p[0]} ${p[1]}l0.01 0`;let d=`M${p[0]} ${p[1]}`;for(let i=2;i<p.length;i+=2)d+=`L${p[i]} ${p[i+1]}`;return d};
const isBB=t=>t==='rect'||t==='ell'||t==='mark'||t==='text';
const vSel=()=>V.sel?V.e.items.find(x=>x.id===V.sel)||null:null;
function bbox(it){if(isBB(it.t))return[it.x,it.y,it.x+it.w,it.y+(it.h||0)];const p=it.p;let a=1e9,b=1e9,c=-1e9,d=-1e9;for(let i=0;i<p.length;i+=2){a=Math.min(a,p[i]);c=Math.max(c,p[i]);b=Math.min(b,p[i+1]);d=Math.max(d,p[i+1])}return[a,b,c,d]}
/* rich text */
const tHtml=it=>it.html!==undefined?it.html:esc(it.text||'').replace(/\n/g,'<br>');
function cleanHtml(h){const t=document.createElement('template');t.innerHTML=h;const OK=new Set(['B','I','U','S','STRONG','EM','SPAN','UL','OL','LI','DIV','BR','P']),SP=['color','background-color','font-weight','font-style','text-decoration','text-decoration-line'];
 const walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===1){walk(c);if(!OK.has(c.tagName)){c.replaceWith(...c.childNodes)}else{const st=c.getAttribute('style')||'';[...c.attributes].forEach(a=>c.removeAttribute(a.name));const keep=st.split(';').map(s=>s.trim()).filter(s=>SP.includes(s.split(':')[0].trim().toLowerCase())).join(';');if(keep)c.setAttribute('style',keep)}}else if(c.nodeType!==3)c.remove()})};walk(t.content);return t.innerHTML}
function txStyle(it){const fs=it.fs;return`font:400 ${fs}px/1.3 Heebo,system-ui,Arial,sans-serif;color:${it.c};background:${it.bgOn?rgba(it.bg,it.bgo):'transparent'};padding:${fs*.25}px ${fs*.4}px;border-radius:${fs*.2}px;word-break:break-word;box-sizing:border-box;width:${it.w}px`}
function fixTx(it){const d=document.createElement('div');d.dir='auto';d.className='vtx';d.style.cssText=txStyle(it)+';position:absolute;visibility:hidden;left:-9999px';d.innerHTML=tHtml(it)||' ';document.body.append(d);it.h=Math.max(it.fs*1.6,d.offsetHeight);d.remove()}
function itemSvg(it,k){const hw=Math.max(it.sw||0,12/k),o=`opacity="${it.op??1}"`;
 if(it.t==='text')return`<foreignObject x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h||it.fs*2}" style="overflow:visible"><div dir="auto" class="vtx" style="${txStyle(it)};opacity:${it.op}">${tHtml(it)}</div></foreignObject>`;
 const sh=a=>{switch(it.t){case'rect':case'mark':return`<rect x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" ${a}/>`;case'ell':return`<ellipse cx="${it.x+it.w/2}" cy="${it.y+it.h/2}" rx="${it.w/2}" ry="${it.h/2}" ${a}/>`;case'line':return`<line x1="${it.p[0]}" y1="${it.p[1]}" x2="${it.p[2]}" y2="${it.p[3]}" ${a}/>`;case'poly':return it.closed?`<polygon points="${pts(it.p)}" ${a}/>`:`<polyline points="${pts(it.p)}" ${a}/>`;default:return`<path d="${pathD(it.p)}" ${a}/>`}};
 const lin=it.t==='line'||it.t==='poly'||it.t==='pen',filled=it.t==='mark'||((it.t==='rect'||it.t==='ell')&&it.f);
 const vis=it.t==='mark'?`fill="${it.c}" fill-opacity="${it.op}" style="mix-blend-mode:multiply"`:lin?`fill="none" stroke="${it.c}" stroke-width="${it.sw}" stroke-linecap="round" stroke-linejoin="round" ${o}`:`fill="${it.f||'none'}" fill-opacity="${it.fo}" stroke="${it.c}" stroke-width="${it.sw}" ${o}`;
 return sh(vis)+sh(`fill="${filled?'#000':'none'}" fill-opacity="0" stroke="#000" stroke-opacity="0" stroke-width="${hw}" pointer-events="${filled?'all':'stroke'}"`)}
function marksSvg(){if(!V.G)return'';const live=V.tool==='sel'||V.tool==='tag';return V.pages.map(p=>{const ms=V.G.marks.filter(m=>m.pg==p.n);if(!ms.length)return'';return`<g transform="translate(${p.x} ${p.y})">`+ms.map(m=>{const pn=S.p.find(x=>x.id===m.pid),ok=pn&&has(pn),x=m.x/100*p.w,y=m.y/100*p.h,w=m.w/100*p.w,h=m.h/100*p.h,n=pn?pn.name:'?',fs=Math.max(6,Math.min(h*.55,w/Math.max(2,n.length*.62),p.w/30));
 return`<g data-m="${m.id}" ${live?'':'pointer-events="none"'}><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${ok?S.c.ok:S.c.miss}" fill-opacity=".62" stroke="${ok?'#2e8b4a':'#c0392b'}" stroke-width="${2/V.k}"/><foreignObject x="${x}" y="${y}" width="${w}" height="${h}"><div style="display:flex;align-items:center;justify-content:center;height:100%;overflow:hidden;font:700 ${fs}px/1 Heebo,system-ui,Arial;color:#000;pointer-events:none">${esc(n)}</div></foreignObject></g>`}).join('')+'</g>'}).join('')}
function selSvg(){const it=vSel();if(!it)return'';const k=V.k,[a,b,c,d]=bbox(it),hs=10/k,pad=4/k;
 let s=`<rect x="${a-pad}" y="${b-pad}" width="${c-a+2*pad}" height="${d-b+2*pad}" fill="none" stroke="#2563eb" stroke-width="${1.5/k}" stroke-dasharray="${5/k} ${4/k}" pointer-events="none"/>`;
 if(isBB(it.t))[[a,b],[c,b],[c,d],[a,d]].forEach((q,i)=>{s+=`<rect data-h="${i}" x="${q[0]-hs/2}" y="${q[1]-hs/2}" width="${hs}" height="${hs}" fill="#fff" stroke="#2563eb" stroke-width="${1.5/k}" style="cursor:nwse-resize"/>`});
 else if(it.t!=='pen')for(let i=0;i<it.p.length;i+=2)s+=`<circle data-p="${i/2}" cx="${it.p[i]}" cy="${it.p[i+1]}" r="${hs/2}" fill="#fff" stroke="#2563eb" stroke-width="${1.5/k}" style="cursor:move"/>`;const pp=vpg(it.pg);return`<g transform="translate(${pp.x} ${pp.y})">${s}</g>`}
function draftSvg(){const d=V.draft;if(!d)return'';const pp=vpg(d.pg||V.ap),W=s=>`<g transform="translate(${pp.x} ${pp.y})">${s}</g>`;if(d.t==='tag')return W(`<rect x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}" fill="#1f3a5f22" stroke="#1f3a5f" stroke-width="${2/V.k}" stroke-dasharray="${6/V.k}"/>`);
 let it=d;if(d.t==='poly'&&V.cur)it={...d,p:[...d.p,V.cur.x,V.cur.y]};return W(`<g pointer-events="none">${itemSvg(it,V.k)}</g>`)}
function hlSvg(){const h=V.hl;if(!h)return'';const p=8/V.k,pp=vpg(h.pg);return`<g transform="translate(${pp.x} ${pp.y})"><rect x="${h.x-p}" y="${h.y-p}" width="${h.w+2*p}" height="${h.h+2*p}" fill="#ffd54a44" stroke="#e11d48" stroke-width="${3/V.k}" rx="${4/V.k}" pointer-events="none"><animate attributeName="opacity" values="1;.25;1" dur="1.2s" repeatCount="5"/></rect></g>`}
function vOvT(){const g=$('#vg');if(g)g.setAttribute('transform',`translate(${V.x} ${V.y}) scale(${V.k})`)}
function vOv(){const g=$('#vg');if(!g||!V||!V.pages)return;vOvT();g.innerHTML=marksSvg()+V.pages.map(p=>{const its=V.e.items.filter(i=>i.pg===p.n&&i.id!==V.edit);return its.length?`<g transform="translate(${p.x} ${p.y})">${its.map(i=>`<g data-id="${i.id}">${itemSvg(i,V.k)}</g>`).join('')}</g>`:''}).join('')+hlSvg()+draftSvg()+selSvg()}
const vOvSoon=()=>{if(V.raf)return;V.raf=requestAnimationFrame(()=>{V.raf=0;if(V)vOv()})};
/* tools + props */
function vTools(){const e=$('#vtools');if(!e)return;e.innerHTML=TOOLS.map(([id,l,ic])=>`<button class="tl ${V.tool===id?'on':''}" onclick="vTool('${id}')">${IC[ic]}<span>${l}</span></button>`).join('')+(V.G?`<span class="sep"></span><button class="tl ${V.tool==='tag'?'on':''}" onclick="vTool('tag')">${IC.tag}<span>סימון לוח</span></button>`:'')+`<span class="sep"></span><button class="tl danger" ${V.sel?'':'disabled'} onclick="vDel()">${IC.trash}<span>מחק</span></button>`;
 const s=$('#vs');if(s)s.className='vstage '+(V.tool==='sel'?'t-sel':'t-draw')}
function vTool(t){if(V.edit)vTextEnd();vCancelDraft();V.tool=t;if(t!=='sel')V.sel=null;vTools();vProps();vOv()}
function vCancelDraft(){clearTimeout(V.hold);V.draft=null;V.cur=null;V.drag=null}
function vTarget(){const s=vSel();if(s)return s;if(V.tool!=='sel'&&V.tool!=='tag'&&V.tool!=='erase')return{t:V.tool,...vDef(V.tool),_def:1};return null}
const NP='onmousedown="event.preventDefault()"';
function vProps(){const e=$('#vprops');if(!e||!V)return;const it=vTarget();if(!it){e.innerHTML=V.tool==='tag'?'<span class="sub">גרור מלבן סביב לוח בסכמה ובחר איזה לוח זה. הטקסט שבתוך המלבן יוזן לחיפוש אוטומטית.</span>':'';e.style.display=V.tool==='tag'?'':'none';return}e.style.display='';
 const u=vu(),C=(l,k,v)=>`<span class="pp">${l}<button class="cbtn" style="background:${v}" ${NP} onclick="vCol(this,'${k}')" aria-label="${l}"></button></span>`,
 R=(l,k,v,a,b,s,pc)=>`<label class="pp">${l}<input type="range" min="${a}" max="${b}" step="${s}" value="${v}" oninput="vSet('${k}',+this.value);${pc?`this.nextElementSibling.textContent=Math.round(this.value*100)+'%'`:''}" onchange="vSet('${k}',+this.value,1)">${pc?`<span class="pv">${Math.round(v*100)}%</span>`:''}</label>`,
 K=(l,k,v)=>`<label class="pp tog"><input type="checkbox" ${v?'checked':''} onchange="vSet('${k}',this.checked,1)">${l}</label>`;
 const SW=['#ffe600','#7CFC00','#ff9800','#ff4fa3','#22d3ee'].map(c=>`<button class="swb" style="background:${c}" onclick="vSet('c','${c}',1)" aria-label="${c}"></button>`).join('');let h='';
 if(it.t==='text')h=`<button class="ic" ${NP} onclick="vFmt('bold')" title="מודגש"><b>B</b></button><button class="ic" ${NP} onclick="vFmt('italic')" title="נטוי"><i>I</i></button><button class="ic" ${NP} onclick="vFmt('underline')" title="קו תחתון"><u>U</u></button><button class="ic" ${NP} onclick="vFmt('insertUnorderedList')" title="רשימת נקודות">${IC.ul}</button><button class="ic" ${NP} onclick="vFmt('insertOrderedList')" title="רשימה ממוספרת">${IC.ol}</button><span class="sep"></span>`+C('צבע טקסט','tc',it.c)+(V.edit?C('סימון טקסט','hc','#ffe600'):'')+R('גודל','fs',it.fs,4*u,80*u,u/4)+K('רקע תיבה','bgOn',it.bgOn)+(it.bgOn?C('צבע רקע','bg',it.bg)+R('שקיפות רקע','bgo',it.bgo,0,1,.05,1):'')+R('שקיפות','op',it.op,0,1,.05,1);
 else if(it.t==='mark')h=C('צבע','c',it.c)+SW+R('שקיפות','op',it.op,0,1,.05,1);
 else{h=C('צבע קו','c',it.c)+R('עובי','sw',it.sw,.5*u,14*u,u/4)+R('שקיפות','op',it.op,0,1,.05,1);if(it.t==='rect'||it.t==='ell')h+=K('מילוי','fon',!!it.f)+(it.f?C('צבע מילוי','f',it.f)+R('שקיפות מילוי','fo',it.fo,0,1,.05,1):'')}
 e.innerHTML=h+(V.sel?`<button class="ic danger" onclick="vDel()" title="מחק (Delete)">${IC.trash}</button>`:'')}
function vCol(el,k){const it=vTarget();if(!it)return;
 if(k==='tc'){if(V.edit){vSaveRng();return cpick(el,it.c,{ok:c=>vFmt('foreColor',c)})}k='c'}
 if(k==='hc'){vSaveRng();return cpick(el,'#ffe600',{ok:c=>vFmt(document.queryCommandSupported('hiliteColor')?'hiliteColor':'backColor',c)})}
 const orig=it[k]||'#ffe600';cpick(el,orig,{live:c=>vSet(k,c),ok:c=>vSet(k,c,1),cancel:()=>{vSet(k,orig);V.pre=null;vOv();vProps()}})}
function vSaveRng(){const ed=$('#vta');if(!ed)return;const s=getSelection();if(s.rangeCount&&ed.contains(s.anchorNode))V.rng=s.getRangeAt(0).cloneRange()}
function vSet(k,v,fin){const it=vTarget();if(!it)return;if(V.sel&&!V.pre)V.pre=JSON.stringify(V.e.items);
 const D=ANDEF[it.t]=ANDEF[it.t]||{};
 if(k==='fon'){k='f';v=v?(D.f||'#ffe600'):''}
 if(V.sel)it[k]=v;D[k]=v;if(it.t==='text'&&V.sel&&k!=='c'&&k!=='op'&&k!=='bgo'&&k!=='bg'&&k!=='bgOn')fixTx(it);
 if(V.edit)vTaPlace();vOv();if(fin){if(V.sel){if(V.pre!==JSON.stringify(V.e.items)){V.undo.push(V.pre);V.redo=[];save()}V.pre=null}vProps()}}
function vFmt(cmd,val){const it=vSel();if(!it||it.t!=='text')return;let whole=false;if(!V.edit){vTextEdit(it.id,true);whole=true}
 const ed=$('#vta');if(V.rng&&!whole){ed.focus();const s=getSelection();s.removeAllRanges();s.addRange(V.rng)}V.rng=null;
 document.execCommand(cmd,false,val);it.html=cleanHtml(ed.innerHTML);vTaPlace();if(whole)vTextEnd()}
/* history */
const vSnap=()=>JSON.stringify(V.e.items);
function vPush(before){if(before!==vSnap()){V.undo.push(before);V.redo=[];if(V.undo.length>100)V.undo.shift();save()}vTools()}
function vUndo(){if(V.edit)return;if(!V.undo.length)return;V.redo.push(vSnap());V.e.items=JSON.parse(V.undo.pop());V.sel=null;save();vTools();vProps();vOv()}
function vRedo(){if(V.edit)return;if(!V.redo.length)return;V.undo.push(vSnap());V.e.items=JSON.parse(V.redo.pop());V.sel=null;save();vTools();vProps();vOv()}
function vDel(){if(!V.sel)return;const b=vSnap();V.e.items=V.e.items.filter(x=>x.id!==V.sel);V.sel=null;vPush(b);vProps();vOv()}
/* text editing (contenteditable) */
function vTaPlace(){const ed=$('#vta');if(!ed||!V.edit)return;const it=V.e.items.find(x=>x.id===V.edit);if(!it)return;const s=ed.style,pp=vpg(it.pg);s.left=V.x+(pp.x+it.x)*V.k+'px';s.top=V.y+(pp.y+it.y)*V.k+'px';s.width=it.w*V.k+'px';s.font=`400 ${it.fs*V.k}px/1.3 Heebo,system-ui,Arial,sans-serif`;s.color=it.c;s.background=it.bgOn?rgba(it.bg,Math.max(it.bgo,.5)):'#ffffffd9';s.padding=`${it.fs*.25*V.k}px ${it.fs*.4*V.k}px`}
function vTextEdit(id,all){const it=V.e.items.find(x=>x.id===id);if(!it)return;V.edit=id;if(!V.preT)V.preT=vSnap();V.sel=id;vOv();
 try{document.execCommand('styleWithCSS',false,true)}catch(e){}
 const ed=document.createElement('div');ed.id='vta';ed.className='vtx';ed.contentEditable='true';ed.dir='auto';ed.innerHTML=tHtml(it);$('#vs').append(ed);vTaPlace();ed.focus();
 const r=document.createRange();r.selectNodeContents(ed);if(!all)r.collapse(false);const s=getSelection();s.removeAllRanges();s.addRange(r);
 ed.oninput=()=>{it.html=cleanHtml(ed.innerHTML)};
 ed.onblur=()=>setTimeout(()=>{if(!V||V.edit!==id)return;const a=document.activeElement;if(a&&a.closest&&a.closest('.cpop,.vprops'))return;vTextEnd()},0);
 ed.onkeydown=e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();vTextEnd()}};vProps()}
function vTextEnd(){const ed=$('#vta');if(!ed||!V.edit)return;const id=V.edit,it=V.e.items.find(x=>x.id===id);V.edit=null;if(it)it.html=cleanHtml(ed.innerHTML);const empty=!ed.textContent.trim();ed.onblur=null;ed.remove();
 if(it&&empty){V.e.items=V.e.items.filter(x=>x!==it);V.sel=null}else if(it)fixTx(it);
 const b=V.preT;V.preT=null;if(b)vPush(b);vProps();vOv()}
/* geometry helpers */
const SN=(P,o,e)=>{if(!e||!e.shiftKey||!o)return P;const dx=P.x-o.x,dy=P.y-o.y,L=Math.hypot(dx,dy),a=Math.round(Math.atan2(dy,dx)/(Math.PI/4))*Math.PI/4;return{x:o.x+L*Math.cos(a),y:o.y+L*Math.sin(a)}};
const SQ=(P,o,e)=>{if(!e||!e.shiftKey)return P;const dx=P.x-o.x,dy=P.y-o.y,s=Math.max(Math.abs(dx),Math.abs(dy));return{x:o.x+(dx<0?-s:s),y:o.y+(dy<0?-s:s)}};
const lastPt=()=>V.draft&&V.draft.p&&V.draft.p.length>=2?{x:V.draft.p.at(-2),y:V.draft.p.at(-1)}:null;
function rdp(p,e){if(p.length<3)return p;const a=p[0],b=p[p.length-1],dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1e-9;let mx=0,mi=0;for(let i=1;i<p.length-1;i++){const d=Math.abs(dy*(p[i].x-a.x)-dx*(p[i].y-a.y))/L;if(d>mx){mx=d;mi=i}}
 if(mx>e){const l=rdp(p.slice(0,mi+1),e),r=rdp(p.slice(mi),e);return l.slice(0,-1).concat(r)}return[a,b]}
function recognize(flat){const p=[];for(let i=0;i<flat.length;i+=2)p.push({x:flat[i],y:flat[i+1]});if(p.length<5)return null;
 const xs=p.map(q=>q.x),ys=p.map(q=>q.y),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),w=x1-x0,h=y1-y0,D=Math.hypot(w,h);if(D<1)return null;
 const a=p[0],b=p[p.length-1],gap=Math.hypot(a.x-b.x,a.y-b.y);
 if(gap>D*.3){const mx=Math.max(...p.map(q=>Math.abs((b.y-a.y)*(q.x-a.x)-(b.x-a.x)*(q.y-a.y))/(gap||1)));return mx<D*.08?{t:'line',p:[a.x,a.y,b.x,b.y]}:null}
 const poly=rdp([...p,p[0]],D*.08),n=poly.length-1,cx=(x0+x1)/2,cy=(y0+y1)/2;
 if(n===3)return{t:'poly',closed:true,p:poly.slice(0,3).flatMap(q=>[q.x,q.y])};
 if(n===4){const ax=poly.slice(0,4).every((q,i)=>{const r=poly[i+1],an=Math.abs(Math.atan2(r.y-q.y,r.x-q.x))%(Math.PI/2);return an<.21||an>Math.PI/2-.21});return ax?{t:'rect',x:x0,y:y0,w,h}:{t:'poly',closed:true,p:poly.slice(0,4).flatMap(q=>[q.x,q.y])}}
 if(n>=5&&n<=7){const q=[];for(let i=0;i<6;i++){const an=-Math.PI/2+i*Math.PI/3;q.push(cx+w/2*Math.cos(an),cy+h/2*Math.sin(an))}return{t:'poly',closed:true,p:q}}
 const r=p.map(q=>Math.hypot((q.x-cx)/(w/2||1),(q.y-cy)/(h/2||1))),m=r.reduce((s,v)=>s+v,0)/r.length,sd=Math.sqrt(r.reduce((s,v)=>s+(v-m)**2,0)/r.length);
 if(sd<.14)return{t:'ell',x:x0,y:y0,w,h};
 const c=[];for(let i=0;i<=96;i++){const th=2*Math.PI*i/96,bump=1+.16*Math.abs(Math.sin(4*th));c.push(cx+w/2*.88*bump*Math.cos(th),cy+h/2*.88*bump*Math.sin(th))}return{t:'pen',p:c}}
function penShape(){const f=V.draft;if(!f||f.t!=='pen'||!V.drag||V.drag.shaped)return;const s=recognize(f.p);if(!s)return;const keep={id:f.id,pg:f.pg,c:f.c,sw:f.sw,op:f.op};V.draft={...(s.t==='rect'||s.t==='ell'?{f:'',fo:.25}:{}),...keep,...s};V.drag.shaped=true;vOv();vToast('הצורה זוהתה — שחרר כדי לאשר')}
/* pointer */
function vBind(){const st=$('#vs');if(!st)return;st.onpointerdown=vPD;st.onpointermove=vPM;st.onpointerup=vPU;st.onpointercancel=vPU;st.oncontextmenu=e=>{e.preventDefault();if(V.draft&&V.tool==='poly')vFinishPoly()};
 st.addEventListener('wheel',e=>{e.preventDefault();const r=st.getBoundingClientRect();if(e.shiftKey)V.x-=(e.deltaY||e.deltaX);else if(e.ctrlKey)V.y-=e.deltaY;else if(Math.abs(e.deltaX)>Math.abs(e.deltaY))V.x-=e.deltaX;else zoomAt(e.clientX-r.left,e.clientY-r.top,Math.exp(-e.deltaY*(e.deltaMode?.05:.0017)));vDraw()},{passive:false});
 if(window.ResizeObserver){if(V.ro)V.ro.disconnect();V.ro=new ResizeObserver(()=>{if(V&&V.pages)vDraw()});V.ro.observe(st)}}
function vPinchInit(){const a=[...V.ptr.values()];return{d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1,cx:(a[0].x+a[1].x)/2,cy:(a[0].y+a[1].y)/2,k:V.k,x:V.x,y:V.y}}
function vPD(e){if(e.target.closest('#vta,#vprops'))return;const st=$('#vs');try{st.setPointerCapture(e.pointerId)}catch(_){}V.ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(V.ptr.size===2){vCancelDraft();V.pinch=vPinchInit();return}if(V.ptr.size>2||e.button===2)return;if(V.edit)vTextEnd();
 const tg=e.target.closest&&e.target.closest('[data-h],[data-p],[data-id],[data-m]'),it=vSel(),W0=vpt(e);let ap=null;if(tg&&tg.dataset.id){const c0=V.e.items.find(x=>x.id===tg.dataset.id);if(c0)ap=c0.pg}if(!ap&&it&&tg&&(tg.dataset.h!==undefined||tg.dataset.p!==undefined))ap=it.pg;if(!ap)ap=V.draft?V.draft.pg:pageAtW(W0.y).n;V.ap=ap;const P=toPage(e);
 const sx=e.clientX,sy=e.clientY,before=vSnap();
 if(e.button===1){V.drag={m:'pan',sx,sy,x:V.x,y:V.y};return}
 if(tg&&tg.dataset.h!==undefined&&it){V.drag={m:'rs',hi:+tg.dataset.h,orig:JSON.stringify(it),before};return}
 if(tg&&tg.dataset.p!==undefined&&it){V.drag={m:'pt',pi:+tg.dataset.p,orig:JSON.stringify(it),before};return}
 const t=V.tool,now=performance.now();
 if(t==='erase'){V.er=new Set();V.drag={m:'er',lx:e.clientX,ly:e.clientY};eraseAt(e.clientX,e.clientY);return}
 if(t==='sel'||(t==='text'&&tg&&tg.dataset.id&&V.e.items.find(x=>x.id===tg.dataset.id&&x.t==='text'))){
  if(tg&&tg.dataset.id){const c=V.e.items.find(x=>x.id===tg.dataset.id);if(c&&c.t==='text'&&(V.lastId===c.id&&now-V.lastT<420||t==='text')){V.sel=c.id;V.preT=vSnap();V.lastId=null;vTextEdit(c.id);vTools();return}
   V.lastId=tg.dataset.id;V.lastT=now;V.sel=tg.dataset.id;V.drag={m:'mv',sx:P.x,sy:P.y,orig:JSON.stringify(c),before};vTools();vProps();vOv();return}
  if(tg&&tg.dataset.m){V.drag={m:'mk',id:tg.dataset.m,sx,sy};return}
  if(V.sel){V.sel=null;vTools();vProps();vOv()}V.drag={m:'pan',sx,sy,x:V.x,y:V.y};return}
 if(t==='text'){const D=vDef('text'),n={id:uid(),t:'text',pg:V.ap,x:P.x,y:P.y,w:V.pages[V.ap-1].w/6,h:0,html:'',...D};V.preT=vSnap();V.e.items.push(n);V.sel=n.id;vTools();vTextEdit(n.id);e.preventDefault();return}
 if(t==='poly'){V.cur=SN(P,lastPt(),e);V.drag={m:'poly'};vOvSoon();return}
 if(t==='pen'){V.draft={t:'pen',pg:V.ap,id:uid(),...vDef('pen'),p:[P.x,P.y]};V.drag={m:'draw',x0:P.x,y0:P.y,lx:sx,ly:sy};V.hold=setTimeout(penShape,650);return}
 if(t==='line'){V.draft={t:'line',pg:V.ap,id:uid(),...vDef('line'),p:[P.x,P.y,P.x,P.y]};V.drag={m:'draw',x0:P.x,y0:P.y};return}
 if(t==='tag'||isBB(t)){V.draft={t,pg:V.ap,id:uid(),...(t==='tag'?{}:vDef(t)),x:P.x,y:P.y,w:0,h:0};V.drag={m:'draw',x0:P.x,y0:P.y}}}
function vPM(e){if(!V.ptr.has(e.pointerId)){if(V.tool==='poly'&&V.draft){V.ap=V.draft.pg;V.cur=SN(toPage(e),lastPt(),e);vOvSoon()}return}
 V.ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(V.pinch&&V.ptr.size===2){const a=[...V.ptr.values()],p=V.pinch,d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1,r=$('#vs').getBoundingClientRect(),cx=(a[0].x+a[1].x)/2,cy=(a[0].y+a[1].y)/2,nk=Math.min(Math.max(p.k*d/p.d,V.fit*.15),V.fit*400),f=nk/p.k;
  V.k=nk;V.x=(cx-r.left)-((p.cx-r.left)-p.x)*f;V.y=(cy-r.top)-((p.cy-r.top)-p.y)*f;vDraw();return}
 const d=V.drag,P=toPage(e);if(!d)return;
 if(d.m==='pan'){V.x=d.x+e.clientX-d.sx;V.y=d.y+e.clientY-d.sy;vDraw();return}
 if(d.m==='mk')return;
 if(d.m==='er'){const dx=e.clientX-d.lx,dy=e.clientY-d.ly,n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/4));for(let i=1;i<=n;i++)eraseAt(d.lx+dx*i/n,d.ly+dy*i/n);d.lx=e.clientX;d.ly=e.clientY;return}
 if(d.m==='poly'){V.cur=SN(P,lastPt(),e);vOvSoon();return}
 const it=vSel();
 if(d.m==='draw'){const f=V.draft;if(!f)return;
  if(f.t==='pen'){if(d.shaped)return;if(Math.hypot(e.clientX-d.lx,e.clientY-d.ly)>4){d.lx=e.clientX;d.ly=e.clientY;clearTimeout(V.hold);V.hold=setTimeout(penShape,650)}
   if(e.shiftKey){f.p=[d.x0,d.y0,...(()=>{const q=SN(P,{x:d.x0,y:d.y0},e);return[q.x,q.y]})()]}else f.p.push(P.x,P.y)}
  else if(f.t==='line'){const q=SN(P,{x:d.x0,y:d.y0},e);f.p[2]=q.x;f.p[3]=q.y}
  else{const q=SQ(P,{x:d.x0,y:d.y0},e);f.x=Math.min(d.x0,q.x);f.y=Math.min(d.y0,q.y);f.w=Math.abs(q.x-d.x0);f.h=Math.abs(q.y-d.y0)}vOvSoon();return}
 if(!it)return;const o=JSON.parse(d.orig);
 if(d.m==='mv'){const dx=P.x-d.sx,dy=P.y-d.sy;if(isBB(it.t)){it.x=o.x+dx;it.y=o.y+dy}else it.p=o.p.map((v,i)=>v+(i%2?dy:dx));vOvSoon();return}
 if(d.m==='pt'){let Q=P;if(e.shiftKey&&it.p.length>=4){const j=it.t==='line'?(d.pi===0?1:0):(d.pi>0?d.pi-1:d.pi+1);Q=SN(P,{x:it.p[j*2],y:it.p[j*2+1]},e)}it.p[d.pi*2]=Q.x;it.p[d.pi*2+1]=Q.y;vOvSoon();return}
 if(d.m==='rs'){let[a,b,c,dd]=[o.x,o.y,o.x+o.w,o.y+(o.h||0)];const hi=d.hi;if(hi===0||hi===3)a=P.x;else c=P.x;if(it.t!=='text'){if(hi===0||hi===1)b=P.y;else dd=P.y}
  it.x=Math.min(a,c);it.w=Math.max(Math.abs(c-a),it.t==='text'?vu()*20:1);if(it.t==='text')fixTx(it);else{it.y=Math.min(b,dd);it.h=Math.abs(dd-b)}vOvSoon()}}
function vPU(e){V.ptr.delete(e.pointerId);if(V.pinch){if(V.ptr.size<2)V.pinch=null;V.drag=null;return}const d=V.drag;V.drag=null;clearTimeout(V.hold);if(!d)return;
 if(d.m==='er'){if(V.er&&V.er.size){const b=vSnap();V.e.items=V.e.items.filter(x=>!V.er.has(x.id));V.sel=null;vPush(b);vProps()}V.er=null;vOv();return}
 if(d.m==='mk'){if(Math.hypot(e.clientX-d.sx,e.clientY-d.sy)<6)markMenu(d.id);return}
 if(d.m==='mv'||d.m==='rs'||d.m==='pt'){vPush(d.before);vOv();return}
 if(d.m==='poly'){const P=SN(toPage(e),lastPt(),e),now=performance.now(),dbl=V.plt&&now-V.plt<380&&Math.hypot(e.clientX-V.plx,e.clientY-V.ply)<14;V.plt=now;V.plx=e.clientX;V.ply=e.clientY;
  if(!V.draft)V.draft={t:'poly',pg:V.ap,id:uid(),...vDef('poly'),p:[P.x,P.y]};else V.draft.p.push(P.x,P.y);V.cur=P;if(dbl){V.plt=0;vFinishPoly()}else vOv();return}
 if(d.m==='draw'&&V.draft){const f=V.draft;V.draft=null;const k=V.k;
  if(f.t==='tag'){if(f.w*k>8&&f.h*k>8)vTagDone(f);else vOv();return}
  const ok=f.t==='pen'?f.p.length>=4:f.t==='line'?Math.hypot(f.p[2]-f.p[0],f.p[3]-f.p[1])*k>6:f.t==='poly'?true:(f.w*k>5&&f.h*k>5);
  if(!ok){vOv();return}if(f.t==='pen'&&!d.shaped){const q=[f.p[0],f.p[1]];for(let i=2;i<f.p.length;i+=2)if(Math.hypot(f.p[i]-q[q.length-2],f.p[i+1]-q[q.length-1])*k>2||i>=f.p.length-2)q.push(f.p[i],f.p[i+1]);f.p=q}
  const b=vSnap();V.e.items.push(f);V.sel=f.id;vPush(b);vTools();vProps();vOv()}}
function eraseAt(x,y){for(const el of document.elementsFromPoint(x,y)){const g=el.closest&&el.closest('[data-id]');if(g&&!V.er.has(g.dataset.id)){V.er.add(g.dataset.id);g.style.opacity='.25'}}}
function vFinishPoly(){const f=V.draft;if(!f)return;const p=[];for(let i=0;i<f.p.length;i+=2){if(i&&Math.hypot(f.p[i]-p[p.length-2],f.p[i+1]-p[p.length-1])*V.k<4)continue;p.push(f.p[i],f.p[i+1])}V.draft=null;V.cur=null;if(p.length<4){vOv();return}f.p=p;const b=vSnap();V.e.items.push(f);V.sel=f.id;vPush(b);vTools();vProps();vOv()}
function vKey(e){if(!V||tab!=='v')return;const tn=(e.target.tagName||'').toLowerCase();if(tn==='textarea'||e.target.isContentEditable||(tn==='input'&&e.target.type!=='range'&&e.target.type!=='checkbox'))return;
 const c=e.ctrlKey||e.metaKey,k=e.key.toLowerCase();
 if(c&&k==='z'&&!e.shiftKey){e.preventDefault();vUndo()}else if(c&&(k==='y'||(k==='z'&&e.shiftKey))){e.preventDefault();vRedo()}
 else if((e.key==='Delete'||e.key==='Backspace')&&V.sel){e.preventDefault();vDel()}
 else if(e.key==='PageDown'||e.key==='PageUp'||e.key==='Home'||e.key==='ArrowDown'||e.key==='ArrowUp'){const h=$('#vs').clientHeight;e.preventDefault();if(e.key==='Home'){vFit()}else V.y+=(e.key==='PageUp'?.9:e.key==='PageDown'?-.9:e.key==='ArrowUp'?.15:-.15)*h;vDraw()}
 else if(e.key==='Escape'){if(document.querySelector('.cpop'))return;if(V.draft&&V.tool==='poly')vFinishPoly();else{vCancelDraft();V.sel=null;V.tool='sel';vTools();vProps();vOv()}}
 else if(e.key==='Enter'){if(V.draft&&V.tool==='poly')vFinishPoly();else if(V.sel){const it=vSel();if(it&&it.t==='text'){e.preventDefault();V.preT=vSnap();vTextEdit(it.id)}}}}
document.addEventListener('keydown',vKey);
/* text layer data + find */
async function vText(pg){if(V.txt[pg])return V.txt[pg];const p=await V.pdf.getPage(pg),vp=p.getViewport({scale:1}),tc=await p.getTextContent(),a=[];
 for(const it of tc.items){if(!it.str||!it.str.trim())continue;const t=pdfjsLib.Util.transform(vp.transform,it.transform),h=Math.hypot(t[2],t[3])||8;a.push({s:it.str,x:t[4],y:t[5]-h,w:it.width||h*it.str.length*.5,h})}return V.txt[pg]=a}
async function vFind(name){const GEN=new Set(['חשמל','חשמלי']),toks=wordsOf(name).filter(w=>!STOP.has(w)&&!GEN.has(w)),tg=(toks.length?toks:wordsOf(name)).join('');if(!tg)return;
 for(let pg=1;pg<=V.np;pg++){const it=await vText(pg),nn=it.map(x=>wordsOf(x.s).join(''));
  for(let i=0;i<it.length;i++){let acc='';for(let j=i;j<Math.min(i+6,it.length);j++){acc+=nn[j];if(acc.includes(tg)){let a=i;while(a<j&&nn.slice(a+1,j+1).join('').includes(tg))a++;const g=it.slice(a,j+1),x0=Math.min(...g.map(q=>q.x)),y0=Math.min(...g.map(q=>q.y)),x1=Math.max(...g.map(q=>q.x+q.w)),y1=Math.max(...g.map(q=>q.y+q.h));
    V.hl={pg,x:x0,y:y0,w:x1-x0,h:y1-y0};const s=$('#vs'),pp=vpg(pg),k=Math.max(V.fit,Math.min(s.clientWidth/(Math.max(x1-x0,(y1-y0)*3)*6),V.fit*80));V.k=k;V.x=s.clientWidth/2-(pp.x+(x0+x1)/2)*k;V.y=s.clientHeight/2-(pp.y+(y0+y1)/2)*k;vDraw();return}
   if(acc.length>tg.length+40)break}}}
 vToast('לא נמצא בקובץ הטקסט «'+name+'»')}
async function vInit(){if(!V)return;vBind();vTools();vProps();vDrawer();const st=$('#vs');
 try{if(!V.pdf){V.lp=V.lp||vLoad();await V.lp}else{V.r=null;vDraw()}}catch(e){V.lp=null;if(st)st.insertAdjacentHTML('beforeend',`<div class="warn" style="margin:16px;position:relative">${e==='bad'?'לא ניתן לפתוח את קובץ ה-PDF (ייתכן שהקובץ פגום).':'הקובץ לא נמצא במכשיר הזה — העלה אותו שוב בלשונית תוכניות/סכמות (או התחבר לענן).'}</div>`);return}
 if(V.first){V.first=false;vFit();vDraw()}else{V.r=V.r;vDraw()}vOv();if(V.find){const f=V.find;V.find=null;vFind(f)}}
/* details drawer: edit plan / panels directly */
function vDrawer(){const e=$('#vdrawer');if(!e||!V)return;if(!V.dr){e.hidden=true;return}e.hidden=false;
 const F=(l,h)=>`<label class="f">${l}${h}</label>`;
 if(V.G){e.innerHTML=`<div class="row"><h3>פרטי הסכמה</h3><button class="ic" onclick="vDrawerT()" aria-label="סגור">✕</button></div>`+F('שם',`<input value="${esc(V.G.name)}" onchange="V.G.name=this.value;V.title=this.value;save();vSoft()">`)+F('בניין / אזור',`<select onchange="V.G.b=this.value;save()"><option value="">לא שויך</option>${bOpts().map(([v,n])=>`<option value="${esc(v)}" ${V.G.b===v?'selected':''}>${esc(n)}</option>`).join('')}</select>`)+`<div class="sub" style="margin-top:8px">${V.G.marks.length} סימונים</div>`;return}
 const d=vDoc();if(!d){e.innerHTML=`<div class="row"><h3>פרטים</h3><button class="ic" onclick="vDrawerT()" aria-label="סגור">✕</button></div><div class="sub">לקובץ הזה אין תוכנית מקושרת.</div>`;return}
 const rv=d.revs.find(r=>r.key===V.key)||cur(d),L=S.p.filter(p=>N(p.dwg)===N(d.num)),pi=(p,k,ph,t)=>`<input ${t?`type="${t}"`:''} value="${esc(p[k]||'')}" placeholder="${ph}" onchange="pSet('${p.id}','${k}',this.value)">`;
 e.innerHTML=`<div class="row"><h3>פרטי התוכנית</h3><button class="ic" onclick="vDrawerT()" aria-label="סגור">✕</button></div>`+
 F('מס׳ תוכנית',`<input value="${esc(d.num)}" onchange="dSet('num',this.value)">`)+F('שם',`<input value="${esc(d.name)}" onchange="dSet('name',this.value)">`)+
 F('סטטוס',`<select onchange="dSet('status',this.value)">${ST.map(s=>`<option ${d.status===s?'selected':''}>${s}</option>`).join('')}</select>`)+
 F('תאריך התוכנית',`<input type="date" value="${esc(rv.date||'')}" onchange="dSet('date',this.value)">`)+
 `<div class="acts" style="margin-top:8px"><button class="sm" onclick="dApplyDate()">החל את התאריך על כל לוחות התוכנית</button></div>`+
 `<h3 style="margin-top:14px">מהדורות (${d.revs.length})</h3>${[...d.revs].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map((r,i)=>`<div class="row" style="padding:3px 0"><span class="sub">${r.key===V.key?'● ':''}${fmt(r.date)} · ${esc(r.file)}</span>${r.key===V.key?'':`<button class="sm" onclick="openRev('${r.key}')">פתח</button>`}</div>`).join('')}`+
 `<h3 style="margin-top:14px">לוחות בתוכנית (${L.length})</h3>${L.map(p=>`<div class="tm"><div class="tf">${pi(p,'name','שם')}${pi(p,'desc','תיאור')}${pi(p,'f','קומה')}<input type="date" value="${esc(p.date||'')}" title="תאריך הלוח (ריק = לפי התוכנית)" onchange="pSet('${p.id}','date',this.value)"><div class="acts"><button class="sm" onclick="editP('${p.id}')">${IC.edit}</button>${ib('trash','מחק לוח',`pDel('${p.id}')`,'danger')}</div></div></div>`).join('')||'<div class="sub">אין לוחות מקושרים</div>'}<button class="sm" style="margin-top:8px" onclick="pAdd()">${IC.plus}לוח</button>`}
function dSet(k,v){const d=vDoc();if(!d)return;if(k==='date'){(d.revs.find(r=>r.key===V.key)||cur(d)).date=v}
 else if(k==='num'){const old=d.num;S.p.forEach(p=>{if(N(p.dwg)===N(old))p.dwg=v});d.num=v}else d[k]=v;V.title=vOpenRevTitle(V.key);save();const t=$('#vtitle');if(t)t.textContent=V.title}
function dApplyDate(){const d=vDoc();if(!d)return;const rv=d.revs.find(r=>r.key===V.key)||cur(d);S.p.forEach(p=>{if(N(p.dwg)===N(d.num))p.date=rv.date||''});save();vDrawer();vToast('התאריך הוחל על כל הלוחות')}
function pSet(id,k,v){const p=S.p.find(x=>x.id===id);if(p){p[k]=v;save()}}
function pDel(id){if(!confirm('למחוק את הלוח?'))return;S.p=S.p.filter(x=>x.id!==id);save();vDrawer()}
function pAdd(){const d=vDoc();if(!d)return;const o=S.p.find(p=>N(p.dwg)===N(d.num));S.p.push({id:uid(),name:'לוח חדש',desc:'',b:o?o.b:'',f:o?o.f:'',dwg:d.num});save();vDrawer()}
/* schematic marks */
async function vTagDone(f){const pp=vpg(f.pg),r={x:f.x/pp.w*100,y:f.y/pp.h*100,w:f.w/pp.w*100,h:f.h/pp.h*100},tx=(await vText(f.pg)).filter(i=>{const cx=i.x+i.w/2,cy=i.y+i.h/2;return cx>=f.x&&cx<=f.x+f.w&&cy>=f.y&&cy<=f.y+f.h}).sort((a,b)=>Math.abs(a.y-b.y)<a.h/2?a.x-b.x:a.y-b.y).map(i=>i.s.trim()).join(' ');
 const o=await choosePanel({prefill:tx.slice(0,60),b:V.G.b});vOv();if(!o)return;let id=o.pid;if(o.nn){id=uid();S.p.push({id,name:o.nn,desc:'',b:V.G.b,f:'',dwg:''})}V.G.marks.push({id:uid(),pg:f.pg,pid:id,...r});save();vOv()}
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
