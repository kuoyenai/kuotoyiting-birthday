# 雲端開發入口與準備狀態

## 2026-10-29｜修正實寄測試並核對原生日信（驗收工具待讀回）

- 本輪從main `fcffbc6` 接續。使用者要求持續修正到真實寄信成功，並指出原生日信曾成功、目前似乎也失效；任務仍未完成，不能把測試修正當成寄達。
- 已讀取上次成功的 `tests/release-20261021-78-letter.json`：2026-10-20 21:55:53 UTC，原生日信正式UI取得HTTP200／success="true"。目前 `wish-sharing.js` 與該版本程式一致（LF正規化SHA256 `7eee3dbff351962b348ebb85c08f94cdc2792f92c156de584b620f671b004146`），Git紀錄自 `90d5a07` 起未改；收件人與端點沒有換掉。
- 最新只讀檢查取得FormSubmit HTTP403／error code1010；Playwright API預檢仍回521。這些為本輪雲端路徑的存取／上游失敗，不能據此判定全球故障、Gmail拒收或需要重啟信箱。沒有使用代理繞路、偽裝瀏覽器、no-cors或關閉TLS。
- 修正測試：只讀診斷在預檢失敗時以非0退出；真實腳本先檢查CORS預檢，未就緒不開瀏覽器、不點入口。本輪實際執行回521，立即以exit1阻擋，0次新提交。服務必須HTTP200且success為布林true或字串"true"，啟用要求不算成功。
- 新增 `tests/entry-notify-owner.html` 與JS：供擁有者手動測原生日信、開啟星光之門、略過開場，直接載入正式 `wish-sharing.js`／`entry-notify.js`。載入不寄信，只有按下測試按鈕提交一次固定合成資料；以noopener新分頁分開測，顯示真實HTTP／JSON結果供回報。不讀已存私人內容、不改正常訪客介面；這是公開手動診斷頁，非有驗證的管理後台。
- 新增20項預檢／接受判定模擬檢查、12組三流程Chromium診斷頁模擬情境及選單檢查，均通過且攔截所有寄信。16項原入口單元、JS語法及App80 audit通過。App維持 `20261029-80`；本輪只改測試／文件，未修改實際分享或入口程式。
- 證據 `tests/release-20261029-80-entry-followup.json`；推送後需讀回兩站的新診斷檔案，再由可正常使用服務的瀏覽器取得真實回應，或由FormSubmit解除存取限制。服務接受後仍需使用者確認Gmail實際收件，才能完成真實寄達驗收。
- 95格、100卡、四曲、原畫、自由選章／真實已讀、原主動分享及取消排程保持；不為了取得綠燈跳過失敗條件或不停重寄。

## 2026-10-29｜App80兩站已讀回；入口通知尚未寄達驗收

- 程式提交 `a1c79208a59fe6b5f6b2a3932288c8d068238e3c` 已在main；Vercel與GitHub Pages部署成功。兩站各20份正式檔案SHA256全部相符（40/40），App `20261029-80` 已讀回，舊 `/api/entry-notify` 回404，確認移除。網站上線不代表通知寄達。
- 已依原本 `wish-sharing.js` 的直接FormSubmit AJAX設計，從兩個入口以背景fetch提交固定欄位；英文隱私頁據實揭露直接連線資料。無await阻擋開場、無寄送狀態／信箱介面、同分頁最多一次、無自動重試。
- 有授權的正式合成點擊：台北10/29 13:47:16「開啟星光之門」、13:47:42「略過開場」。兩次只觀測到瀏覽器提交嘗試，均未取得FormSubmit HTTP回應／success JSON；不能說服務收到POST或已寄出。使用者回覆「尚未收到」，實際投遞驗收未通過。
- 後續不寄信診斷：FormSubmit OPTIONS預檢及說明頁GET回HTTP521，瀏覽器缺少Access-Control-Allow-Origin而失敗；外部網頁讀取說明頁亦回521。這是本輪可觀測到的服務連線阻礙，不能據此斷定所有訪客皆遇到同樣問題、信箱未啟用或Gmail拒收。
- 原App79轉送於台北13:23:42回503，已由App80移除。未為了改測試結果反覆發信，也未改成no-cors、不繞過存取／TLS限制、不改原主動分享服務。
- 本機16項通知單元、19組入口／英文頁、20組生日願望、10組未來回信及App審核通過（全部模擬）。新增兩站正式Chromium UI通過（390直向／844橫向）：通知攔截延遲期間仍可進場、底部小字與英文頁正確、無寄信提示；這兩次沒有真實寄信。環境提供的公開CA暫時信任已清理，原有信任項目保留。
- 證據：`tests/release-20261029-80-entry.json`；安全連線診斷 `tests/entry-notify-transport.cjs` 只允許GET／HEAD／OPTIONS。真實測試必須明確opt-in，已將「瀏覽器嘗試」與「服務接受／收件匣寄達」分開記錄。
- 待完成：FormSubmit連線及預檢恢復後，才進行新的有限次合成驗收；需服務接受及擁有者實際收件確認，才能稱兩個入口真實寄達。現階段沒有服務設定或信箱證據可直接修正，勿只重寄或冒稱成功。可在不發信模式檢查 `tests/entry-notify-transport.cjs`。
- 本輪後續只更新診斷／測試與雲端紀錄，App維持80。95格、100卡、四曲、真實已讀／自由選章、PLAVE原畫、原分享、穩定標籤及取消排程保持；其他2D優化暫停。


