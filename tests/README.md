# 瀏覽器回歸測試

在儲存庫根目錄安裝 Playwright（`npm install --no-save --package-lock=false playwright`），並執行 `npx playwright install chromium`。接著執行：

```
node tests/image-retry-sequence.cjs
```

測試自行啟動與關閉本機伺服器及瀏覽器，不修改故事或私人收藏。驗證新增分鏡 panel109 放大後顯示可見第7格、圖片請求失敗提示、重試成功與視窗保持開啟。圖片回應攔截時停用 Service Worker；此項不是離線快取或 iPhone 實機測試。

若使用既有安裝，可用 `PLAYWRIGHT_MODULE` 指定 Playwright 模組位置，`CHROME_PATH` 指定 Chrome 執行檔；不設定則使用標準 Playwright Chromium。測試檔案位置決定網站根目錄，不依賴啟動時的工作目錄。

其他歷史測試名稱列於除錯報告，尚未全部收錄於此目錄；不可把歷史執行紀錄當成此目錄可重跑的測試清單。

執行 `node tests/reader-resume.cjs` 驗證小說重新開啟及明確故事連結的可見定位。



## 2D選曲與跨引擎檢查（App75）

`node tests/explore-music.cjs` 檢查六種尺寸下的選曲、同首連續、手動靜音、返回與保存，並在390／1280用實際音訊片尾驗證四曲循環。執行會開啟測試音訊，瀏覽器使用無頭模式。

可用相同斷言補做桌面WebKit：先 `npx playwright install webkit`，再執行 `node tests/run-engine.cjs webkit explore-music.cjs`。runner只替換瀏覽器啟動引擎，不修改產品或斷言；非Chromium忽略CHROME_PATH。支援標準PLAYWRIGHT_BROWSERS_PATH。其他例：`node tests/run-engine.cjs webkit tablet-navigation.cjs` 或 `node tests/run-engine.cjs webkit explore-complete-journey.cjs`。

這是桌面WebKit引擎檢查，不能代替iPhone／iPad Safari與加入主畫面實機測試。App74的實機回覆及App75待確認範圍見release-20261019-75-music.json。


App76獨立收尾檢查：`node tests/story-integrity.cjs` 斷言95格章節數、17個補充分鏡入口、終章連續編號、100張唯一小卡與有效故事連結，以及斑比原圖／兩個保存連結；`node tests/explore-music-race.cjs` 驗證快速選曲／靜音、接近片尾換歌與反覆開關視窗的歷史穩定性。兩者沿用PLAYWRIGHT_MODULE及CHROME_PATH設定；未指定CHROME_PATH時使用Playwright Chromium。後者為Chrome邊界測試，不宣稱為iOS實機。


## 自願分享願望（App77）

`node tests/wish-sharing.cjs` 檢查四入口、五種尺寸的保留／明確同意／固定收件信箱、純文字預覽、重複點按、錯誤保留、Escape及返回。用 `node tests/run-engine.cjs webkit wish-sharing.cjs` 沿用相同斷言；填寫採實際點擊文字框再輸入，音樂外殼內頁先等載入完成。這兩項測試攔截FormSubmit回應，不寄信。Chrome／桌面WebKit不等同iPhone Safari實機。

真實寄信需要收件人先點FormSubmit的Activate Form啟用信。啟用狀態與實際投遞必須另行確認；不得以模擬success或HTTP200當作寄達證據，也不得以訪客已存的願望測試。本次真實服務設定測試已獲success=true接受；正式部署仍須另讀回核對。

正式App77的實際UI寄送與兩站讀回結果見release-20261021-77-wish.json；服務已接受驗收測試，未讀取收件匣或訪客願望。不要為重跑瀏覽器回歸而寄真實郵件，wish-sharing.cjs應維持服務攔截。

## 直接分享與自由選章（App78）

`node tests/letter-sharing.cjs` 或 `node tests/run-engine.cjs webkit letter-sharing.cjs`：兩個生日信入口×五尺寸，保留收藏／草稿／文字與SVG下載，檢查單擊直接寄送、明確可見收件人及服務說明、等待／防重複、錯誤／離線及願望／回信互不覆蓋。使用者已要求取消第二次確認，測試明確斷言沒有分享確認視窗。20組全過；另wish-sharing.cjs原四入口40組以同一直接寄送流程全過。所有服務回應攔截，不寄真實信。

`node tests/explore-free-chapters.cjs` 驗證全章可選、跳章／重新載入／返回位置、稀疏已讀、舊存檔與正確星光判定；`node tests/explore-complete-journey.cjs` 逐格核對95格、自動行走及固定場景。皆可用run-engine.cjs指定桌面WebKit。正式結果與部署見release-20261021-78-letter.json，不冒稱實機或真實收件匣驗收。

## 直接分享與自由選章（App78）

`node tests/letter-sharing.cjs` 或 `node tests/run-engine.cjs webkit letter-sharing.cjs`：兩個生日信入口×五尺寸，保留收藏／草稿／文字與SVG下載，檢查單擊直接寄送、明確可見收件人及服務說明、等待／防重複、錯誤／離線及願望／回信互不覆蓋。使用者已要求取消第二次確認，測試明確斷言沒有分享確認視窗。20組全過；另wish-sharing.cjs原四入口40組以同一直接寄送流程全過。所有服務回應攔截，不寄真實信。

`node tests/explore-free-chapters.cjs` 驗證全章可選、跳章／重新載入／返回位置、稀疏已讀、舊存檔與正確星光判定；`node tests/explore-complete-journey.cjs` 逐格核對95格、自動行走及固定場景。皆可用run-engine.cjs指定桌面WebKit。正式結果與部署見release-20261021-78-letter.json，不冒稱實機或真實收件匣驗收。
