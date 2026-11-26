import { spawnSync } from "child_process";
import path from "path";
import fs from "fs";
import { TrainingApplication, AttendanceRecord, FeedbackReport } from "@/types";

const PYTHON_SCRIPT_PATH = path.resolve(process.cwd(), "..", "fill_templates.py");
const GENERATED_DIR = path.resolve(process.cwd(), "public", "generated");

function ensureOutputDir() {
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }
}

export function generateApplicationWord(app: TrainingApplication): string {
  ensureOutputDir();
  const filename = `app_${app.id}.docx`;
  const outputPath = path.join(GENERATED_DIR, filename);

  const payload = JSON.stringify(app);
  const result = spawnSync("python", [PYTHON_SCRIPT_PATH, "application", payload, outputPath], {
    encoding: "utf-8"
  });

  if (result.error || result.status !== 0) {
    console.error("Word Generation Error (Application):", result.stderr || result.error);
  }

  return `/generated/${filename}`;
}

export function generateAttendanceWord(att: AttendanceRecord): string {
  ensureOutputDir();
  const filename = `att_${att.id}.docx`;
  const outputPath = path.join(GENERATED_DIR, filename);

  const payload = JSON.stringify(att);
  const result = spawnSync("python", [PYTHON_SCRIPT_PATH, "attendance", payload, outputPath], {
    encoding: "utf-8"
  });

  if (result.error || result.status !== 0) {
    console.error("Word Generation Error (Attendance):", result.stderr || result.error);
  }

  return `/generated/${filename}`;
}

export function generateFeedbackWord(fb: FeedbackReport): string {
  ensureOutputDir();
  const filename = `fb_${fb.id}.docx`;
  const outputPath = path.join(GENERATED_DIR, filename);

  const payload = JSON.stringify(fb);
  const result = spawnSync("python", [PYTHON_SCRIPT_PATH, "feedback", payload, outputPath], {
    encoding: "utf-8"
  });

  if (result.error || result.status !== 0) {
    console.error("Word Generation Error (Feedback):", result.stderr || result.error);
  }

  return `/generated/${filename}`;
}
