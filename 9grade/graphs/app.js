'use strict';

/* ==========================================================
   ТРЕНАЖЁР: Количество путей в графе (25 заданий)
   ========================================================== */

const TOTAL_TASKS = 25;

const LETTER_POOL = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'P'];
const END_CANDIDATES = ['F', 'G', 'H', 'K', 'P'];

// Оригинальная раскладка для первых 4 фиксированных задач (A→G)
const FIXED_NODES = {
  A: { x: 80,  y: 200 },
  B: { x: 180, y: 100 },
  C: { x: 200, y: 300 },
  E: { x: 300, y: 200 },
  D: { x: 320, y: 120 },
  F: { x: 340, y: 280 },
  G: { x: 440, y: 200 }
};

const FIXED_GRAPHS = [
  { edges: [['A','B'], ['A','E'], ['B','E'], ['E','G']], paths: 2,
    start: 'A', end: 'G', nodeMap: FIXED_NODES },
  { edges: [['A','B'], ['A','E'], ['B','E'], ['B','G'], ['E','G']], paths: 3,
    start: 'A', end: 'G', nodeMap: FIXED_NODES },
  { edges: [['A','B'], ['A','C'], ['B','E'], ['C','E'], ['C','F'], ['E','D'], ['E','F'], ['E','G'], ['D','G'], ['F','G']],
    paths: 7, start: 'A', end: 'G', nodeMap: FIXED_NODES },
  { edges: [['A','B'], ['A','C'], ['A','E'], ['B','E'], ['C','E'], ['C','F'], ['E','D'], ['E','F'], ['E','G'], ['D','G'], ['F','G']],
    paths: 10, start: 'A', end: 'G', nodeMap: FIXED_NODES }
];

/* ---------------------- СОСТОЯНИЕ ---------------------- */

const state = {
  qIndex: 0,
  correct: 0,
  answered: false,
  currentGraph: null,
  tasks: []
};

/* ---------------------- DOM ---------------------- */

const el = {
  progressText: document.getElementById('progressText'),
  progressFill: document.getElementById('progressFill'),
  screenQuiz:   document.getElementById('screen-quiz'),
  screenResult: document.getElementById('screen-result'),
  instruction:  document.getElementById('instruction'),
  graphContainer: document.getElementById('graphContainer'),
  answerInput:  document.getElementById('answerInput'),
  feedback:     document.getElementById('feedback'),
  checkBtn:     document.getElementById('checkBtn'),
  nextBtn:      document.getElementById('nextBtn'),
  finishEmoji:  document.getElementById('finishEmoji'),
  finishTitle:  document.getElementById('finishTitle'),
  finishText:   document.getElementById('finishText'),
  retryBtn:     document.getElementById('retryBtn'),
  backBtn:      document.getElementById('backBtn')
};

/* ---------------------- УТИЛИТЫ ---------------------- */

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------------------- ПОДСЧЁТ ПУТЕЙ (по nodeMap) ---------------------- */

function countPaths(edges, start, end, nodeMap) {
  if (start === end) return 1;
  const dp = {};
  for (let node in nodeMap) dp[node] = 0;
  dp[start] = 1;
  const sorted = Object.keys(nodeMap).sort((a, b) => nodeMap[a].x - nodeMap[b].x);
  sorted.forEach(u => {
    edges.forEach(([from, to]) => {
      if (from === u) dp[to] += dp[u];
    });
  });
  return dp[end] || 0;
}

function getIntermediateNodes(edges, start, end, nodeMap) {
  const valid = [];
  const all = Object.keys(nodeMap).filter(n => n !== start && n !== end);
  all.forEach(node => {
    if (countPaths(edges, start, node, nodeMap) > 0 &&
        countPaths(edges, node, end, nodeMap) > 0) {
      valid.push(node);
    }
  });
  return valid;
}

/* ---------------------- ГЕНЕРАЦИЯ СЛУЧАЙНОГО ГРАФА ---------------------- */

