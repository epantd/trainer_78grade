/* =========================================================
   ТРЕНАЖЁР: Аппаратное обеспечение компьютера
   ========================================================= */

/* ---------------------- ДАННЫЕ ---------------------- */

const TOPICS = [
  /* ---------- ТЕМА 1 ---------- */
  {
    id: 'io',
    emoji: '⌨️',
    title: 'Устройства по виду работы',
    desc: 'Ввод и вывод информации: куда «течёт» информация — в компьютер или из него.',
    questions: [
      { type: 'choice',
        instruction: 'Определите, что делает устройство: вводит информацию в компьютер или выводит её для пользователя.',
        badge: 'Клавиатура', options: ['Ввод', 'Вывод'], correct: 'Ввод',
        explain: 'Клавиатура передаёт в компьютер буквы, цифры и команды.' },

      { type: 'choice',
        instruction: 'Определите, что делает устройство: вводит информацию в компьютер или выводит её для пользователя.',
        badge: 'Монитор', options: ['Ввод', 'Вывод'], correct: 'Вывод',
        explain: 'Монитор показывает изображение пользователю — это вывод.' },

      { type: 'choice',
        instruction: 'Определите, что делает устройство: вводит информацию в компьютер или выводит её для пользователя.',
        badge: 'Микрофон', options: ['Ввод', 'Вывод'], correct: 'Ввод',
        explain: 'Микрофон передаёт звук в компьютер.' },

      { type: 'choice',
        instruction: 'Определите, что делает устройство: вводит информацию в компьютер или выводит её для пользователя.',
        badge: 'Принтер', options: ['Ввод', 'Вывод'], correct: 'Вывод',
        explain: 'Принтер печатает результат работы компьютера на бумаге.' },

      { type: 'choice',
        instruction: 'Определите, что делает устройство: вводит информацию в компьютер или выводит её для пользователя.',
        badge: 'Сканер', options: ['Ввод', 'Вывод'], correct: 'Ввод',
        explain: 'Сканер «фотографирует» бумажный документ и загружает его в компьютер.' },

      { type: 'choice',
        instruction: 'Определите, что делает устройство: вводит информацию в компьютер или выводит её для пользователя.',
        badge: 'Наушники', options: ['Ввод', 'Вывод'], correct: 'Вывод',
        explain: 'Наушники воспроизводят звук, который выдаёт компьютер.' },

      { type: 'multi',
        instruction: 'Выберите все устройства ВВОДА информации.',
        options: ['Клавиатура', 'Мышь', 'Монитор', 'Сканер', 'Принтер', 'Микрофон'],
        correct: ['Клавиатура', 'Мышь', 'Сканер', 'Микрофон'],
        explain: 'Монитор и принтер — устройства вывода.' },

      { type: 'multi',
        instruction: 'Выберите все устройства ВЫВОДА информации.',
        options: ['Колонки', 'Наушники', 'Веб-камера', 'Принтер', 'Тачпад', 'Плоттер'],
        correct: ['Колонки', 'Наушники', 'Принтер', 'Плоттер'],
        explain: 'Веб-камера и тачпад — устройства ввода.' },

      { type: 'multi',
        instruction: 'Выберите все устройства ВВОДА информации.',
        options: ['Веб-камера', 'Тачпад', 'Микрофон', 'Монитор', 'Плоттер', 'Колонки'],
        correct: ['Веб-камера', 'Тачпад', 'Микрофон'],
        explain: 'Монитор, плоттер и колонки — устройства вывода.' },

      { type: 'multi',
        instruction: 'Выберите все устройства ВЫВОДА информации.',
        options: ['Монитор', 'Принтер', 'Сканер', 'Клавиатура', 'Наушники', 'Мышь'],
        correct: ['Монитор', 'Принтер', 'Наушники'],
        explain: 'Сканер, клавиатура и мышь — устройства ввода.' },

      { type: 'multi',
        instruction: 'Выберите все устройства ВВОДА информации.',
        options: ['Клавиатура', 'Сканер', 'Веб-камера', 'Колонки', 'Принтер', 'Монитор'],
        correct: ['Клавиатура', 'Сканер', 'Веб-камера'],
        explain: 'Колонки, принтер и монитор — устройства вывода.' },

      { type: 'multi',
        instruction: 'Выберите все устройства ВЫВОДА информации.',
        options: ['Плоттер', 'Колонки', 'Микрофон', 'Мышь', 'Монитор', 'Сканер'],
        correct: ['Плоттер', 'Колонки', 'Монитор'],
        explain: 'Микрофон, мышь и сканер — устройства ввода.' }
    ]
  },

  /* ---------- ТЕМА 2 ---------- */
  {
    id: 'storage',
    emoji: '💾',
    title: 'Устройства хранения информации',
    desc: 'Оперативная (временная) и долговременная (постоянная) память.',
    questions: [
      { type: 'choice',
        instruction: 'Определите тип памяти: оперативная (временная) или долговременная (постоянная).',
        badge: 'Оперативная память (RAM)', options: ['Оперативная', 'Долговременная'], correct: 'Оперативная',
        explain: 'RAM очень быстрая, но при выключении компьютера полностью очищается.' },

      { type: 'choice',
        instruction: 'Определите тип памяти: оперативная (временная) или долговременная (постоянная).',
        badge: 'Жёсткий диск (HDD)', options: ['Оперативная', 'Долговременная'], correct: 'Долговременная',
        explain: 'HDD хранит файлы даже после выключения компьютера.' },

      { type: 'choice',
        instruction: 'Определите тип памяти: оперативная (временная) или долговременная (постоянная).',
        badge: 'SSD-накопитель', options: ['Оперативная', 'Долговременная'], correct: 'Долговременная',
        explain: 'SSD — современный быстрый «жёсткий диск» для постоянного хранения.' },

      { type: 'choice',
        instruction: 'Определите тип памяти: оперативная (временная) или долговременная (постоянная).',
        badge: 'DDR (стандарт памяти)', options: ['Оперативная', 'Долговременная'], correct: 'Оперативная',
        explain: 'DDR — стандарт модулей оперативной памяти.' },

      { type: 'choice',
        instruction: 'Определите тип памяти: оперативная (временная) или долговременная (постоянная).',
        badge: 'USB-флешка', options: ['Оперативная', 'Долговременная'], correct: 'Долговременная',
        explain: 'Флешка — переносное постоянное хранилище.' },

      { type: 'choice',
        instruction: 'Определите тип памяти: оперативная (временная) или долговременная (постоянная).',
        badge: 'DIMM (модуль памяти)', options: ['Оперативная', 'Долговременная'], correct: 'Оперативная',
        explain: 'DIMM — это планка (модуль) оперативной памяти.' },

      { type: 'choice',
        instruction: 'Определите тип памяти: оперативная (временная) или долговременная (постоянная).',
        badge: 'SD-карта', options: ['Оперативная', 'Долговременная'], correct: 'Долговременная',
        explain: 'SD-карта хранит фото, музыку и файлы постоянно.' },

      { type: 'choice',
        instruction: 'Определите тип памяти: оперативная (временная) или долговременная (постоянная).',
        badge: 'DRAM (тип чипа памяти)', options: ['Оперативная', 'Долговременная'], correct: 'Оперативная',
        explain: 'DRAM — тип чипов, используемых в оперативной памяти.' },

      { type: 'multi',
        instruction: 'Выберите все устройства ХРАНЕНИЯ информации.',
        options: ['SSD', 'Клавиатура', 'SD-карта', 'Монитор', 'DVD-диск', 'Процессор'],
        correct: ['SSD', 'SD-карта', 'DVD-диск'],
        explain: 'Клавиатура — ввод, монитор — вывод, процессор — обработка.' },

      { type: 'multi',
        instruction: 'Выберите только ОПЕРАТИВНУЮ память.',
        options: ['DDR', 'HDD', 'DIMM', 'Blu-Ray', 'DRAM', 'MMC'],
        correct: ['DDR', 'DIMM', 'DRAM'],
        explain: 'HDD, Blu-Ray и MMC — долговременные носители.' },

      { type: 'multi',
        instruction: 'Выберите только ДОЛГОВРЕМЕННУЮ (постоянную) память.',
        options: ['SSD', 'RAM', 'CD', 'Оперативная память', 'USB-флешка', 'DDR'],
        correct: ['SSD', 'CD', 'USB-флешка'],
        explain: 'RAM, DDR и оперативная память — временная (быстрая) память.' },

      { type: 'multi',
        instruction: 'Выберите все устройства ХРАНЕНИЯ информации.',
        options: ['HDD', 'Наушники', 'MMC', 'Веб-камера', 'Blu-Ray', 'Принтер'],
        correct: ['HDD', 'MMC', 'Blu-Ray'],
        explain: 'Наушники и принтер — вывод, веб-камера — ввод.' },

      { type: 'multi',
        instruction: 'Выберите только ДОЛГОВРЕМЕННУЮ (постоянную) память.',
        options: ['SD-карта', 'DVD', 'DIMM', 'SSD', 'DRAM', 'HDD'],
        correct: ['SD-карта', 'DVD', 'SSD', 'HDD'],
        explain: 'DIMM и DRAM относятся к оперативной памяти.' }
    ]
  },

  /* ---------- ТЕМА 3 ---------- */
  {
    id: 'internal',
    emoji: '🔧',
    title: 'Внутренние и внешние устройства',
    desc: 'Что спрятано внутри системного блока, а что подключается снаружи.',
    questions: [
      { type: 'choice',
        instruction: 'Определите, где находится устройство: внутри системного блока или подключается снаружи.',
        badge: 'Процессор (CPU)', options: ['Внутреннее', 'Внешнее'], correct: 'Внутреннее',
        explain: 'Процессор — «мозг» компьютера, он установлен на материнской плате внутри корпуса.' },

      { type: 'choice',
        instruction: 'Определите, где находится устройство: внутри системного блока или подключается снаружи.',
        badge: 'Клавиатура', options: ['Внутреннее', 'Внешнее'], correct: 'Внешнее',
        explain: 'Клавиатура подключается к корпусу снаружи (USB или Bluetooth).' },

      { type: 'choice',
        instruction: 'Определите, где находится устройство: внутри системного блока или подключается снаружи.',
        badge: 'Оперативная память (RAM)', options: ['Внутреннее', 'Внешнее'], correct: 'Внутреннее',
        explain: 'Планки оперативной памяти вставляются в слоты материнской платы внутри корпуса.' },

      { type: 'choice',
        instruction: 'Определите, где находится устройство: внутри системного блока или подключается снаружи.',
        badge: 'Принтер', options: ['Внутреннее', 'Внешнее'], correct: 'Внешнее',
        explain: 'Принтер — периферийное устройство, подключается снаружи.' },

      { type: 'choice',
        instruction: 'Определите, где находится устройство: внутри системного блока или подключается снаружи.',
        badge: 'Материнская плата', options: ['Внутреннее', 'Внешнее'], correct: 'Внутреннее',
        explain: 'Материнская плата — «скелет» компьютера, к ней подключаются все внутренние устройства.' },

      { type: 'choice',
        instruction: 'Определите, где находится устройство: внутри системного блока или подключается снаружи.',
        badge: 'USB-флешка', options: ['Внутреннее', 'Внешнее'], correct: 'Внешнее',
        explain: 'Флешка вставляется в USB-порт снаружи корпуса.' },

      { type: 'choice',
        instruction: 'Определите, где находится устройство: внутри системного блока или подключается снаружи.',
        badge: 'Видеокарта (GPU)', options: ['Внутреннее', 'Внешнее'], correct: 'Внутреннее',
        explain: 'Видеокарта — плата внутри корпуса (или встроена в процессор).' },

      { type: 'choice',
        instruction: 'Определите, где находится устройство: внутри системного блока или подключается снаружи.',
        badge: 'Монитор', options: ['Внутреннее', 'Внешнее'], correct: 'Внешнее',
        explain: 'Монитор подключается снаружи через HDMI, VGA и другие порты.' },

      { type: 'multi',
        instruction: 'Выберите только ВНУТРЕННИЕ устройства.',
        options: ['Процессор', 'Монитор', 'Материнская плата', 'Мышь', 'Видеокарта', 'Принтер'],
        correct: ['Процессор', 'Материнская плата', 'Видеокарта'],
        explain: 'Монитор, мышь и принтер — внешние (периферийные) устройства.' },

      { type: 'multi',
        instruction: 'Выберите только ВНЕШНИЕ устройства.',
        options: ['Клавиатура', 'HDD', 'Сканер', 'RAM', 'Веб-камера', 'Видеокарта'],
        correct: ['Клавиатура', 'Сканер', 'Веб-камера'],
        explain: 'HDD, RAM и видеокарта находятся внутри корпуса.' },

      { type: 'multi',
        instruction: 'Выберите только ВНУТРЕННИЕ устройства.',
        options: ['Оперативная память', 'Флешка', 'Процессор', 'Колонки', 'SSD', 'Сканер'],
        correct: ['Оперативная память', 'Процессор', 'SSD'],
        explain: 'Флешка, колонки и сканер подключаются снаружи.' },

      { type: 'multi',
        instruction: 'Выберите только ВНЕШНИЕ устройства.',
        options: ['Монитор', 'Материнская плата', 'Наушники', 'HDD', 'Микрофон', 'Процессор'],
        correct: ['Монитор', 'Наушники', 'Микрофон'],
        explain: 'Материнская плата, HDD и процессор — внутри корпуса.' },

      { type: 'multi',
        instruction: 'Выберите только ВНУТРЕННИЕ устройства.',
        options: ['Видеокарта', 'Принтер', 'Материнская плата', 'Монитор', 'Жёсткий диск (HDD)', 'Мышь'],
        correct: ['Видеокарта', 'Материнская плата', 'Жёсткий диск (HDD)'],
        explain: 'Принтер, монитор и мышь — внешние устройства.' },

      { type: 'multi',
        instruction: 'Выберите только ВНЕШНИЕ устройства.',
        options: ['Тачпад', 'Процессор', 'Bluetooth-динамик', 'SSD', 'Сканер', 'RAM'],
        correct: ['Тачпад', 'Bluetooth-динамик', 'Сканер'],
        explain: 'Процессор, SSD и RAM находятся внутри корпуса.' }
    ]
  },

  /* ---------- ТЕМА 4 ---------- */
  {
    id: 'ports',
    emoji: '🔌',
    title: 'Порты компьютера',
    desc: 'Разъёмы на корпусе: что такое порт и для чего он нужен.',
    questions: [
      { type: 'choice',
        instruction: 'Определите: это порт (разъём) компьютера или нет?',
        badge: 'HDMI', options: ['Порт', 'Не порт'], correct: 'Порт',
        explain: 'HDMI — цифровой порт для передачи видео и звука.' },

      { type: 'choice',
        instruction: 'Определите: это порт (разъём) компьютера или нет?',
        badge: 'Клавиатура', options: ['Порт', 'Не порт'], correct: 'Не порт',
        explain: 'Клавиатура — устройство ввода, а не разъём.' },

      { type: 'choice',
        instruction: 'Определите: это порт (разъём) компьютера или нет?',
        badge: 'USB', options: ['Порт', 'Не порт'], correct: 'Порт',
        explain: 'USB — универсальный порт для флешек, мышей, клавиатур и других устройств.' },

      { type: 'choice',
        instruction: 'Определите: это порт (разъём) компьютера или нет?',
        badge: 'Процессор', options: ['Порт', 'Не порт'], correct: 'Не порт',
        explain: 'Процессор — внутреннее устройство обработки данных.' },

      { type: 'choice',
        instruction: 'Определите: это порт (разъём) компьютера или нет?',
        badge: 'VGA', options: ['Порт', 'Не порт'], correct: 'Порт',
        explain: 'VGA — старый аналоговый порт для подключения монитора (синий).' },

      { type: 'choice',
        instruction: 'Определите: это порт (разъём) компьютера или нет?',
        badge: 'Монитор', options: ['Порт', 'Не порт'], correct: 'Не порт',
        explain: 'Монитор — устройство вывода, он подключается К порту.' },

      { type: 'match',
        instruction: 'Сопоставьте каждый порт с его назначением.',
        pairs: [
          { left: 'PS/2',  right: 'Подключение клавиатуры или мыши' },
          { left: 'VGA',   right: 'Подключение старого аналогового монитора' },
          { left: 'HDMI',  right: 'Передача цифрового видео и звука' },
          { left: 'USB',   right: 'Универсальный порт для разных устройств' }
        ],
        explain: 'PS/2 — круглый старый разъём (фиолетовый — клавиатура, зелёный — мышь); VGA — синий аналоговый; HDMI — цифровой видео+звук; USB — универсальный.' },

      { type: 'multi',
        instruction: 'Выберите все ПОРТЫ компьютера.',
        options: ['HDMI', 'Клавиатура', 'USB', 'VGA', 'Принтер', 'PS/2'],
        correct: ['HDMI', 'USB', 'VGA', 'PS/2'],
        explain: 'Клавиатура и принтер — устройства, а не разъёмы.' },

      { type: 'multi',
        instruction: 'Выберите все ПОРТЫ компьютера.',
        options: ['Монитор', 'USB', 'VGA', 'Мышь', 'HDMI', 'Процессор'],
        correct: ['USB', 'VGA', 'HDMI'],
        explain: 'Монитор, мышь и процессор — устройства, а не порты.' },

      { type: 'multi',
        instruction: 'Выберите все ПОРТЫ компьютера.',
        options: ['PS/2', 'SSD', 'HDMI', 'Колонки', 'VGA', 'Клавиатура'],
        correct: ['PS/2', 'HDMI', 'VGA'],
        explain: 'SSD, колонки и клавиатура — устройства.' },

      { type: 'multi',
        instruction: 'Выберите все ПОРТЫ компьютера.',
        options: ['USB', 'Флешка', 'HDMI', 'Микрофон', 'VGA', 'PS/2'],
        correct: ['USB', 'HDMI', 'VGA', 'PS/2'],
        explain: 'Флешка и микрофон — устройства, они подключаются к портам.' }
    ]
  }
];

