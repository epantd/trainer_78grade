/* =========================================================
   ТРЕНАЖЁР: Однотабличная база данных
   ========================================================= */

const ALL_NAMES = ['Иван','Анна','Максим','Ольга','Дмитрий','Елена','Артём','София','Никита','Мария','Алексей','Виктория','Сергей','Полина','Андрей','Ксения','Михаил','Алиса','Роман','Екатерина'];
const ALL_EYES = ['Голубые','Зелёные','Карие','Серые'];
const GENDERS = ['М','Ж'];
const HANDS = ['Правша','Левша'];

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function formatAvg(avg) { return String(Math.round(avg * 100) / 100); }
function numsEqual(a, b) {
  const na = parseFloat(String(a).replace(',', '.'));
  const nb = parseFloat(String(b).replace(',', '.'));
  if (isNaN(na) || isNaN(nb)) return false;
  return Math.abs(na - nb) < 0.01;
}
function displayAvg(avg) { return avg.toFixed(2); }

/* ---------- Генерация данных ---------- */
function generateData() {
  let students, valid = false, attempts = 0;
  while (!valid && attempts < 200) {
    attempts++;
    const names = shuffle([...ALL_NAMES]).slice(0, 10);
    students = names.map(name => ({
      name,
      gender: GENDERS[Math.floor(Math.random() * 2)],
      hand: Math.random() < 0.7 ? 'Правша' : 'Левша',
      eyes: ALL_EYES[Math.floor(Math.random() * ALL_EYES.length)],
      height: Math.floor(Math.random() * 51) + 150,
      rus: Math.floor(Math.random() * 4) + 2,
      math: Math.floor(Math.random() * 4) + 2,
      eng: Math.floor(Math.random() * 4) + 2
    }));
    if (new Set(students.map(s => s.gender)).size < 2) continue;
    if (new Set(students.map(s => s.hand)).size < 2) continue;
    if (new Set(students.map(s => s.eyes)).size < 2) continue;
    if (new Set(students.map(s => s.height)).size < 10) continue;
    const lefts = students.filter(s => s.hand === 'Левша');
    if (lefts.length >= 2 && new Set(lefts.map(s => s.height)).size === 1) continue;
    const cRus = students.filter(s => s.rus >= 4).length;
    const cMath = students.filter(s => s.math >= 4).length;
    const cEng = students.filter(s => s.eng >= 4).length;
    const max = Math.max(cRus, cMath, cEng);
    if (max !== cRus && max !== cMath && max !== cEng) valid = true;
    else if (cRus === max && cMath !== max && cEng !== max) valid = true;
    else if (cMath === max && cRus !== max && cEng !== max) valid = true;
    else if (cEng === max && cRus !== max && cMath !== max) valid = true;
  }
  return students;
}

/* ---------- Двойные фильтры ---------- */
function generateTwoFilterQuestions(students, n) {
  const groups = {
    hand: [
      { fn: s => s.hand === 'Правша', label: 'правши' },
      { fn: s => s.hand === 'Левша', label: 'левши' }
    ],
    gender: [
      { fn: s => s.gender === 'М', label: 'мальчики' },
      { fn: s => s.gender === 'Ж', label: 'девочки' }
    ],
    eyes: ALL_EYES.map(e => ({
      fn: s => s.eyes === e,
      label: 'с ' + e.toLowerCase() + 'ми глазами'
    })),
    subject: [
      { fn: s => s.math === 5, label: 'получившие 5 по математике' },
      { fn: s => s.rus === 5,  label: 'получившие 5 по русскому' },
      { fn: s => s.eng === 5,  label: 'получившие 5 по английскому' }
    ]
  };
  const qs = [];
  const used = new Set();
  const groupKeys = Object.keys(groups);
  let attempts = 0;
  while (qs.length < n && attempts < 500) {
    attempts++;
    const gk = shuffle(groupKeys).slice(0, 2);
    const v1 = groups[gk[0]][Math.floor(Math.random() * groups[gk[0]].length)];
    const v2 = groups[gk[1]][Math.floor(Math.random() * groups[gk[1]].length)];
    const key = v1.label + '|' + v2.label;
    if (used.has(key)) continue;
    const matches = students.filter(s => v1.fn(s) && v2.fn(s)).length;
    if (matches < 1 || matches >= students.length) continue;
    used.add(key);
    qs.push({
      text: `Сколько в классе ${v1.label} ${v2.label}?`,
      correct: String(matches)
    });
  }
  while (qs.length < n) {
    qs.push({
      text: 'Сколько в классе правшей с голубыми глазами?',
      correct: String(students.filter(s => s.hand === 'Правша' && s.eyes === 'Голубые').length)
    });
  }
  return qs;
}

function generateAvgQuestion(students) {
  const subjects = [
    { col: 'math', label: 'математике' },
    { col: 'rus',  label: 'русскому языку' },
    { col: 'eng',  label: 'английскому языку' }
  ];
  const filters = [
    { fn: s => s.hand === 'Правша', label: 'правшей' },
    { fn: s => s.hand === 'Левша',  label: 'левшей' },
    { fn: s => s.gender === 'М',    label: 'мальчиков' },
    { fn: s => s.gender === 'Ж',    label: 'девочек' }
  ];
  const subj = subjects[Math.floor(Math.random() * subjects.length)];
  const flt = filters[Math.floor(Math.random() * filters.length)];
  const matching = students.filter(flt.fn);
  const vals = matching.map(s => s[subj.col]);
  const avg = vals.length ? vals.reduce((a,b)=>a+b,0) / vals.length : 0;
  return {
    text: `Каков средний балл по ${subj.label} у ${flt.label}? (Отфильтруйте их, выделите столбец нужной оценки — «Среднее» появится в нижней панели.)`,
    correct: formatAvg(avg)
  };
}

