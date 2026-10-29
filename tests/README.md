# 瀏覽器回歸測試

## 修正實寄前置檢查與手動驗收工具（2026-10-29）

`node tests/entry-notify-readiness.test.cjs`：20項全模擬檢查。`CHROME_PATH=/usr/bin/chromium node tests/entry-notify-owner.cjs`：三流程×接受／false／啟用／網路失敗共12組，另核對選單載入0寄信，所有外部請求攔截。`entry-notify-real.cjs`現先做只讀OPTIONS預檢，不通即exit1、0次提交；`entry-notify-transport.cjs`在服務不就緒時也exit1，不再以完成診斷冒充檢查通過。

`tests/entry-notify-owner.html`為公開手動工具，已由9042daa發布並完成雙站16/16讀回，以正常瀏覽器開啟；三個連結用noopener新分頁，每頁手動點一次。原生日信用實際`wish-sharing.js`與固定合成回信；兩入口用實際`entry-notify.js`與正式欄位，不讀舊願望或回信。結果包含HTTP／success／精確時間；需要回報服務結果並另外確認Gmail收件。這不是有認證的私人管理頁，不加入一般導覽，不填秘密。正式入口介面不加入任何診斷提示。

本輪原分享程式與成功App78一致（LF正規化SHA256為7eee3dbff351962b348ebb85c08f94cdc2792f92c156de584b620f671b004146）。雲端觀測403／error code1010與521，實寄腳本已在預檢擋下，沒有再寄信；尚待有效的真實接受及擁有者收件確認。證據`release-20261029-80-entry-followup.json`。

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


## 自願分享願望（App77歷史範圍；目前測試行為以App78為準）

`node tests/wish-sharing.cjs` 檢查四入口、五種尺寸的保留／明確同意／固定收件信箱、純文字預覽、重複點按、錯誤保留、Escape及返回。用 `node tests/run-engine.cjs webkit wish-sharing.cjs` 沿用相同斷言；填寫採實際點擊文字框再輸入，音樂外殼內頁先等載入完成。這兩項測試攔截FormSubmit回應，不寄信。Chrome／桌面WebKit不等同iPhone Safari實機。

真實寄信需要收件人先點FormSubmit的Activate Form啟用信。啟用狀態與實際投遞必須另行確認；不得以模擬success或HTTP200當作寄達證據，也不得以訪客已存的願望測試。本次真實服務設定測試已獲success=true接受；正式部署仍須另讀回核對。

正式App77的實際UI寄送與兩站讀回結果見release-20261021-77-wish.json；服務已接受驗收測試，未讀取收件匣或訪客願望。不要為重跑瀏覽器回歸而寄真實郵件，wish-sharing.cjs應維持服務攔截。

## 直接分享與自由選章（App78）

`node tests/letter-sharing.cjs` 或 `node tests/run-engine.cjs webkit letter-sharing.cjs`：兩個生日信入口×五尺寸，保留收藏／草稿／文字與SVG下載，檢查單擊直接寄送、明確可見收件人及服務說明、等待／防重複、錯誤／離線及願望／回信互不覆蓋。使用者已要求取消第二次確認，測試明確斷言沒有分享確認視窗。20組全過；另wish-sharing.cjs原四入口40組以同一直接寄送流程全過。所有服務回應攔截，不寄真實信。

`node tests/explore-free-chapters.cjs` 驗證全章可選、跳章／重新載入／返回位置、稀疏已讀、舊存檔與正確星光判定；`node tests/explore-complete-journey.cjs` 逐格核對95格、自動行走及固定場景。皆可用run-engine.cjs指定桌面WebKit。正式結果與部署見release-20261021-78-letter.json，不冒稱實機或真實收件匣驗收。


## Codex雲端

使用儲存庫根目錄的CODEX-CLOUD-HANDOFF.md準備Node>=20、Python3及Playwright／瀏覽器，建立可寫的截圖輸出目錄。不要沿用Windows的CHROME_PATH。舊tests/invariants.cjs需0770fb2e5cea862df1f1a39a9553c25eb84a2930歷史Git物件，淺層checkout須先取得；其他列出的瀏覽器測試不需本機舊material-review內容。文件交接不等於雲端已經跑過測試。


## 英文隱私頁與入口背景通知（App79）

`node tests/entry-notify.cjs`通過26項通知與relay檢查，包含載入零通知、延遲fetch不阻擋click、兩個入口與同分頁去重、儲存／網路失敗、固定欄位、CORS與錯誤輸入拒絕，以及全英文聲明。服務全部模擬，不寄真實信。

