import type { CheckIn } from "./cheese";

export type Badge = {
  id: string;
  icon: string;
  name: string;
  description: string;
  earned: (checkIns: CheckIn[]) => boolean;
};

const uniqueCheeses = (c: CheckIn[]) =>
  new Set(c.map((x) => x.cheese.name.toLowerCase().trim())).size;
const countries = (c: CheckIn[]) =>
  new Set(c.map((x) => x.cheese.country.toLowerCase().trim()).filter(Boolean)).size;
const hasMilk = (c: CheckIn[], milk: string) => c.some((x) => x.cheese.milk === milk);
const styleMatches = (c: CheckIn[], re: RegExp) =>
  c.filter((x) => re.test(`${x.cheese.style} ${x.cheese.name}`)).length;

export const BADGES: Badge[] = [
  { id: "first", icon: "🧀", name: "Eerste hap", description: "Je eerste check-in", earned: (c) => c.length >= 1 },
  { id: "ten", icon: "🔟", name: "Kaasliefhebber", description: "10 verschillende kazen", earned: (c) => uniqueCheeses(c) >= 10 },
  { id: "fifty", icon: "🏆", name: "Kaasmeester", description: "50 verschillende kazen", earned: (c) => uniqueCheeses(c) >= 50 },
  { id: "goat", icon: "🐐", name: "Bokkesprong", description: "Een geitenkaas", earned: (c) => hasMilk(c, "geit") },
  { id: "sheep", icon: "🐑", name: "Schaapskudde", description: "Een schapenkaas", earned: (c) => hasMilk(c, "schaap") },
  { id: "buffalo", icon: "🐃", name: "Buffelkracht", description: "Een buffelkaas", earned: (c) => hasMilk(c, "buffel") },
  { id: "blue", icon: "💙", name: "Blauw bloed", description: "3 blauwe kazen", earned: (c) => styleMatches(c, /blauw|blue|bleu|roquefort|gorgonzola|stilton/i) >= 3 },
  { id: "soft", icon: "☁️", name: "Zachte heelmeester", description: "3 zachte/witschimmelkazen", earned: (c) => styleMatches(c, /brie|camembert|witschimmel|zacht|soft/i) >= 3 },
  { id: "dutch", icon: "🇳🇱", name: "Hollandse glorie", description: "5 Nederlandse kazen", earned: (c) => c.filter((x) => /nederland|netherlands|holland/i.test(x.cheese.country)).length >= 5 },
  { id: "world", icon: "🌍", name: "Wereldreiziger", description: "Kazen uit 5 landen", earned: (c) => countries(c) >= 5 },
  { id: "critic", icon: "✍️", name: "Kaascriticus", description: "10 check-ins met notities", earned: (c) => c.filter((x) => x.notes.trim().length > 0).length >= 10 },
  { id: "perfect", icon: "⭐", name: "Perfecte kaas", description: "Een kaas 5 sterren gegeven", earned: (c) => c.some((x) => x.rating === 5) },
];
