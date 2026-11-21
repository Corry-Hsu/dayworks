import {addDays,dateNumber} from './core.mjs';
const $=id=>document.getElementById(id),D=86400000,week=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
const now=new Date();const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
let direction=1,result=null,view=dateNumber(today),timer;
function notify(text){$('toast').textContent=text;clearTimeout(timer);timer=setTimeout(()=>$('toast').textContent='',4500);}
function render(){
 $('send-to-work').hidden=true;result=null;$('error').textContent='';for(const id of ['result-month','result-day','result-weekday','result-iso','equation-start','equation-offset','start-weekday'])$(id).textContent='—';for(const id of ['copy','continue','back-to-result'])$(id).disabled=true;
 const offset=$('offset').value,start=$('start').value;
 if(offset!==''&&Number.isFinite(Number(offset))&&Number(offset)!==0)direction=Number(offset)<0?-1:1;
 $('forward').setAttribute('aria-pressed',String(direction===1));$('backward').setAttribute('aria-pressed',String(direction===-1));
 document.querySelectorAll('[data-days]').forEach(b=>b.setAttribute('aria-pressed',String(offset!==''&&Math.abs(Number(offset))===Number(b.dataset.days))));
 try{if(start){const n=dateNumber(start);$('start-weekday').textContent=week[new Date(n*D).getUTCDay()];$('equation-start').textContent=start;}}catch(e){$('error').textContent=e.message;}
 if(start&&offset!=='')try{result=addDays(start,offset);const [y,m,d]=result.date.split('-');$('result-month').textContent=`${Number(y)} 年 ${Number(m)} 月`;$('result-day').textContent=String(Number(d));$('result-weekday').textContent=week[result.weekday];$('result-iso').textContent=result.date;$('equation-offset').textContent=`${result.days<0?'−':'＋'}${Math.abs(result.days).toLocaleString()} 天`;for(const id of ['copy','continue','back-to-result'])$(id).disabled=false;view=dateNumber(result.date);const q=new URLSearchParams({start:result.start<result.date?result.start:result.date,end:result.start<result.date?result.date:result.start,mode:'work'});$('send-to-work').href='../between/timeline.html?'+q;$('send-to-work').hidden=false;}catch(e){$('error').textContent=e.message;}
 $('calendar-info').textContent='點選日期可設為起始日';renderCalendar();
}
function renderCalendar(){
 $('calendar-empty').hidden=!!$('start').value;$('calendar-body').hidden=!$('start').value;
 const date=new Date(view*D),y=date.getUTCFullYear(),m=date.getUTCMonth();const first=new Date(0);first.setUTCFullYear(y,m,1);const last=new Date(0);last.setUTCFullYear(y,m+1,0);
 $('month-title').textContent=`${y} 年 ${m+1} 月`;$('prev').disabled=y===1&&m===0;$('next').disabled=y===9999&&m===11;$('calendar-grid').replaceChildren();
 for(let i=0;i<first.getUTCDay();i++)$('calendar-grid').append(document.createElement('span'));
 for(let day=1;day<=last.getUTCDate();day++){const key=`${String(y).padStart(4,'0')}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`,n=dateNumber(key),weekday=new Date(n*D).getUTCDay();const button=document.createElement('button');button.type='button';button.textContent=day;button.classList.toggle('weekend',weekday===0||weekday===6);button.classList.toggle('start',key===$('start').value);button.classList.toggle('end',key===result?.date);button.setAttribute('aria-label',`${key} ${week[weekday]}${key===$('start').value?'，起始日':''}${key===result?.date?'，結果日':''}，設為起始日`);button.onclick=()=>{$('start').value=key;render();};$('calendar-grid').append(button);}
}
function setDirection(sign){direction=sign;const value=$('offset').value;if(value!==''&&Number.isFinite(Number(value)))$('offset').value=sign*Math.abs(Number(value));render();}
$('forward').onclick=()=>setDirection(1);$('backward').onclick=()=>setDirection(-1);
$('start').addEventListener('input',render);$('offset').addEventListener('input',render);
$('today').onclick=()=>{const query=new URLSearchParams(location.search);
$('start').value=today;
try{if(query.has('start')){const value=query.get('start');if(value)dateNumber(value);$('start').value=value;}if(query.has('days')){const value=query.get('days');if(value!==''&&!/^[+-]?\d+$/.test(value))throw new Error();$('offset').value=value;}if(query.get('direction')==='-1')direction=-1;}catch{$('start').value=today;$('offset').value=7;direction=1;}
for(const link of document.querySelectorAll('[data-theme]'))link.addEventListener('click',()=>{const params=new URLSearchParams({start:$('start').value,days:$('offset').value,direction:String(direction)});link.href=link.getAttribute('href').split('?')[0]+'?'+params;});
render();};
for(const [id,delta]of [['minus',-1],['plus',1]])$(id).onclick=()=>{const raw=$('offset').value,current=raw===''?0:Number(raw);if(!Number.isSafeInteger(current)){notify('請先輸入有效整數。');return;}$('offset').value=current+delta;render();};
document.querySelectorAll('[data-days]').forEach(b=>b.onclick=()=>{$('offset').value=direction*Number(b.dataset.days);render();});
$('calculator').addEventListener('submit',e=>{e.preventDefault();render();});
$('clear').onclick=()=>{$('start').value='';$('offset').value='';direction=1;render();$('start').focus();};
$('copy').onclick=async()=>{if(!result)return;try{await navigator.clipboard.writeText(result.date);notify('已複製 '+result.date);}catch{notify('無法自動複製，請選取結果日期手動複製。');}};
$('continue').onclick=()=>{if(!result)return;$('start').value=result.date;render();notify('已設為起始日');};
for(const [id,delta]of [['prev',-1],['next',1]])$(id).onclick=()=>{const d=new Date(view*D);d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+delta);if(d.getUTCFullYear()<1||d.getUTCFullYear()>9999)return;view=+d/D;renderCalendar();};
$('back-to-result').onclick=()=>{if(result){view=dateNumber(result.date);renderCalendar();}};
const query=new URLSearchParams(location.search);
$('start').value=today;
try{if(query.has('start')){const value=query.get('start');if(value)dateNumber(value);$('start').value=value;}if(query.has('days')){const value=query.get('days');if(value!==''&&!/^[+-]?\d+$/.test(value))throw new Error();$('offset').value=value;}if(query.get('direction')==='-1')direction=-1;}catch{$('start').value=today;$('offset').value=7;direction=1;}
for(const link of document.querySelectorAll('[data-theme]'))link.addEventListener('click',()=>{const params=new URLSearchParams({start:$('start').value,days:$('offset').value,direction:String(direction)});link.href=link.getAttribute('href').split('?')[0]+'?'+params;});
render();

document.querySelector('.other-tool').addEventListener('click',e=>{if(!result)return;const q=new URLSearchParams({start:result.start,end:result.date,mode:'date'});e.currentTarget.href='../between/timeline.html?'+q;});