/* ---------- Генерация вопросов ---------- */
function generateQuestions(students) {
  const qs = [];

  /* Блок 1: интерфейс */
  qs.push({ type:'choice', instruction:'Какой значок обычно используется для обозначения фильтра в электронных таблицах?', options:['🔤 (А-Я)','🔽 (Воронка)','📊 (Столбики)','Σ (Сигма)'], correct:'🔽 (Воронка)', explain:'Значок воронки (фильтра) позволяет оставить в таблице только подходящие строки.' });
  qs.push({ type:'choice', instruction:'Какой значок используется для сортировки данных по алфавиту (от А до Я)?', options:['🔤 А-Я','🔽 Воронка','📈 График','🔍 Лупа'], correct:'🔤 А-Я', explain:'Значок А-Я или стрелочки вверх/вниз используются для сортировки.' });
  qs.push({ type:'choice', instruction:'Вы выделили несколько ячеек с числами. Где посмотреть их количество или сумму?', options:['В строке формул','В статус-баре в самом низу экрана','В ячейке А1','В меню «Файл»'], correct:'В статус-баре в самом низу экрана', explain:'В нижней серой полосе (статус-баре) отображается количество, сумма и среднее значение выделенных ячеек.' });
  qs.push({ type:'choice', instruction:'Где в LibreOffice Calc находится команда вставки диаграммы?', options:['Меню «Файл»','Меню «Вставка» → «Диаграмма...»','Меню «Правка»','Меню «Сервис»'], correct:'Меню «Вставка» → «Диаграмма...»', explain:'В Calc диаграмма вставляется через меню «Вставка» → «Диаграмма...».' });

  /* Блок 2 */
  const maxH = Math.max(...students.map(s => s.height));
  const tallest = students.find(s => s.height === maxH).name;
  qs.push({ type:'input', instruction:'Выделите столбец «Рост», затем нажмите «↕ Сортировка» в верхней панели (дважды — по убыванию). Кто на самом верху?', table:true, correct: tallest, explain:`Самый высокий — ${tallest}, рост ${maxH} см.` });

  const eyeCounts = {};
  students.forEach(s => eyeCounts[s.eyes] = (eyeCounts[s.eyes] || 0) + 1);
  const eyeOptions = Object.keys(eyeCounts).filter(e => eyeCounts[e] >= 2 && eyeCounts[e] < students.length);
  const randomEye = eyeOptions.length ? eyeOptions[Math.floor(Math.random() * eyeOptions.length)] : Object.keys(eyeCounts)[0];
  qs.push({ type:'input', instruction: `Выделите заголовок «Глаза», нажмите «🔽 Фильтр» и оставьте только «${randomEye}». Сколько учеников осталось?`, table:true, correct: String(eyeCounts[randomEye]), explain: `Учеников с глазами «${randomEye}»: ${eyeCounts[randomEye]}.` });

  const minH = Math.min(...students.map(s => s.height));
  const shortest = students.find(s => s.height === minH).name;
  qs.push({ type:'input', instruction:'Выделите столбец «Рост», примените сортировку по возрастанию. Кто самый низкий?', table:true, correct: shortest, explain:`Самый низкий — ${shortest}, рост ${minH} см.` });

  qs.push({ type:'input', instruction:'Найдите всех левшей через фильтр. Сколько их?', table:true, correct: String(students.filter(s => s.hand === 'Левша').length), explain:`Левшей: ${students.filter(s => s.hand === 'Левша').length}.` });
  qs.push({ type:'input', instruction:'Отфильтруйте по полу «Ж». Сколько девочек?', table:true, correct: String(students.filter(s => s.gender === 'Ж').length), explain:`Девочек: ${students.filter(s => s.gender === 'Ж').length}.` });

  const firstAlpha = students.map(s => s.name).sort((a,b) => a.localeCompare(b))[0];
  qs.push({ type:'input', instruction:'Выделите «Имя», нажмите «↕ Сортировка». Какое имя первое?', table:true, correct: firstAlpha, explain:`Первое по алфавиту — ${firstAlpha}.` });

  /* Блок 3 */
  let combo = null;
  for (let eye of Object.keys(eyeCounts)) {
    for (let hand of HANDS) {
      const cnt = students.filter(s => s.eyes === eye && s.hand === hand).length;
      if (cnt > 0 && cnt < students.length) { combo = { eye, hand, cnt }; break; }
    }
    if (combo) break;
  }
  if (!combo) combo = { eye: randomEye, hand:'Правша', cnt: students.filter(s => s.eyes === randomEye && s.hand === 'Правша').length };
  qs.push({ type:'input', instruction: `Два фильтра: «Глаза = ${combo.eye}» и «Рука = ${combo.hand}». Сколько учеников?`, table:true, correct: String(combo.cnt), explain: `Учеников с глазами «${combo.eye}» и рукой «${combo.hand}»: ${combo.cnt}.` });

  let combo2 = null;
  for (let g of GENDERS) {
    for (let eye of Object.keys(eyeCounts)) {
      const cnt = students.filter(s => s.gender === g && s.eyes === eye).length;
      if (cnt > 0 && cnt < students.length) { combo2 = { gender: g, eye, cnt }; break; }
    }
    if (combo2) break;
  }
  if (!combo2) combo2 = { gender:'Ж', eye: randomEye, cnt: students.filter(s => s.gender === 'Ж' && s.eyes === randomEye).length };
  qs.push({ type:'input', instruction: `Два фильтра: «Пол = ${combo2.gender}» и «Глаза = ${combo2.eye}». Сколько учеников?`, table:true, correct: String(combo2.cnt), explain: `Пол «${combo2.gender}» + глаза «${combo2.eye}»: ${combo2.cnt}.` });

  const lefts = students.filter(s => s.hand === 'Левша');
  let threshold = 170;
  if (lefts.length) {
    const hs = lefts.map(s => s.height);
    threshold = Math.floor((Math.min(...hs) + Math.max(...hs)) / 2);
  }
  const leftAbove = students.filter(s => s.hand === 'Левша' && s.height > threshold).length;
  qs.push({ type:'input', instruction: `Два фильтра: «Рука = Левша» и «Рост > ${threshold}». Сколько учеников?`, table:true, correct: String(leftAbove), explain: `Левшей с ростом > ${threshold}: ${leftAbove}.` });

  /* Блок 4 */
  const cRus = students.filter(s => s.rus >= 4).length;
  const cMath = students.filter(s => s.math >= 4).length;
  const cEng = students.filter(s => s.eng >= 4).length;

  qs.push({ type:'table_input', instruction:'Подсчитайте, сколько учеников сдали каждый предмет на 4 и 5 (оценка >= 4). Заполните таблицу.', table:true, correct:{ rus: String(cRus), math: String(cMath), eng: String(cEng) }, explain: `Русский: ${cRus}, Математика: ${cMath}, Английский: ${cEng}.` });

  qs.push({ type:'chart_interactive', instruction:'Выделите таблицу с данными (клик по ней). Затем в верхней панели нажмите «Вставка → Диаграмма...», выберите «Круговая» и нажмите «Готово». Или нажмите «Проверить».', chartData:{ rus: cRus, math: cMath, eng: cEng }, explain:'Круговая диаграмма показывает доли учеников по предметам.' });

  /* Блок 5 */
  const boys = students.filter(s => s.gender === 'М').length;
  const girls = students.filter(s => s.gender === 'Ж').length;
  qs.push({ type:'chart_combined', instruction:'Подсчитайте мальчиков и девочек. Впишите числа в мини-таблицу, выделите её (кликните по ней), затем в верхней панели нажмите «Вставка → Диаграмма...» и выберите «Круговая». Или нажмите «Проверить».', table:true, tableData:[{key:'boys',label:'Мальчики'},{key:'girls',label:'Девочки'}], correct:{ boys: String(boys), girls: String(girls) }, chartLabels:{ boys:'Мальчики', girls:'Девочки' }, chartColors:{ boys:'#4f6ef7', girls:'#f59e0b' }, explain:'Круговая диаграмма показывает соотношение мальчиков и девочек.' });

  const rights = students.filter(s => s.hand === 'Правша').length;
  const lefts2 = students.filter(s => s.hand === 'Левша').length;
  qs.push({ type:'chart_combined', instruction:'Подсчитайте правшей и левшей. Впишите числа, выделите таблицу, постройте круговую диаграмму через «Вставка → Диаграмма...». Или нажмите «Проверить».', table:true, tableData:[{key:'right',label:'Правши'},{key:'left',label:'Левши'}], correct:{ right: String(rights), left: String(lefts2) }, chartLabels:{ right:'Правши', left:'Левши' }, chartColors:{ right:'#16a34a', left:'#dc2626' }, explain:'Круговая диаграмма показывает доли правшей и левшей.' });

  const eyeColors = [...new Set(students.map(s => s.eyes))].sort();
  const palette = ['#4f6ef7','#16a34a','#f59e0b','#ef4444','#8b5cf6'];
  const eyeTableData = eyeColors.map(c => ({ key: c, label: c }));
  const eyeCorrect = {}, eyeLabels = {}, eyeColorsMap = {};
  eyeColors.forEach((c, i) => {
    eyeCorrect[c] = String(students.filter(s => s.eyes === c).length);
    eyeLabels[c] = c;
    eyeColorsMap[c] = palette[i % palette.length];
  });
  qs.push({ type:'chart_combined', instruction:'Подсчитайте количество учеников с каждым цветом глаз. Впишите числа, выделите таблицу, постройте круговую диаграмму. Или нажмите «Проверить».', table:true, tableData: eyeTableData, correct: eyeCorrect, chartLabels: eyeLabels, chartColors: eyeColorsMap, explain:'Круговая диаграмма показывает распределение по цвету глаз.' });

  /* Блок 6: ПОЛНОЦЕННЫЕ (6 штук) */
  for (let i = 0; i < 6; i++) {
    let filterQuestions, attempts = 0;
    do {
      filterQuestions = generateTwoFilterQuestions(students, 3);
      const vals = filterQuestions.map(q => Number(q.correct));
      const uniq = new Set(vals);
      const sum = vals.reduce((a,b)=>a+b, 0);
      if (uniq.size >= 2 && sum >= 4 && sum <= 25) break;
      attempts++;
    } while (attempts < 30);
    qs.push({ type: 'full_chart', table: true, filterQuestions });
  }

  /* Блок 7: ПОЛНОЦЕННЫЕ + СРЕДНИЙ БАЛЛ (3 штуки) */
  for (let i = 0; i < 3; i++) {
    let filterQuestions, attempts = 0;
    do {
      filterQuestions = generateTwoFilterQuestions(students, 3);
      const vals = filterQuestions.map(q => Number(q.correct));
      const uniq = new Set(vals);
      const sum = vals.reduce((a,b)=>a+b, 0);
      if (uniq.size >= 2 && sum >= 4 && sum <= 25) break;
      attempts++;
    } while (attempts < 30);
    const avgQuestion = generateAvgQuestion(students);
    qs.push({ type: 'full_chart_avg', table: true, filterQuestions, avgQuestion });
  }

  return qs;
}

