# 生日網站：Vercel 部署對照

目前 iOS 27.2 Safari 在 J-Pera 網址能使用圖示，生日網站的兩個最小對照頁都回退為首字。已核對兩站的 J-Pera PNG 位元完全一致，SHA-256 為 21D1CF1A41560F6E883A2B98F7A16221085D6E18CD760F512619EBE5AF9B3D58。不能再把圖片能 HTTP 200 或分享預覽有圖片當作修好。

下一個對照是將同一份生日網站部署到獨立 Vercel 網域根目錄。這會同時改變 origin、網址層級與 HTTP 回應，屬於部署環境比較，尚不能單獨證明 GitHub Pages 或 iOS 的哪個部分有問題。

## 已準備

- vercel.json：靜態 HTML 專案、不移除 .html 路徑、不改寫多頁導覽。
- manifest 與 Apple 圖示都使用相對路徑，可在根網域運作。
- sw.js、manifest 和 Apple 圖示採重新驗證，Apple PNG 明確以 inline 回傳。
- 原有生日電影、漫畫、四首歌、小卡收藏與願望維持不變；沒有複製 J-Pera 的 API 或 Firebase。

## 在 Vercel 新增專案

1. 用原本 J-Pera 使用的 Vercel 帳號進入 New Project。
2. 匯入 snooy791123/kuotoyiting-birthday。新增生日專案，勿取代 J-Pera。
3. Framework Preset 選 Other；Root Directory 保留儲存庫根目錄；不執行編譯；若需要指定 Output Directory，使用 .。
4. 不需要新增 API key、環境變數、資料庫或登入功能。
5. 部署後用正式 production 網址測試公開存取、兩個 icon-check 頁、正式首頁加入預覽、實際主畫面圖示與獨立視窗開啟。

GitHub Pages 原網址保留，尚未遷移對外生日連結。新網域的本機收藏、願望與閱讀進度不會自動取得舊網域資料；舊資料仍留在原開啟環境。

## 驗收

- A 圖示與 B 圖示是否成功。
- 正式首页是否使用邀請卡圖示；分享預覽不算。
- 是否從主畫面開啟獨立視窗。
- 音樂、下載、收藏、閱讀進度與願望是否正常。

目前沒有建立 Vercel 專案或取得 Vercel 網址，不能宣稱這個測試已部署或修復成功。
