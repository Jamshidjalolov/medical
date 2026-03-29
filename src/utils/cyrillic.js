const normalizeApostrophes = /[ʻʼ‘’`´]/g;

const sequenceReplacements = [
  [/O'/g, "Ў"],
  [/o'/g, "ў"],
  [/G'/g, "Ғ"],
  [/g'/g, "ғ"],
  [/SH/g, "Ш"],
  [/Sh/g, "Ш"],
  [/sh/g, "ш"],
  [/CH/g, "Ч"],
  [/Ch/g, "Ч"],
  [/ch/g, "ч"],
  [/YO/g, "Ё"],
  [/Yo/g, "Ё"],
  [/yo/g, "ё"],
  [/YU/g, "Ю"],
  [/Yu/g, "Ю"],
  [/yu/g, "ю"],
  [/YA/g, "Я"],
  [/Ya/g, "Я"],
  [/ya/g, "я"],
  [/YE/g, "Е"],
  [/Ye/g, "Е"],
  [/ye/g, "е"]
];

const charMap = {
  A: "А",
  a: "а",
  B: "Б",
  b: "б",
  C: "С",
  c: "с",
  D: "Д",
  d: "д",
  E: "Е",
  e: "е",
  F: "Ф",
  f: "ф",
  G: "Г",
  g: "г",
  H: "Ҳ",
  h: "ҳ",
  I: "И",
  i: "и",
  J: "Ж",
  j: "ж",
  K: "К",
  k: "к",
  L: "Л",
  l: "л",
  M: "М",
  m: "м",
  N: "Н",
  n: "н",
  O: "О",
  o: "о",
  P: "П",
  p: "п",
  Q: "Қ",
  q: "қ",
  R: "Р",
  r: "р",
  S: "С",
  s: "с",
  T: "Т",
  t: "т",
  U: "У",
  u: "у",
  V: "В",
  v: "в",
  X: "Х",
  x: "х",
  Y: "Й",
  y: "й",
  Z: "З",
  z: "з",
  "'": "ъ"
};

export function toCyrillicUz(value) {
  if (typeof value !== "string") {
    return value;
  }

  let nextValue = value.replace(normalizeApostrophes, "'");

  sequenceReplacements.forEach(([pattern, replacement]) => {
    nextValue = nextValue.replace(pattern, replacement);
  });

  return [...nextValue]
    .map((character) => {
      return charMap[character] ?? character;
    })
    .join("");
}
