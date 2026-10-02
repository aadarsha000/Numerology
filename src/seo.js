import raw from "./keywords.json";

const langOf = (q) => {
  if (/[\u0400-\u04FF]/.test(q)) return "Русский";
  if (/numérologie|numerologie/i.test(q)) return "Français";
  if (/numerología/i.test(q)) return "Español";
  if (/numerologia/i.test(q)) return "Português/Italiano";
  return "English";
};

export const CATEGORIES = [
  ["angel", "Angel numbers", /angel|repeating|\b(111|222|333|444|555|666|777|888|999)\b/i],
  ["biblical", "Biblical numerology", /bibl/i],
  ["compat", "Love & compatibility", /compatib|marriage|relationship|love|partner|couple/i],
  ["trust", "Is numerology real?", /scam|\breal\b|\btrue\b|accurate|fake|legit/i],
  ["calculator", "Calculators & charts", /calculator|calculate|chart|online|software/i],
  ["learn", "Learn numerology", /course|book|pdf|epub|learn|beginner|advanced|wiki|school|training|читать/i],
  ["number", "Number meanings", /\d/],
  ["other", "More topics", /./],
];
export const categoryOf = (q) => CATEGORIES.find(([, , re]) => re.test(q))[0];
export const categoryLabel = (id) => CATEGORIES.find((c) => c[0] === id)[1];

const slugify = (q) => q.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");

const seen = new Map();
export const KEYWORDS = raw.map((r, i) => {
  let slug = slugify(r.q) || "k" + i;
  if (seen.has(slug)) slug += "-" + i;
  seen.set(slug, true);
  return { ...r, slug, lang: langOf(r.q), cat: categoryOf(r.q), title: r.q.charAt(0).toUpperCase() + r.q.slice(1) };
});
export const bySlug = new Map(KEYWORDS.map((k) => [k.slug, k]));

const tokens = (q) => new Set(q.toLowerCase().split(/[^\p{L}\p{N}]+/gu).filter((w) => w.length > 1 && !/^numerolog/.test(w)));

export function related(item, limit = 8) {
  const a = tokens(item.q);
  return KEYWORDS.filter((k) => k !== item && k.lang === item.lang)
    .map((k) => {
      let s = 0;
      tokens(k.q).forEach((w) => a.has(w) && s++);
      return { k, s: s + (k.cat === item.cat ? 0.5 : 0) };
    })
    .filter((x) => x.s > 0.5)
    .sort((x, y) => y.s - x.s)
    .slice(0, limit)
    .map((x) => x.k);
}

export const INTROS = {
  angel: "Repeating numbers are often read as messages of guidance in numerology. Here is what this search means and how to reflect on it.",
  biblical: "Numbers carry symbolic meaning in many religious texts. This page covers how numerology and biblical number symbolism are commonly discussed.",
  compat: "Numerology compares the numbers of two people to describe how their styles may fit together. Use it as a conversation starter, not a verdict.",
  trust: "People often ask whether numerology works. Here is a balanced answer: it is a belief system with no scientific evidence behind its predictions.",
  calculator: "You can work this out yourself in seconds with the calculator below. Enter your details to get your numbers and their meanings.",
  learn: "New to numerology? This page points you to the basics and to useful further reading.",
  number: "Every number from 1 to 9, plus the master numbers 11, 22 and 33, has a traditional meaning in numerology. Here is what this one stands for.",
  other: "Explore what this numerology topic means and where to read more.",
};
