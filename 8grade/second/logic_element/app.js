'use strict';

/* ==========================================================
   ТРЕНАЖЁР: Круги Эйлера (45 заданий)
   ========================================================== */

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n) { return shuffle(arr).slice(0, n); }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function normFormula(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/\s+/g, '').replace(/[&|]/g, '').split('+').filter(x => x !== '').sort().join('+');
}

// Проверка выражения через подстановку
function evalUserExpression(expr, values, target) {
  if (!expr || !expr.trim()) return false;
  const cleaned = expr.replace(/\s+/g, '').toLowerCase();
  const substituted = cleaned.replace(/[abcd]/g, ch => values[ch]);
  if (!/^[0-9+\-()]+$/.test(substituted)) return false;
  let result;
  try { result = eval(substituted); } catch (e) { return false; }
  return Math.abs(result - target) < 0.001;
}

// ===================== SVG =====================

function getSVG2(labels, mode) {
  let texts = '';
  if (mode === 'letters') texts = '<text x="82" y="105" class="venn-text">a</text><text x="160" y="105" class="venn-text">b</text><text x="238" y="105" class="venn-text">c</text>';
  else if (mode === 'numbers') texts = '<text x="82" y="105" class="venn-text">1</text><text x="160" y="105" class="venn-text">2</text><text x="238" y="105" class="venn-text">3</text>';
  return `<svg viewBox="0 0 320 200" class="venn-svg">
    <defs>
      <clipPath id="clipA2"><circle cx="120" cy="100" r="70"/></clipPath>
      <clipPath id="clipB2"><circle cx="200" cy="100" r="70"/></clipPath>
      <mask id="maskA2"><rect width="100%" height="100%" fill="white"/><circle cx="120" cy="100" r="70" fill="black"/></mask>
      <mask id="maskB2"><rect width="100%" height="100%" fill="white"/><circle cx="200" cy="100" r="70" fill="black"/></mask>
    </defs>
    <g mask="url(#maskB2)"><circle cx="120" cy="100" r="70" class="venn-region" data-region="a"/></g>
    <g mask="url(#maskA2)"><circle cx="200" cy="100" r="70" class="venn-region" data-region="c"/></g>
    <g clip-path="url(#clipA2)"><circle cx="200" cy="100" r="70" class="venn-region" data-region="b"/></g>
    ${texts}
    <text x="70" y="20" class="venn-label">${labels[0]}</text>
    <text x="250" y="190" class="venn-label">${labels[1]}</text>
  </svg>`;
}

function getSVG3(labels, mode) {
  let texts = '';
  if (mode === 'letters') texts = '<text x="85" y="75" class="venn-text">a</text><text x="160" y="65" class="venn-text">b</text><text x="125" y="115" class="venn-text">c</text><text x="160" y="105" class="venn-text">d</text><text x="195" y="115" class="venn-text">e</text><text x="235" y="75" class="venn-text">f</text><text x="160" y="175" class="venn-text">g</text>';
  else if (mode === 'numbers') texts = '<text x="85" y="75" class="venn-text">1</text><text x="160" y="65" class="venn-text">2</text><text x="125" y="115" class="venn-text">3</text><text x="160" y="105" class="venn-text">4</text><text x="195" y="115" class="venn-text">5</text><text x="235" y="75" class="venn-text">6</text><text x="160" y="175" class="venn-text">7</text>';
  return `<svg viewBox="0 0 320 240" class="venn-svg">
    <defs>
      <clipPath id="clipA3"><circle cx="120" cy="80" r="65"/></clipPath>
      <clipPath id="clipB3"><circle cx="200" cy="80" r="65"/></clipPath>
      <clipPath id="clipC3"><circle cx="160" cy="140" r="65"/></clipPath>
      <mask id="maskA3"><rect width="100%" height="100%" fill="white"/><circle cx="120" cy="80" r="65" fill="black"/></mask>
      <mask id="maskB3"><rect width="100%" height="100%" fill="white"/><circle cx="200" cy="80" r="65" fill="black"/></mask>
      <mask id="maskC3"><rect width="100%" height="100%" fill="white"/><circle cx="160" cy="140" r="65" fill="black"/></mask>
    </defs>
    <g mask="url(#maskB3)"><g mask="url(#maskC3)"><circle cx="120" cy="80" r="65" class="venn-region" data-region="a"/></g></g>
    <g mask="url(#maskA3)"><g mask="url(#maskC3)"><circle cx="200" cy="80" r="65" class="venn-region" data-region="f"/></g></g>
    <g mask="url(#maskA3)"><g mask="url(#maskB3)"><circle cx="160" cy="140" r="65" class="venn-region" data-region="g"/></g></g>
    <g clip-path="url(#clipA3)"><g clip-path="url(#clipB3)"><g mask="url(#maskC3)"><circle cx="120" cy="80" r="65" class="venn-region" data-region="b"/></g></g></g>
    <g clip-path="url(#clipA3)"><g clip-path="url(#clipC3)"><g mask="url(#maskB3)"><circle cx="120" cy="80" r="65" class="venn-region" data-region="c"/></g></g></g>
    <g clip-path="url(#clipB3)"><g clip-path="url(#clipC3)"><g mask="url(#maskA3)"><circle cx="200" cy="80" r="65" class="venn-region" data-region="e"/></g></g></g>
    <g clip-path="url(#clipA3)"><g clip-path="url(#clipB3)"><circle cx="160" cy="140" r="65" class="venn-region" data-region="d"/></g></g>
    ${texts}
    <text x="70" y="20" class="venn-label">${labels[0]}</text>
    <text x="250" y="20" class="venn-label">${labels[1]}</text>
    <text x="160" y="232" class="venn-label" text-anchor="middle">${labels[2]}</text>
  </svg>`;
}

// ===================== ПУЛЫ =====================

const WORDS = ['Пушкин', 'Лермонтов', 'Гоголь', 'Толстой', 'Есенин', 'Блок', 'Ахматова', 'Цветаева', 'Бунин', 'Тургенев'];

function parts2(a, b, c) { return { a, b, c, A: a+b, B: b+c, U: a+b+c }; }
function parts3(v) { return { ...v, A: v.a+v.b+v.c+v.d, B: v.b+v.d+v.e+v.f, C: v.c+v.d+v.e+v.g, AB: v.b+v.d, BC: v.e+v.d, AC: v.c+v.d, ABC: v.d, U: v.a+v.b+v.c+v.d+v.e+v.f+v.g }; }

// ===================== ГЕНЕРАЦИЯ ЗАДАНИЙ =====================

