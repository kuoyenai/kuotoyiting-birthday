# EmailJS範本欄位

這是已備妥的範本內容，不代表已儲存進EmailJS帳戶。此對話目前沒有EmailJS帳戶操作工具。

在EmailJS的Email Templates建立範本，內容編輯器切換Code Editor，貼上同目錄的`yiting-mail.html`完整內容。

| 欄位 | 可直接填入的值 |
| --- | --- |
| 範本名稱 | YiTing網站通知與分享 |
| To Email | `kuoyen.ai@gmail.com`（固定文字） |
| Subject | `{{subject}}` |
| From Name | `YiTing Birthday` |
| From Email | 勾選使用服務預設信箱 |
| Reply-To | 留空 |
| Cc／Bcc | 留空 |

儲存後把Template ID與Public Key提供給開發端，並確認Gmail服務測試成功後的Service ID。上一張畫面的Gmail412尚未解決，不能把範本已建好當成可以寄信。

同一範本支援入口通知、生日願望及未來回信；不同主旨由網站依事件固定選擇。使用雙大括號跳脫訊息，不使用三大括號、動態收件人或EmailJS的IP／裝置／位置內建變數。

範本沒有外部圖片、字型、腳本或網站資產連結；開信不會因此載入Vercel上的大圖。HTML已做靜態欄位檢查，尚未完成EmailJS帳戶儲存、Gmail實寄及郵件客戶端驗收。