`CHROME_PATH=/usr/bin/chromium node tests/entry-notify-browser.cjs`為此環境已發現的系統瀏覽器用法；其他環境依實際位置設定，或省略CHROME_PATH使用Playwright瀏覽器。19組檢查涵蓋六種尺寸的兩個入口、底部小字／44px、短橫向完整按鈕、延遲與失敗、減少動態、儲存失敗、Escape及英文頁往返。所有外部請求攔截，截圖與結果放在`../material-review`。使用者核准後已可啟動本機測試socket，先前EPERM不再是當前阻擋。

本輪另通過`tests/wish-sharing.cjs` 20組及`tests/letter-sharing.cjs` 10組Chromium回歸，保留原主動分享、收藏／下載與資料隔離；沒有真實寄信。未全量下載本機媒體，沒有重跑整本95格、電影／音樂播放或WebKit／iOS實機；不要擴大聲稱驗收範圍。

發布後跑`python3 tests/entry-notify-deployment.py`：讀回兩站各20份正式檔案並與當前檔案SHA256比對，只以GET／OPTIONS／無效事件POST驗證Vercel函式，這些探測不會呼叫寄信服務。結果放在`../material-review/entry-notify-deployment-results.json`。它不驗證FormSubmit實際接受或收件匣投遞；不新增真實驗收信。


正式站額外UI檢查：`CHROME_PATH=/usr/bin/chromium node tests/entry-notify-live.cjs`會讀兩站實際HTML／CSS／字型並攔截有效入口通知POST；其他FormSubmit與非GET外部請求亦會阻擋，避免寄真實信。App79曾因代理CA的`ERR_CERT_AUTHORITY_INVALID`未載入；App80已暫時信任環境提供的公開CA後完成兩站UI驗證，未忽略TLS錯誤，結束已移除暫存項目並保留原有信任設定。App80的40份正式檔案及舊API移除讀回亦通過；正式UI模擬寄信不代表真實投遞。


## App80：參照原分享設計的直接FormSubmit入口通知

`node tests/entry-notify.cjs`為16項直接AJAX檢查；`tests/entry-notify-browser.cjs`仍為19組，但現在攔截FormSubmit本身，檢查固定欄位、origin-only referrer與背景JSON消耗。20組wish-sharing／10組letter-sharing亦在此候選版重跑通過，全部模擬。

`python3 tests/entry-notify-deployment.py`現在只讀兩站40份正式檔案，並GET確認舊relay回404／410；它不會向FormSubmit POST，也不代表真實寄達。

只有網站擁有者明確授權時，才執行`CHROME_PATH=/usr/bin/chromium node tests/entry-notify-real.cjs --send-two-real-notifications --recipient=kuoyen.ai@gmail.com`。沒有兩個opt-in參數時會SKIP。腳本使用兩個全新合成瀏覽器情境，在正式App80點擊gate及skip，最多放行2次真正FormSubmit POST，不修改寄送欄位／主旨，不讀訪客資料；以主旨及精確時間辨識驗收信。服務必須HTTP200且JSON success為true才記為接受；回應與動作皆有限時，無自動重試。輸出在`../material-review/entry-notify-real-results.json`，不等於已確認收件匣投遞。

App79第一輪真實請求回503，原始回應另保存；不要將它冒稱成成功寄信。瀏覽器代理CA只能信任環境已配置的公開憑證，不關閉TLS驗證，不提交本機憑證資料庫或診斷程序完整日誌。

## App80真實投遞未通過（2026-10-29）

兩站40檔案與攔截通知的正式UI通過。台北13:47:16／13:47:42的gate／skip合成點擊僅觀測到瀏覽器提交嘗試，未收到FormSubmit HTTP／success回應；擁有者回覆「尚未收到」。後續只讀OPTIONS預檢與說明頁GET回521，瀏覽器報缺少CORS標頭。完整證據見 `release-20261029-80-entry.json`。不要將route攔截計數當成遠端已收到POST。

只讀診斷：`CHROME_PATH=/usr/bin/chromium node tests/entry-notify-transport.cjs`。它不點入口，只允許GET／HEAD／OPTIONS、封鎖其他method及影音，輸出 `../material-review/formsubmit-connection-diagnostics.json`；此診斷不寄信。需正常網路及TLS信任設定，不使用忽略憑證或no-cors繞過錯誤。故障恢復後再進行有限次實寄驗收，必須另取得擁有者收件確認。

真實腳本的 `browserPostAttempts`／`browserPostAttempted` 僅表示瀏覽器提交嘗試；`providerAccepted` 要求HTTP200加success JSON，與 `inboxDeliveryConfirmed` 分開。此輪沒有服務回應，不能推斷收件人啟用或Gmail設定有誤。正常測試均攔截寄信。
