/* =========================================================
   ТРЕНАЖЁР 2: Многопроцессорные системы · 10 заданий
   ========================================================= */

const TOTAL_TASKS = 10;
const STEPS_PER_TASK = 7;

const state = {
  currentTask: 1,
  currentStep: 1,
  tableData: [],
  isSplit: false,
  formulas: { E: false, F: false, G: false, H: false },
  sortCol: null,
  sortDir: 'asc',
  filterActive: false,
  filterCol: null,
  filterOp: null,
  filterVal: null,
  task: null,
  selectedCol: null,
};

const el = {
  progressText: document.getElementById('progressText'),
  progressFill: document.getElementById('progressFill'),
  screenQuiz: document.getElementById('screen-quiz'),
  screenResult: document.getElementById('screen-result'),
  instruction: document.getElementById('instruction'),
  theoryBox: document.getElementById('theoryBox'),
  feedback: document.getElementById('feedback'),
  checkBtn: document.getElementById('checkBtn'),
  nextBtn: document.getElementById('nextBtn'),
  calcTable: document.getElementById('calcTable'),
  menuData: document.getElementById('menuData'),
  dropdownData: document.getElementById('dropdownData'),
  btnTextToColumns: document.getElementById('btnTextToColumns'),
  wizardModal: document.getElementById('wizardModal'),
  formulaInputArea: document.getElementById('formulaInputArea'),
  formulaLabel: document.getElementById('formulaLabel'),
  userFormulaInput: document.getElementById('userFormulaInput'),
  formulaHint: document.getElementById('formulaHint'),
  formulaBarDisplay: document.getElementById('formulaBarDisplay'),
  cellRef: document.getElementById('cellRef'),
  statusBarText: document.getElementById('statusBarText'),
  filterModal: document.getElementById('filterModal'),
  filterColName: document.getElementById('filterColName'),
  filterValueSelect: document.getElementById('filterValueSelect'),
  filterOpSelect2: document.getElementById('filterOpSelect2'),
  filterCondValue: document.getElementById('filterCondValue'),
  filterApplyBtn: document.getElementById('filterApplyBtn'),
  filterResetBtn: document.getElementById('filterResetBtn'),
  filterCancelBtn: document.getElementById('filterCancelBtn'),
  filterModalClose: document.getElementById('filterModalClose')
};

/* ---------- Генерация случайных данных ---------- */
function generateRandomData() {
  const n = 8 + Math.floor(Math.random() * 5); // 8–12 процессов
  const data = [];
  for (let i = 1; i <= n; i++) {
    const time = 1 + Math.floor(Math.random() * 7); // длительность 1–7
    let deps = "0";
    if (i > 1) {
      const r = Math.random();
      if (r < 0.2) {
        deps = "0";
      } else if (i >= 3 && r < 0.65) {
        let a = 1 + Math.floor(Math.random() * (i - 1));
        let b;
        do { b = 1 + Math.floor(Math.random() * (i - 1)); } while (b === a);
        deps = Math.min(a, b) + "; " + Math.max(a, b);
      } else {
        const a = 1 + Math.floor(Math.random() * (i - 1));
        deps = String(a);
      }
    }
    data.push({ id: i, time, deps });
  }
  return data;
}

/* ---------- Разбор зависимостей и расчёт времени ---------- */
function getDepIds(deps) {
  const parts = String(deps).split(';').map(s => s.trim()).filter(Boolean);
  const d1 = (parts[0] === '0' || parts[0] === undefined) ? null : parseInt(parts[0]);
  const d2 = parts[1] ? (parts[1] === '0' ? null : parseInt(parts[1])) : null;
  return { d1, d2 };
}

function computeEndTime(id, cache) {
  if (!id) return 0;
  if (cache[id] !== undefined) return cache[id];
  const row = state.tableData.find(r => r.id === id);
  if (!row) { cache[id] = 0; return 0; }
  const { d1, d2 } = getDepIds(row.deps);
  const e1 = computeEndTime(d1, cache);
  const e2 = computeEndTime(d2, cache);
  const result = row.time + Math.max(e1, e2);
  cache[id] = result;
  return result;
}