/* ---------------------- СОСТОЯНИЕ ---------------------- */

const state = {
  topicIndex: 0,
  qIndex: 0,
  correct: 0,
  answered: false,
  selection: null,   // строка (choice) или Set (multi)
  matchSel: {}       // { 'PS/2': '...' } для match
};

/* ---------------------- DOM ---------------------- */

const el = {
  appSubtitle:   document.getElementById('appSubtitle'),
  progressWrap:  document.getElementById('progressWrap'),
  progressText:  document.getElementById('progressText'),
  progressFill:  document.getElementById('progressFill'),
  screenTopics:  document.getElementById('screen-topics'),
  screenQuiz:    document.getElementById('screen-quiz'),
  screenResult:  document.getElementById('screen-result'),
  topicList:     document.getElementById('topicList'),
  taskTopic:     document.getElementById('taskTopic'),
  instruction:   document.getElementById('instruction'),
  taskBody:      document.getElementById('taskBody'),
  feedback:      document.getElementById('feedback'),
  checkBtn:      document.getElementById('checkBtn'),
  nextBtn:       document.getElementById('nextBtn'),
  backBtn:       document.getElementById('backBtn'),
  finishEmoji:   document.getElementById('finishEmoji'),
  finishTitle:   document.getElementById('finishTitle'),
  finishText:    document.getElementById('finishText'),
  retryBtn:      document.getElementById('retryBtn'),
  toTopicsBtn:   document.getElementById('toTopicsBtn')
};

