/* =========================================================
   ТРЕНАЖЁР: Многопроцессорные системы (Полный цикл)
   ========================================================= */

const INITIAL_DATA = [
  { id: 1, time: 4, deps: "0" },
  { id: 2, time: 3, deps: "0" },
  { id: 3, time: 1, deps: "1; 2" },
  { id: 4, time: 7, deps: "3" },
  { id: 5, time: 6, deps: "3" },
  { id: 6, time: 3, deps: "5" },
  { id: 7, time: 1, deps: "4; 6" },
  { id: 8, time: 2, deps: "7" },
  { id: 9, time: 7, deps: "0" },
  { id: 10, time: 8, deps: "0" },
  { id: 11, time: 6, deps: "9" },
  { id: 12, time: 6, deps: "10" }
];

const PRACTICE_DATA = [
  { id: 1, time: 2, deps: "0" },
  { id: 2, time: 5, deps: "1" },
  { id: 3, time: 3, deps: "2; 1" },
  { id: 4, time: 4, deps: "3" },
  { id: 5, time: 6, deps: "4; 2" },
  { id: 6, time: 1, deps: "5" }
];

const state = {
  currentStep: 1,
  tableData: [], 
  selectedCol: null,
  wizardStep: 1,
  isSplit: false,
  calculatedCols: { E: false, F: false, G: false, H: false },
  correctAnswers: 0,
  totalSteps: 16,
  sortCol: null,
  sortDir: 'asc',
  filterActive: false,
  filterCol: null,
  filterOp: null,
  filterVal: null
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

/* ---------- Инициализация ---------- */
function resetTrainer() {
  state.currentStep = 1;
  state.tableData = JSON.parse(JSON.stringify(INITIAL_DATA));
  state.selectedCol = null;
  state.wizardStep = 1;
  state.isSplit = false;
  state.calculatedCols = { E: false, F: false, G: false, H: false };
  state.correctAnswers = 0;
  state.sortCol = null;
  state.sortDir = 'asc';
  state.filterActive = false;
  state.filterCol = null;
  state.filterOp = null;
  state.filterVal = null;
  
  el.screenQuiz.hidden = false;
  el.screenResult.hidden = true;
  el.checkBtn.hidden = false;
  el.checkBtn.disabled = false;
  el.nextBtn.hidden = true;
  el.feedback.textContent = '';
  el.feedback.className = 'feedback';
  el.formulaInputArea.hidden = true;
  el.theoryBox.hidden = true;
  el.userFormulaInput.value = '';
  el.userFormulaInput.classList.remove('ok', 'wrong');
  el.userFormulaInput.disabled = false;
  el.userFormulaInput.oninput = null;
  el.formulaBarDisplay.value = '';
  el.filterModal.hidden = true;
  
  renderTable();
  updateInstruction();
  updateProgress();
  closeWizard();
}

/* ---------- Получение значения ячейки ---------- */
function getRowValue(row, col) {
  if (col === 'A') return row.id;
  if (col === 'B') return row.time;
  if (col === 'E') return row.e;
  if (col === 'F') return row.f;
  if (col === 'G') return row.g;
  if (col === 'H') return row.h;
  return null;
}

/* ---------- Вычисление значений строки ---------- */
function computeRowValues(row) {
  let dep1 = null, dep2 = null;
  if (state.isSplit) {
    const parts = row.deps.split(';').map(s => s.trim());
    dep1 = parts[0] === '0' ? null : parseInt(parts[0]);
    dep2 = parts[1] ? (parts[1] === '0' ? null : parseInt(parts[1])) : null;
  } else {
    dep1 = parseInt(row.deps) || null;
  }

  const getEndTime = (id) => {
    if (!id) return 0;
    const p = state.tableData.find(r => r.id === id);
    if (!p) return 0;
    const pDep1 = parseInt(String(p.deps).split(';')[0]) || 0;
    const pDep2 = parseInt(String(p.deps).split(';')[1]) || 0;
    const e1 = getEndTime(pDep1);
    const e2 = getEndTime(pDep2);
    const start = Math.max(e1, e2) + 1;
    return start + p.time - 1;
  };

  const e = state.calculatedCols.E ? getEndTime(dep1) : null;
  const f = state.calculatedCols.F ? getEndTime(dep2) : null;
  
  let h = null, g = null;
  if (state.calculatedCols.H) {
    h = row.time + Math.max(e || 0, f || 0);
  }
  if (state.calculatedCols.G && h !== null) {
    g = h - row.time + 1;
  }
  return { e, f, g, h };
}

/* ---------- Рендер таблицы ---------- */
function renderTable() {
  let rows = state.tableData.map((row, idx) => {
    const vals = computeRowValues(row);
    return { ...row, ...vals, originalIndex: idx };
  });

  if (state.filterActive && state.filterCol && state.filterOp && state.filterVal !== null) {
    rows = rows.filter(r => {
      const val = getRowValue(r, state.filterCol);
      if (val === null || val === undefined) return false;
      const numVal = Number(val);
      const target = Number(state.filterVal);
      switch (state.filterOp) {
        case '<=': return numVal <= target;
        case '>=': return numVal >= target;
        case '=': return numVal === target;
        case '<': return numVal < target;
        case '>': return numVal > target;
        default: return true;
      }
    });
  }

  if (state.sortCol) {
    rows.sort((a, b) => {
      const va = getRowValue(a, state.sortCol);
      const vb = getRowValue(b, state.sortCol);
      if (va === null || va === undefined) return 1;
      if (vb === null || vb === undefined) return -1;
      if (typeof va === 'string') {
        return state.sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return state.sortDir === 'asc' ? va - vb : vb - va;
    });
  }

  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  let html = '<thead><tr><th></th>';
  
  cols.forEach(col => {
    let classes = '';
    if (state.selectedCol === col && state.currentStep === 1) classes += ' active-col';
    if (state.sortCol === col) classes += state.sortDir === 'asc' ? ' sort-asc' : ' sort-desc';
    if (state.filterActive && state.filterCol === col) classes += ' active-filter';
    html += `<th class="${classes.trim()}" data-col="${col}">${col}</th>`;
  });
  html += '</tr></thead><tbody>';

  html += '<tr><td style="background:#f0f0f0; font-weight:bold;">1</td>';
  html += `<td>ID (B)</td><td>Время (B)</td><td>ID A1</td><td>ID A2</td><td>Оконч. A1</td><td>Оконч. A2</td><td>Начало B</td><td>Конец B</td></tr>`;

  rows.forEach((row, idx) => {
    html += `<tr><td style="background:#f0f0f0; font-weight:bold;">${idx + 2}</td>`;
    html += `<td>${row.id}</td><td>${row.time}</td>`;
    
    if (state.isSplit) {
      const parts = row.deps.split(';').map(s => s.trim());
      html += `<td>${parts[0]}</td><td>${parts[1] || ''}</td>`;
    } else {
      html += `<td>${row.deps}</td><td></td>`; 
    }

    html += `<td style="color: var(--accent-dark); font-weight:bold;">${row.e !== null ? row.e : ''}</td>`;
    html += `<td style="color: var(--accent-dark); font-weight:bold;">${row.f !== null ? row.f : ''}</td>`;
    html += `<td style="color: var(--green); font-weight:bold;">${row.g !== null ? row.g : ''}</td>`;
    html += `<td style="color: var(--red); font-weight:bold;">${row.h !== null ? row.h : ''}</td>`;
    html += '</tr>';
  });

  for (let i = rows.length + 2; i <= 15; i++) {
    html += `<tr><td style="background:#f0f0f0; font-weight:bold;">${i}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`;
  }

  html += '</tbody>';
  el.calcTable.innerHTML = html;

  if (state.filterActive) {
    el.statusBarText.textContent = `Показано ${rows.length} из ${state.tableData.length} строк (фильтр активен)`;
  } else {
    el.statusBarText.textContent = `Строк: ${rows.length}`;
  }

  el.calcTable.querySelectorAll('th').forEach(th => {
    if (th.dataset.col) {
      th.addEventListener('click', () => {
        const col = th.dataset.col;
        if (state.currentStep === 1) {
          state.selectedCol = col;
          el.cellRef.textContent = col + '1';
          renderTable();
        } else if (state.currentStep === 11 || state.currentStep === 12) {
          if (['B', 'E', 'F', 'G', 'H'].includes(col)) {
            if (state.sortCol === col) {
              state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
            } else {
              state.sortCol = col;
              state.sortDir = 'asc';
            }
            renderTable();
          }
        } else if (state.currentStep >= 13 && state.currentStep <= 16) {
          if (['B', 'G', 'H'].includes(col)) {
            openFilterModal(col);
          }
        }
      });
    }
  });
}

/* =========================================================
   МОДАЛЬНОЕ ОКНО ФИЛЬТРА
   ========================================================= */
function openFilterModal(col) {
  const colNames = { B: 'B (Время)', G: 'G (Начало B)', H: 'H (Конец B)' };
  el.filterColName.textContent = colNames[col] || col;
  el.filterModal.dataset.col = col;

  const values = new Set();
  state.tableData.forEach(r => {
    const vals = computeRowValues(r);
    const full = { ...r, ...vals };
    const v = getRowValue(full, col);
    if (v !== null && v !== undefined) values.add(v);
  });
  const sorted = [...values].sort((a, b) => Number(a) - Number(b));

  el.filterValueSelect.innerHTML = sorted.map(v => `<option value="${v}">${v}</option>`).join('');

  document.querySelectorAll('input[name="filterMode"]').forEach(r => r.checked = false);
  document.querySelector('input[name="filterMode"][value="all"]').checked = true;
  document.querySelector('.filter-value-row').hidden = true;
  document.querySelector('.filter-condition-row').hidden = true;
  el.filterCondValue.value = '';

  if (state.filterActive && state.filterCol === col) {
    if (state.filterOp === '=') {
      document.querySelector('input[name="filterMode"][value="value"]').checked = true;
      document.querySelector('.filter-value-row').hidden = false;
      el.filterValueSelect.value = state.filterVal;
    } else {
      document.querySelector('input[name="filterMode"][value="condition"]').checked = true;
      document.querySelector('.filter-condition-row').hidden = false;
      el.filterOpSelect2.value = state.filterOp;
      el.filterCondValue.value = state.filterVal;
    }
  }

  el.filterModal.hidden = false;
}

function closeFilterModal() {
  el.filterModal.hidden = true;
}

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
      state.filterActive = false;
      state.filterCol = null;
      state.filterOp = null;
      state.filterVal = null;
    }
    closeFilterModal();
    renderTable();
    return;
  }

  if (mode === 'value') {
    const val = el.filterValueSelect.value;
    if (val === '') { setFeedback('warn', 'Выберите значение.'); return; }
    state.filterCol = col;
    state.filterOp = '=';
    state.filterVal = Number(val);
    state.filterActive = true;
    closeFilterModal();
    renderTable();
    return;
  }

  if (mode === 'condition') {
    const op = el.filterOpSelect2.value;
    const val = el.filterCondValue.value.trim();
    if (val === '') { setFeedback('warn', 'Введите число.'); return; }
    state.filterCol = col;
    state.filterOp = op;
    state.filterVal = Number(val);
    state.filterActive = true;
    closeFilterModal();
    renderTable();
  }
});

