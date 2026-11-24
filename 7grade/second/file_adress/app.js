'use strict';

/* ==========================================================
   ТРЕНАЖЁР: Адреса файлов в Интернете (7 класс)
   Структура: 8 + 4 + 2 + 8 + 12 + 4 = 38 заданий
   ========================================================== */

/* ---------------------- УТИЛИТЫ ---------------------- */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

/* ---------------------- ПУЛЫ ---------------------- */

const PROTOCOLS    = ['http', 'https', 'ftp'];
const SERVER_NAMES = ['circ', 'pet', 'fun', 'ofis', 'sound', 'game', 'school',
                      'mail', 'shop', 'news', 'blog', 'file', 'cloud', 'data', 'web'];
const DOMAINS      = ['.org', '.com', '.ru', '.net', '.edu', '.info'];
const FILE_NAMES   = ['slon', 'cat', 'table', 'music', 'game', 'report', 'photo',
                      'video', 'doc', 'text', 'story', 'song', 'image', 'page'];
const EXTENSIONS   = ['.txt', '.jpg', '.xls', '.mp3', '.exe', '.doc',
                      '.pdf', '.html', '.png', '.zip'];

/* ---------------------- ГЕНЕРАЦИЯ АДРЕСА ---------------------- */

function makeUrl() {
  const protocol   = pick(PROTOCOLS);
  const serverName = pick(SERVER_NAMES);
  const domain     = pick(DOMAINS);
  const fileName   = pick(FILE_NAMES);
  const ext        = pick(EXTENSIONS);
  const server     = serverName + domain;
  const file       = fileName + ext;
  const url        = protocol + '://' + server + '/' + file;

  const fragments = [
    { kind: 'protocol',   text: protocol },
    { kind: 'sep',        text: '://' },
    { kind: 'serverName', text: serverName },
    { kind: 'domain',     text: domain },
    { kind: 'slash',      text: '/' },
    { kind: 'fileName',   text: fileName },
    { kind: 'ext',        text: ext }
  ];
  return { protocol, serverName, domain, server, fileName, ext, file, url, fragments };
}

// N разных адресов — для задания «разложить по группам»
function makeUniqueUrls(n) {
  const protocols = pickN(PROTOCOLS, n);
  const names     = pickN(SERVER_NAMES, n);
  const domains   = pickN(DOMAINS, n);
  const files     = pickN(FILE_NAMES, n);
  const exts      = pickN(EXTENSIONS, n);
  return Array.from({ length: n }, (_, i) => ({
    protocol: protocols[i],
    server:   names[i] + domains[i],
    file:     files[i] + exts[i]
  }));
}

function shuffledFragments(fragments) {
  const key = arr => arr.map(f => f.text).join('|');
  let s = shuffle(fragments);
  let attempts = 0;
  while (key(s) === key(fragments) && attempts < 15) {
    s = shuffle(fragments);
    attempts++;
  }
  return s;
}

/* ==========================================================
   ГЕНЕРАЦИЯ ЗАДАНИЙ
   ========================================================== */