/* ---------- Состояние ---------- */
let STUDENTS = [], QUESTIONS = [];
const state = {
  qIndex: 0, correct: 0, answered: false, selection: null,
  filters: {}, sort: { col: null, dir: 'asc' },
  selectedHeaders: new Set(),
  filterHeaders: new Set(),
  activeMiniTable: null,
  activeChartCheck: null
};

const COLUMNS = [
  { key:'name', label:'Имя' }, { key:'gender', label:'Пол' }, { key:'hand', label:'Рука' },
  { key:'eyes', label:'Глаза' }, { key:'height', label:'Рост' },
  { key:'rus', label:'Рус' }, { key:'math', label:'Мат' }, { key:'eng', label:'Англ' }
];

/* ---------- DOM ---------- */
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
  backBtn: document.getElementById('backBtn'),
  helpBtn: document.getElementById('helpBtn'),
  helpModal: document.getElementById('helpModal'),
  closeHelpBtn: document.getElementById('closeHelpBtn')
};

/* ---------- Логика таблицы ---------- */
function getFilteredData() {
  let data = [...STUDENTS];
  for (const col in state.filters) {
    const v = state.filters[col];
    if (v && v !== 'all') data = data.filter(r => String(r[col]) === String(v));
  }
  if (state.sort.col) {
    const { col, dir } = state.sort;
    data.sort((a, b) => {
      const va = a[col], vb = b[col];
      if (typeof va === 'string') return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return dir === 'asc' ? va - vb : vb - va;
    });
  }
  return data;
}
function getLastSelectedColumn() {
  const arr = [...state.selectedHeaders];
  return arr.length > 0 ? arr[arr.length - 1] : null;
}
function getColumnStats(colKey) {
  const data = getFilteredData();
  const vals = data.map(s => s[colKey]).map(Number).filter(v => !isNaN(v));
  if (!vals.length) return { count: data.length, sum: 0, avg: 0, hasNumeric: false };
  const sum = vals.reduce((a,b)=>a+b, 0);
  return { count: data.length, sum, avg: sum / vals.length, hasNumeric: true };
}

