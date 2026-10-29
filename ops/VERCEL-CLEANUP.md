# Birthday專案部署清理（待API憑證）

使用者已授權清理不用的舊部署，並完成Vercel外掛及團隊授權。已讀取24個READY部署和3個現行別名；本輪沒有刪除任何部署，沒有量測到釋放容量。

目前保留：

| 部署 | 用途 |
| --- | --- |
| `dpl_CaDU925FHYTe6piurvbvdVjZ5zLk` | 目前正式c27eb5e，3個活動別名均指向此版 |
| `dpl_HEvPDWWME9snXVkL76ejXuPb21Fq` | 最近前版b6e99b0，普通部署清單標示為回復候選 |
| `dpl_E3ZkBrfTERCVA6maLusDg8xhdTPN` | 使用者指定App74穩定備份2ea2824 |

完整21個候選、commit和URL在`vercel-cleanup-20261029.json`。只限kuotoyiting-birthday，其他兩個專案jpera、kuo-ai-studio不在刪除範圍。

## 目前阻礙

- 目前可用的Vercel工具沒有部署DELETE操作。
- 專用rollbackCandidate查詢回403；普通部署清單、別名及三個保留版本詳情已可讀，不重試相同受拒查詢。
- 雲端未設定`VERCEL_TOKEN`，也沒有CLI的獨立認證；團隊授權不會把外掛認證變成可用的CLI／REST環境憑證。不要讀取、匯出或猜測外掛內部憑證。

使用者確認目前是一般ChatGPT對話，本次沒有已驗證可供使用者設定執行環境Secret的入口；先前請使用者設定VERCEL_TOKEN的要求不適用，已更正，不要求建立或貼出Token。當前實際清理需Vercel控制台具刪除能力的操作；下方腳本保留給日後具備安全認證的執行環境，不代表目前能代執行。清理範圍已授權，不再要求重新核准相同21個候選。

## 可執行的檢查與刪除

```sh
python3 ops/vercel_cleanup.py
python3 -m unittest discover -s ops -p test_vercel_cleanup.py
```

預設完全離線，只列保留3／候選21。實際刪除需明確`--execute`及環境憑證：

```sh
python3 ops/vercel_cleanup.py --execute
```

腳本使用官方DELETE `/v13/deployments/{id}`，固定team/project，刪除前重新查活動別名、READY狀態和原commit。正式部署改變、候選被掛上別名、權限拒絕或任何刪除讀回不明即停止；不自動重試。刪除逐筆寫結果JSON，之後重新核對3個保留版與正式別名。

8項全模擬安全檢查在普通及Python -O模式通過。無Token的實際啟動已驗證exit2、0次HTTP／刪除。這些不是已完成清理的證據。

## GitHub保存方式

## 21個候選（尚未刪除）

以下為盤點當時非保留版本；實際操作前仍須核對正式別名沒有移動。

