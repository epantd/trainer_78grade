'use strict';

/* ==========================================================
   ТРЕНАЖЁР: Логические высказывания и операции над ними
   30 заданий, данные генерируются случайно
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

/* ---------------------- ПУЛЫ ДАННЫХ ---------------------- */

const STATEMENTS = [
  'Москва — столица России.',
  '5 больше 3.',
  'Все кошки серые.',
  'Сегодня идёт дождь.',
  '10 делится на 2 без остатка.',
  'Солнце вращается вокруг Земли.',
  'В слове «кот» три буквы.',
  '2 + 2 = 5.',
  'Луна — спутник Земли.',
  'Вода кипит при 100 градусах.',
  'Пингвины умеют летать.',
  'Земля плоская.',
  'Снег белый.',
  'В неделе семь дней.',
  'Рыбы живут в воде.'
];

const NON_STATEMENTS = [
  'Который час?',
  'Съешь конфету!',
  'Какая сегодня погода?',
  'Иди сюда!',
  'Почему небо голубое?',
  'Закрой окно.',
  'Кто ты?',
  'Давай поиграем.',
  'Как тебя зовут?',
  'Принеси мне воды.',
  'Сколько тебе лет?',
  'Помоги мне, пожалуйста.',
  'Ура, каникулы!',
  'Будь внимательнее!',
  'Что ты делаешь?'
];

const SIMPLE_STATEMENTS = [
  'Москва — столица России.',
  '5 больше 3.',
  'Идёт дождь.',
  'Солнце светит.',
  'Кошка спит.',
  'Я люблю чай.',
  'Сегодня понедельник.',
  'Небо голубое.',
  'Птица поёт.',
  'Река течёт.',
  'Трава зелёная.',
  'Мяч круглый.',
  'Утка плавает.'
];

const COMPOUND_STATEMENTS = [
  'Идёт дождь и дует ветер.',
  'Я куплю яблоки или груши.',
  'Неверно, что 2 + 2 = 5.',
  'Если идёт дождь, то на улице мокро.',
  'Светит солнце, но дует ветер.',
  '5 больше 3 и меньше 10.',
  'Он не пришёл на урок.',
  'Я поеду на море или в горы.',
  'Если сегодня пятница, то завтра суббота.',
  'Она умеет плавать и играть в шахматы.',
  'Кошка спит, а собака лает.',
  'Если я выучу уроки, то пойду гулять.'
];

const WORDS = [
  'Парта', 'Апельсин', 'Яблоко', 'Окно', 'Стол', 'Дом', 'Мяч', 'Ёж',
  'Ёлка', 'Улитка', 'Ручка', 'Книга', 'Кот', 'Лиса', 'Зима', 'Река',
  'Утро', 'Вечер', 'Туча', 'Звезда', 'Арбуз', 'Игра', 'Слон', 'Тигр',
  'Осёл', 'Ель', 'Ирис', 'Орёл', 'Астра', 'Ясень', 'Утка', 'Ёрш'
];

const VOWELS = 'АЕЁИОУЫЭЮЯаеёиоуыэюя';
function isVowel(ch) { return VOWELS.includes(ch); }

/* ==========================================================
   ГЕНЕРАЦИЯ ЗАДАНИЙ
   ========================================================== */