el.filterResetBtn.addEventListener('click', () => {
  state.filterActive = false;
  state.filterCol = null;
  state.filterOp = null;
  state.filterVal = null;
  closeFilterModal();
  renderTable();
});

el.filterCancelBtn.addEventListener('click', closeFilterModal);
el.filterModalClose.addEventListener('click', closeFilterModal);

/* ---------- Инструкции ---------- */
function updateInstruction() {
  const instructions = {
    1: "Шаг 1. Выделите столбец C и разделите его через меню «Данные → Текст по столбцам» с разделителем «;».",
    2: "Шаг 2. Заполняем столбец E — время окончания первой зависимости. Введите формулу для ячейки E2.",
    3: "Шаг 3. Заполняем столбец F — время окончания второй зависимости. Введите формулу для ячейки F2.",
    4: "Шаг 4. Заполняем столбец H — время окончания самого процесса. Введите формулу для H2.",
    5: "Шаг 5. Заполняем столбец G — время начала процесса. Введите формулу для G2.",
    6: "Шаг 6. Мини-пример. Процесс A длится 3 мс, независим. Процесс B длится 2 мс и зависит от A. На какой миллисекунде начнется процесс B?",
    7: "Шаг 7. Практика. Введите формулу для ячейки H4.",
    8: "Шаг 8. Практика. Введите формулу для ячейки G4.",
    9: "Шаг 9. Практика. Введите формулу для ячейки H7.",
    10: "Шаг 10. Практика. Введите формулу для ячейки G7.",
    11: "Шаг 11. Кликните по заголовку H — таблица отсортируется. Найдите минимальное время завершения и введите его.",
    12: "Шаг 12. Кликните по заголовку H ещё раз — сортировка по убыванию. Найдите максимальное время завершения и введите его.",
    13: "Шаг 13. Кликните по заголовку H → «По условию...» → «≤» → 17 → «Применить». Сколько процессов осталось?",
    14: "Шаг 14. Кликните по заголовку G → «По условию...» → «>» → 10 → «Применить». Сколько процессов осталось?",
    15: "Шаг 15. Кликните по заголовку B → «По условию...» → «>» → 5 → «Применить». Сколько процессов осталось?",
    16: "Шаг 16. Кликните по заголовку H → «По условию...» → «≤» → 10 → «Применить». Сколько процессов осталось?"
  };
  el.instruction.textContent = instructions[state.currentStep] || "";
  
  if (state.currentStep === 1) {
    el.formulaInputArea.hidden = true;
    el.theoryBox.hidden = true;
    el.checkBtn.hidden = false;
  } else if (state.currentStep >= 11) {
    el.formulaInputArea.hidden = false;
    el.theoryBox.hidden = false;
    el.checkBtn.hidden = false;
    setupFormulaStep();
  } else {
    el.formulaInputArea.hidden = false;
    el.theoryBox.hidden = false;
    el.checkBtn.hidden = false;
    setupFormulaStep();
  }
}

