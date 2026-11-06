/* =========================================================
   ТРЕНАЖЁР: Сети TCP/IP (45 заданий)
   ========================================================= */

const QUESTIONS = [
  /* =====================================================
     БЛОК 1: ОСНОВЫ IP-АДРЕСАЦИИ
     ===================================================== */
  {
    type: 'choice',
    instruction: 'Из скольких байт (октетов) состоит стандартный IPv4-адрес?',
    options: ['Из 2', 'Из 4', 'Из 6', 'Из 8'],
    correct: 'Из 4',
    explain: 'IPv4-адрес состоит из 4 чисел (октетов), каждое занимает 8 бит. Итого 32 бита.'
  },
  {
    type: 'choice',
    instruction: 'Какое максимальное число можно записать в одном октете IP-адреса?',
    options: ['100', '128', '255', '256'],
    correct: '255',
    explain: 'Один октет — это 8 бит. Максимальное двоичное число 11111111 в десятичной системе равно 255.'
  },
  {
    type: 'choice',
    instruction: 'Какой из этих IP-адресов записан НЕКОРРЕКТНО?',
    options: ['192.168.1.1', '10.0.0.255', '280.240.29.3', '127.0.0.1'],
    correct: '280.240.29.3',
    explain: 'Число 280 больше максимально допустимого значения для октета (255).'
  },
  {
    type: 'choice',
    instruction: 'Что определяют единицы (1) в двоичной записи маски подсети?',
    options: ['Адрес узла (компьютера)', 'Адрес сети', 'Номер порта', 'Широковещательный адрес'],
    correct: 'Адрес сети',
    explain: 'Старшие биты маски, равные 1, отводятся под адрес сети. Нули (0) — под адрес компьютера в этой сети.'
  },
  {
    type: 'choice',
    instruction: 'Какая из перечисленных масок является корректной?',
    options: ['255.255.0.255', '255.0.255.0', '255.255.240.0', '255.240.255.0'],
    correct: '255.255.240.0',
    explain: 'В корректной маске сначала всегда идут единицы, а затем нули. Запись 255.255.0.255 нарушает это правило.'
  },

  /* =====================================================
     БЛОК 2: ДВОИЧНАЯ СИСТЕМА И МАСКИ
     ===================================================== */
  {
    type: 'input',
    instruction: 'Переведите десятичное число 192 в двоичную систему счисления (введите только нули и единицы).',
    correct: '11000000',
    explain: '192 = 128 + 64 = 11000000 в двоичной системе.'
  },
  {
    type: 'input',
    instruction: 'Переведите десятичное число 224 в двоичную систему счисления.',
    correct: '11100000',
    explain: '224 = 128 + 64 + 32 = 11100000.'
  },
  {
    type: 'input',
    instruction: 'Переведите десятичное число 240 в двоичную систему счисления.',
    correct: '11110000',
    explain: '240 = 128 + 64 + 32 + 16 = 11110000.'
  },
  {
    type: 'input',
    instruction: 'Переведите десятичное число 248 в двоичную систему счисления.',
    correct: '11111000',
    explain: '248 = 128 + 64 + 32 + 16 + 8 = 11111000.'
  },
  {
    type: 'choice',
    instruction: 'Маска 255.255.255.240. Сколько нулей в её двоичной записи?',
    options: ['4', '8', '12', '16'],
    correct: '4',
    explain: '240 = 11110000. В последнем октете 4 нуля и 4 единицы. Всего в маске 4 нуля.'
  },
  {
    type: 'input',
    instruction: 'Сколько единиц в двоичной записи маски 255.255.240.0?',
    correct: '20',
    explain: '255 (8 единиц) + 255 (8 единиц) + 240 (4 единицы) = 20 единиц.'
  },
  {
    type: 'choice',
    instruction: 'Маска записана как /27. Как она выглядит в десятичном виде?',
    options: ['255.255.255.192', '255.255.255.224', '255.255.255.240', '255.255.255.248'],
    correct: '255.255.255.224',
    explain: '/27 означает 27 единиц. Первые три октета (24 единицы) = 255.255.255. Остаётся 3 единицы: 11100000 = 224.'
  },

  /* =====================================================
     БЛОК 3: АДРЕС СЕТИ И УЗЛА
     ===================================================== */
  {
    type: 'input',
    instruction: 'Найдите адрес сети для IP 192.168.1.15 с маской 255.255.255.0.',
    hint: 'Примените операцию побитового И (умножения) к IP и маске. Там, где в маске нули, в адресе сети тоже будут нули.',
    correct: '192.168.1.0',
    explain: 'Последний октет IP — 15 (00001111). Маска — 0 (00000000). 15 И 0 = 0. Адрес сети: 192.168.1.0.'
  },
  {
    type: 'input',
    instruction: 'Найдите адрес сети для IP 10.5.12.3 с маской 255.0.0.0.',
    correct: '10.0.0.0',
    explain: 'Нули в маске обнуляют всё, начиная со второго октета. Адрес сети: 10.0.0.0.'
  },
  {
    type: 'input',
    instruction: 'Найдите адрес сети для IP 172.16.20.50 с маской 255.255.240.0.',
    hint: 'Переведите 20 и 240 в двоичную систему и примените И.',
    correct: '172.16.16.0',
    explain: '20 = 00010100. 240 = 11110000. Побитовое И = 00010000 = 16. Адрес сети: 172.16.16.0.'
  },
  {
    type: 'input',
    instruction: 'Найдите адрес сети для IP 192.168.1.200 с маской 255.255.255.192.',
    correct: '192.168.1.192',
    explain: '200 = 11001000. 192 = 11000000. Побитовое И = 11000000 = 192. Адрес сети: 192.168.1.192.'
  },
  {
    type: 'input',
    instruction: 'Дан IP-адрес 206.158.124.67 и маска 255.255.224.0. Чему равен номер компьютера в сети (адрес узла)?',
    hint: 'Номер компьютера — это та часть IP, которая соответствует нулям в маске. Проще всего перевести последний октет в двоичную и посмотреть на младшие биты.',
    correct: '3',
    explain: 'Маска 224 = 11100000. На номер узла отводятся последние 5 бит (они равны 0 в маске). 67 = 01000011. Берём последние 5 бит: 00011 = 3.'
  },
  {
    type: 'input',
    instruction: 'Дан IP-адрес 10.1.2.100 и маска 255.255.255.192. Чему равен номер компьютера в сети?',
    correct: '36',
    explain: '192 = 11000000. На узел отводятся 6 младших бит. 100 = 01100100. Берём последние 6 бит: 100100 = 36.'
  },

  /* =====================================================
     БЛОК 4: КОЛИЧЕСТВО КОМПЬЮТЕРОВ В СЕТИ
     ===================================================== */
  {
    type: 'choice',
    instruction: 'Сколько ВСЕГО IP-адресов (включая адрес сети и широковещательный) содержит сеть с маской 255.255.255.0?',
    options: ['254', '255', '256', '512'],
    correct: '256',
    explain: 'Последний октет маски равен 0. Количество нулей = 8. Возводим 2 в 8-ю степень = 256 адресов.'
  },
  {
    type: 'choice',
    instruction: 'Сколько КОМПЬЮТЕРОВ (узлов) можно подключить к сети с маской 255.255.255.0?',
    options: ['254', '255', '256', '128'],
    correct: '254',
    explain: 'Всего адресов 256. Один забирает адрес сети (все нули), ещё один — широковещательный (все единицы). 256 - 2 = 254.'
  },
  {
    type: 'input',
    instruction: 'Сколько всего IP-адресов (включая зарезервированные) в сети с маской 255.255.240.0?',
    correct: '4096',
    explain: 'Маска 240.0 — это 4 нуля в третьем октете и 8 нулей в четвёртом. Всего 12 нулей. 2^12 = 4096.'
  },
  {
    type: 'input',
    instruction: 'Сколько всего IP-адресов (включая зарезервированные) в сети с маской 255.255.224.0?',
    correct: '8192',
    explain: 'Маска 224.0 — это 5 нулей в третьем октете и 8 нулей в четвёртом. Всего 13 нулей. 2^13 = 8192.'
  },
  {
    type: 'input',
    instruction: 'Сколько КОМПЬЮТЕРОВ можно подключить к сети с маской 255.255.224.0?',
    correct: '8190',
    explain: 'Маска 224.0 = 5 нулей + 8 нулей = 13 нулей. 2^13 = 8192. Вычитаем адрес сети и broadcast: 8192 - 2 = 8190.'
  },
  {
    type: 'input',
    instruction: 'Сколько КОМПЬЮТЕРОВ можно подключить к сети с маской 255.255.255.192?',
    correct: '62',
    explain: '192 = 11000000. 6 нулей. 2^6 = 64. 64 - 2 = 62.'
  },
  {
    type: 'input',
    instruction: 'Для некоторой подсети используется маска 255.255.255.224. Сколько различных адресов компьютеров теоретически допускает эта маска, если два адреса (адрес сети и широковещательный) не используют?',
    correct: '30',
    explain: '224 = 11100000. 5 нулей. 2^5 = 32. Вычитаем 2 зарезервированных: 32 - 2 = 30.'
  },

  /* =====================================================
     БЛОК 5: ЗАДАЧИ ИЗ ЕГЭ (ПО КАРТИНКАМ)
     ===================================================== */
  {
    type: 'input',
    instruction: 'Для узла с IP-адресом 111.81.27.224 адрес сети равен 111.81.27.192. Чему равен последний (самый правый) байт маски?',
    hint: 'Переведите последние октеты в двоичную систему: 224 и 192. Поймите, какая маска их объединяет.',
    correct: '224',
    explain: '224 = 11100000. 192 = 11000000. Чтобы из 224 получить 192, нужно применить маску 11100000 (224). Следовательно, последний байт маски — 224.'
  },
  {
    type: 'input',
    instruction: 'Узел с IP-адресом 121.96.174.205 принадлежит сети, в которой 10 IP-адресов, двоичная запись которых содержит ровно 12 единиц. Сколько единиц содержится в двоичной записи маски этой сети?',
    hint: '10 IP-адресов означает, что под номер узла отводится 4 бита (2^4 = 16, но часть зарезервирована, или просто 16 адресов в блоке). Если 4 бита на узлы, то сколько бит на сеть?',
    correct: '28',
    explain: 'Сеть содержит 16 адресов (ближайшая степень двойки больше 10). Значит, под номер узла отводят 4 бита (нули в маске). Всего в маске 32 бита. 32 - 4 = 28 единиц.'
  },
  {
    type: 'input',
    instruction: 'Сеть задана IP-адресом 192.168.32.160 и маской сети 255.255.255.240. Сколько в этой сети IP-адресов, для которых сумма единиц в двоичной записи IP-адреса чётна?',
    hint: 'Найдите количество адресов в сети (2^4 = 16). Переберите номера компьютеров от 0 до 15 и посчитайте количество единиц.',
    correct: '8',
    explain: 'В сети 16 адресов. Посчитаем сумму единиц в неизменной части: 192 (2) + 168 (4) + 32 (1) + 160 (2) = 9 (нечётная). Нам нужна чётная сумма, значит номер узла (последние 4 бита) должен содержать нечётное количество единиц. Среди чисел от 0 до 15 нечётное число единиц имеют ровно 8 чисел.'
  },
  {
    type: 'input',
    instruction: 'Сеть задана IP-адресом 122.159.136.144 и маской сети 255.255.255.248. Сколько в этой сети IP-адресов, для которых количество единиц в двоичной записи IP-адреса не кратно 4?',
    hint: 'Найдите сумму единиц в постоянной части адреса. Затем проверьте все возможные номера компьютеров.',
    correct: '7',
    explain: 'Маска 248 = 11111000. Под узел отводят 3 бита (8 адресов). Сумма единиц в постоянной части: 122 (6) + 159 (6) + 136 (2) + 144 (2) = 16. 16 кратно 4. Нам нужно, чтобы сумма не делилась на 4. Значит, количество единиц в номере узла не должно быть кратно 4. Единственное число от 0 до 7, дающее в сумме 16, — это 0 (000). Для него сумма 16 (кратно 4). Остальные 7 адресов дадут сумму 17, 17, 18, 17, 18, 18, 19 — ни одна не кратна 4.'
  },
  {
    type: 'input',
    instruction: 'В составе сети, которой принадлежит IP-адрес 147.222.199.75, есть узел, в IP-адресе которого первый байт совпадает с четвёртым, а второй — с третьим. Укажите наименьшее возможное количество принадлежащих этой сети IP-адресов, в двоичной записи которых ровно 14 единиц.',
    hint: 'Найдите максимальную маску, при которой адрес 147.222.222.147 (первый=четвёртый, второй=третий) попадает в ту же сеть. Затем посчитайте комбинации.',
    correct: '715',
    explain: 'Максимальная маска, объединяющая 147.222.199.75 и 147.222.222.147 — это 255.255.224.0 (/19). В такой сети 13 бит на узлы. Постоянная часть 147 (4) + 222 (6) = 10 единиц. Нам нужно ровно 14 единиц, значит в номере узла должно быть 4 единицы. Количество способов выбрать 4 бита из 13 = C(13,4) = 715.'
  },
  {
    type: 'choice',
    instruction: 'Восстановите IP-адрес из фрагментов: А = 24.12, Б = .96, В = 42., Г = .17. В ответе укажите последовательность букв.',
    options: ['АВГБ', 'АГВБ', 'АБВГ', 'АВБГ'],
    correct: 'АВГБ',
    explain: 'Собираем пазл: А(24.12) + В(42.) + Г(.17) + Б(.96) = 24.12.42.17.96. Обратите внимание: в задании фрагменты могут быть с точками в начале или в конце, нужно подобрать их так, чтобы получился корректный IP-адрес без лишних точек.'
  },
  {
    type: 'input',
    instruction: 'Для узла с IP-адресом 206.158.124.67 и маской 255.255.224.0 номер компьютера в сети равен...',
    correct: '3',
    explain: 'Маска 224 = 11100000. Это значит, что номер компьютера — это последние 5 бит IP-адреса. 67 = 64 + 3 = 01000011. Младшие 5 бит: 00011 = 3.'
  }
];

