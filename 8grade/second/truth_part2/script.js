'use strict';

/* ==========================================================
   1. ОПЕРАЦИИ
   ========================================================== */

const OPS = {
  '¬': { prec: 4, arity: 1 },
  '∧': { prec: 3, arity: 2, assoc: 'left' },
  '∨': { prec: 2, arity: 2, assoc: 'left' },
  '→': { prec: 1, arity: 2, assoc: 'right' },
  '≡': { prec: 0, arity: 2, assoc: 'left' },
};

const BINARY_OPS = ['∧', '∨', '→', '≡'];

/* ==========================================================
   2. УТИЛИТЫ
   ========================================================== */

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomWrongPermutation(n) {
  const arr = [...Array(n).keys()];
  let attempts = 0;
  do {
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    attempts++;
  } while (arr.every((v, i) => v === i) && attempts < 20);
  return arr;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* ==========================================================
   3. AST: генерация, вычисление, отображение
   ========================================================== */

function _tryGenerate(numVars, numOps) {
  const varNames = ['A', 'B', 'C', 'D'].slice(0, numVars);
  let trees = varNames.map(n => ({ type: 'var', name: n }));

  const numBinaries = numVars - 1;
  const numUnaries = numOps - numBinaries;
  if (numUnaries < 0) throw new Error('Слишком мало операций для такого числа переменных');

  const opSequence = shuffleArray([
    ...Array(numBinaries).fill('bin'),
    ...Array(numUnaries).fill('unary')
  ]);

  for (const op of opSequence) {
    if (op === 'bin') {
      let i = Math.floor(Math.random() * trees.length);
      let j;
      do { j = Math.floor(Math.random() * trees.length); } while (j === i);
      const binOp = BINARY_OPS[Math.floor(Math.random() * BINARY_OPS.length)];
      const newTree = { type: 'bin', op: binOp, left: trees[Math.min(i, j)], right: trees[Math.max(i, j)] };
      const [hi, lo] = i > j ? [i, j] : [j, i];
      trees.splice(hi, 1);
      trees.splice(lo, 1);
      trees.push(newTree);
    } else {
      const candidates = trees.map((t, i) => t.type !== 'not' ? i : -1).filter(i => i >= 0);
      const idx = candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : Math.floor(Math.random() * trees.length);
      trees[idx] = { type: 'not', child: trees[idx] };
    }
  }
  return trees[0];
}

function hasDoubleNeg(node) {
  if (!node) return false;
  if (node.type === 'not') {
    if (node.child.type === 'not') return true;
    return hasDoubleNeg(node.child);
  }
  if (node.type === 'bin') {
    return hasDoubleNeg(node.left) || hasDoubleNeg(node.right);
  }
  return false;
}

function generateRandomExpr(numVars, numOps) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const ast = _tryGenerate(numVars, numOps);
    if (!hasDoubleNeg(ast)) {
      return { ast, expr: astToString(ast) };
    }
  }
  // Резервный вариант
  const ast = _tryGenerate(numVars, numOps);
  return { ast, expr: astToString(ast) };
}

function evaluate(node, env) {
  if (node.type === 'var') return env[node.name];
  if (node.type === 'not') return evaluate(node.child, env) ? 0 : 1;
  const l = evaluate(node.left, env);
  const r = evaluate(node.right, env);
  if (node.op === '∧') return (l && r) ? 1 : 0;
  if (node.op === '∨') return (l || r) ? 1 : 0;
  if (node.op === '→') return (!l || r) ? 1 : 0;
  if (node.op === '≡') return (l === r) ? 1 : 0;
  return 0;
}

function collectVars(node, set = new Set()) {
  if (node.type === 'var') set.add(node.name);
  else if (node.type === 'not') collectVars(node.child, set);
  else { collectVars(node.left, set); collectVars(node.right, set); }
  return [...set].sort();
}

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
  if (node.type === 'not') return 4;
  return OPS[node.op].prec;
}

function astToString(node, parentPrec = -1, side = null, parentOp = null) {
  if (node.type === 'var') return node.name;

  if (node.type === 'not') {
    const childP = nodePrec(node.child);
    const inner = astToString(node.child);
    return '¬' + (childP < 4 ? '(' + inner + ')' : inner);
  }

  const p = OPS[node.op].prec;
  const assoc = OPS[node.op].assoc;
  const l = astToString(node.left, p, 'left', node.op);
  const r = astToString(node.right, p, 'right', node.op);
  let s = l + ' ' + node.op + ' ' + r;

  let needParens = false;
  if (p < parentPrec) {
    needParens = true;
  } else if (p === parentPrec && parentOp) {
    const parentAssoc = OPS[parentOp].assoc;
    if (side === 'right' && parentAssoc === 'left') needParens = true;
    if (side === 'left' && parentAssoc === 'right') needParens = true;
  }

  if (needParens) s = '(' + s + ')';
  return s;
}