## App79部署讀回確認（2026-10-29）

程式提交`2c2c0bfb40659e870ea4b072709d849879db1337`已推main；Vercel與GitHub Pages部署成功。已從兩個正式網址各讀回20份檔案，40份SHA256全部與已測程式相符，確認App`20261029-79`及英文說明頁實際上線。Vercel API的兩站Origin GET／OPTIONS及無效事件POST共5項通過，全部在寄信分支之前返回，沒有寄真實測試信。

最下方「隱私與非官方聲明」為10.5px小字、44px點擊範圍；開場不顯示寄送狀態或信箱。19組本機入口／隱私頁、30組原分享回歸及26項通知單元檢查通過。正式站額外Chromium UI探測因本環境代理憑證`ERR_CERT_AUTHORITY_INVALID`而未載入；未關閉TLS驗證。使用正常TLS驗證的正式HTTP內容讀回與API檢查已通過，不把代理環境錯誤稱為網站憑證錯誤，也不把本機結果冒稱正式UI／Safari實機驗收。

通知的FormSubmit真實接受、收件匣投遞與已讀沒有驗證，不應把「API存在／模擬接受」當成已寄達。正式HTTP證據已存入`tests/release-20261029-79-entry.json`；這次後續提交只更新紀錄與可重跑的正式UI測試，不改App79產品檔案。原95格、100卡、四曲、原畫、已讀／選章、主動分享、穩定標籤及取消排程均保持。


## 2026-10-29｜英文隱私／創作說明與入口背景通知（App79已讀回）

