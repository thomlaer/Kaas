"use client";

import { useRef, useState } from "react";
import type { CheckIn, CheeseInfo } from "@/lib/cheese";
import { getPassword, resizeImage, setPassword } from "@/lib/store";
import { RatingInput } from "./Stars";

const MILK: Record<CheeseInfo["milk"], string> = {
  koe: "koemelk",
  geit: "geitenmelk",
  schaap: "schapenmelk",
  buffel: "buffelmelk",
  gemengd: "gemengde melk",
  onbekend: "",
};

type Step = "capture" | "identifying" | "review";

export function CheckInFlow({ onDone }: { onDone: (checkIn: CheckIn) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("capture");
  const [photo, setPhoto] = useState<string>();
  const [name, setName] = useState("");
  const [cheese, setCheese] = useState<CheeseInfo>();
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhoto(await resizeImage(file));
      setError("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function identify() {
    setStep("identifying");
    setError("");
    try {
      let res = await callIdentify(photo, name, getPassword());
      if (res.status === 401) {
        const pw = prompt("Wachtwoord voor Kaasbord:") ?? "";
        setPassword(pw);
        res = await callIdentify(photo, name, pw);
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Er ging iets mis");
      setCheese(data.cheese);
      setStep("review");
    } catch (err) {
      setError((err as Error).message);
      setStep("capture");
    }
  }

  function save() {
    if (!cheese) return;
    onDone({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      cheese,
      rating,
      notes: notes.trim(),
      location: location.trim(),
      photo,
    });
  }

  if (step === "identifying") {
    return (
      <div className="card">
        <div className="spinner">🧀</div>
        <p className="muted" style={{ textAlign: "center" }}>
          Claude proeft mee…
        </p>
      </div>
    );
  }

  if (step === "review" && cheese) {
    return (
      <div className="stack">
        {photo && <img className="photo-preview" src={photo} alt="" />}
        <div className="card">
          <label className="small muted">Naam</label>
          <input
            className="field"
            value={cheese.name}
            onChange={(e) => setCheese({ ...cheese, name: e.target.value })}
          />
          <p className="small muted" style={{ marginBottom: 0 }}>
            {[cheese.style, MILK[cheese.milk], cheese.country, cheese.region]
              .filter(Boolean)
              .join(" · ")}
            {cheese.confidence !== "hoog" && ` · zekerheid: ${cheese.confidence}`}
          </p>
          <p>{cheese.description}</p>
          <div className="tags">
            {cheese.flavorNotes.map((n) => (
              <span className="tag" key={n}>
                {n}
              </span>
            ))}
          </div>
          {cheese.pairings.length > 0 && (
            <p className="small muted">Lekker met: {cheese.pairings.join(", ")}</p>
          )}
        </div>
        <div className="card stack">
          <RatingInput value={rating} onChange={setRating} />
          <p className="small muted" style={{ textAlign: "center", margin: 0 }}>
            {rating ? `${rating} / 5` : "Tik op de sterren (nog eens tikken = halve ster)"}
          </p>
          <textarea
            className="field"
            placeholder="Wat vond je ervan?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <input
            className="field"
            placeholder="Waar? (bijv. kaasboer, restaurant)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <button className="btn" disabled={!rating || !cheese.name.trim()} onClick={save}>
          Inchecken
        </button>
        <button className="btn secondary" onClick={() => setStep("capture")}>
          Terug
        </button>
      </div>
    );
  }

  return (
    <div className="stack">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={onFile}
      />
      {photo ? (
        <img
          className="photo-preview"
          src={photo}
          alt="Je foto"
          onClick={() => fileRef.current?.click()}
        />
      ) : (
        <button className="card empty" style={{ width: "100%" }} onClick={() => fileRef.current?.click()}>
          <div className="big">📷</div>
          <div>Maak een foto van de kaas of het etiket</div>
        </button>
      )}
      <input
        className="field"
        placeholder="…of typ de naam (optioneel)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={!photo && !name.trim()} onClick={identify}>
        Herken met Claude
      </button>
    </div>
  );
}

function callIdentify(image: string | undefined, name: string, password: string) {
  return fetch("/api/identify", {
    method: "POST",
    headers: { "content-type": "application/json", "x-app-password": password },
    body: JSON.stringify({ image, name }),
  });
}