function updateProgress() {
  const pct = ((state.currentStep - 1) / state.totalSteps) * 100;
  el.progressFill.style.width = pct + '%';
  el.progressText.textContent = `Шаг ${state.currentStep} из ${state.totalSteps}`;
}

/* ---------- Настройки шагов ---------- */
function setupFormulaStep() {
  const step = state.currentStep;
  el.userFormulaInput.value = '';
  el.userFormulaInput.classList.remove('ok', 'wrong');
  el.userFormulaInput.disabled = false;
  el.formulaBarDisplay.value = '';
  el.userFormulaInput.style.textTransform = 'uppercase';
  el.userFormulaInput.oninput = null;

  const stretchBlock = `
    <div class="warn-block">
      💡 <b>Про растягивание:</b> формула вводится <b>только для первой ячейки</b> столбца (например, E2). 
      В Excel после ввода нужно потянуть маркер автозаполнения вниз (или скопировать ячейку и вставить на весь столбец). 
      <b>В нашем тренажёре растягивание происходит автоматически:</b> как только вы введёте правильную формулу, весь столбец мгновенно заполнится результатами.
    </div>
  `;

  if (step === 2) {
    el.formulaLabel.textContent = 'Введите формулу для ячейки E2:';
    el.formulaHint.innerHTML = '💡 <b>Что искать:</b> C2 — первая зависимость. Где искать — диапазон <code>$A:$H</code>. Номер столбца — 8 (это H). Для нулевых зависимостей ВПР выдаст ошибку — оберните в <code>ЕСЛИОШИБКА</code>.';
    el.theoryBox.innerHTML = `
      <p><b>📌 Столбец E: время окончания первой зависимости</b></p>
      <p>Используем <b>ВПР</b> (вертикальный поиск):</p>
      <p style="text-align:center;background:#fff;padding:8px;border-radius:6px;font-family:monospace;">=ВПР(что_ищем; где_ищем; номер_столбца; 0)</p>
      <ul>
        <li><b>Что ищем</b> → <code>C2</code> (ID первой зависимости).</li>
        <li><b>Где ищем</b> → <code>$A:$H</code> (вся таблица; знаки $ фиксируют диапазон).</li>
        <li><b>Номер столбца</b> → <b>8</b> (A=1, B=2, ..., H=8).</li>
        <li><b>Точное совпадение</b> → <code>0</code>.</li>
      </ul>
      <p><b>Зачем ЕСЛИОШИБКА?</b> Если C2 = 0 (нет зависимости), ВПР не найдёт 0 в столбце A → ошибка. Обёртка <code>ЕСЛИОШИБКА(ВПР(...); 0)</code> вернёт 0.</p>
      ${stretchBlock}
    `;
  } else if (step === 3) {
    el.formulaLabel.textContent = 'Введите формулу для ячейки F2:';
    el.formulaHint.innerHTML = '💡 <b>Что искать:</b> <code>D2</code> — вторая зависимость (не C2!). Остальное как в E2: диапазон <code>$A:$H</code>, номер столбца 8, ЕСЛИОШИБКА с 0.';
    el.theoryBox.innerHTML = `
      <p><b>📌 Столбец F: время окончания второй зависимости</b></p>
      <p>Формула полностью аналогична E2, но искать нужно ID из <b>D2</b>.</p>
      <ul>
        <li><b>Что ищем</b> → <code>D2</code>.</li>
        <li><b>Где ищем</b> → <code>$A:$H</code>.</li>
        <li><b>Номер столбца</b> → 8.</li>
        <li><b>Точное совпадение</b> → 0.</li>
      </ul>
      ${stretchBlock}
    `;
  } else if (step === 4) {
    el.formulaLabel.textContent = 'Введите формулу для ячейки H2:';
    el.formulaHint.innerHTML = '💡 <b>Что сложить:</b> длительность (B2) + максимум из двух окончаний зависимостей (E2 и F2) через <code>МАКС</code>.';
    el.theoryBox.innerHTML = `
      <p><b>📌 Столбец H: время окончания процесса</b></p>
      <p>Процесс не может закончиться, пока не закончатся все его зависимости. Плюс он работает B2 мс.</p>
      <ul>
        <li><b>Длительность</b> → <code>B2</code>.</li>
        <li><b>Самое позднее окончание зависимостей</b> → <code>МАКС(E2:F2)</code>.</li>
      </ul>
      <p><b>Пример:</b> процесс длится 2 мс, зависимость закончилась на 3-й мс → H = 2 + 3 = 5.</p>
      ${stretchBlock}
    `;
  } else if (step === 5) {
    el.formulaLabel.textContent = 'Введите формулу для ячейки G2:';
    el.formulaHint.innerHTML = '💡 <b>Как получить начало:</b> из конца (H2) вычтите длительность (B2) и прибавьте 1.';
    el.theoryBox.innerHTML = `
      <p><b>📌 Столбец G: время начала процесса</b></p>
      <p><b>Длительность = Конец − Начало + 1</b>. Отсюда:</p>
      <p style="text-align:center;background:#fff;padding:8px;border-radius:6px;font-family:monospace;">Начало = Конец − Длительность + 1</p>
      <ul>
        <li><b>Конец</b> → <code>H2</code>.</li>
        <li><b>Длительность</b> → <code>B2</code>.</li>
        <li><b>+1</b> → потому что первая миллисекунда — 1, а не 0.</li>
      </ul>
      ${stretchBlock}
    `;
  } else if (step === 6) {
    el.formulaLabel.textContent = 'Введите ответ (номер миллисекунды):';
    el.formulaHint.innerHTML = '💡 Процесс A занимает 1, 2, 3. B не может начаться на 3-й, потому что A ещё работает.';
    el.theoryBox.innerHTML = `
      <p>• Процесс <b>A</b> длится 3 мс → занимает 1, 2, 3.</p>
      <p>• Процесс <b>B</b> длится 2 мс, зависит от A → не может начаться на 3-й, значит начнётся на <b>4-й</b>.</p>
    `;
  } else if (step >= 7 && step <= 10) {
    if (state.tableData[0].id !== PRACTICE_DATA[0].id) {
      state.tableData = JSON.parse(JSON.stringify(PRACTICE_DATA));
      state.isSplit = true; 
      state.calculatedCols = { E: true, F: true, G: false, H: false };
      renderTable();
    }
    if (step === 7) {
      el.formulaLabel.textContent = 'Введите формулу для ячейки H4 (Процесс 3):';
      el.formulaHint.innerHTML = '💡 Та же логика, что для H2, но строка 4: длительность (B4) + максимум из E4 и F4.';
      el.theoryBox.innerHTML = `<p><b>Практика.</b> Примените ту же формулу, что и для H2, но с новыми номерами строк.</p>${stretchBlock}`;
    } else if (step === 8) {
      el.formulaLabel.textContent = 'Введите формулу для ячейки G4 (Процесс 3):';
      el.formulaHint.innerHTML = '💡 Та же логика, что для G2, но строка 4: H4 минус B4, плюс 1.';
      el.theoryBox.innerHTML = `<p><b>Практика.</b> Формула начала для строки 4.</p>${stretchBlock}`;
    } else if (step === 9) {
      el.formulaLabel.textContent = 'Введите формулу для ячейки H7 (Процесс 6):';
      el.formulaHint.innerHTML = '💡 Аналогично H2, но строка 7: B7 + МАКС(E7:F7).';
      el.theoryBox.innerHTML = `<p><b>Практика.</b> Строка 7 — процесс 6.</p>${stretchBlock}`;
    } else if (step === 10) {
      el.formulaLabel.textContent = 'Введите формулу для ячейки G7 (Процесс 6):';
      el.formulaHint.innerHTML = '💡 Аналогично G2, но строка 7: H7 − B7 + 1.';
      el.theoryBox.innerHTML = `<p><b>Практика.</b> Последний шаг формул!</p>${stretchBlock}`;
    }
  } else if (step === 11) {
    if (state.tableData[0].id !== INITIAL_DATA[0].id) {
      state.tableData = JSON.parse(JSON.stringify(INITIAL_DATA));
      state.isSplit = true;
      state.calculatedCols = { E: true, F: true, G: true, H: true };
      state.sortCol = null;
      state.sortDir = 'asc';
      state.filterActive = false;
      renderTable();
    }
    el.formulaLabel.textContent = 'Введите минимальное время завершения (из столбца H):';
    el.formulaHint.innerHTML = '💡 Кликните по заголовку H — таблица отсортируется по возрастанию. Верхнее значение в H и есть минимум.';
    el.theoryBox.innerHTML = `<p><b>Сортировка.</b> Клик по заголовку упорядочивает строки. Повторный клик меняет направление.</p>`;
  } else if (step === 12) {
    el.formulaLabel.textContent = 'Введите максимальное время завершения (из столбца H):';
    el.formulaHint.innerHTML = '💡 Кликните по заголовку H ещё раз — сортировка по убыванию. Верхнее значение — максимум.';
    el.theoryBox.innerHTML = `<p><b>Сортировка по убыванию.</b> Наибольшее значение в H.</p>`;
  } else if (step >= 13 && step <= 16) {
    if (state.tableData[0].id !== INITIAL_DATA[0].id) {
      state.tableData = JSON.parse(JSON.stringify(INITIAL_DATA));
      state.isSplit = true;
      state.calculatedCols = { E: true, F: true, G: true, H: true };
      state.sortCol = null;
      state.filterActive = false;
      renderTable();
    }
    if (step === 13) {
      el.formulaLabel.textContent = 'Сколько процессов завершились за первые 17 мс?';
      el.formulaHint.innerHTML = '💡 Заголовок H → «По условию...» → «≤» → 17 → «Применить». Внизу таблицы смотрите «Показано N из 12».';
      el.theoryBox.innerHTML = `<p><b>Фильтр.</b> Оставьте строки, где H ≤ 17.</p>`;
    } else if (step === 14) {
      el.formulaLabel.textContent = 'Сколько процессов начались после 10 мс?';
      el.formulaHint.innerHTML = '💡 Заголовок G → «По условию...» → «>» → 10 → «Применить».';
      el.theoryBox.innerHTML = `<p><b>Фильтр по началу.</b> Столбец G, условие «больше».</p>`;
    } else if (step === 15) {
      el.formulaLabel.textContent = 'Сколько процессов имеют длительность больше 5 мс?';
      el.formulaHint.innerHTML = '💡 Заголовок B → «По условию...» → «>» → 5 → «Применить».';
      el.theoryBox.innerHTML = `<p><b>Фильтр по длительности.</b> Столбец B.</p>`;
    } else if (step === 16) {
      el.formulaLabel.textContent = 'Сколько процессов завершились не позднее 10 мс?';
      el.formulaHint.innerHTML = '💡 Заголовок H → «По условию...» → «≤» → 10 → «Применить».';
      el.theoryBox.innerHTML = `<p><b>Фильтр по окончанию.</b> Столбец H.</p>`;
    }
  }

  if ((step >= 2 && step <= 5) || (step >= 7 && step <= 10)) {
    el.userFormulaInput.oninput = () => handleLiveFormula(step);
  }
}