function generateTasks() {
  const tasks = [];

  // ===== 1. ОПЕРАТОРЫ (choice) =====
  tasks.push({
    type: 'choice',
    instruction: 'Что означает логический оператор <b>|</b> в поисковом запросе?',
    options: [
      'Объединение: страницы, где есть хотя бы одно из слов',
      'Пересечение: страницы, где есть оба слова',
      'Исключение: страницы только с первым словом'
    ],
    correct: 'Объединение: страницы, где есть хотя бы одно из слов',
    explain: 'Оператор | (ИЛИ) расширяет поиск.'
  });
  tasks.push({
    type: 'choice',
    instruction: 'Что означает логический оператор <b>&</b> в поисковом запросе?',
    options: [
      'Объединение: страницы, где есть хотя бы одно из слов',
      'Пересечение: страницы, где есть оба слова',
      'Исключение: страницы только с первым словом'
    ],
    correct: 'Пересечение: страницы, где есть оба слова',
    explain: 'Оператор & (И) сужает поиск.'
  });

  // ===== 2. ПОДПИСАТЬ ЧАСТИ (2 и 3 круга) =====
  const s2 = pickN(WORDS, 2);
  tasks.push({
    type: 'sign_parts',
    instruction: 'На диаграмме два круга с областями 1, 2, 3. Впишите в каждое поле букву (a / b / c).',
    svg: getSVG2(s2, 'numbers'),
    fields: [
      { label: 'Область 1 (только A)', correct: 'a' },
      { label: 'Область 2 (A ∩ B)', correct: 'b' },
      { label: 'Область 3 (только B)', correct: 'c' }
    ],
    explain: 'a — только A, b — пересечение, c — только B.'
  });
  const s3 = pickN(WORDS, 3);
  tasks.push({
    type: 'sign_parts',
    instruction: 'Три круга с областями 1–7. Впишите букву каждой области.\nСтандарт: a — только A, b — A∩B без C, c — A∩C без B, d — все три, e — B∩C без A, f — только B, g — только C.',
    svg: getSVG3(s3, 'numbers'),
    fields: [
      { label: 'Область 1', correct: 'a' },
      { label: 'Область 2', correct: 'b' },
      { label: 'Область 3', correct: 'c' },
      { label: 'Область 4', correct: 'd' },
      { label: 'Область 5', correct: 'e' },
      { label: 'Область 6', correct: 'f' },
      { label: 'Область 7', correct: 'g' }
    ],
    explain: 'a, b, c, d, e, f, g — стандартные обозначения.'
  });

  // ===== 3. КЛИКИ ПО ДИАГРАММЕ (4) =====
  const c2a = pickN(WORDS, 2);
  tasks.push({
    type: 'venn_click',
    instruction: `Нажмите на все области, соответствующие запросу <b>${c2a[0]} | ${c2a[1]}</b>.`,
    svg: getSVG2(c2a, 'click'),
    correctRegions: ['a', 'b', 'c'],
    explain: 'A | B — все части обоих кругов.'
  });
  const c2b = pickN(WORDS, 2);
  tasks.push({
    type: 'venn_click',
    instruction: `Нажмите на области для <b>${c2b[0]} & -${c2b[1]}</b> (A и НЕ B).`,
    svg: getSVG2(c2b, 'click'),
    correctRegions: ['a'],
    explain: 'A & -B — только «чистая» часть A.'
  });
  const c3a = pickN(WORDS, 3);
  tasks.push({
    type: 'venn_click',
    instruction: `Нажмите на области для <b>${c3a[0]} & ${c3a[1]} & ${c3a[2]}</b>.`,
    svg: getSVG3(c3a, 'click'),
    correctRegions: ['d'],
    explain: 'Пересечение всех трёх — центр d.'
  });
  const c3b = pickN(WORDS, 3);
  tasks.push({
    type: 'venn_click',
    instruction: `Нажмите на области для <b>(${c3b[0]} | ${c3b[1]}) & ${c3b[2]}</b>.`,
    svg: getSVG3(c3b, 'click'),
    correctRegions: ['c', 'd', 'e'],
    explain: '(A|B)&C = (A∩C) ∪ (B∩C) = c + d + e.'
  });

  // ===== 4. ТАБЛИЦА + ФОРМУЛЫ (2 круга) — 3 =====
  for (let i = 0; i < 3; i++) {
    const l = pickN(WORDS, 2);
    const p = parts2(randInt(150, 400), randInt(60, 180), randInt(150, 400));
    tasks.push({
      type: 'table_map',
      instruction: 'Подпишите каждую строку таблицы буквенным выражением.',
      svg: getSVG2(l, 'letters'),
      rows: [
        { q: `${l[0]}`, count: p.A, correct: 'a+b' },
        { q: `${l[1]}`, count: p.B, correct: 'b+c' },
        { q: `${l[0]} & ${l[1]}`, count: p.b, correct: 'b' },
        { q: `${l[0]} | ${l[1]}`, count: p.U, correct: 'a+b+c' }
      ],
      explain: 'A = a+b, B = b+c, A&B = b, A|B = a+b+c.'
    });
  }

  // ===== 5. ТАБЛИЦА + ФОРМУЛЫ (3 круга) — 3 =====
  for (let i = 0; i < 3; i++) {
    const l = pickN(WORDS, 3);
    const p = parts3({ a: randInt(100, 200), b: randInt(50, 100), c: randInt(50, 100), d: randInt(20, 50), e: randInt(50, 100), f: randInt(100, 200), g: randInt(100, 200) });
    tasks.push({
      type: 'table_map',
      instruction: 'Подпишите каждую строку таблицы буквенным выражением (три круга).',
      svg: getSVG3(l, 'letters'),
      rows: [
        { q: `${l[0]}`, count: p.A, correct: 'a+b+c+d' },
        { q: `${l[1]}`, count: p.B, correct: 'b+d+e+f' },
        { q: `${l[2]}`, count: p.C, correct: 'c+d+e+g' },
        { q: `${l[0]} & ${l[1]}`, count: p.AB, correct: 'b+d' },
        { q: `${l[1]} & ${l[2]}`, count: p.BC, correct: 'e+d' },
        { q: `${l[0]} & ${l[2]}`, count: p.AC, correct: 'c+d' }
      ],
      explain: 'См. диаграмму.'
    });
  }

  // ===== 6. ТАБЛИЦА + ИСКОМОЕ — 4 =====
  for (let i = 0; i < 2; i++) {
    const l = pickN(WORDS, 2);
    const p = parts2(randInt(200, 400), randInt(80, 150), randInt(200, 400));
    tasks.push({
      type: 'table_target',
      instruction: 'Подпишите известные строки и подпишите искомое (без числа).',
      svg: getSVG2(l, 'letters'),
      knownRows: [
        { q: `${l[0]}`, count: p.A, correct: 'a+b' },
        { q: `${l[1]}`, count: p.B, correct: 'b+c' },
        { q: `${l[0]} | ${l[1]}`, count: p.U, correct: 'a+b+c' }
      ],
      targetQuery: `${l[0]} & ${l[1]}`,
      targetCorrect: 'b',
      explain: 'A&B = b.'
    });
  }
  for (let i = 0; i < 2; i++) {
    const l = pickN(WORDS, 3);
    const p = parts3({ a: randInt(100, 200), b: randInt(50, 100), c: randInt(50, 100), d: randInt(20, 50), e: randInt(50, 100), f: randInt(100, 200), g: randInt(100, 200) });
    tasks.push({
      type: 'table_target',
      instruction: 'Подпишите известные строки и подпишите искомое.',
      svg: getSVG3(l, 'letters'),
      knownRows: [
        { q: `${l[0]}`, count: p.A, correct: 'a+b+c+d' },
        { q: `${l[1]}`, count: p.B, correct: 'b+d+e+f' },
        { q: `${l[0]} & ${l[1]}`, count: p.AB, correct: 'b+d' },
        { q: `${l[0]} | ${l[1]} | ${l[2]}`, count: p.U, correct: 'a+b+c+d+e+f+g' }
      ],
      targetQuery: `${l[0]} & ${l[1]} & ${l[2]}`,
      targetCorrect: 'd',
      explain: 'A&B&C = d.'
    });
  }

  // ===== 7. СОСТАВЛЕНИЕ ВЫРАЖЕНИЯ (expression) — 5 =====
  // 7.1: (a+b)=X, (b)=Y → a = (a+b)-b
  {
    const a = randInt(200, 500), b = randInt(80, 180);
    tasks.push({
      type: 'expression',
      instruction: 'Даны известные величины. Составьте формулу для нахождения <b>a</b> через известные блоки и введите её.\nИспользуйте буквы a, b, c, d и знаки + и −. Например: (a+b)-b',
      svg: getSVG2(['A', 'B'], 'letters'),
      known: [
        { expr: '(a+b)', value: a + b },
        { expr: '(b)',   value: b }
      ],
      target: a,
      targetLabel: 'a',
      values: { a, b, c: 0, d: 0 },
      correctFormula: '(a+b)-b',
      explain: `a = (a+b) − b = ${a+b} − ${b} = ${a}.`
    });
  }
  // 7.2: (a+b)=X, (b+c)=Y, (a+b+c)=Z → b
  {
    const a = randInt(200, 500), b = randInt(80, 180), c = randInt(150, 400);
    tasks.push({
      type: 'expression',
      instruction: 'Даны известные величины. Составьте формулу для нахождения <b>b</b> через известные блоки.',
      svg: getSVG2(['A', 'B'], 'letters'),
      known: [
        { expr: '(a+b)',   value: a + b },
        { expr: '(b+c)',   value: b + c },
        { expr: '(a+b+c)', value: a + b + c }
      ],
      target: b,
      targetLabel: 'b',
      values: { a, b, c, d: 0 },
      correctFormula: '(a+b)+(b+c)-(a+b+c)',
      explain: `b = (a+b) + (b+c) − (a+b+c) = ${a+b} + ${b+c} − ${a+b+c} = ${b}.`
    });
  }
  // 7.3: (a+b+c)=Z, (b)=Y → a+c
  {
    const a = randInt(150, 350), b = randInt(80, 180), c = randInt(150, 350);
    tasks.push({
      type: 'expression',
      instruction: 'Даны известные величины. Составьте формулу для нахождения <b>a+c</b> через известные блоки.',
      svg: getSVG2(['A', 'B'], 'letters'),
      known: [
        { expr: '(a+b+c)', value: a + b + c },
        { expr: '(b)',     value: b }
      ],
      target: a + c,
      targetLabel: 'a+c',
      values: { a, b, c, d: 0 },
      correctFormula: '(a+b+c)-b',
      explain: `a+c = (a+b+c) − b = ${a+b+c} − ${b} = ${a+c}.`
    });
  }
  // 7.4: 3 круга, найти a
  {
    const a = randInt(150, 350), b = randInt(60, 120), c = randInt(60, 120), d = randInt(20, 50);
    tasks.push({
      type: 'expression',
      instruction: 'Даны известные величины (диаграмма из трёх кругов). Составьте формулу для нахождения <b>a</b> — «чистой» части первого круга.',
      svg: getSVG3(['A', 'B', 'C'], 'letters'),
      known: [
        { expr: '(a+b+c+d)', value: a + b + c + d },
        { expr: '(b+d)',     value: b + d },
        { expr: '(c+d)',     value: c + d },
        { expr: '(d)',       value: d }
      ],
      target: a,
      targetLabel: 'a',
      values: { a, b, c, d },
      correctFormula: '(a+b+c+d)-(b+d)-(c+d)+d',
      explain: `a = (a+b+c+d) − (b+d) − (c+d) + d = ${a+b+c+d} − ${b+d} − ${c+d} + ${d} = ${a}.`
    });
  }
  // 7.5: (a+b)=X, (a)=Y → b
  {
    const a = randInt(150, 350), b = randInt(80, 180);
    tasks.push({
      type: 'expression',
      instruction: 'Даны известные величины. Составьте формулу для нахождения <b>b</b> через известные блоки.',
      svg: getSVG2(['A', 'B'], 'letters'),
      known: [
        { expr: '(a+b)', value: a + b },
        { expr: '(a)',   value: a }
      ],
      target: b,
      targetLabel: 'b',
      values: { a, b, c: 0, d: 0 },
      correctFormula: '(a+b)-a',
      explain: `b = (a+b) − a = ${a+b} − ${a} = ${b}.`
    });
  }

  // ===== 8. ПОДПИШИ + СОСТАВЬ ФОРМУЛУ + ПОСЧИТАЙ — 4 =====
  // 8.1: 2 круга, A&B
  {
    const l = pickN(WORDS, 2);
    const a = randInt(200, 400), b = randInt(80, 150), c = randInt(200, 400);
    const p = parts2(a, b, c);
    tasks.push({
      type: 'sign_formula_count',
      instruction: 'Подпишите известные строки таблицы, составьте формулу для искомого и вычислите ответ.',
      svg: getSVG2(l, 'letters'),
      knownRows: [
        { q: `${l[0]}`, count: p.A, correct: 'a+b' },
        { q: `${l[1]}`, count: p.B, correct: 'b+c' },
        { q: `${l[0]} | ${l[1]}`, count: p.U, correct: 'a+b+c' }
      ],
      targetQuery: `${l[0]} & ${l[1]}`,
      values: { a, b, c, d: 0 },
      target: b,
      correctFormula: '(a+b)+(b+c)-(a+b+c)',
      answer: b,
      explain: `A&B = b = (a+b) + (b+c) − (a+b+c) = ${p.A} + ${p.B} − ${p.U} = ${b}.`
    });
  }
  // 8.2: 2 круга, A-B
  {
    const l = pickN(WORDS, 2);
    const a = randInt(200, 400), b = randInt(80, 150);
    tasks.push({
      type: 'sign_formula_count',
      instruction: 'Подпишите известные строки, составьте формулу и вычислите.',
      svg: getSVG2(l, 'letters'),
      knownRows: [
        { q: `${l[0]}`, count: a + b, correct: 'a+b' },
        { q: `${l[0]} & ${l[1]}`, count: b, correct: 'b' }
      ],
      targetQuery: `${l[0]} & -${l[1]}`,
      values: { a, b, c: 0, d: 0 },
      target: a,
      correctFormula: '(a+b)-b',
      answer: a,
      explain: `A&-B = a = (a+b) − b = ${a+b} − ${b} = ${a}.`
    });
  }
  // 8.3: 3 круга, A&B&C
  {
    const l = pickN(WORDS, 3);
    const a = randInt(100, 200), b = randInt(50, 100), c = randInt(50, 100), d = randInt(20, 50), e = randInt(50, 100), f = randInt(100, 200), g = randInt(100, 200);
    const p = parts3({ a, b, c, d, e, f, g });
    tasks.push({
      type: 'sign_formula_count',
      instruction: 'Подпишите известные строки, составьте формулу и вычислите.',
      svg: getSVG3(l, 'letters'),
      knownRows: [
        { q: `${l[0]} | ${l[1]} | ${l[2]}`, count: p.U, correct: 'a+b+c+d+e+f+g' },
        { q: `${l[0]}`, count: p.A, correct: 'a+b+c+d' },
        { q: `${l[1]}`, count: p.B, correct: 'b+d+e+f' },
        { q: `${l[2]}`, count: p.C, correct: 'c+d+e+g' },
        { q: `${l[0]} & ${l[1]}`, count: p.AB, correct: 'b+d' },
        { q: `${l[1]} & ${l[2]}`, count: p.BC, correct: 'e+d' },
        { q: `${l[0]} & ${l[2]}`, count: p.AC, correct: 'c+d' }
      ],
      targetQuery: `${l[0]} & ${l[1]} & ${l[2]}`,
      values: { a, b, c, d },
      target: d,
      correctFormula: '(a+b+c+d+e+f+g)-(a+b+c+d)-(b+d+e+f)-(c+d+e+g)+(b+d)+(e+d)+(c+d)',
      answer: d,
      explain: `A&B&C = d = ${p.U} − ${p.A} − ${p.B} − ${p.C} + ${p.AB} + ${p.BC} + ${p.AC} = ${d}.`
    });
  }
  // 8.4: 3 круга, A|B|C
  {
    const l = pickN(WORDS, 3);
    const a = randInt(100, 200), b = randInt(50, 100), c = randInt(50, 100), d = randInt(20, 50), e = randInt(50, 100), f = randInt(100, 200), g = randInt(100, 200);
    const p = parts3({ a, b, c, d, e, f, g });
    tasks.push({
      type: 'sign_formula_count',
      instruction: 'Подпишите известные строки, составьте формулу и вычислите.',
      svg: getSVG3(l, 'letters'),
      knownRows: [
        { q: `${l[0]}`, count: p.A, correct: 'a+b+c+d' },
        { q: `${l[1]}`, count: p.B, correct: 'b+d+e+f' },
        { q: `${l[2]}`, count: p.C, correct: 'c+d+e+g' },
        { q: `${l[0]} & ${l[1]}`, count: p.AB, correct: 'b+d' },
        { q: `${l[1]} & ${l[2]}`, count: p.BC, correct: 'e+d' },
        { q: `${l[0]} & ${l[2]}`, count: p.AC, correct: 'c+d' },
        { q: `${l[0]} & ${l[1]} & ${l[2]}`, count: p.ABC, correct: 'd' }
      ],
      targetQuery: `${l[0]} | ${l[1]} | ${l[2]}`,
      values: { a, b, c, d },
      target: p.U,
      correctFormula: '(a+b+c+d)+(b+d+e+f)+(c+d+e+g)-(b+d)-(e+d)-(c+d)+d',
      answer: p.U,
      explain: `A|B|C = a+b+c+d+e+f+g = ${p.A} + ${p.B} + ${p.C} − ${p.AB} − ${p.BC} − ${p.AC} + ${p.ABC} = ${p.U}.`
    });
  }

  // ===== 9. ТАБЛИЦА + ИСКОМОЕ + РАСЧЁТ — 4 =====
  for (let i = 0; i < 2; i++) {
    const l = pickN(WORDS, 2);
    const a = randInt(200, 400), b = randInt(80, 150), c = randInt(200, 400);
    const p = parts2(a, b, c);
    tasks.push({
      type: 'table_solve',
      instruction: 'Подпишите известные строки, подпишите искомое и вычислите число.',
      svg: getSVG2(l, 'letters'),
      knownRows: [
        { q: `${l[0]}`, count: p.A, correct: 'a+b' },
        { q: `${l[1]}`, count: p.B, correct: 'b+c' },
        { q: `${l[0]} | ${l[1]}`, count: p.U, correct: 'a+b+c' }
      ],
      targetQuery: `${l[0]} & ${l[1]}`,
      targetCorrect: 'b',
      targetAnswer: b,
      explain: `A&B = b = ${p.A} + ${p.B} − ${p.U} = ${b}.`
    });
  }
  for (let i = 0; i < 2; i++) {
    const l = pickN(WORDS, 3);
    const p = parts3({ a: randInt(100, 200), b: randInt(50, 100), c: randInt(50, 100), d: randInt(20, 50), e: randInt(50, 100), f: randInt(100, 200), g: randInt(100, 200) });
    tasks.push({
      type: 'table_solve',
      instruction: 'Подпишите известные строки, подпишите искомое и вычислите.',
      svg: getSVG3(l, 'letters'),
      knownRows: [
        { q: `${l[0]}`, count: p.A, correct: 'a+b+c+d' },
        { q: `${l[1]}`, count: p.B, correct: 'b+d+e+f' },
        { q: `${l[2]}`, count: p.C, correct: 'c+d+e+g' },
        { q: `${l[0]} & ${l[1]}`, count: p.AB, correct: 'b+d' },
        { q: `${l[0]} | ${l[1]} | ${l[2]}`, count: p.U, correct: 'a+b+c+d+e+f+g' }
      ],
      targetQuery: `${l[0]} & ${l[1]} & ${l[2]}`,
      targetCorrect: 'd',
      targetAnswer: p.ABC,
      explain: `A&B&C = d = ${p.U} − ${p.A} − ${p.B} − ${p.C} + ${p.AB} + ${p.BC} + ${p.AC} = ${p.ABC}.`
    });
  }

  // ===== 10. ПОЛНЫЙ АЛГОРИТМ — 10 =====
  // 10.1-10.3: 2 круга
  for (let i = 0; i < 3; i++) {
    const l = pickN(WORDS, 2);
    const a = randInt(200, 400), b = randInt(80, 150), c = randInt(200, 400);
    const p = parts2(a, b, c);
    const targets = [
      { query: `${l[0]} & ${l[1]}`, expr: 'b', answer: b,
        known: [{ q: `${l[0]}`, count: p.A, correct: 'a+b' }, { q: `${l[1]}`, count: p.B, correct: 'b+c' }, { q: `${l[0]} | ${l[1]}`, count: p.U, correct: 'a+b+c' }] },
      { query: `${l[0]} & -${l[1]}`, expr: 'a', answer: a,
        known: [{ q: `${l[0]}`, count: p.A, correct: 'a+b' }, { q: `${l[0]} & ${l[1]}`, count: p.b, correct: 'b' }] },
      { query: `${l[0]} | ${l[1]}`, expr: 'a+b+c', answer: p.U,
        known: [{ q: `${l[0]}`, count: p.A, correct: 'a+b' }, { q: `${l[1]}`, count: p.B, correct: 'b+c' }, { q: `${l[0]} & ${l[1]}`, count: p.b, correct: 'b' }] }
    ];
    const t = targets[i];
    tasks.push({
      type: 'full',
      instruction: 'Решите по алгоритму: ① диаграмма ② известные ③ искомое ④ число.',
      svg: getSVG2(l, 'letters'),
      knownRows: t.known,
      target: { query: t.query, expr: t.expr, answer: t.answer },
      explain: `${t.query} = ${t.expr} = ${t.answer}.`
    });
  }
  // 10.4-10.6: 3 круга, пересечение
  for (let i = 0; i < 3; i++) {
    const l = pickN(WORDS, 3);
    const p = parts3({ a: randInt(100, 200), b: randInt(50, 100), c: randInt(50, 100), d: randInt(20, 50), e: randInt(50, 100), f: randInt(100, 200), g: randInt(100, 200) });
    tasks.push({
      type: 'full',
      instruction: 'Решите по алгоритму. Найдите пересечение трёх множеств.',
      svg: getSVG3(l, 'letters'),
      knownRows: [
        { q: `${l[0]} | ${l[1]} | ${l[2]}`, count: p.U, correct: 'a+b+c+d+e+f+g' },
        { q: `${l[0]}`, count: p.A, correct: 'a+b+c+d' },
        { q: `${l[1]}`, count: p.B, correct: 'b+d+e+f' },
        { q: `${l[2]}`, count: p.C, correct: 'c+d+e+g' },
        { q: `${l[0]} & ${l[1]}`, count: p.AB, correct: 'b+d' },
        { q: `${l[1]} & ${l[2]}`, count: p.BC, correct: 'e+d' },
        { q: `${l[0]} & ${l[2]}`, count: p.AC, correct: 'c+d' }
      ],
      target: { query: `${l[0]} & ${l[1]} & ${l[2]}`, expr: 'd', answer: p.ABC },
      explain: `A&B&C = ${p.U} − ${p.A} − ${p.B} − ${p.C} + ${p.AB} + ${p.BC} + ${p.AC} = ${p.ABC}.`
    });
  }
  // 10.7-10.10: 3 круга, объединение
  for (let i = 0; i < 4; i++) {
    const l = pickN(WORDS, 3);
    const p = parts3({ a: randInt(100, 200), b: randInt(50, 100), c: randInt(50, 100), d: randInt(20, 50), e: randInt(50, 100), f: randInt(100, 200), g: randInt(100, 200) });
    tasks.push({
      type: 'full',
      instruction: 'Решите по алгоритму. Найдите объединение трёх множеств.',
      svg: getSVG3(l, 'letters'),
      knownRows: [
        { q: `${l[0]}`, count: p.A, correct: 'a+b+c+d' },
        { q: `${l[1]}`, count: p.B, correct: 'b+d+e+f' },
        { q: `${l[2]}`, count: p.C, correct: 'c+d+e+g' },
        { q: `${l[0]} & ${l[1]}`, count: p.AB, correct: 'b+d' },
        { q: `${l[1]} & ${l[2]}`, count: p.BC, correct: 'e+d' },
        { q: `${l[0]} & ${l[2]}`, count: p.AC, correct: 'c+d' },
        { q: `${l[0]} & ${l[1]} & ${l[2]}`, count: p.ABC, correct: 'd' }
      ],
      target: { query: `${l[0]} | ${l[1]} | ${l[2]}`, expr: 'a+b+c+d+e+f+g', answer: p.U },
      explain: `A|B|C = ${p.A} + ${p.B} + ${p.C} − ${p.AB} − ${p.BC} − ${p.AC} + ${p.ABC} = ${p.U}.`
    });
  }

  // ===== 11. ПРОСТО ПОСЧИТАЙ — 4 =====
  {
    const l = pickN(WORDS, 2);
    const a = randInt(200, 400), b = randInt(80, 150), c = randInt(200, 400);
    const p = parts2(a, b, c);
    tasks.push({
      type: 'answer_only',
      instruction: `Найдите число страниц по запросу <b>${l[0]} & ${l[1]}</b>.\nВведите только число.`,
      rows: [
        { q: `${l[0]}`, count: p.A },
        { q: `${l[1]}`, count: p.B },
        { q: `${l[0]} | ${l[1]}`, count: p.U }
      ],
      answer: b,
      explain: `A&B = ${p.A} + ${p.B} − ${p.U} = ${b}.`
    });
  }
  {
    const l = pickN(WORDS, 2);
    const a = randInt(200, 400), b = randInt(80, 150);
    tasks.push({
      type: 'answer_only',
      instruction: `Найдите число страниц для <b>${l[0]} & -${l[1]}</b>.\nВведите только число.`,
      rows: [
        { q: `${l[0]}`, count: a + b },
        { q: `${l[0]} & ${l[1]}`, count: b }
      ],
      answer: a,
      explain: `A&-B = ${a+b} − ${b} = ${a}.`
    });
  }
  {
    const l = pickN(WORDS, 3);
    const a = randInt(100, 200), b = randInt(50, 100), c = randInt(50, 100), d = randInt(20, 50), e = randInt(50, 100), f = randInt(100, 200), g = randInt(100, 200);
    const p = parts3({ a, b, c, d, e, f, g });
    tasks.push({
      type: 'answer_only',
      instruction: `Найдите <b>${l[0]} & ${l[1]} & ${l[2]}</b>.\nВведите только число.`,
      rows: [
        { q: `${l[0]} | ${l[1]} | ${l[2]}`, count: p.U },
        { q: `${l[0]}`, count: p.A },
        { q: `${l[1]}`, count: p.B },
        { q: `${l[2]}`, count: p.C },
        { q: `${l[0]} & ${l[1]}`, count: p.AB },
        { q: `${l[1]} & ${l[2]}`, count: p.BC },
        { q: `${l[0]} & ${l[2]}`, count: p.AC }
      ],
      answer: d,
      explain: `A&B&C = ${p.U} − ${p.A} − ${p.B} − ${p.C} + ${p.AB} + ${p.BC} + ${p.AC} = ${d}.`
    });
  }
  {
    const l = pickN(WORDS, 3);
    const a = randInt(100, 200), b = randInt(50, 100), c = randInt(50, 100), d = randInt(20, 50), e = randInt(50, 100), f = randInt(100, 200), g = randInt(100, 200);
    const p = parts3({ a, b, c, d, e, f, g });
    tasks.push({
      type: 'answer_only',
      instruction: `Найдите <b>${l[0]} | ${l[1]} | ${l[2]}</b>.\nВведите только число.`,
      rows: [
        { q: `${l[0]}`, count: p.A },
        { q: `${l[1]}`, count: p.B },
        { q: `${l[2]}`, count: p.C },
        { q: `${l[0]} & ${l[1]}`, count: p.AB },
        { q: `${l[1]} & ${l[2]}`, count: p.BC },
        { q: `${l[0]} & ${l[2]}`, count: p.AC },
        { q: `${l[0]} & ${l[1]} & ${l[2]}`, count: p.ABC }
      ],
      answer: p.U,
      explain: `A|B|C = ${p.A} + ${p.B} + ${p.C} − ${p.AB} − ${p.BC} − ${p.AC} + ${p.ABC} = ${p.U}.`
    });
  }

  return tasks;
}

