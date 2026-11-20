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
  currentStep: 1, // 1: Split, 2: E, 3: F, 4: H, 5: G, 6: Mini, 7-10: Practice, 11-12: Sort, 13-16: Filter
  tableData: [], 
  selectedCol: null,
  wizardStep: 1,
  isDelimited: true,
  isSemicolon: false,
  isSplit: false,
  calculatedCols: { E: false, F: false, G: false, H: false },
  correctAnswers: 0,
  totalSteps: 16,
  // Сортировка и фильтр
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

/* ---------- Инициализация ---------- */
function resetTrainer() {
  state.currentStep = 1;
  state.tableData = JSON.parse(JSON.stringify(INITIAL_DATA));
  state.selectedCol = null;
  state.wizardStep = 1;
  state.isDelimited = true;
  state.isSemicolon = false;
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
    let start = 1;
    const pDep1 = parseInt(p.deps.split(';')[0]) || 0;
    const pDep2 = parseInt(p.deps.split(';')[1]) || 0;
    const e1 = getEndTime(pDep1);
    const e2 = getEndTime(pDep2);
    start = Math.max(e1, e2) + 1;
    return start + p.time - 1;
  };

  const e = state.calculatedCols.E ? getEndTime(dep1) : null;
  const f = state.calculatedCols.F ? getEndTime(dep2) : null;
  
  let h = null, g = null;
  if (state.calculatedCols.H) {
    h = row.time + Math.max(e || 0, f || 0);
  }
  if (state.calculatedCols.G) {
    g = (h !== null ? h : 0) - row.time + 1;
  }
  return { e, f, g, h };
}

