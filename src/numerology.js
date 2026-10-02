const MASTERS = [11, 22, 33];

const digitSum = (n) => String(n).split("").reduce((a, d) => a + Number(d), 0);

// Reduce to a single digit, optionally keeping master numbers 11, 22, 33.
export function reduce(n, keepMaster = true) {
  while (n > 9 && !(keepMaster && MASTERS.includes(n))) n = digitSum(n);
  return n;
}

// Pythagorean: A=1 ... I=9, J=1 ... R=9, S=1 ... Z=8
const letterValue = (ch) => ((ch.charCodeAt(0) - 65) % 9) + 1;
const clean = (name) =>
  name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z]/g, "");

const sumLetters = (letters) => letters.split("").reduce((a, c) => a + letterValue(c), 0);

export function nameNumbers(name) {
  const letters = clean(name);
  if (!letters) return null;
  const vowels = letters.replace(/[^AEIOU]/g, "");
  const consonants = letters.replace(/[AEIOU]/g, "");
  return {
    expression: reduce(sumLetters(letters)),
    soulUrge: vowels ? reduce(sumLetters(vowels)) : null,
    personality: consonants ? reduce(sumLetters(consonants)) : null,
  };
}

// dateStr is "YYYY-MM-DD" (parsed manually to avoid timezone shifts)
export function dateNumbers(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  const rm = reduce(m, false), rd = reduce(d, false), ry = reduce(y, false);
  const lifePath = reduce(reduce(m) + reduce(d) + reduce(y));
  const c1 = Math.abs(rm - rd);
  const c2 = Math.abs(rd - ry);
  const c3 = Math.abs(c1 - c2);
  const c4 = Math.abs(rm - ry);
  const thisYear = new Date().getFullYear();
  return {
    lifePath,
    birthday: reduce(d),
    challenges: [c1, c2, c3, c4],
    personalYear: reduce(reduce(d) + reduce(m) + reduce(thisYear)),
    thisYear,
  };
}

const GROUPS = [[1, 5, 7], [2, 4, 8], [3, 6, 9]];
export function compatibility(a, b) {
  const base = (n) => (n > 9 ? reduce(n, false) : n);
  const x = base(a), y = base(b);
  if (x === y) return { score: 80, text: "Same number: you understand each other instantly, but share the same blind spots." };
  const same = GROUPS.some((g) => g.includes(x) && g.includes(y));
  if (same) return { score: 90, text: "Same family of numbers: similar pace and priorities make this a natural fit." };
  return { score: 62, text: "Different families: you bring complementary strengths, and it takes more conversation to align." };
}