function generateTasks() {
  const tasks = [];

  /* ---------- БЛОК 1: Определить часть адреса (8) ---------- */
  // Только протокол / сервер / файл / домен. Никакого «пути»!
  const qTypes = ['protocol', 'server', 'file', 'domain'];

  for (let i = 0; i < 8; i++) {
    const u = makeUrl();
    const qType = qTypes[i % qTypes.length];

    let question, correct, options;
    if (qType === 'protocol') {
      question = 'Что в этом адресе является протоколом?';
      correct  = u.protocol;
      options  = [u.protocol, '://', u.server, '/' + u.file];
    } else if (qType === 'server') {
      question = 'Что в этом адресе является именем сервера?';
      correct  = u.server;
      options  = [u.server, u.protocol, '://', '/' + u.file];
    } else if (qType === 'file') {
      question = 'Что в этом адресе является именем файла?';
      correct  = u.file;
      options  = [u.file, u.protocol, u.server, '://'];
    } else {
      question = 'Что в этом адресе является доменом верхнего уровня?';
      correct  = u.domain;
      options  = [u.domain, u.protocol, '://', u.file];
    }

    tasks.push({
      type: 'choice',
      instruction: `Дан адрес файла:\n\n${u.url}\n\n${question}`,
      options: shuffle(options),
      correct,
      explain: `В адресе ${u.url}:\n• протокол — ${u.protocol}\n• сервер — ${u.server}\n• файл — ${u.file}`
    });
  }

  /* ---------- БЛОК 2: Разложить фрагменты по группам (4) ---------- */
  for (let i = 0; i < 4; i++) {
    const urls = makeUniqueUrls(3);
    const fragments = shuffle([
      { text: urls[0].protocol, category: 'protocol' },
      { text: urls[1].protocol, category: 'protocol' },
      { text: urls[2].protocol, category: 'protocol' },
      { text: urls[0].server,   category: 'server'   },
      { text: urls[1].server,   category: 'server'   },
      { text: urls[2].server,   category: 'server'   },
      { text: urls[0].file,     category: 'file'     },
      { text: urls[1].file,     category: 'file'     },
      { text: urls[2].file,     category: 'file'     }
    ]);

    tasks.push({
      type: 'categorize',
      instruction:
        'Даны фрагменты адресов файлов. Распределите каждый фрагмент по группам: ' +
        '«Протокол», «Сервер» или «Файл».',
      fragments,
      categories: [
        { key: 'protocol', label: 'Протокол' },
        { key: 'server',   label: 'Сервер'   },
        { key: 'file',     label: 'Файл'     }
      ],
      explain:
        'Протокол — это http, https или ftp. ' +
        'Сервер — имя + домен (например, circ.org). ' +
        'Файл — имя с расширением (например, slon.txt).'
    });
  }

  /* ---------- БЛОК 3: Разделители (2) ---------- */
  // Вопрос 1: чем отделяется протокол от сервера → ://
  {
    const u = makeUrl();
    const options = shuffle(['://', '/', ':', '.']);
    tasks.push({
      type: 'choice',
      instruction:
        `Каким символом (группой символов) в адресе файла отделяется протокол ` +
        `от имени сервера?\n\nПример: ${u.url}`,
      options,
      correct: '://',
      explain:
        'Протокол отделяется от сервера группой символов «://». ' +
        `Например: ${u.protocol}://${u.server}/${u.file}`
    });
  }
  // Вопрос 2: чем отделяется сервер от файла → /
  {
    const u = makeUrl();
    const options = shuffle(['/', '://', ':', '\\']);
    tasks.push({
      type: 'choice',
      instruction:
        `Каким символом в адресе файла отделяется имя сервера от имени файла?\n\n` +
        `Пример: ${u.url}`,
      options,
      correct: '/',
      explain:
        'Имя сервера отделяется от имени файла символом «/». ' +
        `Например: ${u.server}/${u.file}`
    });
  }

  /* ---------- БЛОК 4: Перетащить фрагменты (8) ---------- */
  for (let i = 0; i < 8; i++) {
    const u = makeUrl();
    tasks.push({
      type: 'drag',
      instruction:
        `Доступ к файлу ${u.file}, находящемуся на сервере ${u.server}, ` +
        `осуществляется по протоколу ${u.protocol}.\n\n` +
        `Расположите фрагменты адреса в правильном порядке:`,
      fragments:    shuffledFragments(u.fragments),
      correctOrder: u.fragments.map(f => f.text),
      correctUrl:   u.url,
      explain:      `Правильный адрес: ${u.url}`
    });
  }

  /* ---------- БЛОК 5: Ввести последовательность букв (12) ---------- */
  const LETTERS = 'АБВГДЕЖ';

  for (let i = 0; i < 12; i++) {
    const u = makeUrl();
    const shuffled = shuffledFragments(u.fragments);
    const withLetters = shuffled.map((f, idx) => ({ ...f, letter: LETTERS[idx] }));

    const correctSeq = u.fragments
      .map(orig => {
        const idx = shuffled.findIndex(s => s.text === orig.text);
        return LETTERS[idx];
      })
      .join('');

    tasks.push({
      type: 'sequence',
      instruction:
        `Доступ к файлу ${u.file}, находящемуся на сервере ${u.server}, ` +
        `осуществляется по протоколу ${u.protocol}.\n\n` +
        `Фрагменты адреса:`,
      fragments: withLetters,
      correct:   correctSeq,
      correctUrl: u.url,
      explain:
        `Правильный адрес: ${u.url}\n` +
        `Порядок фрагментов: ${u.fragments.map(f => f.text).join(' ')}\n` +
        `Последовательность букв: ${correctSeq}`
    });
  }

  /* ---------- БЛОК 6: Короткий ответ (4) ---------- */
  const shortTypes = ['protocol', 'server', 'file', 'domain'];

  for (let i = 0; i < 4; i++) {
    const u = makeUrl();
    const t = shortTypes[i % shortTypes.length];

    let question, correct;
    if (t === 'protocol') {
      question = 'Какой протокол используется в этом адресе?';
      correct  = u.protocol;
    } else if (t === 'server') {
      question = 'Как называется сервер (полное имя сервера) в этом адресе?';
      correct  = u.server;
    } else if (t === 'file') {
      question = 'Как называется файл (с расширением) в этом адресе?';
      correct  = u.file;
    } else {
      question = 'Какой домен верхнего уровня используется в этом адресе?';
      correct  = u.domain;
    }

    tasks.push({
      type: 'short',
      instruction: `Дан адрес файла:\n\n${u.url}\n\n${question}`,
      correct,
      explain: `Протокол — ${u.protocol}, сервер — ${u.server}, файл — ${u.file}, домен — ${u.domain}.`
    });
  }

  // ИТОГО: 8 + 4 + 2 + 8 + 12 + 4 = 38 заданий
  return tasks;
}

