import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { NextResponse } from "next/server";
import { CheeseInfoSchema } from "@/lib/cheese";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new Anthropic();
const MODEL = "claude-opus-5";

const SYSTEM = `Je bent een ervaren kaasmeester en helpt gebruikers van Formatica, een kaas-app (zoals Untappd, maar voor kaas).
De gebruiker stuurt een foto van een kaas, een etiket of verpakking, en/of een naam.
Herken de kaas zo specifiek mogelijk (merk, soort, rijping). Lees etiketten nauwkeurig.
Als je alleen de soort kunt bepalen, geef dan de soort als naam en zet confidence op "laag".
Schrijf alle tekst in het Nederlands.`;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type ImageType = (typeof ALLOWED_TYPES)[number];

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is niet ingesteld in Vercel" },
      { status: 500 },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    image?: string; // data URL
    name?: string;
  } | null;

  const name = body?.name?.trim().slice(0, 200) ?? "";
  const content: Anthropic.Beta.BetaContentBlockParam[] = [];

  if (body?.image) {
    const match = /^data:(image\/[a-z]+);base64,(.+)$/.exec(body.image);
    if (!match || !ALLOWED_TYPES.includes(match[1] as ImageType)) {
      return NextResponse.json({ error: "Ongeldige afbeelding" }, { status: 400 });
    }
    if (match[2].length > 5_000_000) {
      return NextResponse.json({ error: "Afbeelding is te groot" }, { status: 413 });
    }
    content.push({
      type: "image",
      source: { type: "base64", media_type: match[1] as ImageType, data: match[2] },
    });
  }

  if (content.length === 0 && !name) {
    return NextResponse.json({ error: "Stuur een foto of een naam" }, { status: 400 });
  }

  content.push({
    type: "text",
    text: name
      ? `Welke kaas is dit? De gebruiker noemt hem: "${name}".`
      : "Welke kaas is dit?",
  });

  try {
    const cheese = await identify(content).catch((error) => {
      // Some accounts don't have the beta features enabled yet: retry with a
      // plain request before giving up.
      if (error instanceof Anthropic.APIError && [400, 403, 404].includes(error.status ?? 0)) {
        console.warn("Beta request failed, retrying plain", error.status, apiMessage(error));
        return identifyPlain(content);
      }
      throw error;
    });

    if (!cheese) {
      return NextResponse.json(
        { error: "Claude kon deze kaas niet herkennen. Probeer een andere foto." },
        { status: 422 },
      );
    }
    return NextResponse.json({ cheese });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY ontbreekt of is ongeldig" },
        { status: 500 },
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Even te druk, probeer het zo opnieuw" }, { status: 429 });
    }
    if (error instanceof Anthropic.APIError) {
      console.error("Claude API error", error.status, apiMessage(error));
      return NextResponse.json(
        { error: `Fout bij Claude API (${error.status}): ${apiMessage(error)}` },
        { status: 502 },
      );
    }
    throw error;
  }
}

async function identify(content: Anthropic.Beta.BetaContentBlockParam[]) {
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium", format: betaZodOutputFormat(CheeseInfoSchema) },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM,
    messages: [{ role: "user", content }],
  });
  return response.stop_reason === "refusal" ? null : response.parsed_output;
}

async function identifyPlain(content: Anthropic.Beta.BetaContentBlockParam[]) {
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    output_config: { format: zodOutputFormat(CheeseInfoSchema) },
    system: SYSTEM,
    messages: [{ role: "user", content: content as Anthropic.ContentBlockParam[] }],
  });
  return response.stop_reason === "refusal" ? null : response.parsed_output;
}

function apiMessage(error: InstanceType<typeof Anthropic.APIError>): string {
  const body = error.error as { error?: { message?: string } } | undefined;
  return body?.error?.message ?? error.message;
}
