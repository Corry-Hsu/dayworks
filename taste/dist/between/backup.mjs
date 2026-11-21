import {readRecords,writeRecords,validRecord,keyFor} from './records.mjs';
import {parseDate} from './date-core.mjs';
export function importBackup(text,storage=localStorage){
 let data;try{data=JSON.parse(text);}catch{throw new Error('檔案不是有效的 JSON。');}
 if(!data||!Array.isArray(data.work)||!Array.isArray(data.date))throw new Error('請選擇由「匯出紀錄」產生的 JSON 檔案。');
 for(const kind of ['work','date'])for(const r of data[kind]){
  if(!validRecord(r)||!r.id.trim())throw new Error('紀錄欄位不完整。');
  parseDate(r.start);parseDate(r.end);
  if(r.name!==undefined&&typeof r.name!=='string')throw new Error('工程名稱格式不正確。');
  if(r.options&&['saturday','sunday','holidays'].some(k=>typeof r.options[k]!=='boolean'))throw new Error('排除設定格式不正確。');
 }
 const before={},prepared={},counts={work:0,date:0,skipped:0};
 for(const kind of ['work','date']){
  before[kind]=storage.getItem(keyFor(kind));
  const old=readRecords(kind,storage),ids=new Set(old.map(r=>r.id));
  const added=data[kind].filter(r=>{if(ids.has(r.id)){counts.skipped++;return false;}ids.add(r.id);return true;});
  prepared[kind]=[...added,...old];counts[kind]=added.length;
 }
 const written=[];
 try{for(const kind of ['work','date'])if(counts[kind]){writeRecords(kind,prepared[kind],storage);written.push(kind);}}
 catch{let restored=true;for(const kind of written){try{if(before[kind]===null)storage.removeItem(keyFor(kind));else storage.setItem(keyFor(kind),before[kind]);}catch{restored=false;}}throw new Error(restored?'儲存空間不足或無法寫入；已還原原有紀錄。':'寫入及還原失敗，請先匯出現有紀錄留存。');}
 return {...counts,total:counts.work+counts.date};
}