/* ---------------------- СОСТОЯНИЕ ---------------------- */

const state = {
  qIndex: 0,
  correct: 0,
  answered: false,
  selection: null
};

/* ---------------------- DOM ---------------------- */

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
  backBtn:      document.getElementById('backBtn'),
  
  // Новые элементы для справки
  helpBtn:      document.getElementById('helpBtn'),
  helpModal:    document.getElementById('helpModal'),
  closeHelpBtn: document.getElementById('closeHelpBtn')
};

/* ---------------------- УТИЛИТЫ ---------------------- */

function currentQuestion() { return QUESTIONS[state.qIndex]; }

function setFeedback(kind, text) {
  el.feedback.className = 'feedback' + (kind ? ' ' + kind : '');
  el.feedback.textContent = text || '';
}

/* ---------------------- ПРОГРЕСС ---------------------- */

function updateProgress(done) {
  const total = QUESTIONS.length;
  const doneCount = state.qIndex + (done ? 1 : 0);
  el.progressText.textContent = 'Задание ' + (state.qIndex + 1) + ' из ' + total;
  el.progressFill.style.width = Math.round((doneCount / total) * 100) + '%';
}

/* ---------------------- ОТРИСОВКА ВОПРОСА ---------------------- */

function renderQuestion() {
  const q = currentQuestion();
  state.answered = false;
  state.selection = null;

  el.instruction.textContent = q.instruction;
  el.taskBody.innerHTML = '';
  setFeedback('', '');

  el.checkBtn.hidden = false;
  el.checkBtn.disabled = false;
  el.nextBtn.hidden = true;
  el.nextBtn.textContent = (state.qIndex === QUESTIONS.length - 1)
    ? 'Завершить ✓'
    : 'Далее →';

  updateProgress(false);

  if (q.hint) {
    const hint = document.createElement('div');
    hint.className = 'formula-box';
    hint.innerHTML = '<b>Подсказка:</b> ' + q.hint;
    el.taskBody.appendChild(hint);
  }

  if (q.type === 'choice')      renderChoice(q);
  else if (q.type === 'multi')  renderMulti(q);
  else if (q.type === 'input')  renderInput(q);
}

