import { z } from "zod";

// What Claude returns when it identifies a cheese. Shared by the API route
// (as the structured-output schema) and the client (as the stored shape).
export const CheeseInfoSchema = z.object({
  recognized: z
    .boolean()
    .describe("false als er geen kaas op de foto staat of je het echt niet weet"),
  name: z.string().describe("Naam van de kaas, bijv. 'Old Amsterdam' of 'Comté AOP'"),
  producer: z.string().describe("Maker/merk, of lege string als onbekend"),
  style: z.string().describe("Soort, bijv. 'Goudse kaas', 'Blauwe kaas', 'Brie'"),
  milk: z.enum(["koe", "geit", "schaap", "buffel", "gemengd", "onbekend"]),
  country: z.string(),
  region: z.string().describe("Regio, of lege string als onbekend"),
  age: z.string().describe("Rijping, bijv. 'jong (4 weken)' of '18 maanden', of lege string"),
  texture: z.string().describe("Korte beschrijving van de textuur"),
  flavorNotes: z.array(z.string()).describe("3 tot 6 korte smaaknoten"),
  description: z.string().describe("2-3 zinnen over deze kaas, in het Nederlands"),
  pairings: z.array(z.string()).describe("2 tot 4 combinaties (wijn, bier, brood, fruit)"),
  confidence: z.enum(["hoog", "middel", "laag"]),
});

export type CheeseInfo = z.infer<typeof CheeseInfoSchema>;

export type CheckIn = {
  id: string;
  createdAt: string; // ISO
  cheese: CheeseInfo;
  rating: number; // 0.5 - 5, steps of 0.5
  notes: string;
  location: string;
  photo?: string; // small JPEG data URL
};