| Commit | 建立時間（UTC） | Vercel部署 |
| --- | --- | --- |
| 82ed5d0 | 2026-10-29T06:33:52.370Z | [dpl_FMQVkDUNYQjL9nwHoXTHjZfBUUGG](https://vercel.com/kuoyens-projects/kuotoyiting-birthday/FMQVkDUNYQjL9nwHoXTHjZfBUUGG) |
| 01fe575 | 2026-10-29T06:20:26.853Z | [dpl_CeoRSGUQLXxjAPDtE36jZR4uVzSz](https://vercel.com/kuoyens-projects/kuotoyiting-birthday/CeoRSGUQLXxjAPDtE36jZR4uVzSz) |
| 9042daa | 2026-10-29T06:16:54.937Z | [dpl_9FGbAJkHHESq6FJm76yqrowARHPB](https://vercel.com/kuoyens-projects/kuotoyiting-birthday/9FGbAJkHHESq6FJm76yqrowARHPB) |
| fcffbc6 | 2026-10-29T05:59:47.684Z | [dpl_4oKHmzMRWPx4DZsxFEVX32R93KA3](https://vercel.com/kuoyens-projects/kuotoyiting-birthday/4oKHmzMRWPx4DZsxFEVX32R93KA3) |
| a1c7920 | 2026-10-29T05:44:58.282Z | [dpl_E7b53khDc72psztYwMKRk7Nr84oL](https://vercel.com/kuoyens-projects/kuotoyiting-birthday/E7b53khDc72psztYwMKRk7Nr84oL) |
| e88e93d | 2026-10-29T05:14:12.868Z | [dpl_G4u8ByAscXApoYVgwk7Fba25R6Rb](https://vercel.com/kuoyens-projects/kuotoyiting-birthday/G4u8ByAscXApoYVgwk7Fba25R6Rb) |
| 2c2c0bf | 2026-10-29T05:07:53.614Z | [dpl_8Cagkt7JrMEq1FthCdueKhedSn3N](https://vercel.com/kuoyens-projects/kuotoyiting-birthday/8Cagkt7JrMEq1FthCdueKhedSn3N) |
| 45b3eea | 2026-10-21T04:54:44.791Z | [dpl_95X83DvJ6rKHiEG3nhM7j2Yjg51b](https://vercel.com/kuoyens-projects/kuotoyiting-birthday/95X83DvJ6rKHiEG3nhM7j2Yjg51b) |
| bd05c52 | 2026-10-21T04:15:04.680Z | [dpl_BMqkeymu6MRBBwqYZjAnVb5JMLsR](https://vercel.com/kuoyens-projects/kuotoyiting-birthday/BMqkeymu6MRBBwqYZjAnVb5JMLsR) |
| a4e842b | 2026-10-20T21:57:10.848Z | [dpl_Ay4Cp5MUCbruzZdVPESzgKC1JXZE](https://vercel.com/kuoyens-projects/kuotoyiting-birthday/Ay4Cp5MUCbruzZdVPESzgKC1JXZE) |
| 90d5a07 | 2026-10-20T21:34:24.457Z | [dpl_AHSfxnZKbuuau3VWEXtMwuyk51qG](https://vercel.com/kuoyens-projects/kuotoyiting-birthday/AHSfxnZKbuuau3VWEXtMwuyk51qG) |
| c5b930a | 2026-10-20T17:03:02.821Z | [dpl_AEwP2svssfD6dnwWLfD6Ue9KCBFa](https://vercel.com/kuoyens-projects/kuotoyiting-birthday/AEwP2svssfD6dnwWLfD6Ue9KCBFa) |
| a7a9dc5 | 2026-10-20T16:58:48.743Z | [dpl_65CsoQ2y4NKsYaGd1oxWPf5sNbLL](https://vercel.com/kuoyens-projects/kuotoyiting-birthday/65CsoQ2y4NKsYaGd1oxWPf5sNbLL) |
| 86e1288 | 2026-10-20T16:53:23.577Z | [dpl_3LxYN3U72h2t7GLgiAzGmQsQpQPR](https://vercel.com/kuoyens-projects/kuotoyiting-birthday/3LxYN3U72h2t7GLgiAzGmQsQpQPR) |
| e113d2c | 2026-10-19T13:26:45.887Z | [dpl_CAPGnXDYRmmat52KLfQ6v5es5Ut8](https://vercel.com/kuoyens-projects/kuotoyiting-birthday/CAPGnXDYRmmat52KLfQ6v5es5Ut8) |
| c0f6b8f | 2026-10-19T13:10:57.395Z | [dpl_995NXR7bRPyzAtNaPZPTnwC7RVAQ](https://vercel.com/kuoyens-projects/kuotoyiting-birthday/995NXR7bRPyzAtNaPZPTnwC7RVAQ) |
| 5170584 | 2026-10-19T13:05:49.021Z | [dpl_FKZDNUHuW87rWEUdFpja8gp63FuY](https://vercel.com/kuoyens-projects/kuotoyiting-birthday/FKZDNUHuW87rWEUdFpja8gp63FuY) |
| 90af58f | 2026-10-19T11:05:59.039Z | [dpl_HTJhpXCmi8krG7DWeLEG9WGw79yk](https://vercel.com/kuoyens-projects/kuotoyiting-birthday/HTJhpXCmi8krG7DWeLEG9WGw79yk) |
| b501839 | 2026-10-19T07:12:26.035Z | [dpl_7Ba5jvxum3xK1nNxWYcRAo1mZoMf](https://vercel.com/kuoyens-projects/kuotoyiting-birthday/7Ba5jvxum3xK1nNxWYcRAo1mZoMf) |
| 1082c14 | 2026-10-19T07:02:22.217Z | [dpl_AFPW1mpYNawVBrxEJtATzBf8UxE5](https://vercel.com/kuoyens-projects/kuotoyiting-birthday/AFPW1mpYNawVBrxEJtATzBf8UxE5) |
| d059033 | 2026-10-19T06:54:02.153Z | [dpl_BLh8edqC2P8cTZcXKDt1KXVXEwpS](https://vercel.com/kuoyens-projects/kuotoyiting-birthday/BLh8edqC2P8cTZcXKDt1KXVXEwpS) |


草稿分支`ops/vercel-cleanup-20261029`的vercel.json僅停用該分支的Git自動部署，保留既有headers及其他分支預設行為。主分支不變、不合併、不發布新網站，以免清理前又增加部署。若後續需要合併，應在清理及正式讀回完成後另外收斂紀錄。

官方依據：

- https://vercel.com/docs/deployments/managing-deployments
- https://vercel.com/docs/project-configuration/git-configuration
