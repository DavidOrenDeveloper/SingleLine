let TM=[];
const ROLE_L={editor:'עורך (יכול לערוך)',viewer:'צופה (קריאה בלבד)'};
const vTeam=()=>`<div class="card"><div class="row"><h2 class="ct" style="margin:0">עובדים והרשאות</h2></div><div class="sub">הוספה, עריכה ומחיקה של משתמשים שיכולים להיכנס לאפליקציה. הסיסמאות נשמרות כך שעורכים יכולים לראות ולשנות אותן. זמין לעורך מחובר בלבד.</div><div id="team" style="margin-top:10px"></div></div>`;
const rOpts=v=>Object.entries(ROLE_L).map(([k,l])=>`<option value="${k}" ${k===v?'selected':''}>${l}</option>`).join('');
async function teamLoad(){const e=$('#team');if(!e)return;
 if(!sb||!sbUser||role!=='editor'){e.innerHTML='<div class="empty" style="padding:16px">התחבר לענן כעורך (בכרטיס "סנכרון בענן") כדי לנהל עובדים</div>';return}
 e.innerHTML='<div class="sub">טוען...</div>';const{data,error}=await sb.rpc('team_list');
 if(error){e.innerHTML=`<div class="warn">${esc(error.message)}<br>יש להריץ פעם אחת בסופבייס (SQL Editor) את החלק "ניהול עובדים" מהקובץ supabase.sql.</div>`;return}
 TM=data||[];teamDraw()}
function teamDraw(){const e=$('#team');if(!e)return;
 e.innerHTML=`<div class="tm tnew"><b>הוספת עובד</b><div class="tf"><input id="tn_e" type="email" placeholder="אימייל" dir="ltr"><input id="tn_p" placeholder="סיסמה (6 תווים לפחות)" dir="ltr"><button type="button" onclick="$('#tn_p').value=teamGen()">צור סיסמה</button><select id="tn_r">${rOpts('viewer')}</select><button class="pri" onclick="teamAdd()">${IC.plus}הוסף</button></div></div>`+
 TM.map(m=>`<div class="tm" data-u="${m.user_id}"><div class="tf"><input class="t_e" type="email" value="${esc(m.email)}" dir="ltr"><input class="t_p" value="${esc(m.pw||'')}" placeholder="סיסמה לא ידועה — הקלד חדשה כדי להחליף" dir="ltr"><select class="t_r">${rOpts(m.role)}</select><div class="acts"><button class="pri" onclick="teamSave('${m.user_id}')">שמור</button>${ib('trash','מחיקת משתמש',`teamDel('${m.user_id}')`,'danger')}</div></div></div>`).join('')}
const teamGen=()=>{const c='abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';let s='';for(const b of crypto.getRandomValues(new Uint8Array(10)))s+=c[b%c.length];return s};
async function teamCall(a,msg){const{error}=await sb.rpc('team_save',a);if(error)return alert('שגיאה: '+error.message);await teamLoad();if(msg)alert(msg)}
async function teamAdd(){const em=$('#tn_e').value.trim(),pw=$('#tn_p').value.trim();if(!em||pw.length<6)return alert('נדרשים אימייל וסיסמה של 6 תווים לפחות');await teamCall({p_user:null,p_email:em,p_password:pw,p_role:$('#tn_r').value},'המשתמש נוסף')}
async function teamSave(id){const r=document.querySelector(`.tm[data-u="${id}"]`),pw=r.querySelector('.t_p').value.trim();if(pw&&pw.length<6)return alert('סיסמה חייבת להכיל 6 תווים לפחות');await teamCall({p_user:id,p_email:r.querySelector('.t_e').value.trim(),p_password:pw,p_role:r.querySelector('.t_r').value},'נשמר')}
async function teamDel(id){if(!confirm('למחוק את המשתמש? הוא לא יוכל להיכנס יותר.'))return;const{error}=await sb.rpc('team_remove',{p_user:id});if(error)return alert('שגיאה: '+error.message);teamLoad()}
