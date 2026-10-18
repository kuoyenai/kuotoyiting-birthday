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

## 20261017-17 接續

生日舞台加入五色星晶與金緞帶透明前景，現在4種前景。銀虎步道會預載舞台，最多2組；實際重返可重試。維持人物與95格小說路線。測試／完整生成提示見README與game-art-prompts.json。

## 20261017-18 接續

兩處世界交界新增程式繪製光門，explore-passages.js在人物後方渲染，章節3／9起點定位。無狀態寫入、無觸控攔截、無自動推進，減少動態靜止。小說路線與素材數不變。

## 20261017-19 接續

explore-actors.js新增首位EUNHO全身站姿立繪，第三章novel-arrival-medium與第五章novel-eunho-conversation世界位置+140。只有相關場景載入，離開釋放，失敗下次進場重試。原YITING行走與95格小說不改。後續可依各成員官方參考逐步補齊相遇立繪，必須先核對臉、雙手遮擋與肢體，再整合。完整提示與官方參考已保存。

## 20261017-20 接續

音樂花園新增YEJUN完整吉他坐姿。explore-actors.js改成按成員來源／裁片／高度渲染，最多快取2位，ASTERUM預載藝俊，花園只保留藝俊，缺圖實際進場重試。已有EUNHO／YEJUN兩位、三處相遇。其餘成員尚待官方參考核對與生成；小說路線／原人物行走／四曲保留。

## 20261017-21 接續

月光溫室新增NOAH全身迎接立繪。花園預載諾亞，溫室只保留諾亞；origin:.39以身體中心定位，完整手掌與頭腳。現有EUNHO／YEJUN／NOAH三位、四處相遇；斑比、河玟待補。官方參考三張皆已存assets/reference-eunho-hamin.jpg、reference-yejun.jpg、reference-noah-bamby.jpg；提示見game-art-prompts.json。

## 每小時排程與錯誤接續

2026-10-17啟用本對話排程yiting-2d，每小時接續。Bad Request不代表使用者暫停：先保存、核對請求、同輪最多重試3次，仍失敗下次排程再接續，已有執行句柄先查詢不重複啟動。每次發布後更新README。使用者說暫停時，停止目標並暫停該排程；原yiting排程已不存在，勿以舊id更新或再建立重複排程。

## 20261017-22 接續

粉色廣場新增BAMBY全身準備舞步／五指招呼立繪。現在四位成員、五處站位，剩HAMIN尚待補。preloads改為獨立表，溫室預載斑比，廣場釋放諾亞，最多2位。人物測試直接核對實體alpha輪廓全在裁片內。每小時排程yiting-2d及Bad Request接續規則保留。

## 20261017-23 接續

觀景台新增HAMIN全身指星立繪，五位成員、六處相遇到齊。廣場預載河玟，觀景台保留河玟與下一段銀虎，最多兩位。所有角色完整alpha輪廓／原比例／原對白測試。完整95格本輪重新驗證含六處相遇，結果見README。後續持續深化舞台、故事演出與手機畫面質感，保留每小時排程與Bad Request復原；未要求暫停不要停用排程或移動穩定標籤。

## 20261017-24 接續

生日舞台改用使用者指定的完整五人合照 assets/explore-plave-concert-group-v1.png，原序YEJUN、NOAH、BAMBY、EUNHO、HAMIN，取代未發布的分開姿勢拼排。6單獨相遇＋1合照，共7個配置；常態快取2、生日1，實際離場釋放。來源PNG原封不動保存，等比完整呈現，缺圖不擋閱讀，重返重試。測試詳見README。保留每小時排程，穩定標籤不移動。

## 20261017-25 接續

角色單獨相遇與使用者指定的五人合照新增650ms柔和入場，只改透明度，減少動態直接顯示。以max(enteredAt,readyAt)避免預載或慢圖突然跳出；繪圖save/restore避免影響玩家。入場測試與手機桌機相遇／合照缺圖測試見README。沒有新增素材，95格流程保持，後續繼續深化劇情演出。

## 20261017-26 接續

已同步手機六筆main提交至4d12036。重要新安排：2D在故事頁第三分頁→explore-intro.html→explore.html；禮物已移除2D並保留許願05，勿恢復舊禮物入口。介紹頁新增唯讀進度與開始／接續／重返提示；遊戲返回介紹頁。測試涵蓋異常存檔與往返，詳README。另同步手機提交2e2f186縮短行走至400單位，保留其存檔遷移與角色位置縮放；團員同行待辦保留。素材未增，後續繼續優化敘事演出。

本輪已重新通過縮短地圖的完整95格、六處角色相遇與原插畫結尾；介紹頁、存檔遷移、四種直橫尺寸及舞台測試通過。尚未在iPhone實機驗證。舊world-proportions測試固定960座標的斷言需隨mapVersion2調整，勿把歷史測試結果當成新地圖全數重測。

另同步3398670團員同行繪製基礎，但未提供followFrom/followUntil且主draw未傳同行參數，功能尚未啟用。不要誤報已可同行；保留原模組作後續接線。

## 20261018-1 接續