/* ---------- Рендер таблицы с учётом сортировки и фильтра ---------- */
function renderTable() {
  // 1. Вычисляем значения для всех строк
  let rows = state.tableData.map((row, idx) => {
    const vals = computeRowValues(row);
    return { ...row, ...vals, originalIndex: idx };
  });

  // 2. Применяем фильтр
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

  // 3. Применяем сортировку
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

  // 4. Отрисовка
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  let html = '<thead><tr><th></th>';
  
  cols.forEach(col => {
    let classes = '';
    if (state.selectedCol === col && state.currentStep === 1) classes = 'active-col';
    if (state.sortCol === col) classes += state.sortDir === 'asc' ? ' sort-asc' : ' sort-desc';
    html += `<th class="${classes}" data-col="${col}">${col}</th>`;
  });
  html += '</tr></thead><tbody>';

  // Заголовки столбцов
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

  // Данные
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

  // Пустые строки для визуала
  for (let i = rows.length + 2; i <= 15; i++) {
    html += `<tr><td style="background:#f0f0f0; font-weight:bold;">${i}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`;
  }

  html += '</tbody>';
  el.calcTable.innerHTML = html;

  // Обновляем статус-бар
  if (state.filterActive) {
    el.statusBarText.textContent = `Показано ${rows.length} из ${state.tableData.length} строк (фильтр)`;
    el.filterStatus.textContent = `Найдено: ${rows.length}`;
  } else {
    el.statusBarText.textContent = `Строк: ${rows.length}`;
    el.filterStatus.textContent = '';
  }

  // Обработчики кликов по заголовкам
  el.calcTable.querySelectorAll('th').forEach(th => {
    if (th.dataset.col) {
      th.addEventListener('click', () => {
        const col = th.dataset.col;
        if (state.currentStep === 1) {
          state.selectedCol = col;
          el.cellRef.textContent = col + '1';
          renderTable();
        } else if (state.currentStep >= 11) {
          // Сортировка по клику
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

/* ---------- Обновление инструкций ---------- */
function updateInstruction() {
  const instructions = {
    1: "Шаг 1. Выделите столбец C и разделите его через меню «Данные → Текст по столбцам» с разделителем «;».",
    2: "Шаг 2. Заполняем столбец E (Окончание первой зависимости). Введите формулу для E2.",
    3: "Шаг 3. Заполняем столбец F (Окончание второй зависимости). Введите формулу для F2.",
    4: "Шаг 4. Теперь найдем время окончания самого процесса (столбец H). Введите формулу для H2.",
    5: "Шаг 5. Найдем время начала процесса (столбец G). Введите формулу для G2.",
    6: "Шаг 6. Мини-пример. Процесс A длится 3 мс, независим. Процесс B длится 2 мс и зависит от A. На какой миллисекунде начнется процесс B?",
    7: "Шаг 7. Практика. Перед вами новая таблица. Введите формулу для ячейки H4.",
    8: "Шаг 8. Практика. Введите формулу для ячейки G4.",
    9: "Шаг 9. Практика. Введите формулу для ячейки H7.",
    10: "Шаг 10. Практика. Введите формулу для ячейки G7.",
    11: "Шаг 11. Таблица заполнена. Кликните по заголовку H (Конец B), чтобы отсортировать по возрастанию. Найдите минимальное время завершения и введите его.",
    12: "Шаг 12. Кликните по заголовку H ещё раз, чтобы отсортировать по убыванию. Найдите максимальное время завершения и введите его.",
    13: "Шаг 13. Используйте панель фильтра: выберите H, условие ≤, введите 17. Нажмите «Применить». Сколько процессов осталось?",
    14: "Шаг 14. Отфильтруйте процессы, у которых начало (G) > 10. Сколько их?",
    15: "Шаг 15. Отфильтруйте процессы, у которых время (B) > 5. Сколько их?",
    16: "Шаг 16. Отфильтруйте процессы, у которых конец (H) ≤ 10. Сколько их?"
  };
  el.instruction.textContent = instructions[state.currentStep] || "";
  
  // Управление видимостью элементов
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

function setupFormulaStep() {
  const step = state.currentStep;
  el.userFormulaInput.value = '';
  el.userFormulaInput.classList.remove('ok', 'wrong');
  el.userFormulaInput.disabled = false;
  el.formulaBarDisplay.value = '';

  if (step === 2) {
    el.formulaLabel.textContent = 'Введите формулу для ячейки E2:';
    el.formulaHint.innerHTML = '💡 <b>Подсказка:</b> Используйте <code>ВПР</code> (ищет ID из C2 в диапазоне A:H, возвращает 8-й столбец). Оберните в <code>ЕСЛИОШИБКА</code>, чтобы получить 0, если зависимость = 0.';
    el.theoryBox.innerHTML = `
      <p><b>Как найти время окончания зависимости?</b></p>
      <p>У нас есть ID процесса в ячейке C2. Нам нужно найти его в основной таблице (столбец A) и взять время из столбца H (Конец B).</p>
      <p>Для этого используется функция <code>ВПР(искомое; таблица; номер_столбца; 0)</code>.</p>
      <p>Если в C2 стоит 0 (нет зависимости), ВПР выдаст ошибку. Чтобы этого избежать, используем <code>ЕСЛИОШИБКА(формула; 0)</code>.</p>
    `;
  } else if (step === 3) {
    el.formulaLabel.textContent = 'Введите формулу для ячейки F2:';
    el.formulaHint.innerHTML = '💡 <b>Подсказка:</b> Формула аналогична, но ищет она ID из ячейки <b>D2</b>.';
    el.theoryBox.innerHTML = `
      <p>Поскольку у процесса может быть до двух зависимостей, во втором столбце F мы ищем окончание для второй из них.</p>
      <p>Скопируйте логику из E2, но обратите внимание на то, какой столбец вы проверяете.</p>
    `;
  } else if (step === 4) {
    el.formulaLabel.textContent = 'Введите формулу для ячейки H2:';
    el.formulaHint.innerHTML = '💡 <b>Подсказка:</b> Время окончания = Длительность (B2) + <code>МАКС(E2:F2)</code>.';
    el.theoryBox.innerHTML = `
      <p><b>Правило:</b> Конец = Длительность + Самое позднее окончание зависимостей.</p>
      <p>Если у процесса нет зависимостей, их окончания равны 0. Тогда конец просто равен длительности.</p>
      <p>Если зависимости есть, мы берем <code>МАКС(E2:F2)</code> и прибавляем длительность.</p>
    `;
  } else if (step === 5) {
    el.formulaLabel.textContent = 'Введите формулу для ячейки G2:';
    el.formulaHint.innerHTML = '💡 <b>Подсказка:</b> Начало = Конец (H2) - Длительность (B2) + 1.';
    el.theoryBox.innerHTML = `
      <p><b>Правило отрезка:</b> Длительность = Конец − Начало + 1.</p>
      <p>Отсюда выражаем Начало: <code>Начало = Конец - Длительность + 1</code>.</p>
      <p>Нам уже известен Конец (H2) и Длительность (B2).</p>
    `;
  } else if (step === 6) {
    el.formulaLabel.textContent = 'Введите ответ (номер миллисекунды):';
    el.formulaHint.innerHTML = '💡 <b>Подсказка:</b> Процесс A занимает 1, 2 и 3. Процесс B не может начаться на 3-й, значит он начинается на следующей.';
    el.theoryBox.innerHTML = `
      <p><b>Проверим логику на примере.</b></p>
      <p>Процесс A длится 3 мс и ни от кого не зависит. Он занимает 1-ю, 2-ю и 3-ю миллисекунды.</p>
      <p>Процесс B длится 2 мс и зависит от A. Он не может начаться на 3-й мс, потому что A еще работает. Значит, B начнется на 4-й мс.</p>
    `;
  } else if (step >= 7 && step <= 10) {
    // Переключаем данные на практические
    if (state.tableData[0].id !== PRACTICE_DATA[0].id) {
      state.tableData = JSON.parse(JSON.stringify(PRACTICE_DATA));
      state.isSplit = true; 
      state.calculatedCols = { E: true, F: true, G: false, H: false };
      renderTable();
    }

    if (step === 7) {
      el.formulaLabel.textContent = 'Введите формулу для ячейки H4 (Процесс 3):';
      el.formulaHint.innerHTML = '💡 <b>Подсказка:</b> Длительность (B4) + МАКС окончаний зависимостей (E4:F4).';
      el.theoryBox.innerHTML = `<p>Практика. Примените формулу для конца процесса к новой строке.</p>`;
    } else if (step === 8) {
      el.formulaLabel.textContent = 'Введите формулу для ячейки G4 (Процесс 3):';
      el.formulaHint.innerHTML = '💡 <b>Подсказка:</b> Конец (H4) - Длительность (B4) + 1.';
      el.theoryBox.innerHTML = `<p>Практика. Примените формулу для начала процесса к новой строке.</p>`;
    } else if (step === 9) {
      el.formulaLabel.textContent = 'Введите формулу для ячейки H7 (Процесс 6):';
      el.formulaHint.innerHTML = '💡 <b>Подсказка:</b> Длительность (B7) + МАКС окончаний зависимостей (E7:F7).';
      el.theoryBox.innerHTML = `<p>Практика. Обратите внимание на номер строки.</p>`;
    } else if (step === 10) {
      el.formulaLabel.textContent = 'Введите формулу для ячейки G7 (Процесс 6):';
      el.formulaHint.innerHTML = '💡 <b>Подсказка:</b> Конец (H7) - Длительность (B7) + 1.';
      el.theoryBox.innerHTML = `<p>Практика. Последний шаг!</p>`;
    }
  } else if (step === 11) {
    // Подготовка данных для сортировки
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
    el.formulaHint.innerHTML = '💡 <b>Подсказка:</b> Кликните по заголовку H — таблица отсортируется по возрастанию. Первое значение в столбце H и есть минимум.';
    el.theoryBox.innerHTML = `<p><b>Сортировка.</b> Кликните по заголовку столбца H, чтобы упорядочить строки. При повторном клике направление меняется.</p>`;
  } else if (step === 12) {
    el.formulaLabel.textContent = 'Введите максимальное время завершения (из столбца H):';
    el.formulaHint.innerHTML = '💡 <b>Подсказка:</b> Кликните по заголовку H ещё раз (или дважды), чтобы отсортировать по убыванию. Первое значение — максимум.';
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
      el.theoryBox.innerHTML = `<p><b>Фильтр.</b> Оставьте только те строки, где значение в столбце H меньше или равно 17.</p>`;
    } else if (step === 14) {
      el.formulaLabel.textContent = 'Введите количество процессов, начавшихся после 10 мс:';
      el.formulaHint.innerHTML = '💡 <b>Подсказка:</b> Столбец G, условие >, значение 10.';
      el.theoryBox.innerHTML = `<p><b>Фильтр по началу.</b> Используйте столбец G (Начало B).</p>`;
    } else if (step === 15) {
      el.formulaLabel.textContent = 'Введите количество процессов с длительностью более 5 мс:';
      el.formulaHint.innerHTML = '💡 <b>Подсказка:</b> Столбец B, условие >, значение 5.';
      el.theoryBox.innerHTML = `<p><b>Фильтр по длительности.</b> Используйте столбец B (Время).</p>`;
    } else if (step === 16) {
      el.formulaLabel.textContent = 'Введите количество процессов, завершившихся не позднее 10 мс:';
      el.formulaHint.innerHTML = '💡 <b>Подсказка:</b> Столбец H, условие ≤, значение 10.';
      el.theoryBox.innerHTML = `<p><b>Фильтр по окончанию.</b> Используйте столбец H (Конец B).</p>`;
    }
  }
}

/* ---------- Обработка формул и ответов ---------- */
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

  // Для шагов 11-16 проверяем числовой ответ
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

  // Остальные шаги (2-10) — проверка формул
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

/* ---------- Переход ---------- */
el.nextBtn.addEventListener('click', () => {
  if (state.currentStep < state.totalSteps) {
    state.currentStep++;
    // Сброс сортировки и фильтра при переходе
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

/* ---------- Финал ---------- */
function showResult() {
  el.screenQuiz.hidden = true;
  el.screenResult.hidden = false;
  document.getElementById('finishText').innerHTML = `Вы прошли все этапы! Вы научились разделять данные, подтягивать значения зависимостей, вычислять время начала и конца процессов, а также использовать сортировку и фильтр.<br><br>Теперь вы готовы решать задание 22 на любых данных!`;
}

/* ---------- Меню данных (Шаг 1) ---------- */
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

/* ---------- Мастер (Wizard) ---------- */
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

/* ---------- Вспомогательные ---------- */
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