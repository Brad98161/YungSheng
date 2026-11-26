import fs from "fs";
import path from "path";
import { User, TrainingApplication, AttendanceRecord, FeedbackReport } from "@/types";

interface DatabaseSchema {
  users: User[];
  applications: TrainingApplication[];
  attendanceRecords: AttendanceRecord[];
  feedbackReports: FeedbackReport[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const initialUsers: User[] = [
  {
    id: "EMP001",
    name: "張大同",
    email: "datong.chang@company.com",
    department: "技術工程部",
    title: "資深軟體工程師",
    role: "STAFF",
    managerId: "MGR001",
    phone: "0912-345-678",
    password: "123"
  },
  {
    id: "EMP002",
    name: "王小美",
    email: "may.wang@company.com",
    department: "產品研發部",
    title: "UI/UX 設計師",
    role: "STAFF",
    managerId: "MGR002",
    phone: "0922-333-444",
    password: "123"
  },
  {
    id: "EMP003",
    name: "陳建宏",
    email: "jh.chen@company.com",
    department: "品質保證部",
    title: "品保工程師",
    role: "STAFF",
    managerId: "MGR001",
    phone: "0933-555-777",
    password: "123"
  },
  {
    id: "EMP004",
    name: "林雅婷",
    email: "yating.lin@company.com",
    department: "技術工程部",
    title: "數據分析師",
    role: "STAFF",
    managerId: "MGR001",
    phone: "0955-888-999",
    password: "123"
  },
  {
    id: "MGR001",
    name: "李經理",
    email: "lee.manager@company.com",
    department: "技術工程部",
    title: "技術工程處處長",
    role: "MANAGER",
    managerId: "DIR001",
    phone: "0911-222-333",
    password: "123"
  },
  {
    id: "MGR002",
    name: "趙經理",
    email: "chao.manager@company.com",
    department: "產品研發部",
    title: "產品研發處處長",
    role: "MANAGER",
    managerId: "DIR001",
    phone: "0966-777-888",
    password: "123"
  },
  {
    id: "DIR001",
    name: "王總監",
    email: "wang.director@company.com",
    department: "管理部",
    title: "技術副總經理 (部門最高主管)",
    role: "DEPT_HEAD",
    managerId: null,
    phone: "0988-999-000",
    password: "123"
  },
  {
    id: "HR001",
    name: "陳主任",
    email: "chen.hr@company.com",
    department: "人力資源部",
    title: "人力資源部經理",
    role: "HR_MANAGER",
    managerId: null,
    phone: "0977-111-222",
    password: "123"
  },
  {
    id: "HR002",
    name: "林專員",
    email: "lin.hr@company.com",
    department: "人力資源部",
    title: "教育訓練專員",
    role: "HR_STAFF",
    managerId: "HR001",
    phone: "0922-888-111",
    password: "123"
  },
  {
    id: "ADMIN",
    name: "系統管理員",
    email: "admin@company.com",
    department: "資訊資訊中心",
    title: "系統架構師",
    role: "ADMIN",
    managerId: null,
    phone: "0900-000-000",
    password: "123"
  }
];

const initialApplications: TrainingApplication[] = [
  {
    id: "TR-202611-001",
    applyDate: "2026/11/20",
    applicantId: "EMP001",
    applicantName: "張大同",
    dept: "技術工程部",
    trainingType: "外訓",
    courseName: "AI 智慧製造實戰工作坊與邊緣運算應用",
    courseContent: "生成式 AI 與自動化流程實務應用、模型微調與邊緣裝置部署實作",
    courseObjective: "提升跨部門流程自動化效率與數據決策能力，擬於訓後辦理部門內訓轉訓",
    isAnnualPlan: true,
    startDate: "2026/12/01",
    endDate: "2026/12/02",
    totalDays: 2,
    totalHours: 14,
    notes: "符合 2026 年度關鍵技術人才轉型計畫",
    trainees: [
      { empId: "EMP001", name: "張大同", dept: "技術工程部", title: "資深軟體工程師" },
      { empId: "EMP004", name: "林雅婷", dept: "技術工程部", title: "數據分析師" }
    ],
    returnDocs: ["外訓心得報告", "課程教材", "證書或證照"],
    attachments: ["課程簡章", "報名表", "匯款資訊"],
    transferInternal: true,
    transferWeeks: "3",
    transferLecturer: "張大同",
    quoteRows: [
      {
        orgOrLecturer: "台灣人工智慧學校",
        cost: 24000,
        location: "台北市大安區培訓中心",
        comment: "知名授證機構，含上機實作設備，費用合理推薦",
        hrSign: "林專員"
      }
    ],
    status: "APPROVED",
    applicantSign: "張大同",
    reviewerId: "MGR001",
    reviewerSign: "李經理",
    reviewerComment: "符合部門第四季研發自動化目標，同意受訓並排定轉訓。",
    reviewedAt: "2026/11/21 10:30",
    approverId: "HR001",
    approverSign: "陳主任",
    approverComment: "已核准預算與名額，請人資承辦協助公出及報名手續。",
    approvedAt: "2026/11/21 16:45",
    hrStaffId: "HR002",
    hrStaffSign: "林專員",
    hrActionAt: "2026/11/22 09:15",
    wordDocUrl: "/generated/test_output_app.docx",
    createdAt: "2026-11-20T08:30:00.000Z",
    updatedAt: "2026-11-22T09:15:00.000Z"
  },
  {
    id: "TR-202611-002",
    applyDate: "2026/11/23",
    applicantId: "EMP002",
    applicantName: "王小美",
    dept: "產品研發部",
    trainingType: "內訓",
    courseName: "新版 Design System 與無障礙設計規範 (WCAG 2.2)",
    courseContent: "企業元件庫標準架構、Token 規範與設計協作流程優化",
    courseObjective: "建立全公司一致之數位介面規範，並降低前端工程師溝通成本",
    isAnnualPlan: true,
    startDate: "2026/12/10",
    endDate: "2026/12/10",
    totalDays: 1,
    totalHours: 6,
    notes: "各產品線主管與前端開發者務必參加",
    targetAudience: "產品經理、UI/UX 設計師、前端工程師",
    expectedTrainees: 25,
    internalCost: 0,
    lecturerType: "內聘",
    lecturerName: "王小美",
    lecturerOrg: "產品研發部",
    lecturerTitle: "UI/UX 設計師",
    status: "PENDING_UNIT_REVIEW",
    applicantSign: "王小美",
    wordDocUrl: "",
    createdAt: "2026-11-23T14:20:00.000Z",
    updatedAt: "2026-11-23T14:20:00.000Z"
  }
];

const initialAttendance: AttendanceRecord[] = [
  {
    id: "ATT-202611-001",
    applicationId: "TR-202611-001",
    courseName: "AI 智慧製造實戰工作坊與邊緣運算應用",
    lecturerType: "內部講師",
    lecturerName: "張大同",
    location: "A 棟 302 多功能培訓教室",
    startDate: "2026/12/01",
    endDate: "2026/12/02",
    dailyTime: "09:00 ~ 17:00",
    totalHours: 14,
    expectedCount: 2,
    actualCount: 2,
    hasMaterial: true,
    evalMethods: ["筆試", "實作", "心得報告"],
    lecturerSign: "張大同",
    qrCodeToken: "TOKEN_AI_WORKSHOP_2026",
    attendees: [
      {
        empId: "EMP001",
        name: "張大同",
        dept: "技術工程部",
        signed: true,
        signedAt: "2026/12/01 08:52",
        score: 95,
        passed: true,
        feedbackSubmitted: true
      },
      {
        empId: "EMP004",
        name: "林雅婷",
        dept: "技術工程部",
        signed: true,
        signedAt: "2026/12/01 08:55",
        score: 90,
        passed: true,
        feedbackSubmitted: false
      }
    ],
    wordDocUrl: "/generated/test_output_att.docx",
    status: "OPEN",
    createdAt: "2026-11-22T09:30:00.000Z",
    updatedAt: "2026-11-22T09:30:00.000Z"
  }
];

const initialFeedback: FeedbackReport[] = [
  {
    id: "FB-202611-001-EMP001",
    applicationId: "TR-202611-001",
    empId: "EMP001",
    empName: "張大同",
    dept: "技術工程部",
    courseName: "AI 智慧製造實戰工作坊與邊緣運算應用",
    startDate: "2026/12/01",
    endDate: "2026/12/02",
    totalHours: 14,
    orgName: "台灣人工智慧學校",
    lecturerName: "陳教授",
    reportDate: "2026/12/03",
    q1: "非常需要",
    q2: "非常佳",
    q3: "非常佳",
    q4: "非常佳",
    q5: "非常瞭解",
    learningPoints: "1. 掌握現代企業級大語言模型提示工程 (Prompt Engineering) 與 Agentic 流程設計。\n2. 深入理解邊緣端 (Edge AI) 輕量化量化技術與本機推理實務。\n3. 實作以 Python 整合既有內部資料庫完成自動化問答與工作流程串接。",
    actionPlan: "1. 兩週內完成「技術工程部內部轉訓工作坊」，預計培訓 10 名軟體與韌體工程師。\n2. 於產線品質監控系統試點導入邊緣檢測模組，目標減少 40% 人工作業時間。",
    managerReview1: "非常充實",
    managerReview2: "非常好",
    managerReview3: "非常好",
    managerComment: "報告內容豐富詳盡，行動方案切合部門智慧化戰略，同意轉訓計畫並由人資協助場地安排。",
    topManagerComment: "核准。請技術工程部列入 Q4 KPI 追蹤專案成效。",
    status: "APPROVED",
    reporterSign: "張大同",
    reviewerSign: "李經理",
    reviewerId: "MGR001",
    reviewedAt: "2026/12/04 11:20",
    approverSign: "王總監",
    approverId: "DIR001",
    approvedAt: "2026/12/04 16:30",
    wordDocUrl: "/generated/test_output_fb.docx",
    createdAt: "2026-12-03T10:00:00.000Z",
    updatedAt: "2026-12-04T16:30:00.000Z"
  }
];

function initDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const data: DatabaseSchema = {
      users: initialUsers,
      applications: initialApplications,
      attendanceRecords: initialAttendance,
      feedbackReports: initialFeedback
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    return data;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {
      users: initialUsers,
      applications: initialApplications,
      attendanceRecords: initialAttendance,
      feedbackReports: initialFeedback
    };
  }
}

export function getDb(): DatabaseSchema {
  return initDb();
}

export function saveDb(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}
