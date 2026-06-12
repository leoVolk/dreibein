type Rgb = [number, number, number];

interface RankColor {
  tailwind: string;
  rgb: Rgb;
  fontRgb: Rgb;
}

const WHITE: Rgb = [255, 255, 255];
const DARK: Rgb = [30, 30, 30];

export const RANK_COLORS: Record<string, RankColor> = {
  Biber: { tailwind: "bg-amber-100", rgb: [254, 243, 199], fontRgb: DARK },
  Wölfling: { tailwind: "bg-orange-500", rgb: [249, 115, 22], fontRgb: WHITE },
  Jungpfadfinder: { tailwind: "bg-blue-600", rgb: [37, 99, 235], fontRgb: WHITE },
  Pfadfinder: { tailwind: "bg-green-500", rgb: [34, 197, 94], fontRgb: WHITE },
  Rover: { tailwind: "bg-red-500", rgb: [239, 68, 68], fontRgb: WHITE },
  Vorstand: { tailwind: "bg-yellow-500", rgb: [234, 179, 8], fontRgb: DARK },
  Rechtsträger: { tailwind: "bg-fuchsia-500", rgb: [217, 70, 239], fontRgb: WHITE },
  Sonstige: { tailwind: "bg-gray-500", rgb: [107, 114, 128], fontRgb: WHITE },
};

const FALLBACK_COLORS: RankColor[] = [
  { tailwind: "bg-cyan-500", rgb: [6, 182, 212], fontRgb: WHITE },
  { tailwind: "bg-pink-500", rgb: [236, 72, 153], fontRgb: WHITE },
  { tailwind: "bg-lime-500", rgb: [132, 204, 22], fontRgb: DARK },
  { tailwind: "bg-indigo-500", rgb: [99, 102, 241], fontRgb: WHITE },
];

export const getRankColor = (name: string, index = 0): RankColor =>
  RANK_COLORS[name] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]!;
