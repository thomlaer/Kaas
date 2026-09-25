"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckInFlow } from "@/components/CheckInFlow";
import { Stars } from "@/components/Stars";
import { BADGES } from "@/lib/badges";
import type { CheckIn } from "@/lib/cheese";
import { exportCheckIns, loadCheckIns, saveCheckIns } from "@/lib/store";

type Tab = "feed" | "checkin" | "profile";

export default function Home() {
  const [tab, setTab] = useState<Tab>("feed");
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState<CheckIn>();

  useEffect(() => {
    loadCheckIns().then((c) => {
      setCheckIns(c);
      setLoaded(true);
    });
  }, []);

  function update(next: CheckIn[]) {
    setCheckIns(next);
    saveCheckIns(next);
  }

  function addCheckIn(checkIn: CheckIn) {
    const before = BADGES.filter((b) => b.earned(checkIns)).map((b) => b.id);
    const next = [checkIn, ...checkIns];
    update(next);
    const unlocked = BADGES.filter((b) => b.earned(next) && !before.includes(b.id));
    if (unlocked.length) {
      alert(`Nieuwe badge! ${unlocked.map((b) => `${b.icon} ${b.name}`).join(", ")}`);
    }
    setTab("feed");
  }

  function remove(id: string) {
    if (!confirm("Deze check-in verwijderen?")) return;
    update(checkIns.filter((c) => c.id !== id));
    setOpen(undefined);
  }

  return (
    <main className="app">
      <header className="header">
        <h1>{tab === "checkin" ? "Inchecken" : tab === "profile" ? "Mijn kazen" : "Kaasbord"}</h1>
        {tab === "feed" && <span className="muted small">{checkIns.length} check-ins</span>}
      </header>

      {open ? (
        <Detail checkIn={open} onBack={() => setOpen(undefined)} onDelete={() => remove(open.id)} />
      ) : tab === "checkin" ? (
        <CheckInFlow onDone={addCheckIn} />
      ) : tab === "profile" ? (
        <Profile checkIns={checkIns} />
      ) : (
        loaded && <Feed checkIns={checkIns} onOpen={setOpen} onStart={() => setTab("checkin")} />
      )}

      <nav className="tabbar">
        <button className={tab === "feed" ? "active" : ""} onClick={() => { setOpen(undefined); setTab("feed"); }}>
          <span>🏠</span>Feed
        </button>
        <button className={`checkin-tab ${tab === "checkin" ? "active" : ""}`} onClick={() => { setOpen(undefined); setTab("checkin"); }}>
          <span>＋</span>Check-in
        </button>
        <button className={tab === "profile" ? "active" : ""} onClick={() => { setOpen(undefined); setTab("profile"); }}>
          <span>🏅</span>Profiel
        </button>
      </nav>
    </main>
  );
}

function Feed({ checkIns, onOpen, onStart }: { checkIns: CheckIn[]; onOpen: (c: CheckIn) => void; onStart: () => void }) {
  if (checkIns.length === 0) {
    return (
      <div className="empty">
        <div className="big">🧀</div>
        <p>Nog geen kazen ingecheckt.</p>
        <button className="btn" onClick={onStart}>
          Check je eerste kaas in
        </button>
      </div>
    );
  }
  return (
    <div>
      {checkIns.map((c) => (
        <button key={c.id} className="card checkin" style={{ width: "100%", textAlign: "left" }} onClick={() => onOpen(c)}>
          {c.photo ? <img src={c.photo} alt="" /> : <div className="thumb">🧀</div>}
          <div>
            <h3>{c.cheese.name}</h3>
            <div className="small muted">
              {c.cheese.style} · {c.cheese.country}
            </div>
            <Stars rating={c.rating} />
            <div className="small muted">
              {new Date(c.createdAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
              {c.location && ` · ${c.location}`}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function Detail({ checkIn: c, onBack, onDelete }: { checkIn: CheckIn; onBack: () => void; onDelete: () => void }) {
  return (
    <div className="stack">
      <button className="btn secondary" onClick={onBack}>
        ← Terug
      </button>
      {c.photo && <img className="photo-preview" src={c.photo} alt="" />}
      <div className="card">
        <h2 style={{ margin: "0 0 4px" }}>{c.cheese.name}</h2>
        {c.cheese.producer && <div className="muted">{c.cheese.producer}</div>}
        <Stars rating={c.rating} />
        {c.notes && <p>“{c.notes}”</p>}
        <p className="small muted">
          {new Date(c.createdAt).toLocaleString("nl-NL")}
          {c.location && ` · ${c.location}`}
        </p>
      </div>
      <div className="card">
        <p className="small muted" style={{ marginTop: 0 }}>
          {[c.cheese.style, c.cheese.milk, c.cheese.age, c.cheese.country, c.cheese.region].filter(Boolean).join(" · ")}
        </p>
        <p>{c.cheese.description}</p>
        {c.cheese.texture && <p className="small">Textuur: {c.cheese.texture}</p>}
        <div className="tags">
          {c.cheese.flavorNotes.map((n) => (
            <span className="tag" key={n}>
              {n}
            </span>
          ))}
        </div>
        {c.cheese.pairings.length > 0 && <p className="small muted">Lekker met: {c.cheese.pairings.join(", ")}</p>}
      </div>
      <button className="btn link" onClick={onDelete}>
        Verwijderen
      </button>
    </div>
  );
}

function Profile({ checkIns }: { checkIns: CheckIn[] }) {
  const stats = useMemo(() => {
    const unique = new Set(checkIns.map((c) => c.cheese.name.toLowerCase().trim())).size;
    const avg = checkIns.length ? checkIns.reduce((s, c) => s + c.rating, 0) / checkIns.length : 0;
    const top = [...checkIns].sort((a, b) => b.rating - a.rating).slice(0, 5);
    return { unique, avg, top };
  }, [checkIns]);

  return (
    <div>
      <div className="stats">
        <div className="card stat">
          <strong>{checkIns.length}</strong>
          <span className="small muted">check-ins</span>
        </div>
        <div className="card stat">
          <strong>{stats.unique}</strong>
          <span className="small muted">unieke kazen</span>
        </div>
        <div className="card stat">
          <strong>{stats.avg.toFixed(1)}</strong>
          <span className="small muted">gem. ★</span>
        </div>
      </div>

      <h2>Badges</h2>
      <div className="badges">
        {BADGES.map((b) => (
          <div key={b.id} className={`card badge ${b.earned(checkIns) ? "" : "locked"}`}>
            <div className="icon">{b.icon}</div>
            <div className="small">
              <strong>{b.name}</strong>
            </div>
            <div className="small muted">{b.description}</div>
          </div>
        ))}
      </div>

      {stats.top.length > 0 && (
        <>
          <h2>Top kazen</h2>
          {stats.top.map((c) => (
            <div key={c.id} className="card" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{c.cheese.name}</span>
              <Stars rating={c.rating} />
            </div>
          ))}
        </>
      )}

      {checkIns.length > 0 && (
        <button className="btn secondary" style={{ marginTop: 16 }} onClick={() => exportCheckIns(checkIns)}>
          Exporteer als backup (JSON)
        </button>
      )}
    </div>
  );
}
