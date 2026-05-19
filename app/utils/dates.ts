/**
 * Date helpers for events.
 *
 * PocketBase stores datetimes as `"YYYY-MM-DD HH:MM:SS.sssZ"`. We treat the
 * value as the *naive* user-entered local time: we strip the `Z` before
 * parsing so JS doesn't shift the displayed clock by the local timezone
 * offset. This matches what users see in the editor (`datetime-local` inputs
 * are also naive).
 */

const stripTz = (value: string) =>
  value.replace(" ", "T").replace(/Z$/, "").replace(/\.\d+$/, "");

/**
 * Returns a `YYYY-MM-DDTHH:mm` string suitable for `<input type="datetime-local">`.
 * Any shorter / partial PB value gets padded so the input always renders.
 */
export const toLocalDateTime = (value?: string | null): string => {
  if (!value) return "";
  const normalized = stripTz(value);
  if (normalized.length >= 16) return normalized.slice(0, 16);
  const datePart = normalized.slice(0, 10);
  if (datePart.length !== 10) return "";
  return `${datePart}T00:00`;
};

/**
 * Format a `datetime-local` value for PocketBase. Pads seconds because PB's
 * date validator rejects `"YYYY-MM-DDTHH:mm"` without them. Returns `null`
 * for empty input.
 */
export const toPbDateTime = (value?: string | null): string | null => {
  if (!value) return null;
  if (value.length === 16) return `${value}:00`;
  return value;
};

/**
 * Parse a PB date/datetime into a `Date` interpreted in local time.
 * Returns `null` for empty/invalid values.
 */
export const parseEventDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const d = new Date(stripTz(value));
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * Display a PB date/datetime in German format. Shows time only when present
 * (i.e. anything other than 00:00); otherwise just the date.
 */
export const formatEventDate = (value?: string | null): string => {
  const d = parseEventDate(value);
  if (!d) return "";
  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
  return hasTime
    ? d.toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })
    : d.toLocaleDateString("de-DE");
};

/**
 * Convert a JS Date (e.g. one FullCalendar handed back from a drag) into the
 * naive `YYYY-MM-DDTHH:mm:ss` string we store in PocketBase.
 */
export const toNaiveIso = (d: Date | null): string => {
  if (!d) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 19);
};

/**
 * Extract `HH:mm` from a PB date/datetime, or "" if missing/invalid.
 */
export const extractTime = (value?: string | null): string => {
  const d = parseEventDate(value);
  if (!d) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

/**
 * Format a recurring event's `daysOfWeek` array (0=Sun..6=Sat) into a short
 * German label, sorted Monday-first. Returns "" when not recurring.
 */
const DAY_ABBR: Record<number, string> = {
  0: "So",
  1: "Mo",
  2: "Di",
  3: "Mi",
  4: "Do",
  5: "Fr",
  6: "Sa",
};
const DAY_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const formatRecurringDays = (indices?: number[] | null): string => {
  if (!Array.isArray(indices) || indices.length === 0) return "";
  const set = new Set(indices);
  return DAY_DISPLAY_ORDER.filter((i) => set.has(i))
    .map((i) => DAY_ABBR[i])
    .join(", ");
};
