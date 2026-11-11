'use strict';

/* ==========================================================
   ТРЕНАЖЁР: Количество путей в графе
   14 заданий: 4 фиксированных (2, 3, 7, 10 путей) + 10 случайных
   ========================================================== */

const TOTAL_TASKS = 14;

// Координаты вершин (немного разнесены по X для корректной топологической сортировки)
const NODES = {
  A: { x: 80,  y: 200 },
  B: { x: 180, y: 100 },
  C: { x: 200, y: 300 },
  E: { x: 300, y: 200 }, // E теперь левее D
  D: { x: 320, y: 120 },
  F: { x: 340, y: 280 },
  G: { x: 440, y: 200 }
};

// Все возможные рёбра (из левых слоёв в правые)
const POSSIBLE_EDGES = [
  ['A', 'B'], ['A', 'C'], ['A', 'E'],
  ['B', 'D'], ['B', 'E'],
  ['C', 'E'], ['C', 'F'],
  ['D', 'G'],
  ['E', 'D'], ['E', 'F'], ['E', 'G'],
  ['F', 'G']
];

// Первые 4 задания с фиксированным количеством путей
const FIXED_GRAPHS = [
  // 1. Всего 2 пути
  { edges: [['A','B'], ['A','E'], ['B','E'], ['E','G']], paths: 2 },
  // 2. Всего 3 пути
  { edges: [['A','B'], ['A','E'], ['B','E'], ['B','G'], ['E','G']], paths: 3 },
  // 3. Всего 7 путей
  { edges: [['A','B'], ['A','C'], ['B','E'], ['C','E'], ['C','F'], ['E','D'], ['E','F'], ['E','G'], ['D','G'], ['F','G']], paths: 7 },
  // 4. Всего 10 путей
  { edges: [['A','B'], ['A','C'], ['A','E'], ['B','E'], ['C','E'], ['C','F'], ['E','D'], ['E','F'], ['E','G'], ['D','G'], ['F','G']], paths: 10 }
];

/* ---------------------- СОСТОЯНИЕ ---------------------- */

const state = {
  qIndex: 0,
  correct: 0,
  answered: false,
  currentGraph: null
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

/* ---------------------- ГЕНЕРАЦИЯ СЛУЧАЙНОГО ГРАФА ---------------------- */

function generateGraph() {
  let edges = [];
  let attempts = 0;
  
  while (attempts < 100) {
    attempts++;
    edges = [];
    
    POSSIBLE_EDGES.forEach(([u, v]) => {
      // Добавляем с вероятностью 55%
      if (Math.random() < 0.55 || (u === 'A' && v === 'B') || (u === 'F' && v === 'G')) {
        edges.push([u, v]);
      }
    });

    const paths = countPaths(edges, 'A', 'G');
    if (paths > 0 && paths < 100) {
      return { edges, paths };
    }
  }
  
  // Резервный вариант
  const fallbackEdges = [['A','B'], ['A','C'], ['B','D'], ['B','E'], ['C','E'], ['C','F'], ['D','G'], ['E','G'], ['F','G']];
  return { 
    edges: fallbackEdges,
    paths: countPaths(fallbackEdges, 'A', 'G')
  };
}

/* ---------------------- АЛГОРИТМ ПОДСЧЁТА ПУТЕЙ ---------------------- */

function countPaths(edges, start, end) {
  const dp = {};
  for (let node in NODES) dp[node] = 0;
  dp[start] = 1;

  // Сортируем вершины слева направо (топологическая сортировка)
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

/* ---------------------- ОТРИСОВКА SVG ---------------------- */

function renderGraphToSVG(edges) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 520 400');
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

    // Отступаем от центров вершин, чтобы стрелки не перекрывали кружки
    const x1 = p1.x + ux * 5;
    const y1 = p1.y + uy * 5;
    const x2 = p2.x - ux * 12;
    const y2 = p2.y - uy * 12;

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

  // Если задание входит в первые 4 — берём фиксированный граф
  if (state.qIndex < FIXED_GRAPHS.length) {
    state.currentGraph = FIXED_GRAPHS[state.qIndex];
  } else {
    state.currentGraph = generateGraph();
  }

  el.progressText.textContent = `Задание ${state.qIndex + 1} из ${TOTAL_TASKS}`;
  el.progressFill.style.width = `${(state.qIndex / TOTAL_TASKS) * 100}%`;

  el.instruction.textContent = 'На рисунке — схема дорог, связывающих города. По каждой дороге можно двигаться только в одном направлении, указанном стрелкой. Сколько существует различных путей из города А в город G?';

  el.graphContainer.innerHTML = '';
  el.graphContainer.appendChild(renderGraphToSVG(state.currentGraph.edges));

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
  const isCorrect = userAnswer === state.currentGraph.paths;

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
    el.feedback.textContent = `❌ Неправильно. Правильный ответ: ${state.currentGraph.paths}.`;
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

renderTask();