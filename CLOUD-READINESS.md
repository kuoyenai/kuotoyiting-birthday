# 雲端開發入口與準備狀態

更新：2026-10-21（台北）。本輪範圍是**統整到雲端供後續開發，暫停功能優化**。網站維持App `20261021-78`；等使用者明確恢復開發後，再處理2D候選改善。每小時排程保持已刪除。

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

## 此對話的雲端執行環境

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