function getConvergedValue(row, col, cache) {
  if (col === 'B') return row.time;
  const h = computeEndTime(row.id, cache);
  if (col === 'H') return h;
  if (col === 'G') return h - row.time + 1;
  return null;
}

/* ---------- Значение строки по букве столбца (B/G/H) ---------- */
// Используется сортировкой и фильтром, чтобы не путать 'B' с полем time.
function getRowValue(row, col) {
  const map = { B: 'time', G: 'g', H: 'h' };
  const prop = map[col];
  return prop ? row[prop] : undefined;
}

/* ---------- Генерация задания (сортировка + фильтр) ---------- */
function generateTask(data) {
  const n = data.length;
  const cache = {};
  const cols = ['B', 'G', 'H'];
  const sortCol = cols[Math.floor(Math.random() * 3)];
  const sortDir = Math.random() < 0.5 ? 'asc' : 'desc';
  const vals = data.map(r => getConvergedValue(r, sortCol, cache)).sort((a, b) => a - b);
  const sortAnswer = sortDir === 'asc' ? vals[0] : vals[n - 1];

  const filterCol = cols[Math.floor(Math.random() * 3)];
  const ops = ['<=', '>=', '<', '>'];
  const filterOp = ops[Math.floor(Math.random() * ops.length)];
  const fVals = data.map(r => getConvergedValue(r, filterCol, cache)).sort((a, b) => a - b);
  const idx = Math.floor(n * (0.25 + Math.random() * 0.5));
  const filterVal = fVals[idx];
  const filterCount = data.filter(r => {
    const v = getConvergedValue(r, filterCol, cache);
    switch (filterOp) {
      case '<=': return v <= filterVal;
      case '>=': return v >= filterVal;
      case '<': return v < filterVal;
      case '>': return v > filterVal;
    }
  }).length;

  return { sortCol, sortDir, sortAnswer, filterCol, filterOp, filterVal, filterCount };
}

