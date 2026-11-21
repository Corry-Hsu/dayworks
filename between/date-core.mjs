export const HOLIDAYS = Object.freeze({
'2026-01-01':'元旦','2026-02-15':'小年夜','2026-02-16':'除夕','2026-02-17':'春節','2026-02-18':'春節','2026-02-19':'春節','2026-02-20':'春節補假','2026-02-27':'和平紀念日補假','2026-02-28':'和平紀念日','2026-04-03':'兒童節補假','2026-04-04':'兒童節','2026-04-05':'清明節','2026-04-06':'清明節補假','2026-05-01':'勞動節','2026-06-19':'端午節','2026-09-25':'中秋節','2026-09-28':'教師節','2026-10-09':'國慶日補假','2026-10-10':'國慶日','2026-10-25':'臺灣光復暨金門古寧頭大捷紀念日','2026-10-26':'光復節補假','2026-12-25':'行憲紀念日',
'2027-01-01':'元旦','2027-02-04':'小年夜','2027-02-05':'除夕','2027-02-06':'春節','2027-02-07':'春節','2027-02-08':'春節','2027-02-09':'春節補假','2027-02-10':'春節補假','2027-02-28':'和平紀念日','2027-03-01':'和平紀念日補假','2027-04-04':'兒童節','2027-04-05':'清明節','2027-04-06':'兒童節補假','2027-04-30':'勞動節補假','2027-05-01':'勞動節','2027-06-09':'端午節','2027-09-15':'中秋節','2027-09-28':'教師節','2027-10-10':'國慶日','2027-10-11':'國慶日補假','2027-10-25':'臺灣光復暨金門古寧頭大捷紀念日','2027-12-24':'行憲紀念日補假','2027-12-25':'行憲紀念日','2027-12-31':'2028年元旦補假'
});
const DAY = 86400000;
export function parseDate(value) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('請輸入完整有效的日期。');
 const date=new Date(`${value}T00:00:00Z`);
 if(!Number.isFinite(+date)||date.toISOString().slice(0,10)!==value||value.slice(0,4)==='0000') throw new Error('請輸入完整有效的日期。');
 return +date / DAY;
}
export function difference(a,b) { const days=Math.abs(parseDate(b)-parseDate(a));return {days,inclusive:days+1}; }
export function workdays(a,b,{saturday=true,sunday=true,holidays=true}={}) {
 const start=parseDate(a),end=parseDate(b);
 if(end<start) throw new Error('工程終止日不可早於起始日。');
 if(holidays&&(a<'2026-01-01'||b>'2027-12-31')) throw new Error('國定假日資料僅涵蓋 2026–2027 年；請調整日期或取消勾選國定假日。');
 let excluded=0,weekends=0,holidayOnly=0;const excludedHolidays=[];
 for(let day=start;day<=end;day++) {
  const date=new Date(day*DAY),key=date.toISOString().slice(0,10),weekday=date.getUTCDay();
  const weekend=(saturday&&weekday===6)||(sunday&&weekday===0),holiday=holidays&&HOLIDAYS[key];
  if(weekend||holiday) excluded++;
  if(weekend) weekends++;
  if(holiday) {excludedHolidays.push({date:key,name:holiday,overlap:!!weekend});if(!weekend)holidayOnly++;}
 }
 return {calendar:end-start+1,working:end-start+1-excluded,excluded,weekends,holidayOnly,excludedHolidays};
}

export function completionDate(startValue,requested,{includeStart=true,saturday=true,sunday=true,holidays=true}={}) {
 const start=parseDate(startValue),days=Number(requested);
 if((typeof requested==='string'&&!/^\d+$/.test(requested.trim()))||!Number.isSafeInteger(days)||days<1)throw new Error('所需工作天數請輸入大於 0 的整數。');
 const max=parseDate('9999-12-31');if(days>max-start+1)throw new Error('工作天數超出可計算日期範圍。');
 const opts={saturday,sunday,holidays};let cursor=start+(includeStart?0:1),count=0;
 while(cursor<=max){const key=new Date(cursor*DAY).toISOString().slice(0,10);if(holidays&&(key<'2026-01-01'||key>'2027-12-31'))throw new Error('推算區間超出 2026–2027 年假日資料，請調整工期或取消勾選國定假日。');
 const weekday=new Date(cursor*DAY).getUTCDay(),rest=(saturday&&weekday===6)||(sunday&&weekday===0)||(holidays&&HOLIDAYS[key]);
 if(!rest&&++count===days){const countedStart=new Date((start+(includeStart?0:1))*DAY).toISOString().slice(0,10);const breakdown=workdays(countedStart,key,opts);const calendar=cursor-start+1;return {...breakdown,date:key,requested:days,includeStart,calendar,working:days,excluded:calendar-days,notCountedStart:!includeStart};}cursor++;}
 throw new Error('推算結果超出西元 9999 年。');
}