/* --- тип 1: выбор одного варианта --- */
function renderChoice(q) {
  const wrap = document.createElement('div');
  wrap.className = 'options';
  q.options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      if (state.answered) return;
      state.selection = opt;
      Array.from(wrap.children).forEach((c) => c.classList.toggle('selected', c === btn));
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
  q.options.forEach((opt) => {
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

/* --- тип 3: текстовый ввод --- */
function renderInput(q) {
  const wrap = document.createElement('div');
  wrap.className = 'input-wrap';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'input-answer';
  input.placeholder = 'Введите ответ...';
  input.autocomplete = 'off';

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      checkAnswer();
    }
  });

  wrap.appendChild(input);
  el.taskBody.appendChild(wrap);
  state.selection = input;
}

/* ---------------------- ПРОВЕРКА ---------------------- */

function markChoice(q) {
  el.taskBody.querySelectorAll('.option').forEach((btn) => {
    btn.disabled = true;
    btn.classList.remove('selected');
    if (btn.textContent === q.correct) btn.classList.add('ok');
    else if (state.selection === btn.textContent) btn.classList.add('wrong');
  });
}

function markInput(q) {
  const input = state.selection;
  input.disabled = true;
  const userAns = input.value.trim().toLowerCase().replace(/\s/g, '');
  const correctAns = q.correct.toLowerCase().replace(/\s/g, '');
  if (userAns === correctAns) {
    input.classList.add('ok');
  } else {
    input.classList.add('wrong');
    input.value = q.correct; // Показываем правильный ответ
  }
}