function generateRandomGraph() {
  for (let attempt = 0; attempt < 100; attempt++) {
    const numNodes = randInt(4, 7);
    const endLetter = pick(END_CANDIDATES);

    // Слоёв: 3..min(5, numNodes)
    const numLayers = randInt(3, Math.min(5, numNodes));
    const layerCounts = new Array(numLayers).fill(1);
    let extra = numNodes - numLayers;
    while (extra > 0) {
      const l = randInt(1, numLayers - 2);
      layerCounts[l]++;
      extra--;
    }

    // Координаты по X
    const xStep = 400 / (numLayers - 1);
    const layerX = [];
    for (let i = 0; i < numLayers; i++) layerX.push(60 + i * xStep);

    // Узлы
    const nodes = [];
    for (let layer = 0; layer < numLayers; layer++) {
      const cnt = layerCounts[layer];
      for (let j = 0; j < cnt; j++) {
        const x = layerX[layer];
        const y = cnt === 1 ? 200 : 80 + (240 * j / (cnt - 1));
        nodes.push({ x, y, layer });
      }
    }

    // Назначаем буквы: A слева, end справа, середины — из пула
    const middlePool = LETTER_POOL.filter(l => l !== 'A' && l !== endLetter);
    const middleLetters = shuffle(middlePool).slice(0, numNodes - 2);
    nodes[0].letter = 'A';
    nodes[nodes.length - 1].letter = endLetter;
    for (let i = 1; i < nodes.length - 1; i++) {
      nodes[i].letter = middleLetters[i - 1];
    }

    // Рёбра (только вперёд по слоям)
    const edges = [];
    nodes.forEach((u, i) => {
      if (i === nodes.length - 1) return;
      const candidates = nodes.filter(v => v.layer > u.layer);
      if (candidates.length === 0) return;
      const numConn = randInt(1, Math.min(2, candidates.length));
      const chosen = shuffle(candidates).slice(0, numConn);
      chosen.forEach(v => edges.push([u.letter, v.letter]));
    });

    // Гарантируем связность
    const hasIn  = new Set(edges.map(([u, v]) => v));
    const hasOut = new Set(edges.map(([u, v]) => u));

    nodes.forEach((n, i) => {
      if (i === 0) return;
      if (!hasIn.has(n.letter)) {
        const c = nodes.filter(v => v.layer < n.layer);
        if (c.length) {
          const from = pick(c);
          edges.push([from.letter, n.letter]);
          hasIn.add(n.letter); hasOut.add(from.letter);
        }
      }
    });
    nodes.forEach((n, i) => {
      if (i === nodes.length - 1) return;
      if (!hasOut.has(n.letter)) {
        const c = nodes.filter(v => v.layer > n.layer);
        if (c.length) {
          const to = pick(c);
          edges.push([n.letter, to.letter]);
          hasOut.add(n.letter); hasIn.add(to.letter);
        }
      }
    });

    // Карта узлов
    const nodeMap = {};
    nodes.forEach(n => nodeMap[n.letter] = { x: n.x, y: n.y });

    // Проверяем ответ
    const paths = countPaths(edges, 'A', endLetter, nodeMap);
    if (paths > 0 && paths <= 30) {
      return { edges, nodeMap, start: 'A', end: endLetter, paths };
    }
  }

  // Fallback
  return {
    edges: [['A','B'], ['A','C'], ['B','F'], ['C','F']],
    nodeMap: { A: {x:80,y:200}, B: {x:200,y:100}, C: {x:200,y:300}, F: {x:440,y:200} },
    start: 'A', end: 'F', paths: 2
  };
}

/* ---------------------- ГЕНЕРАЦИЯ ЗАДАНИЙ ---------------------- */

function generateTasks() {
  const tasks = [];

  // 1. Фиксированные (4 шт)
  for (const g of FIXED_GRAPHS) {
    tasks.push({
      type: 'simple',
      edges: g.edges,
      nodeMap: g.nodeMap,
      start: g.start,
      end: g.end,
      answer: g.paths
    });
  }

  // 2. Случайные простые (11 шт)
  for (let i = 0; i < 11; i++) {
    const g = generateRandomGraph();
    tasks.push({
      type: 'simple',
      edges: g.edges,
      nodeMap: g.nodeMap,
      start: g.start,
      end: g.end,
      answer: g.paths
    });
  }

  // 3. Проходящие через город (5 шт)
  for (let i = 0; i < 5; i++) {
    let g, inter, target, paths;
    let attempts = 0;
    do {
      attempts++;
      g = generateRandomGraph();
      inter = getIntermediateNodes(g.edges, g.start, g.end, g.nodeMap);
      if (inter.length === 0) continue;
      target = pick(inter);
      paths = countPaths(g.edges, g.start, target, g.nodeMap) *
              countPaths(g.edges, target, g.end, g.nodeMap);
    } while ((!paths || paths > 25) && attempts < 50);
    tasks.push({
      type: 'through',
      edges: g.edges,
      nodeMap: g.nodeMap,
      start: g.start,
      end: g.end,
      targetNode: target,
      answer: paths
    });
  }

  // 4. НЕ проходящие через город (5 шт)
  for (let i = 0; i < 5; i++) {
    let g, inter, target, paths;
    let attempts = 0;
    do {
      attempts++;
      g = generateRandomGraph();
      inter = getIntermediateNodes(g.edges, g.start, g.end, g.nodeMap);
      if (inter.length === 0) continue;
      target = pick(inter);
      const total = countPaths(g.edges, g.start, g.end, g.nodeMap);
      const through = countPaths(g.edges, g.start, target, g.nodeMap) *
                      countPaths(g.edges, target, g.end, g.nodeMap);
      paths = total - through;
    } while ((paths <= 0 || paths > 25) && attempts < 50);
    tasks.push({
      type: 'not_through',
      edges: g.edges,
      nodeMap: g.nodeMap,
      start: g.start,
      end: g.end,
      targetNode: target,
      answer: paths
    });
  }

  return tasks;
}

/* ---------------------- ОТРИСОВКА SVG ---------------------- */