/* ---------- Нормализация формул ---------- */
function normalizeFormula(f) {
  if (!f) return '';
  // Убираем пробелы, заменяем запятые на точки с запятой, переводим в верхний регистр
  let s = String(f).replace(/\s+/g, '').replace(/,/g, ';').toUpperCase();
  
  // Умная замена кириллицы на латиницу в ссылках на ячейки (C2, $A, $H и т.д.)
  s = s.replace(/([А-Я])(\$?)([0-9]+)/g, (match, p1, p2, p3) => {
     const map = { 'С': 'C', 'А': 'A', 'Н': 'H', 'В': 'B', 'Е': 'E', 'Р': 'P', 'О': 'O', 'М': 'M', 'Т': 'T', 'Х': 'X' };
     const letter = map[p1] || p1;
     return letter + p2 + p3;
  });
  
  // Замена кириллицы в диапазонах ($A:$H)
  s = s.replace(/\$([А-Я]):\$([А-Я])/g, (match, p1, p2) => {
     const map = { 'С': 'C', 'А': 'A', 'Н': 'H', 'В': 'B', 'Е': 'E', 'Р': 'P', 'О': 'O', 'М': 'M', 'Т': 'T', 'Х': 'X' };
     const l1 = map[p1] || p1;
     const l2 = map[p2] || p2;
     return '$' + l1 + ':$' + l2;
  });

  // Замена буквы О на ноль в конце (вместо ;0)
  s = s.replace(/;О\)/g, ';0)').replace(/;O\)/g, ';0)');

  return s;
}