/* ==========================================================
   4. СПИСОК ЗАДАНИЙ
   ========================================================== */

function makeTasks() {
  const tasks = [];

  /* 5 × 2 переменные / 2 действия */
  for (let i = 0; i < 5; i++) {
    const g = generateRandomExpr(2, 2);
    tasks.push({
      type: 'simple',
      ast: g.ast,
      instruction: 'Заполни таблицу истинности. Обрати внимание на порядок выполнения действий.'
    });
  }

  /* 5 × 2 переменные / 3 действия */
  for (let i = 0; i < 5; i++) {
    const g = generateRandomExpr(2, 3);
    tasks.push({
      type: 'simple',
      ast: g.ast,
      instruction: 'Заполни таблицу истинности. Помни о приоритете операций: ¬ → ∧ → ∨ → → → ≡.'
    });
  }

  /* 5 × 3 переменные / 3 действия */
  for (let i = 0; i < 5; i++) {
    const g = generateRandomExpr(3, 3);
    tasks.push({
      type: 'simple',
      ast: g.ast,
      instruction: 'Заполни таблицу истинности для выражения с тремя переменными.'
    });
  }

  /* 3 × порядок действий (3 действия) */
  for (let i = 0; i < 3; i++) {
    const g = generateRandomExpr(3, 3);
    tasks.push({
      type: 'order',
      ast: g.ast,
      instruction: 'Определи порядок выполнения действий. Перетащи карточки в правильном порядке (сначала действие №1, потом №2 и т.д.).'
    });
  }

  /* 5 × 4 действия: расстановка + решение таблицы */
  for (let i = 0; i < 5; i++) {
    const g = generateRandomExpr(3, 4);
    tasks.push({
      type: 'drag4',
      ast: g.ast,
      instruction: 'Сначала расставь действия в шапке таблицы в правильном порядке (перетаскивай карточки друг на друга или кликни на два столбца для обмена). Затем заполни таблицу истинности.'
    });
  }

  return tasks;
}

const TASKS = makeTasks();

/* ==========================================================
   5. СОСТОЯНИЕ
   ========================================================== */

const state = {
  taskIndex: 0,
  data: null,
  slots: [],
  selectedCard: null,
  selectedSlot: null,
  locked: false,
};

/* ==========================================================
   6. ПОСТРОЕНИЕ ДАННЫХ
   ========================================================== */

function buildData(task) {
  const ast = task.ast;
  const steps = collectSteps(ast);
  const vars = collectVars(ast);
  const rows = generateRows(vars);
  const answers = rows.map(env => steps.map(s => evaluate(s, env)));
  const labels = steps.map(s => astToString(s));
  return { ast, steps, vars, rows, answers, labels };
}

/* ==========================================================
   7. РЕНДЕР
   ========================================================== */

function renderTask() {
  const task = TASKS[state.taskIndex];
  const data = buildData(task);

  state.data = data;
  state.locked = false;
  state.selectedCard = null;
  state.selectedSlot = null;

  updateProgress();

  if (task.type === 'simple') {
    state.slots = [];
    renderSimple(task, data);
  } else if (task.type === 'order') {
    state.slots = new Array(data.steps.length).fill(null);
    renderOrder(task, data);
  } else if (task.type === 'drag4') {
    state.slots = randomWrongPermutation(data.steps.length);
    renderDrag4(task, data);
  }
}

