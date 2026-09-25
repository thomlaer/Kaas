"use client";

import type { CheckIn } from "./cheese";

// The chosen name is a per-device convenience; check-ins live in Vercel Blob.
const USER_KEY = "formatica:user";

export function getUser(): string {
  try {
    return localStorage.getItem(USER_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setUser(value: string) {
  try {
    localStorage.setItem(USER_KEY, value);
  } catch {
    // Private mode: the user will simply be asked again.
  }
}

export async function fetchCheckIns(): Promise<CheckIn[]> {
  const res = await fetch("/api/checkins", { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Kon check-ins niet laden");
  return data.checkIns;
}

export async function postCheckIn(input: Omit<CheckIn, "id" | "createdAt">): Promise<CheckIn> {
  const res = await fetch("/api/checkins", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Opslaan mislukt");
  return data.checkIn;
}

export async function removeCheckIn(checkIn: CheckIn, user: string) {
  const res = await fetch("/api/checkins", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: checkIn.id, user }),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? "Verwijderen mislukt");
}

// Downscale a photo so it's cheap to send to Claude and small to store.
export function resizeImage(file: File, maxSize = 1024, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Kon de foto niet lezen"));
    };
    img.src = url;
  });
}