/* ==========================================================
   СОСТОЯНИЕ
   ========================================================== */

const state = {
  qIndex: 0,
  correct: 0,
  answered: false,
  selection: null,
  tasks: []
};

/* ==========================================================
   DOM
   ========================================================== */

const el = {
  progressText: document.getElementById('progressText'),
  progressFill: document.getElementById('progressFill'),
  screenQuiz:   document.getElementById('screen-quiz'),
  screenResult: document.getElementById('screen-result'),
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

/* ==========================================================
   ВСПОМОГАТЕЛЬНОЕ
   ========================================================== */

function currentTask() { return state.tasks[state.qIndex]; }

function setFeedback(kind, text) {
  el.feedback.className = 'feedback' + (kind ? ' ' + kind : '');
  el.feedback.textContent = text || '';
}

function updateProgress(done) {
  const total = state.tasks.length;
  const d = state.qIndex + (done ? 1 : 0);
  el.progressText.textContent = `Задание ${state.qIndex + 1} из ${total}`;
  el.progressFill.style.width = Math.round((d / total) * 100) + '%';
}

/* ==========================================================
   ОТРИСОВКА
   ========================================================== */

function renderTask() {
  const q = currentTask();
  state.answered = false;
  state.selection = null;

  el.taskBody.innerHTML = '';
  setFeedback('', '');

  el.checkBtn.hidden = false;
  el.checkBtn.disabled = false;
  el.nextBtn.hidden = true;
  el.nextBtn.textContent = (state.qIndex === state.tasks.length - 1) ? 'Завершить ✓' : 'Далее →';

  updateProgress(false);

  if (q.type === 'choice')         renderChoice(q);
  else if (q.type === 'categorize') renderCategorize(q);
  else if (q.type === 'drag')      renderDrag(q);
  else if (q.type === 'sequence')  renderSequence(q);
  else if (q.type === 'short')     renderShort(q);
}

function renderChoice(q) {
  el.instruction.textContent = q.instruction;

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

function renderCategorize(q) {
  el.instruction.textContent = q.instruction;

  const hint = document.createElement('div');
  hint.className = 'drag-hint';
  hint.textContent = '💡 Для каждого фрагмента нажмите кнопку с подходящей группой.';
  el.taskBody.appendChild(hint);

  const wrap = document.createElement('div');
  wrap.className = 'categorize-items';

  const choices = {};

  q.fragments.forEach((frag, idx) => {
    const item = document.createElement('div');
    item.className = 'cat-item';

    const text = document.createElement('span');
    text.className = 'cat-text';
    text.textContent = frag.text;
    item.appendChild(text);

    const btns = document.createElement('div');
    btns.className = 'cat-buttons';
    q.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cat-btn';
      btn.textContent = cat.label;
      btn.dataset.cat = cat.key;
      btn.addEventListener('click', () => {
        if (state.answered) return;
        choices[idx] = cat.key;
        Array.from(btns.children).forEach(b => b.classList.toggle('selected', b === btn));
      });
      btns.appendChild(btn);
    });
    item.appendChild(btns);
    wrap.appendChild(item);
  });

  el.taskBody.appendChild(wrap);

  state.selection = { choices, wrap };
}

