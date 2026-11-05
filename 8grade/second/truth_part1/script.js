'use strict';

/* ==========================================================
   1. ЛОГИКА ВЫРАЖЕНИЙ (парсер + вычисление + печать)
   ========================================================== */

const OPS = {
  '¬': { prec: 3, arity: 1 },
  '∧': { prec: 2, arity: 2 },
  '∨': { prec: 1, arity: 2 },
};

function tokenize(str) {
  const tokens = [];
  let i = 0;
  while (i < str.length) {
    const ch = str[i];
    if (ch === ' ') { i++; continue; }
    if (ch >= 'A' && ch <= 'Z') { tokens.push({ type: 'var', value: ch }); i++; continue; }
    if (OPS[ch]) { tokens.push({ type: 'op', value: ch }); i++; continue; }
    if (ch === '(') { tokens.push({ type: 'lparen' }); i++; continue; }
    if (ch === ')') { tokens.push({ type: 'rparen' }); i++; continue; }
    throw new Error('Неизвестный символ: ' + ch);
  }
  return tokens;
}

function parse(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function parseExpr(minPrec) {
    let left = parseUnary();
    while (true) {
      const t = peek();
      if (!t || t.type !== 'op' || OPS[t.value].arity !== 2) break;
      const p = OPS[t.value].prec;
      if (p < minPrec) break;
      next();
      const right = parseExpr(p + 1);
      left = { type: 'bin', op: t.value, left, right };
    }
    return left;
  }

  function parseUnary() {
    const t = peek();
    if (t && t.type === 'op' && OPS[t.value].arity === 1) {
      next();
      return { type: 'not', child: parseUnary() };
    }
    return parseAtom();
  }

  function parseAtom() {
    const t = next();
    if (!t) throw new Error('Неожиданный конец выражения');
    if (t.type === 'var') return { type: 'var', name: t.value };
    if (t.type === 'lparen') {
      const e = parseExpr(0);
      const r = next();
      if (!r || r.type !== 'rparen') throw new Error('Ожидалась закрывающая скобка');
      return e;
    }
    throw new Error('Неожиданный токен');
  }

  const ast = parseExpr(0);
  if (pos < tokens.length) throw new Error('Лишние символы в выражении');
  return ast;
}

/* Порядок выполнения действий = пост-обход дерева */
function collectSteps(node, steps = []) {
  if (node.type === 'var') return steps;
  if (node.type === 'not') {
    collectSteps(node.child, steps);
    steps.push(node);
  } else {
    collectSteps(node.left, steps);
    collectSteps(node.right, steps);
    steps.push(node);
  }
  return steps;
}

function evaluate(node, env) {
  if (node.type === 'var') return env[node.name];
  if (node.type === 'not') return evaluate(node.child, env) ? 0 : 1;
  const l = evaluate(node.left, env);
  const r = evaluate(node.right, env);
  if (node.op === '∧') return (l && r) ? 1 : 0;
  if (node.op === '∨') return (l || r) ? 1 : 0;
  return 0;
}

function collectVars(node, set = new Set()) {
  if (node.type === 'var') set.add(node.name);
  else if (node.type === 'not') collectVars(node.child, set);
  else { collectVars(node.left, set); collectVars(node.right, set); }
  return [...set].sort();
}

function generateRows(vars) {
  const n = vars.length;
  const rows = [];
  for (let i = 0; i < (1 << n); i++) {
    const env = {};
    vars.forEach((v, j) => { env[v] = (i >> (n - 1 - j)) & 1; });
    rows.push(env);
  }
  return rows;
}

function nodePrec(node) {
  if (node.type === 'var') return 100;
  if (node.type === 'not') return 3;
  return OPS[node.op].prec;
}

function astToString(node, contextPrec = 0, isRightOperand = false) {
  if (node.type === 'var') return node.name;

  if (node.type === 'not') {
    const childP = nodePrec(node.child);
    const inner = astToString(node.child);
    return '¬' + (childP < 3 ? '(' + inner + ')' : inner);
  }

  const p = OPS[node.op].prec;
  const l = astToString(node.left, p, false);
  const r = astToString(node.right, p, true);
  let s = l + ' ' + node.op + ' ' + r;
  if (p < contextPrec || (p === contextPrec && isRightOperand)) s = '(' + s + ')';
  return s;
}

/* ==========================================================
   2. СПИСОК ЗАДАНИЙ
   ========================================================== */