/* ---------- Тип «simple»: заполнение таблицы ---------- */
function renderSimple(task, data) {
  const numbered = data.steps.length > 1;

  let html = '<div class="task">';
  html += `<p class="instruction">${escapeHtml(task.instruction)}</p>`;
  html += `<div class="expr-badge">${escapeHtml(data.labels[data.labels.length - 1])}</div>`;

  html += '<div class="table-wrap"><table class="truth-table"><thead><tr>';
  data.vars.forEach(v => { html += `<th>${v}</th>`; });
  data.steps.forEach((_, i) => {
    html += '<th class="op-col">';
    if (numbered) html += `<span class="step-num">${i + 1}</span>`;
    html += `<span class="op-text">${escapeHtml(data.labels[i])}</span></th>`;
  });
  html += '</tr></thead><tbody>';

  data.rows.forEach((env, r) => {
    html += '<tr>';
    data.vars.forEach(v => { html += `<td class="var-cell">${env[v]}</td>`; });
    data.steps.forEach((_, c) => {
      html += `<td><input class="cell-input" type="text" inputmode="numeric" maxlength="1" autocomplete="off" data-row="${r}" data-col="${c}"></td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  html += '<div class="feedback" id="feedback"></div>';
  html += `<div class="actions">
             <button class="btn btn-primary" id="check-btn">Проверить</button>
             <button class="btn btn-ghost" id="answer-btn" hidden>Посмотреть правильный ответ</button>
             <button class="btn btn-success" id="next-btn" hidden>Далее →</button>
           </div></div>`;

  document.getElementById('task-container').innerHTML = html;
  attachSimpleEvents(data);
}

/* ---------- Тип «order»: указать порядок действий ---------- */
function renderOrder(task, data) {
  let html = '<div class="task">';
  html += `<p class="instruction">${escapeHtml(task.instruction)}</p>`;
  html += `<div class="expr-badge">${escapeHtml(data.labels[data.labels.length - 1])}</div>`;
  html += `<div class="hint">Нажимай карточки или перетаскивай их в пронумерованные ячейки. Нажатие на заполненную ячейку возвращает карточку.</div>`;

  html += '<div class="palette" id="palette">';
  shuffleArray([...data.steps.keys()]).forEach(i => {
    html += `<div class="card" draggable="true" data-step="${i}">${escapeHtml(data.labels[i])}</div>`;
  });
  html += '</div>';

  html += '<div class="order-slots">';
  for (let i = 0; i < data.steps.length; i++) {
    html += `<div class="order-slot" data-slot="${i}">
               <span class="slot-num">${i + 1}</span>
               <span class="slot-content"></span>
             </div>`;
  }
  html += '</div>';

  html += '<div class="feedback" id="feedback"></div>';
  html += `<div class="actions">
             <button class="btn btn-primary" id="check-btn">Проверить</button>
             <button class="btn btn-ghost" id="answer-btn" hidden>Посмотреть правильный ответ</button>
             <button class="btn btn-success" id="next-btn" hidden>Далее →</button>
           </div></div>`;

  document.getElementById('task-container').innerHTML = html;
  attachOrderEvents(data);
  updateOrderSlots();
}

/* ---------- Тип «drag4»: перестановка в шапке + таблица ---------- */
function renderDrag4(task, data) {
  let html = '<div class="task">';
  html += `<p class="instruction">${escapeHtml(task.instruction)}</p>`;
  html += `<div class="expr-badge">${escapeHtml(data.labels[data.labels.length - 1])}</div>`;

  html += '<div class="table-wrap"><table class="truth-table"><thead><tr>';
  data.vars.forEach(v => { html += `<th>${v}</th>`; });
  data.steps.forEach((_, i) => {
    html += `<th class="slot" data-slot="${i}">
               <span class="slot-num">${i + 1}</span>
               <span class="slot-content"></span>
             </th>`;
  });
  html += '</tr></thead><tbody>';

  data.rows.forEach((env, r) => {
    html += '<tr>';
    data.vars.forEach(v => { html += `<td class="var-cell">${env[v]}</td>`; });
    data.steps.forEach((_, c) => {
      html += `<td><input class="cell-input" type="text" inputmode="numeric" maxlength="1" autocomplete="off" data-row="${r}" data-col="${c}"></td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  html += '<div class="feedback" id="feedback"></div>';
  html += `<div class="actions">
             <button class="btn btn-primary" id="check-btn">Проверить</button>
             <button class="btn btn-ghost" id="answer-btn" hidden>Посмотреть правильный ответ</button>
             <button class="btn btn-success" id="next-btn" hidden>Далее →</button>
           </div></div>`;

  document.getElementById('task-container').innerHTML = html;
  attachDrag4Events(data);
  updateDrag4Slots();
}

/* ==========================================================
   8. СОБЫТИЯ
   ========================================================== */

function attachSimpleEvents(data) {
  document.getElementById('check-btn').addEventListener('click', () => checkSimple(data));
  document.getElementById('answer-btn').addEventListener('click', () => showAnswerSimple(data));
  document.getElementById('next-btn').addEventListener('click', nextTask);

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

  document.getElementById('task-container').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !state.locked) {
      const btn = document.getElementById('check-btn');
      if (btn && !btn.hidden) { e.preventDefault(); btn.click(); }
    }
  });
}

function attachOrderEvents(data) {
  document.getElementById('check-btn').addEventListener('click', () => checkOrder(data));
  document.getElementById('answer-btn').addEventListener('click', () => showAnswerOrder(data));
  document.getElementById('next-btn').addEventListener('click', nextTask);

  /* Карточки */
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

  /* Ячейки */
  document.querySelectorAll('.order-slot').forEach(slot => {
    slot.addEventListener('dragover', (e) => {
      if (state.locked) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      slot.classList.add('over');
    });
    slot.addEventListener('dragleave', () => slot.classList.remove('over'));
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('over');
      if (state.locked) return;
      const step = Number(e.dataTransfer.getData('text/plain'));
      if (Number.isNaN(step)) return;
      placeCardInOrderSlot(+slot.dataset.slot, step);
    });

    slot.addEventListener('click', () => {
      if (state.locked) return;
      const i = +slot.dataset.slot;
      if (state.slots[i] !== null) {
        state.slots[i] = null;
        updateOrderSlots();
      } else if (state.selectedCard !== null) {
        placeCardInOrderSlot(i, state.selectedCard);
      }
    });
  });
}

