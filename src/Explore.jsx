import { useEffect, useMemo, useState } from "react";
import { KEYWORDS, CATEGORIES, categoryLabel, related, INTROS } from "./seo.js";
import { MEANINGS, ANGEL, FAQ } from "./content.js";

const domainOf = (u) => u.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
const LANGS = ["All", ...new Set(KEYWORDS.map((k) => k.lang))];

export function Topics() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [lang, setLang] = useState("English");
  const [page, setPage] = useState(1);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return KEYWORDS.filter(
      (k) => (cat === "all" || k.cat === cat) && (lang === "All" || k.lang === lang) && (!s || k.q.toLowerCase().includes(s))
    );
  }, [q, cat, lang]);
  const counts = useMemo(() => {
    const c = {};
    KEYWORDS.forEach((k) => (c[k.cat] = (c[k.cat] || 0) + 1));
    return c;
  }, []);
  useEffect(() => setPage(1), [q, cat, lang]);

  return (
    <>
      <div className="card form">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${KEYWORDS.length.toLocaleString()} numerology topics…`} />
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          {LANGS.map((l) => <option key={l}>{l}</option>)}
        </select>
        <div className="tags">
          <button className={"tag " + (cat === "all" ? "on" : "")} onClick={() => setCat("all")}>All</button>
          {CATEGORIES.map(([id, label]) => (
            <button key={id} className={"tag " + (cat === id ? "on" : "")} onClick={() => setCat(id)}>{label} ({counts[id] || 0})</button>
          ))}
        </div>
      </div>
      <p className="muted small">{list.length.toLocaleString()} topics</p>
      <div className="card toplist">
        {list.slice(0, page * 60).map((k) => (
          <a key={k.slug} href={"#/k/" + k.slug}>{k.title}</a>
        ))}
        {list.length > page * 60 && <button className="btn" onClick={() => setPage(page + 1)}>Show more</button>}
      </div>
    </>
  );
}

export function KeywordPage({ item, calc }) {
  useEffect(() => {
    const old = document.title;
    document.title = `${item.title} | Numeri`;
    window.scrollTo(0, 0);
    return () => (document.title = old);
  }, [item]);

  const nums = [...new Set((item.q.match(/\b\d{1,3}\b/g) || []).map(Number))];
  const meaningNums = nums.filter((n) => MEANINGS[n] || ANGEL[n]);
  const rel = useMemo(() => related(item), [item]);
  const showCalc = item.cat === "calculator" || item.cat === "number" || item.cat === "learn";

  return (
    <>
      <a className="back" href="#/">← All topics</a>
      <article className="card">
        <p className="muted small">{categoryLabel(item.cat)} · {item.lang}</p>
        <h2>{item.title}</h2>
        <p>{INTROS[item.cat]}</p>
      </article>

      {meaningNums.map((n) => (
        <div className="card result" key={n}>
          <div className="orb">{n}</div>
          <div>
            {MEANINGS[n] && <><h3>{MEANINGS[n][0]}</h3><p className="muted small">{MEANINGS[n][1]}</p><p>{MEANINGS[n][2]}</p></>}
            {ANGEL[n] && <><h3>Angel number {n}</h3><p>{ANGEL[n]}</p></>}
          </div>
        </div>
      ))}

      {item.cat === "trust" && (
        <div className="card"><h3>{FAQ[1][0]}</h3><p className="muted">{FAQ[1][1]}</p></div>
      )}
      {showCalc && <><h3 className="sec">Find your numbers</h3>{calc}</>}

      {item.u.length > 0 && (
        <div className="card">
          <h3>Further reading</h3>
          <ul className="reading">
            {item.u.map((u) => (
              <li key={u}><a href={u} target="_blank" rel="nofollow noopener noreferrer">{domainOf(u)}</a></li>
            ))}
          </ul>
        </div>
      )}
      {rel.length > 0 && (
        <div className="card">
          <h3>Related topics</h3>
          <div className="toplist">
            {rel.map((k) => <a key={k.slug} href={"#/k/" + k.slug}>{k.title}</a>)}
          </div>
        </div>
      )}
    </>
  );
}