const TASKS = [
  /* --- Одно действие --- */
  { type: 'simple', expr: '¬A',
    instruction: 'Инверсия (отрицание) ¬A меняет значение на противоположное. Заполни столбец результата.' },
  { type: 'simple', expr: '¬B',
    instruction: 'Ещё одна инверсия, теперь для переменной B. Заполни столбец.' },
  { type: 'simple', expr: 'A ∧ B',
    instruction: 'Конъюнкция A ∧ B истинна только тогда, когда оба аргумента равны 1. Заполни столбец.' },
  { type: 'simple', expr: 'B ∧ A',
    instruction: 'Проверь, что порядок не важен: B ∧ A даёт тот же результат, что и A ∧ B.' },
  { type: 'simple', expr: 'A ∨ B',
    instruction: 'Дизъюнкция A ∨ B ложна только тогда, когда оба аргумента равны 0. Заполни столбец.' },
  { type: 'simple', expr: 'B ∨ A',
    instruction: 'B ∨ A — то же самое, что A ∨ B. Заполни столбец.' },

  /* --- Два действия --- */
  { type: 'two', expr: '¬(A ∧ B)',
    instruction: 'Сначала выполняется действие в скобках, затем инверсия. Заполни оба столбца по порядку.' },
  { type: 'two', expr: '¬A ∨ B',
    instruction: 'Сначала инверсия ¬A, затем дизъюнкция. Заполни столбцы.' },
  { type: 'two', expr: 'A ∧ ¬B',
    instruction: 'Сначала инверсия ¬B, затем конъюнкция.' },
  { type: 'two', expr: '¬(A ∨ B)',
    instruction: 'Сначала дизъюнкция в скобках, затем инверсия результата.' },

  /* --- Три действия со скобками --- */
  { type: 'three', expr: '¬(A ∧ B) ∨ C',
    instruction: 'Три действия: конъюнкция в скобках → инверсия → дизъюнкция. Столбцы уже пронумерованы в правильном порядке.' },
  { type: 'three', expr: '(A ∨ B) ∧ ¬C',
    instruction: 'Сначала дизъюнкция в скобках и инверсия ¬C, затем конъюнкция.' },
  { type: 'three', expr: '¬(A ∨ B) ∧ A',
    instruction: 'Дизъюнкция → инверсия → конъюнкция.' },
  { type: 'three', expr: 'A ∨ (¬B ∧ C)',
    instruction: 'Инверсия ¬B → конъюнкция в скобках → дизъюнкция.' },

  /* --- Перетаскивание --- */
  { type: 'drag', expr: '¬(A ∧ B) ∨ A',
    instruction: 'Расставь карточки с действиями в правильном порядке и заполни таблицу.' },
  { type: 'drag', expr: '¬(¬A ∧ B)',
    instruction: 'Определи порядок действий сам: расставь карточки по столбцам и заполни значения.' },
  { type: 'drag', expr: '¬(A ∨ B) ∧ A',
    instruction: 'Последнее задание: расставь действия по порядку и заполни таблицу.' },
];

/* ==========================================================
   3. СОСТОЯНИЕ ПРИЛОЖЕНИЯ
   ========================================================== */

const state = {
  taskIndex: 0,
  data: null,
  slots: [],
  selectedCard: null,
  locked: false,
};

/* ==========================================================
   4. ПОСТРОЕНИЕ ДАННЫХ ЗАДАНИЯ
   ========================================================== */

function buildData(task) {
  const ast = parse(tokenize(task.expr));
  const steps = collectSteps(ast);
  const vars = collectVars(ast);
  const rows = generateRows(vars);
  const answers = rows.map(env => steps.map(s => evaluate(s, env)));

  // Подписи столбцов: последний шаг подписываем исходным выражением (как в задании)
  const labels = steps.map((s, i) =>
    i === steps.length - 1 ? task.expr : astToString(s)
  );

  return { ast, steps, vars, rows, answers, labels };
}

/* ==========================================================
   5. РЕНДЕР
   ========================================================== */

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