/* ---------- Живая проверка формул ---------- */
function handleLiveFormula(step) {
  const value = normalizeFormula(el.userFormulaInput.value);
  const correct = getFinalAnswer(step);
  const correctNorm = normalizeFormula(correct);

  let ok = value === correctNorm;
  if (!ok && (step === 2 || step === 3)) {
    ok = value === normalizeFormula(correct.replace(/\$/g, ''));
  }

  if (ok) {
    if (step === 2) state.calculatedCols.E = true;
    if (step === 3) state.calculatedCols.F = true;
    if (step === 4) state.calculatedCols.H = true;
    if (step === 5) state.calculatedCols.G = true;
    if (step === 7) state.calculatedCols.H = true;
    if (step === 8) state.calculatedCols.G = true;
    if (step === 9) state.calculatedCols.H = true;
    if (step === 10) state.calculatedCols.G = true;
    renderTable();

    el.userFormulaInput.classList.add('ok');
    el.userFormulaInput.classList.remove('wrong');
    el.userFormulaInput.disabled = true;
    setFeedback('success', '✅ Формула верна! Она «растянулась» на весь столбец — посмотрите на таблицу. Нажмите «Далее».');
    el.checkBtn.hidden = true;
    el.nextBtn.hidden = false;
  } else {
    if (step === 2) state.calculatedCols.E = false;
    if (step === 3) state.calculatedCols.F = false;
    if (step === 4) state.calculatedCols.H = false;
    if (step === 5) state.calculatedCols.G = false;
    if (step === 7) state.calculatedCols.H = false;
    if (step === 8) state.calculatedCols.G = false;
    if (step === 9) state.calculatedCols.H = false;
    if (step === 10) state.calculatedCols.G = false;
    renderTable();

    el.userFormulaInput.classList.remove('ok');
    el.userFormulaInput.classList.remove('wrong');
    setFeedback('', '');
  }
}

