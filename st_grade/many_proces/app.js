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
  filterPanel: document.getElementById('filterPanel'),
  filterColSelect: document.getElementById('filterColSelect'),
  filterOpSelect: document.getElementById('filterOpSelect'),
  filterValInput: document.getElementById('filterValInput'),
  applyFilterBtn: document.getElementById('applyFilterBtn'),
  resetFilterBtn: document.getElementById('resetFilterBtn'),
  filterStatus: document.getElementById('filterStatus'),
  statusBarText: document.getElementById('statusBarText')
};

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
  el.formulaBarDisplay.value = '';
  el.filterPanel.hidden = true;
  
  renderTable();
  updateInstruction();
  updateProgress();
  closeWizard();
}

/* ---------- КЛЮЧЕВАЯ ФУНКЦИЯ: вычисление значений строки ---------- */
/* ВАЖНО: getEndTime возвращает 0, если H ещё не заполнен!
   Именно поэтому при первом применении ВПР везде нули — H пуст. */
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
    if (!state.calculatedCols.H) return 0; // H пуст — ВПР не может найти
    const p = state.tableData.find(r => r.id === id);
    if (!p) return 0;
    const pDep1 = parseInt(p.deps.split(';')[0]) || 0;
    const pDep2 = parseInt(p.deps.split(';')[1]) || 0;
    const e1 = getEndTime(pDep1);
    const e2 = getEndTime(pDep2);
    const start = Math.max(e1, e2) + 1;
    return start + p.time - 1;
  };

  // E и F показывают 0, если H не заполнен (ВПР возвращает ошибку → 0)
  const e = state.calculatedCols.E ? (state.calculatedCols.H ? getEndTime(dep1) : 0) : null;
  const f = state.calculatedCols.F ? (state.calculatedCols.H ? getEndTime(dep2) : 0) : null;
  
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
      const val = r[state.filterCol.toLowerCase()];
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
    const col = state.sortCol.toLowerCase();
    rows.sort((a, b) => {
      const va = a[col];
      const vb = b[col];
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
    if (state.selectedCol === col && state.currentStep === 1) classes = 'active-col';
    if (state.sortCol === col) classes += state.sortDir === 'asc' ? ' sort-asc' : ' sort-desc';
    html += `<th class="${classes}" data-col="${col}">${col}</th>`;
  });
  html += '</tr></thead><tbody>';

  html += '<tr><td style="background:#f0f0f0; font-weight:bold;">1</td>';
  html += `<td>ID (B)</td>`;
  html += `<td>Время (B)</td>`;
  html += `<td>ID A1</td>`;
  html += `<td>ID A2</td>`;
  html += `<td>Оконч. A1</td>`;
  html += `<td>Оконч. A2</td>`;
  html += `<td>Начало B</td>`;
  html += `<td>Конец B</td>`;
  html += '</tr>';

  rows.forEach((row, idx) => {
    html += `<tr><td style="background:#f0f0f0; font-weight:bold;">${idx + 2}</td>`;
    html += `<td>${row.id}</td>`;
    html += `<td>${row.time}</td>`;
    
    if (state.isSplit) {
      const parts = row.deps.split(';').map(s => s.trim());
      html += `<td>${parts[0]}</td>`;
      html += `<td>${parts[1] || ''}</td>`;
    } else {
      html += `<td>${row.deps}</td>`;
      html += `<td></td>`; 
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
    el.statusBarText.textContent = `Показано ${rows.length} из ${state.tableData.length} строк (фильтр)`;
    el.filterStatus.textContent = `Найдено: ${rows.length}`;
  } else {
    el.statusBarText.textContent = `Строк: ${rows.length}`;
    el.filterStatus.textContent = '';
  }

  el.calcTable.querySelectorAll('th').forEach(th => {
    if (th.dataset.col) {
      th.addEventListener('click', () => {
        const col = th.dataset.col;
        if (state.currentStep === 1) {
          state.selectedCol = col;
          el.cellRef.textContent = col + '1';
          renderTable();
        } else if (state.currentStep >= 11) {
          if (['B', 'E', 'F', 'G', 'H'].includes(col)) {
            if (state.sortCol === col) {
              state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
            } else {
              state.sortCol = col;
              state.sortDir = 'asc';
            }
            renderTable();
          }
        }
      });
    }
  });
}

/* ---------- Инструкции ---------- */
function updateInstruction() {
  const instructions = {
    1: "Шаг 1. Выделите столбец C и разделите его через меню «Данные → Текст по столбцам» с разделителем «;».",
    2: "Шаг 2. Заполняем столбец E — время окончания первой зависимости. Введите формулу для ячейки E2.",
    3: "Шаг 3. Заполняем столбец F — время окончания второй зависимости. Введите формулу для ячейки F2.",
    4: "Шаг 4. Заполняем столбец H — время окончания самого процесса. Введите формулу для H2.",
    5: "Шаг 5. Заполняем столбец G — время начала процесса. Введите формулу для G2.",
    6: "Шаг 6. Мини-пример. Процесс A длится 3 мс, независим. Процесс B длится 2 мс и зависит от A. На какой миллисекунде начнется процесс B?",
    7: "Шаг 7. Практика. Перед вами новая таблица. Введите формулу для ячейки H4.",
    8: "Шаг 8. Практика. Введите формулу для ячейки G4.",
    9: "Шаг 9. Практика. Введите формулу для ячейки H7.",
    10: "Шаг 10. Практика. Введите формулу для ячейки G7.",
    11: "Шаг 11. Таблица заполнена. Кликните по заголовку H, чтобы отсортировать по возрастанию. Найдите минимальное время завершения и введите его.",
    12: "Шаг 12. Кликните по заголовку H ещё раз, чтобы отсортировать по убыванию. Найдите максимальное время завершения и введите его.",
    13: "Шаг 13. Используйте панель фильтра: выберите H, условие ≤, введите 17. Нажмите «Применить». Сколько процессов осталось?",
    14: "Шаг 14. Отфильтруйте процессы, у которых начало (G) > 10. Сколько их?",
    15: "Шаг 15. Отфильтруйте процессы, у которых время (B) > 5. Сколько их?",
    16: "Шаг 16. Отфильтруйте процессы, у которых конец (H) ≤ 10. Сколько их?"
  };
  el.instruction.textContent = instructions[state.currentStep] || "";
  
  if (state.currentStep === 1) {
    el.formulaInputArea.hidden = true;
    el.theoryBox.hidden = true;
    el.checkBtn.hidden = false;
    el.filterPanel.hidden = true;
  } else if (state.currentStep >= 11) {
    el.formulaInputArea.hidden = false;
    el.theoryBox.hidden = false;
    el.checkBtn.hidden = false;
    el.filterPanel.hidden = state.currentStep < 13;
    setupFormulaStep();
  } else {
    el.formulaInputArea.hidden = false;
    el.theoryBox.hidden = false;
    el.checkBtn.hidden = false;
    el.filterPanel.hidden = true;
    setupFormulaStep();
  }
}

function updateProgress() {
  const pct = ((state.currentStep - 1) / state.totalSteps) * 100;
  el.progressFill.style.width = pct + '%';
  el.progressText.textContent = `Шаг ${state.currentStep} из ${state.totalSteps}`;
}

/* ---------- ПОДРОБНЫЕ ОБЪЯСНЕНИЯ ПО ШАГАМ ---------- */
function setupFormulaStep() {
  const step = state.currentStep;
  el.userFormulaInput.value = '';
  el.userFormulaInput.classList.remove('ok', 'wrong');
  el.userFormulaInput.disabled = false;
  el.formulaBarDisplay.value = '';

  if (step === 2) {
    el.formulaLabel.textContent = 'Введите формулу для ячейки E2:';
    el.formulaHint.innerHTML = '💡 <b>Шаблон:</b> <code>=ЕСЛИОШИБКА(ВПР(<b>C2</b>;$A:$H;<b>8</b>;0);0)</code>';
    el.theoryBox.innerHTML = `
      <p><b>📌 Столбец E: время окончания первой зависимости</b></p>
      <p>Нам нужно узнать: <i>на какой миллисекунде закончился процесс из ячейки C2?</i></p>
      <p>Для этого используем функцию <b>ВПР</b> (вертикальный поиск). Её синтаксис:</p>
      <p style="text-align:center;background:#fff;padding:8px;border-radius:6px;font-family:monospace;">=ВПР(что_ищем; где_ищем; номер_столбца; 0)</p>
      <p>Разбираем нашу формулу по аргументам:</p>
      <ul>
        <li><b>1. Что ищем → <code>C2</code></b>. Это ID первой зависимости (например, число 1).</li>
        <li><b>2. Где ищем → <code>$A:$H</code></b>. Ищем по всей таблице. Знаки <code>$</code> фиксируют диапазон, чтобы при протягивании формулы вниз он не смещался.</li>
        <li><b>3. Какой столбец вернуть → <code>8</code></b>. Считаем от A: A=1, B=2, C=3, D=4, E=5, F=6, G=7, <b>H=8</b>. То есть возвращаем значение из H (Конец B).</li>
        <li><b>4. Точное совпадение → <code>0</code></b>. Ищем именно этот ID, никаких "примерных" совпадений.</li>
      </ul>
      <p><b>Зачем ЕСЛИОШИБКА?</b> Если в C2 стоит 0 (нет зависимости), ВПР будет искать 0 в столбце A и не найдёт — выдаст ошибку <code>#Н/Д</code>. Обёртка <code>ЕСЛИОШИБКА(ВПР(...); 0)</code> ловит эту ошибку и возвращает 0.</p>
      <div class="warn-block">
        ⚠️ <b>Важно:</b> сейчас столбец H ещё ПУСТ. Поэтому ВПР для всех строк вернёт ошибку → 0. Так и должно быть! Вы увидите, что весь столбец E заполнится нулями. Это нормально — когда позже мы заполним H, значения пересчитаются автоматически.
      </div>
    `;
  } else if (step === 3) {
    el.formulaLabel.textContent = 'Введите формулу для ячейки F2:';
    el.formulaHint.innerHTML = '💡 <b>Шаблон:</b> <code>=ЕСЛИОШИБКА(ВПР(<b>D2</b>;$A:$H;<b>8</b>;0);0)</code>';
    el.theoryBox.innerHTML = `
      <p><b>📌 Столбец F: время окончания второй зависимости</b></p>
      <p>Формула полностью аналогична E2, но есть <b>одно отличие</b>: искать нужно не в C2, а в <b>D2</b> — там записан ID второй зависимости (если она есть).</p>
      <ul>
        <li><b>Что ищем → <code>D2</code></b> (вторая зависимость).</li>
        <li><b>Где ищем → <code>$A:$H</code></b> (та же таблица, диапазон не меняется).</li>
        <li><b>Номер столбца → <code>8</code></b> (столбец H — время окончания).</li>
        <li><b>Точное совпадение → <code>0</code></b>.</li>
      </ul>
      <p>Если у процесса только одна зависимость (или нет совсем), ячейка D2 будет пустой или содержать 0. ВПР не найдёт такое значение → ошибка → ЕСЛИОШИБКА вернёт 0. Всё правильно!</p>
      <div class="warn-block">
        ⚠️ Столбец H по-прежнему пуст. Поэтому и в F2 мы увидим нули. Так и должно быть — пока не заполним H, ВПР нечего искать.
      </div>
    `;
  } else if (step === 4) {
    el.formulaLabel.textContent = 'Введите формулу для ячейки H2:';
    el.formulaHint.innerHTML = '💡 <b>Шаблон:</b> <code>=<b>B2</b>+<b>МАКС(E2:F2)</b></code>';
    el.theoryBox.innerHTML = `
      <p><b>📌 Столбец H: время окончания процесса</b></p>
      <p>Логика простая: процесс не может закончиться, пока не закончатся <b>все</b> его зависимости. Плюс он ещё сам работает B2 миллисекунд.</p>
      <p style="text-align:center;background:#fff;padding:8px;border-radius:6px;font-family:monospace;">=B2 + МАКС(E2:F2)</p>
      <p>Что здесь что:</p>
      <ul>
        <li><b>B2</b> — длительность самого процесса (сколько миллисекунд он работает).</li>
        <li><b>МАКС(E2:F2)</b> — самое позднее из времён окончания зависимостей. Если обе зависимости закончились в разное время, наш процесс начнётся после <i>более поздней</i>.</li>
        <li><b>Если зависимостей нет</b> (E2=F2=0), то МАКС = 0, и H = B2 (процесс начнётся с 1-й мс и закончится на B2-й).</li>
      </ul>
      <p><b>Пример:</b> процесс длится 2 мс, зависит от процесса, который закончился на 3-й мс. Тогда H = 2 + 3 = 5. Процесс занимает миллисекунды с 4-й по 5-ю.</p>
      <div class="warn-block">
        ⚠️ <b>Что произойдёт после ввода формулы:</b> сейчас E и F равны 0 (потому что H был пуст). Но как только H получит значения, Excel <b>пересчитает E и F</b> — они ссылаются на H. Смотрите: весь столбец заполнится реальными числами, включая правильные E, F, H. Это и есть имитация поведения Excel.
      </div>
    `;
  } else if (step === 5) {
    el.formulaLabel.textContent = 'Введите формулу для ячейки G2:';
    el.formulaHint.innerHTML = '💡 <b>Шаблон:</b> <code>=<b>H2</b>-<b>B2</b>+<b>1</b></code>';
    el.theoryBox.innerHTML = `
      <p><b>📌 Столбец G: время начала процесса</b></p>
      <p><b>Откуда берётся +1?</b> Вспомним формулу длины отрезка на числовой прямой:</p>
      <p style="text-align:center;background:#fff;padding:8px;border-radius:6px;font-family:monospace;">Длительность = Конец − Начало + 1</p>
      <p><b>Проверим на примере:</b> процесс занимает миллисекунды 3, 4, 5. Длительность = 3, начало = 3, конец = 5. Подставляем: 5 − 3 + 1 = 3 ✓</p>
      <p>Теперь выразим <b>Начало</b> из этой формулы:</p>
      <p style="text-align:center;background:#fff;padding:8px;border-radius:6px;font-family:monospace;">Начало = Конец − Длительность + 1</p>
      <p>В наших обозначениях: <b>G = H − B + 1</b>.</p>
      <ul>
        <li><b>H2</b> — время окончания процесса (мы его только что посчитали).</li>
        <li><b>B2</b> — длительность процесса.</li>
        <li><b>+1</b> — потому что отсчёт начинается с 1-й мс, а не с 0-й.</li>
      </ul>
      <p><b>Пример:</b> процесс закончился на 5-й мс, длится 2 мс. Начало = 5 − 2 + 1 = 4. Процесс занимает 4-ю и 5-ю мс. ✓</p>
    `;
  } else if (step === 6) {
    el.formulaLabel.textContent = 'Введите ответ (номер миллисекунды):';
    el.formulaHint.innerHTML = '💡 <b>Подсказка:</b> Процесс A занимает 1, 2, 3. Процесс B не может начаться на 3-й, потому что A ещё не закончил.';
    el.theoryBox.innerHTML = `
      <p><b>Проверим логику на мини-примере.</b></p>
      <p>• Процесс <b>A</b> длится 3 мс и ни от кого не зависит. Он занимает 1-ю, 2-ю и 3-ю миллисекунды (начало = 1, конец = 3).</p>
      <p>• Процесс <b>B</b> длится 2 мс и зависит от A. Он не может начаться на 3-й мс, потому что A ещё работает в этот момент. Значит, B начнётся на <b>4-й</b> мс.</p>
      <p>Проверим через формулу: H_A = 3 (процесс A закончился на 3-й мс). Тогда для B: E = H_A = 3, и начало B = конец A + 1 = 4. ✓</p>
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
      el.formulaHint.innerHTML = '💡 <b>Шаблон:</b> <code>=<b>B4</b>+<b>МАКС(E4:F4)</b></code>';
      el.theoryBox.innerHTML = `<p><b>Практика.</b> Примените ту же формулу, что и для H2, но для строки 4. Обратите внимание, что номер строки в ссылках теперь 4, а не 2.</p>`;
    } else if (step === 8) {
      el.formulaLabel.textContent = 'Введите формулу для ячейки G4 (Процесс 3):';
      el.formulaHint.innerHTML = '💡 <b>Шаблон:</b> <code>=<b>H4</b>-<b>B4</b>+<b>1</b></code>';
      el.theoryBox.innerHTML = `<p><b>Практика.</b> Формула начала процесса — та же, что для G2, но строка 4.</p>`;
    } else if (step === 9) {
      el.formulaLabel.textContent = 'Введите формулу для ячейки H7 (Процесс 6):';
      el.formulaHint.innerHTML = '💡 <b>Шаблон:</b> <code>=<b>B7</b>+<b>МАКС(E7:F7)</b></code>';
      el.theoryBox.innerHTML = `<p><b>Практика.</b> Строка 7 — процесс 6. Формула такая же, но с новыми номерами.</p>`;
    } else if (step === 10) {
      el.formulaLabel.textContent = 'Введите формулу для ячейки G7 (Процесс 6):';
      el.formulaHint.innerHTML = '💡 <b>Шаблон:</b> <code>=<b>H7</b>-<b>B7</b>+<b>1</b></code>';
      el.theoryBox.innerHTML = `<p><b>Практика.</b> Последний шаг формул!</p>`;
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
    el.formulaHint.innerHTML = '💡 <b>Подсказка:</b> Кликните по заголовку H — таблица отсортируется по возрастанию. Первое значение в столбце H — минимум.';
    el.theoryBox.innerHTML = `<p><b>Сортировка.</b> Клик по заголовку столбца упорядочивает строки по этому столбцу. При повторном клике направление меняется (возрастание / убывание).</p>`;
  } else if (step === 12) {
    el.formulaLabel.textContent = 'Введите максимальное время завершения (из столбца H):';
    el.formulaHint.innerHTML = '💡 <b>Подсказка:</b> Кликните по заголовку H ещё раз, чтобы отсортировать по убыванию. Первое значение — максимум.';
    el.theoryBox.innerHTML = `<p><b>Сортировка по убыванию.</b> Найдите наибольшее значение в столбце H.</p>`;
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
      el.formulaLabel.textContent = 'Введите количество процессов, завершившихся за первые 17 мс:';
      el.formulaHint.innerHTML = '💡 <b>Подсказка:</b> В панели фильтра выберите столбец H, условие ≤, значение 17. Нажмите «Применить».';
      el.theoryBox.innerHTML = `<p><b>Фильтр.</b> Оставьте только строки, где H ≤ 17. Это значит «процесс закончился не позже 17-й мс».</p>`;
    } else if (step === 14) {
      el.formulaLabel.textContent = 'Введите количество процессов, начавшихся после 10 мс:';
      el.formulaHint.innerHTML = '💡 <b>Подсказка:</b> Столбец G, условие >, значение 10.';
      el.theoryBox.innerHTML = `<p><b>Фильтр по началу.</b> Используйте столбец G (Начало B) и условие «больше».</p>`;
    } else if (step === 15) {
      el.formulaLabel.textContent = 'Введите количество процессов с длительностью более 5 мс:';
      el.formulaHint.innerHTML = '💡 <b>Подсказка:</b> Столбец B, условие >, значение 5.';
      el.theoryBox.innerHTML = `<p><b>Фильтр по длительности.</b> Используйте столбец B (Время).</p>`;
    } else if (step === 16) {
      el.formulaLabel.textContent = 'Введите количество процессов, завершившихся не позднее 10 мс:';
      el.formulaHint.innerHTML = '💡 <b>Подсказка:</b> Столбец H, условие ≤, значение 10.';
      el.theoryBox.innerHTML = `<p><b>Фильтр по окончанию.</b> Используйте столбец H и «не больше».</p>`;
    }
  }
}

/* ---------- Проверка ---------- */
function normalizeFormula(f) {
  return f.replace(/\s/g, '').replace(/,/g, ';').toUpperCase();
}

el.checkBtn.addEventListener('click', () => {
  if (state.currentStep === 1) {
    if (state.isSplit) {
      setFeedback('success', '✅ Данные разделены! Переходим к формулам.');
      state.correctAnswers++;
      el.checkBtn.hidden = true;
      el.nextBtn.hidden = false;
    } else {
      setFeedback('warn', 'Сначала выполните разделение через меню «Данные».');
    }
    return;
  }

  if (state.currentStep >= 11) {
    const val = el.userFormulaInput.value.trim();
    if (val === '') {
      setFeedback('warn', 'Введите ответ.');
      return;
    }
    let correct = '';
    if (state.currentStep === 11) correct = '3';
    else if (state.currentStep === 12) correct = '17';
    else if (state.currentStep === 13) correct = '12';
    else if (state.currentStep === 14) correct = '3';
    else if (state.currentStep === 15) correct = '6';
    else if (state.currentStep === 16) correct = '5';

    if (val === correct) {
      el.userFormulaInput.classList.add('ok');
      el.userFormulaInput.classList.remove('wrong');
      el.userFormulaInput.disabled = true;
      state.correctAnswers++;
      setFeedback('success', '✅ Верно!');
      el.checkBtn.hidden = true;
      el.nextBtn.hidden = false;
    } else {
      el.userFormulaInput.classList.add('wrong');
      setFeedback('error', `❌ Неверно. Попробуйте ещё раз или воспользуйтесь подсказкой.`);
    }
    return;
  }

  const userFormula = normalizeFormula(el.userFormulaInput.value);
  let isCorrect = false;
  let correctAnswerText = '';

  if (state.currentStep === 2) {
    const correct = normalizeFormula('=ЕСЛИОШИБКА(ВПР(C2;$A:$H;8;0);0)');
    correctAnswerText = '=ЕСЛИОШИБКА(ВПР(C2;$A:$H;8;0);0)';
    isCorrect = (userFormula === correct || userFormula === normalizeFormula('=ЕСЛИОШИБКА(ВПР(C2;A:H;8;0);0)'));
  } else if (state.currentStep === 3) {
    const correct = normalizeFormula('=ЕСЛИОШИБКА(ВПР(D2;$A:$H;8;0);0)');
    correctAnswerText = '=ЕСЛИОШИБКА(ВПР(D2;$A:$H;8;0);0)';
    isCorrect = (userFormula === correct || userFormula === normalizeFormula('=ЕСЛИОШИБКА(ВПР(D2;A:H;8;0);0)'));
  } else if (state.currentStep === 4) {
    const correct = normalizeFormula('=B2+МАКС(E2:F2)');
    correctAnswerText = '=B2+МАКС(E2:F2)';
    isCorrect = (userFormula === correct);
  } else if (state.currentStep === 5) {
    const correct = normalizeFormula('=H2-B2+1');
    correctAnswerText = '=H2-B2+1';
    isCorrect = (userFormula === correct);
  } else if (state.currentStep === 6) {
    isCorrect = (el.userFormulaInput.value.trim() === '4');
    correctAnswerText = '4';
  } else if (state.currentStep === 7) {
    const correct = normalizeFormula('=B4+МАКС(E4:F4)');
    correctAnswerText = '=B4+МАКС(E4:F4)';
    isCorrect = (userFormula === correct);
  } else if (state.currentStep === 8) {
    const correct = normalizeFormula('=H4-B4+1');
    correctAnswerText = '=H4-B4+1';
    isCorrect = (userFormula === correct);
  } else if (state.currentStep === 9) {
    const correct = normalizeFormula('=B7+МАКС(E7:F7)');
    correctAnswerText = '=B7+МАКС(E7:F7)';
    isCorrect = (userFormula === correct);
  } else if (state.currentStep === 10) {
    const correct = normalizeFormula('=H7-B7+1');
    correctAnswerText = '=H7-B7+1';
    isCorrect = (userFormula === correct);
  }

  if (isCorrect) {
    el.userFormulaInput.classList.add('ok');
    el.userFormulaInput.classList.remove('wrong');
    el.userFormulaInput.disabled = true;
    state.correctAnswers++;
    
    if (state.currentStep === 2) state.calculatedCols.E = true;
    if (state.currentStep === 3) state.calculatedCols.F = true;
    if (state.currentStep === 4) state.calculatedCols.H = true;
    if (state.currentStep === 5) state.calculatedCols.G = true;
    renderTable();

    setFeedback('success', '✅ Верно! Посмотрите на результаты в таблице.');
    el.checkBtn.hidden = true;
    el.nextBtn.hidden = false;
  } else {
    el.userFormulaInput.classList.add('wrong');
    setFeedback('error', `❌ Неверно. Правильный ответ: ${correctAnswerText}.`);
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
    el.filterValInput.value = '';
    updateInstruction();
    updateProgress();
    renderTable();
    el.nextBtn.hidden = true;
    el.checkBtn.hidden = false;
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

document.addEventListener('click', () => {
  el.dropdownData.hidden = true;
});

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
  state.wizardStep = 1;
  updateWizardUI();
}
function closeWizard() {
  el.wizardModal.hidden = true;
  state.wizardStep = 1;
}
function updateWizardUI() {
  document.getElementById('step1').hidden = state.wizardStep !== 1;
  document.getElementById('step2').hidden = state.wizardStep !== 2;
  document.getElementById('step3').hidden = state.wizardStep !== 3;
  document.getElementById('wizardBack').hidden = state.wizardStep === 1;
  document.getElementById('wizardNext').hidden = state.wizardStep === 3;
  document.getElementById('wizardFinish').hidden = state.wizardStep !== 3;
}

document.getElementById('wizardCancel').addEventListener('click', closeWizard);

document.getElementById('wizardNext').addEventListener('click', () => {
  if (state.wizardStep === 1) {
    if (document.querySelector('input[name="format"]:checked').value !== 'delimited') {
      alert('Выберите "С разделителями".');
      return;
    }
    state.wizardStep = 2;
  } else if (state.wizardStep === 2) {
    if (!document.getElementById('delimSemicolon').checked) {
      alert('Выберите разделитель "Точка с запятой".');
      return;
    }
    state.wizardStep = 3;
  }
  updateWizardUI();
});

document.getElementById('wizardBack').addEventListener('click', () => {
  state.wizardStep--;
  updateWizardUI();
});

document.getElementById('wizardFinish').addEventListener('click', () => {
  closeWizard();
  state.isSplit = true;
  renderTable();
  setFeedback('success', '✅ Данные разделены! Теперь нажмите «Проверить» и перейдем к формулам.');
});

/* ---------- Фильтр ---------- */
el.applyFilterBtn.addEventListener('click', () => {
  const col = el.filterColSelect.value;
  const op = el.filterOpSelect.value;
  const val = el.filterValInput.value.trim();
  if (val === '') {
    setFeedback('warn', 'Введите число для фильтра.');
    return;
  }
  state.filterCol = col;
  state.filterOp = op;
  state.filterVal = Number(val);
  state.filterActive = true;
  renderTable();
});

el.resetFilterBtn.addEventListener('click', () => {
  state.filterActive = false;
  state.filterCol = null;
  state.filterOp = null;
  state.filterVal = null;
  el.filterValInput.value = '';
  renderTable();
});

function setFeedback(type, text) {
  el.feedback.textContent = text;
  el.feedback.className = 'feedback ' + (type || '');
}

document.getElementById('retryBtn').addEventListener('click', resetTrainer);
document.getElementById('helpBtn').addEventListener('click', () => {
  document.getElementById('helpModal').hidden = false;
});
document.getElementById('closeHelpBtn').addEventListener('click', () => {
  document.getElementById('helpModal').hidden = true;
});

// Старт
resetTrainer();