function renderGraphToSVG(edges, nodeMap) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 520 400');
  svg.setAttribute('class', 'graph-svg');

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#b45309" />
    </marker>
  `;
  svg.appendChild(defs);

  edges.forEach(([u, v]) => {
    const p1 = nodeMap[u];
    const p2 = nodeMap[v];
    if (!p1 || !p2) return;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / len;
    const uy = dy / len;

    const x1 = p1.x + ux * 6;
    const y1 = p1.y + uy * 6;
    const x2 = p2.x - ux * 14;
    const y2 = p2.y - uy * 14;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#b45309');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('marker-end', 'url(#arrow)');
    svg.appendChild(line);
  });

  for (const [label, pos] of Object.entries(nodeMap)) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', pos.x);
    circle.setAttribute('cy', pos.y);
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', '#b45309');
    group.appendChild(circle);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', pos.x);
    text.setAttribute('y', pos.y - 10);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-family', 'Arial, sans-serif');
    text.setAttribute('font-size', '16');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', '#1e293b');
    text.textContent = label;
    group.appendChild(text);

    svg.appendChild(group);
  }

  return svg;
}

/* ---------------------- ЛОГИКА ЗАДАНИЯ ---------------------- */

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

function renderTask() {
  state.answered = false;
  const task = state.tasks[state.qIndex];
  state.currentGraph = task;

  el.progressText.textContent = `Задание ${state.qIndex + 1} из ${TOTAL_TASKS}`;
  el.progressFill.style.width = `${(state.qIndex / TOTAL_TASKS) * 100}%`;

  let instruction = 'На рисунке — схема дорог, связывающих города. По каждой дороге можно двигаться только в одном направлении, указанном стрелкой. ';

  if (task.type === 'simple') {
    instruction += `Сколько существует различных путей из города ${task.start} в город ${task.end}?`;
  } else if (task.type === 'through') {
    instruction += `Сколько существует различных путей из города ${task.start} в город ${task.end}, проходящих через город ${task.targetNode}?`;
  } else if (task.type === 'not_through') {
    instruction += `Сколько существует различных путей из города ${task.start} в город ${task.end}, не проходящих через город ${task.targetNode}?`;
  }

  el.instruction.textContent = instruction;

  el.graphContainer.innerHTML = '';
  el.graphContainer.appendChild(renderGraphToSVG(task.edges, task.nodeMap));

  el.answerInput.value = '';
  el.answerInput.disabled = false;
  el.answerInput.className = 'input-answer';
  el.feedback.textContent = '';
  el.feedback.className = 'feedback';

  el.checkBtn.hidden = false;
  el.nextBtn.hidden = true;
  el.nextBtn.textContent = (state.qIndex === TOTAL_TASKS - 1) ? 'Завершить ✓' : 'Далее →';

  el.answerInput.focus();
}

function checkAnswer() {
  if (state.answered) return;

  const val = el.answerInput.value.trim();
  if (val === '') {
    el.feedback.textContent = 'Введите число.';
    el.feedback.className = 'feedback warn';
    return;
  }

  const userAnswer = parseInt(val, 10);
  const isCorrect = userAnswer === state.currentGraph.answer;

  state.answered = true;
  el.answerInput.disabled = true;
  el.checkBtn.hidden = true;
  el.nextBtn.hidden = false;

  if (isCorrect) {
    state.correct++;
    el.answerInput.classList.add('ok');
    el.feedback.textContent = '✅ Правильно! Отличная работа.';
    el.feedback.className = 'feedback success';
  } else {
    el.answerInput.classList.add('wrong');
    el.feedback.textContent = `❌ Неправильно. Правильный ответ: ${state.currentGraph.answer}.`;
    el.feedback.className = 'feedback error';
  }

  el.progressFill.style.width = `${((state.qIndex + 1) / TOTAL_TASKS) * 100}%`;
}

function nextTask() {
  if (!state.answered) return;
  if (state.qIndex + 1 >= TOTAL_TASKS) {
    showResult();
    return;
  }
  state.qIndex++;
  renderTask();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showResult() {
  el.screenQuiz.hidden = true;
  el.screenResult.hidden = false;

  const pct = Math.round((state.correct / TOTAL_TASKS) * 100);

  if (pct === 100) {
    el.finishEmoji.textContent = '🏆';
    el.finishTitle.textContent = 'Идеально!';
  } else if (pct >= 70) {
    el.finishEmoji.textContent = '🎉';
    el.finishTitle.textContent = 'Хороший результат!';
  } else {
    el.finishEmoji.textContent = '💪';
    el.finishTitle.textContent = 'Стоит потренироваться ещё';
  }

  el.finishText.innerHTML = `Правильно выполнено <strong>${state.correct} из ${TOTAL_TASKS}</strong> заданий (${pct}%).`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------------------- СОБЫТИЯ ---------------------- */

el.checkBtn.addEventListener('click', checkAnswer);
el.nextBtn.addEventListener('click', nextTask);
el.retryBtn.addEventListener('click', startOver);
el.backBtn.addEventListener('click', () => history.back());

el.answerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    if (!state.answered) checkAnswer();
    else if (!el.nextBtn.hidden) nextTask();
  }
});

/* ---------------------- СТАРТ ---------------------- */

state.tasks = generateTasks();
renderTask();
