# 雲端開發入口與準備狀態

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
