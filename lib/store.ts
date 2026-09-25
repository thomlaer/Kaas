"use client";

import { get, set } from "idb-keyval";
import type { CheckIn } from "./cheese";

// Check-ins live in IndexedDB on the phone itself: no database or account
// needed, and photos don't count against localStorage's small quota.
const KEY = "kaasbord:checkins";

export async function loadCheckIns(): Promise<CheckIn[]> {
  return (await get<CheckIn[]>(KEY)) ?? [];
}

export async function saveCheckIns(checkIns: CheckIn[]): Promise<void> {
  await set(KEY, checkIns);
}

export function getPassword(): string {
  try {
    return localStorage.getItem("kaasbord:password") ?? "";
  } catch {
    return "";
  }
}

export function setPassword(value: string) {
  try {
    localStorage.setItem("kaasbord:password", value);
  } catch {
    // Private mode: the user will simply be asked again.
  }
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

export function exportCheckIns(checkIns: CheckIn[]) {
  const blob = new Blob([JSON.stringify(checkIns, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `kaasbord-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
