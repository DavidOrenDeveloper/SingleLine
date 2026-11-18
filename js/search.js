const bOf=id=>S.b.find(b=>b.id===id),bOpts=()=>S.b.map(b=>[b.id,b.name+(b.area?' (אזור)':'')]);
const inB=(p,id)=>{const b=bOf(p.b);return p.b===id||(!!b&&b.grp===id)};
const STOP=new Set(['לוח','לוחות','מספר','מס','של','את','עם','על','אל','ליד','הלוח','בלוח','the','no','num','panel']);
const PRE='והבלמשכ';
const nrm=s=>String(s??'').toLowerCase().replace(/[\u0591-\u05C7]/g,'').replace(/[׳'"״`]/g,'');
const wordsOf=s=>nrm(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
function stem(w){if(!/^[\u05D0-\u05EA]+$/.test(w))return w;let s=w;
 if(s.length>3&&PRE.includes(s[0]))s=s.slice(1);if(s.length>4&&PRE.includes(s[0])&&PRE.includes(s[1]))s=s.slice(1);
 s=s.replace(/(ים|ות)$/,m=>s.length>4?'':m);if(s.length>3)s=s.replace(/[יהת]$/,'');return s}
function lev1(a,b){if(Math.abs(a.length-b.length)>1)return false;let i=0;while(i<a.length&&a[i]===b[i])i++;if(i===a.length&&i===b.length)return true;
 const x=a.slice(i),y=b.slice(i);return x.slice(1)===y||x===y.slice(1)||x.slice(1)===y.slice(1)}
function fScore(fw,a){const isN=/^\d/.test(a);if(fw===a)return 3;const sf=stem(fw),sa=stem(a);if(sf===sa)return 3;
 if(a.length>=2&&(fw.startsWith(a)||sf.startsWith(sa)))return 2;if(isN)return 0;
 if(sa.length>=3&&(fw.includes(sa)||sf.includes(sa)))return 1;if(sa.length>=4&&lev1(sf,sa))return 1;return 0}
function relScore(fields,q){const toks=wordsOf(q).filter(w=>!STOP.has(w));if(!toks.length)return 0;let tot=0,hit=0;
 const F=fields.filter(f=>f[0]).map(([t,w])=>{const ws=wordsOf(t);if(ws.length>1)ws.push(ws.join(''));return[ws,w]});
 for(const a of toks){let best=0;for(const[ws,w]of F)for(const fw of ws){const s=fScore(fw,a)*w;if(s>best)best=s}if(best>0){hit++;tot+=best}}
 if(hit<Math.max(1,Math.ceil(toks.length*.6)))return 0;
 const j=toks.join('');for(const[ws,w]of F)if(ws[ws.length-1].includes(j))tot+=w*2;return tot||0.01}
const pFields=p=>{const b=bOf(p.b),g=b&&b.grp?bOf(b.grp):null,d=dOf(p);return[[p.name,6],[p.desc,4],[b&&b.name,2],[g&&g.name,2],[p.f?'קומה '+p.f:'ללא קומה',3],[p.dwg,2],[d&&d.name,1],[st(p),1]]};
function floorNum(f){f=String(f||'').trim();if(f==='')return 50;if(f==='קרקע')return 0;if(f==='גג')return 99;const m=f.match(/-?\d+/);return m?+m[0]:50}
function bOrder(id){const b=bOf(id);if(!b)return 9999;const i=S.b.indexOf(b);if(b.grp){const g=S.b.findIndex(x=>x.id===b.grp);return(g<0?i:g)+1+i/1000}return i}
const nat=(a,b)=>String(a).localeCompare(String(b),'he',{numeric:true});
function sortP(L,mode){const A=[...L];
 if(mode==='bld')A.sort((a,b)=>bOrder(a.b)-bOrder(b.b)||floorNum(a.f)-floorNum(b.f)||nat(a.name,b.name));
 else if(mode==='name')A.sort((a,b)=>nat(a.name,b.name));return A}
function rankP(L,qq,mode){if(!qq.trim())return sortP(L,mode);
 const R=L.map(p=>({p,s:relScore(pFields(p),qq)})).filter(x=>x.s>0);
 if(mode==='bld'||mode==='name')return sortP(R.map(x=>x.p),mode);
 return R.sort((a,b)=>b.s-a.s||bOrder(a.p.b)-bOrder(b.p.b)||floorNum(a.p.f)-floorNum(b.p.f)).map(x=>x.p)}
