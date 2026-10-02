import { useEffect, useState } from "react";
import { Topics, KeywordPage } from "./Explore.jsx";
import { bySlug, KEYWORDS } from "./seo.js";
import { reduce, nameNumbers, dateNumbers, compatibility } from "./numerology.js";
import { MEANINGS, CHALLENGES, ANGEL, FAQ } from "./content.js";

const TABS = [
  ["calc", "Calculator"],
  ["topics", "Topics"],
  ["meanings", "Number meanings"],
  ["match", "Compatibility"],
  ["angel", "Angel numbers"],
  ["faq", "FAQ"],
];

function NumberCard({ label, value, hint }) {
  if (value == null) return null;
  const m = MEANINGS[value];
  return (
    <div className="card result">
      <div className="orb">{value}</div>
      <div>
        <h3>{label}</h3>
        <p className="muted small">{hint}</p>
        {m && <><strong>{m[0]}</strong><p className="muted small">{m[1]}</p><p>{m[2]}</p></>}
      </div>
    </div>
  );
}

function Calculator() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [out, setOut] = useState(null);

  const calculate = (e) => {
    e.preventDefault();
    setOut({ n: nameNumbers(name), d: dateNumbers(dob) });
  };

  return (
    <>
      <form className="card form" onSubmit={calculate}>
        <label>Full birth name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jane Marie Doe" />
        </label>
        <label>Date of birth
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} max={new Date().toISOString().slice(0, 10)} />
        </label>
        <button className="btn" disabled={!name.trim() && !dob}>Reveal my numbers</button>
      </form>

      {out && !out.n && !out.d && <p className="muted center">Enter a name or a date to begin.</p>}
      {out?.d && (
        <>
          <NumberCard label="Life Path" value={out.d.lifePath} hint="Your core life theme, from your birth date" />
          <NumberCard label="Birthday Number" value={out.d.birthday} hint="A natural talent from the day you were born" />
          <NumberCard label={`Personal Year ${out.d.thisYear}`} value={out.d.personalYear} hint="The theme of your current year" />
          <div className="card">
            <h3>Challenge Numbers</h3>
            <p className="muted small">Lessons for four stages of life</p>
            <div className="chips">
              {out.d.challenges.map((c, i) => (
                <div key={i} className="chip"><b>{c}</b><span>{["Early", "Middle", "Main", "Later"][i]}</span></div>
              ))}
            </div>
            <p className="small">{CHALLENGES[out.d.challenges[2]]}</p>
          </div>
        </>
      )}
      {out?.n && (
        <>
          <NumberCard label="Expression (Destiny)" value={out.n.expression} hint="Your talents and purpose, from all letters of your name" />
          <NumberCard label="Soul Urge (Heart's Desire)" value={out.n.soulUrge} hint="What you deeply want, from the vowels" />
          <NumberCard label="Personality" value={out.n.personality} hint="How others see you, from the consonants" />
        </>
      )}
    </>
  );
}

function Meanings() {
  const [sel, setSel] = useState(1);
  const m = MEANINGS[sel];
  return (
    <>
      <div className="grid">
        {Object.keys(MEANINGS).map((k) => (
          <button key={k} className={"num " + (Number(k) === sel ? "on" : "")} onClick={() => setSel(Number(k))}>{k}</button>
        ))}
      </div>
      <div className="card result">
        <div className="orb">{sel}</div>
        <div><h3>{m[0]}</h3><p className="muted small">{m[1]}</p><p>{m[2]}</p></div>
      </div>
    </>
  );
}

function Match() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const la = dateNumbers(a)?.lifePath, lb = dateNumbers(b)?.lifePath;
  const res = la && lb ? compatibility(la, lb) : null;
  return (
    <>
      <div className="card form">
        <label>Person 1 birth date<input type="date" value={a} onChange={(e) => setA(e.target.value)} /></label>
        <label>Person 2 birth date<input type="date" value={b} onChange={(e) => setB(e.target.value)} /></label>
      </div>
      {res && (
        <div className="card center">
          <p className="muted">Life Paths {la} and {lb}</p>
          <div className="score">{res.score}%</div>
          <p>{res.text}</p>
          <p className="muted small">For fun only. Real relationships depend on far more than numbers.</p>
        </div>
      )}
    </>
  );
}

function Angel() {
  const [q, setQ] = useState("");
  const digits = q.replace(/\D/g, "");
  const reduced = digits ? reduce(Number(digits)) : null;
  return (
    <>
      <div className="card form">
        <label>Seeing a number repeatedly? Enter it
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. 1111 or 24" inputMode="numeric" />
        </label>
        {reduced && <p>Reduces to <b>{reduced}</b>: {MEANINGS[reduced]?.[0]}. {MEANINGS[reduced]?.[1]}.</p>}
      </div>
      {Object.entries(ANGEL).map(([n, t]) => (
        <div className="card result" key={n}><div className="orb sm">{n}</div><p>{t}</p></div>
      ))}
    </>
  );
}

function Faq() {
  return FAQ.map(([q, a]) => (
    <details className="card" key={q}><summary>{q}</summary><p className="muted">{a}</p></details>
  ));
}

const fromHash = () => {
  const m = window.location.hash.match(/^#\/k\/(.+)$/);
  return m ? bySlug.get(decodeURIComponent(m[1])) || null : null;
};

export default function App() {
  const [tab, setTab] = useState("calc");
  const [item, setItem] = useState(fromHash);
  useEffect(() => {
    const on = () => setItem(fromHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const View = { calc: Calculator, topics: Topics, meanings: Meanings, match: Match, angel: Angel, faq: Faq }[tab];
  const go = (id) => { setTab(id); if (item) window.location.hash = "#/"; };
  return (
    <div className="app">
      <header>
        <h1>✦ Numeri</h1>
        <p>Free numerology calculator, number meanings and {KEYWORDS.length.toLocaleString()} topics</p>
      </header>
      <nav>
        {TABS.map(([id, label]) => (
          <button key={id} className={!item && tab === id ? "on" : ""} onClick={() => go(id)}>{label}</button>
        ))}
      </nav>
      <main>{item ? <KeywordPage item={item} calc={<Calculator />} /> : <View />}</main>
      <footer>Numerology is for entertainment and reflection, not a scientific or predictive tool.</footer>
    </div>
  );
}
