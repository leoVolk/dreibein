export const ALLERGY_OPTIONS = [
  "Cashews",
  "Ei",
  "Erdnüsse",
  "Fructoseintolleranz",
  "Histaminintoleranz",
  "Lactoseintoleranz",
  "Mandeln & Walnüsse",
];

export const VACCINATION_OPTIONS = [
  "Diphterie",
  "Tetanus",
  "Keuchhusten",
  "Polio",
  "FSME",
  "Hepatitis A",
  "Hepatitis B",
  "Meningokokken",
];

export const parseListString = (value?: string): string[] =>
  (value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

export const joinListString = (value: string[]): string => value.join(", ");
