'use strict';

/* ==========================================================
   ТРЕНАЖЁР: Количество путей в графе (20 заданий)
   ========================================================== */

const TOTAL_TASKS = 20;

// Координаты вершин (расположены слоями)
const NODES = {
  'A':  { x: 60,  y: 200 },
  'Б':  { x: 160, y: 80 },
  'В':  { x: 160, y: 200 },
  'Г':  { x: 160, y: 320 },
  'Д':  { x: 280, y: 80 },
  'Е':  { x: 280, y: 200 },
  'Ж':  { x: 280, y: 320 },
  'З':  { x: 400, y: 120 },
  'И':  { x: 400, y: 280 },
  'К':  { x: 500, y: 200 }
};

// Первые 4 задания с фиксированным количеством путей
const FIXED_GRAPHS = [
  { edges: [['A','В'], ['A','Е'], ['В','Е'], ['Е','К']], paths: 2 },
  { edges: [['A','В'], ['A','Е'], ['В','Е'], ['В','К'], ['Е','К']], paths: 3 },
  { edges: [['A','Б'], ['A','В'], ['Б','Е'], ['В','Е'], ['В','Ж'], ['Е','Д'], ['Е','Ж'], ['Е','К'], ['Д','К'], ['Ж','К']], paths: 7 },
  { edges: [['A','Б'], ['A','В'], ['A','Е'], ['Б','Е'], ['В','Е'], ['В','Ж'], ['Е','Д'], ['Е','Ж'], ['Е','К'], ['Д','К'], ['Ж','К']], paths: 10 }
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

/* ---------------------- АЛГОРИТМ ПОДСЧЁТА ПУТЕЙ ---------------------- */

function countPaths(edges, start, end) {
  if (start === end) return 1;
  
  const dp = {};
  for (let node in NODES) dp[node] = 0;
  dp[start] = 1;

  // Сортируем вершины слева направо
  const sortedNodes = Object.keys(NODES).sort((a, b) => NODES[a].x - NODES[b].x);

  sortedNodes.forEach(u => {
    edges.forEach(([from, to]) => {
      if (from === u) {
        dp[to] += dp[u];
      }
    });
  });

  return dp[end];
}

function getIntermediateNodes(edges, start, end) {
  const validNodes = [];
  const allNodes = Object.keys(NODES).filter(n => n !== start && n !== end);
  
  allNodes.forEach(node => {
    const p1 = countPaths(edges, start, node);
    const p2 = countPaths(edges, node, end);
    if (p1 > 0 && p2 > 0) {
      validNodes.push(node);
    }
  });
  
  return validNodes;
}

/* ---------------------- ГЕНЕРАЦИЯ ГРАФОВ ---------------------- */

function generateRandomEdges() {
  const possibleEdges = [];
  const keys = Object.keys(NODES);
  
  // Создаём потенциальные рёбра между слоями (слева направо)
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const u = keys[i];
      const v = keys[j];
      if (NODES[v].x > NODES[u].x && NODES[v].x - NODES[u].x <= 150) {
        possibleEdges.push([u, v]);
      }
    }
  }

  let bestEdges = null;
  let bestDiff = Infinity;
  const target = 12; // Стремимся к ~12 путям (середина диапазона 4-25)

  for (let attempt = 0; attempt < 200; attempt++) {
    const edges = [];
    
    possibleEdges.forEach(([u, v]) => {
      // Вероятность появления ребра
      if (Math.random() < 0.55) {
        edges.push([u, v]);
      }
    });

    const paths = countPaths(edges, 'A', 'К');
    
    // Если попали в желаемый диапазон (от 4 до 25) — отлично
    if (paths >= 4 && paths <= 25) {
      return edges;
    }
    
    // Иначе запоминаем самый близкий вариант
    if (paths > 0) {
      const diff = Math.abs(paths - target);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestEdges = edges;
      }
    }
  }
  
  if (bestEdges) return bestEdges;

  // Резервный вариант
  return [['A','Б'], ['A','В'], ['A','Г'], ['Б','Д'], ['Б','Е'], ['В','Е'], ['В','Ж'], ['Г','Ж'], ['Д','З'], ['Е','З'], ['Е','И'], ['Ж','И'], ['З','К'], ['И','К']];
}

/* ---------------------- ГЕНЕРАЦИЯ ЗАДАНИЙ ---------------------- */

function generateTasks() {
  const tasks = [];

  // 1. Фиксированные задания (4 шт)
  for (let i = 0; i < FIXED_GRAPHS.length; i++) {
    tasks.push({
      type: 'simple',
      edges: FIXED_GRAPHS[i].edges,
      answer: FIXED_GRAPHS[i].paths
    });
  }

  // 2. Случайные (просто найти пути) — 8 шт
  for (let i = 0; i < 8; i++) {
    const edges = generateRandomEdges();
    tasks.push({
      type: 'simple',
      edges: edges,
      answer: countPaths(edges, 'A', 'К')
    });
  }

  // 3. Случайные (проходящие через город) — 4 шт
  for (let i = 0; i < 4; i++) {
    let edges, intermediates, targetNode, paths;
    do {
      edges = generateRandomEdges();
      intermediates = getIntermediateNodes(edges, 'A', 'К');
    } while (intermediates.length === 0);

    targetNode = intermediates[Math.floor(Math.random() * intermediates.length)];
    const p1 = countPaths(edges, 'A', targetNode);
    const p2 = countPaths(edges, targetNode, 'К');
    paths = p1 * p2;

    tasks.push({
      type: 'through',
      edges: edges,
      targetNode: targetNode,
      answer: paths
    });
  }

  // 4. Случайные (НЕ проходящие через город) — 4 шт
  for (let i = 0; i < 4; i++) {
    let edges, intermediates, targetNode, paths;
    do {
      edges = generateRandomEdges();
      intermediates = getIntermediateNodes(edges, 'A', 'К');
    } while (intermediates.length === 0);

    targetNode = intermediates[Math.floor(Math.random() * intermediates.length)];
    const totalPaths = countPaths(edges, 'A', 'К');
    const p1 = countPaths(edges, 'A', targetNode);
    const p2 = countPaths(edges, targetNode, 'К');
    const throughPaths = p1 * p2;
    paths = totalPaths - throughPaths;

    tasks.push({
      type: 'not_through',
      edges: edges,
      targetNode: targetNode,
      answer: paths
    });
  }

  return tasks;
}

/* ---------------------- ОТРИСОВКА SVG ---------------------- */

function renderGraphToSVG(edges) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 560 400');
  svg.setAttribute('class', 'graph-svg');

  // Маркер для стрелок
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#b45309" />
    </marker>
  `;
  svg.appendChild(defs);

  // Рисуем рёбра
  edges.forEach(([u, v]) => {
    const p1 = NODES[u];
    const p2 = NODES[v];

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

  // Рисуем вершины
  for (const [label, pos] of Object.entries(NODES)) {
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
    instruction += 'Сколько существует различных путей из города А в город К?';
  } else if (task.type === 'through') {
    instruction += `Сколько существует различных путей из города А в город К, проходящих через город ${task.targetNode}?`;
  } else if (task.type === 'not_through') {
    instruction += `Сколько существует различных путей из города А в город К, не проходящих через город ${task.targetNode}?`;
  }

  el.instruction.textContent = instruction;

  el.graphContainer.innerHTML = '';
  el.graphContainer.appendChild(renderGraphToSVG(task.edges));

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