function renderTable(container) {
  const data = getFilteredData();
  const statsCol = getLastSelectedColumn();

  let html = '<div class="data-toolbar">';
  html += '<span class="data-toolbar-label">Таблица данных</span>';
  html += '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">';
  html += '<div class="menu-wrapper">';
  html += '<button class="toolbar-btn" id="insertMainBtn" type="button">Вставка ▾</button>';
  html += '<div class="dropdown-menu" id="insertMainMenu" hidden>';
  html += '<button class="dropdown-item" id="insertMainChart" type="button">📊 Диаграмма...</button>';
  html += '</div>';
  html += '</div>';
  html += '<button class="toolbar-btn" id="sortMainBtn" type="button">↕ Сортировка</button>';
  html += '<button class="toolbar-btn" id="filterMainBtn" type="button">🔽 Фильтр</button>';
  html += '<button class="toolbar-btn" id="resetMainBtn" type="button">✖ Сбросить</button>';
  html += '</div></div>';

  html += '<div class="table-wrap"><table class="data-table"><thead><tr>';
  COLUMNS.forEach(col => {
    const isSel = state.selectedHeaders.has(col.key);
    const fEnabled = state.filterHeaders.has(col.key);
    html += `<th class="header-cell${isSel ? ' selected-header' : ''}" data-col="${col.key}">`;
    html += '<div class="th-inner">';
    html += `<span>${col.label}</span>`;
    if (state.sort.col === col.key) {
      html += `<span class="sort-indicator">${state.sort.dir === 'asc' ? '↑' : '↓'}</span>`;
    }
    if (fEnabled) {
      const uniq = [...new Set(STUDENTS.map(s => s[col.key]))].sort();
      const val = state.filters[col.key] || 'all';
      html += `<select class="filter-select" data-col="${col.key}"><option value="all">Все</option>`;
      uniq.forEach(v => {
        html += `<option value="${v}"${val == v ? ' selected' : ''}>${v}</option>`;
      });
      html += '</select>';
    }
    html += '</div></th>';
  });
  html += '</tr></thead><tbody>';

  if (data.length === 0) {
    html += '<tr><td colspan="8" style="text-align:center; color:var(--muted); padding:20px;">Нет данных по фильтру</td></tr>';
  } else {
    data.forEach(s => {
      html += `<tr><td>${s.name}</td><td>${s.gender}</td><td>${s.hand}</td><td>${s.eyes}</td><td>${s.height}</td><td>${s.rus}</td><td>${s.math}</td><td>${s.eng}</td></tr>`;
    });
  }
  html += '</tbody></table></div>';

  html += '<div class="db-status-bar">';
  html += `<span>Строк: <b>${data.length}</b></span>`;
  if (statsCol) {
    const stats = getColumnStats(statsCol);
    const colLabel = COLUMNS.find(c => c.key === statsCol)?.label || statsCol;
    html += `<span>Столбец: <b>${colLabel}</b></span>`;
    if (stats.hasNumeric) {
      html += `<span>Сумма: <b>${stats.sum}</b></span>`;
      html += `<span>Среднее: <b>${displayAvg(stats.avg)}</b></span>`;
    }
  }
  html += '</div>';

  container.innerHTML = html;

  container.querySelectorAll('.header-cell').forEach(th => {
    th.addEventListener('click', (e) => {
      if (e.target.closest('.sort-btn') || e.target.closest('.filter-select')) return;
      const col = th.dataset.col;
      if (state.selectedHeaders.has(col)) state.selectedHeaders.delete(col);
      else state.selectedHeaders.add(col);
      renderTable(container);
    });
  });

  const insertBtn = container.querySelector('#insertMainBtn');
  const insertMenu = container.querySelector('#insertMainMenu');
  insertBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    insertMenu.hidden = !insertMenu.hidden;
  });
  container.querySelector('#insertMainChart').addEventListener('click', (e) => {
    e.stopPropagation();
    insertMenu.hidden = true;
    if (!state.activeMiniTable || !state.activeMiniTable.onInsert) {
      setFeedback('warn', 'Сначала выделите мини-таблицу с ответами (кликните по ней).');
      return;
    }
    state.activeMiniTable.onInsert();
  });

  container.querySelector('#sortMainBtn').addEventListener('click', () => {
    if (!statsCol) {
      setFeedback('warn', 'Сначала выделите столбец (кликните по заголовку), затем нажмите «Сортировка».');
      return;
    }
    if (state.sort.col === statsCol) state.sort.dir = state.sort.dir === 'asc' ? 'desc' : 'asc';
    else { state.sort.col = statsCol; state.sort.dir = 'asc'; }
    renderTable(container);
  });

  container.querySelector('#filterMainBtn').addEventListener('click', () => {
    if (state.selectedHeaders.size === 0) {
      if (state.filterHeaders.size > 0) {
        state.filterHeaders.clear();
        state.filters = {};
        renderTable(container);
      } else {
        setFeedback('warn', 'Сначала выделите заголовки столбцов (кликните по ним), затем нажмите «Фильтр».');
      }
    } else {
      state.selectedHeaders.forEach(h => state.filterHeaders.add(h));
      state.selectedHeaders.clear();
      renderTable(container);
    }
  });

  container.querySelector('#resetMainBtn').addEventListener('click', () => {
    state.filters = {};
    state.filterHeaders.clear();
    state.selectedHeaders.clear();
    state.sort = { col: null, dir: 'asc' };
    renderTable(container);
  });

  container.querySelectorAll('.filter-select').forEach(sel => {
    sel.addEventListener('click', e => e.stopPropagation());
    sel.addEventListener('change', () => {
      const col = sel.dataset.col;
      if (sel.value === 'all') delete state.filters[col];
      else state.filters[col] = sel.value;
      renderTable(container);
    });
  });
}

