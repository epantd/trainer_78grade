'use strict';

/* ==========================================================
   ТРЕНАЖЁР: Построение графа + кратчайший путь (27 заданий)
   ========================================================== */

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

const NODES = ['A', 'B', 'C', 'D', 'E'];
const COORDS = {
  'A': { x: 80,  y: 150 },
  'B': { x: 220, y: 80 },
  'C': { x: 420, y: 80 },
  'D': { x: 320, y: 200 },
  'E': { x: 220, y: 270 }
};

// Фиксированный граф для первых 9 заданий
const BASE_GRAPH = {
  A: { B: 1 },
  B: { A: 1, C: 2, D: 2, E: 7 },
  C: { B: 2, E: 3 },
  D: { B: 2, E: 4 },
  E: { B: 7, C: 3, D: 4 }
};

/* ==========================================================
   ГЕНЕРАТОР СЛУЧАЙНЫХ ГРАФОВ (5 вершин, дерево + 1-2 ребра)
   ========================================================== */

function generateRandomGraph() {
  const graph = {};
  NODES.forEach(n => graph[n] = {});

  // Дерево: 4 ребра (n-1)
  for (let i = 1; i < NODES.length; i++) {
    const parent = NODES[randInt(0, i - 1)];
    const child = NODES[i];
    const w = randInt(1, 9);
    graph[parent][child] = w;
    graph[child][parent] = w;
  }

  // 1–2 дополнительных ребра
  const extra = randInt(1, 2);
  let added = 0;
  for (let attempt = 0; attempt < 50 && added < extra; attempt++) {
    const u = NODES[randInt(0, 4)];
    const v = NODES[randInt(0, 4)];
    if (u === v) continue;
    if (graph[u][v] !== undefined) continue;
    const w = randInt(1, 9);
    graph[u][v] = w;
    graph[v][u] = w;
    added++;
  }

  return graph;
}

/* ==========================================================
   ТАБЛИЦА СМЕЖНОСТИ
   ========================================================== */

function getTableHTML(graph) {
  let html = '<table class="data-table"><tr><th></th>';
  NODES.forEach(n => html += `<th>${n}</th>`);
  html += '</tr>';

  NODES.forEach(r => {
    html += `<tr><th>${r}</th>`;
    NODES.forEach(c => {
      if (r === c) html += `<td class="empty"></td>`;
      else if (graph[r] && graph[r][c]) html += `<td>${graph[r][c]}</td>`;
      else html += `<td></td>`;
    });
    html += '</tr>';
  });
  html += '</table>';
  return html;
}

/* ==========================================================
   РИСОВАНИЕ ГРАФА
   ========================================================== */

function getGraphHTML(graph, options = {}) {
  let lines = '';
  let texts = '';
  let nodes = '';

  const showEdges = options.showEdges;
  const showWeights = options.showWeights !== false;
  const okEdges = options.okEdges || [];
  const wrongEdges = options.wrongEdges || [];
  const missedEdges = options.missedEdges || [];
  const activeNode = options.activeNode;

  const edgesToDraw = [];

  for (let u in graph) {
    for (let v in graph[u]) {
      const id = [u, v].sort().join('-');
      if (edgesToDraw.find(e => e.id === id)) continue;
      const exists = showEdges === undefined || showEdges.includes(id);
      if (!exists) continue;
      edgesToDraw.push({ id, u, v, weight: graph[u][v], exists: true });
    }
  }

  if (showEdges) {
    showEdges.forEach(id => {
      if (edgesToDraw.find(e => e.id === id)) return;
      const [u, v] = id.split('-');
      edgesToDraw.push({ id, u, v, weight: null, exists: false });
    });
  }

  edgesToDraw.forEach(e => {
    const p1 = COORDS[e.u];
    const p2 = COORDS[e.v];
    if (!p1 || !p2) return;

    let cls = 'graph-edge';
    if (okEdges.includes(e.id)) cls += ' ok';
    else if (wrongEdges.includes(e.id)) cls += ' wrong';
    else if (missedEdges.includes(e.id)) cls += ' missed';
    else if (!e.exists) cls += ' unknown';

    lines += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" class="${cls}"/>`;

    if (showWeights && e.weight !== null) {
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      texts += `<circle cx="${mx}" cy="${my}" r="12" fill="#f8fafc" pointer-events="none"/>`;
      texts += `<text x="${mx}" y="${my}" class="graph-weight">${e.weight}</text>`;
    }
  });

  NODES.forEach(n => {
    const p = COORDS[n];
    let cls = 'graph-node';
    if (options.startNode === n) cls += ' start';
    if (options.endNode === n) cls += ' end';
    if (activeNode === n) cls += ' active';

    nodes += `<circle cx="${p.x}" cy="${p.y}" r="18" class="${cls}" data-node="${n}"/>`;
    nodes += `<text x="${p.x}" y="${p.y}" class="graph-text">${n}</text>`;
  });

  return `
  <div class="graph-container">
    <svg viewBox="0 0 500 320" class="graph-svg" id="mainGraph">
      ${lines}
      ${texts}
      ${nodes}
    </svg>
  </div>`;
}