/* ---------- Проверка ответов ---------- */
function getWrongHint(step) {
  const hints = {
    2: 'Проверьте: что ищем — C2; диапазон $A:$H; номер столбца — 8; обёртка ЕСЛИОШИБКА с нулём.',
    3: 'Проверьте: что ищем — D2 (не C2!); диапазон $A:$H; номер столбца — 8; ЕСЛИОШИБКА с нулём.',
    4: 'Проверьте: длительность в B2; максимум из E2 и F2 через МАКС; между ними знак «плюс».',
    5: 'Проверьте: сначала H2 (конец); вычитаем B2 (длительность); не забудьте +1.',
    6: 'Процесс A заканчивается на 3-й мс. B не может начаться на 3-й, значит — на следующей.',
    7: 'Логика как в H2, но строка 4: B4 + МАКС(E4:F4).',
    8: 'Логика как в G2, но строка 4: H4 − B4 + 1.',
    9: 'Логика как в H2, но строка 7: B7 + МАКС(E7:F7).',
    10: 'Логика как в G2, но строка 7: H7 − B7 + 1.',
    11: 'Клик по H (сортировка по возрастанию). Самое верхнее значение — минимум.',
    12: 'Клик по H ещё раз (по убыванию). Самое верхнее значение — максимум.',
    13: 'Заголовок H → «По условию...» → «≤» → 17 → «Применить». Посмотрите счётчик.',
    14: 'Заголовок G → «По условию...» → «>» → 10 → «Применить».',
    15: 'Заголовок B → «По условию...» → «>» → 5 → «Применить».',
    16: 'Заголовок H → «По условию...» → «≤» → 10 → «Применить».'
  };
  return hints[step] || '';
}