// ===================== СОСТОЯНИЕ =====================

const state = { qIndex: 0, correct: 0, answered: false, selection: null, tasks: [] };

const el = {
  progressText: document.getElementById('progressText'),
  progressFill: document.getElementById('progressFill'),
  screenQuiz: document.getElementById('screen-quiz'),
  screenResult: document.getElementById('screen-result'),
  instruction: document.getElementById('instruction'),
  taskBody: document.getElementById('taskBody'),
  feedback: document.getElementById('feedback'),
  checkBtn: document.getElementById('checkBtn'),
  nextBtn: document.getElementById('nextBtn'),
  finishEmoji: document.getElementById('finishEmoji'),
  finishTitle: document.getElementById('finishTitle'),
  finishText: document.getElementById('finishText'),
  retryBtn: document.getElementById('retryBtn'),
  backBtn: document.getElementById('backBtn')
};

function currentTask() { return state.tasks[state.qIndex]; }
function setFeedback(kind, text) { el.feedback.className = 'feedback' + (kind ? ' ' + kind : ''); el.feedback.innerHTML = text || ''; }
function updateProgress(done) {
  const total = state.tasks.length;
  const d = state.qIndex + (done ? 1 : 0);
  el.progressText.textContent = `Задание ${state.qIndex + 1} из ${total}`;
  el.progressFill.style.width = Math.round((d / total) * 100) + '%';
}