explore-arrival.js/css新增實際場景五色小星與細框、名稱700ms淡入，中文朗讀與終章城市識別；減少動態時靜止。無新素材、存檔或輸入處理。12次場景進出與回頭測試；world-proportions舊960斷言已改400／280並重測11張背景。原手機入口與400地圖保持，同行仍未啟用。下一輪可繼續深化敘事，勿把既有站姿立繪平移誤稱完整行走動畫。

## 20261018-2 接續

新增第5份透明前景explore-farewell-foreground-v1.png，imagegen提示在game-art-prompts.json。farewell配置alpha.55/scale.85/crop .25,.52,.34；birthday預載farewell，wish保留farewell，city釋放。原圖89.8% alpha≤8、中央欄位最大1。新素材無人物，不增加小卡數。手機桌機缺圖重試與中央透明測試通過，詳README。繼續保留手機400地圖及故事介紹入口，同行基礎仍未啟用。

## 20261018-3 接續

掌心紀念視窗新增可收合五道星光手帳，explore-starbook.js/css由原NOVEL_PANELS與extra shots取得星光索引、原畫、對白及章節連結。只讀進度，不另存；展開才建圖，收合移除來源。未收集不顯示內容，無新增主畫面按鈕或新素材。手機桌機與缺圖測試見README。原同行未啟用狀態保持，下一輪繼續深化體驗。

## 2026-10-18 銀虎步行研究接續（無App版本變更）

兩次imagegen步行表拒收：4橫格鞋尖越界；2×2完整但四姿勢過近，無交替通過。提示與理由：art-reviews/eunho-walk-20261018.json。原圖本機material-review/eunho-walk-rejected-row-v1.png與eunho-walk-rejected-grid-v2.png，不在assets、不啟用同行。App仍20261018-3。下一輪先分別製作接地和通過關鍵姿勢，核對膝踝與角色一致再接線，勿沿用已拒收表假裝完成。

## 20261018-4 接續

銀虎同行接線：encounter17之後index18..19且sceneasterum；encounter48之後index49..56且sceneeunho。4張獨立PNG原身形留白，不用前輪拒收圖表。距離110一循環，四姿勢／停步原NPC，依方向翻轉；對話dt0。減少動態或缺姿勢則原固定相遇，離場釋放並重試。YITING原圖／400地圖／五人合照不改。follow、原NPC與舞台測試已過；完整95格、六處相遇、原插畫結尾及11張背景比例亦重新通過。提示在game-art-prompts.json。

## 20261018-5 接續

同行從附近原anchor起步，max300世界單位／秒，停步faceplayer；遠距存檔仍直接恢復到身邊。follow資料新增phase供只讀診斷。無新圖，原4步姿與同行段保持。新增start測試逐幀查位置與速度，follow及缺圖／減少動態回歸通過；95格沿用App4完整結果。提示與素材總量保持。

## 20261018-6 接續

遠處提示下一道星光在右方，結尾提示可回頭；原新故事／重溫／書籤判斷優先級與距離不改。#interact disabled提高對比仍不可按。5狀態手機桌機預覽＋直橫版面／版本通過，無新素材或核心行為。預覽記錄本機material-review/guidance-preview.cjs與explore-guidance-*截圖，不納入正式測試新增。

## 20261018-7 接續

第6份透明前景為河玟觀景台星圖儀／綠晶，原圖與提示已保存。config observatory next eunho，plaza預載observatory/eunho，最多2。alpha.56 scale.85 crop width.3/top.43/bottom.4。來源中央40% alpha≤1，88.2%透明≤8。實際進出／缺圖／找綠星／原對話測試通過，詳README。無新角色，四步姿銀虎與手機400地圖保持。

## 20261018-8 接續

對白新增previousLine與linePosition，首句disabled；showLine同步原reading存檔，回看不變index/unlocked。storySaveStatus移至story-navigation之前，保留失敗提示。320/390/1280回看、書籤重載、已讀不推進與46px無重疊通過；四直橫版、731路徑、版本檢查通過。無新素材，95格沿用App4完整結果；待後續深化場景敘事，保留原圖和手機入口／400地圖。

## 20261018-9 接續

explore-motes.js依實際playerScene繪製11種場景配色／音符月弧細星微光，取代原16方點；兩側上半區、一般10／舞台18，動態減少時不繪製。無新圖或存檔改變。motes四尺寸與arrival手機桌機12場景／回頭通過，732路徑與App9檢查通過。95格沿用App4結果；後續繼續深化角色相遇、故事銜接與場景，原穩定標籤、400地圖、四曲不改。

## 20261018-10 接續

使用者新需求：讀完新格自動走下格；autoDestination只存記憶體，manual／modal／blur／resize停止，舊格重溫和結尾不觸發，抵達不自開對白。changeBackground保留內部載入前的待行走意圖；初次／重載無自動意圖。完成95格才出現openFinale，使用原終章圖，開啟載入／關閉釋放／Back先關視窗；不要inline壓縮固定高度stage。

