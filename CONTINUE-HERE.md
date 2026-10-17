# YiTing 生日網站｜換電腦接續製作

最新版以本儲存庫 `main` 分支為準。網站：https://kuotoyiting-birthday.vercel.app/ （另保留GitHub Pages）

## 到另一台電腦

1. 登入 GitHub，開啟 https://github.com/snooy791123/kuotoyiting-birthday 。下載網站可用 Code → Download ZIP；要持續發布，建議複製 Git 儲存庫並使用自己的 GitHub 登入權限。
2. 把網站資料夾交給接續製作的工具或編輯器。本儲存庫的網站檔案就在根目錄。
3. 原始分鏡、影片、角色參考圖與完整小說另行備份。本儲存庫包含已使用的網站素材，並不等於完整原始素材備份。
4. 發布前先測試手機與桌機；提交並推送 main，等待 GitHub Pages 更新。請保留現有部署設定。

## 接續時提供的說明

延續 YiTing 生日網站，以此儲存庫 main 最新版為基礎。維持邀請卡的深藍星空、金色襯線標題與銀虎紅色星光印記。入口順序：生日電影 → 電影互動漫畫 → 小說漫畫 → 生日收藏。電影連續播放，不自動暫停互動；漫畫手動翻頁，保留閱讀進度、特效與章節驚喜。小說漫畫有獨立入口。小卡完整比例、不可裁切，翻面有祝福，保留篩選與下載。四首曲目主題曲排第一，選哪首就下載哪首 MP4。願望只存本機，不上傳或寄信。保留粉絲自製、非營利聲明。角色需對照使用者提供的 PLAVE 官方外觀參考，避免手腳錯誤及重複分鏡。網頁可加入主畫面，媒體播放仍需要網路。

## 主要檔案

- index.html / landing.js：生日邀請與四個入口。
- movie.html：連續生日電影。
- game.html / game.js：電影互動漫畫。
- novel-comic.html / novel-comic-data.js / novel-comic-source.js：小說漫畫、分鏡與完整文字。
- gift.html / gift.js：曲目、小卡、回憶、小說與本機願望。
- invitation.css / invitation.js / foil-type.css：共用視覺、導覽、篩選、標題。
- app.webmanifest / pwa.js / pwa.css / sw.js：主畫面安裝與有限離線處理。
- assets/：插畫、下載素材、影音、字型與 App 圖示。

## 注意

另一台電腦不會自動取得前一台的未發布修改、本機願望與閱讀進度。多人或多電腦修改前請先取得最新 main。原始參考資料如放在 sources/，保持唯讀。


## PWA 發布規則

- 正式設定為 manifest.json：standalone、portrait、start_url/scope 都是 ./；保留 app.webmanifest 與 app-manifest.json 相容副本。
- iOS 使用 apple-touch-icon.png（180px）；Android 使用 192/512px PNG 與內容縮至 80% 的 maskable 圖示。
- APP_VERSION 需同步更新 pwa.js、sw.js 及七個頁面的 app-version、manifest 和前端快取參數。每次發布前執行 `python audit.py`。
- HTML/程式採網路優先、離線才讀快取。影音、Range 請求、下载與外部服務不由 App 快取。
- 既有網站使用多頁 HTML/JS；沒有 React/Babel/Firebase CDN，因此不需要建立不存在的函式庫快取。
- app-runtime.js 管理彈窗返回與錯誤提示；不會強制中斷電影或自動重新整理。
- 網頁上圖片顯示成功，不代表 iPhone 加入主畫面圖示已驗收。必須在實機查看安裝預覽與實際主畫面；圖示更新可能需要使用者移除舊捷徑後重新加入。


## 音樂、旅程與私人收藏

- soundtrack.js 為四首歌的共用來源、MP4 下載與歌詞 key。順序為：열 시 이십 분의 별 → 너만을 위한 별빛 → 너라는_별빛 → 10월의 밤。
- yiting-music-preferences 保存 index 與使用者 paused 偏好；自動切換曲目只更新 index，切到背景造成的暫停不覆寫偏好。電影原影片的播放與聲音保留獨立控制。
- journey.js 保存 yiting-journey，首頁四個入口呈現進度；小說漫畫與電影互動漫畫需按「這個故事，我看完了」才標記完成。影片自然播放完畢則標記完成。
- yiting-favorite-cards 以圖片資產 ID 保存小卡收藏。「我的收藏」可篩選；收藏排前面，取消後保留原始排序。收藏、願望與偏好只留在使用者裝置，不設後端。
- 最後一份桌機與手機驗證涵蓋四首歌實際播放、選曲 MP4 對應、雙語時間碼、暫停偏好跨頁保留、收藏重新整理保留、取消與翻面、小說續讀及完成標記。

## 2026-10-17 手機端銜接

已同步手機 main 59850d8（47筆新增提交），以連續地圖、回頭重溫、原人物圖、四曲輪播與禮物第05頁啟動為基礎。不要把歷史60姿勢骨架自動切回啟用。最新版本與回歸結果見README；未發布觀景台改動備份於本機 material-review/desktop-pending-before-mobile-20261017。

## 2026-10-17 遊戲接續重點

App 20261017-6，最新精確版本仍以README與inventory-current.json為準。2D遊戲入口為禮物第05頁→explore.html；原手機人物、連續世界與回頭重溫需保留，未啟用歷史60姿勢骨架。95格小說都在同一條路線，現有10種行走環境與觀景台、銀虎陪伴、舞台燈光、心裡許願、贈星紀念互動。許願不收集內容；掌心紀念依既有已讀進度解鎖，不能提早出現。後續深化其他成員互動、地圖視覺銜接與手機操作。每次先同步main，再測試並更新README，保留既有穩定標籤，不修改sources。

## 最新優化方向（20261017-14）

使用者更新目標為：增加2D遊戲畫面豐富性、符合PLAVE韓團高質感設計，走完整本小說漫畫，缺少素材持續自動補齊，直到使用者說暫停。先同步main，以README最新App版本為準。已加入透明花園前景與輕景深；接下來優先各章原畫層次與敘事氛圍，保留人物作為視覺主角。新生成素材須留完整提示、驗證透明與構圖，不改唯讀sources。存檔沿用yiting-explore-story-v1並相容舊資料，新增世界位置與對白行；不要把正常位置存檔誤認為保存願望，願望不輸入也不傳送。

## 20261017-16 接續

新增第二章穿越城市背景，現為11種行走環境。完整提示與參考見game-art-prompts.json，最新測試範圍見README。從普通城市到穿越城市、第三章ASTERUM依實際位置切換，回頭探索不改進度。後續繼續深化小說各段畫面，保留手機原人物與四曲設定。
