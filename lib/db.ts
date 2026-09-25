import { del, list, put } from "@vercel/blob";
import type { CheckIn } from "./cheese";

// Every check-in is one small JSON file in Vercel Blob, next to its photo.
// The pathname starts with the timestamp so listing sorts oldest → newest.
const PREFIX = "checkins/";

async function listRecordBlobs() {
  const blobs = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: PREFIX, cursor });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs.sort((a, b) => b.pathname.localeCompare(a.pathname));
}

async function readRecord(url: string): Promise<CheckIn | null> {
  const res = await fetch(url, { cache: "no-store" });
  return res.ok ? ((await res.json()) as CheckIn) : null;
}

export async function listCheckIns(limit = 200): Promise<CheckIn[]> {
  const blobs = (await listRecordBlobs()).slice(0, limit);
  const checkIns = await Promise.all(blobs.map((blob) => readRecord(blob.url)));
  return checkIns.filter((c): c is CheckIn => c !== null);
}

export async function saveCheckIn(checkIn: Omit<CheckIn, "photo">, photo?: string) {
  let photoUrl: string | undefined;
  if (photo) {
    const match = /^data:image\/jpeg;base64,(.+)$/.exec(photo);
    if (!match) throw new Error("Foto moet een JPEG zijn");
    const blob = await put(`photos/${checkIn.id}.jpg`, Buffer.from(match[1], "base64"), {
      access: "public",
      contentType: "image/jpeg",
      addRandomSuffix: true,
    });
    photoUrl = blob.url;
  }

  const record: CheckIn = { ...checkIn, photo: photoUrl };
  await put(pathFor(record), JSON.stringify(record), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
  return record;
}

// Returns false when the check-in doesn't exist or belongs to someone else.
export async function deleteCheckIn(id: string, user: string): Promise<boolean> {
  const blob = (await listRecordBlobs()).find((b) => b.pathname.endsWith(`_${id}.json`));
  const record = blob && (await readRecord(blob.url));
  if (!blob || !record || record.user !== user) return false;
  await del([blob.url, ...(record.photo ? [record.photo] : [])]);
  return true;
}

function pathFor(checkIn: CheckIn) {
  return `${PREFIX}${checkIn.createdAt.replace(/[:.]/g, "-")}_${checkIn.id}.json`;
}
