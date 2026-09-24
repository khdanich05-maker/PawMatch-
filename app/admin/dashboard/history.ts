export const categories = [
  { key: "reports", table: "stray_reports", id: "report_id", date: "report_date", label: "รายงานแจ้งพบสัตว์", note: "รายงานที่แจ้งในช่วงเวลาที่เลือก", color: "#C07055" },
  { key: "matches", table: "matches", id: "match_id", date: "start_date", label: "การจับคู่", note: "รายการที่เริ่มในช่วงเวลาที่เลือก", color: "#497B69" },
  { key: "care", table: "care_logs", id: "log_id", date: "log_date", label: "บันทึกการดูแล", note: "บันทึกการดูแลในช่วงเวลาที่เลือก", color: "#7078B4" },
] as const;

export type Kind = typeof categories[number]["key"];
export const historyColumns: Record<Kind, string> = {
  reports: "report_id,user_id,shelter_id,animal_id,location,image_url,report_date,approval_status,species,color,status",
  matches: "match_id,user_id,animal_id,start_date,end_date,match_status,care_time,monthly_budget,family_members,adoption_reason,rejection_reason,reviewed_at,reviewed_by",
  care: "log_id,match_id,log_date,activity_type,description,image_url",
};
export type Preset = "today" | "week" | "month" | "year" | "custom";
export type Row = Record<string, unknown>;
export type HistoryItem = {
  id: string; kind: Kind; date: string; shelterId: string; shelter: string;
  animal: string; species: string; caregiver: string; location: string;
  status: string; endDate: string; activity: string; description: string; images: string[];
  details: [string, string][];
};

// Bangkok is the reporting timezone, independent of the browser's timezone.
export function dayKey(value: string | Date): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function shiftDay(day: string, amount: number) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function period(preset: Exclude<Preset, "custom">, now = new Date()) {
  const end = dayKey(now);
  const start = preset === "week" ? shiftDay(end, -6)
    : preset === "month" ? `${end.slice(0, 7)}-01`
    : preset === "year" ? `${end.slice(0, 4)}-01-01` : end;
  return { start, end };
}

export function validPeriod(start: string, end: string) {
  return [start, end].every((day) => /^\d{4}-\d{2}-\d{2}$/.test(day)
    && !Number.isNaN(Date.parse(`${day}T00:00:00Z`))
    && new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) === day) && start <= end;
}

export function text(row: Row | undefined, ...fields: string[]): string {
  for (const field of fields) {
    const value = row?.[field];
    if ((typeof value === "string" && value.trim()) || typeof value === "number") return String(value);
  }
  return "";
}

export function imageUrls(value: unknown): string[] {
  let values: unknown[] = [];
  if (Array.isArray(value)) values = value;
  else if (typeof value === "string") {
    try { const parsed: unknown = JSON.parse(value); values = Array.isArray(parsed) ? parsed : [value]; }
    catch { values = [value]; }
  }
  return values.filter((url): url is string => {
    if (typeof url !== "string") return false;
    try { return ["http:", "https:"].includes(new URL(url).protocol); } catch { return false; }
  });
}

export function normalize(kind: Kind, row: Row, lookups: {
  matches: Map<string, Row>; animals: Map<string, Row>; users: Map<string, Row>; shelters: Map<string, Row>;
}): HistoryItem {
  const config = categories.find((entry) => entry.key === kind)!;
  const match = kind === "matches" ? row : kind === "care" ? lookups.matches.get(text(row, "match_id")) : undefined;
  const animalId = text(row, "animal_id") || text(match, "animal_id");
  const animal = lookups.animals.get(animalId);
  const userId = kind === "care" ? text(match, "user_id") : text(row, "user_id");
  const user = lookups.users.get(userId);
  // A report's receiving shelter is independent of the animal's current shelter.
  const shelterId = kind === "reports" ? text(row, "shelter_id") : text(animal, "shelter_id");
  const reviewerId = text(row, "reviewed_by");
  const reviewer = lookups.users.get(reviewerId);
  return {
    id: text(row, config.id), kind, date: text(row, config.date), shelterId,
    shelter: text(lookups.shelters.get(shelterId), "shelter_name") || (shelterId ? `ศูนย์ ${shelterId}` : "ยังไม่ระบุศูนย์"),
    animal: text(animal, "name") || (animalId ? `สัตว์ ${animalId}` : ""),
    species: kind === "reports" ? text(row, "species") : text(animal, "species"),
    caregiver: text(user, "full_name", "username") || (userId ? `ผู้ใช้ ${userId}` : ""),
    location: text(row, "location").replace(/\s*\(\s*พิกัด\s*:\s*[+-]?\d+(?:\.\d+)?\s*,\s*[+-]?\d+(?:\.\d+)?\s*\)/g, "").trim(),
    status: kind === "matches" ? text(row, "match_status") : kind === "reports" ? text(row, "approval_status") : "",
    endDate: text(row, "end_date"), activity: text(row, "activity_type"),
    description: kind === "matches" ? text(row, "adoption_reason") : kind === "care" ? text(row, "description") : "",
    images: imageUrls(row.image_url),
    details: kind === "reports" ? [
      ["ผู้แจ้ง", text(user, "full_name", "username") || userId],
      ["สี", text(row, "color")], ["สถานะเพิ่มเติมของรายงาน", text(row, "status")],
    ] : kind === "matches" ? [
      ["เวลาที่สะดวกดูแล", text(row, "care_time")],
      ["งบประมาณต่อเดือน (บาท)", text(row, "monthly_budget")],
      ["จำนวนสมาชิกในครอบครัว", text(row, "family_members")],
      ["เหตุผลที่ไม่อนุมัติ", text(row, "rejection_reason")],
      ["ผู้พิจารณา", text(reviewer, "full_name", "username") || reviewerId],
      ["วันที่พิจารณา", text(row, "reviewed_at") ? new Date(text(row, "reviewed_at")).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }) : ""],
    ] : [],
  };
}

export function trend(items: HistoryItem[], start: string, end: string, unit: "day" | "month") {
  const buckets = new Map<string, { key: string; reports: number; matches: number; care: number }>();
  for (let day = start; day <= end;) {
    const key = unit === "day" ? day : day.slice(0, 7);
    buckets.set(key, { key, reports: 0, matches: 0, care: 0 });
    if (unit === "day") day = shiftDay(day, 1);
    else {
      const next = new Date(`${day.slice(0, 7)}-01T00:00:00Z`);
      next.setUTCMonth(next.getUTCMonth() + 1);
      day = next.toISOString().slice(0, 10);
    }
  }
  for (const item of items) {
    const day = dayKey(item.date);
    if (day < start || day > end) continue;
    const bucket = buckets.get(unit === "day" ? day : day.slice(0, 7));
    if (bucket) bucket[item.kind]++;
  }
  return [...buckets.values()];
}