// ===================== РЕНДЕР =====================

function renderTask() {
  const q = currentTask();
  state.answered = false;
  state.selection = null;

  el.instruction.innerHTML = q.instruction;
  el.taskBody.innerHTML = '';
  setFeedback('', '');

  el.checkBtn.hidden = false;
  el.checkBtn.disabled = false;
  el.nextBtn.hidden = true;
  el.nextBtn.textContent = (state.qIndex === state.tasks.length - 1) ? 'Завершить ✓' : 'Далее →';
  updateProgress(false);

  if (q.svg) {
    const c = document.createElement('div');
    c.className = 'venn-container';
    c.innerHTML = q.svg;
    el.taskBody.appendChild(c);
  }

  if (q.type === 'choice') renderChoice(q);
  else if (q.type === 'sign_parts') renderSignParts(q);
  else if (q.type === 'venn_click') renderVennClick(q);
  else if (q.type === 'expression') renderExpression(q);
  else if (q.type === 'sign_formula_count') renderSignFormulaCount(q);
  else if (q.type === 'answer_only') renderAnswerOnly(q);
  else if (q.type === 'table_map') renderTableMap(q);
  else if (q.type === 'table_target') renderTableTarget(q);
  else if (q.type === 'table_solve') renderTableSolve(q);
  else if (q.type === 'full') renderFull(q);
}

