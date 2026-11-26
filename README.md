# YungSheng 企業教育訓練管理系統 (RE-SOP-003 合規系統)

本專案為依據企業內部標準作業程序（RE-SOP-003）開發的全流程教育訓練管理系統，涵蓋「訓前申請」、「課堂現場簽到考核」與「外訓心得及兩級主管評核」。

---

## 📋 支援之標準作業表單 (SOP)

1. **RE-SOP-003-04 教育訓練申請表**：
   - 區分「內訓（內部開課）」與「外訓（派員至外部受訓）」。
   - 外訓受訓名冊最多 6 人合填、訓後應繳交資料與附件多選（支援其他自訂說明）。
   - 人資詢議價比價紀錄、線上多層級送審簽核。
   - 送審自動套印為標準 Word (`.docx`) 附件檔。

2. **RE-SOP-003-03 教育訓練簽到考核表**：
   - 課堂點名、實到人數統計與實到率即時計算。
   - 支援課堂大螢幕投影 QR Code 供受訓同仁手機掃碼簽到。
   - 講師考核評分（分數、合格/不合格切換）與講師線上簽名。
   - 結訓一鍵套印 Word 簽到考核表。

3. **RE-SOP-003-06 外訓心得報告**：
   - 受訓學員五大滿意度維度自評（課程內容、教材、講師表達、實務效益、行政支援）。
   - 核心學習重點與訓後具體行動方針填寫。
   - 直屬主管（初核）與最高主管（複核）兩級主管線上評核機制。
   - 成果報告自動套印 Word。

---

## 🛠️ 技術架構

- **Frontend / Fullstack**: Next.js 16 (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Document Engine**: Python `python-docx` 範本套印腳本 (`fill_templates.py`)
- **Data Persistence**: JSON 輕量資料庫 (`data/db.json`)

---

## 🚀 快速啟動

### 方式 1：Windows 批次檔一鍵啟動
直接雙擊根目錄下的：
- `啟動教育訓練系統.bat`
- 瀏覽器開啟：`http://localhost:3001`

### 方式 2：命令列啟動
```bash
# 進入 web 目錄
cd web

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 或以生產模式建置並啟動
npm run build
npx next start -p 3001
```

---

## 👥 預設體驗帳號（密碼皆為 123）

- **張大同 (EMP001)**：一般同仁 (STAFF)
- **李經理 (MGR001)**：技術部主管 (MANAGER)
- **王總監 (DIR001)**：部門最高主管 (DEPT_HEAD)
- **陳主任 (HR001)**：人資部主管 (HR_MANAGER)
- **系統管理員 (ADMIN)**：全權管理員
