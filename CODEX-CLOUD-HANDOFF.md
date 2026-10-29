# YiTing Birthday｜Codex雲端製作與接續指令

> **最新實寄排查：** 已核對原生日信與成功App78程式一致；本輪雲端FormSubmit回403／1010或521。實寄腳本新增前置預檢，失敗以exit1停止且0次新提交；公開手動診斷頁 `tests/entry-notify-owner.html` 可測原生日信／兩入口，載入不寄信。推送後先正式讀回，再取得服務回應與實際收件證據；目前不可稱成功。詳見 `tests/release-20261029-80-entry-followup.json`。

> **App80最新接續：** `a1c7920`已在兩站讀回40/40正式檔案，兩站攔截寄信的正式Chromium UI也通過。台北13:47:16與13:47:42的入口合成點擊未取得FormSubmit接受回應，使用者回覆「尚未收到」。不寄信診斷的FormSubmit預檢／說明頁回521並缺少CORS允許標頭；真實寄達尚未驗收成功，勿盲目重寄或假稱上線即投遞。先用`tests/entry-notify-transport.cjs`做只讀診斷，再依CLOUD-STATUS.md／tests/release-20261029-80-entry.json接續。


> **2026-10-29接續：** 本輪新增英文隱私／創作說明與兩個入口按鈕的背景通知。說明連結已依最後要求移至最下方小字，其他2D優化仍暫停。App79已推main，兩站40份正式檔案及5項不寄信API檢查已讀回通過；完整證據與驗收限制見CLOUD-STATUS.md及tests/release-20261029-79-entry.json。


> **2026-10-21歷史雲端整理指示。** 先讀 [CLOUD-READINESS.md](CLOUD-READINESS.md)。GitHub已有現行網站所需資料；完整checkout與雲端瀏覽器驗收仍待完成。下方開發指令是未來範本，不能視為已恢復開發。


本文件、`AGENTS.md`、`CLOUD-STATUS.md`都保存在GitHub。以後換電腦或在手機開啟雲端任務，先選這個儲存庫，再貼下方指令；接續依據是Git與這些文件。

### 雲端統整指令（目前使用）

```text
接續GitHub kuoyenai/kuotoyiting-birthday，以最新main為準。
目前先統整雲端開發資料與環境，不做網站功能優化。
先讀AGENTS.md、CLOUD-STATUS.md、CLOUD-READINESS.md、CODEX-CLOUD-HANDOFF.md、README.md、CONTINUE-HERE.md及tests/README.md。
核對最新main、未合併PR、未提交差異、完整checkout與必要素材；不依賴公司電腦或聊天記憶。
依交接文件準備Node>=20、Python3與Playwright／Chromium／WebKit，執行App靜態審核及一項適合初始化的瀏覽器驗收；如受權限限制，保存實際錯誤與下一步，不能冒稱已準備完成。
不要改網站程式、原畫、App版本、95格、100卡、四曲、自由選章／真實已讀、直接分享給Kuo、既有網域與穩定標籤；不寄真實測試信、不讀取訪客內容、不重開排程。
更新雲端現況與實際證據，提交到GitHub。等使用者明確恢復開發後，再從2D候選待辦選一項實作。
```

## 一次性設定雲端環境

1. 在Codex選擇雲端工作環境（目前官方介面為`Work in > Cloud`），建立或選取環境。建立時連接自己的GitHub，選`kuoyenai/kuotoyiting-birthday`。
2. 讓Codex準備此儲存庫的環境，使用下面「環境準備指令」。檢查安裝與測試結果後發布環境；發布環境與發布生日網站是兩件事。
3. 在已發布的環境開啟新任務，選擇最新main作為接續基礎，再貼「日常製作指令」。手機可選已建立好的環境接續。
4. 檢查結果後把程式／文件提交到GitHub。新任務有各自工作檔案，不應把尚未提交的聊天工作區當成唯一備份。