function renderChoice(q) {
  const wrap = document.createElement('div');
  wrap.className = 'options';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'option'; btn.textContent = opt;
    btn.addEventListener('click', () => {
      if (state.answered) return;
      state.selection = opt;
      Array.from(wrap.children).forEach(c => c.classList.toggle('selected', c === btn));
    });
    wrap.appendChild(btn);
  });
  el.taskBody.appendChild(wrap);
}

function renderSignParts(q) {
  state.selection = [];
  q.fields.forEach(f => {
    const row = document.createElement('div');
    row.className = 'multi-input-row';
    const label = document.createElement('label');
    label.textContent = f.label + ' →';
    const input = document.createElement('input');
    input.type = 'text'; input.className = 'multi-input';
    input.placeholder = 'a/b/c…'; input.maxLength = 1;
    row.appendChild(label); row.appendChild(input);
    el.taskBody.appendChild(row);
    state.selection.push(input);
  });
  setTimeout(() => state.selection[0]?.focus(), 100);
}

function renderVennClick(q) {
  state.selection = new Set();
  el.taskBody.querySelectorAll('.venn-region').forEach(region => {
    region.addEventListener('click', () => {
      if (state.answered) return;
      const r = region.dataset.region;
      if (state.selection.has(r)) { state.selection.delete(r); region.classList.remove('selected'); }
      else { state.selection.add(r); region.classList.add('selected'); }
    });
  });
}

