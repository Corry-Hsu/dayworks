# 工程日期工作台（Taste 新版）

這是獨立新版；舊有日期工具網站不受影響。使用 design-taste-frontend 2.5.1 的配色／字體及微互動系統，依使用者工具需求改為應用程式介面，詳見 DESIGN.md。

## 功能

日期相隔、2026–2027臺灣工期、滾動選日、正負日期加減、工程命名紀錄、搜尋、載回、JSON匯出與匯入。儲存資料鍵與舊版相容。匯入僅接受完整紀錄檔，重複ID略過；格式錯誤不寫入。

## 本機執行

```sh
python3 -m http.server 8000 --directory dist
npm test
```

開啟 http://localhost:8000 。無需安裝依賴、無需編譯，`dist/` 可部署至任意靜態主機。兩工具以相對連結串接，支援 GitHub Pages 子路徑。GitHub Pages workflow 會上傳 dist。

## 紀錄搬移

舊站與此新版的網域不同，瀏覽器不會自動同步資料。請先在舊站工程紀錄頁「匯出紀錄」，再到新版工程紀錄頁「匯入舊紀錄」。所有紀錄仍只在該網域的瀏覽器，請持續匯出留存。

假日內建2026–2027年；其他年度須取消國定假日設定。工程契約與企業排休請依實際約定調整。

## 檢查

包含18組計算／資料測試、腳本語法及頁面資產檢查。Taste 的瀏覽器 gate 結果記錄於 VALIDATION.md；不能把環境錯誤當成通過。

## 授權與來源

字型來源為 Google Fonts：Funnel Display、Funnel Sans、DM Mono，授權見 dist/fonts 的 OFL 檔案。技能原樣複製的動態資產來源 https://github.com/Leonxlnx/taste-skill 。國定假日依 https://www.dgpa.gov.tw/information?pid=12574&uid=83 。

2027官方資料：https://www.dgpa.gov.tw/information?pid=12983&uid=2 。包含2027/12/31的2028年元旦提前補假，預設週末及假日共121休假天、244工作天。本次只同步假日，未加入目前版的工作天推算完工日功能。