- 使用者本輪僅授權英文說明頁與入口通知，2D其他優化仍暫停，排程保持取消。以main `45b3eea`為基準保存；發布結果以`tests/release-20261029-79-entry.json`最新紀錄為準，尚未讀回時不宣稱上線。
- `privacy.html`／`privacy.css`全頁英文，收錄非官方、非營利、權利歸屬、虛構對白及實際資料用途；明確說明入口點擊會寄送通知，未偽裝成純次數統計。原共用頁尾長文改為連結，故事中必要的虛構提示保留。
- 依使用者最後調整，開場的「隱私與非官方聲明」放在畫面最下方，10.5px小字、44px點擊範圍；其他頁的連結也維持小字。短橫向畫面保留完整進場按鈕，不被底部連結遮住。
- `entry-notify.js`只在「開啟星光之門」或「略過開場」click時，用不等待回應的`fetch`／`keepalive`於背景送出。同分頁最多嘗試一次、不自動重試；載入、Escape、開啟隱私頁或其他按鈕都不通知。開場沒有寄送進度、結果、收件人或信箱文字。
- `api/entry-notify.js`由Vercel轉送既有FormSubmit收件端點，只接受兩站正式origin及固定入口枚舉，由伺服器產生時間。拒絕多餘欄位，不轉送訪客IP、裝置、網址、願望、回信或已讀資訊，不建立訪客資料庫；通知不能確認訪客身分。寄信服務與主機的自身連線日誌已在英文說明揭露。
- 候選App／SW／PWA／入口快取及盤點同步`20261029-79`。原素材、95格、100張小卡、四曲、原YITING、自由選章／真實已讀及主動分享流程保留；不移動穩定標籤。
- 驗證全過：Node通知／隱私26項；Chromium入口與英文頁19組（320、390、568橫向、844橫向、820、1280，含服務延遲／失敗、減少動態、儲存限制、Escape與返回）；原生日願望20組、未來回信10組；App版本審核、JS語法、10頁連結與故事95／小卡100／四曲資料核對。已檢視390直向、844橫向及320英文頁畫面。
- 先前socket阻擋已在使用者核准後解決，未重複要求功能確認。所有寄信回歸均攔截模擬，未寄真實驗收信、未讀訪客內容。測試為桌面Chromium模擬尺寸，不等同WebKit／iPhone／iPad Safari實機；本地影音未全量下載，未重跑完整95格或電影播放。
- 發布前本機檢查已完成。推送後執行`python3 tests/entry-notify-deployment.py`逐站比對20份正式檔案雜湊，並用不寄信的GET／OPTIONS／無效事件驗證API。服務接受與收件匣實際投遞不是本輪驗收結論；未有新明確授權，不寄真實測試信。


歷史快照：2026-10-21（台北）。當時範圍是**統整到雲端供後續開發，暫停功能優化**。網站維持App `20261021-78`；等使用者明確恢復開發後，再處理2D候選改善。每小時排程保持已刪除。

## 可以從哪裡接續