/* ---------- Рендер таблицы ---------- */
function renderTable() {
  const cache = {};
  let rows = state.tableData.map((row, idx) => {
    const { d1, d2 } = getDepIds(row.deps);
    const hWritten = state.formulas.H;
    let e = null, f = null, g = null, h = null;

    if (state.formulas.E) e = hWritten ? computeEndTime(d1, cache) : 0;
    if (state.formulas.F) f = hWritten ? computeEndTime(d2, cache) : 0;
    if (hWritten) {
      const eV = e !== null ? e : 0;
      const fV = f !== null ? f : 0;
      h = row.time + Math.max(eV, fV);
    }
    if (state.formulas.G && h !== null) g = h - row.time + 1;

    return { ...row, e, f, g, h, originalIndex: idx };
  });

  if (state.filterActive && state.filterCol && state.filterOp && state.filterVal !== null) {
    rows = rows.filter(r => {
      const v = getRowValue(r, state.filterCol);
      if (v === null || v === undefined) return false;
      const num = Number(v), target = Number(state.filterVal);
      switch (state.filterOp) {
        case '<=': return num <= target;
        case '>=': return num >= target;
        case '=': return num === target;
        case '<': return num < target;
        case '>': return num > target;
      }
      return true;
    });
  }

  if (state.sortCol) {
    rows.sort((a, b) => {
      const va = getRowValue(a, state.sortCol);
      const vb = getRowValue(b, state.sortCol);
      if (va === null || va === undefined) return 1;
      if (vb === null || vb === undefined) return -1;
      return state.sortDir === 'asc' ? va - vb : vb - va;
    });
  }

  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  let html = '<thead><tr><th></th>';
  cols.forEach(col => {
    let cls = '';
    if (state.selectedCol === col && state.currentStep === 1) cls += ' active-col';
    if (state.sortCol === col) cls += state.sortDir === 'asc' ? ' sort-asc' : ' sort-desc';
    html += `<th class="${cls.trim()}" data-col="${col}">${col}</th>`;
  });
  html += '</tr></thead><tbody>';

  html += '<tr><td style="background:#f0f0f0;font-weight:bold;">1</td>';
  html += '<td>ID</td><td>Время</td><td>ID1</td><td>ID2</td><td>Оконч.1</td><td>Оконч.2</td><td>Начало</td><td>Конец</td></tr>';

  rows.forEach((row, idx) => {
    html += `<tr><td style="background:#f0f0f0;font-weight:bold;">${idx + 2}</td>`;
    html += `<td>${row.id}</td><td>${row.time}</td>`;
    if (state.isSplit) {
      const parts = row.deps.split(';').map(s => s.trim());
      html += `<td>${parts[0]}</td><td>${parts[1] || ''}</td>`;
    } else {
      html += `<td>${row.deps}</td><td></td>`;
    }
    html += `<td style="color:var(--accent-dark);font-weight:bold;">${row.e !== null ? row.e : ''}</td>`;
    html += `<td style="color:var(--accent-dark);font-weight:bold;">${row.f !== null ? row.f : ''}</td>`;
    html += `<td style="color:var(--green);font-weight:bold;">${row.g !== null ? row.g : ''}</td>`;
    html += `<td style="color:var(--red);font-weight:bold;">${row.h !== null ? row.h : ''}</td>`;
    html += '</tr>';
  });

  for (let i = rows.length + 2; i <= 15; i++) {
    html += `<tr><td style="background:#f0f0f0;font-weight:bold;">${i}</td>${'<td></td>'.repeat(8)}</tr>`;
  }
  html += '</tbody>';
  el.calcTable.innerHTML = html;

  el.statusBarText.textContent = state.filterActive
    ? `Показано ${rows.length} из ${state.tableData.length} строк (фильтр активен)`
    : `Строк: ${rows.length}`;

  el.calcTable.querySelectorAll('th').forEach(th => {
    if (!th.dataset.col) return;
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (state.currentStep === 1) {
        state.selectedCol = col;
        el.cellRef.textContent = col + '1';
        renderTable();
      } else if (state.currentStep === 6 && ['B', 'G', 'H'].includes(col)) {
        if (state.sortCol === col) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        else { state.sortCol = col; state.sortDir = 'asc'; }
        renderTable();
      } else if (state.currentStep === 7 && ['B', 'G', 'H'].includes(col)) {
        openFilterModal(col);
      }
    });
  });
}

/* ---------- Инструкции ---------- */
function getInstruction() {
  const s = state.currentStep, t = state.task, taskNum = state.currentTask;
  if (s === 1) return `Задание ${taskNum}. Разделите столбец C через «Данные → Текст по столбцам», разделитель «;».`;
  if (s === 2) return `Задание ${taskNum}. Введите формулу для E2 — время окончания первой зависимости.`;
  if (s === 3) return `Задание ${taskNum}. Введите формулу для F2 — время окончания второй зависимости.`;
  if (s === 4) return `Задание ${taskNum}. Введите формулу для H2 — время окончания процесса.`;
  if (s === 5) return `Задание ${taskNum}. Введите формулу для G2 — время начала процесса.`;
  if (s === 6) {
    const dir = t.sortDir === 'asc' ? 'по возрастанию (один клик)' : 'по убыванию (два клика)';
    const metric = t.sortDir === 'asc' ? 'минимальное' : 'максимальное';
    return `Задание ${taskNum}. Кликните на заголовок ${t.sortCol} ${dir}. Введите ${metric} значение из столбца ${t.sortCol}.`;
  }
  if (s === 7) {
    const opStr = { '<=': '≤', '>=': '≥', '<': '<', '>': '>' }[t.filterOp];
    return `Задание ${taskNum}. Кликните на заголовок ${t.filterCol} → «По условию» → «${opStr}» → ${t.filterVal} → «Применить». Сколько строк осталось?`;
  }
  return '';
}

