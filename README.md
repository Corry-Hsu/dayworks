# Dayworks

Ad-free date and construction workday calculator with scroll-wheel date selection, Taiwan holiday exclusions, and searchable local project records.

包含工期兩種介面、滾動選日、工程紀錄，以及日期加減深淺兩版。工具已改為相對連結，支援 GitHub Pages 專案子路徑。

## GitHub Pages

1. 建立儲存庫，將本資料夾所有內容（包含 `.github`）上傳至 main 分支。
2. Settings → Pages → Source 選 GitHub Actions。
3. 在 Actions 執行 Deploy Pages，或推送 main 自動部署。

無需安裝依賴、建置、API 金鑰。`python3 -m http.server 8000` 可本機開啟；`npm test` 驗證計算。

## 紀錄

紀錄只在同網域瀏覽器 localStorage，搬到 GitHub Pages 不會自動帶入舊網域紀錄。請先在舊網站的工程紀錄頁匯出 JSON 留存。此專案不含個人紀錄、Git 歷史、金鑰或 Sites 識別碼。

## 結構

`between/` 日期工期與紀錄；`plus/` 日期加減；`tests/` 測試；`.github/workflows/pages.yml` 部署。

目前版假日內建2026–2027年。來源：https://www.dgpa.gov.tw/information?pid=12574&uid=83 。其他年請取消國定假日選項。

## 分頁結構（更新）

第一層為「日期計算／工程紀錄／日期加減」。日期計算第二層為「時間軸／色塊」，預設開啟時間軸；已移除月曆顯示模式。計算器內的互動月曆與滾動選日仍保留。舊 calendar.html 入口自動導向時間軸並保留查詢參數。日期加減的深淺風格亦在第二層。

## Taste 新版

新版原始碼位於 [`taste/`](taste/)，包含獨立 README、設計及檢查報告、18組測試與可直接部署的 `dist/`。GitHub Pages 部署完成後，可從 `taste/` 入口開啟新版；原版仍由網站根目錄開啟。兩套版本不需額外安裝依賴，Pages 流程會檢查兩套測試並一起部署。

同一 GitHub Pages 網域內兩版共用 localStorage 紀錄；其他 Sites 網域的紀錄不會自動帶入，可由舊站匯出後，在 Taste 工程紀錄頁匯入。

## 紀錄匯入

工程紀錄頁的「匯入舊紀錄」可讀取此工具匯出的JSON（最多5MB），合併兩種類型，略過相同ID，不覆蓋已存在項目；格式或寫入錯誤會顯示原因。

## 工作天推算完工日（目前版）

在日期計算選「推算完工日」，輸入開工日與正整數工作天數，設定開工當天是否計入第1個工作天，再設定排除週六、週日與國定假日。開工日若被排除，即使勾選計入也不會當成工作天。預定完工日會即時更新，並可存入工程紀錄；載回及跨風格切換會保留工作天數、計入方式與排除設定。

假日資料含2026與2027年，推算超出覆蓋年度時會提示停止；取消假日可單獨使用週末規則。2027/12/31包含2028元旦提前補假。資料來源詳見 HOLIDAYS.md。政府機關日曆不等同個別工程契約，颱風停工與專案自訂停工日未內建。Taste版維持既有功能及2026假日資料，未套用本次修改。