/* ==========================================================
   ПОИСК ПУТЕЙ
   ========================================================== */

function findAllPaths(graph, start, end) {
  const paths = [];
  const visited = new Set();

  function dfs(current, path) {
    visited.add(current);
    path.push(current);

    if (current === end) {
      paths.push([...path]);
    } else {
      for (let next in graph[current]) {
        if (!visited.has(next)) dfs(next, path);
      }
    }

    path.pop();
    visited.delete(current);
  }

  dfs(start, []);
  return paths;
}

function getPathLength(graph, path) {
  let len = 0;
  for (let i = 0; i < path.length - 1; i++) {
    len += graph[path[i]][path[i + 1]];
  }
  return len;
}

/* ==========================================================
   ПАРСИНГ И НОРМАЛИЗАЦИЯ ПУТИ
   ========================================================== */

function parsePathString(s, graph, start, end) {
  // "A-B-C", "a b c", "A->B->C", "A>B>C" — всё приводим к "A-B-C"
  const norm = String(s).toUpperCase()
    .replace(/[\s\-–—>→,;]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const parts = norm.split('-').filter(Boolean);

  if (parts.length < 2) return null;
  if (parts[0] !== start || parts[parts.length - 1] !== end) return null;

  const seen = new Set();
  for (const p of parts) {
    if (!graph[p]) return null;     // такой вершины нет
    if (seen.has(p)) return null;   // повтор вершины недопустим
    seen.add(p);
  }

  for (let i = 0; i < parts.length - 1; i++) {
    if (graph[parts[i]][parts[i + 1]] === undefined) return null; // ребра нет
  }

  return parts.join('-');
}

function getAllEdgeIds(graph) {
  const edges = [];
  for (let u in graph) {
    for (let v in graph[u]) {
      if (u < v) edges.push(u + '-' + v);
    }
  }
  return edges;
}

/* ==========================================================
   ГЕНЕРАЦИЯ ЗАДАНИЙ
   ========================================================== */

function generateTasks() {
  const tasks = [];

  // ===== 1-3: чтение таблицы =====
  tasks.push({
    type: 'choice',
    instruction: 'Посмотрите на таблицу. С какими городами напрямую соединён город <b>B</b>?',
    table: getTableHTML(BASE_GRAPH),
    options: ['Только с A', 'С A, C, D, E', 'С C, D, E', 'С A, C, E'],
    correct: 'С A, C, D, E',
    explain: 'В строке B есть цифры на пересечении со столбцами A, C, D, E.'
  });
  tasks.push({
    type: 'choice',
    instruction: 'Какая длина дороги между пунктами <b>C</b> и <b>E</b>?',
    table: getTableHTML(BASE_GRAPH),
    options: ['2', '3', '4', 'Нет дороги'],
    correct: '3',
    explain: 'На пересечении строки C и столбца E стоит цифра 3.'
  });
  tasks.push({
    type: 'choice',
    instruction: 'Между какими пунктами <b>НЕТ</b> прямой дороги?',
    table: getTableHTML(BASE_GRAPH),
    options: ['A и B', 'A и C', 'B и D', 'C и E'],
    correct: 'A и C',
    explain: 'На пересечении A и C пустая клетка.'
  });

  // ===== 4-6: поиск путей =====
  tasks.push({
    type: 'multi_choice_paths',
    instruction: 'Какие из маршрутов из <b>A</b> в <b>E</b> существуют?',
    table: getTableHTML(BASE_GRAPH),
    options: ['A-B-E', 'A-B-D-E', 'A-C-E', 'A-B-C-E', 'A-D-E'],
    correct: ['A-B-E', 'A-B-D-E', 'A-B-C-E'],
    explain: 'A-C-E не существует (нет A-C). A-D-E не существует (нет A-D).'
  });
  tasks.push({
    type: 'multi_choice_paths',
    instruction: 'Какие маршруты из <b>A</b> в <b>D</b> существуют?',
    table: getTableHTML(BASE_GRAPH),
    options: ['A-B-D', 'A-B-C-D', 'A-B-E-D', 'A-C-B-D', 'A-B-E-C-D'],
    correct: ['A-B-D', 'A-B-C-D', 'A-B-E-D'],
    explain: 'Все пути идут через B, так как из A есть дорога только в B.'
  });
  tasks.push({
    type: 'choice',
    instruction: 'Какой путь из <b>C</b> в <b>D</b> самый короткий?',
    table: getTableHTML(BASE_GRAPH),
    options: ['C-B-D', 'C-E-D', 'C-B-A-E-D'],
    correct: 'C-B-D',
    explain: 'C-B-D = 2+2=4. C-E-D = 3+4=7. C-B-A-E-D = 2+1+7+4=14.'
  });

  // ===== 7-9: длина пути =====
  tasks.push({
    type: 'input_number',
    instruction: 'Найдите длину пути <b>A-B-E</b>.',
    table: getTableHTML(BASE_GRAPH),
    correct: 8,
    explain: 'A-B (1) + B-E (7) = 8.'
  });
  tasks.push({
    type: 'input_number',
    instruction: 'Найдите длину пути <b>A-B-C-E</b>.',
    table: getTableHTML(BASE_GRAPH),
    correct: 6,
    explain: 'A-B (1) + B-C (2) + C-E (3) = 6.'
  });
  tasks.push({
    type: 'input_number',
    instruction: 'Найдите длину пути <b>A-B-D-E</b>.',
    table: getTableHTML(BASE_GRAPH),
    correct: 7,
    explain: 'A-B (1) + B-D (2) + D-E (4) = 7.'
  });

  // ===== 10-12: построение графа =====
  for (let i = 0; i < 3; i++) {
    const g = generateRandomGraph();
    const requiredEdges = getAllEdgeIds(g);
    tasks.push({
      type: 'graph_build',
      instruction: 'Постройте граф по таблице.\n<b>Кликайте на первую вершину, затем на вторую</b>, чтобы соединить их. Повторный клик на пару убирает ребро.',
      table: getTableHTML(g),
      graph: g,
      requiredEdges,
      explain: 'Все рёбра графа: ' + requiredEdges.join(', ')
    });
  }

  // ===== 13-27: полный алгоритм =====
  const usedSignatures = new Set();
  let attempts = 0;

  while (tasks.filter(t => t.type === 'full_algorithm').length < 15 && attempts < 300) {
    attempts++;
    const g = generateRandomGraph();
    const sig = JSON.stringify(g);
    if (usedSignatures.has(sig)) continue;

    const start = 'A';
    const end = pick(['C', 'D', 'E']);
    const paths = findAllPaths(g, start, end);

    if (paths.length < 2 || paths.length > 6) continue;

    usedSignatures.add(sig);
    const pathLens = paths.map(p => getPathLength(g, p));
    const minLen = Math.min(...pathLens);

    const pathsInfo = paths.map(p => {
      const len = getPathLength(g, p);
      return `${p.join('-')} (длина ${len})${len === minLen ? ' ⭐' : ''}`;
    }).join(', ');

    tasks.push({
      type: 'full_algorithm',
      instruction: `Постройте граф по таблице, затем выпишите все возможные пути из <b>${start}</b> в <b>${end}</b> и найдите длину кратчайшего.`,
      table: getTableHTML(g),
      graph: g,
      start, end,
      paths,
      minLength: minLen,
      requiredEdges: getAllEdgeIds(g),
      explain: `Все возможные пути: ${pathsInfo}. Кратчайший путь из ${start} в ${end} имеет длину ${minLen}.`
    });
  }

  return tasks;
}

/* ==========================================================
   СОСТОЯНИЕ / DOM
   ========================================================== */

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

/* ==========================================================
   РЕНДЕР
   ========================================================== */

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

  if (q.table) {
    const t = document.createElement('div');
    t.innerHTML = q.table;
    el.taskBody.appendChild(t);
  }

  if (q.type === 'choice') renderChoice(q);
  else if (q.type === 'multi_choice_paths') renderMultiChoicePaths(q);
  else if (q.type === 'input_number') renderInputNumber(q);
  else if (q.type === 'graph_build') renderGraphBuild(q);
  else if (q.type === 'full_algorithm') renderFullAlgorithm(q);
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

function renderMultiChoicePaths(q) {
  const wrap = document.createElement('div');
  wrap.className = 'options';
  state.selection = new Set();
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'option'; btn.textContent = opt;
    btn.addEventListener('click', () => {
      if (state.answered) return;
      if (state.selection.has(opt)) { state.selection.delete(opt); btn.classList.remove('selected'); }
      else { state.selection.add(opt); btn.classList.add('selected'); }
    });
    wrap.appendChild(btn);
  });
  el.taskBody.appendChild(wrap);
}