function getTheory() {
  if (state.currentTask > 2) return null;
  const s = state.currentStep;
  const stretch = `<div class="warn-block">💡 Формула вводится для первой строки данных. В тренажёре она автоматически «растянется» на весь столбец.</div>`;
  const blocks = {
    2: `<p><b>Столбец E — время окончания первой зависимости</b></p>
      <p>Вам нужно найти в таблице строку, у которой ID совпадает со значением первой зависимости процесса, и взять из этой строки время окончания процесса.</p>
      <p>Для поиска по ID используйте функцию <b>ВПР</b>. Если зависимости нет (ID = 0), в результате должен быть 0 — обработайте это через <b>ЕСЛИОШИБКА</b>.</p>
      <p>⚠️ Пока не заполнен столбец H, ВПР возвращает 0 — это нормально: искомые значения ещё не вычислены.</p>${stretch}`,
    3: `<p><b>Столбец F — время окончания второй зависимости</b></p>
      <p>Приём тот же, что и для столбца E, но искать нужно ID уже из второй зависимости (столбец D).</p>${stretch}`,
    4: `<p><b>Столбец H — время окончания процесса</b></p>
      <p>Время окончания процесса складывается из его длительности и наибольшего из двух времён окончания его зависимостей.</p>${stretch}`,
    5: `<p><b>Столбец G — время начала процесса</b></p>
      <p>Процесс занимает процессор в течение своей длительности и завершается в момент, указанный в столбце H. Используйте эти два значения для вычисления времени начала.</p>${stretch}`
  };
  return blocks[s] || '';
}

function getFormulaLabel() {
  const s = state.currentStep;
  if (s === 2) return 'Введите формулу для E2:';
  if (s === 3) return 'Введите формулу для F2:';
  if (s === 4) return 'Введите формулу для H2:';
  if (s === 5) return 'Введите формулу для G2:';
  if (s === 6) return `Введите ${state.task.sortDir === 'asc' ? 'минимальное' : 'максимальное'} значение из столбца ${state.task.sortCol}:`;
  if (s === 7) return 'Введите количество оставшихся строк:';
  return '';
}

function getFormulaHint() {
  if (state.currentTask > 2) return '';
  const s = state.currentStep;
  const h = {
    2: '💡 Для поиска нужного ID используйте ВПР. Отсутствие зависимости (ID = 0) обработайте через ЕСЛИОШИБКА.',
    3: '💡 Используйте тот же приём, что и в E, но ищите уже вторую зависимость.',
    4: '💡 Сначала найдите большее из двух времён окончания зависимостей, затем прибавьте к нему длительность.',
    5: '💡 От времени окончания нужно получить момент старта. Помните, что моменты времени в задаче нумеруются с 1.'
  };
  return h[s] || '';
}

/* ---------- Нормализация и проверка формул ---------- */
function normalizeFormula(f) {
  if (!f) return '';
  let s = String(f).trim();
  if (s.startsWith('=')) s = s.slice(1);
  s = s.toUpperCase().replace(/\s+/g, '').replace(/,/g, ';');
  s = s.replace(/ВПР/g, 'VLOOKUP').replace(/ЕСЛИОШИБКА/g, 'IFERROR').replace(/МАКС/g, 'MAX');
  s = s.replace(/ЛОЖЬ/g, 'FALSE').replace(/;FALSE/g, ';0');
  const cyr = { 'А': 'A', 'В': 'B', 'С': 'C', 'Д': 'D', 'Е': 'E', 'Н': 'H', 'О': 'O', 'Р': 'P', 'М': 'M', 'Т': 'T', 'Х': 'X' };
  s = s.replace(/([А-ЯЁ])(\$?)(\d+)/g, (m, p1, p2, p3) => cyr[p1.toUpperCase()] ? cyr[p1.toUpperCase()] + p2 + p3 : m);
  s = s.replace(/\$([А-ЯЁ]):\$([А-ЯЁ])/g, (m, p1, p2) => '$' + (cyr[p1.toUpperCase()] || p1) + ':$' + (cyr[p2.toUpperCase()] || p2));
  s = s.replace(/\$/g, '');
  return s;
}

