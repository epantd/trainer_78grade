'use strict';

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ---------- Нормализация ДНФ ---------- */
function normalizeDNF(str) {
  if (!str) return '';
  let s = String(str).toLowerCase().replace(/\s+/g, '');
  s = s.replace(/[v|]/g, '∨');
  s = s.replace(/&|\^/g, '∧');
  s = s.replace(/[~!]/g, '¬');
  s = s.replace(/-([a-z])/g, '¬$1');
  s = s.replace(/[()]/g, '');
  const terms = s.split('∨').map(t => t.trim()).filter(Boolean);
  const normalizedTerms = terms.map(term => {
    const lits = term.split('∧').map(l => l.replace(/[^a-z¬]/g, '')).filter(Boolean);
    lits.sort();
    return lits.join('∧');
  }).filter(Boolean);
  const uniq = [...new Set(normalizedTerms)];
  uniq.sort();
  return uniq.join('∨');
}

/* ---------- SVG числовой оси с кликабельными промежутками ---------- */
function getNumberLineSVG(a, b, c, d) {
  const pad = Math.max(6, (d - a) * 0.22);
  const xMin = a - pad;
  const xMax = d + pad;
  const span = xMax - xMin;

  const W = 660, H = 280;
  const axisY = 160;
  const xL = 40, xR = 620;
  const xW = xR - xL;
  const toX = v => xL + (v - xMin) / span * xW;

  const pX = toX(a), pW = toX(b) - toX(a);
  const qX = toX(c), qW = toX(d) - toX(c);

  const ticksHtml = [a, c, b, d].map(v => {
    const x = toX(v);
    return `<line x1="${x}" y1="${axisY - 5}" x2="${x}" y2="${axisY + 5}" stroke="#334155" stroke-width="2"/>
            <text x="${x}" y="${axisY + 20}" text-anchor="middle" font-size="13" font-weight="600" fill="#1e293b" font-family="Arial">${v}</text>`;
  }).join('');

  const segPoints = [[xMin, a], [a, c], [c, b], [b, d], [d, xMax]];
  const segTop = axisY + 40;
  const segH = 38;

  const segsHtml = segPoints.map(([s, e], i) => {
    const x1 = toX(s), x2 = toX(e);
    const w = Math.max(4, x2 - x1 - 2);
    return `<rect class="seg-click" data-seg="${i}" x="${x1 + 1}" y="${segTop}" width="${w}" height="${segH}" rx="4"/>`;
  }).join('');

  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:720px;display:block;margin:12px auto;background:#f8fafc;border-radius:10px;padding:8px;">
    <rect x="${pX}" y="40" width="${pW}" height="26" fill="rgba(79,110,247,0.3)" stroke="#4f6ef7" stroke-width="2" rx="3"/>
    <text x="${pX + pW / 2}" y="32" text-anchor="middle" font-size="15" font-weight="bold" fill="#3b57d6" font-family="Arial">P = [${a}; ${b}]</text>

    <rect x="${qX}" y="82" width="${qW}" height="26" fill="rgba(22,163,74,0.3)" stroke="#16a34a" stroke-width="2" rx="3"/>
    <text x="${qX + qW / 2}" y="126" text-anchor="middle" font-size="15" font-weight="bold" fill="#15803d" font-family="Arial">Q = [${c}; ${d}]</text>

    <line x1="${xL}" y1="${axisY}" x2="${xR}" y2="${axisY}" stroke="#334155" stroke-width="2"/>
    <polygon points="${xR},${axisY} ${xR - 8},${axisY - 4} ${xR - 8},${axisY + 4}" fill="#334155"/>
    ${ticksHtml}
    ${segsHtml}
  </svg>`;
}

/* ==========================================================
   ПУЛ ФОРМ ВЫРАЖЕНИЙ
   allowBlock2: false → только в блоке 1 (не нужен визуал)
   ========================================================== */

const EXPRESSION_POOL = [
  /* === INTERSECT (A = P ∩ Q) === */
  {
    expr: '(x ∈ P) → (x ∈ Q → x ∈ A)',
    pForm: 'p → (q → a)',
    dnf: '¬p ∨ ¬q ∨ a',
    aType: 'intersect',
    why: 'Применим A → B = ¬A ∨ B: p → (q → a) = ¬p ∨ (¬q ∨ a) = ¬p ∨ ¬q ∨ a.'
  },
  {
    expr: '((x ∈ P) ∧ (x ∈ Q)) → (x ∈ A)',
    pForm: '(p ∧ q) → a',
    dnf: '¬p ∨ ¬q ∨ a',
    aType: 'intersect',
    why: 'По де Моргану ¬(p ∧ q) = ¬p ∨ ¬q. Получаем: ¬p ∨ ¬q ∨ a.'
  },
  {
    expr: '(x ∈ P) → (((x ∈ Q) ∧ ¬(x ∈ A)) → ¬(x ∈ P))',
    pForm: 'p → ((q ∧ ¬a) → ¬p)',
    dnf: '¬p ∨ ¬q ∨ a',
    aType: 'intersect',
    why: 'Раскроем внутреннюю импликацию: (q ∧ ¬a) → ¬p = (¬q ∨ a) ∨ ¬p. Затем: p → (...) = ¬p ∨ ¬p ∨ ¬q ∨ a = ¬p ∨ ¬q ∨ a.'
  },
  {
    expr: '((x ∈ P) → (x ∈ A)) ∨ ((x ∈ Q) → (x ∈ A))',
    pForm: '(p → a) ∨ (q → a)',
    dnf: '¬p ∨ ¬q ∨ a',
    aType: 'intersect',
    why: 'Раскроем импликации: (¬p ∨ a) ∨ (¬q ∨ a) = ¬p ∨ ¬q ∨ a ∨ a = ¬p ∨ ¬q ∨ a.'
  },

  /* === UNION (A = P ∪ Q) === */
  {
    expr: '((x ∈ P) ∨ (x ∈ Q)) → (x ∈ A)',
    pForm: '(p ∨ q) → a',
    dnf: '¬p ∧ ¬q ∨ a',
    aType: 'union',
    why: 'Раскроем: ¬(p ∨ q) ∨ a = (¬p ∧ ¬q) ∨ a.'
  },
  {
    expr: '((¬(x ∈ P) → (x ∈ Q)) ∧ (¬(x ∈ Q) → (x ∈ P))) → (x ∈ A)',
    pForm: '((¬p → q) ∧ (¬q → p)) → a',
    dnf: '¬p ∧ ¬q ∨ a',
    aType: 'union',
    why: '¬p → q = p ∨ q. ¬q → p = q ∨ p. Их конъюнкция = p ∨ q. Затем (p ∨ q) → a = ¬p ∧ ¬q ∨ a.'
  },

  /* === P_MINUS_Q (A = P \\ Q) === */
  {
    expr: '(x ∈ P) → (¬(x ∈ Q) → (x ∈ A))',
    pForm: 'p → (¬q → a)',
    dnf: '¬p ∨ q ∨ a',
    aType: 'P_minus_Q',
    why: '¬q → a = q ∨ a. Затем p → (q ∨ a) = ¬p ∨ q ∨ a.'
  },
  {
    expr: '((x ∈ P) ∧ ¬(x ∈ Q)) → (x ∈ A)',
    pForm: '(p ∧ ¬q) → a',
    dnf: '¬p ∨ q ∨ a',
    aType: 'P_minus_Q',
    why: 'По де Моргану: ¬(p ∧ ¬q) ∨ a = ¬p ∨ q ∨ a.'
  },
  {
    expr: '((x ∈ P) → (x ∈ Q)) ∨ (x ∈ A)',
    pForm: '(p → q) ∨ a',
    dnf: '¬p ∨ q ∨ a',
    aType: 'P_minus_Q',
    why: 'p → q = ¬p ∨ q. Получаем: (¬p ∨ q) ∨ a = ¬p ∨ q ∨ a.'
  },

  /* === Q_MINUS_P (A = Q \\ P) === */
  {
    expr: '(x ∈ Q) → (¬(x ∈ P) → (x ∈ A))',
    pForm: 'q → (¬p → a)',
    dnf: 'p ∨ ¬q ∨ a',
    aType: 'Q_minus_P',
    why: '¬p → a = p ∨ a. Затем q → (p ∨ a) = ¬q ∨ p ∨ a = p ∨ ¬q ∨ a.'
  },
  {
    expr: '((x ∈ Q) ∧ ¬(x ∈ P)) → (x ∈ A)',
    pForm: '(q ∧ ¬p) → a',
    dnf: 'p ∨ ¬q ∨ a',
    aType: 'Q_minus_P',
    why: 'По де Моргану: ¬(q ∧ ¬p) ∨ a = ¬q ∨ p ∨ a = p ∨ ¬q ∨ a.'
  },
  {
    expr: '((x ∈ Q) → (x ∈ P)) ∨ (x ∈ A)',
    pForm: '(q → p) ∨ a',
    dnf: 'p ∨ ¬q ∨ a',
    aType: 'Q_minus_P',
    why: 'q → p = ¬q ∨ p. Получаем: (¬q ∨ p) ∨ a = p ∨ ¬q ∨ a.'
  },

  /* === ЭКВИВАЛЕНЦИЯ (только блок 1) === */
  {
    expr: '((x ∈ P) ↔ (x ∈ Q)) → (x ∈ A)',
    pForm: '(p ↔ q) → a',
    dnf: '¬p ∧ q ∨ p ∧ ¬q ∨ a',
    why: 'A↔B = (A∧B)∨(¬A∧¬B), поэтому ¬(p↔q) = ¬((p∧q)∨(¬p∧¬q)) = (¬p∨¬q)∧(p∨q) = (¬p∧q)∨(p∧¬q). Значит (p↔q)→a = ¬(p↔q)∨a = (¬p∧q)∨(p∧¬q)∨a.',
    allowBlock2: false
  },
  {
    expr: '¬((x ∈ P) ↔ (x ∈ Q)) → (x ∈ A)',
    pForm: '¬(p ↔ q) → a',
    dnf: 'p ∧ q ∨ ¬p ∧ ¬q ∨ a',
    why: '¬(p↔q) → a = ¬¬(p↔q) ∨ a = (p↔q) ∨ a = ((p∧q)∨(¬p∧¬q)) ∨ a = p∧q ∨ ¬p∧¬q ∨ a.',
    allowBlock2: false
  }
];

/* ==========================================================
   ДЛИНА A, ГРАНИЦЫ, СЕГМЕНТЫ
   ========================================================== */

function computeLength(aType, a, b, c, d) {
  switch (aType) {
    case 'intersect': return b - c;
    case 'union':     return d - a;
    case 'P_minus_Q': return c - a;
    case 'Q_minus_P': return d - b;
  }
}

function getABounds(aType, a, b, c, d) {
  switch (aType) {
    case 'intersect': return [c, b];
    case 'union':     return [a, d];
    case 'P_minus_Q': return [a, c];
    case 'Q_minus_P': return [b, d];
  }
}

/* Возвращает сегменты, которые ученик ДОЛЖЕН закрасить.
   Это дополнение A (где X из ДНФ = X ∨ a уже истинно без a).
   Индексы: 0=(-∞;a), 1=(a;c), 2=(c;b), 3=(b;d), 4=(d;+∞). */
function getCorrectSegments(aType) {
  switch (aType) {
    case 'intersect': return [0, 1, 3, 4]; // A = seg 2
    case 'union':     return [0, 4];       // A = segs 1,2,3
    case 'P_minus_Q': return [0, 2, 3, 4]; // A = seg 1
    case 'Q_minus_P': return [0, 1, 2, 4]; // A = seg 3
  }
}

function getAExplain(aType, a, b, c, d) {
  switch (aType) {
    case 'intersect':
      return `Незакрашенным остался промежуток, где x ∈ P И x ∈ Q одновременно.\nA = P ∩ Q = [${c}; ${b}], длина = ${b - c}.`;
    case 'union':
      return `Незакрашенным остался промежуток, где x ∈ P ИЛИ x ∈ Q.\nA = P ∪ Q = [${a}; ${d}], длина = ${d - a}.`;
    case 'P_minus_Q':
      return `Незакрашенным остался промежуток, где x ∈ P, но x ∉ Q.\nA = P \\ Q = [${a}; ${c}], длина = ${c - a}.`;
    case 'Q_minus_P':
      return `Незакрашенным остался промежуток, где x ∈ Q, но x ∉ P.\nA = Q \\ P = [${b}; ${d}], длина = ${d - b}.`;
  }
}

/* ==========================================================
   ГЕНЕРАЦИЯ ЗАДАНИЙ
   ========================================================== */

function generateBlock1() {
  const equiv = EXPRESSION_POOL.filter(f => f.allowBlock2 === false);
  const basic = EXPRESSION_POOL.filter(f => f.allowBlock2 !== false);
  const nEquiv = Math.min(equiv.length, 2);
  const chosen = [
    ...shuffle(equiv).slice(0, nEquiv),
    ...shuffle(basic).slice(0, 12 - nEquiv)
  ];
  return shuffle(chosen).map(form => ({
    type: 'simplify',
    expression: form.expr,
    pForm: form.pForm,
    dnf: form.dnf,
    why: form.why
  }));
}

function generateBlock2() {
  const pool = shuffle(EXPRESSION_POOL.filter(f => f.allowBlock2 !== false));
  return pool.slice(0, 12).map(form => {
    const a = randInt(10, 40);
    const c = a + randInt(5, 15);
    const b = c + randInt(5, 15);
    const d = b + randInt(5, 15);
    const length = computeLength(form.aType, a, b, c, d);
    const [aStart, aEnd] = getABounds(form.aType, a, b, c, d);

    return {
      type: 'simplify_visualize',
      expression: form.expr,
      pForm: form.pForm,
      dnf: form.dnf,
      aType: form.aType,
      why: form.why,
      intervals: { P: [a, b], Q: [c, d] },
      length,
      aStart,
      aEnd,
      aExplain: getAExplain(form.aType, a, b, c, d)
    };
  });
}

function generateTasks() {
  return [...generateBlock1(), ...generateBlock2()];
}

/* ==========================================================
   СОСТОЯНИЕ
   ========================================================== */

const state = {
  qIndex: 0,
  correct: 0,
  answered: false,
  selection: null,
  tasks: []
};

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

function setFeedback(kind, text) {
  el.feedback.className = 'feedback' + (kind ? ' ' + kind : '');
  el.feedback.innerHTML = text || '';
}

function updateProgress(done) {
  const total = state.tasks.length;
  const d = state.qIndex + (done ? 1 : 0);
  el.progressText.textContent = `Задание ${state.qIndex + 1} из ${total}`;
  el.progressFill.style.width = Math.round((d / total) * 100) + '%';
}

/* ==========================================================
   РЕНДЕР
   ========================================================== */

function renderTask() {
  const q = currentTask();
  state.answered = false;
  state.selection = null;

  el.instruction.innerHTML = q.type === 'simplify'
    ? 'Упростите логическое выражение до ДНФ (дизъюнкции литералов).'
    : 'Упростите выражение до ДНФ, закрасьте нужные промежутки и найдите отрезок A.';

  el.taskBody.innerHTML = '';
  setFeedback('', '');

  el.checkBtn.hidden = false;
  el.checkBtn.disabled = false;
  el.nextBtn.hidden = true;
  el.nextBtn.textContent = (state.qIndex === state.tasks.length - 1) ? 'Завершить ✓' : 'Далее →';
  updateProgress(false);

  if (q.type === 'simplify') renderSimplify(q);
  else renderSimplifyVisualize(q);
}

function renderSimplify(q) {
  let html = '<div class="simplify-box">';
  html += '<div class="label">Дано:</div>';
  html += '<div class="simplify-expr">' + escapeHtml(q.expression) + '</div>';
  html += '<div class="simplify-hint-text">Обозначим: p = (x ∈ P), q = (x ∈ Q), a = (x ∈ A):</div>';
  html += '<div class="simplify-pform">' + escapeHtml(q.pForm) + '</div>';
  html += '</div>';

  html += '<p style="font-size:14px;color:#334155;margin:0 0 10px;">Примените формулы <b>A → B = ¬A ∨ B</b>, <b>¬(A ∧ B) = ¬A ∨ ¬B</b>, <b>¬(A ∨ B) = ¬A ∧ ¬B</b>, <b>A ↔ B = (A ∧ B) ∨ (¬A ∧ ¬B)</b> и получите дизъюнкцию литералов.</p>';
  html += '<div class="input-wrap"><input type="text" class="input-answer" id="dnfInput" placeholder="Например: ¬p ∨ ¬q ∨ a" autocomplete="off"></div>';

  el.taskBody.innerHTML = html;

  const inp = document.getElementById('dnfInput');
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!state.answered) checkAnswer();
      else if (!el.nextBtn.hidden) el.nextBtn.click();
    }
  });

  state.selection = { dnf: inp };
  setTimeout(() => inp.focus(), 100);
}

function renderSimplifyVisualize(q) {
  const [a, b] = q.intervals.P;
  const [c, d] = q.intervals.Q;

  let html = '<div class="intervals-info">';
  html += `<div class="interval-badge p">P = [${a}; ${b}]</div>`;
  html += `<div class="interval-badge q">Q = [${c}; ${d}]</div>`;
  html += '</div>';

  html += '<div class="simplify-box">';
  html += '<div class="label">Выражение:</div>';
  html += '<div class="simplify-expr">' + escapeHtml(q.expression) + '</div>';
  html += '<div class="simplify-hint-text">Обозначим: p = (x ∈ P), q = (x ∈ Q), a = (x ∈ A):</div>';
  html += '<div class="simplify-pform">' + escapeHtml(q.pForm) + '</div>';
  html += '</div>';

  /* Шаг 1: ДНФ */
  html += '<div class="step">';
  html += '<div class="step-title">1️⃣ Упростите выражение до ДНФ.</div>';
  html += '<div class="three-fields"><div class="field"><input type="text" id="dnfInput" placeholder="Например: ¬p ∨ ¬q ∨ a" autocomplete="off"></div></div>';
  html += '</div>';

  /* Шаг 2: закрашивание всего КРОМЕ A */
  html += '<div class="step">';
  html += '<div class="step-title">2️⃣ Закрасьте все промежутки, где <b>выражение истинно и БЕЗ литерала a</b> (та часть ДНФ, что стоит до «∨ a», уже даёт истину). Там отрезок A не нужен. <b>Промежуток, который останется НЕзакрашенным, — это и есть отрезок A.</b></div>';
  html += '<div class="axis-container">' + getNumberLineSVG(a, b, c, d) + '</div>';
  html += '<div class="shade-legend"><span class="shade-swatch"></span> закрашено: a не нужен &nbsp;·&nbsp; <span class="shade-swatch-empty"></span> НЕ закрашено → это A</div>';
  html += '</div>';

  /* Шаг 3: A и длина */
  html += '<div class="step">';
  html += '<div class="step-title">3️⃣ Запишите границы незакрашенного отрезка A и его длину.</div>';
  html += '<div class="three-fields">';
  html += '<div class="field"><label>Начало A</label><input type="text" id="aStartInput" inputmode="numeric" autocomplete="off"></div>';
  html += '<div class="field"><label>Конец A</label><input type="text" id="aEndInput" inputmode="numeric" autocomplete="off"></div>';
  html += '<div class="field"><label>Длина A</label><input type="text" id="lenInput" inputmode="numeric" autocomplete="off"></div>';
  html += '</div>';
  html += '</div>';

  el.taskBody.innerHTML = html;

  const dnfInp = document.getElementById('dnfInput');
  const aStartInp = document.getElementById('aStartInput');
  const aEndInp = document.getElementById('aEndInput');
  const lenInp = document.getElementById('lenInput');

  el.taskBody.querySelectorAll('.seg-click').forEach(seg => {
    seg.addEventListener('click', () => {
      if (state.answered) return;
      seg.classList.toggle('shaded');
    });
  });

  [dnfInp, aStartInp, aEndInp, lenInp].forEach(inp => {
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!state.answered) checkAnswer();
        else if (!el.nextBtn.hidden) el.nextBtn.click();
      }
    });
  });

  state.selection = { dnf: dnfInp, aStart: aStartInp, aEnd: aEndInp, length: lenInp };
  setTimeout(() => dnfInp.focus(), 100);
}

/* ==========================================================
   ПРОВЕРКА
   ========================================================== */

function checkAnswer() {
  if (state.answered) return;
  const q = currentTask();

  if (q.type === 'simplify') checkSimplify(q);
  else if (q.type === 'simplify_visualize') checkSimplifyVisualize(q);
}

function checkSimplify(q) {
  const userDnf = state.selection.dnf.value.trim();
  if (!userDnf) return setFeedback('warn', 'Введите ДНФ.');

  const ok = normalizeDNF(userDnf) === normalizeDNF(q.dnf);
  const inp = state.selection.dnf;
  inp.classList.add(ok ? 'ok' : 'wrong');
  inp.disabled = true;
  if (!ok) inp.value = q.dnf;

  state.answered = true;
  if (ok) state.correct++;
  el.checkBtn.hidden = true;
  el.nextBtn.hidden = false;
  updateProgress(true);

  if (ok) {
    setFeedback('success', '✅ Правильно!\n\n' + q.why);
  } else {
    setFeedback('error', '❌ Неправильно. Правильный ответ: ' + q.dnf + '\n\n' + q.why);
  }
}

function checkSimplifyVisualize(q) {
  const userDnf = state.selection.dnf.value.trim();
  const userStart = state.selection.aStart.value.trim();
  const userEnd = state.selection.aEnd.value.trim();
  const userLen = state.selection.length.value.trim();

  if (!userDnf) return setFeedback('warn', 'Введите ДНФ.');
  if (!userStart) return setFeedback('warn', 'Введите начало A.');
  if (!userEnd) return setFeedback('warn', 'Введите конец A.');
  if (!userLen) return setFeedback('warn', 'Введите длину A.');

  const dnfOk = normalizeDNF(userDnf) === normalizeDNF(q.dnf);
  const startOk = userStart.replace(/\s/g, '') === String(q.aStart);
  const endOk = userEnd.replace(/\s/g, '') === String(q.aEnd);
  const lenOk = userLen.replace(/\s/g, '') === String(q.length);

  /* Проверка закрашивания: должны быть закрашены сегменты-дополнение A */
  const correctSegs = new Set(getCorrectSegments(q.aType));
  const segs = el.taskBody.querySelectorAll('.seg-click');
  let shadeOk = true;
  segs.forEach(seg => {
    const idx = parseInt(seg.getAttribute('data-seg'));
    const isShaded = seg.classList.contains('shaded');
    const shouldShade = correctSegs.has(idx);
    if (isShaded !== shouldShade) shadeOk = false;
  });

  state.selection.dnf.classList.add(dnfOk ? 'ok' : 'wrong');
  state.selection.aStart.classList.add(startOk ? 'ok' : 'wrong');
  state.selection.aEnd.classList.add(endOk ? 'ok' : 'wrong');
  state.selection.length.classList.add(lenOk ? 'ok' : 'wrong');
  state.selection.dnf.disabled = true;
  state.selection.aStart.disabled = true;
  state.selection.aEnd.disabled = true;
  state.selection.length.disabled = true;

  if (!dnfOk) state.selection.dnf.value = q.dnf;
  if (!startOk) state.selection.aStart.value = String(q.aStart);
  if (!endOk) state.selection.aEnd.value = String(q.aEnd);
  if (!lenOk) state.selection.length.value = String(q.length);

  /* Показать правильное закрашивание (и подсветить ошибки) */
  segs.forEach(seg => {
    const idx = parseInt(seg.getAttribute('data-seg'));
    const isShaded = seg.classList.contains('shaded');
    const shouldShade = correctSegs.has(idx);
    if (shouldShade) seg.classList.add('shaded');
    else seg.classList.remove('shaded');
    if (isShaded !== shouldShade) seg.classList.add('wrong');
  });

  const allOk = dnfOk && startOk && endOk && lenOk && shadeOk;
  state.answered = true;
  if (allOk) state.correct++;
  el.checkBtn.hidden = true;
  el.nextBtn.hidden = false;
  updateProgress(true);

  const answer = `ДНФ: ${q.dnf}\nA = [${q.aStart}; ${q.aEnd}], длина = ${q.length}.`;

  if (allOk) {
    setFeedback('success', `✅ Всё верно!\n${answer}\n${q.aExplain}`);
  } else {
    setFeedback('error', `❌ Есть ошибки.\n${answer}\n${q.aExplain}`);
  }
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