function renderInputNumber(q) {
  const wrap = document.createElement('div');
  wrap.className = 'input-wrap';
  const inp = document.createElement('input');
  inp.type = 'text'; inp.inputMode = 'numeric'; inp.className = 'input-answer'; inp.placeholder = 'Введите число';
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); if (!state.answered) checkAnswer(); else if (!el.nextBtn.hidden) el.nextBtn.click(); }
  });
  wrap.appendChild(inp);
  el.taskBody.appendChild(wrap);
  state.selection = inp;
  setTimeout(() => inp.focus(), 100);
}

/* ---------- Построение графа (10-12) ---------- */
function renderGraphBuild(q) {
  state.selection = { edges: [], activeNode: null };
  renderGraphBuildUI(q);
}

function renderGraphBuildUI(q) {
  const container = document.createElement('div');
  container.id = 'graphBuildArea';
  el.taskBody.appendChild(container);

  state.selection.redrawGraph = function(extra = {}) {
    container.innerHTML = getGraphHTML(q.graph, {
      showEdges: state.selection.edges,
      showWeights: false, 
      activeNode: state.selection.activeNode,
      ...extra
    });

    const counter = document.createElement('p');
    counter.className = 'edge-counter';
    counter.innerHTML = `Построено рёбер: <b>${state.selection.edges.length}</b>`;
    container.appendChild(counter);

    container.querySelectorAll('.graph-node').forEach(node => {
      node.addEventListener('click', () => {
        if (state.answered) return;
        const nodeId = node.dataset.node;

        if (!state.selection.activeNode) {
          state.selection.activeNode = nodeId;
          state.selection.redrawGraph();
        } else if (state.selection.activeNode === nodeId) {
          state.selection.activeNode = null;
          state.selection.redrawGraph();
        } else {
          const edgeId = [state.selection.activeNode, nodeId].sort().join('-');
          const idx = state.selection.edges.indexOf(edgeId);
          if (idx >= 0) state.selection.edges.splice(idx, 1);
          else state.selection.edges.push(edgeId);
          
          state.selection.activeNode = null;
          state.selection.redrawGraph();
        }
      });
    });
  };

  state.selection.redrawGraph();
}