function getFinalAnswer(step) {
  const answers = {
    2: '=ЕСЛИОШИБКА(ВПР(C2;$A:$H;8;0);0)',
    3: '=ЕСЛИОШИБКА(ВПР(D2;$A:$H;8;0);0)',
    4: '=B2+МАКС(E2:F2)',
    5: '=H2-B2+1',
    6: '4',
    7: '=B4+МАКС(E4:F4)',
    8: '=H4-B4+1',
    9: '=B7+МАКС(E7:F7)',
    10: '=H7-B7+1',
    11: '3',
    12: '17',
    13: '12',
    14: '3',
    15: '6',
    16: '5'
  };
  return answers[step] || '';
}

el.checkBtn.addEventListener('click', () => {
  const step = state.currentStep;

  if (step === 1) {
    if (state.isSplit) {
      setFeedback('success', '✅ Данные разделены!');
      el.checkBtn.hidden = true;
      el.nextBtn.hidden = false;
    } else {
      setFeedback('warn', 'Сначала разделите данные через меню «Данные».');
    }
    return;
  }

  // Шаги с формулами
  if ((step >= 2 && step <= 5) || (step >= 7 && step <= 10)) {
    if (el.userFormulaInput.disabled) return;
    
    // На всякий случай вызываем проверку (если вставили текст и oninput не сработал)
    handleLiveFormula(step);
    if (el.userFormulaInput.disabled) return; // Если формула стала верной, выходим

    if (!el.userFormulaInput.value.trim()) {
      setFeedback('warn', 'Введите формулу.');
      return;
    }
    
    // Если неверно, показываем ошибку и подсказку
    setFeedback('error', `❌ Формула пока не подходит. ${getWrongHint(step)} <br><small>Убедитесь, что в ссылках на ячейки (C2, A, H) используются латинские буквы, а не русские.</small>`);
    return;
  }

  // Шаги 6 и 11-16 — числовой ответ
  const val = el.userFormulaInput.value.trim();
  if (val === '') {
    setFeedback('warn', 'Введите ответ.');
    return;
  }
  const correct = getFinalAnswer(step);
  if (val === correct) {
    el.userFormulaInput.classList.add('ok');
    el.userFormulaInput.classList.remove('wrong');
    el.userFormulaInput.disabled = true;
    setFeedback('success', '✅ Верно!');
    el.checkBtn.hidden = true;
    el.nextBtn.hidden = false;
  } else {
    el.userFormulaInput.classList.add('wrong');
    el.userFormulaInput.classList.remove('ok');
    setFeedback('error', `❌ Неверно. ${getWrongHint(step)}`);
  }
});