function checkFormula(step, input) {
  const n = normalizeFormula(input);
  const expected = {
    E: normalizeFormula('=IFERROR(VLOOKUP(C2;$A:$H;8;0);0)'),
    F: normalizeFormula('=IFERROR(VLOOKUP(D2;$A:$H;8;0);0)'),
    H: [normalizeFormula('=B2+MAX(E2:F2)'), normalizeFormula('=MAX(E2:F2)+B2')],
    G: [normalizeFormula('=H2-B2+1'), normalizeFormula('=H2+1-B2')]
  };
  if (step === 'H' || step === 'G') return expected[step].some(e => e === n);
  return expected[step] === n;
}

function getWrongHint(step) {
  if (state.currentTask > 2) return 'Проверьте формулу или ответ и попробуйте снова.';
  const hints = {
    2: 'Используйте ВПР для поиска по ID. Обработайте отсутствие зависимости через ЕСЛИОШИБКА.',
    3: 'Аналогично E, но искать нужно ID из второй зависимости (столбец D), а не из первой.',
    4: 'Проверьте, что складываете длительность с максимумом из двух времён окончания зависимостей.',
    5: 'Проверьте порядок операций: конец, длительность и поправка на нумерацию моментов времени.'
  };
  return hints[step] || 'Проверьте ответ.';
}

/* ---------- UI helpers ---------- */
function setFeedback(type, text) {
  el.feedback.innerHTML = text;
  el.feedback.className = 'feedback ' + (type || '');
}

function showNextButton() {
  el.checkBtn.hidden = true;
  el.nextBtn.hidden = false;
}

function resetStepUI() {
  state.sortCol = null;
  state.sortDir = 'asc';
  state.filterActive = false;
  state.filterCol = null;
  state.filterOp = null;
  state.filterVal = null;
  el.userFormulaInput.value = '';
  el.userFormulaInput.disabled = false;
  el.userFormulaInput.classList.remove('ok', 'wrong');
  el.userFormulaInput.oninput = null;
  el.formulaBarDisplay.value = '';
  setFeedback('', '');
  el.checkBtn.hidden = false;
  el.nextBtn.hidden = true;
  el.filterModal.hidden = true;
}

function updateProgress() {
  const done = (state.currentTask - 1) * STEPS_PER_TASK + (state.currentStep - 1);
  const pct = (done / (TOTAL_TASKS * STEPS_PER_TASK)) * 100;
  el.progressFill.style.width = pct + '%';
  el.progressText.textContent = `Задание ${state.currentTask} из ${TOTAL_TASKS} · Шаг ${state.currentStep} из ${STEPS_PER_TASK}`;
}