/* ---------- Полный алгоритм (13-27) ---------- */
function renderFullAlgorithm(q) {
  state.selection = { edges: [], activeNode: null, stage: 1 };
  el.checkBtn.textContent = 'Проверить рёбра';
  renderFullStage1(q);
}

function renderFullStage1(q) {
  const hint = document.createElement('div');
  hint.className = 'stage-hint';
  hint.innerHTML = '📐 <b>Этап 1:</b> Постройте граф по таблице. Кликайте на первую вершину, затем на вторую, чтобы добавить ребро. Повторный клик убирает ребро.';
  el.taskBody.appendChild(hint);

  renderGraphBuildUI(q);
}

function renderFullStage2(q) {
  const hint = document.createElement('div');
  hint.className = 'stage-hint done';
  hint.innerHTML = `✅ Граф построен верно! <b>Этап 2:</b> выпишите <b>все</b> возможные пути из <b>${q.start}</b> в <b>${q.end}</b>, посчитайте длину каждого и найдите кратчайший.`;
  el.taskBody.appendChild(hint);

  const container = document.createElement('div');
  container.innerHTML = getGraphHTML(q.graph, {
    startNode: q.start,
    endNode: q.end
  });
  el.taskBody.appendChild(container);

  const wrap = document.createElement('div');
  wrap.className = 'paths-wrap';
  wrap.innerHTML = `
    <table class="paths-table">
      <thead><tr>
        <th style="width:44px">№</th>
        <th>Путь</th>
        <th style="width:150px">Длина</th>
        <th style="width:48px"></th>
      </tr></thead>
      <tbody id="pathsBody"></tbody>
    </table>
    <button type="button" class="btn btn-outline btn-add-path" id="addPathBtn">+ Добавить путь</button>
    <div class="shortest-row">
      <span>Кратчайший путь имеет длину:</span>
      <input type="text" data-answer placeholder="Мин. длина">
    </div>
  `;
  el.taskBody.appendChild(wrap);

  state.selection.rows = [];
  state.selection.rowCount = 0;
  state.selection.answer = wrap.querySelector('[data-answer]');
  state.selection.pathsBody = wrap.querySelector('#pathsBody');

  const renumber = () => {
    state.selection.rows.forEach((r, i) => { r.tr.cells[0].textContent = i + 1; });
  };

  const addRow = () => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="center"></td>
      <td><input type="text" class="path-input" placeholder="Например: ${q.start}-B-${q.end}" autocomplete="off"></td>
      <td class="center"><input type="text" class="len-input" placeholder="Длина" autocomplete="off"></td>
      <td class="center"><button type="button" class="btn-remove-row" title="Удалить строку">✕</button></td>
    `;
    const rowObj = {
      tr,
      path: tr.querySelector('.path-input'),
      len: tr.querySelector('.len-input')
    };
    tr.querySelector('.btn-remove-row').addEventListener('click', () => {
      if (state.answered) return;
      tr.remove();
      state.selection.rows = state.selection.rows.filter(r => r !== rowObj);
      renumber();
    });
    state.selection.rows.push(rowObj);
    state.selection.pathsBody.appendChild(tr);
    renumber();
    return rowObj;
  };

  wrap.querySelector('#addPathBtn').addEventListener('click', () => {
    if (state.answered) return;
    addRow().path.focus();
  });

  // Стартовые строки
  for (let i = 0; i < 3; i++) addRow();

  state.selection.answer.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!state.answered) checkAnswer();
      else if (!el.nextBtn.hidden) el.nextBtn.click();
    }
  });

  el.checkBtn.textContent = 'Проверить ответ';
  setTimeout(() => state.selection.rows[0]?.path.focus(), 100);
}

/* ==========================================================
   ПРОВЕРКА
   ========================================================== */

function checkAnswer() {
  if (state.answered) return;
  const q = currentTask();

  if (q.type === 'choice') return checkChoice(q);
  if (q.type === 'multi_choice_paths') return checkMulti(q);
  if (q.type === 'input_number') return checkInputNumber(q);
  if (q.type === 'graph_build') return checkGraphBuild(q);
  if (q.type === 'full_algorithm') return checkFullAlgorithm(q);
}

function checkChoice(q) {
  if (!state.selection) return setFeedback('warn', 'Выберите вариант.');
  const isCorrect = state.selection === q.correct;
  el.taskBody.querySelectorAll('.option').forEach(btn => {
    btn.disabled = true; btn.classList.remove('selected');
    if (btn.textContent === q.correct) btn.classList.add('ok');
    else if (state.selection === btn.textContent) btn.classList.add('wrong');
  });
  finishCheck(isCorrect, q);
}

function checkMulti(q) {
  if (state.selection.size === 0) return setFeedback('warn', 'Выберите хотя бы один путь.');
  const userArr = Array.from(state.selection).sort();
  const corrArr = q.correct.slice().sort();
  const isCorrect = userArr.join('|') === corrArr.join('|');
  el.taskBody.querySelectorAll('.option').forEach(btn => {
    btn.disabled = true;
    if (q.correct.includes(btn.textContent)) btn.classList.add('ok');
    else if (state.selection.has(btn.textContent)) btn.classList.add('wrong');
  });
  finishCheck(isCorrect, q);
}

function checkInputNumber(q) {
  const val = state.selection.value.trim();
  if (!val) return setFeedback('warn', 'Введите число.');
  const isCorrect = parseInt(val) === q.correct;
  state.selection.classList.add(isCorrect ? 'ok' : 'wrong');
  state.selection.disabled = true;
  if (!isCorrect) state.selection.value = q.correct;
  finishCheck(isCorrect, q);
}

function checkGraphBuild(q) {
  const userEdges = state.selection.edges.slice().sort();
  const correctEdges = q.requiredEdges.slice().sort();
  const isCorrect = userEdges.join(',') === correctEdges.join(',');

  const okEdges = [], wrongEdges = [], missedEdges = [];
  userEdges.forEach(e => correctEdges.includes(e) ? okEdges.push(e) : wrongEdges.push(e));
  correctEdges.forEach(e => { if (!userEdges.includes(e)) missedEdges.push(e); });

  if (state.selection.redrawGraph) {
    state.selection.redrawGraph({
      showWeights: true,
      okEdges, wrongEdges, missedEdges
    });
  }

  finishCheck(isCorrect, q);
}

function checkFullAlgorithm(q) {
  if (state.selection.stage === 1) {
    const userEdges = state.selection.edges.slice().sort();
    const correctEdges = q.requiredEdges.slice().sort();
    const isCorrect = userEdges.join(',') === correctEdges.join(',');

    if (isCorrect) {
      state.selection.stage = 2;
      state.selection.edges = [];
      el.taskBody.innerHTML = '';

      const t = document.createElement('div');
      t.innerHTML = q.table;
      el.taskBody.appendChild(t);

      renderFullStage2(q);
      setFeedback('success', '✅ Рёбра построены верно! Теперь выпишите все возможные пути и найдите кратчайший.');
      return;
    }

    const okEdges = [], wrongEdges = [], missedEdges = [];
    userEdges.forEach(e => correctEdges.includes(e) ? okEdges.push(e) : wrongEdges.push(e));
    correctEdges.forEach(e => { if (!userEdges.includes(e)) missedEdges.push(e); });

    state.selection.redrawGraph({
      showWeights: true,
      okEdges, wrongEdges, missedEdges
    });

    setFeedback('error', '❌ Граф построен с ошибками.\nЗелёные — правильные, красные — лишние, жёлтые пунктирные — пропущенные.\nПосмотрите на таблицу и исправьте.');
    return;
  }

  // ---------- ЭТАП 2 ----------
  // ПРОХОД 1: валидация без побочных эффектов
  let allFilled = true;
  const parsed = [];         // { row, norm, correctLen, lenOk, reason }
  const seenNorm = new Set();

  for (const row of state.selection.rows) {
    const pv = row.path.value.trim();
    const lv = row.len.value.trim();

    if (!pv && !lv) continue;                  // полностью пустая строка — пропускаем
    if (!pv || !lv) { allFilled = false; continue; } // половина заполнена

    const norm = parsePathString(pv, q.graph, q.start, q.end);
    if (!norm) {
      parsed.push({ row, reason: 'invalid' });
      continue;
    }
    if (seenNorm.has(norm)) {
      parsed.push({ row, reason: 'duplicate' });
      continue;
    }
    seenNorm.add(norm);

    const correctLen = getPathLength(q.graph, norm.split('-'));
    parsed.push({
      row, norm, correctLen,
      lenOk: parseInt(lv, 10) === correctLen
    });
  }

  const ansVal = state.selection.answer.value.trim();
  if (!ansVal) allFilled = false;

  if (!allFilled) {
    return setFeedback('warn', 'Заполните все начатые строки (либо удалите пустые через ✕) и укажите минимальную длину.');
  }
  if (parsed.length === 0) {
    return setFeedback('warn', 'Добавьте хотя бы один путь.');
  }

  // ПРОХОД 2: коммитим результат в DOM
  let hasInvalid = false, hasDuplicate = false, anyLengthWrong = false;
  const userPaths = new Set();

  for (const p of parsed) {
    if (p.reason) {
      p.row.path.classList.add('wrong');
      p.row.path.disabled = true;
      p.row.len.disabled = true;
      if (p.reason === 'invalid') hasInvalid = true;
      else hasDuplicate = true;
      continue;
    }
    p.row.path.classList.add('ok');
    p.row.path.disabled = true;
    p.row.len.disabled = true;
    if (p.lenOk) p.row.len.classList.add('ok');
    else {
      p.row.len.classList.add('wrong');
      p.row.len.value = p.correctLen;
      anyLengthWrong = true;
    }
    userPaths.add(p.norm);
  }

  const ansOk = parseInt(ansVal, 10) === q.minLength;
  state.selection.answer.classList.add(ansOk ? 'ok' : 'wrong');
  state.selection.answer.disabled = true;
  if (!ansOk) state.selection.answer.value = q.minLength;

  const allPathsSet = new Set(q.paths.map(p => p.join('-')));
  const missingPaths = [...allPathsSet].filter(p => !userPaths.has(p));

  const isCorrect = !hasInvalid && !hasDuplicate && !anyLengthWrong && ansOk && missingPaths.length === 0;

  let extraMsg = '';
  if (!isCorrect) {
    const issues = [];
    if (hasInvalid) issues.push('Некоторые пути не существуют в графе (или записаны неверно).');
    if (hasDuplicate) issues.push('Есть повторяющиеся пути.');
    if (missingPaths.length) issues.push('Не найдены пути: ' + missingPaths.join(', ') + '.');
    if (anyLengthWrong) issues.push('Некоторые длины посчитаны неверно.');
    if (!ansOk) issues.push('Неверная минимальная длина.');
    if (issues.length) extraMsg = '\n' + issues.join(' ');
  }

  finishCheck(isCorrect, { ...q, explain: (q.explain || '') + extraMsg });
}

function finishCheck(isCorrect, q) {
  state.answered = true;
  if (isCorrect) state.correct++;
  el.checkBtn.hidden = true;
  el.nextBtn.hidden = false;
  updateProgress(true);

  if (isCorrect) setFeedback('success', '✅ Правильно! ' + (q.explain || ''));
  else setFeedback('error', '❌ Есть ошибки. Правильные значения подсвечены.\n' + (q.explain || ''));
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
  if (pct === 100) { el.finishEmoji.textContent = '🏆'; el.finishTitle.textContent = 'Идеально!'; }
  else if (pct >= 70) { el.finishEmoji.textContent = '🎉'; el.finishTitle.textContent = 'Хороший результат!'; }
  else { el.finishEmoji.textContent = '💪'; el.finishTitle.textContent = 'Стоит повторить тему'; }
  el.finishText.innerHTML = `Правильно: <strong>${state.correct} из ${total}</strong> (${pct}%).`;
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