el.nextBtn.addEventListener('click', () => {
  if (state.currentStep < state.totalSteps) {
    state.currentStep++;
    state.sortCol = null;
    state.sortDir = 'asc';
    state.filterActive = false;
    state.filterCol = null;
    state.filterOp = null;
    state.filterVal = null;
    el.filterModal.hidden = true;
    updateInstruction();
    updateProgress();
    renderTable();
    el.nextBtn.hidden = true;
    el.checkBtn.hidden = false;
    el.userFormulaInput.disabled = false;
    el.userFormulaInput.classList.remove('ok', 'wrong');
    el.userFormulaInput.oninput = null;
  } else {
    showResult();
  }
});

function showResult() {
  el.screenQuiz.hidden = true;
  el.screenResult.hidden = false;
  document.getElementById('finishText').innerHTML = `Вы прошли все этапы! Вы научились разделять данные, подтягивать значения зависимостей, вычислять время начала и конца процессов, а также использовать сортировку и фильтр.<br><br>Теперь вы готовы решать задание 22 на любых данных!`;
}

/* ---------- Меню данных ---------- */
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
  if (state.currentStep === 1) {
    if (state.selectedCol !== 'C') {
      setFeedback('warn', 'Выделите столбец C.');
      return;
    }
    openWizard();
  }
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
  const s1 = document.getElementById('step1'), s2 = document.getElementById('step2'), s3 = document.getElementById('step3');
  if (!s1.hidden) {
    if (document.querySelector('input[name="format"]:checked').value !== 'delimited') {
      alert('Выберите "С разделителями".'); return;
    }
    s1.hidden = true; s2.hidden = false;
    document.getElementById('wizardBack').hidden = false;
  } else if (!s2.hidden) {
    if (!document.getElementById('delimSemicolon').checked) {
      alert('Выберите разделитель "Точка с запятой".'); return;
    }
    s2.hidden = true; s3.hidden = false;
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
  setFeedback('success', '✅ Данные разделены! Нажмите «Проверить».');
});

function setFeedback(type, text) {
  el.feedback.innerHTML = text;
  el.feedback.className = 'feedback ' + (type || '');
}

document.getElementById('retryBtn').addEventListener('click', resetTrainer);
document.getElementById('helpBtn').addEventListener('click', () => { document.getElementById('helpModal').hidden = false; });
document.getElementById('closeHelpBtn').addEventListener('click', () => { document.getElementById('helpModal').hidden = true; });

resetTrainer();