/* ---------- Обновление UI при смене шага ---------- */
function updateUI() {
  el.instruction.textContent = getInstruction();
  updateProgress();

  const s = state.currentStep;
  const isFormula = s >= 2 && s <= 5;
  const isAnswer = s === 6 || s === 7;

  el.formulaInputArea.hidden = s === 1;
  el.theoryBox.hidden = s === 1;
  el.userFormulaInput.disabled = false;
  el.userFormulaInput.classList.remove('ok', 'wrong');
  el.userFormulaInput.value = '';
  el.userFormulaInput.oninput = null;

  if (s === 1) {
    el.formulaInputArea.hidden = true;
  } else {
    el.formulaLabel.textContent = getFormulaLabel();
    const theory = getTheory();
    if (theory) { el.theoryBox.innerHTML = theory; el.theoryBox.hidden = false; }
    else { el.theoryBox.hidden = true; }
    el.formulaHint.innerHTML = getFormulaHint();
    el.formulaHint.hidden = !getFormulaHint();

    if (isFormula) {
      const key = ['', '', 'E', 'F', 'H', 'G'][s];
      el.userFormulaInput.placeholder = '=...';
      el.userFormulaInput.style.fontFamily = 'monospace';
      el.userFormulaInput.style.textTransform = 'uppercase';
      if (!state.formulas[key]) {
        el.userFormulaInput.oninput = () => {
          if (checkFormula(key, el.userFormulaInput.value)) {
            state.formulas[key] = true;
            renderTable();
            el.userFormulaInput.classList.add('ok');
            el.userFormulaInput.disabled = true;
            setFeedback('success', `✅ Формула верна! Столбец ${key} заполнен. Нажмите «Далее».`);
            showNextButton();
          } else {
            el.userFormulaInput.classList.remove('ok');
          }
        };
      } else {
        el.userFormulaInput.value = '';
        el.userFormulaInput.disabled = true;
        el.userFormulaInput.classList.add('ok');
        showNextButton();
      }
    } else if (isAnswer) {
      el.userFormulaInput.placeholder = 'Число';
      el.userFormulaInput.style.fontFamily = 'inherit';
      el.userFormulaInput.style.textTransform = 'none';
    }
  }
  renderTable();
}

/* ---------- Основной цикл ---------- */
function startNewTask() {
  state.tableData = generateRandomData();
  state.isSplit = false;
  state.formulas = { E: false, F: false, G: false, H: false };
  state.currentStep = 1;
  state.selectedCol = null;
  state.task = generateTask(state.tableData);
  resetStepUI();
  updateUI();
}

function handleNext() {
  if (state.currentStep < STEPS_PER_TASK) {
    state.currentStep++;
    resetStepUI();
    updateUI();
  } else {
    if (state.currentTask < TOTAL_TASKS) {
      state.currentTask++;
      startNewTask();
    } else {
      showResult();
    }
  }
}

function handleCheck() {
  const s = state.currentStep;

  if (s === 1) {
    if (state.isSplit) {
      setFeedback('success', '✅ Данные разделены! Нажмите «Далее».');
      showNextButton();
    } else {
      setFeedback('warn', 'Сначала разделите данные: выделите столбец C и используйте «Данные → Текст по столбцам».');
    }
    return;
  }

  if (s >= 2 && s <= 5) {
    const key = ['', '', 'E', 'F', 'H', 'G'][s];
    if (el.userFormulaInput.disabled) return;
    const input = el.userFormulaInput.value;
    if (!input.trim()) { setFeedback('warn', 'Введите формулу.'); return; }
    if (checkFormula(key, input)) {
      state.formulas[key] = true;
      renderTable();
      el.userFormulaInput.classList.add('ok');
      el.userFormulaInput.disabled = true;
      setFeedback('success', `✅ Формула верна! Столбец ${key} заполнен. Нажмите «Далее».`);
      showNextButton();
    } else {
      el.userFormulaInput.classList.add('wrong');
      setFeedback('error', `❌ Неверно. ${getWrongHint(s)}`);
    }
    return;
  }

  if (s === 6) {
    const val = el.userFormulaInput.value.trim();
    if (!val) { setFeedback('warn', 'Введите число.'); return; }
    if (state.sortCol !== state.task.sortCol) {
      setFeedback('warn', `Сначала отсортируйте по столбцу ${state.task.sortCol}.`);
      return;
    }
    if (parseInt(val, 10) === state.task.sortAnswer) {
      el.userFormulaInput.classList.add('ok');
      el.userFormulaInput.disabled = true;
      setFeedback('success', '✅ Верно! Нажмите «Далее».');
      showNextButton();
    } else {
      el.userFormulaInput.classList.add('wrong');
      setFeedback('error', '❌ Неверно. Убедитесь, что сортировка по нужному столбцу и направлению, и возьмите верхнее значение.');
    }
    return;
  }

  if (s === 7) {
    const val = el.userFormulaInput.value.trim();
    if (!val) { setFeedback('warn', 'Введите число.'); return; }
    const t = state.task;
    if (!state.filterActive || state.filterCol !== t.filterCol || state.filterOp !== t.filterOp || state.filterVal !== t.filterVal) {
      const opStr = { '<=': '≤', '>=': '≥', '<': '<', '>': '>' }[t.filterOp];
      setFeedback('warn', `Сначала примените фильтр: столбец ${t.filterCol}, условие «${opStr} ${t.filterVal}».`);
      return;
    }
    if (parseInt(val, 10) === t.filterCount) {
      el.userFormulaInput.classList.add('ok');
      el.userFormulaInput.disabled = true;
      setFeedback('success', '✅ Верно! Нажмите «Далее».');
      showNextButton();
    } else {
      el.userFormulaInput.classList.add('wrong');
      setFeedback('error', '❌ Неверно. Посмотрите на статусную строку под таблицей — сколько строк показано?');
    }
  }
}

