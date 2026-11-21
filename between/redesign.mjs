import {readRecords as readStored,writeRecords as writeStored} from './records.mjs';
import {difference,workdays,completionDate,parseDate,HOLIDAYS} from './date-core.mjs';
const $=id=>document.getElementById(id), DAY=86400000;
const fmt=n=>n.toLocaleString('zh-TW');
const iso=n=>new Date(n*DAY).toISOString().slice(0,10);
const localToday=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const today=localToday();
let start=today,end=iso(parseDate(today)+14),mode='date',historyMode='date',view=parseDate(today),selectingEnd=false,result=null,timer;
const dayNode=(tag,text,cls)=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;};
const options=()=>({saturday:$('saturday').checked,sunday:$('sunday').checked,holidays:$('holidays').checked});
function toast(message){$('toast').textContent=message;clearTimeout(timer);timer=setTimeout(()=>$('toast').textContent='',4000);}
function setDates(a,b){start=a;end=b;$('start').value=a;$('end').value=b;}
function validity(){parseDate(start);parseDate(end);}
function isRest(key){if(mode==='date')return '';if(mode==='finish'&&!$('include-start').checked&&key===start)return '開工日不計入';const day=new Date(`${key}T00:00:00Z`).getUTCDay(),o=options();if(o.holidays&&HOLIDAYS[key])return HOLIDAYS[key];if(o.saturday&&day===6)return '星期六';if(o.sunday&&day===0)return '星期日';return '';}
function update(){
 start=$('start').value;end=$('end').value;result=null;const finishing=mode==='finish',working=mode!=='date';
 $('error').textContent='';$('total').textContent='—';$('secondary').textContent='—';$('save').disabled=true;$('detail-count').textContent='';$('detail-content').replaceChildren();$('ratio').hidden=true;
 $('start').parentElement.firstChild.textContent=finishing?'開工日':'起始日';$('end').parentElement.firstChild.textContent=finishing?'預定完工日（自動推算）':'終止日';$('finish-inputs').hidden=!finishing;$('end').readOnly=finishing;const endWheel=$('end').parentElement.querySelector('.open-wheel');if(endWheel)endWheel.hidden=finishing;
 document.querySelector('.result').classList.toggle('finish',finishing);
 $('settings').hidden=!working;$('result-label').textContent=finishing?'預定完工日':working?'工作天':'相隔';$('secondary-label').textContent=finishing?'所需工作天數':working?'日曆天數':'含頭含尾';
 const o=options();$('setting-label').textContent=[o.saturday?'六':null,o.sunday?'日':null,o.holidays?'2026–2027 假日':null].filter(Boolean).join('・')||'不排除';
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
 if(start&&(end||finishing)){try{
 if(finishing){result=completionDate(start,$('required-days').value,{...o,includeStart:$('include-start').checked});end=result.date;$('end').value=end;view=parseDate(end);}
 else {validity();result=working?workdays(start,end,o):difference(start,end);}
 $('total').textContent=finishing?result.date:fmt(working?result.working:result.days);$('secondary').textContent=`${fmt(finishing?result.requested:working?result.calendar:result.inclusive)} 天`;$('save').disabled=false;
 if(working){$('ratio').hidden=false;$('ratio-work').style.width=`${result.working/result.calendar*100}%`;$('ratio-working').textContent=`工作 ${fmt(result.working)}`;$('ratio-rest').textContent=`未計入 ${fmt(result.excluded)}`;$('detail-count').textContent=`日曆 ${fmt(result.calendar)} 天`;if(finishing){detail('預定完工日',result.date);detail('開工日計入',result.includeStart?'當日為工作日則計入':'不計入，從隔日起算');}detail('週末',`${fmt(result.weekends)} 天`);detail('未與週末重疊的假日',`${fmt(result.holidayOnly)} 天`);if(result.notCountedStart)detail('不計開工當日','1 天');for(const h of result.excludedHolidays)detail(h.date,`${h.name}${h.overlap?' · 與週末重疊':''}`);}
 else {detail('日期差（絕對值）',`${fmt(result.days)} 天`);detail('包含起始日與終止日',`${fmt(result.inclusive)} 天`);}
 }catch(e){$('error').textContent=e.message;if(finishing){end='';$('end').value='';}}}
 else {$('detail-content').textContent='先選擇起訖日。';}
 renderCalendar();renderStrip();
}
function detail(a,b){const row=dayNode('div','','detail-line');row.append(dayNode('span',a),dayNode('span',b));$('detail-content').append(row);}
function renderCalendar(){
 const date=new Date(view*DAY),year=date.getUTCFullYear(),month=date.getUTCMonth();const first=new Date(0);first.setUTCFullYear(year,month,1);const firstN=+first/DAY;const last=new Date(0);last.setUTCFullYear(year,month+1,0);const count=last.getUTCDate();
 $('month-title').textContent=`${year} 年 ${month+1} 月`;$('prev').disabled=year===1&&month===0;$('next').disabled=year===9999&&month===11;$('selection-prompt').textContent=selectingEnd?'再點選終止日':'點選起始日';$('calendar-grid').replaceChildren();
 for(let i=0;i<first.getUTCDay();i++)$('calendar-grid').append(dayNode('span',''));
 const low=start&&end?(start<end?start:end):start,high=start&&end?(start>end?start:end):start;
 for(let d=1;d<=count;d++){
 const n=firstN+d-1,key=iso(n),rest=isRest(key),selected=low&&key>=low&&key<=high;
 const b=dayNode('button',String(d),'day');b.type='button';b.classList.toggle('selected',!!selected);b.classList.toggle('endpoint',key===start||key===end);b.classList.toggle('excluded',!!rest&&!!selected);b.classList.toggle('today',key===today);b.setAttribute('aria-pressed',String(!!selected));b.setAttribute('aria-label',`${key}${key===start?'，起始日':''}${key===end?'，終止日':''}${rest?'，'+rest:''}`);b.title=`${key}${rest?' · '+rest:''}`;
 b.onclick=()=>{if(mode==='finish'){setDates(key,end);selectingEnd=false;update();return;}if(!selectingEnd){setDates(key,'');selectingEnd=true;}else{setDates(start<=key?start:key,start<=key?key:start);selectingEnd=false;}update();};$('calendar-grid').append(b);
 }
}
function renderStrip(){const container=$('strip');container.replaceChildren();$('strip-caption').textContent='';$('strip-note').textContent='';$('day-info').textContent='點選日期格查看';if(!result)return;
 const a=Math.min(parseDate(start),parseDate(end)),b=Math.max(parseDate(start),parseDate(end)),count=b-a+1,limit=Math.min(count,91);$('strip-caption').textContent=`${start.slice(5)} ／ ${end.slice(5)}`;
 for(let i=0;i<limit;i++){const key=iso(a+i),rest=isRest(key),cell=dayNode('button',String(Number(key.slice(-2))),rest?'rest':'');cell.type='button';cell.setAttribute('aria-label',`${key}，${rest?'排除：'+rest:mode!=='date'?'工作日':'區間內'}`);cell.title=cell.getAttribute('aria-label');cell.onclick=()=>{$('day-info').textContent=cell.getAttribute('aria-label');};container.append(cell);}
 if(count>91)$('strip-note').textContent=`顯示前 91 天，共 ${fmt(count)} 天；結果已計入完整區間。`;
}
function shiftMonth(delta){const d=new Date(view*DAY);d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+delta);if(d.getUTCFullYear()<1||d.getUTCFullYear()>9999)return;view=+d/DAY;renderCalendar();}
$('prev').onclick=()=>shiftMonth(-1);$('next').onclick=()=>shiftMonth(1);
for(const id of ['start','end'])$(id).addEventListener('input',()=>{selectingEnd=false;const value=$(id).value;try{view=parseDate(value);}catch{}update();});
for(const id of ['saturday','sunday','holidays','required-days','include-start'])$(id).addEventListener('change',update);
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;historyMode=mode==='date'?'date':'work';update();renderHistory();});
document.querySelectorAll('[data-range]').forEach(b=>b.onclick=()=>{let a=parseDate(today),z=a;const d=new Date(a*DAY);if(b.dataset.range==='week'){const weekday=d.getUTCDay();a-=weekday===0?6:weekday-1;z=a+6;}if(b.dataset.range==='month'){d.setUTCDate(1);a=+d/DAY;d.setUTCMonth(d.getUTCMonth()+1);d.setUTCDate(0);z=+d/DAY;}setDates(iso(a),iso(z));view=a;selectingEnd=false;update();});
$('reset').onclick=()=>{setDates('','');selectingEnd=false;update();};
function readRecords(kind){try{return readStored(kind);}catch{toast('無法讀取紀錄，請保留瀏覽器資料並檢查儲存權限。');return [];}}
function writeRecords(kind,records){try{readStored(kind);writeStored(kind,records);renderHistory();return true;}catch{toast('瀏覽器無法儲存紀錄，請檢查本機儲存權限或空間。');return false;}}
function renderHistory(){const records=readRecords(historyMode);$('history-count').textContent=String(records.length);$('history').replaceChildren();$('clear-history').disabled=!records.length;document.querySelectorAll('[data-history]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.history===historyMode)));if(!records.length)$('history').append(dayNode('p','尚無紀錄','micro'));
 for(const r of records){const row=dayNode('div','','record'),top=dayNode('div','');top.append(dayNode('span',r.name||`${r.start} ／ ${r.end}`),dayNode('b',r.result));const line=dayNode('div','');line.append(dayNode('p',r.detail));const remove=dayNode('button','刪除');remove.setAttribute('aria-label',`刪除 ${r.start} 至 ${r.end} 的紀錄`);remove.onclick=()=>writeRecords(historyMode,readRecords(historyMode).filter(x=>x.id!==r.id));line.append(remove);row.append(top,line);$('history').append(row);}
}
$('save').onclick=()=>{if(!result)return;const storageKind=mode==='date'?'date':'work';const r=mode==='date'?`相隔 ${result.days} 天`:mode==='finish'?`完工 ${result.date}`:`工作 ${result.working} 天`;const description=mode==='date'?`含頭含尾 ${result.inclusive} 天`:`日曆 ${result.calendar} 天 · 排除 ${$('setting-label').textContent}`;historyMode=storageKind;const item={id:crypto.randomUUID(),name:$('project-name').value.trim(),savedAt:new Date().toISOString(),start,end,result:r,detail:description,options:mode!=='date'?options():null,snapshot:{...result},version:3,calculationType:mode,requested:mode==='finish'?result.requested:null,includeStart:mode==='finish'?result.includeStart:null,holidayYears:[2026,2027]};if(writeRecords(storageKind,[item,...readRecords(storageKind)]))toast('已儲存');};
$('clear-history').onclick=()=>{if(confirm('清除此類全部紀錄？'))writeRecords(historyMode,[]);};
document.querySelectorAll('[data-history]').forEach(b=>b.onclick=()=>{historyMode=b.dataset.history;renderHistory();});
window.addEventListener('storage',()=>renderHistory());
document.querySelectorAll('[data-style]').forEach(a=>{if(a.dataset.style===document.body.className)a.setAttribute('aria-current','page');a.addEventListener('click',()=>{const q=new URLSearchParams({start:$('start').value,end:$('end').value,mode,name:$('project-name').value,sat:String($('saturday').checked),sun:String($('sunday').checked),hol:String($('holidays').checked),required:$('required-days').value,includeStart:String($('include-start').checked)});a.href=`${a.getAttribute('href').split('?')[0]}?${q}`;});});
const params=new URLSearchParams(location.search);$('project-name').value=params.get('name')||'';try{if(params.has('start')&&params.has('end')){const a=params.get('start'),b=params.get('end');if(a)parseDate(a);if(b)parseDate(b);start=a;end=b;if(a)view=parseDate(a);}if(['work','finish'].includes(params.get('mode')))mode=params.get('mode');if(params.has('required'))$('required-days').value=params.get('required');if(params.has('includeStart'))$('include-start').checked=params.get('includeStart')!=='false';for(const [key,id]of [['sat','saturday'],['sun','sunday'],['hol','holidays']])if(params.has(key))$(id).checked=params.get(key)!=='false';}catch{}
historyMode=mode==='date'?'date':'work';setDates(start,end);update();renderHistory();if(params.get('legacy')==='1')toast('舊紀錄缺少完整設定；已重設為只排除週六、日，請確認條件後重新計算。');

document.querySelector('.plus-link').addEventListener('click',e=>{try{const a=$('start').value,b=$('end').value;const days=parseDate(b)-parseDate(a);const q=new URLSearchParams({start:a,days:String(days)});e.currentTarget.href='../plus/dark.html?'+q;}catch{}});