- 原始碼與已採用素材：[kuoyenai/kuotoyiting-birthday](https://github.com/kuoyenai/kuotoyiting-birthday)，以最新`main`為準。網站就在儲存庫根目錄。
- 本輪盤點基準：`bd05c52ec77fba4b99b49470f645deb1c9167786`，樹`d4cc9243edb1b7db4aab1d69dd7d3b821a853167`。後續整理提交會增加文件，這個數量快照不代表永遠固定的總檔數。
- 網站功能基準：App78程式`90d5a07`、部署紀錄`a4e842b`；本輪未變更網站程式或驗收新部署。
- 指定穩定備份：`yiting-stable-20261019-v74`，已解參照確認指向`2ea28244ecc0348409caed5533c34acdf4b3f926`，沒有移動標籤。
- 讀取本輪基準時開啟中的PR為0；新任務仍須重新查詢最新main與PR。

## 雲端資料已核對

| 項目 | 本輪實際核對 |
| --- | --- |
| GitHub檔案 | 基準共有699份blob，含126份tests目錄檔案 |
| 網站素材 | assets共367份，Git blob大小合計414,763,825 bytes |
| 小說故事 | 執行資料檔確認10章、78基礎格＋17補充格＝95格，95個唯一素材ID；對應插畫路徑均在Git |
| 祝福小卡 | 執行小卡資料定義確認100張、100個唯一素材ID；對應插畫路徑均在Git |
| 歌曲 | 四首曲目及各自音訊／MP4路徑均在Git |
| 完整收錄 | `assets/downloads/YITING-100-photocards.zip`，Git大小81,206,373 bytes |
| 完整小說 | `novel-comic-source.js` |
| 官方角色參考 | `assets/reference-yejun.jpg`、`assets/reference-noah-bamby.jpg`、`assets/reference-eunho-hamin.jpg` |
| 六人同行概念 | `art-reviews/references/cohort-walking-concept.jpg` |
| 功能與產圖交接 | `AGENTS.md`、`CODEX-CLOUD-HANDOFF.md`、`game-art-prompts.json`、`art-reviews/`與`tests/README.md` |

這是固定提交的Git樹與文字資料核對；未重新下載解碼全部圖片／影音，也未解壓驗證ZIP。既有完整瀏覽器與ZIP驗收仍可查歷史release紀錄，不算本輪重跑。舊`inventory-current.json`記錄assets為414,763,826 bytes，與本輪遠端blob加總差1 byte；原因未逐檔確認，本輪保留產品盤點與素材原樣。

現行網站所需程式、原畫與下載素材可從GitHub取得，不需要公司電腦路徑。Git內沒有`sources/`檔案；若另有這個目錄則保持唯讀。未採用生成原檔、私人原始照片、舊對話全文、測試截圖及個人瀏覽器願望／進度不包含在這次Git資料完整性結論中；既有4份未使用本機暫存素材詳見交接文件。

## 2026-10-21雲端環境快照（新增驗證見頁首）

| 項目 | 狀態 |
| --- | --- |
| GitHub連線 | 可讀取main、檔案、樹、標籤與PR；本輪交接以GitHub提交保存 |
| Node／Python | Node 24.19.0、Python 3.12.14可用 |
| Playwright | 環境已有1.62.1 |
| 完整Git checkout | 尚未完成。CLI clone因代理連線失敗，額外網路請求已取消；後續改用既有GitHub連線讀取 |
| 工作檔案 | 只取回文字原始檔與審核所需圖示副本，不是完整clone；沒有可宣稱的本機main／origin同步狀態 |
| 靜態審核 | 本輪實跑`python3 audit.py`通過App78的版本、manifest、七頁與PNG圖示尺寸 |
| 瀏覽器 | 系統Chromium 154.0.8037.57存在；啟動時`setsockopt: Operation not permitted`，程序SIGTRAP退出 |
| Playwright瀏覽器包 | 預設Chromium headless-shell不在環境；未完成Chromium／WebKit安裝與功能驗收 |
| 寄信／訪客資料 | 未寄真實測試信、未讀取訪客內容 |
| 發布／排程 | 本輪只整理文件，不升App、不改部署設定、不重開排程 |

**GitHub資料可接續；完整雲端開發環境仍待驗收。** 實際證據見[cloud-handoff-20261021.json](tests/cloud-handoff-20261021.json)。不要把這個暫存文字副本目錄當成完整備份，也不要把「已安裝Playwright」當作「瀏覽器可執行」。

## 下一次先完成環境準備

1. 在有儲存庫存取與命令列網路權限的雲端環境，選取／完整clone最新main。已有工作目錄時先檢查`git status --short --branch`、`git log -5 --oneline`，再取得遠端；保護未提交工作。
2. 在儲存庫根目錄使用Node>=20與Python3。沿用環境已安裝的Playwright；若需安裝，使用下列交接命令。瀏覽器系統依賴與本機socket必須獲環境允許；具體失敗逐項記錄，不關閉安全限制或寫入憑證。
3. 完整checkout後跑靜態審核與一項初始化瀏覽器測試，確認素材可載入、頁面可操作、截圖輸出可寫。此階段不改故事或UI。
4. 更新本文件及CLOUD-STATUS.md，將實際成果提交GitHub。準備完成後等使用者明確恢復開發。

```bash
# 儲存庫根目錄；依環境需要執行，並非本輪已完成紀錄
npm install --no-save --package-lock=false playwright@1.62.1
npx playwright install --with-deps chromium webkit
mkdir -p ../material-review
python3 audit.py
node tests/explore-responsive.cjs

# 手動預覽；測試腳本本身會自行啟停測試伺服器
python3 -m http.server 8000 --bind 127.0.0.1
```

Playwright解析環境已可用時無需重裝。不沿用Windows的CHROME_PATH；有另外安裝的系統瀏覽器時才依實際位置設定。桌面Chromium／WebKit不代表iPhone／iPad Safari或主畫面PWA實機驗收。

## 恢復開發時的固定保留條件

95格原順序、100卡與完整ZIP、四曲／選曲／手動靜音、原YITING與正確同行、連續地圖與原地蛋糕對話、自由選10章與真正已讀都保留。按「分享給Kuo」立即透過既有FormSubmit寄給`kuoyen.ai@gmail.com`，保留可見說明；輸入、載入、收藏及下載不能寄信，回歸測試攔截服務。完整規則以AGENTS.md為準。

之後有產品變更並獲發布授權時，沿既有main／Vercel／Pages流程，驗證後發布，讀回正式版本才稱上線。本輪只整理交接，沒有新的產品上線結論。
