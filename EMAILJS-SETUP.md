# YiTing EmailJS 設定草案

狀態：2026-10-29。正式App仍為`20261029-80`／FormSubmit；此文件不是已完成切換或寄達的證明。使用者正在評估EmailJS，尚未提供Service ID、Template ID、Public Key，也未建立EmailJS正式整合。不要把空設定或範例ID發布成可用寄信。

EmailJS可由目前的靜態網站直接呼叫，不需另加Vercel寄信後端。它透過已連接的郵件服務寄送；此專案可連接Gmail，只寄給固定收件人。這是設定上的簡化，不是可靠送達的保證。

## 帳號與服務

1. 開啟[EmailJS控制台](https://dashboard.emailjs.com/)，在Email Services新增Gmail服務並完成其授權。
2. 使用EmailJS內建的服務測試，確認指定Gmail有實際收到測試信，再記下Service ID。這個服務測試由擁有者在控制台手動執行；本輪工具未代送EmailJS信。
3. 在Email Templates建立一個共用範本，記下Template ID。
4. 在帳戶的API Keys／Public Key設定頁取得Public Key。

提供給開發端的是Service ID、Template ID與Public Key。Public Key原本就是供瀏覽器使用的公開設定。不要提供Gmail密碼、Private Key、OAuth權杖或瀏覽器登入資料。

## 範本的具體欄位

| 欄位 | 設定 |
| --- | --- |
| To Email | 固定填`kuoyen.ai@gmail.com`，不使用動態收件人變數 |
| From Name | `YiTing Birthday` |
| From Email | 使用已連接服務的預設信箱 |
| Reply-To／Cc／Bcc | 留空 |
| Subject | `{{subject}}` |

信件內文可貼以下文字；若使用HTML編輯器，變數仍保留雙大括號，避免將願望／回信當成HTML插入：

```text
{{message}}

來源：{{source}}
入口：{{entry}}
時間：{{time}}
分享選擇：{{consent}}
```

同一範本可供兩個入口、生日願望及未來回信使用。程式會固定選用下列主旨，不讓訪客更改收件人：

- `YiTing｜網站入口通知`
- `YiTing｜她願意分享的生日願望`
- `YiTing｜她願意分享的未來回信`

入口只傳入口名稱、時間與固定說明，其他文字欄位留空；不得加入已存願望、回信、已讀、訪客身分或EmailJS的user_ip／user_browser／user_country等內建變數。願望／回信仍只有本人主動按「分享給Kuo」才傳送本次文字。

在EmailJS的Domains允許來源設定中使用網站origin（不含路徑）：

```text
https://kuotoyiting-birthday.vercel.app
https://kuoyenai.github.io
```

## 接續開發與驗證

- 三個公開設定取得後，才接入正式入口及分享程式；不要只把FormSubmit URL換掉。EmailJS的REST請求包含`service_id`、`template_id`、`user_id`與`template_params`。
- 官方`/send`成功回應範例是HTTP200及文字`OK`；不能沿用FormSubmit的`response.json()`／`success=true`判定。失敗、429、未就緒及回應不明時不得假稱成功，不自動重送。
- 官方API速率限制為每秒1次；有授權的三流程合成驗收必須依序執行。服務與方案額度以實際帳戶為準。
- 先跑攔截寄信的單元／瀏覽器回歸，維持每分頁入口最多一次、背景fetch、正常入口無寄信提示、主動分享與本機內容保留。
- 真正切換服務時，同步更新全英文隱私頁與分享處的服務說明、App／SW／PWA／快取版本及盤點。不能讓正式說明仍聲稱用FormSubmit。
- 發布後讀回兩站，再有限次實測原生日信、開啟星光之門、略過開場；分別記錄HTTP／回應、EmailJS服務接受及Gmail實際收件。三者不能混為一談。

## 本輪連線限制

2026-10-29對EmailJS官方send端點的只讀OPTIONS預檢，在本雲端回HTTP403／`error code:1010`，沒有提交寄信。這不能判斷擁有者的正常瀏覽器是否可用EmailJS，也不是API金鑰無效的證據；目前尚未取得任何EmailJS帳戶設定。不要用替換代理、偽裝用戶端、no-cors或關閉TLS來繞過限制。

## 官方依據

- [連接Gmail等郵件服務](https://www.emailjs.com/docs/user-guide/connecting-email-services/)
- [建立範本與固定收件人](https://www.emailjs.com/docs/tutorial/creating-email-template/)
- [REST send欄位、回應與速率](https://www.emailjs.com/docs/rest-api/send/)
- [Public Key的用途](https://www.emailjs.com/docs/faq/is-it-okay-to-expose-my-public-key/)
- [來源允許清單](https://www.emailjs.com/docs/faq/can-i-add-my-domain-to-allowlist/)
- [雙大括號變數的預設跳脫](https://www.emailjs.com/docs/user-guide/dynamic-variables-templates/)