/* ---------- Хелперы ---------- */
function currentQuestion() { return QUESTIONS[state.qIndex]; }
function setFeedback(kind, text) {
  el.feedback.className = 'feedback' + (kind ? ' ' + kind : '');
  el.feedback.textContent = text || '';
}
function updateProgress(done) {
  const total = QUESTIONS.length;
  const d = state.qIndex + (done ? 1 : 0);
  el.progressText.textContent = `Задание ${state.qIndex + 1} из ${total}`;
  el.progressFill.style.width = Math.round((d / total) * 100) + '%';
}

/* ---------- Рендер вопроса ---------- */
function renderQuestion() {
  const q = currentQuestion();
  state.answered = false;
  state.selection = null;
  state.filters = {};
  state.sort = { col: null, dir: 'asc' };
  state.selectedHeaders = new Set();
  state.filterHeaders = new Set();
  state.activeMiniTable = null;
  state.activeChartCheck = null;

  el.instruction.textContent = q.instruction || '';
  el.taskBody.innerHTML = '';
  setFeedback('', '');
  el.checkBtn.hidden = false;
  el.checkBtn.disabled = false;
  el.nextBtn.hidden = true;
  el.nextBtn.textContent = (state.qIndex === QUESTIONS.length - 1) ? 'Завершить ✓' : 'Далее →';
  updateProgress(false);

  if (q.table) {
    const tc = document.createElement('div');
    tc.id = 'table-container';
    el.taskBody.appendChild(tc);
    renderTable(tc);
  }

  const ac = document.createElement('div');
  ac.id = 'answer-container';
  el.taskBody.appendChild(ac);

  if (q.type === 'choice') renderChoice(q, ac);
  else if (q.type === 'input') renderInput(q, ac);
  else if (q.type === 'table_input') renderTableInput(q, ac);
  else if (q.type === 'chart_interactive') renderChartInteractive(q, ac, !!q.table);
  else if (q.type === 'chart_combined') renderChartCombined(q, ac, !!q.table);
  else if (q.type === 'full_chart') renderFullChart(q, ac, false);
  else if (q.type === 'full_chart_avg') renderFullChart(q, ac, true);
}

/* ---------- Тип: выбор ---------- */
function renderChoice(q, c) {
  const wrap = document.createElement('div');
  wrap.className = 'options';
  shuffle(q.options.slice()).forEach(opt => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      if (state.answered) return;
      state.selection = opt;
      Array.from(wrap.children).forEach(x => x.classList.toggle('selected', x === btn));
    });
    wrap.appendChild(btn);
  });
  c.appendChild(wrap);
}

/* ---------- Тип: ввод ---------- */
function renderInput(q, c) {
  const wrap = document.createElement('div');
  wrap.className = 'input-wrap';
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'input-answer';
  input.placeholder = 'Введите ответ...';
  input.autocomplete = 'off';
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); checkAnswer(); }
  });
  wrap.appendChild(input);
  c.appendChild(wrap);
  state.selection = input;
}

/* ---------- Тип: мини-таблица с вводом ---------- */
function renderTableInput(q, c) {
  const table = document.createElement('table');
  table.className = 'mini-table';
  table.innerHTML = '<thead><tr><th>Предмет</th><th>Сдали на 4 и 5</th></tr></thead><tbody></tbody>';
  const subs = [{ key:'rus', label:'Русский язык' },{ key:'math', label:'Математика' },{ key:'eng', label:'Английский язык' }];
  state.selection = {};
  subs.forEach(sub => {
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    td1.textContent = sub.label;
    const td2 = document.createElement('td');
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.className = 'table-input';
    inp.placeholder = '?';
    inp.dataset.key = sub.key;
    td2.appendChild(inp);
    tr.appendChild(td1); tr.appendChild(td2);
    table.querySelector('tbody').appendChild(tr);
    state.selection[sub.key] = inp;
  });
  c.appendChild(table);
}

/* ---------- Хелпер: тулбар для мини-таблиц без основной таблицы ---------- */
function createStandaloneInsertToolbar(c, afterEl) {
  const topbar = document.createElement('div');
  topbar.className = 'data-toolbar';
  topbar.style.marginBottom = '10px';
  topbar.innerHTML = `
    <span class="data-toolbar-label">Мини-таблица</span>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      <div class="menu-wrapper">
        <button class="toolbar-btn" data-std-insert-btn type="button">Вставка ▾</button>
        <div class="dropdown-menu" data-std-insert-menu hidden>
          <button class="dropdown-item" data-std-insert-chart type="button">📊 Диаграмма...</button>
        </div>
      </div>
    </div>
  `;
  c.insertBefore(topbar, afterEl);

  const btn = topbar.querySelector('[data-std-insert-btn]');
  const menu = topbar.querySelector('[data-std-insert-menu]');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
  });
  topbar.querySelector('[data-std-insert-chart]').addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden = true;
    if (!state.activeMiniTable || !state.activeMiniTable.onInsert) {
      setFeedback('warn', 'Сначала выделите мини-таблицу (кликните по ней).');
      return;
    }
    state.activeMiniTable.onInsert();
  });
}

/* ---------- Выделение мини-таблицы ---------- */
function setupMiniTableSelect(table, statusEl, tryInsertChart) {
  let selected = false;
  const mark = () => {
    if (selected) return;
    selected = true;
    table.classList.add('selected');
    if (statusEl) {
      statusEl.textContent = '✓ Мини-таблица выделена';
      statusEl.style.color = 'var(--green)';
      statusEl.style.fontWeight = '700';
    }
    state.activeMiniTable = { onInsert: tryInsertChart };
  };
  table.addEventListener('click', (e) => {
    if (e.target.tagName === 'INPUT') return;
    mark();
  });
  table.querySelectorAll('.table-input').forEach(inp => {
    inp.addEventListener('focus', mark);
  });
}

