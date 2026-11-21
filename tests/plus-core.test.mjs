import test from 'node:test';import assert from 'node:assert/strict';import {addDays} from '../plus/core.mjs';
test('正數跨月與星期',()=>{assert.deepEqual(addDays('2026-01-31','1'),{start:'2026-01-31',days:1,date:'2026-02-01',startWeekday:6,weekday:0});});
test('負數與跨年',()=>{assert.equal(addDays('2026-01-01','-1').date,'2025-12-31');assert.equal(addDays('2026-12-31',1).date,'2027-01-01');});
test('0 天保留同一天',()=>assert.equal(addDays('2026-06-19',0).date,'2026-06-19'));
test('閏年與世紀年',()=>{assert.equal(addDays('2024-02-28',1).date,'2024-02-29');assert.equal(addDays('2026-02-28',1).date,'2026-03-01');assert.equal(addDays('2000-02-28',1).date,'2000-02-29');assert.equal(addDays('1900-02-28',1).date,'1900-03-01');});
test('西元 1 至 99 年不誤轉成 1900 年',()=>{assert.equal(addDays('0099-12-31',1).date,'0100-01-01');assert.equal(addDays('0001-01-01',0).date,'0001-01-01');});
test('日期與非整數驗證',()=>{for(const date of ['2026-02-29','2026-04-31','0000-01-01','', 'hello'])assert.throws(()=>addDays(date,1));for(const value of ['', ' ', '1.5', 'abc', '1e3',Infinity,NaN,1.1])assert.throws(()=>addDays('2026-01-01',value));});
test('結果範圍與過大數字',()=>{assert.throws(()=>addDays('0001-01-01',-1));assert.throws(()=>addDays('9999-12-31',1));assert.throws(()=>addDays('2026-01-01',Number.MAX_SAFE_INTEGER));assert.equal(addDays('9999-12-31',0).date,'9999-12-31');});