function renderDrag(q) {
  el.instruction.textContent = q.instruction;

  const hint = document.createElement('div');
  hint.className = 'drag-hint';
  hint.textContent = '💡 Перетаскивайте карточки или нажмите на две, чтобы поменять местами.';
  el.taskBody.appendChild(hint);

  const list = document.createElement('div');
  list.className = 'sortable';

  q.fragments.forEach(frag => {
    const item = document.createElement('div');
    item.className = 'sort-item';
    item.draggable = true;
    item.dataset.text = frag.text;
    item.textContent = frag.text;
    list.appendChild(item);
  });
  el.taskBody.appendChild(list);

  let dragSrc = null;
  let clickSrc = null;

  list.addEventListener('dragstart', e => {
    if (state.answered) { e.preventDefault(); return; }
    const item = e.target.closest('.sort-item');
    if (!item) return;
    dragSrc = item;
    item.classList.add('dragging');
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  });

  list.addEventListener('dragover', e => {
    e.preventDefault();
    if (!dragSrc) return;
    const item = e.target.closest('.sort-item');
    if (!item || item === dragSrc) return;
    const rect = item.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    if (e.clientY < midY) list.insertBefore(dragSrc, item);
    else list.insertBefore(dragSrc, item.nextSibling);
  });

  list.addEventListener('dragend', () => {
    if (dragSrc) dragSrc.classList.remove('dragging');
    dragSrc = null;
  });

  list.addEventListener('click', e => {
    if (state.answered) return;
    const item = e.target.closest('.sort-item');
    if (!item) return;

    if (!clickSrc) {
      clickSrc = item;
      item.classList.add('selected');
      return;
    }
    if (clickSrc === item) {
      clickSrc.classList.remove('selected');
      clickSrc = null;
      return;
    }
    const items = [...list.children];
    const i1 = items.indexOf(clickSrc);
    const i2 = items.indexOf(item);
    items[i1] = item;
    items[i2] = clickSrc;
    list.innerHTML = '';
    items.forEach(it => list.appendChild(it));
    clickSrc.classList.remove('selected');
    clickSrc = null;
  });

  state.selection = list;
}

function renderSequence(q) {
  el.instruction.textContent = q.instruction;

  const list = document.createElement('div');
  list.className = 'fragments-list';
  q.fragments.forEach(frag => {
    const row = document.createElement('div');
    row.className = 'fragment-row';
    const letter = document.createElement('span');
    letter.className = 'frag-letter';
    letter.textContent = frag.letter + ')';
    const text = document.createElement('span');
    text.className = 'frag-text';
    text.textContent = frag.text;
    row.appendChild(letter);
    row.appendChild(text);
    list.appendChild(row);
  });
  el.taskBody.appendChild(list);

  const wrap = document.createElement('div');
  wrap.className = 'input-wrap';

  const caption = document.createElement('div');
  caption.className = 'input-caption';
  caption.textContent = 'Запишите последовательность букв, которая кодирует полный адрес файла:';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'input-answer';
  input.placeholder = 'Например: АБВГДЕЖ';
  input.autocomplete = 'off';
  input.maxLength = 20;
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!state.answered) checkAnswer();
      else if (!el.nextBtn.hidden) el.nextBtn.click();
    }
  });

  wrap.appendChild(caption);
  wrap.appendChild(input);
  el.taskBody.appendChild(wrap);

  state.selection = input;
  setTimeout(() => input.focus(), 100);
}

function renderShort(q) {
  el.instruction.textContent = q.instruction;

  const wrap = document.createElement('div');
  wrap.className = 'input-wrap';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'input-answer input-text';
  input.placeholder = 'Введите ответ';
  input.autocomplete = 'off';
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!state.answered) checkAnswer();
      else if (!el.nextBtn.hidden) el.nextBtn.click();
    }
  });

  wrap.appendChild(input);
  el.taskBody.appendChild(wrap);

  state.selection = input;
  setTimeout(() => input.focus(), 100);
}

/* ==========================================================
   ПРОВЕРКА
   ========================================================== */

