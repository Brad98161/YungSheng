import docx
import os
import sys
import json
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = BASE_DIR

def get_template_path(filename):
    return os.path.join(TEMPLATES_DIR, filename)

def set_cell_text(cell, text, bold=False):
    cell.text = str(text) if text is not None else ""
    if bold and cell.paragraphs and cell.paragraphs[0].runs:
        cell.paragraphs[0].runs[0].font.bold = True

def fill_application_form(data, output_path):
    """
    Fills RE-SOP-003-04教育訓練申請表07.docx
    """
    tmpl = get_template_path("RE-SOP-003-04教育訓練申請表07.docx")
    doc = docx.Document(tmpl)
    table = doc.tables[0]

    # Row 0: 申請日期 [0], 內訓/外訓 [6]
    apply_date = data.get("applyDate", datetime.now().strftime("%Y / %m / %d"))
    table.rows[0].cells[0].text = f"申請日期： {apply_date}"
    is_internal = data.get("trainingType", "外訓") == "內訓"
    type_box = f"{'■' if is_internal else '□'} 內訓      {'■' if not is_internal else '□'} 外訓"
    table.rows[0].cells[6].text = type_box

    # Row 1: 課程名稱 [3]
    table.rows[1].cells[3].text = data.get("courseName", "")

    # Row 2: 受訓內容 [3]
    table.rows[2].cells[3].text = data.get("courseContent", "")

    # Row 3: 課程目標 [3]
    table.rows[3].cells[3].text = data.get("courseObjective", "")

    # Row 4: 內訓 - 受訓對象 [3], 預計受訓人數 [9], 課程費用 [13]
    if is_internal:
        table.rows[4].cells[3].text = data.get("targetAudience", "")
        table.rows[4].cells[9].text = str(data.get("expectedTrainees", ""))
        table.rows[4].cells[13].text = str(data.get("internalCost", ""))

    # Row 5: 內訓講師 內聘/外聘
    if is_internal:
        is_inner = data.get("lecturerType", "內聘") == "內聘"
        table.rows[5].cells[1].text = f"請勾選：{'■' if is_inner else '□'}內聘  {'■' if not is_inner else '□'}外聘            講師資料"
        # Row 6: 姓名 [3], 服務單位 [9], 職稱 [13]
        table.rows[6].cells[3].text = data.get("lecturerName", "")
        table.rows[6].cells[9].text = data.get("lecturerOrg", "")
        table.rows[6].cells[13].text = data.get("lecturerTitle", "")

    # Row 8, 9, 10: 外訓 受訓人員清單
    trainees = data.get("trainees", [])
    # Can fit up to 6 trainees (2 per row)
    for i in range(min(len(trainees), 6)):
        r_idx = 8 + (i // 2)
        col_offset = 2 if (i % 2 == 0) else 9
        unit_cell = col_offset
        emp_cell = col_offset + 2
        t = trainees[i]
        unit_title = f"{t.get('dept', '')} / {t.get('title', '')}"
        emp_info = f"{t.get('empId', '')} / {t.get('name', '')}"
        table.rows[r_idx].cells[unit_cell].text = unit_title
        table.rows[r_idx].cells[emp_cell].text = emp_info

    # Row 11: 訓後應繳交資料
    docs = data.get("returnDocs", ["外訓心得報告"])
    docs_other = str(data.get("returnDocsOther", "") or "").strip()
    doc_opts = ["外訓心得報告", "課程教材", "證書或證照", "其他", "無"]
    doc_parts = []
    for opt in doc_opts:
        if opt == "其他":
            if "其他" in docs:
                doc_parts.append(f"■其他{f'（{docs_other}）' if docs_other else ''}")
            else:
                doc_parts.append("□其他")
        else:
            doc_parts.append(f"{'■' if opt in docs else '□'}{opt}")
    doc_str = "訓後應繳交資料︰" + "  ".join(doc_parts)
    table.rows[11].cells[1].text = doc_str

    # Row 12: 檢附附件
    attachments = data.get("attachments", ["課程簡章"])
    att_other = str(data.get("attachmentsOther", "") or "").strip()
    att_opts = ["課程簡章", "報名表", "匯款資訊", "其他", "無"]
    att_parts = []
    for opt in att_opts:
        if opt == "其他":
            if "其他" in attachments:
                att_parts.append(f"■其他{f'（{att_other}）' if att_other else ''}")
            else:
                att_parts.append("□其他")
        else:
            att_parts.append(f"{'■' if opt in attachments else '□'}{opt}")
    att_str = "檢附附件︰" + "  ".join(att_parts)
    table.rows[12].cells[1].text = att_str

    # Row 13: 主管要求學習重點 (部門主管填寫)
    transfer_type = data.get("transferType", "")
    transfer = data.get("transferInternal", False) or transfer_type == "TRANSFER"
    weeks = data.get("transferWeeks", "")
    t_lecturer = data.get("transferLecturer", "")
    transfer_other = str(data.get("transferOther", "") or "").strip()
    is_other = transfer_type == "OTHER" or bool(transfer_other)
    is_no_transfer = transfer_type == "NO_TRANSFER" or (not transfer and not is_other)

    t_box = f"{'■' if transfer else '□'}轉訓，建議轉內訓時限：  {weeks}  週內，講師：  {t_lecturer}"
    no_box = f"{'■' if is_no_transfer else '□'}不轉訓"
    other_box = f"{'■' if is_other else '□'}其他{f'（{transfer_other}）' if transfer_other else ''}"
    req_str = f"主管要求學習重點(部門主管填寫)︰\n{t_box}         {no_box}  {other_box}"
    table.rows[13].cells[1].text = req_str

    # Row 16, 17: 人資詢議價
    quotes = data.get("quoteRows", [])
    for q_idx in range(min(len(quotes), 2)):
        r = 16 + q_idx
        q = quotes[q_idx]
        table.rows[r].cells[0].text = q.get("orgOrLecturer", "")
        table.rows[r].cells[4].text = str(q.get("cost", ""))
        table.rows[r].cells[7].text = q.get("location", "")
        table.rows[r].cells[9].text = f"{q.get('comment', '')} (人資：{q.get('hrSign', '')})"

    # Row 18: 受訓時間
    start_date = data.get("startDate", "")
    end_date = data.get("endDate", "")
    days = data.get("totalDays", "")
    hours = data.get("totalHours", "")
    is_annual = data.get("isAnnualPlan", True)
    time_str = f"受訓時間︰  {start_date}  起至  {end_date}  止，共  {days}  天(總時數  {hours}  小時) {'■' if is_annual else '□'} 年度計畫內課程        {'■' if not is_annual else '□'} 非年度計畫內課程(參訓原因填寫於備註)"
    table.rows[18].cells[0].text = time_str

    # Row 19: 備註
    table.rows[19].cells[2].text = data.get("notes", "")

    # Row 20: 申請人 [2], 審核 [8], 核准 [12]
    table.rows[20].cells[2].text = data.get("applicantSign", "")
    table.rows[20].cells[8].text = data.get("reviewerSign", "")
    table.rows[20].cells[12].text = data.get("approverSign", "")

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    doc.save(output_path)
    return output_path

def fill_attendance_form(data, output_path):
    """
    Fills RE-SOP-003-03教育訓練簽到考核表04.docx
    """
    tmpl = get_template_path("RE-SOP-003-03教育訓練簽到考核表04.docx")
    doc = docx.Document(tmpl)
    table = doc.tables[0]

    # Row 0: 課程名稱 [1]
    table.rows[0].cells[1].text = data.get("courseName", "")

    # Row 1: 講師
    is_internal_lecturer = data.get("lecturerType", "內部講師") == "內部講師"
    if is_internal_lecturer:
        table.rows[1].cells[1].text = f"■內部講師： {data.get('lecturerName', '')} (□專業技術一年以上 ■領有結業證書（證照） □經主管核定其專業技能且具教授能力)\n□外聘講師：訓練機構 ___________________"
    else:
        table.rows[1].cells[1].text = f"□內部講師： (□專業技術一年以上 □領有結業證書 □經主管核定)\n■外聘講師：{data.get('lecturerName', '')} / 訓練機構：{data.get('lecturerOrg', '')}"

    # Row 2: 訓練地點 [1], 訓練時間 [3]
    table.rows[2].cells[1].text = data.get("location", "")
    table.rows[2].cells[3].text = f"{data.get('startDate', '')} ~ {data.get('endDate', '')} ； {data.get('dailyTime', '')}；共 {data.get('totalHours', '')} 小時"

    # Row 3: 應到人數 [1], 實到人數 [3], 教材領取 [5]
    table.rows[3].cells[1].text = str(data.get("expectedCount", ""))
    table.rows[3].cells[3].text = str(data.get("actualCount", ""))
    has_material = data.get("hasMaterial", True)
    table.rows[3].cells[5].text = f"{'■' if has_material else '□'}發放教材 {'■' if not has_material else '□'}無教材"

    # Row 4: 考核方式 [1], 講師簽名 [5]
    eval_methods = data.get("evalMethods", ["筆試", "實作"])
    m_opts = ["口試", "筆試", "實作", "心得報告", "問題與討論"]
    table.rows[4].cells[1].text = " ".join([f"{'■' if m in eval_methods else '□'}{m}" for m in m_opts])
    table.rows[4].cells[5].text = data.get("lecturerSign", "")

    # Row 6 to 20: 學員名冊 (up to 15 students)
    trainees = data.get("attendees", [])
    for idx, att in enumerate(trainees[:15]):
        r_idx = 6 + idx
        table.rows[r_idx].cells[0].text = str(idx + 1)
        table.rows[r_idx].cells[1].text = att.get("dept", "")
        table.rows[r_idx].cells[2].text = att.get("empId", "")
        table.rows[r_idx].cells[3].text = att.get("signName", "已簽到" if att.get("signed") else "")
        score = att.get("score", "")
        table.rows[r_idx].cells[5].text = str(score)
        passed = att.get("passed", True)
        table.rows[r_idx].cells[6].text = f"{'■' if passed else '□'}合格\n{'■' if not passed else '□'}不合格"

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    doc.save(output_path)
    return output_path

def fill_feedback_form(data, output_path):
    """
    Fills RE-SOP-003-06外訓心得報告04.docx
    """
    tmpl = get_template_path("RE-SOP-003-06外訓心得報告04.docx")
    doc = docx.Document(tmpl)
    table = doc.tables[0]

    # Row 0: 單位 [1], 課程名稱 [6], 填表日期 [12]
    table.rows[0].cells[1].text = data.get("dept", "")
    table.rows[0].cells[6].text = data.get("courseName", "")
    table.rows[0].cells[12].text = data.get("reportDate", datetime.now().strftime("%Y / %m / %d"))

    # Row 1: 姓名 [1], 日期 [6], 時數 [14]
    table.rows[1].cells[1].text = data.get("empName", "")
    table.rows[1].cells[6].text = f"{data.get('startDate', '')} ~ {data.get('endDate', '')}"
    table.rows[1].cells[14].text = f"時數：{data.get('totalHours', '')} 小時"

    # Row 2: 訓練機構 [2], 講師 [9]
    table.rows[2].cells[2].text = data.get("orgName", "")
    table.rows[2].cells[9].text = data.get("lecturerName", "")

    # Row 4 to 8: 意見選擇
    # 1. 配合實際需要 (非常需要, 需要, 尚可, 很少)
    ans1 = data.get("q1", "非常需要")
    opts1 = ["非常需要", "需要", "尚可", "很少"]
    table.rows[4].cells[8].text = "  ".join([f"{'■' if opt == ans1 else '□'}{opt}" for opt in opts1])

    # 2. 對工作幫助程度 (非常佳, 佳, 尚可, 很少)
    ans2 = data.get("q2", "非常佳")
    opts2 = ["非常佳", "佳", "尚可", "很少"]
    table.rows[5].cells[8].text = "  ".join([f"{'■' if opt == ans2 else '□'}{opt}" for opt in opts2])

    # 3. 機構服務 (非常佳, 佳, 尚可, 不佳)
    ans3 = data.get("q3", "非常佳")
    opts3 = ["非常佳", "佳", "尚可", "不佳"]
    table.rows[6].cells[8].text = "  ".join([f"{'■' if opt == ans3 else '□'}{opt}" for opt in opts3])

    # 4. 講師教授方式 (非常佳, 佳, 尚可, 不能接受)
    ans4 = data.get("q4", "非常佳")
    opts4 = ["非常佳", "佳", "尚可", "不能接受"]
    table.rows[7].cells[8].text = "  ".join([f"{'■' if opt == ans4 else '□'}{opt}" for opt in opts4])

    # 5. 課程內容瞭解程度 (非常瞭解, 瞭解, 尚可, 不瞭解)
    ans5 = data.get("q5", "非常瞭解")
    opts5 = ["非常瞭解", "瞭解", "尚可", "不瞭解"]
    table.rows[8].cells[8].text = "  ".join([f"{'■' if opt == ans5 else '□'}{opt}" for opt in opts5])

    # Row 9: 授課主要內容或學習到什麼
    p9 = data.get("learningPoints", "1. 掌握核心技能觀念。\n2. 深入學習操作流程。\n3. 解決實際工作瓶頸。")
    table.rows[9].cells[0].text = f"授課主要內容或學習到什麼(觀念、方法、技巧…等)?(至少3點)\n{p9}"

    # Row 10: 課程內容如何運用於工作
    p10 = data.get("actionPlan", "1. 擬定改善方案並於兩週內向部門主管報告。\n2. 導入新流程以提升30%工作效率。")
    table.rows[10].cells[0].text = f"課程內容如何運用於工作︰提出具體改善及提昇才能的行動計畫、作法。\n{p10}"

    # Row 12, 13, 14, 15: 審核主管評核
    r1 = data.get("managerReview1", "非常充實") # 心得內容
    table.rows[12].cells[8].text = "  ".join([f"{'■' if opt == r1 else '□'}{opt}" for opt in ["非常充實", "充實", "尚可", "不充實"]])

    r2 = data.get("managerReview2", "非常好") # 行動計畫
    table.rows[13].cells[8].text = "  ".join([f"{'■' if opt == r2 else '□'}{opt}" for opt in ["非常好", "好", "尚可", "差強人意"]])

    r3 = data.get("managerReview3", "非常好") # 綜合評價
    table.rows[14].cells[8].text = "  ".join([f"{'■' if opt == r3 else '□'}{opt}" for opt in ["非常好", "好", "尚可", "不佳"]])

    comment1 = data.get("managerComment", "學習態度認真，行動計畫具體可行，准予轉內訓分享。")
    table.rows[15].cells[0].text = f"4. 其他意見及評語︰\n{comment1}"

    # Row 16: 部門最高主管評核
    top_comment = data.get("topManagerComment", "同意審核意見，列入年度訓練成效考核。")
    table.rows[16].cells[0].text = f"部門最高主管評核(填寫意見及評語)︰\n{top_comment}"

    # Row 17: 報告者 [3], 審核 [7], 核准 [13]
    table.rows[17].cells[3].text = data.get("reporterSign", "")
    table.rows[17].cells[7].text = data.get("reviewerSign", "")
    table.rows[17].cells[13].text = data.get("approverSign", "")

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    doc.save(output_path)
    return output_path

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # CLI usage: python fill_templates.py <type> <json_data_path_or_str> <output_path>
        t_type = sys.argv[1]
        raw_data = sys.argv[2]
        out_path = sys.argv[3]
        if os.path.exists(raw_data):
            with open(raw_data, "r", encoding="utf-8") as f:
                d = json.load(f)
        else:
            d = json.loads(raw_data)

        if t_type == "application":
            fill_application_form(d, out_path)
        elif t_type == "attendance":
            fill_attendance_form(d, out_path)
        elif t_type == "feedback":
            fill_feedback_form(d, out_path)
        print(f"OK: {out_path}")
    else:
        # Self-test
        print("Running template filling test...")
        out1 = fill_application_form({
            "applyDate": "2026 / 11 / 25",
            "trainingType": "外訓",
            "courseName": "AI 智慧製造實戰工作坊",
            "courseContent": "生成式 AI 與自動化流程實務應用",
            "courseObjective": "提升跨部門流程自動化效率與數據決策能力",
            "trainees": [
                {"dept": "技術工程部", "title": "資深工程師", "empId": "EMP001", "name": "張大同"},
                {"dept": "產品研發部", "title": "工程師", "empId": "EMP002", "name": "王小美"}
            ],
            "returnDocs": ["外訓心得報告", "課程教材"],
            "attachments": ["課程簡章", "報名表"],
            "transferInternal": True,
            "transferWeeks": "3",
            "transferLecturer": "張大同",
            "quoteRows": [
                {"orgOrLecturer": "台灣人工智慧學院", "cost": 18000, "location": "台北培訓中心", "comment": "課程完整，推薦採用", "hrSign": "林專員"}
            ],
            "startDate": "2026/12/01",
            "endDate": "2026/12/02",
            "totalDays": 2,
            "totalHours": 14,
            "isAnnualPlan": True,
            "notes": "符合第四季關鍵數位轉型培育計畫",
            "applicantSign": "張大同",
            "reviewerSign": "李經理",
            "approverSign": "王總監"
        }, os.path.join(BASE_DIR, "test_output_app.docx"))

        out2 = fill_attendance_form({
            "courseName": "AI 智慧製造實戰工作坊",
            "lecturerType": "內部講師",
            "lecturerName": "張大同",
            "location": "A棟302會議室",
            "startDate": "2026/12/05",
            "endDate": "2026/12/05",
            "dailyTime": "09:00 ~ 17:00",
            "totalHours": 7,
            "expectedCount": 10,
            "actualCount": 9,
            "hasMaterial": True,
            "evalMethods": ["筆試", "實作"],
            "lecturerSign": "張大同",
            "attendees": [
                {"dept": "技術工程部", "empId": "EMP003", "signName": "陳建宏", "signed": True, "score": 92, "passed": True},
                {"dept": "品保部", "empId": "EMP004", "signName": "林雅婷", "signed": True, "score": 88, "passed": True}
            ]
        }, os.path.join(BASE_DIR, "test_output_att.docx"))

        out3 = fill_feedback_form({
            "dept": "技術工程部",
            "courseName": "AI 智慧製造實戰工作坊",
            "reportDate": "2026 / 12 / 03",
            "empName": "張大同",
            "startDate": "2026/12/01",
            "endDate": "2026/12/02",
            "totalHours": 14,
            "orgName": "台灣人工智慧學院",
            "lecturerName": "陳教授",
            "q1": "非常需要",
            "q2": "非常佳",
            "q3": "非常佳",
            "q4": "非常佳",
            "q5": "非常瞭解",
            "learningPoints": "1. 掌握大語言模型提示詞工程與 Agent 系統架構。\n2. 實作以 Python 與 API 自動化處理業務資料流程。\n3. 學習現代企業知識庫 RAG 檢索增強生成架構。",
            "actionPlan": "1. 兩週內完成部門內部轉訓工作坊，預計培訓10名工程師。\n2. 評估現有表單流程並導入自動化原型測試。",
            "managerReview1": "非常充實",
            "managerReview2": "非常好",
            "managerReview3": "非常好",
            "managerComment": "內容扎實且與部門數位化策略高度契合，同意轉訓計畫。",
            "topManagerComment": "核准，請人資部協調會議室與轉訓時程。",
            "reporterSign": "張大同",
            "reviewerSign": "李經理",
            "approverSign": "王總監"
        }, os.path.join(BASE_DIR, "test_output_fb.docx"))

        print("Test completed successfully!")
        print("Generated files:", out1, out2, out3)