function renderTask() {
  const task = TASKS[state.taskIndex];
  const data = buildData(task);

  state.data = data;
  state.locked = false;
  state.selectedCard = null;
  state.slots = task.type === 'drag' ? new Array(data.steps.length).fill(null) : [];

  updateProgress();

  const numbered = data.steps.length > 1;
  const isDrag = task.type === 'drag';
  let html = '<div class="task">';

  html += `<p class="instruction">${escapeHtml(task.instruction)}</p>`;
  html += `<div class="expr-badge">${escapeHtml(task.expr)}</div>`;

  if (isDrag) {
    html += `<div class="hint">Перетащи карточки в заголовки столбцов в порядке выполнения действий.
             На телефоне: нажми на карточку, затем на столбец. Нажатие на заполненный столбец возвращает карточку.</div>`;
    html += '<div class="palette" id="palette">';
    data.steps.forEach((_, i) => {
      html += `<div class="card" draggable="true" data-step="${i}">${escapeHtml(data.labels[i])}</div>`;
    });
    html += '</div>';
  }

  // Таблица
  html += '<div class="table-wrap"><table class="truth-table"><thead><tr>';
  data.vars.forEach(v => { html += `<th>${v}</th>`; });

  data.steps.forEach((_, i) => {
    if (isDrag) {
      html += `<th class="slot" data-slot="${i}">
                 <span class="slot-num">${i + 1}</span>
                 <span class="slot-content"></span>
               </th>`;
    } else {
      html += '<th class="op-col">';
      if (numbered) html += `<span class="step-num">${i + 1}</span>`;
      html += `<span class="op-text">${escapeHtml(data.labels[i])}</span></th>`;
    }
  });

  html += '</tr></thead><tbody>';

  data.rows.forEach((env, r) => {
    html += '<tr>';
    data.vars.forEach(v => { html += `<td class="var-cell">${env[v]}</td>`; });
    data.steps.forEach((_, c) => {
      html += `<td><input class="cell-input" type="text" inputmode="numeric"
                 maxlength="1" autocomplete="off" data-row="${r}" data-col="${c}"></td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  html += '<div class="feedback" id="feedback"></div>';
  html += `<div class="actions">
             <button class="btn btn-primary" id="check-btn">Проверить</button>
             <button class="btn btn-ghost" id="answer-btn" hidden>Посмотреть правильный ответ</button>
             <button class="btn btn-success" id="next-btn" hidden>Далее →</button>
           </div>`;
  html += '</div>';

  document.getElementById('task-container').innerHTML = html;

  attachEvents(isDrag);
  if (isDrag) updateSlots();
}

function attachEvents(isDrag) {
  document.getElementById('check-btn').addEventListener('click', checkAnswer);
  document.getElementById('answer-btn').addEventListener('click', showAnswer);
  document.getElementById('next-btn').addEventListener('click', nextTask);

  // Ввод значений
  const inputs = Array.from(document.querySelectorAll('.cell-input'));
  inputs.forEach((inp, idx) => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/[^01]/g, '').slice(0, 1);
      inp.classList.remove('wrong', 'ok');
      if (inp.value !== '' && idx < inputs.length - 1) inputs[idx + 1].focus();
    });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && inp.value === '' && idx > 0) inputs[idx - 1].focus();
    });
  });

  // Enter — проверить
  document.getElementById('task-container').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !state.locked) {
      const btn = document.getElementById('check-btn');
      if (btn && !btn.hidden) { e.preventDefault(); btn.click(); }
    }
  });

  if (!isDrag) return;

  // Карточки
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('dragstart', (e) => {
      if (state.locked) { e.preventDefault(); return; }
      e.dataTransfer.setData('text/plain', card.dataset.step);
      e.dataTransfer.effectAllowed = 'move';
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));

    card.addEventListener('click', () => {
      if (state.locked) return;
      const step = +card.dataset.step;
      if (state.slots.includes(step)) return;
      state.selectedCard = state.selectedCard === step ? null : step;
      document.querySelectorAll('.card').forEach(c => {
        c.classList.toggle('selected', +c.dataset.step === state.selectedCard);
      });
    });
  });

  // Столбцы
  document.querySelectorAll('.slot').forEach(slot => {
    slot.addEventListener('dragover', (e) => {
      if (state.locked) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      slot.classList.add('over');
    });
    slot.addEventListener('dragleave', (e) => {
      if (!slot.contains(e.relatedTarget)) slot.classList.remove('over');
    });
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('over');
      if (state.locked) return;
      const step = Number(e.dataTransfer.getData('text/plain'));
      if (Number.isNaN(step)) return;
      placeCard(+slot.dataset.slot, step);
    });

    slot.addEventListener('click', () => {
      if (state.locked) return;
      const i = +slot.dataset.slot;
      if (state.slots[i] !== null) {
        state.slots[i] = null;
        updateSlots();
      } else if (state.selectedCard !== null) {
        placeCard(i, state.selectedCard);
      }
    });
  });
}

function placeCard(slotIndex, stepIndex) {
  const existing = state.slots.indexOf(stepIndex);
  if (existing !== -1) state.slots[existing] = null;
  state.slots[slotIndex] = stepIndex;
  state.selectedCard = null;
  updateSlots();
}

function updateSlots() {
  document.querySelectorAll('.slot').forEach(slot => {
    const i = +slot.dataset.slot;
    const step = state.slots[i];
    const content = slot.querySelector('.slot-content');
    slot.classList.remove('wrong', 'ok');
    if (step === null || step === undefined) {
      content.textContent = '';
      slot.classList.remove('filled');
    } else {
      content.textContent = state.data.labels[step];
      slot.classList.add('filled');
    }
  });

  document.querySelectorAll('.card').forEach(card => {
    const used = state.slots.includes(+card.dataset.step);
    card.classList.toggle('used', used);
    card.classList.remove('selected');
  });
}

/* ==========================================================
   6. ПРОВЕРКА
   ========================================================== */

function checkAnswer() {
  if (state.locked) return;

  const task = TASKS[state.taskIndex];
  const data = state.data;
  const inputs = Array.from(document.querySelectorAll('.cell-input'));

  if (task.type === 'drag' && state.slots.some(s => s === null)) {
    setFeedback('Сначала расставь все карточки с действиями по столбцам.', 'warn');
    return;
  }
  if (inputs.some(inp => inp.value.trim() === '')) {
    setFeedback('Заполни все ячейки значениями 0 или 1.', 'warn');
    return;
  }

  let allCorrect = true;

  if (task.type === 'drag') {
    document.querySelectorAll('.slot').forEach(slot => {
      const i = +slot.dataset.slot;
      const ok = state.slots[i] === i;
      slot.classList.toggle('ok', ok);
      slot.classList.toggle('wrong', !ok);
      if (!ok) allCorrect = false;
    });
  }

  inputs.forEach(inp => {
    const r = +inp.dataset.row;
    const c = +inp.dataset.col;
    const ok = Number(inp.value) === data.answers[r][c];
    inp.classList.toggle('ok', ok);
    inp.classList.toggle('wrong', !ok);
    if (!ok) allCorrect = false;
  });

  if (allCorrect) {
    setFeedback('Верно! Отлично 👍', 'success');
    finishTask();
  } else {
    setFeedback('Есть ошибки. Исправь их или посмотри правильный ответ.', 'error');
    document.getElementById('answer-btn').hidden = false;
  }
}

function showAnswer() {
  if (state.locked) return;

  const task = TASKS[state.taskIndex];
  const data = state.data;

  if (task.type === 'drag') {
    state.slots = data.steps.map((_, i) => i);
    updateSlots();
    document.querySelectorAll('.slot').forEach(s => s.classList.remove('wrong', 'ok'));
  }

  document.querySelectorAll('.cell-input').forEach(inp => {
    const r = +inp.dataset.row;
    const c = +inp.dataset.col;
    inp.value = data.answers[r][c];
    inp.classList.remove('wrong', 'ok');
    inp.classList.add('revealed');
  });

  setFeedback('Правильный ответ показан. Запомни его и двигайся дальше.', 'info');
  finishTask();
}

function finishTask() {
  state.locked = true;
  document.querySelectorAll('.cell-input').forEach(inp => { inp.disabled = true; });
  document.getElementById('check-btn').hidden = true;
  document.getElementById('answer-btn').hidden = true;

  const nextBtn = document.getElementById('next-btn');
  nextBtn.hidden = false;
  nextBtn.textContent = state.taskIndex === TASKS.length - 1 ? 'Завершить' : 'Далее →';
}

function nextTask() {
  if (state.taskIndex < TASKS.length - 1) {
    state.taskIndex++;
    renderTask();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    renderFinish();
  }
}

/* ==========================================================
   7. ВСПОМОГАТЕЛЬНОЕ
   ========================================================== */

function setFeedback(text, type) {
  const el = document.getElementById('feedback');
  if (!el) return;
  el.textContent = text;
  el.className = 'feedback ' + (type || '');
}

function updateProgress() {
  const total = TASKS.length;
  document.getElementById('progress-text').textContent =
    `Задание ${state.taskIndex + 1} из ${total}`;
  document.getElementById('progress-fill').style.width =
    `${((state.taskIndex + 1) / total) * 100}%`;
}

function renderFinish() {
  document.getElementById('progress-text').textContent = 'Готово!';
  document.getElementById('progress-fill').style.width = '100%';

  document.getElementById('task-container').innerHTML = `
    <div class="task finish">
      <div class="finish-emoji">🎉</div>
      <h2>Все задания пройдены!</h2>
      <p>Ты разобрался с инверсией, конъюнкцией, дизъюнкцией<br>и порядком выполнения действий.</p>
      <button class="btn btn-primary" id="restart-btn">Пройти заново</button>
    </div>`;

  document.getElementById('restart-btn').addEventListener('click', () => {
    state.taskIndex = 0;
    renderTask();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================================
   8. СТАРТ
   ========================================================== */

renderTask();