function showResult() {
  el.screenQuiz.hidden = true;
  el.screenResult.hidden = false;
  document.getElementById('finishText').innerHTML = `Вы прошли все ${TOTAL_TASKS} заданий!<br><br>Теперь вы умеете:<br>• разделять данные по столбцам,<br>• использовать ВПР для зависимостей,<br>• вычислять начало и конец процессов,<br>• применять сортировку и фильтры.<br><br>Готовы к заданию 22 ЕГЭ!`;
}

/* ---------- Мастер «Текст по столбцам» ---------- */
el.menuData.addEventListener('click', (e) => {
  e.stopPropagation();
  if (state.currentStep === 1 && state.selectedCol === 'C') {
    el.dropdownData.hidden = !el.dropdownData.hidden;
  } else if (state.currentStep === 1) {
    setFeedback('warn', 'Сначала выделите столбец C (кликните по букве C).');
  }
});
document.addEventListener('click', () => { el.dropdownData.hidden = true; });

el.btnTextToColumns.addEventListener('click', (e) => {
  e.stopPropagation();
  el.dropdownData.hidden = true;
  if (state.currentStep !== 1) return;
  if (state.selectedCol !== 'C') {
    setFeedback('warn', 'Выделите столбец C.');
    return;
  }
  openWizard();
});

function openWizard() {
  el.wizardModal.hidden = false;
  document.getElementById('step1').hidden = false;
  document.getElementById('step2').hidden = true;
  document.getElementById('step3').hidden = true;
  document.getElementById('wizardBack').hidden = true;
  document.getElementById('wizardNext').hidden = false;
  document.getElementById('wizardFinish').hidden = true;
}
function closeWizard() { el.wizardModal.hidden = true; }

document.getElementById('wizardCancel').addEventListener('click', closeWizard);
document.getElementById('wizardNext').addEventListener('click', () => {
  const s1 = document.getElementById('step1');
  const s2 = document.getElementById('step2');
  if (!s1.hidden) {
    if (document.querySelector('input[name="format"]:checked').value !== 'delimited') {
      alert('Выберите «С разделителями».'); return;
    }
    s1.hidden = true; s2.hidden = false;
    document.getElementById('wizardBack').hidden = false;
  } else if (!s2.hidden) {
    if (!document.getElementById('delimSemicolon').checked) {
      alert('Выберите разделитель «Точка с запятой».'); return;
    }
    s2.hidden = true;
    document.getElementById('step3').hidden = false;
    document.getElementById('wizardNext').hidden = true;
    document.getElementById('wizardFinish').hidden = false;
  }
});
document.getElementById('wizardBack').addEventListener('click', () => {
  document.getElementById('step1').hidden = false;
  document.getElementById('step2').hidden = true;
  document.getElementById('step3').hidden = true;
  document.getElementById('wizardBack').hidden = true;
  document.getElementById('wizardNext').hidden = false;
  document.getElementById('wizardFinish').hidden = true;
});
document.getElementById('wizardFinish').addEventListener('click', () => {
  closeWizard();
  state.isSplit = true;
  renderTable();
  setFeedback('success', '✅ Данные разделены! Нажмите «Далее».');
  showNextButton();
});

