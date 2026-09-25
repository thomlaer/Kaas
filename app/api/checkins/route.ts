import { NextResponse } from "next/server";
import { CheeseInfoSchema } from "@/lib/cheese";
import { deleteCheckIn, listCheckIns, saveCheckIn } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function storageReady() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

const notReady = () =>
  NextResponse.json(
    { error: "Opslag is nog niet gekoppeld (BLOB_READ_WRITE_TOKEN ontbreekt)" },
    { status: 500 },
  );

export async function GET() {
  if (!storageReady()) return notReady();
  return NextResponse.json({ checkIns: await listCheckIns() });
}

export async function POST(req: Request) {
  if (!storageReady()) return notReady();
  const body = await req.json().catch(() => null);

  const user = String(body?.user ?? "").trim().slice(0, 40);
  const cheese = CheeseInfoSchema.safeParse(body?.cheese);
  const rating = Number(body?.rating);
  if (!user || !cheese.success || !(rating >= 0.5 && rating <= 5)) {
    return NextResponse.json({ error: "Ongeldige check-in" }, { status: 400 });
  }

  const checkIn = await saveCheckIn(
    {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      user,
      cheese: cheese.data,
      rating: Math.round(rating * 2) / 2,
      notes: String(body?.notes ?? "").trim().slice(0, 1000),
      location: String(body?.location ?? "").trim().slice(0, 120),
    },
    typeof body?.photo === "string" ? body.photo : undefined,
  );
  return NextResponse.json({ checkIn });
}

export async function DELETE(req: Request) {
  if (!storageReady()) return notReady();
  const body = (await req.json().catch(() => null)) as { id?: string; user?: string } | null;
  // No accounts yet: only the name that made a check-in may remove it.
  if (!body?.id || !body.user || !(await deleteCheckIn(body.id, body.user))) {
    return NextResponse.json({ error: "Je kunt alleen je eigen check-ins verwijderen" }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}
