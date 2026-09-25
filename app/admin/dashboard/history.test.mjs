import { test } from "node:test";
import assert from "node:assert/strict";
import { dayKey, period, shiftDay, validPeriod, normalize, imageUrls, trend } from "./history.ts";

test("report approval is separate from status and the animal's shelter", () => {
  const lookups = {
    matches: new Map(), users: new Map(), shelters: new Map(),
    animals: new Map([["a1", { shelter_id: "s1", species: "แมว" }]]),
  };
  const item = normalize("reports", {
    report_id: "r1", animal_id: "a1", shelter_id: null, species: "สุนัข",
    approval_status: "รอตรวจสอบ", status: "พบสัตว์", color: "ขาว",
  }, lookups);
  assert.equal(item.status, "รอตรวจสอบ");
  assert.equal(item.shelterId, "");
  assert.equal(item.species, "สุนัข");
  assert.equal(new Map(item.details).get("สถานะเพิ่มเติมของรายงาน"), "พบสัตว์");
  assert.equal(normalize("reports", { approval_status: null, status: "พบสัตว์" }, lookups).status, "");
});

test("match details preserve zero values and resolve the reviewing user", () => {
  const item = normalize("matches", {
    match_id: "m1", match_status: "รออนุมัติ", monthly_budget: 0,
    family_members: 0, adoption_reason: "ต้องการดูแล", reviewed_by: "reviewer1",
  }, {
    matches: new Map(), animals: new Map(), shelters: new Map(),
    users: new Map([["reviewer1", { full_name: "เจ้าหน้าที่ทดสอบ" }]]),
  });
  const details = new Map(item.details);
  assert.equal(item.description, "ต้องการดูแล");
  assert.equal(details.get("งบประมาณต่อเดือน (บาท)"), "0");
  assert.equal(details.get("จำนวนสมาชิกในครอบครัว"), "0");
  assert.equal(details.get("ผู้พิจารณา"), "เจ้าหน้าที่ทดสอบ");
});

test("Bangkok presets include today and cross calendar boundaries correctly", () => {
  const now = new Date("2025-12-31T17:30:00Z");
  assert.deepEqual(period("today", now), { start: "2026-01-01", end: "2026-01-01" });
  assert.deepEqual(period("week", now), { start: "2025-12-26", end: "2026-01-01" });
  assert.deepEqual(period("month", now), { start: "2026-01-01", end: "2026-01-01" });
  assert.deepEqual(period("year", new Date("2026-09-24T05:00:00Z")), { start: "2026-01-01", end: "2026-09-24" });
  assert.equal(shiftDay("2024-02-28", 1), "2024-02-29");
});

test("date validation rejects missing, reversed and impossible dates", () => {
  assert.equal(validPeriod("", "2026-09-24"), false);
  assert.equal(validPeriod("2026-09-25", "2026-09-24"), false);
  assert.equal(validPeriod("2026-02-30", "2026-03-01"), false);
  assert.equal(validPeriod("2026-09-24", "2026-09-24"), true);
});

test("date-only fields and UTC timestamps use the same Bangkok day", () => {
  assert.equal(dayKey("2026-09-24"), "2026-09-24");
  assert.equal(dayKey("2026-09-23T17:00:00Z"), "2026-09-24");
  assert.equal(dayKey("2026-09-24T16:59:59Z"), "2026-09-24");
  assert.equal(dayKey("invalid"), "");
});

test("care logs resolve the caregiver and shelter through an older match", () => {
  const item = normalize("care", { log_id: "l1", match_id: "m1", log_date: "2026-09-24", activity_type: "ให้อาหาร" }, {
    matches: new Map([["m1", { animal_id: "a1", user_id: "u1", start_date: "2025-01-01" }]]),
    animals: new Map([["a1", { name: "มะลิ", shelter_id: "s1" }]]),
    users: new Map([["u1", { full_name: "ผู้ดูแลทดสอบ" }]]),
    shelters: new Map([["s1", { shelter_name: "ศูนย์ทดสอบ" }]]),
  });
  assert.equal(item.shelterId, "s1");
  assert.equal(item.shelter, "ศูนย์ทดสอบ");
  assert.equal(item.caregiver, "ผู้ดูแลทดสอบ");
  assert.equal(item.animal, "มะลิ");
  assert.equal(item.status, "");
});

test("daily and monthly trends include zero buckets and respect inclusive dates", () => {
  const items = [
    { kind: "reports", date: "2026-08-31T17:00:00Z" },
    { kind: "reports", date: "2026-09-02T17:00:00Z" },
    { kind: "matches", date: "2026-09-02" },
    { kind: "care", date: "2026-09-02T16:59:59Z" },
    { kind: "care", date: "2026-10-01" },
  ];
  assert.deepEqual(trend(items, "2026-09-01", "2026-09-02", "day"), [
    { key: "2026-09-01", reports: 1, matches: 0, care: 0 },
    { key: "2026-09-02", reports: 0, matches: 1, care: 1 },
  ]);
  assert.deepEqual(trend(items, "2026-08-15", "2026-10-01", "month"), [
    { key: "2026-08", reports: 0, matches: 0, care: 0 },
    { key: "2026-09", reports: 2, matches: 1, care: 1 },
    { key: "2026-10", reports: 0, matches: 0, care: 1 },
  ]);
});

test("photo fields accept URL arrays and reject executable or invalid URLs", () => {
  assert.deepEqual(imageUrls('["https://example.com/care.jpg"]'), ["https://example.com/care.jpg"]);
  assert.deepEqual(imageUrls(["javascript:alert(1)", null, "invalid", "https://example.com/a.jpg"]), ["https://example.com/a.jpg"]);
  assert.deepEqual(imageUrls(null), []);
});