/* ---------- Тип: chart_interactive ---------- */
function renderChartInteractive(q, c, hasMainTable) {
  const table = document.createElement('table');
  table.className = 'mini-table';
  table.innerHTML = `<thead><tr><th>Предмет</th><th>Сдали на 4 и 5</th></tr></thead><tbody>
    <tr><td>Русский язык</td><td>${q.chartData.rus}</td></tr>
    <tr><td>Математика</td><td>${q.chartData.math}</td></tr>
    <tr><td>Английский язык</td><td>${q.chartData.eng}</td></tr>
  </tbody>`;

  const statusEl = document.createElement('p');
  statusEl.style.cssText = 'font-size:13px;color:var(--muted);text-align:center;margin:6px 0;font-weight:500;';
  statusEl.textContent = '○ Мини-таблица не выделена';

  const chartContainer = document.createElement('div');
  chartContainer.style.cssText = 'display:none;flex-direction:column;align-items:center;gap:16px;margin-top:20px;';

  if (!hasMainTable) {
    c.appendChild(table);
    createStandaloneInsertToolbar(c, c.firstChild);
    c.appendChild(statusEl);
    c.appendChild(chartContainer);
  } else {
    c.appendChild(table);
    c.appendChild(statusEl);
    c.appendChild(chartContainer);
  }

  const buildChartAndFinish = () => {
    chartContainer.style.display = 'flex';
    chartContainer.innerHTML = buildPie(
      q.chartData,
      { rus:'Русский', math:'Математика', eng:'Английский' },
      { rus:'#4f6ef7', math:'#16a34a', eng:'#f59e0b' }
    );
    state.answered = true;
    state.correct++;
    el.checkBtn.hidden = true;
    el.nextBtn.hidden = false;
    updateProgress(true);
    setFeedback('success', '✅ Диаграмма построена! ' + (q.explain || ''));
  };

  const tryInsertChart = () => {
    openChartWizard({
      onInsert: (chartType, api) => {
        if (chartType !== 'pie') {
          api.showMessage('Для сравнения частей целого нужна круговая диаграмма. Выберите «Круговая».');
          return;
        }
        api.close();
        buildChartAndFinish();
      }
    });
  };

  // Кнопка «Проверить» для этого типа — сразу строит диаграмму
  state.activeChartCheck = () => {
    buildChartAndFinish();
  };

  setupMiniTableSelect(table, statusEl, tryInsertChart);
}

/* ---------- Тип: chart_combined ---------- */
function renderChartCombined(q, c, hasMainTable) {
  const table = document.createElement('table');
  table.className = 'mini-table';
  let thead = '<thead><tr><th>Категория</th><th>Количество</th></tr></thead>';
  let tbody = '<tbody>';
  q.tableData.forEach(row => {
    tbody += `<tr><td>${row.label}</td><td><input type="text" class="table-input" data-key="${row.key}" placeholder="?"></td></tr>`;
  });
  tbody += '</tbody>';
  table.innerHTML = thead + tbody;

  state.selection = {};
  table.querySelectorAll('.table-input').forEach(inp => {
    state.selection[inp.dataset.key] = inp;
  });

  const statusEl = document.createElement('p');
  statusEl.style.cssText = 'font-size:13px;color:var(--muted);text-align:center;margin:6px 0;font-weight:500;';
  statusEl.textContent = '○ Мини-таблица не выделена';

  const chartContainer = document.createElement('div');
  chartContainer.style.cssText = 'display:none;flex-direction:column;align-items:center;gap:16px;margin-top:20px;';

  if (!hasMainTable) {
    c.appendChild(table);
    createStandaloneInsertToolbar(c, c.firstChild);
    c.appendChild(statusEl);
    c.appendChild(chartContainer);
  } else {
    c.appendChild(table);
    c.appendChild(statusEl);
    c.appendChild(chartContainer);
  }

  const checkAndFinish = (requireAllFilled) => {
    let hasEmpty = false;
    for (const k in state.selection) if (!state.selection[k].value.trim()) hasEmpty = true;
    if (hasEmpty) {
      setFeedback('warn', 'Заполните все ячейки в таблице.');
      return;
    }

    let ok = true;
    for (const k in state.selection) {
      const inp = state.selection[k];
      if (inp.value.trim() === q.correct[k]) {
        inp.classList.add('ok');
        inp.classList.remove('wrong');
      } else {
        ok = false;
        inp.classList.remove('ok');
        inp.classList.add('wrong');
        inp.value = q.correct[k]; // показываем правильное
      }
      inp.disabled = true;
    }

    // Строим диаграмму с правильными значениями
    chartContainer.style.display = 'flex';
    const chartData = {};
    for (const k in q.correct) chartData[k] = Number(q.correct[k]);
    chartContainer.innerHTML = buildPie(chartData, q.chartLabels, q.chartColors);

    state.answered = true;
    if (ok) state.correct++;
    el.checkBtn.hidden = true;
    el.nextBtn.hidden = false;
    updateProgress(true);

    if (ok) setFeedback('success', '✅ Правильно! ' + (q.explain || ''));
    else setFeedback('error', '❌ Есть ошибки. Правильные значения подсвечены. ' + (q.explain || ''));
  };

  const tryInsertChart = () => {
    openChartWizard({
      onInsert: (chartType, api) => {
        if (chartType !== 'pie') {
          api.showMessage('Для сравнения частей целого нужна круговая диаграмма.');
          return;
        }
        api.close();
        checkAndFinish(true);
      }
    });
  };

  state.activeChartCheck = () => checkAndFinish(true);

  setupMiniTableSelect(table, statusEl, tryInsertChart);
}

