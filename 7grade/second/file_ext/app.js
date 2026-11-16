'use strict';

/* ==========================================================
   ТРЕНАЖЁР: Расширения файлов (22 задания)
   8 choice + 6 multi + 8 match
   ========================================================== */

/* ---------------------- КАТЕГОРИИ ---------------------- */

const CATEGORIES = {
  text:         { name: 'Текстовый документ', emoji: '📄', items: ['txt', 'doc', 'docx', 'pdf', 'rtf', 'odt'] },
  image:        { name: 'Графический файл',   emoji: '🖼️', items: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'tiff'] },
  audio:        { name: 'Аудиофайл',          emoji: '🔊', items: ['mp3', 'wav', 'ogg', 'flac', 'wma'] },
  video:        { name: 'Видеофайл',          emoji: '🎥', items: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'mpeg'] },
  archive:      { name: 'Архив',              emoji: '📦', items: ['zip', 'rar', '7z', 'tar'] },
  web:          { name: 'Веб-формат',         emoji: '🌐', items: ['html', 'htm', 'css', 'js'] },
  presentation: { name: 'Презентация',        emoji: '📽️', items: ['ppt', 'pptx', 'odp'] },
  spreadsheet:  { name: 'Таблица',            emoji: '📊', items: ['xls', 'xlsx', 'ods', 'csv'] }
};
/* ---------------------- УТИЛИТЫ ---------------------- */

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n) { return shuffle(arr).slice(0, n); }

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* ---------------------- ГЕНЕРАЦИЯ ЗАДАНИЙ ---------------------- */

function generateTasks() {
  const tasks = [];
  const allKeys = Object.keys(CATEGORIES);

  /* --- БЛОК 1: 8 заданий «выбери категорию» --- */
  for (let i = 0; i < 8; i++) {
    const correctKey = pick(allKeys);
    const correctExt = pick(CATEGORIES[correctKey].items);
    const wrongKeys = pickN(allKeys.filter(k => k !== correctKey), 3);

    const options = shuffle([
      { text: CATEGORIES[correctKey].name, correct: true },
      ...wrongKeys.map(k => ({ text: CATEGORIES[k].name, correct: false }))
    ]);

    tasks.push({
      type: 'choice',
      topic: 'Тип файла',
      instruction: `К какому типу относится расширение .${correctExt}?`,
      badge: '.' + correctExt,
      options: options.map(o => o.text),
      correct: CATEGORIES[correctKey].name,
      explain: `.${correctExt} — это ${CATEGORIES[correctKey].name.toLowerCase()} ${CATEGORIES[correctKey].emoji}.`
    });
  }

  /* --- БЛОК 2: 6 заданий «выбери все файлы категории» --- */
  for (let i = 0; i < 6; i++) {
    const targetKey = pick(allKeys);
    const correctList = pickN(CATEGORIES[targetKey].items, randInt(3, 4));

    const wrongPool = allKeys
      .filter(k => k !== targetKey)
      .flatMap(k => CATEGORIES[k].items);
    const wrongList = pickN(wrongPool, 8 - correctList.length);

    const all = shuffle([...correctList, ...wrongList]);

    tasks.push({
      type: 'multi',
      topic: 'Категории файлов',
      instruction: `Выберите ВСЕ файлы с расширениями категории «${CATEGORIES[targetKey].name}».`,
      options: all.map(e => '.' + e),
      correct: correctList.map(e => '.' + e),
      explain: `К категории «${CATEGORIES[targetKey].name}» относятся: ${correctList.map(e => '.' + e).join(', ')}.`
    });
  }

  /* --- БЛОК 3: 8 заданий «сопоставь расширение и категорию» --- */
  for (let i = 0; i < 8; i++) {
    // 5 разных категорий, по 1 расширению из каждой
    const selectedKeys = pickN(allKeys, 5);
    const pairs = selectedKeys.map(k => ({
      left: '.' + pick(CATEGORIES[k].items),
      right: CATEGORIES[k].name
    }));

    tasks.push({
      type: 'match',
      topic: 'Соответствие',
      instruction: 'Установите соответствие: каждому расширению подберите его тип файла.',
      pairs,
      explain: pairs.map(p => `${p.left} → ${p.right}`).join('; ') + '.'
    });
  }

  return tasks;
}

/* ---------------------- СОСТОЯНИЕ ---------------------- */

