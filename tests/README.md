# 瀏覽器回歸測試

在儲存庫根目錄安裝 Playwright（`npm install --no-save --package-lock=false playwright`），並執行 `npx playwright install chromium`。接著執行：

```
node tests/image-retry-sequence.cjs
```

測試自行啟動與關閉本機伺服器及瀏覽器，不修改故事或私人收藏。驗證新增分鏡 panel109 放大後顯示可見第7格、圖片請求失敗提示、重試成功與視窗保持開啟。圖片回應攔截時停用 Service Worker；此項不是離線快取或 iPhone 實機測試。

若使用既有安裝，可用 `PLAYWRIGHT_MODULE` 指定 Playwright 模組位置，`CHROME_PATH` 指定 Chrome 執行檔；不設定則使用標準 Playwright Chromium。測試檔案位置決定網站根目錄，不依賴啟動時的工作目錄。

其他歷史測試名稱列於除錯報告，尚未全部收錄於此目錄；不可把歷史執行紀錄當成此目錄可重跑的測試清單。

執行 `node tests/reader-resume.cjs` 驗證小說重新開啟及明確故事連結的可見定位。

