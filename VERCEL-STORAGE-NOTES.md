# Vercel部署容量核對（2026-10-29）

擁有者Usage截圖顯示Last30days：Deployment Storage9.03GB/10GB（90.3%）；Fast Data Transfer12.9GB/100GB（12.9%）；CDN Requests84K/1M（約8.4%）。接近上限的是部署儲存，不是傳輸流量。

Deployment Storage保留部署的建置輸出與靜態檔案，受保留版本數、每版大小及保留時間影響。官方以GB-month計量，記錄專案每日最大存量並按期間累計；不能把跨月理解為仍保存的部署檔案自動歸零。刪除部署會停止後續計量，先前已發生的期間用量不會被倒扣，Usage也不一定即時下降。

目前官方Hobby說明為10GB，超限可能擋新部署；30天保留政策與最近部署／別名例外決定哪些舊版本可自動清理。這與每月1日重新給一塊空白硬碟不同。以實際帳戶專案分項及Retention設定核對，不依過時社群回覆保證固定重置日期。

建議先在Usage→Deployment Storage→Projects確認此專案佔比，再檢視舊Preview與Production清單；保留目前正式版及可回復的已驗證版本，列明候選後再決定刪除／調整保留期限。本輪沒有Vercel帳戶操作工具，也未刪除部署、改保留政策、升級付費或移走素材。

GitHub盤點：367份assets，414,763,825bytes；ZIP81,206,373bytes、film.mp4為16,502,039bytes。這是原始檔大小，不是已量測每部署容量或此帳戶9.03GB的完整歸因。大型輸出搭配頻繁部署可能使保留容量增加；原始檔案仍依專案要求保留，不壓縮／刪除原畫或小卡。

本輪範本／文件合併一次提交，避免反覆建立僅有文件差異的部署。後續可評估文件變更忽略建置與更精簡的部署輸出，但尚未套用或宣稱已釋放空間。

官方依據：

- https://vercel.com/docs/deployment-storage
- https://vercel.com/docs/deployment-retention
- https://vercel.com/changelog/hobby-projects-now-retain-fewer-deployments-to-free-up-storage