function markChoice(q) {
  el.taskBody.querySelectorAll('.option').forEach(btn => {
    btn.disabled = true;
    btn.classList.remove('selected');
    if (btn.textContent === q.correct) btn.classList.add('ok');
    else if (state.selection === btn.textContent) btn.classList.add('wrong');
  });
}

function markCategorize(q) {
  const items = state.selection.wrap.querySelectorAll('.cat-item');
  items.forEach((item, idx) => {
    const correctCat = q.fragments[idx].category;
    const userCat    = state.selection.choices[idx];
    const btns = item.querySelectorAll('.cat-btn');
    btns.forEach(btn => {
      btn.disabled = true;
      btn.classList.remove('selected');
      if (btn.dataset.cat === correctCat)        btn.classList.add('ok');
      else if (btn.dataset.cat === userCat)      btn.classList.add('wrong');
    });
  });
}

function markDrag(q) {
  const items = [...state.selection.children];
  items.forEach((it, idx) => {
    it.draggable = false;
    it.classList.remove('dragging', 'selected');
    if (it.dataset.text === q.correctOrder[idx]) it.classList.add('ok');
    else it.classList.add('wrong');
  });
}

function checkAnswer() {
  if (state.answered) return;
  const q = currentTask();
  let isCorrect = false;
  let correctText = '';
  const explainText = q.explain || '';

  if (q.type === 'choice') {
    if (!state.selection) { setFeedback('warn', 'Сначала выберите вариант ответа.'); return; }
    isCorrect = state.selection === q.correct;
    correctText = q.correct;
    markChoice(q);
  } else if (q.type === 'categorize') {
    const allFilled = q.fragments.every((_, idx) => state.selection.choices[idx]);
    if (!allFilled) { setFeedback('warn', 'Назначьте группу для каждого фрагмента.'); return; }
    isCorrect = q.fragments.every((f, idx) =>
      state.selection.choices[idx] === f.category
    );
    correctText = 'см. подсветку ниже';
    markCategorize(q);
  } else if (q.type === 'drag') {
    const items = [...state.selection.children];
    const userOrder = items.map(it => it.dataset.text);
    isCorrect = userOrder.join('|') === q.correctOrder.join('|');
    correctText = q.correctUrl;
    markDrag(q);
  } else if (q.type === 'sequence') {
    const raw = state.selection.value;
    if (!raw.trim()) { setFeedback('warn', 'Введите последовательность букв.'); return; }
    const normalized = raw.toUpperCase().replace(/[\s,;.\-–—]/g, '');
    isCorrect = normalized === q.correct;
    correctText = q.correct;
    state.selection.disabled = true;
    state.selection.classList.add(isCorrect ? 'ok' : 'wrong');
    if (!isCorrect) state.selection.value = q.correct;
  } else if (q.type === 'short') {
    const raw = state.selection.value;
    if (!raw.trim()) { setFeedback('warn', 'Введите ответ.'); return; }
    let user = raw.trim().toLowerCase().replace(/\s/g, '');
    let expected = q.correct.toLowerCase().replace(/\s/g, '');
    if (q.correct.startsWith('.')) {
      user = user.replace(/^\./, '');
      expected = expected.replace(/^\./, '');
    }
    if (user.endsWith('://')) user = user.slice(0, -3);
    isCorrect = user === expected;
    correctText = q.correct;
    state.selection.disabled = true;
    state.selection.classList.add(isCorrect ? 'ok' : 'wrong');
    if (!isCorrect) state.selection.value = q.correct;
  }

  state.answered = true;
  if (isCorrect) state.correct++;

  el.checkBtn.hidden = true;
  el.nextBtn.hidden = false;
  updateProgress(true);

  if (isCorrect) {
    setFeedback('success', '✅ Правильно! ' + explainText);
  } else {
    setFeedback('error',
      `❌ Неправильно. Правильный ответ: ${correctText}\n` + explainText);
  }
}

/* ==========================================================
   ПЕРЕХОД
   ========================================================== */

function nextTask() {
  if (!state.answered) return;
  if (state.qIndex + 1 >= state.tasks.length) { showResult(); return; }
  state.qIndex++;
  renderTask();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================
   РЕЗУЛЬТАТ
   ========================================================== */

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

/* ==========================================================
   СТАРТ
   ========================================================== */

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