function generateTasks() {
  const tasks = [];

  /* ---------- БЛОК 1: Высказывание или нет (4 задания) ---------- */
  for (let i = 0; i < 4; i++) {
    const isStatement = Math.random() < 0.5;
    const sentence = isStatement ? pick(STATEMENTS) : pick(NON_STATEMENTS);
    tasks.push({
      type: 'choice',
      instruction: `Является ли это предложение высказыванием?\n\n«${sentence}»`,
      options: ['Да, это высказывание', 'Нет, это не высказывание'],
      correct: isStatement ? 'Да, это высказывание' : 'Нет, это не высказывание',
      explain: isStatement
        ? 'Высказывание — предложение, о котором можно сказать «истинно» или «ложно».'
        : 'Это не высказывание: вопрос, побуждение или восклицание — про него нельзя сказать «истинно/ложно».'
    });
  }

  /* ---------- БЛОК 2: Простое или составное (4 задания) ---------- */
  for (let i = 0; i < 4; i++) {
    const isCompound = Math.random() < 0.5;
    const sentence = isCompound ? pick(COMPOUND_STATEMENTS) : pick(SIMPLE_STATEMENTS);
    tasks.push({
      type: 'choice',
      instruction: `Определите тип высказывания:\n\n«${sentence}»`,
      options: ['Простое высказывание', 'Составное высказывание'],
      correct: isCompound ? 'Составное высказывание' : 'Простое высказывание',
      explain: isCompound
        ? 'Составное высказывание содержит логические связки: И, ИЛИ, НЕ, ЕСЛИ...ТО.'
        : 'Простое высказывание содержит одно суждение — без логических связок.'
    });
  }

  /* ---------- БЛОК 3: Мультивыбор (3 задания) ---------- */
  // 9: все высказывания
  {
    const correctList = pickN([...STATEMENTS, ...SIMPLE_STATEMENTS, ...COMPOUND_STATEMENTS], 3);
    const wrongList = pickN(NON_STATEMENTS, 3);
    const all = shuffle([...correctList, ...wrongList]);
    tasks.push({
      type: 'multi',
      instruction: 'Выберите ВСЕ высказывания (то, о чём можно сказать «истинно» или «ложно»).',
      options: all,
      correct: correctList,
      explain: 'Вопросы и побуждения — не высказывания, потому что их нельзя оценить как истинные или ложные.'
    });
  }
  // 10: все простые
  {
    const correctList = pickN(SIMPLE_STATEMENTS, 3);
    const wrongList = pickN([...COMPOUND_STATEMENTS, ...NON_STATEMENTS], 3);
    const all = shuffle([...correctList, ...wrongList]);
    tasks.push({
      type: 'multi',
      instruction: 'Выберите ВСЕ ПРОСТЫЕ высказывания (без логических связок).',
      options: all,
      correct: correctList,
      explain: 'Простое высказывание содержит одно суждение, без И, ИЛИ, НЕ, ЕСЛИ...ТО.'
    });
  }
  // 11: все составные
  {
    const correctList = pickN(COMPOUND_STATEMENTS, 3);
    const wrongList = pickN([...SIMPLE_STATEMENTS, ...NON_STATEMENTS], 3);
    const all = shuffle([...correctList, ...wrongList]);
    tasks.push({
      type: 'multi',
      instruction: 'Выберите ВСЕ СОСТАВНЫЕ высказывания (содержат И, ИЛИ, НЕ, ЕСЛИ...ТО).',
      options: all,
      correct: correctList,
      explain: 'Составное высказывание строится из простых с помощью логических связок.'
    });
  }

  /* ---------- БЛОК 4: Слова и буквы (7 заданий) ---------- */
  const wordConds = [
    { key: 'first_vowel',     text: '(Первая буква гласная)' },
    { key: 'first_cons',      text: '(Первая буква согласная)' },
    { key: 'last_vowel',      text: '(Последняя буква гласная)' },
    { key: 'last_cons',       text: '(Последняя буква согласная)' },
    { key: 'not_first_vowel', text: 'НЕ (Первая буква гласная)' },
    { key: 'not_last_vowel',  text: 'НЕ (Последняя буква гласная)' },
    { key: 'not_first_cons',  text: 'НЕ (Первая буква согласная)' },
    { key: 'not_last_cons',   text: 'НЕ (Последняя буква согласная)' }
  ];

  function wordMatches(word, key) {
    const f = word[0];
    const l = word[word.length - 1];
    switch (key) {
      case 'first_vowel':     return isVowel(f);
      case 'first_cons':      return !isVowel(f);
      case 'last_vowel':      return isVowel(l);
      case 'last_cons':       return !isVowel(l);
      case 'not_first_vowel': return !isVowel(f);
      case 'not_last_vowel':  return !isVowel(l);
      case 'not_first_cons':  return isVowel(f);
      case 'not_last_cons':   return isVowel(l);
    }
    return false;
  }

  for (let i = 0; i < 7; i++) {
    let attempts = 0;
    let created = null;
    while (attempts < 50 && !created) {
      attempts++;
      const cond = pick(wordConds);
      const fitting = WORDS.filter(w => wordMatches(w, cond.key));
      const notFitting = WORDS.filter(w => !wordMatches(w, cond.key));
      if (fitting.length < 1 || notFitting.length < 3) continue;

      const correctWord = pick(fitting);
      const wrongWords = pickN(notFitting, 3);
      const allOptions = shuffle([correctWord, ...wrongWords]);

      created = {
        type: 'choice',
        instruction: `Выберите слово, для которого истинно высказывание:\n\n${cond.text}`,
        options: allOptions,
        correct: correctWord,
        explain: `Слово «${correctWord}» подходит под условие «${cond.text}».`
      };
    }
    if (created) tasks.push(created);
    else i--;
  }

  /* ---------- БЛОК 5: Цифры (7 заданий) ---------- */
  const digitConds = [
    { text: '(Первая цифра чётная) и (Вторая цифра чётная)',
      fn: s => +s[0] % 2 === 0 && +s[1] % 2 === 0 },
    { text: '(Первая цифра нечётная) и (Вторая цифра нечётная)',
      fn: s => +s[0] % 2 === 1 && +s[1] % 2 === 1 },
    { text: '(Первая цифра чётная) и (Последняя цифра чётная)',
      fn: s => +s[0] % 2 === 0 && +s[3] % 2 === 0 },
    { text: '(Первая цифра больше 5) и (Вторая цифра меньше 5)',
      fn: s => +s[0] > 5 && +s[1] < 5 },
    { text: '(Сумма всех цифр чётная)',
      fn: s => s.split('').reduce((a, c) => a + (+c), 0) % 2 === 0 },
    { text: '(Первая цифра кратна 3)',
      fn: s => +s[0] % 3 === 0 && +s[0] > 0 },
    { text: '(Вторая цифра больше третьей)',
      fn: s => +s[1] > +s[2] },
    { text: '(Первая цифра равна последней)',
      fn: s => s[0] === s[3] },
    { text: 'НЕ (Первая цифра чётная) и (Последняя цифра нечётная)',
      fn: s => +s[0] % 2 === 1 && +s[3] % 2 === 1 },
    { text: '(Первая цифра больше второй) и (Вторая цифра меньше третьей)',
      fn: s => +s[0] > +s[1] && +s[1] < +s[2] }
  ];

  function rand4() {
    return '' + randInt(1, 9) + randInt(0, 9) + randInt(0, 9) + randInt(0, 9);
  }

  for (let i = 0; i < 7; i++) {
    let attempts = 0;
    let created = null;
    while (attempts < 100 && !created) {
      attempts++;
      const cond = pick(digitConds);
      const fitting = [];
      const notFitting = [];
      for (let j = 0; j < 1000 && (fitting.length < 5 || notFitting.length < 5); j++) {
        const n = rand4();
        if (cond.fn(n)) fitting.push(n);
        else notFitting.push(n);
      }
      if (fitting.length < 1 || notFitting.length < 3) continue;

      const correctNum = pick(fitting);
      const wrongNums = pickN(notFitting, 3);
      const allOptions = shuffle([correctNum, ...wrongNums]);

      created = {
        type: 'choice',
        instruction: `Выберите число, для которого истинно высказывание:\n\n${cond.text}`,
        options: allOptions,
        correct: correctNum,
        explain: `Число ${correctNum} удовлетворяет условию «${cond.text}».`
      };
    }
    if (created) tasks.push(created);
    else i--;
  }

  /* ---------- БЛОК 6: Наибольшее/наименьшее X (5 заданий) ---------- */
  const xTemplates = [
    // Наибольшее: (X >= A) И НЕ (X > B) → max = B
    () => {
      const A = randInt(-10, 20);
      const B = A + randInt(3, 15);
      return {
        instruction: `Напишите наибольшее целое число x, для которого истинно высказывание:\n\n(X >= ${A}) И НЕ (X > ${B})`,
        correct: String(B),
        explain: `(X >= ${A}) И НЕ (X > ${B}) ⇒ ${A} ≤ X ≤ ${B}. Наибольшее целое — ${B}.`
      };
    },
    // Наибольшее: (X > A) И (X < B) → max = B - 1
    () => {
      const A = randInt(-10, 20);
      const B = A + randInt(3, 15);
      return {
        instruction: `Напишите наибольшее целое число x:\n\n(X > ${A}) И (X < ${B})`,
        correct: String(B - 1),
        explain: `(X > ${A}) И (X < ${B}) ⇒ ${A} < X < ${B}. Наибольшее целое — ${B - 1}.`
      };
    },
    // Наименьшее: (X > A) И НЕ (X < B) → min = max(A+1, B)
    () => {
      const A = randInt(-10, 20);
      const B = A + randInt(3, 15);
      const minX = Math.max(A + 1, B);
      return {
        instruction: `Напишите наименьшее целое число x:\n\n(X > ${A}) И НЕ (X < ${B})`,
        correct: String(minX),
        explain: `(X > ${A}) И НЕ (X < ${B}) ⇒ X > ${A} и X ≥ ${B}. Наименьшее целое — ${minX}.`
      };
    },
    // Наименьшее: (X >= A) И (X > B) → min = max(A, B+1)
    () => {
      const A = randInt(-10, 20);
      const B = A + randInt(3, 15);
      const minX = Math.max(A, B + 1);
      return {
        instruction: `Напишите наименьшее целое число x:\n\n(X >= ${A}) И (X > ${B})`,
        correct: String(minX),
        explain: `(X >= ${A}) И (X > ${B}) ⇒ X ≥ ${A} и X > ${B}. Наименьшее целое — ${minX}.`
      };
    },
    // Наибольшее: (X < A) И (X <= B) → max = min(A,B) - 1
    () => {
      const A = randInt(-10, 20);
      const B = A + randInt(3, 15);
      const maxX = Math.min(A, B) - 1;
      return {
        instruction: `Напишите наибольшее целое число x:\n\n(X < ${A}) И (X <= ${B})`,
        correct: String(maxX),
        explain: `X < ${A} и X ≤ ${B} ⇒ X < ${Math.min(A, B)}. Наибольшее целое — ${maxX}.`
      };
    }
  ];

  const orderIdx = shuffle([...Array(xTemplates.length).keys()]);
  for (let i = 0; i < 5; i++) {
    const t = xTemplates[orderIdx[i % xTemplates.length]]();
    tasks.push({
      type: 'input',
      instruction: t.instruction,
      correct: t.correct,
      explain: t.explain
    });
  }

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

  el.instruction.textContent = q.instruction;
  el.taskBody.innerHTML = '';
  setFeedback('', '');

  el.checkBtn.hidden = false;
  el.checkBtn.disabled = false;
  el.nextBtn.hidden = true;
  el.nextBtn.textContent = (state.qIndex === state.tasks.length - 1) ? 'Завершить ✓' : 'Далее →';

  updateProgress(false);

  if (q.type === 'choice')      renderChoice(q);
  else if (q.type === 'multi')  renderMulti(q);
  else if (q.type === 'input')  renderInput(q);
}

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

