const DAY=86400000;
export function dateNumber(value){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||value.startsWith('0000'))throw new Error('請選擇有效的起始日期。');
 const time=Date.parse(value+'T00:00:00Z');
 if(!Number.isFinite(time)||new Date(time).toISOString().slice(0,10)!==value)throw new Error('請選擇有效的起始日期。');
 return time/DAY;
}
export function addDays(value,offset){
 const start=dateNumber(value);
 if(typeof offset==='string'&&!/^[+-]?\d+$/.test(offset.trim()))throw new Error('天數請輸入正整數、負整數或 0。');
 const days=Number(offset);
 if(!Number.isSafeInteger(days))throw new Error('天數請輸入有效整數。');
 const end=start+days;
 if(end<dateNumber('0001-01-01')||end>dateNumber('9999-12-31'))throw new Error('結果超出可計算範圍（西元 1 至 9999 年）。');
 const result=new Date(end*DAY);
 return {start:value,days,date:result.toISOString().slice(0,10),startWeekday:new Date(start*DAY).getUTCDay(),weekday:result.getUTCDay()};
}
