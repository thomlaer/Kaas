"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheeseLogo } from "@/components/CheeseLogo";
import { CheckInFlow } from "@/components/CheckInFlow";
import { Stars } from "@/components/Stars";
import { BADGES } from "@/lib/badges";
import type { CheckIn } from "@/lib/cheese";
import { fetchCheckIns, getUser, postCheckIn, removeCheckIn, setUser } from "@/lib/store";

type Tab = "feed" | "checkin" | "profile";

export default function Home() {
  const [user, setUserState] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("feed");
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<CheckIn>();

  const refresh = useCallback(async () => {
    try {
      setCheckIns(await fetchCheckIns());
      setError("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setUserState(getUser());
    refresh();
  }, [refresh]);

  const mine = useMemo(() => checkIns.filter((c) => c.user === user), [checkIns, user]);

  if (user === null) return null;
  if (!user) {
    return (
      <Login
        onLogin={(name) => {
          setUser(name);
          setUserState(name);
        }}
      />
    );
  }

  async function addCheckIn(input: Omit<CheckIn, "id" | "createdAt" | "user">) {
    const before = BADGES.filter((b) => b.earned(mine)).map((b) => b.id);
    const saved = await postCheckIn({ ...input, user: user! });
    const nextMine = [saved, ...mine];
    setCheckIns((all) => [saved, ...all]);
    const unlocked = BADGES.filter((b) => b.earned(nextMine) && !before.includes(b.id));
    if (unlocked.length) {
      alert(`Nieuwe badge! ${unlocked.map((b) => `${b.icon} ${b.name}`).join(", ")}`);
    }
    setTab("feed");
  }

  async function remove(checkIn: CheckIn) {
    if (!confirm("Deze check-in verwijderen?")) return;
    try {
      await removeCheckIn(checkIn, user!);
      setCheckIns((all) => all.filter((c) => c.id !== checkIn.id));
      setOpen(undefined);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  function go(next: Tab) {
    setOpen(undefined);
    setTab(next);
    if (next === "feed") refresh();
  }

  return (
    <main className="app">
      <header className="header">
        <h1>{tab === "checkin" ? "Inchecken" : tab === "profile" ? user : "Formatica"}</h1>
        {tab === "feed" && <span className="muted small">{checkIns.length} check-ins</span>}
      </header>

      {open ? (
        <Detail
          checkIn={open}
          canDelete={open.user === user}
          onBack={() => setOpen(undefined)}
          onDelete={() => remove(open)}
        />
      ) : tab === "checkin" ? (
        <CheckInFlow onDone={addCheckIn} />
      ) : tab === "profile" ? (
        <Profile
          checkIns={mine}
          onOpen={setOpen}
          onLogout={() => {
            setUser("");
            setUserState("");
          }}
        />
      ) : loading ? (
        <div className="spinner">🧀</div>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <Feed checkIns={checkIns} onOpen={setOpen} onStart={() => go("checkin")} />
      )}

      <nav className="tabbar">
        <button className={tab === "feed" ? "active" : ""} onClick={() => go("feed")}>
          <span>🏠</span>Feed
        </button>
        <button className={`checkin-tab ${tab === "checkin" ? "active" : ""}`} onClick={() => go("checkin")}>
          <span>＋</span>Check-in
        </button>
        <button className={tab === "profile" ? "active" : ""} onClick={() => go("profile")}>
          <span>🏅</span>Profiel
        </button>
      </nav>
    </main>
  );
}

function Login({ onLogin }: { onLogin: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <main className="app">
      <div className="empty stack">
        <CheeseLogo size={96} />
        <h1 style={{ margin: 0 }}>Formatica</h1>
        <p className="muted">Check je kazen in, geef ze sterren en verzamel badges.</p>
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) onLogin(name.trim());
          }}
        >
          <input
            className="field"
            placeholder="Je naam"
            autoComplete="nickname"
            maxLength={40}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn" disabled={!name.trim()}>
            Beginnen
          </button>
        </form>
      </div>
    </main>
  );
}

function CheckInRow({ checkIn: c, onOpen, showUser }: { checkIn: CheckIn; onOpen: (c: CheckIn) => void; showUser: boolean }) {
  return (
    <button className="card checkin" style={{ width: "100%", textAlign: "left" }} onClick={() => onOpen(c)}>
      {c.photo ? <img src={c.photo} alt="" loading="lazy" /> : <div className="thumb">🧀</div>}
      <div>
        {showUser && <div className="small"><strong>{c.user}</strong> <span className="muted">proefde</span></div>}
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
  );
}

function Feed({ checkIns, onOpen, onStart }: { checkIns: CheckIn[]; onOpen: (c: CheckIn) => void; onStart: () => void }) {
  if (checkIns.length === 0) {
    return (
      <div className="empty">
        <div className="big">🧀</div>
        <p>Nog geen kazen ingecheckt.</p>
        <button className="btn" onClick={onStart}>
          Check de eerste kaas in
        </button>
      </div>
    );
  }
  return (
    <div>
      {checkIns.map((c) => (
        <CheckInRow key={c.id} checkIn={c} onOpen={onOpen} showUser />
      ))}
    </div>
  );
}

function Detail({
  checkIn: c,
  canDelete,
  onBack,
  onDelete,
}: {
  checkIn: CheckIn;
  canDelete: boolean;
  onBack: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="stack">
      <button className="btn secondary" onClick={onBack}>
        ← Terug
      </button>
      {c.photo && <img className="photo-preview" src={c.photo} alt="" />}
      <div className="card">
        <div className="small muted">{c.user}</div>
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
      {canDelete && (
        <button className="btn link" onClick={onDelete}>
          Verwijderen
        </button>
      )}
    </div>
  );
}

function Profile({ checkIns, onOpen, onLogout }: { checkIns: CheckIn[]; onOpen: (c: CheckIn) => void; onLogout: () => void }) {
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
            <CheckInRow key={c.id} checkIn={c} onOpen={onOpen} showUser={false} />
          ))}
        </>
      )}

      <button className="btn secondary" style={{ marginTop: 16 }} onClick={onLogout}>
        Andere naam gebruiken
      </button>
    </div>
  );
}