銀虎步姿使用v2四側身＋side-idle-v2，第五圖停步；來源朝右，direction>0不翻、<0翻。以各圖alpha實體top/baseline/腰部origin正規化。walk.images實際5張，walkingFrames getter仍4表示循環步姿，缺任一則原固定相遇、不滑動。五張生成提示／alphaBBox審查在art-reviews/eunho-side-walk-20261018.json。其他成員仍固定相遇，未開啟同行。原v1保留不刪。

驗證：本輪完整95格／六相遇重新通過（側身替換前）；側身替換後follow與start手機桌機、缺圖重試／減少動態、正反向繪圖通過。auto-walk跨章節／末格／六種取消、finale三尺寸無劇透／Back／缺圖重試、四直橫比例與736路徑及App10通過。348追蹤素材380336191 bytes，新增5PNG共8072387 bytes，95故事／100卡／四曲不變。仍待iPhone實機核對；後續依故事需求深化角色／場景，保留原手機入口與穩定標籤。

## 20261018-10 最終側身版全程自動銜接補驗

EXPLORE_AUTO_WALK=1執行tests/explore-continuous-story.cjs，第一格手動走近，其後94段全部自動前往；95格順序、原圖解碼、五位成員六處相遇及結尾收藏入口通過，無pageerror。使用最終v2側身資源、390×844 Chrome虛擬時鐘；不是iPhone實機。App不升版，無新圖／產品程式變更。保留手動測試模式供後續回歸，繼續依實際需求深化內容。

## 20261018-11 接續

showLine在story.dataset.voice與speaker.dataset.label寫入原說話者及英文名，CSS五色細邊／名牌／繼續鍵，旁白中性、YITING／PLAVE金。正文／原劇情／autoDestination／actors不改。320／1280八說話者實際預覽及前句更新、dialogue-back三尺寸通過；736路徑／版本通過。無新素材；95格自動全程沿用App10，不誤報重新全程測試。

## 20261018-12 接續

廣場新增第7份透明前景，plaza alpha.46 scale.8 crop .28/.43/.36，greenhouse next plaza、plaza next observatory、obs next eunho；移除舊plaza特殊預載分支。最多2份。新圖522392 bytes、中央40% alpha≤1、93.97%透明≤8；提示在game-art-prompts與art-reviews。plaza及obs手機桌機前景／缺圖重返測試通過；joy測試改400地圖內前後走，真腳步／存檔失敗／重載／減少動態／回頭兩尺寸通過。737路徑及App12通過，95格沿用App10完整結果。349素材380858583 bytes；原角色／95圖／100卡／四曲不改。

## 20261018-13 接續

starbook notes表對應hope/gentleness/joy/courage/companion五個既有活動鍵，主線星光owned才加入回憶／未完成提示；每次render讀取，不寫任何狀態。五個主線星光不是活動小記，兩者不互相解鎖。390／1280五未完成→寫原活動鍵→重開五已完成、故事存檔不變、原圖／連結／Back釋放／缺圖重試通過；737路徑及App13通過。無新素材，角色／95格／自動行走／四曲不改。

## 20261018-14 接續

章節選單切換首度保存revisitOrigin={index,x,reading}至原key.revisit，原點只設一次，多章切換保持；resume選項還原並清除。mapVersion2才恢復合法原點，x限80..原waypoint/worldRight，書籤核對route；unlocked不倒退。新格推進到原index清除過期原點，重啟亦清除。介紹頁只讀顯示接續重溫與原格數，不新增按鈕或頁面。390／1280多次切章／重載／介紹往返／座標與書籤／手動靜音／95完成返回／壞資料通過；intro、migration、四直橫版、737路徑及版本通過。無新素材；95格沿用App10全程結果，角色與音樂保持。

## 20261018-15 接續

explore-seams.js在drawContinuousWorld後／details與角色前，融合48世界單位交界，取代原暗邊；來源原比例、鏡像延伸。只快取可見窄畫布，camera不重建、resize重建、缺來源略過、不可見釋放。seams兩尺寸像素中央混色／外側不變／快取／狀態／進度通過；11背景比例與四直橫版、738路徑／版本通過。無新圖，95格沿用App10，角色／音樂／存檔未改。

## 20261018-15 整體驗收接續

目前最終版本95格全自動前往／六處相遇重跑通過；七互動兩尺寸通過，許願測試欄位白名單補mapVersion/revisit，仍查無願望存送。preservation-audit.cjs核對電影連播四時間點、100卡翻面、四曲所選下載與禮物分頁靜音；ZIP100圖CRC通過。摘要tests/release-20261018-15-audit.json。標籤需用^{ }解參照檢查（實際Git語法^{}），仍108c7c1；小說原素材未修改。App15不升版，只有測試／紀錄。排程保留，後續依需求改善，勿為版本號新增無關內容。

## 20261018-16 接續

原新故事末句完成前檢查s.star及route.slice(0,unlocked)已收色，首次才派送yiting-explore-star；重溫分支先return不觸發。star-moment模組繪900ms八點光環，主draw在角色前，MQL即時減少動態不繪；視窗／旋轉／hidden清除。無存檔或音效變更。五色×390／1280原劇情／自動前往／消失／重溫／減少動態通過，對白回看三尺寸及739路徑版本通過。無新圖，95全程沿用App15整體驗收。
