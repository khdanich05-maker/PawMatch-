import { supabase } from "@/lib/supabase";
import { categories, historyColumns, normalize, shiftDay, text, type Row } from "./history";

async function readRows(table: string, columns: string, id: string, signal: AbortSignal,
  options?: { date?: string; start?: string; end?: string; ids?: string[] }) {
  const rows: Row[] = [];
  for (;;) {
    let query = supabase.from(table).select(columns).order(id).range(rows.length, rows.length + 499);
    if (options?.date && options.start && options.end) {
      query = query.gte(options.date, `${options.start}T00:00:00+07:00`)
        .lt(options.date, `${shiftDay(options.end, 1)}T00:00:00+07:00`);
    }
    if (options?.ids) query = query.in(id, options.ids);
    const result = await query.abortSignal(signal).returns<Row[]>();
    if (result.error) throw new Error(`${table}: ${result.error.message}`);
    if (!result.data?.length) break;
    rows.push(...result.data);
  }
  return rows;
}

async function referencedRows(table: string, columns: string, id: string, values: string[], signal: AbortSignal) {
  const ids = [...new Set(values.filter(Boolean))];
  const rows: Row[] = [];
  for (let offset = 0; offset < ids.length; offset += 100) {
    rows.push(...await readRows(table, columns, id, signal, { ids: ids.slice(offset, offset + 100) }));
  }
  return rows;
}

const index = (rows: Row[], id: string) => new Map(rows.map((row) => [text(row, id), row]));

export async function loadHistory(start: string, end: string, signal: AbortSignal) {
  const [reports, matches, care, shelters] = await Promise.all([
    ...categories.map((category) => readRows(category.table, historyColumns[category.key], category.id, signal, { date: category.date, start, end })),
    readRows("shelters", "shelter_id,shelter_name", "shelter_id", signal),
  ]);
  // A log can belong to a match that started before the selected period.
  const matchesById = index(matches, "match_id");
  const extraMatches = await referencedRows("matches", "match_id,animal_id,user_id", "match_id",
    care.map((row) => text(row, "match_id")).filter((id) => !matchesById.has(id)), signal);
  const allMatches = [...matches, ...extraMatches];
  const references = [...reports, ...allMatches, ...care];
  const [animals, users] = await Promise.all([
    referencedRows("animals", "animal_id,name,species,shelter_id", "animal_id", references.map((row) => text(row, "animal_id")), signal),
    referencedRows("users", "user_id,full_name,username", "user_id", references.flatMap((row) => [text(row, "user_id"), text(row, "reviewed_by")]), signal),
  ]);
  const lookups = { matches: index(allMatches, "match_id"), animals: index(animals, "animal_id"), users: index(users, "user_id"), shelters: index(shelters, "shelter_id") };
  const items = [reports, matches, care].flatMap((rows, i) => rows.map((row) => normalize(categories[i].key, row, lookups)));
  items.sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || b.id.localeCompare(a.id));
  return { items, shelters: shelters.map((row) => ({ id: text(row, "shelter_id"), name: text(row, "shelter_name") })).sort((a, b) => a.name.localeCompare(b.name, "th")) };
}