function renderExpression(q) {
  // Таблица известных
  const table = document.createElement('table');
  table.className = 'table-with-inputs';
  let html = '<tr><th>Известно</th><th>Значение</th></tr>';
  q.known.forEach(row => {
    html += `<tr><td>${escapeHtml(row.expr)}</td><td class="center">${row.value}</td></tr>`;
  });
  table.innerHTML = html;
  el.taskBody.appendChild(table);

  // Поле для формулы
  const box = document.createElement('div');
  box.className = 'step-box';
  box.innerHTML = `<h4>Составьте формулу для <b>${escapeHtml(q.targetLabel)}</b>:</h4>`;
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.placeholder = 'Например: (a+b)-b';
  inp.style.width = '280px';
  box.appendChild(inp);
  el.taskBody.appendChild(box);
  state.selection = inp;
  setTimeout(() => inp.focus(), 100);
}

function renderSignFormulaCount(q) {
  state.selection = { exprs: [], formula: null, answer: null };
  const table = document.createElement('table');
  table.className = 'table-with-inputs';
  let html = '<tr><th>Запрос</th><th>Страниц</th><th>Буквенное выражение</th></tr>';
  q.knownRows.forEach((row, i) => {
    html += `<tr><td>${escapeHtml(row.q)}</td><td class="center">${row.count}</td><td class="center"><input type="text" data-idx="${i}" placeholder="a+b"></td></tr>`;
  });
  table.innerHTML = html;
  el.taskBody.appendChild(table);
  table.querySelectorAll('input[data-idx]').forEach(inp => state.selection.exprs.push(inp));

  const box1 = document.createElement('div');
  box1.className = 'step-box';
  box1.innerHTML = `<h4>③ Составьте формулу для <b>${escapeHtml(q.targetQuery)}</b>:</h4>`;
  const formulaInp = document.createElement('input');
  formulaInp.type = 'text'; formulaInp.placeholder = 'Например: (a+b)-b';
  formulaInp.style.width = '280px';
  box1.appendChild(formulaInp);
  el.taskBody.appendChild(box1);
  state.selection.formula = formulaInp;

  const box2 = document.createElement('div');
  box2.className = 'step-box';
  box2.innerHTML = '<h4>④ Вычислите число:</h4>';
  const ansInp = document.createElement('input');
  ansInp.type = 'text'; ansInp.inputMode = 'numeric'; ansInp.placeholder = 'Число';
  box2.appendChild(ansInp);
  el.taskBody.appendChild(box2);
  state.selection.answer = ansInp;

  setTimeout(() => state.selection.exprs[0]?.focus(), 100);
}

function renderAnswerOnly(q) {
  const table = document.createElement('table');
  table.className = 'table-with-inputs';
  let html = '<tr><th>Запрос</th><th>Страниц</th></tr>';
  q.rows.forEach(row => {
    html += `<tr><td>${escapeHtml(row.q)}</td><td class="center">${row.count}</td></tr>`;
  });
  table.innerHTML = html;
  el.taskBody.appendChild(table);

  const wrap = document.createElement('div');
  wrap.className = 'input-wrap';
  const inp = document.createElement('input');
  inp.type = 'text'; inp.inputMode = 'numeric'; inp.className = 'input-answer'; inp.placeholder = 'Введите число';
  wrap.appendChild(inp);
  el.taskBody.appendChild(wrap);
  state.selection = inp;
  setTimeout(() => inp.focus(), 100);
}

