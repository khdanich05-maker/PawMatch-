// lib/dateHelper.ts

/**
 * แปลงวันที่เป็นรูปแบบภาษาไทยพร้อมระบุ (พ.ศ.)
 * ตัวอย่าง: 25 ก.ย. 2569 (พ.ศ.) หรือ 25 กันยายน 2569 (พ.ศ.)
 */
export function formatThaiDateBE(dateString?: string | null, fullMonth = false): string {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const day = d.getDate();
    const shortMonths = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];
    const fullMonths = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];

    const month = fullMonth ? fullMonths[d.getMonth()] : shortMonths[d.getMonth()];
    const thaiYear = d.getFullYear() + 543;

    return `${day} ${month} ${thaiYear} (พ.ศ.)`;
  } catch {
    return dateString || "-";
  }
}

/**
 * ดึงเฉพาะปี พ.ศ. จาก Date string
 */
export function getThaiYear(dateString?: string | null): number {
  if (!dateString) return new Date().getFullYear() + 543;
  const d = new Date(dateString);
  return (isNaN(d.getTime()) ? new Date().getFullYear() : d.getFullYear()) + 543;
}