function attachDrag4Events(data) {
  document.getElementById('check-btn').addEventListener('click', () => checkDrag4(data));
  document.getElementById('answer-btn').addEventListener('click', () => showAnswerDrag4(data));
  document.getElementById('next-btn').addEventListener('click', nextTask);

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

  /* Слоты: drag между слотами + click-swap */
  const slots = document.querySelectorAll('.slot');
  slots.forEach(slot => {
    slot.setAttribute('draggable', 'true');
    slot.addEventListener('dragstart', (e) => {
      if (state.locked) { e.preventDefault(); return; }
      e.dataTransfer.setData('text/plain', slot.dataset.slot);
      slot.classList.add('dragging');
    });
    slot.addEventListener('dragend', () => slot.classList.remove('dragging'));

    slot.addEventListener('dragover', (e) => {
      if (state.locked) return;
      e.preventDefault();
      slot.classList.add('over');
    });
    slot.addEventListener('dragleave', () => slot.classList.remove('over'));
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('over');
      if (state.locked) return;
      const src = Number(e.dataTransfer.getData('text/plain'));
      const dst = +slot.dataset.slot;
      if (Number.isNaN(src) || src === dst) return;
      swapSlots(src, dst);
    });

    slot.addEventListener('click', () => {
      if (state.locked) return;
      const i = +slot.dataset.slot;
      if (state.selectedSlot === null) {
        state.selectedSlot = i;
        slots.forEach((s, k) => s.classList.toggle('slot-selected', k === i));
      } else if (state.selectedSlot === i) {
        state.selectedSlot = null;
        slots.forEach(s => s.classList.remove('slot-selected'));
      } else {
        swapSlots(state.selectedSlot, i);
        state.selectedSlot = null;
        slots.forEach(s => s.classList.remove('slot-selected'));
      }
    });
  });

  document.getElementById('task-container').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !state.locked) {
      const btn = document.getElementById('check-btn');
      if (btn && !btn.hidden) { e.preventDefault(); btn.click(); }
    }
  });
}

/* ==========================================================
   9. ОБНОВЛЕНИЕ СЛОТОВ
   ========================================================== */

function placeCardInOrderSlot(slotIndex, stepIndex) {
  const existing = state.slots.indexOf(stepIndex);
  if (existing !== -1) state.slots[existing] = null;
  state.slots[slotIndex] = stepIndex;
  state.selectedCard = null;
  document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
  updateOrderSlots();
}