function renderTableMap(q) {
  state.selection = [];
  const table = document.createElement('table');
  table.className = 'table-with-inputs';
  let html = '<tr><th>Запрос</th><th>Страниц</th><th>Буквенное выражение</th></tr>';
  q.rows.forEach((row, i) => {
    html += `<tr><td>${escapeHtml(row.q)}</td><td class="center">${row.count}</td><td class="center"><input type="text" data-idx="${i}" placeholder="a+b"></td></tr>`;
  });
  table.innerHTML = html;
  el.taskBody.appendChild(table);
  table.querySelectorAll('input').forEach(inp => state.selection.push(inp));
  setTimeout(() => state.selection[0]?.focus(), 100);
}

function renderTableTarget(q) {
  state.selection = { knownExprs: [], targetExpr: null };
  const table = document.createElement('table');
  table.className = 'table-with-inputs';
  let html = '<tr><th>Запрос</th><th>Страниц</th><th>Буквенное выражение</th></tr>';
  q.knownRows.forEach((row, i) => {
    html += `<tr><td>${escapeHtml(row.q)}</td><td class="center">${row.count}</td><td class="center"><input type="text" data-idx="${i}" placeholder="a+b"></td></tr>`;
  });
  html += `<tr style="background:#fef3c7"><td><b>Искомое:</b> ${escapeHtml(q.targetQuery)}</td><td class="center"><i>?</i></td><td class="center"><input type="text" data-target placeholder="a+b"></td></tr>`;
  table.innerHTML = html;
  el.taskBody.appendChild(table);
  table.querySelectorAll('input[data-idx]').forEach(inp => state.selection.knownExprs.push(inp));
  state.selection.targetExpr = table.querySelector('[data-target]');
  setTimeout(() => state.selection.knownExprs[0]?.focus(), 100);
}

function renderTableSolve(q) {
  state.selection = { knownExprs: [], targetExpr: null, answer: null };
  const table = document.createElement('table');
  table.className = 'table-with-inputs';
  let html = '<tr><th>Запрос</th><th>Страниц</th><th>Буквенное выражение</th></tr>';
  q.knownRows.forEach((row, i) => {
    html += `<tr><td>${escapeHtml(row.q)}</td><td class="center">${row.count}</td><td class="center"><input type="text" data-idx="${i}" placeholder="a+b"></td></tr>`;
  });
  html += `<tr style="background:#fef3c7"><td><b>Искомое:</b> ${escapeHtml(q.targetQuery)}</td><td class="center"><i>?</i></td><td class="center"><input type="text" data-target placeholder="a+b"></td></tr>`;
  table.innerHTML = html;
  el.taskBody.appendChild(table);
  table.querySelectorAll('input[data-idx]').forEach(inp => state.selection.knownExprs.push(inp));
  state.selection.targetExpr = table.querySelector('[data-target]');

  const box = document.createElement('div');
  box.className = 'step-box';
  box.innerHTML = '<h4>④ Численный ответ:</h4>';
  const ans = document.createElement('input');
  ans.type = 'text'; ans.inputMode = 'numeric'; ans.placeholder = 'Число';
  box.appendChild(ans);
  el.taskBody.appendChild(box);
  state.selection.answer = ans;

  setTimeout(() => state.selection.knownExprs[0]?.focus(), 100);
}

function renderFull(q) {
  state.selection = { knownExprs: [], targetExpr: null, answer: null };
  const table = document.createElement('table');
  table.className = 'table-with-inputs';
  let html = '<tr><th>Запрос</th><th>Страниц</th><th>Буквенное выражение</th></tr>';
  q.knownRows.forEach((row, i) => {
    html += `<tr><td>${escapeHtml(row.q)}</td><td class="center">${row.count}</td><td class="center"><input type="text" data-idx="${i}" placeholder="a+b"></td></tr>`;
  });
  html += `<tr style="background:#fef3c7"><td><b>Искомое:</b> ${escapeHtml(q.target.query)}</td><td class="center"><i>?</i></td><td class="center"><input type="text" data-target placeholder="a+b"></td></tr>`;
  table.innerHTML = html;
  el.taskBody.appendChild(table);
  table.querySelectorAll('input[data-idx]').forEach(inp => state.selection.knownExprs.push(inp));
  state.selection.targetExpr = table.querySelector('[data-target]');

  const box = document.createElement('div');
  box.className = 'step-box';
  box.innerHTML = '<h4>④ Численный ответ:</h4>';
  const ans = document.createElement('input');
  ans.type = 'text'; ans.inputMode = 'numeric'; ans.placeholder = 'Число';
  box.appendChild(ans);
  el.taskBody.appendChild(box);
  state.selection.answer = ans;

  setTimeout(() => state.selection.knownExprs[0]?.focus(), 100);
}

// ===================== ПРОВЕРКА =====================