官方說明（2026-10-21已查閱）：[Codex Cloud](https://learn.chatgpt.com/docs/cloud)、[雲端環境](https://learn.chatgpt.com/docs/environments/cloud-environments)、[AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)。若帳號介面不同，以目前可用入口為準；本交接沒有代替你完成帳號登入或環境授權。

### 環境準備指令（首次建立環境時貼上）

```text
請為GitHub kuoyenai/kuotoyiting-birthday準備Codex雲端環境。
讀取根目錄AGENTS.md、CLOUD-STATUS.md、CODEX-CLOUD-HANDOFF.md。
這是已上線的靜態HTML/CSS/JavaScript多頁網站，不需要React、Babel、資料庫或npm正式建置。Git儲存庫根目錄就是網站根目錄。
請使用環境提供的Node.js（20以上）、Python3，準備Playwright及Chromium／WebKit測試所需瀏覽器與系統依賴；原環境驗收使用Playwright1.62.1，可先以此版本重現，若環境不相容請記錄實際採用版本與差異。
清除只適用Windows的測試路徑設定，不依賴公司電腦、桌面執行器、Downloads或本機產圖路徑。依tests/README.md準備截圖輸出目錄，保留現有node_modules忽略規則。
驗證python3 audit.py，以及一項適合環境初始化的瀏覽器測試；記錄實際結果。不要為驗收寄真實郵件、讀取訪客願望，或重跑整本95格只為證明依賴裝好了。
設定本機預覽方式，並告訴我需要的環境網路權限。先用現成GitHub連線；不要把密碼、Token或公司電腦設定寫進儲存庫。
只設定開發環境，不修改網站故事、圖片、App版本、部署網域或每小時排程。完成後提供可以發布此環境的狀態與仍未通過的項目。
```

### 開發指令範本（目前暫停；使用者明確恢復開發後才使用）

```text
接續YiTing Birthday專案：GitHub kuoyenai/kuotoyiting-birthday。
先讀取AGENTS.md、CLOUD-STATUS.md、CODEX-CLOUD-HANDOFF.md、README.md、CONTINUE-HERE.md及相關tests/README.md；確認目前分支、最新main、未提交差異及尚未合併工作，以最新已保存進度為準，不從舊聊天或公司電腦路徑重建。

持續優化故事裡的2D星光旅程，增加場景豐富性、角色互動與敘事順暢度，維持PLAVE韓團高質感原畫風格，依原小說漫畫順序銜接完整故事。先選一項有具體幫助的改善並完成實作，不把工作降為只同步Git、查狀態或重跑測試，也不為更新加入無關功能。

保留原YITING走路人物、連續地圖、回頭探索、讀完自動前進、95格順序、四首歌曲1234循環／可選曲與手動靜音、電影、100張小卡及下載。所有10章可自由選擇，不用先玩完；跳章不算已讀，不誤發星光，保留原位置及書籤。蛋糕等同一地點的對話在原場景銜接，團員依劇情正確同行或留在場景。

願望與「留給未來自己的話」按「分享給Kuo」即直接寄出，不要恢復二次確認；收藏、輸入、下載與載入舊存檔不寄信。維持收件人kuoyen.ai@gmail.com及現有說明。所有回歸測試攔截寄信服務，不寄真實驗收信、不讀取訪客內容。

需要補圖時，使用Git內官方角色參考及原畫，安排不同遠、中、近構圖，核對長相、完整臉與下巴、可見五指、關節、遮擋及多餘肢體。保留sources唯讀與既有穩定標籤。若工具無法產圖，先完成可做的程式並保存提示、參考資產與缺圖項目，不假裝圖片已完成。

完成相關手機／平板／桌機功能及視覺驗證，更新CLOUD-STATUS.md、README.md與CONTINUE-HERE.md，記錄具體變更、素材、實際測試、版本、尚未完成項及下一步。每輪把完成內容保存至GitHub，避免只留在暫存雲端工作區。
驗證通過後，本指令授權沿現有方式發布main與網站；若雲端權限僅支援分支／PR，先完成可審查提交與PR並明確告訴我尚未合併／部署，不強推、不假稱上線。只有讀回正式網站版本／內容後才回報已上線。先前每小時排程已取消，不重開。

遇到Bad Request或暫時性錯誤，先保存進度、查原工作狀態與輸入，同一步驟最多重試三次。仍失敗就保存錯誤、已完成項目與下次接續點；不要發布未通過驗證的改動，也不要繞過權限限制。
```

任務若有更具體需求，把下一段接在指令最後：`這一輪優先處理：……`。最新明確要求優先；不必每次重貼所有歷史聊天。

## 目前專案地圖

| 功能 | 主要檔案 |
| --- | --- |
| 邀請與四入口 | `index.html`、`landing.js`、`cinema-intro.js` |
| 電影 | `movie.html`、`app.js` |
| 電影互動漫畫 | `game.html`、`game.js` |
| 小說漫畫／順序 | `novel-comic*.js`、`novel-extra-shots.js`、`chapter-catalog.js` |
| 生日收藏、100卡、ZIP | `gift.html`、`gift.js`、`downloads.js`、`album-keepsakes.js`、`card-story-links.js` |
| 四曲與跨頁音樂 | `soundtrack.js`、`music-shell.js`、`music-bridge.js`、`album-player.css` |
| 2D地圖／故事／選章／存檔 | `explore.html`、`explore-story.js`、`explore-scenes.js` |
| 同行、人物與場景 | `explore-actors.js`、`explore-companion*.js`、`explore-group-companions.js`、相關`explore-*.js/css` |
| 真正已讀、續讀與收藏 | `explore-story.js`、`explore-intro.js`、`explore-starbook.js`、`explore-finale.js` |
| 2D選曲 | `explore-music.js/css` |
| 英文隱私／創作聲明與入口通知 | `privacy.html`、`privacy.css`、`entry-notify.js`（App80已移除API轉送） |
| 願望與未來回信 | `wish-sharing.js/css`、`birthday-letter.js`、`explore-wish.js` |
| PWA | `manifest.json`與相容副本、`pwa.js`、`sw.js`、`audit.py` |
| 外觀參考與產圖提示 | `assets/reference-*.jpg`、`game-art-prompts.json`、`art-reviews/*.json` |

官方外觀參考已在Git：`reference-yejun.jpg`、`reference-noah-bamby.jpg`、`reference-eunho-hamin.jpg`。五人與YITING同行的成品姿勢也在`assets/explore-cohort-*`，原始六人同行概念圖已保存為`art-reviews/references/cohort-walking-concept.jpg`。原畫頁、95格資料、完整小說、四首曲目與100卡ZIP都應優先使用已追蹤檔案。

## 可攜測試方式

讓環境設定對話先安裝工具；如需手動記錄安裝命令，可使用下列作為準備方案。這些命令未在本次Windows工作區假裝成Linux雲端執行結果；首次雲端建立仍需實際驗證。

```bash
# 在Git儲存庫根目錄；不需要公司的執行器路徑。
node --version  # Playwright1.62.1要求Node >=20
python3 --version
npm install --no-save --package-lock=false playwright@1.62.1
npx playwright install --with-deps chromium webkit
mkdir -p ../material-review
python3 audit.py
```

`node_modules/`已被Git忽略。不要提交瀏覽器、憑證、安裝快取或測試個人資料。沒有額外設定時，測試直接使用`require('playwright')`及其瀏覽器；只有另行安裝時才設定`PLAYWRIGHT_MODULE`。不要帶入舊Windows的`CHROME_PATH`或`PLAYWRIGHT_BROWSERS_PATH`。若上層輸出目錄不可寫，將診斷輸出改到可寫位置並記錄差異。

```bash
# 依改動選擇，不要求每輪全部執行。
node tests/story-integrity.cjs
node tests/explore-free-chapters.cjs
node tests/explore-free-chapters.cjs --review-only
node tests/explore-complete-journey.cjs
node tests/wish-sharing.cjs
node tests/letter-sharing.cjs
node tests/preservation-audit.cjs

# 需要跨引擎時使用相同斷言。
node tests/run-engine.cjs webkit explore-free-chapters.cjs
node tests/run-engine.cjs webkit wish-sharing.cjs
node tests/run-engine.cjs webkit letter-sharing.cjs
```

`tests/invariants.cjs`另依賴歷史提交`0770fb2e5cea862df1f1a39a9553c25eb84a2930`的Git物件。若雲端只做淺層checkout，需先取得該歷史物件才可跑此項，不能把缺少物件改判為通過或改寫原基準。它不是一般初始化的必要瀏覽器測試。

95格測試會逐格閱讀，較耗時；只有碰到核心路線／自動前進／固定場景等改動才需要。畫面品管另用正常時間截圖，避免把暫停測試時鐘造成的未繪製畫格誤判為產品空白。桌面WebKit不能取代iPhone／iPad Safari或安裝圖示實機驗收。

## 權限、網路及發布

- 雲端先連接GitHub儲存庫。網域可連線不代表已取得推送／合併權限；請使用環境提供的GitHub連線，不把Token貼在對話或Git。
- 安裝需套件註冊站及Playwright實際使用的瀏覽器下載站；按環境安裝結果調整允許清單，不為省事關閉安全限制。
- 讀取／發布驗證需`github.com`、必要的GitHub API／原始檔站，以及兩個正式網站網域。僅在確實需要時增加權限。
- 本專案的自動化寄信回歸完全模擬FormSubmit，無需向寄信服務開啟真實測試流量或提供Gmail帳密。若未來要串接新的產圖服務，另用雲端安全設定提供必要權限，不預設API已可用。
- 網站維持靜態發布；不要建立Vercel新專案或換網址。沿現有main部署；推送／CI成功後仍要核對正式版本。只能交PR時，就記錄PR尚未合併，不宣稱正式網站更新。
- 重要文件與素材必須提交／推送。雲端環境的保存狀態可協助接續，但不能取代Git版控。

## 本機與Git的邊界

以`a4e842b`為基準，694個Git追蹤檔案均存在，367份`assets/`共414,763,826 bytes，網站核心不缺公司電腦限定輸入。

以下4個本機未追蹤檔案沒有被Git追蹤網站程式引用，保留但未上傳；不需要把它們補進正式版本才能開始雲端製作：

- `assets/explore-hamin-walk-sheet-v1.png`（現行使用追蹤中的後續版本）
- `assets/explore-yiting-rig-v1.png`（非現行原YITING走路入口）
- `assets/fonts/invitation-chinese.woff2`（已有追蹤的TTF）
- `assets/yiting-friend-birthday-card.png`（現行使用追蹤的v2）

`materials.html`與`offline.html`的本機M狀態為換行差異，經Git正規化比對與HEAD相同，沒有額外實質更新待搬。所有上述本機內容仍保留，未因交接刪除或覆蓋。

本輪另外把原本僅存本機附件的六人同行概念圖逐位元保存到Git，未改動原檔或網頁引用。它在`art-reviews/references/cohort-walking-concept.jpg`，並非網站新增一格故事。

原始未採用產圖、對話全文、測試暫存截圖及未上傳的私人原始照片，不自動隨Git轉移。若要完整典藏，另備份到自己的私人雲端；不要不加挑選放入公開網站。訪客個人的願望、閱讀與音樂偏好原本就存在其瀏覽器，不應搬進製作環境。