const state = {
  tasks: [],
  qIndex: 0,
  correct: 0,
  answered: false,
  selection: null,
  matchSel: {}
};

/* ---------------------- DOM ---------------------- */

const el = {
  progressText: document.getElementById('progressText'),
  progressFill: document.getElementById('progressFill'),
  screenQuiz:   document.getElementById('screen-quiz'),
  screenResult: document.getElementById('screen-result'),
  taskTopic:    document.getElementById('taskTopic'),
  instruction:  document.getElementById('instruction'),
  taskBody:     document.getElementById('taskBody'),
  feedback:     document.getElementById('feedback'),
  checkBtn:     document.getElementById('checkBtn'),
  nextBtn:      document.getElementById('nextBtn'),
  finishEmoji:  document.getElementById('finishEmoji'),
  finishTitle:  document.getElementById('finishTitle'),
  finishText:   document.getElementById('finishText'),
  retryBtn:     document.getElementById('retryBtn'),
  backBtn:      document.getElementById('backBtn')
};

/* ---------------------- УТИЛИТЫ ЗАДАНИЯ ---------------------- */

function currentTask() { return state.tasks[state.qIndex]; }

function setFeedback(kind, text) {
  el.feedback.className = 'feedback' + (kind ? ' ' + kind : '');
  el.feedback.textContent = text || '';
}

function updateProgress(done) {
  const total = state.tasks.length;
  const doneCount = state.qIndex + (done ? 1 : 0);
  el.progressText.textContent = `Задание ${state.qIndex + 1} из ${total}`;
  el.progressFill.style.width = Math.round((doneCount / total) * 100) + '%';
}

/* ---------------------- ОТРИСОВКА ВОПРОСА ---------------------- */

function renderQuestion() {
  const q = currentTask();
  state.answered = false;
  state.selection = null;
  state.matchSel = {};

  el.taskTopic.textContent = q.topic;
  el.instruction.textContent = q.instruction;
  el.taskBody.innerHTML = '';
  setFeedback('', '');

  el.checkBtn.hidden = false;
  el.checkBtn.disabled = false;
  el.nextBtn.hidden = true;
  el.nextBtn.textContent = (state.qIndex === state.tasks.length - 1)
    ? 'Завершить ✓'
    : 'Далее →';

  updateProgress(false);

  if (q.badge) {
    const badge = document.createElement('div');
    badge.className = 'expr-badge';
    badge.textContent = q.badge;
    el.taskBody.appendChild(badge);
  }

  if (q.type === 'choice')      renderChoice(q);
  else if (q.type === 'multi')  renderMulti(q);
  else if (q.type === 'match')  renderMatch(q);
}

/* --- тип 1: выбор одного варианта --- */
function renderChoice(q) {
  const wrap = document.createElement('div');
  wrap.className = 'options';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      if (state.answered) return;
      state.selection = opt;
      Array.from(wrap.children).forEach(c => c.classList.toggle('selected', c === btn));
    });
    wrap.appendChild(btn);
  });
  el.taskBody.appendChild(wrap);
}

/* --- тип 2: множественный выбор --- */
function renderMulti(q) {
  state.selection = new Set();
  const palette = document.createElement('div');
  palette.className = 'palette';
  q.options.forEach(opt => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'card';
    chip.textContent = opt;
    chip.addEventListener('click', () => {
      if (state.answered) return;
      if (state.selection.has(opt)) {
        state.selection.delete(opt);
        chip.classList.remove('selected');
      } else {
        state.selection.add(opt);
        chip.classList.add('selected');
      }
    });
    palette.appendChild(chip);
  });
  el.taskBody.appendChild(palette);
}

/* --- тип 3: сопоставление --- */
function renderMatch(q) {
  state.matchSel = {};
  const list = document.createElement('div');
  list.className = 'match-list';

  // Уникальные правые варианты
  const rightOptions = [...new Set(q.pairs.map(p => p.right))];

  q.pairs.forEach(pair => {
    const row = document.createElement('div');
    row.className = 'match-row';

    const label = document.createElement('div');
    label.className = 'match-label';
    label.textContent = pair.left;

    const select = document.createElement('select');
    select.className = 'match-select';
    select.dataset.left = pair.left;

    const ph = document.createElement('option');
    ph.value = '';
    ph.textContent = '— выберите тип —';
    select.appendChild(ph);

    rightOptions.forEach(r => {
      const o = document.createElement('option');
      o.value = r;
      o.textContent = r;
      select.appendChild(o);
    });

    select.addEventListener('change', () => {
      state.matchSel[pair.left] = select.value;
    });

    row.appendChild(label);
    row.appendChild(select);
    list.appendChild(row);
  });

  el.taskBody.appendChild(list);
}