function checkAnswer() {
  if (state.answered) return;
  const q = currentQuestion();
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
                q.correct.every((v) => state.selection.has(v));
    correctText = q.correct.join('; ');
    markMulti(q);

  } else if (q.type === 'input') {
    if (!state.selection.value.trim()) { setFeedback('warn', 'Введите ответ.'); return; }
    const userAns = state.selection.value.trim().toLowerCase().replace(/\s/g, '');
    const correctAns = q.correct.toLowerCase().replace(/\s/g, '');
    isCorrect = (userAns === correctAns);
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
    setFeedback('error', '❌ Неправильно. Правильный ответ: ' + correctText + '.' +
      (q.explain ? ' ' + q.explain : ''));
  }
}

/* ---------------------- ПЕРЕХОД ДАЛЬШЕ ---------------------- */

function nextQuestion() {
  if (!state.answered) return;
  if (state.qIndex + 1 >= QUESTIONS.length) { showResult(); return; }
  state.qIndex++;
  renderQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------------------- РЕЗУЛЬТАТ ---------------------- */

function showResult() {
  const total = QUESTIONS.length;
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
    'Правильно выполнено <strong>' + state.correct + ' из ' + total + '</strong> заданий (' + pct + '%).';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------------------- СПРАВКА (МОДАЛЬНОЕ ОКНО) ---------------------- */

function openHelp() {
  el.helpModal.hidden = false;
  document.body.style.overflow = 'hidden'; // Запрещаем прокрутку фона
}

function closeHelp() {
  el.helpModal.hidden = true;
  document.body.style.overflow = ''; // Возвращаем прокрутку
}

el.helpBtn.addEventListener('click', openHelp);
el.closeHelpBtn.addEventListener('click', closeHelp);

// Закрытие по клику на затемненный фон (вне окна)
el.helpModal.addEventListener('click', (e) => {
  if (e.target === el.helpModal) closeHelp();
});

// Закрытие по нажатию клавиши Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !el.helpModal.hidden) closeHelp();
});

/* ---------------------- СТАРТ / СОБЫТИЯ ---------------------- */

function startOver() {
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

renderQuestion();