/* ---------- Тип: full_chart и full_chart_avg ---------- */
function renderFullChart(q, c, hasAvg) {
  const intro = document.createElement('div');
  intro.className = 'formula-box';
  intro.innerHTML = '📌 <b>Порядок работы:</b><br>' +
    '① С помощью фильтров (🔽 Фильтр) определите три значения.<br>' +
    '② Впишите их в мини-таблицу.<br>' +
    '③ Выделите мини-таблицу (кликните по ней).<br>' +
    '④ «Вставка → Диаграмма...» → выберите «Круговая» → «Готово».<br>' +
    '<i>Или нажмите «Проверить», чтобы увидеть результат сразу.</i>';
  c.appendChild(intro);

  const table = document.createElement('table');
  table.className = 'mini-table';
  let tbody = '';
  q.filterQuestions.forEach((fq, i) => {
    tbody += `<tr>
      <td style="text-align:left;padding:8px;font-size:13.5px">${i+1}. ${escapeHtml(fq.text)}</td>
      <td style="width:80px"><input type="text" class="table-input" data-key="q${i}" placeholder="?"></td>
    </tr>`;
  });
  table.innerHTML = '<thead><tr><th>Вопрос</th><th>Ответ</th></tr></thead><tbody>' + tbody + '</tbody>';
  c.appendChild(table);

  state.selection = {};
  table.querySelectorAll('.table-input').forEach(inp => {
    state.selection[inp.dataset.key] = inp;
  });

  let avgInput = null;
  if (hasAvg) {
    const avgBox = document.createElement('div');
    avgBox.style.cssText = 'margin:18px auto;padding:14px 18px;background:#fef3c7;border-left:4px solid #b45309;border-radius:10px;max-width:600px;';
    avgBox.innerHTML = `
      <p style="margin:0 0 10px;font-size:14px;line-height:1.5;"><b>🧮 Дополнительный вопрос:</b> ${escapeHtml(q.avgQuestion.text)}</p>
      <input type="text" class="table-input" id="avgInput" placeholder="Средний балл" style="width:140px;margin:0 auto;display:block;">
    `;
    c.appendChild(avgBox);
    avgInput = avgBox.querySelector('#avgInput');
  }

  const statusEl = document.createElement('p');
  statusEl.style.cssText = 'font-size:13px;color:var(--muted);text-align:center;margin:6px 0;font-weight:500;';
  statusEl.textContent = '○ Мини-таблица не выделена';
  c.appendChild(statusEl);

  const chartContainer = document.createElement('div');
  chartContainer.style.cssText = 'display:none;flex-direction:column;align-items:center;gap:16px;margin-top:20px;';
  c.appendChild(chartContainer);

  const checkAndFinish = (requireAllFilled) => {
    // Проверяем 3 значения
    let hasEmpty = false;
    for (const k in state.selection) if (!state.selection[k].value.trim()) hasEmpty = true;
    if (hasEmpty) {
      setFeedback('warn', 'Заполните все три ячейки в мини-таблице.');
      return;
    }

    if (hasAvg && avgInput) {
      if (!avgInput.value.trim()) {
        setFeedback('warn', 'Введите ответ на дополнительный вопрос про средний балл.');
        return;
      }
    }

    let ok = true;
    for (const k in state.selection) {
      const inp = state.selection[k];
      const idx = +k.slice(1);
      if (inp.value.trim() === q.filterQuestions[idx].correct) {
        inp.classList.add('ok');
        inp.classList.remove('wrong');
      } else {
        ok = false;
        inp.classList.remove('ok');
        inp.classList.add('wrong');
        inp.value = q.filterQuestions[idx].correct;
      }
      inp.disabled = true;
    }

    if (hasAvg && avgInput) {
      if (!numsEqual(avgInput.value, q.avgQuestion.correct)) {
        ok = false;
        avgInput.classList.add('wrong');
        avgInput.classList.remove('ok');
        avgInput.value = q.avgQuestion.correct;
      } else {
        avgInput.classList.add('ok');
        avgInput.classList.remove('wrong');
      }
      avgInput.disabled = true;
    }

    // Строим диаграмму с правильными значениями
    chartContainer.style.display = 'flex';
    const chartData = {};
    const labels = {};
    q.filterQuestions.forEach((fq, i) => {
      chartData['q' + i] = Number(fq.correct);
      labels['q' + i] = 'Вопрос ' + (i + 1);
    });
    const colors = { q0: '#4f6ef7', q1: '#16a34a', q2: '#f59e0b' };
    chartContainer.innerHTML = buildPie(chartData, labels, colors);

    state.answered = true;
    if (ok) state.correct++;
    el.checkBtn.hidden = true;
    el.nextBtn.hidden = false;
    updateProgress(true);

    if (ok) setFeedback('success', '✅ Правильно! Диаграмма построена.');
    else setFeedback('error', '❌ Есть ошибки. Правильные ответы подсвечены.');
  };

  const tryInsertChart = () => {
    openChartWizard({
      onInsert: (chartType, api) => {
        if (chartType !== 'pie') {
          api.showMessage('Для сравнения частей целого нужна круговая диаграмма.');
          return;
        }
        api.close();
        checkAndFinish(true);
      }
    });
  };

  state.activeChartCheck = () => checkAndFinish(true);

  setupMiniTableSelect(table, statusEl, tryInsertChart);
}

/* ---------- Мастер диаграмм ---------- */
function openChartWizard({ onInsert }) {
  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.innerHTML = `
    <div class="modal-content" style="max-width: 440px;">
      <button class="modal-close" id="cwClose">&times;</button>
      <h2>Мастер диаграмм</h2>
      <p style="margin: 0 0 16px; color: var(--muted); font-size: 14px;">Выберите тип диаграммы:</p>
      <div class="chart-type-options">
        <label class="chart-type-option"><input type="radio" name="chartType" value="bar"><span>📊 Столбчатая</span></label>
        <label class="chart-type-option"><input type="radio" name="chartType" value="pie"><span>🥧 Круговая</span></label>
        <label class="chart-type-option"><input type="radio" name="chartType" value="line"><span>📈 Линейная</span></label>
      </div>
      <p class="chart-wizard-msg" id="cwMsg"></p>
      <div class="actions">
        <button class="btn btn-outline" id="cwCancel">Отмена</button>
        <button class="btn btn-primary" id="cwOk">Готово</button>
      </div>
    </div>
  `;
  document.body.appendChild(ov);

  const updateActive = () => {
    ov.querySelectorAll('.chart-type-option').forEach(l => l.classList.remove('active'));
    const checked = ov.querySelector('input[name="chartType"]:checked');
    if (checked) checked.closest('.chart-type-option').classList.add('active');
  };
  updateActive();

  const close = () => { ov.remove(); document.body.style.overflow = ''; };
  const showMessage = (msg) => { ov.querySelector('#cwMsg').textContent = msg; };
  document.body.style.overflow = 'hidden';

  ov.querySelector('#cwClose').addEventListener('click', close);
  ov.querySelector('#cwCancel').addEventListener('click', close);
  ov.querySelectorAll('input[name="chartType"]').forEach(r => r.addEventListener('change', () => {
    updateActive();
    ov.querySelector('#cwMsg').textContent = '';
  }));
  ov.querySelector('#cwOk').addEventListener('click', () => {
    const checked = ov.querySelector('input[name="chartType"]:checked');
    if (!checked) {
      showMessage('Выберите тип диаграммы.');
      return;
    }
    onInsert(checked.value, { close, showMessage });
  });
}