/* ---------------------- ПРОВЕРКА ---------------------- */

function markChoice(q) {
  el.taskBody.querySelectorAll('.option').forEach(btn => {
    btn.disabled = true;
    btn.classList.remove('selected');
    if (btn.textContent === q.correct) btn.classList.add('ok');
    else if (state.selection === btn.textContent) btn.classList.add('wrong');
  });
}

function markMulti(q) {
  el.taskBody.querySelectorAll('.card').forEach(chip => {
    chip.disabled = true;
    chip.classList.remove('selected');
    if (q.correct.includes(chip.textContent)) chip.classList.add('ok');
    else if (state.selection.has(chip.textContent)) chip.classList.add('wrong');
  });
}

function markMatch(q) {
  el.taskBody.querySelectorAll('.match-select').forEach(select => {
    select.disabled = true;
    const pair = q.pairs.find(p => p.left === select.dataset.left);
    if (pair && select.value === pair.right) select.classList.add('ok');
    else select.classList.add('wrong');
  });
}

function checkAnswer() {
  if (state.answered) return;
  const q = currentTask();
  let isCorrect = false;
  let correctText = '';

  if (q.type === 'choice') {
    if (!state.selection) { setFeedback('warn', 'Сначала выберите вариант ответа.'); return; }
    isCorrect = state.selection === q.correct;
    correctText = q.correct;
    markChoice(q);

  } else if (q.type === 'multi') {
    if (state.selection.size === 0) { setFeedback('warn', 'Выберите хотя бы один вариант.'); return; }
    isCorrect = state.selection.size === q.correct.length &&
                q.correct.every(v => state.selection.has(v));
    correctText = q.correct.join(', ');
    markMulti(q);

  } else if (q.type === 'match') {
    const unfilled = q.pairs.some(p => !state.matchSel[p.left]);
    if (unfilled) { setFeedback('warn', 'Сопоставьте все расширения с типами.'); return; }
    isCorrect = q.pairs.every(p => state.matchSel[p.left] === p.right);
    correctText = q.pairs.map(p => `${p.left} → ${p.right}`).join('; ');
    markMatch(q);
  }

  state.answered = true;
  if (isCorrect) state.correct++;

  el.checkBtn.hidden = true;
  el.nextBtn.hidden = false;
  updateProgress(true);

  if (isCorrect) {
    setFeedback('success', '✅ Правильно! ' + (q.explain || ''));
  } else {
    setFeedback('error', '❌ Неправильно. Правильный ответ: ' + correctText + '.' +
      (q.explain ? ' ' + q.explain : ''));
  }
}

/* ---------------------- ПЕРЕХОД ---------------------- */

function nextQuestion() {
  if (!state.answered) return;
  if (state.qIndex + 1 >= state.tasks.length) { showResult(); return; }
  state.qIndex++;
  renderQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------------------- РЕЗУЛЬТАТ ---------------------- */

function showResult() {
  const total = state.tasks.length;
  const pct = Math.round((state.correct / total) * 100);

  el.screenQuiz.hidden = true;
  el.screenResult.hidden = false;

  if (pct === 100) {
    el.finishEmoji.textContent = '🏆';
    el.finishTitle.textContent = 'Отлично! Всё верно!';
  } else if (pct >= 70) {
    el.finishEmoji.textContent = '🎉';
    el.finishTitle.textContent = 'Хороший результат!';
  } else if (pct >= 40) {
    el.finishEmoji.textContent = '👍';
    el.finishTitle.textContent = 'Неплохо, но есть над чем поработать';
  } else {
    el.finishEmoji.textContent = '💪';
    el.finishTitle.textContent = 'Стоит повторить тему';
  }

  el.finishText.innerHTML =
    `Правильно выполнено <strong>${state.correct} из ${total}</strong> заданий (${pct}%).`;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------------------- СТАРТ / СОБЫТИЯ ---------------------- */

function startOver() {
  state.tasks = generateTasks();
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

/* ---------------------- ИНИЦИАЛИЗАЦИЯ ---------------------- */

state.tasks = generateTasks();
renderQuestion();