/* ---------------------- УТИЛИТЫ ---------------------- */

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function currentTopic() { return TOPICS[state.topicIndex]; }
function currentQuestion() { return currentTopic().questions[state.qIndex]; }

function setFeedback(kind, text) {
  el.feedback.className = 'feedback' + (kind ? ' ' + kind : '');
  el.feedback.textContent = text || '';
}

/* ---------------------- ЭКРАН ТЕМ ---------------------- */

function renderTopics() {
  el.topicList.innerHTML = '';

  TOPICS.forEach((topic, index) => {
    const card = document.createElement('div');
    card.className = 'topic-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    card.innerHTML =
      '<div class="topic-emoji">' + topic.emoji + '</div>' +
      '<h3>' + (index + 1) + '. ' + topic.title + '</h3>' +
      '<p>' + topic.desc + '</p>' +
      '<span class="topic-count">' + topic.questions.length + ' заданий</span>';

    const start = () => startTopic(index);
    card.addEventListener('click', start);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start(); }
    });

    el.topicList.appendChild(card);
  });
}

function showTopics() {
  el.screenTopics.hidden = false;
  el.screenQuiz.hidden = true;
  el.screenResult.hidden = true;
  el.progressWrap.hidden = true;
  el.appSubtitle.textContent = 'Выберите тему тренировки';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------------------- СТАРТ ТЕМЫ ---------------------- */

function startTopic(index) {
  state.topicIndex = index;
  state.qIndex = 0;
  state.correct = 0;
  state.answered = false;

  el.appSubtitle.textContent = currentTopic().title;
  el.screenTopics.hidden = true;
  el.screenResult.hidden = true;
  el.screenQuiz.hidden = false;
  el.progressWrap.hidden = false;

  renderQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------------------- ПРОГРЕСС ---------------------- */

function updateProgress(done) {
  const total = currentTopic().questions.length;
  const doneCount = state.qIndex + (done ? 1 : 0);

  el.progressText.textContent = 'Задание ' + (state.qIndex + 1) + ' из ' + total;
  el.progressFill.style.width = Math.round((doneCount / total) * 100) + '%';
}

/* ---------------------- ОТРИСОВКА ВОПРОСА ---------------------- */

function renderQuestion() {
  const topic = currentTopic();
  const q = currentQuestion();

  state.answered = false;
  state.selection = null;
  state.matchSel = {};

  el.taskTopic.textContent = topic.title;
  el.instruction.textContent = q.instruction;
  el.taskBody.innerHTML = '';
  setFeedback('', '');

  el.checkBtn.hidden = false;
  el.checkBtn.disabled = false;
  el.nextBtn.hidden = true;
  el.nextBtn.textContent = (state.qIndex === topic.questions.length - 1)
    ? 'Завершить ✓'
    : 'Далее →';

  updateProgress(false);

  if (q.type === 'choice')      renderChoice(q);
  else if (q.type === 'multi')  renderMulti(q);
  else if (q.type === 'match')  renderMatch(q);
}

/* --- тип 1: выбор одного варианта --- */
function renderChoice(q) {
  const badge = document.createElement('div');
  badge.className = 'expr-badge';
  badge.textContent = q.badge;
  el.taskBody.appendChild(badge);

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
      Array.from(wrap.children).forEach((c) => {
        c.classList.toggle('selected', c === btn);
      });
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

/* --- тип 3: сопоставление --- */
function renderMatch(q) {
  const list = document.createElement('div');
  list.className = 'match-list';

  const rightOptions = shuffle(q.pairs.map((p) => p.right));

  q.pairs.forEach((pair) => {
    const row = document.createElement('div');
    row.className = 'match-row';

    const label = document.createElement('div');
    label.className = 'match-label';
    label.textContent = pair.left;

    const select = document.createElement('select');
    select.className = 'match-select';
    select.dataset.left = pair.left;

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '— выберите назначение —';
    select.appendChild(placeholder);

    rightOptions.forEach((r) => {
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
  el.taskBody.querySelectorAll('.option').forEach((btn) => {
    btn.disabled = true;
    btn.classList.remove('selected');
    if (btn.textContent === q.correct) btn.classList.add('ok');
    else if (state.selection === btn.textContent) btn.classList.add('wrong');
  });
}

function markMulti(q) {
  el.taskBody.querySelectorAll('.card').forEach((chip) => {
    chip.disabled = true;
    chip.classList.remove('selected');
    if (q.correct.includes(chip.textContent)) chip.classList.add('ok');
    else if (state.selection.has(chip.textContent)) chip.classList.add('wrong');
  });
}

function markMatch(q) {
  el.taskBody.querySelectorAll('.match-select').forEach((select) => {
    select.disabled = true;
    const pair = q.pairs.find((p) => p.left === select.dataset.left);
    if (pair && select.value === pair.right) select.classList.add('ok');
    else select.classList.add('wrong');
  });
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
    if (state.selection.size === 0) { setFeedback('warn', 'Выберите хотя бы одно устройство.'); return; }
    isCorrect = state.selection.size === q.correct.length &&
                q.correct.every((v) => state.selection.has(v));
    correctText = q.correct.join(', ');
    markMulti(q);

  } else if (q.type === 'match') {
    const notAnswered = q.pairs.some((p) => !state.matchSel[p.left]);
    if (notAnswered) { setFeedback('warn', 'Сопоставьте все порты с назначением.'); return; }
    isCorrect = q.pairs.every((p) => state.matchSel[p.left] === p.right);
    correctText = q.pairs.map((p) => p.left + ' → ' + p.right).join('; ');
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

/* ---------------------- ПЕРЕХОД ДАЛЬШЕ ---------------------- */

function nextQuestion() {
  if (!state.answered) return;

  const total = currentTopic().questions.length;

  if (state.qIndex + 1 >= total) {
    showResult();
    return;
  }

  state.qIndex++;
  renderQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------------------- РЕЗУЛЬТАТ ---------------------- */

function showResult() {
  const topic = currentTopic();
  const total = topic.questions.length;
  const pct = Math.round((state.correct / total) * 100);

  el.screenQuiz.hidden = true;
  el.screenTopics.hidden = true;
  el.screenResult.hidden = false;
  el.progressWrap.hidden = true;
  el.appSubtitle.textContent = 'Результат';

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
    'Модуль «' + topic.title + '»<br>' +
    'Правильно выполнено <strong>' + state.correct + ' из ' + total + '</strong> заданий (' + pct + '%).';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------------------- СОБЫТИЯ ---------------------- */

el.checkBtn.addEventListener('click', checkAnswer);
el.nextBtn.addEventListener('click', nextQuestion);

el.backBtn.addEventListener('click', showTopics);
el.toTopicsBtn.addEventListener('click', showTopics);

el.retryBtn.addEventListener('click', () => startTopic(state.topicIndex));

/* ---------------------- ИНИЦИАЛИЗАЦИЯ ---------------------- */

renderTopics();