function updateOrderSlots() {
  document.querySelectorAll('.order-slot').forEach(slot => {
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

function swapSlots(a, b) {
  [state.slots[a], state.slots[b]] = [state.slots[b], state.slots[a]];
  updateDrag4Slots();
}

function updateDrag4Slots() {
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
}

/* ==========================================================
   10. ПРОВЕРКА
   ========================================================== */

function checkSimple(data) {
  if (state.locked) return;

  const inputs = Array.from(document.querySelectorAll('.cell-input'));
  if (inputs.some(inp => inp.value.trim() === '')) {
    setFeedback('Заполни все ячейки значениями 0 или 1.', 'warn');
    return;
  }

  let allCorrect = true;
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

function checkOrder(data) {
  if (state.locked) return;

  if (state.slots.some(s => s === null || s === undefined)) {
    setFeedback('Сначала перетащи все карточки в ячейки.', 'warn');
    return;
  }

  let allCorrect = true;
  document.querySelectorAll('.order-slot').forEach(slot => {
    const i = +slot.dataset.slot;
    const ok = state.slots[i] === i;
    slot.classList.toggle('ok', ok);
    slot.classList.toggle('wrong', !ok);
    if (!ok) allCorrect = false;
  });

  if (allCorrect) {
    setFeedback('Верно! Правильный порядок действий 👍', 'success');
    finishTask();
  } else {
    setFeedback('Неправильный порядок. Попробуй ещё раз или посмотри правильный ответ.', 'error');
    document.getElementById('answer-btn').hidden = false;
  }
}

function checkDrag4(data) {
  if (state.locked) return;

  /* Сначала — порядок */
  const orderOK = state.slots.every((s, i) => s === i);

  document.querySelectorAll('.slot').forEach((slot, i) => {
    slot.classList.toggle('ok', state.slots[i] === i);
    slot.classList.toggle('wrong', state.slots[i] !== i);
  });

  if (!orderOK) {
    setFeedback('Сначала расставь действия в правильном порядке (сейчас порядок неверный).', 'error');
    document.getElementById('answer-btn').hidden = false;
    return;
  }

  /* Потом — значения */
  const inputs = Array.from(document.querySelectorAll('.cell-input'));
  if (inputs.some(inp => inp.value.trim() === '')) {
    setFeedback('Заполни все ячейки значениями 0 или 1.', 'warn');
    return;
  }

  let allValuesOK = true;
  inputs.forEach(inp => {
    const r = +inp.dataset.row;
    const c = +inp.dataset.col;
    const ok = Number(inp.value) === data.answers[r][c];
    inp.classList.toggle('ok', ok);
    inp.classList.toggle('wrong', !ok);
    if (!ok) allValuesOK = false;
  });

  if (allValuesOK) {
    setFeedback('Верно! Отлично 👍', 'success');
    finishTask();
  } else {
    setFeedback('Есть ошибки в значениях. Исправь их или посмотри правильный ответ.', 'error');
    document.getElementById('answer-btn').hidden = false;
  }
}

/* ==========================================================
   11. ПОКАЗ ОТВЕТА
   ========================================================== */

function showAnswerSimple(data) {
  if (state.locked) return;

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

function showAnswerOrder(data) {
  if (state.locked) return;

  state.slots = data.steps.map((_, i) => i);
  updateOrderSlots();
  document.querySelectorAll('.order-slot').forEach(s => s.classList.remove('wrong', 'ok'));

  setFeedback('Правильный порядок показан. Запомни его и двигайся дальше.', 'info');
  finishTask();
}

function showAnswerDrag4(data) {
  if (state.locked) return;

  state.slots = data.steps.map((_, i) => i);
  updateDrag4Slots();
  document.querySelectorAll('.slot').forEach(s => s.classList.remove('wrong', 'ok'));

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

/* ==========================================================
   12. ФИНАЛ
   ========================================================== */

function finishTask() {
  state.locked = true;
  document.querySelectorAll('.cell-input').forEach(inp => { inp.disabled = true; });
  const cb = document.getElementById('check-btn');
  if (cb) cb.hidden = true;
  const ab = document.getElementById('answer-btn');
  if (ab) ab.hidden = true;

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

function renderFinish() {
  document.getElementById('progress-text').textContent = 'Готово!';
  document.getElementById('progress-fill').style.width = '100%';

  document.getElementById('task-container').innerHTML = `
    <div class="task finish">
      <div class="finish-emoji">🎉</div>
      <h2>Все задания пройдены!</h2>
      <p>Ты научился работать со всеми логическими операциями:<br>
      отрицанием, конъюнкцией, дизъюнкцией, импликацией и эквивалентностью.</p>
      <button class="btn btn-primary" id="restart-btn">Пройти заново</button>
    </div>`;

  document.getElementById('restart-btn').addEventListener('click', () => {
    state.taskIndex = 0;
    // Перегенерируем задания для нового прохождения
    TASKS.length = 0;
    makeTasks().forEach(t => TASKS.push(t));
    renderTask();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================================
   13. ВСПОМОГАТЕЛЬНОЕ
   ========================================================== */

function setFeedback(text, type) {
  const el = document.getElementById('feedback');
  if (!el) return;
  el.textContent = text;
  el.className = 'feedback ' + (type || '');
}

function updateProgress() {
  const total = TASKS.length;
  document.getElementById('progress-text').textContent = `Задание ${state.taskIndex + 1} из ${total}`;
  document.getElementById('progress-fill').style.width = `${((state.taskIndex + 1) / total) * 100}%`;
}

/* ==========================================================
   14. СТАРТ
   ========================================================== */

renderTask();