/* ---------- Модальное окно фильтра ---------- */
function openFilterModal(col) {
  const colNames = { B: 'B (Время)', G: 'G (Начало)', H: 'H (Конец)' };
  el.filterColName.textContent = colNames[col] || col;
  el.filterModal.dataset.col = col;

  const values = new Set();
  state.tableData.forEach(r => {
    const h = computeEndTime(r.id, {});
    const v = col === 'B' ? r.time : col === 'H' ? h : h - r.time + 1;
    values.add(v);
  });
  const sorted = [...values].sort((a, b) => a - b);
  el.filterValueSelect.innerHTML = sorted.map(v => `<option value="${v}">${v}</option>`).join('');

  document.querySelectorAll('input[name="filterMode"]').forEach(r => r.checked = false);
  document.querySelector('input[name="filterMode"][value="all"]').checked = true;
  document.querySelector('.filter-value-row').hidden = true;
  document.querySelector('.filter-condition-row').hidden = true;
  el.filterCondValue.value = '';
  el.filterModal.hidden = false;
}
function closeFilterModal() { el.filterModal.hidden = true; }

document.querySelectorAll('input[name="filterMode"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const mode = document.querySelector('input[name="filterMode"]:checked').value;
    document.querySelector('.filter-value-row').hidden = mode !== 'value';
    document.querySelector('.filter-condition-row').hidden = mode !== 'condition';
  });
});

el.filterApplyBtn.addEventListener('click', () => {
  const col = el.filterModal.dataset.col;
  const mode = document.querySelector('input[name="filterMode"]:checked').value;

  if (mode === 'all') {
    if (state.filterCol === col) {
      state.filterActive = false; state.filterCol = null; state.filterOp = null; state.filterVal = null;
    }
    closeFilterModal(); renderTable(); return;
  }
  if (mode === 'value') {
    const val = el.filterValueSelect.value;
    if (val === '') { setFeedback('warn', 'Выберите значение.'); return; }
    state.filterCol = col; state.filterOp = '='; state.filterVal = Number(val);
    state.filterActive = true; closeFilterModal(); renderTable(); return;
  }
  if (mode === 'condition') {
    const op = el.filterOpSelect2.value;
    const val = el.filterCondValue.value.trim();
    if (val === '') { setFeedback('warn', 'Введите число.'); return; }
    state.filterCol = col; state.filterOp = op; state.filterVal = Number(val);
    state.filterActive = true; closeFilterModal(); renderTable();
  }
});

el.filterResetBtn.addEventListener('click', () => {
  state.filterActive = false; state.filterCol = null; state.filterOp = null; state.filterVal = null;
  closeFilterModal(); renderTable();
});
el.filterCancelBtn.addEventListener('click', closeFilterModal);
el.filterModalClose.addEventListener('click', closeFilterModal);

/* ---------- Кнопки ---------- */
el.checkBtn.addEventListener('click', handleCheck);
el.nextBtn.addEventListener('click', handleNext);

document.getElementById('retryBtn').addEventListener('click', () => {
  state.currentTask = 1;
  el.screenQuiz.hidden = false;
  el.screenResult.hidden = true;
  startNewTask();
});
document.getElementById('helpBtn').addEventListener('click', () => { document.getElementById('helpModal').hidden = false; });
document.getElementById('closeHelpBtn').addEventListener('click', () => { document.getElementById('helpModal').hidden = true; });

/* ---------- Старт ---------- */
startNewTask();