/* ---------- Круговая диаграмма ---------- */
function buildPie(data, labels, colors) {
  let total = 0;
  for (const k in data) total += data[k];
  if (total === 0) return '<p>Нет данных</p>';
  const parts = [], legend = [];
  let acc = 0;
  Object.keys(data).forEach((k, i) => {
    const pct = (data[k] / total) * 100;
    const color = colors[k] || `hsl(${i * 60}, 70%, 50%)`;
    parts.push(`${color} ${acc}% ${acc + pct}%`);
    acc += pct;
    legend.push(`<span><i style="background:${color}"></i> ${labels[k]} (${data[k]})</span>`);
  });
  const gradient = `conic-gradient(${parts.join(', ')})`;
  return `
    <div style="background: ${gradient}; width: 180px; height: 180px; border-radius: 50%; margin: 0 auto;"></div>
    <div class="chart-legend">${legend.join('')}</div>
  `;
}

/* ---------- Проверка ---------- */
function markChoice(q) {
  el.taskBody.querySelectorAll('.option').forEach(b => {
    b.disabled = true;
    b.classList.remove('selected');
    if (b.textContent === q.correct) b.classList.add('ok');
    else if (state.selection === b.textContent) b.classList.add('wrong');
  });
}
function markInput(q) {
  const inp = state.selection;
  inp.disabled = true;
  const u = inp.value.trim().toLowerCase().replace(/\s/g, '');
  const c = q.correct.toLowerCase().replace(/\s/g, '');
  if (u === c) inp.classList.add('ok');
  else { inp.classList.add('wrong'); inp.value = q.correct; }
}
function markTable(q) {
  let ok = true;
  for (const k in state.selection) {
    const inp = state.selection[k];
    inp.disabled = true;
    if (inp.value.trim() === q.correct[k]) inp.classList.add('ok');
    else { inp.classList.add('wrong'); inp.value = q.correct[k]; ok = false; }
  }
  return ok;
}

function checkAnswer() {
  if (state.answered) return;
  const q = currentQuestion();

  // Задания с диаграммами — делегируем активной функции
  if (q.type === 'chart_interactive' || q.type === 'chart_combined' ||
      q.type === 'full_chart' || q.type === 'full_chart_avg') {
    if (typeof state.activeChartCheck === 'function') {
      state.activeChartCheck();
    } else {
      setFeedback('warn', 'Сначала выделите мини-таблицу или заполните её.');
    }
    return;
  }

  let ok = false, corrText = '';
  if (q.type === 'choice') {
    if (!state.selection) { setFeedback('warn', 'Выберите вариант ответа.'); return; }
    ok = state.selection === q.correct;
    corrText = q.correct;
    markChoice(q);
  } else if (q.type === 'input') {
    if (!state.selection.value.trim()) { setFeedback('warn', 'Введите ответ.'); return; }
    const u = state.selection.value.trim().toLowerCase().replace(/\s/g, '');
    const c = q.correct.toLowerCase().replace(/\s/g, '');
    ok = u === c;
    corrText = q.correct;
    markInput(q);
  } else if (q.type === 'table_input') {
    for (const k in state.selection) {
      if (!state.selection[k].value.trim()) { setFeedback('warn', 'Заполните все ячейки.'); return; }
    }
    ok = markTable(q);
    corrText = `Русский: ${q.correct.rus}, Математика: ${q.correct.math}, Английский: ${q.correct.eng}`;
  }

  state.answered = true;
  if (ok) state.correct++;
  el.checkBtn.hidden = true;
  el.nextBtn.hidden = false;
  updateProgress(true);

  if (ok) setFeedback('success', '✅ Правильно! ' + (q.explain || ''));
  else setFeedback('error', `❌ Неправильно. Правильный ответ: ${corrText}. ` + (q.explain || ''));
}

/* ---------- Переход ---------- */
function nextQuestion() {
  if (!state.answered) return;
  if (state.qIndex + 1 >= QUESTIONS.length) { showResult(); return; }
  state.qIndex++;
  renderQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- Результат ---------- */
function showResult() {
  const total = QUESTIONS.length;
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

/* ---------- Справка ---------- */
function openHelp() { el.helpModal.hidden = false; document.body.style.overflow = 'hidden'; }
function closeHelp() { el.helpModal.hidden = true; document.body.style.overflow = ''; }
el.helpBtn.addEventListener('click', openHelp);
el.closeHelpBtn.addEventListener('click', closeHelp);
el.helpModal.addEventListener('click', e => { if (e.target === el.helpModal) closeHelp(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !el.helpModal.hidden) closeHelp();
});

/* ---------- Закрытие меню по клику вне ---------- */
document.addEventListener('click', e => {
  document.querySelectorAll('.dropdown-menu:not([hidden])').forEach(menu => {
    if (!e.target.closest('.menu-wrapper')) menu.hidden = true;
  });
});

/* ---------- Старт ---------- */
function startOver() {
  STUDENTS = generateData();
  QUESTIONS = generateQuestions(STUDENTS);
  state.qIndex = 0;
  state.correct = 0;
  state.answered = false;
  el.screenResult.hidden = true;
  el.screenQuiz.hidden = false;
  renderQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
el.checkBtn.addEventListener('click', checkAnswer);
el.nextBtn.addEventListener('click', nextQuestion);
el.retryBtn.addEventListener('click', startOver);
el.backBtn.addEventListener('click', () => history.back());

STUDENTS = generateData();
QUESTIONS = generateQuestions(STUDENTS);
renderQuestion();