function renderInput(q) {
  const wrap = document.createElement('div');
  wrap.className = 'input-wrap';

  const input = document.createElement('input');
  input.type = 'text';
  input.inputMode = 'numeric';
  input.className = 'input-answer';
  input.placeholder = 'Введите число';
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

function markMulti(q) {
  el.taskBody.querySelectorAll('.palette .card').forEach(chip => {
    chip.disabled = true;
    chip.classList.remove('selected');
    if (q.correct.includes(chip.textContent)) chip.classList.add('ok');
    else if (state.selection.has(chip.textContent)) chip.classList.add('wrong');
  });
}

function markInput(q) {
  const input = state.selection;
  input.disabled = true;
  if (input.value.trim().replace(/\s/g, '') === q.correct) {
    input.classList.add('ok');
  } else {
    input.classList.add('wrong');
    input.value = q.correct;
  }
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
    correctText = q.correct.join('; ');
    markMulti(q);
  } else if (q.type === 'input') {
    if (!state.selection.value.trim()) { setFeedback('warn', 'Введите число.'); return; }
    isCorrect = state.selection.value.trim().replace(/\s/g, '') === q.correct;
    correctText = q.correct;
    markInput(q);
  }

  state.answered = true;
  if (isCorrect) state.correct++;

  el.checkBtn.hidden = true;
  el.nextBtn.hidden = false;
  updateProgress(true);

  if (isCorrect) {
    setFeedback('success', '✅ Правильно! ' + (q.explain || ''));
  } else {
    setFeedback('error', `❌ Неправильно. Правильный ответ: ${correctText}. ` + (q.explain || ''));
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