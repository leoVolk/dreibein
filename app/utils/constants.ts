export const ITEM_STATUS_OPTIONS = [
  { label: "Intakt", value: "none" },
  { label: "Beschädigt", value: "damaged" },
  { label: "In Reparatur", value: "repair" },
  { label: "In Benutzung", value: "checkedOut" },
  { label: "Leichte Schäden", value: "mildDamage" },
];

// Index-aligned (0 = Sunday … 6 = Saturday), matches FullCalendar / Date.getDay().
export const DAY_NAMES = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];

// Monday-first list for form checkboxes / selects.
export const WEEK_DAYS = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
];

export const DAY_TO_INDEX: Record<string, number> = {
  Sonntag: 0,
  Montag: 1,
  Dienstag: 2,
  Mittwoch: 3,
  Donnerstag: 4,
  Freitag: 5,
  Samstag: 6,
};

export const INDEX_TO_DAY: Record<number, string> = Object.fromEntries(
  Object.entries(DAY_TO_INDEX).map(([k, v]) => [v, k]),
);
