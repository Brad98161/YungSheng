export type UserRole = 
  | "STAFF"        // 一般員工
  | "MANAGER"      // 單位主管 (審核)
  | "DEPT_HEAD"    // 部門最高主管 (核准)
  | "HR_MANAGER"   // 人資部主管 (核准/詢議價)
  | "HR_STAFF"     // 人資承辦人員
  | "ADMIN";       // 系統管理員

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  title: string;
  role: UserRole;
  managerId: string | null;
  phone?: string;
  password?: string;
}

export type ApplicationStatus = 
  | "DRAFT"                 // 草稿
  | "PENDING_UNIT_REVIEW"   // 待單位主管審核
  | "PENDING_HR_REVIEW"     // 待人資主管核准
  | "PENDING_HR_ACTION"     // 待人資承辦成案/詢議價
  | "APPROVED"              // 已核准成案
  | "REJECTED";             // 退回

export interface TraineeItem {
  empId: string;
  name: string;
  dept: string;
  title: string;
}

export interface QuoteItem {
  orgOrLecturer: string;
  cost: number | string;
  location: string;
  comment: string;
  hrSign: string;
}

export interface TrainingApplication {
  id: string;
  applyDate: string;
  applicantId: string;
  applicantName: string;
  dept: string;
  trainingType: "內訓" | "外訓";
  courseName: string;
  courseContent: string;
  courseObjective: string;
  isAnnualPlan: boolean;
  startDate: string;
  endDate: string;
  totalDays: number | string;
  totalHours: number | string;
  notes: string;
  
  // 內訓專屬
  targetAudience?: string;
  expectedTrainees?: number | string;
  internalCost?: number | string;
  lecturerType?: "內聘" | "外聘";
  lecturerName?: string;
  lecturerOrg?: string;
  lecturerTitle?: string;

  // 外訓專屬
  trainees?: TraineeItem[];
  returnDocs?: string[];
  returnDocsOther?: string;
  attachments?: string[];
  attachmentsOther?: string;
  transferInternal?: boolean;
  transferType?: "TRANSFER" | "NO_TRANSFER" | "OTHER";
  transferWeeks?: string;
  transferLecturer?: string;
  transferOther?: string;

  // 人資詢議價 (人資填寫)
  quoteRows?: QuoteItem[];

  // 審核簽核紀錄
  status: ApplicationStatus;
  applicantSign: string;
  
  reviewerId?: string;
  reviewerSign?: string;
  reviewerComment?: string;
  reviewedAt?: string;

  approverId?: string;
  approverSign?: string;
  approverComment?: string;
  approvedAt?: string;

  hrStaffId?: string;
  hrStaffSign?: string;
  hrActionAt?: string;

  // 附件 Word 下載路徑 (例如: /generated/app_TR-001.docx)
  wordDocUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStudent {
  empId: string;
  name: string;
  dept: string;
  signed: boolean;
  signedAt?: string;
  score?: number | string;
  passed?: boolean;
  feedbackSubmitted?: boolean;
}

export interface AttendanceRecord {
  id: string;
  applicationId: string;
  courseName: string;
  lecturerType: "內部講師" | "外聘講師";
  lecturerName: string;
  lecturerOrg?: string;
  location: string;
  startDate: string;
  endDate: string;
  dailyTime: string;
  totalHours: number | string;
  expectedCount: number;
  actualCount: number;
  hasMaterial: boolean;
  evalMethods: string[];
  lecturerSign: string;
  qrCodeToken: string;
  attendees: AttendanceStudent[];
  wordDocUrl?: string;
  status: "OPEN" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackReport {
  id: string;
  applicationId: string;
  empId: string;
  empName: string;
  dept: string;
  courseName: string;
  startDate: string;
  endDate: string;
  totalHours: number | string;
  orgName: string;
  lecturerName: string;
  reportDate: string;

  // 5大問卷
  q1: string; // 配合實際需要程度
  q2: string; // 對工作幫助程度
  q3: string; // 機構服務
  q4: string; // 講師教授方式
  q5: string; // 課程內容瞭解程度

  // 質化問答
  learningPoints: string;
  actionPlan: string;

  // 審核主管評核
  managerReview1?: string; // 心得內容
  managerReview2?: string; // 行動計畫
  managerReview3?: string; // 綜合評價
  managerComment?: string;

  // 部門最高主管評核
  topManagerComment?: string;

  status: "DRAFT" | "SUBMITTED" | "MANAGER_REVIEWED" | "APPROVED";
  
  reporterSign: string;
  reviewerSign?: string;
  reviewerId?: string;
  reviewedAt?: string;

  approverSign?: string;
  approverId?: string;
  approvedAt?: string;

  wordDocUrl?: string;
  createdAt: string;
  updatedAt: string;
}