function checkAnswer() {
  if (state.answered) return;
  const q = currentTask();
  let isCorrect = false;
  const explainText = q.explain || '';

  if (q.type === 'choice') {
    if (!state.selection) return setFeedback('warn', 'Выберите вариант.');
    isCorrect = state.selection === q.correct;
    el.taskBody.querySelectorAll('.option').forEach(btn => {
      btn.disabled = true; btn.classList.remove('selected');
      if (btn.textContent === q.correct) btn.classList.add('ok');
      else if (state.selection === btn.textContent) btn.classList.add('wrong');
    });
  }
  else if (q.type === 'sign_parts') {
    let allFilled = true, allOk = true;
    for (let i = 0; i < q.fields.length; i++) {
      const inp = state.selection[i];
      const val = inp.value.trim().toLowerCase();
      if (!val) { allFilled = false; continue; }
      const ok = val === q.fields[i].correct;
      inp.classList.add(ok ? 'ok' : 'wrong');
      if (!ok) { allOk = false; inp.value = q.fields[i].correct; }
    }
    if (!allFilled) return setFeedback('warn', 'Заполните все поля.');
    isCorrect = allOk;
  }
  else if (q.type === 'venn_click') {
    if (state.selection.size === 0) return setFeedback('warn', 'Выберите хотя бы одну область.');
    const userArr = Array.from(state.selection).sort();
    const corrArr = q.correctRegions.slice().sort();
    isCorrect = userArr.join() === corrArr.join();
    el.taskBody.querySelectorAll('.venn-region').forEach(region => {
      region.classList.remove('selected');
      const r = region.dataset.region;
      const wasSelected = state.selection.has(r);
      const shouldBe = q.correctRegions.includes(r);
      if (wasSelected && shouldBe) region.classList.add('ok');
      else if (wasSelected && !shouldBe) region.classList.add('wrong');
      else if (!wasSelected && shouldBe) region.classList.add('missed');
    });
  }
  else if (q.type === 'expression') {
    const inp = state.selection;
    const val = inp.value.trim();
    if (!val) return setFeedback('warn', 'Введите формулу.');
    isCorrect = evalUserExpression(val, q.values, q.target);
    inp.classList.add(isCorrect ? 'ok' : 'wrong');
    inp.disabled = true;
    if (!isCorrect) inp.value = q.correctFormula;
  }
  else if (q.type === 'answer_only') {
    const inp = state.selection;
    const val = inp.value.trim();
    if (!val) return setFeedback('warn', 'Введите число.');
    isCorrect = val.replace(/\s/g, '') === String(q.answer);
    inp.classList.add(isCorrect ? 'ok' : 'wrong');
    inp.disabled = true;
    if (!isCorrect) inp.value = String(q.answer);
  }
  else if (q.type === 'table_map') {
    let allFilled = true, allOk = true;
    for (let i = 0; i < q.rows.length; i++) {
      const inp = state.selection[i];
      const val = inp.value.trim();
      if (!val) { allFilled = false; continue; }
      const ok = normFormula(val) === normFormula(q.rows[i].correct);
      inp.classList.add(ok ? 'ok' : 'wrong');
      if (!ok) { allOk = false; inp.value = q.rows[i].correct; }
    }
    if (!allFilled) return setFeedback('warn', 'Заполните все поля.');
    isCorrect = allOk;
  }
  else if (q.type === 'sign_formula_count' || q.type === 'table_target' || q.type === 'table_solve' || q.type === 'full') {
    let allFilled = true, allOk = true;

    if (q.type === 'sign_formula_count') {
      for (let i = 0; i < q.knownRows.length; i++) {
        const inp = state.selection.exprs[i];
        const val = inp.value.trim();
        if (!val) { allFilled = false; continue; }
        const ok = normFormula(val) === normFormula(q.knownRows[i].correct);
        inp.classList.add(ok ? 'ok' : 'wrong');
        if (!ok) { allOk = false; inp.value = q.knownRows[i].correct; }
      }
      const formulaVal = state.selection.formula.value.trim();
      if (!formulaVal) allFilled = false;
      else {
        const ok = evalUserExpression(formulaVal, q.values, q.target);
        state.selection.formula.classList.add(ok ? 'ok' : 'wrong');
        if (!ok) { allOk = false; state.selection.formula.value = q.correctFormula; }
      }
      const ansVal = state.selection.answer.value.trim();
      if (!ansVal) allFilled = false;
      else {
        const ok = ansVal.replace(/\s/g, '') === String(q.answer);
        state.selection.answer.classList.add(ok ? 'ok' : 'wrong');
        if (!ok) { allOk = false; state.selection.answer.value = String(q.answer); }
      }
    }
    else if (q.type === 'table_target') {
      for (let i = 0; i < q.knownRows.length; i++) {
        const inp = state.selection.knownExprs[i];
        const val = inp.value.trim();
        if (!val) { allFilled = false; continue; }
        const ok = normFormula(val) === normFormula(q.knownRows[i].correct);
        inp.classList.add(ok ? 'ok' : 'wrong');
        if (!ok) { allOk = false; inp.value = q.knownRows[i].correct; }
      }
      const tVal = state.selection.targetExpr.value.trim();
      if (!tVal) allFilled = false;
      else {
        const ok = normFormula(tVal) === normFormula(q.targetCorrect);
        state.selection.targetExpr.classList.add(ok ? 'ok' : 'wrong');
        if (!ok) { allOk = false; state.selection.targetExpr.value = q.targetCorrect; }
      }
    }
    else if (q.type === 'table_solve') {
      for (let i = 0; i < q.knownRows.length; i++) {
        const inp = state.selection.knownExprs[i];
        const val = inp.value.trim();
        if (!val) { allFilled = false; continue; }
        const ok = normFormula(val) === normFormula(q.knownRows[i].correct);
        inp.classList.add(ok ? 'ok' : 'wrong');
        if (!ok) { allOk = false; inp.value = q.knownRows[i].correct; }
      }
      const tVal = state.selection.targetExpr.value.trim();
      if (!tVal) allFilled = false;
      else {
        const ok = normFormula(tVal) === normFormula(q.targetCorrect);
        state.selection.targetExpr.classList.add(ok ? 'ok' : 'wrong');
        if (!ok) { allOk = false; state.selection.targetExpr.value = q.targetCorrect; }
      }
      const aVal = state.selection.answer.value.trim();
      if (!aVal) allFilled = false;
      else {
        const ok = aVal.replace(/\s/g, '') === String(q.targetAnswer);
        state.selection.answer.classList.add(ok ? 'ok' : 'wrong');
        if (!ok) { allOk = false; state.selection.answer.value = String(q.targetAnswer); }
      }
    }
    else if (q.type === 'full') {
      for (let i = 0; i < q.knownRows.length; i++) {
        const inp = state.selection.knownExprs[i];
        const val = inp.value.trim();
        if (!val) { allFilled = false; continue; }
        const ok = normFormula(val) === normFormula(q.knownRows[i].correct);
        inp.classList.add(ok ? 'ok' : 'wrong');
        if (!ok) { allOk = false; inp.value = q.knownRows[i].correct; }
      }
      const tVal = state.selection.targetExpr.value.trim();
      if (!tVal) allFilled = false;
      else {
        const ok = normFormula(tVal) === normFormula(q.target.expr);
        state.selection.targetExpr.classList.add(ok ? 'ok' : 'wrong');
        if (!ok) { allOk = false; state.selection.targetExpr.value = q.target.expr; }
      }
      const aVal = state.selection.answer.value.trim();
      if (!aVal) allFilled = false;
      else {
        const ok = aVal.replace(/\s/g, '') === String(q.target.answer);
        state.selection.answer.classList.add(ok ? 'ok' : 'wrong');
        if (!ok) { allOk = false; state.selection.answer.value = String(q.target.answer); }
      }
    }

    if (!allFilled) return setFeedback('warn', 'Заполните все поля.');
    isCorrect = allOk;
  }

  state.answered = true;
  if (isCorrect) state.correct++;
  el.checkBtn.hidden = true;
  el.nextBtn.hidden = false;
  updateProgress(true);

  if (isCorrect) setFeedback('success', '✅ Правильно! ' + explainText);
  else setFeedback('error', '❌ Есть ошибки. Правильные значения подсвечены.\n' + explainText);
}

function nextTask() {
  if (!state.answered) return;
  if (state.qIndex + 1 >= state.tasks.length) { showResult(); return; }
  state.qIndex++;
  renderTask();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showResult() {
  const total = state.tasks.length;
  const pct = Math.round((state.correct / total) * 100);
  el.screenQuiz.hidden = true;
  el.screenResult.hidden = false;
  if (pct === 100) { el.finishEmoji.textContent = '🏆'; el.finishTitle.textContent = 'Отлично! Всё верно!'; }
  else if (pct >= 70) { el.finishEmoji.textContent = '🎉'; el.finishTitle.textContent = 'Хороший результат!'; }
  else if (pct >= 40) { el.finishEmoji.textContent = '👍'; el.finishTitle.textContent = 'Неплохо, но есть над чем поработать'; }
  else { el.finishEmoji.textContent = '💪'; el.finishTitle.textContent = 'Стоит повторить тему'; }
  el.finishText.innerHTML = `Правильно выполнено <strong>${state.correct} из ${total}</strong> заданий (${pct}%).`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startOver() {
  state.tasks = generateTasks();
  state.qIndex = 0;
  state.correct = 0;
  state.answered = false;
  el.screenResult.hidden = true;
  el.screenQuiz.hidden = false;
  renderTask();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

el.checkBtn.addEventListener('click', checkAnswer);
el.nextBtn.addEventListener('click', nextTask);
el.retryBtn.addEventListener('click', startOver);
el.backBtn.addEventListener('click', () => history.back());

state.tasks = generateTasks();
renderTask();