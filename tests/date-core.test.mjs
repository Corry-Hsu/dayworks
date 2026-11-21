import test from 'node:test';
import assert from 'node:assert/strict';
import {difference,workdays,parseDate,HOLIDAYS} from '../between/date-core.mjs';
test('同日、反向日期、跨閏日與跨年',()=>{
 assert.deepEqual(difference('2026-01-01','2026-01-01'),{days:0,inclusive:1});
 assert.deepEqual(difference('2024-03-01','2024-02-28'),{days:2,inclusive:3});
 assert.equal(difference('2025-12-31','2026-01-01').days,1);
 assert.equal(difference('0099-12-31','0100-01-01').days,1);
});
test('拒絕無效日期',()=>{for(const value of ['2026-02-29','2026-04-31','','hello','0000-01-01'])assert.throws(()=>parseDate(value));});
test('春節區間與週末重疊不重複扣除',()=>{const result=workdays('2026-02-14','2026-02-22');assert.equal(result.calendar,9);assert.equal(result.working,0);assert.equal(result.excluded,9);assert.equal(result.weekends,4);assert.equal(result.holidayOnly,5);assert.equal(result.excludedHolidays.length,6);});
test('只排週六、只排週日、不排除任何日期',()=>{
 assert.equal(workdays('2026-01-01','2026-01-07',{saturday:true,sunday:false,holidays:false}).working,6);
 assert.equal(workdays('2026-01-01','2026-01-07',{saturday:false,sunday:true,holidays:false}).working,6);
 assert.equal(workdays('2026-01-01','2026-01-07',{saturday:false,sunday:false,holidays:false}).working,7);
 assert.equal(workdays('2026-02-15','2026-02-15',{saturday:false,sunday:false,holidays:true}).working,0);
});
test('國慶補假與假日重疊',()=>{const r=workdays('2026-10-09','2026-10-12');assert.equal(r.working,1);assert.equal(r.excludedHolidays.length,2);assert.equal(r.excludedHolidays[1].overlap,true);});
test('非2026年度不能靜默套用假日，可單獨使用週末規則',()=>{
 assert.throws(()=>workdays('2025-12-31','2026-01-02'),/2026/);
 assert.equal(workdays('2025-12-31','2026-01-02',{holidays:false}).working,3);
 assert.throws(()=>workdays('2026-01-02','2026-01-01'),/不可早於/);
});
test('2026全年應有365個日曆天、120天休假及245工作天',()=>{const r=workdays('2026-01-01','2026-12-31');assert.equal(Object.keys(HOLIDAYS).length,22);assert.equal(r.calendar,365);assert.equal(r.excluded,120);assert.equal(r.working,245);});
