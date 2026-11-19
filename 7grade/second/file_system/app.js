/* =========================================================
   ТРЕНАЖЁР: Файловая система (44 задания)
   18 статических + 15 навигационных + 11 на сборку пути
   ========================================================== */

/* ---------------------- КРИПТОСТОЙКИЙ RANDOM ---------------------- */

function cryptoRandomInt(max) {
  if (window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = cryptoRandomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleOptionsGuaranteed(options, correctValue) {
  let a = shuffle(options);
  if (a.length > 1 && a[0] === correctValue) {
    const j = 1 + cryptoRandomInt(a.length - 1);
    [a[0], a[j]] = [a[j], a[0]];
  }
  return a;
}

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[cryptoRandomInt(arr.length)]; }
function pickN(arr, n) { return shuffle(arr.slice()).slice(0, n); }

/* ---------------------- ПУЛЫ ДАННЫХ ---------------------- */

const FOLDER_NAMES = [
  'Документы', 'Музыка', 'Проекты', 'Работа', 'Учёба', 'Игры',
  'Фото', 'Видео', 'Загрузки', 'Архив', '2024', '2025',
  'Школа', 'ДЗ', 'Отчёты', 'Личное', 'Лето', 'Зима',
  'Хиты', 'Ретро', 'Фильмы', 'Семья'
];

const FILE_NAMES = [
  'ДЗ.txt', 'report.docx', 'song.mp3', 'photo.jpg', 'план.txt',
  'video.mp4', 'note.txt', 'presentation.pptx', 'data.xlsx',
  'конспект.txt', 'рисунок.png', 'запись.wav'
];

/* ---------------------- ГЕНЕРАТОР: «Где вы оказались?» ---------------------- */

function generateNavigationTask() {
  for (let attempt = 0; attempt < 100; attempt++) {
    // Стартовый путь: 1-3 уникальные папки
    const startDepth = randInt(1, 3);
    const usedFolders = new Set();
    const startFolders = [];
    for (let i = 0; i < startDepth; i++) {
      let f, tries = 0;
      do { f = pick(FOLDER_NAMES); tries++; } while (usedFolders.has(f) && tries < 50);
      usedFolders.add(f);
      startFolders.push(f);
    }

    const numMoves = randInt(2, 4);
    const path = [...startFolders];
    const moves = [];
    let valid = true;

    for (let i = 0; i < numMoves; i++) {
      const canDown = path.length < 4;
      const canUp = path.length > 0;
      if (!canDown && !canUp) { valid = false; break; }

      let doUp;
      if (!canDown) doUp = true;
      else if (!canUp) doUp = false;
      else doUp = Math.random() < 0.4;

      if (doUp) {
        path.pop();
        moves.push({ type: 'up' });
      } else {
        let folder, tries = 0;
        do { folder = pick(FOLDER_NAMES); tries++; } while (path.includes(folder) && tries < 50);
        path.push(folder);
        moves.push({ type: 'down', folder });
      }
    }

    if (!valid || path.length === 0) continue;

    const startPath = 'C:\\' + startFolders.join('\\');
    const correctPath = 'C:\\' + path.join('\\');

    let sentence = `Вы начали работу в папке ${startPath}. `;
    moves.forEach(m => {
      if (m.type === 'up') sentence += 'Затем поднялись на один уровень вверх. ';
      else sentence += `Затем спустились в папку «${m.folder}». `;
    });
    sentence += 'Где вы оказались?';

    // Дистракторы
    const dists = new Set();
    const addDist = (p) => { if (p !== correctPath) dists.add(p); };

    // d1: другой последний элемент
    if (path.length >= 1) {
      let alt, tries = 0;
      do { alt = pick(FOLDER_NAMES); tries++; } while (path.includes(alt) && tries < 50);
      addDist('C:\\' + [...path.slice(0, -1), alt].join('\\'));
    }
    // d2: родительская папка
    if (path.length >= 2) {
      addDist('C:\\' + path.slice(0, -1).join('\\'));
    }
    // d3: с ещё одной папкой в конце
    if (path.length < 4) {
      let extra, tries = 0;
      do { extra = pick(FOLDER_NAMES); tries++; } while (path.includes(extra) && tries < 50);
      addDist('C:\\' + [...path, extra].join('\\'));
    }
    // d4: стартовый путь
    addDist(startPath);
    // d5: корень
    addDist('C:\\');

    // Добить до 3 дистракторов
    while (dists.size < 3) {
      const len = randInt(1, 3);
      const parts = [];
      for (let i = 0; i < len; i++) {
        let f, tries = 0;
        do { f = pick(FOLDER_NAMES); tries++; } while (parts.includes(f) && tries < 50);
        parts.push(f);
      }
      addDist('C:\\' + parts.join('\\'));
    }

    const opts = [correctPath, ...Array.from(dists).slice(0, 3)];

    return {
      type: 'choice',
      instruction: sentence,
      options: opts,
      correct: correctPath,
      explain: `Итоговый путь: ${correctPath}`
    };
  }

  return {
    type: 'choice',
    instruction: 'Вы начали в C:\\Документы. Спустились в папку «Школа». Где вы оказались?',
    options: ['C:\\Документы\\Школа', 'C:\\Школа', 'C:\\', 'C:\\Документы'],
    correct: 'C:\\Документы\\Школа',
    explain: 'Итоговый путь: C:\\Документы\\Школа'
  };
}

/* ---------------------- ГЕНЕРАТОР: Сборка пути ---------------------- */

function generateBuildTask() {
  for (let attempt = 0; attempt < 50; attempt++) {
    const depth = randInt(2, 4);
    const usedFolders = new Set();
    const folders = [];
    for (let i = 0; i < depth; i++) {
      let f, tries = 0;
      do { f = pick(FOLDER_NAMES); tries++; } while (usedFolders.has(f) && tries < 50);
      usedFolders.add(f);
      folders.push(f);
    }
    const file = pick(FILE_NAMES);
    const target = ['C:', ...folders, file];

    // Описание
    let description = `Соберите полный путь к файлу ${file}. Файл лежит в папке «${folders[depth - 1]}»`;
    for (let i = depth - 2; i >= 0; i--) {
      description += `, которая вложена в папку «${folders[i]}»`;
    }
    description += ' на диске C.';

    // Неправильные карточки
    const wrongFolders = [];
    for (let i = 0; i < 2; i++) {
      let f, tries = 0;
      do { f = pick(FOLDER_NAMES); tries++; } while ((usedFolders.has(f) || wrongFolders.includes(f)) && tries < 50);
      wrongFolders.push(f);
    }
    const wrongFile = pick(FILE_NAMES.filter(f => f !== file));

    const chips = [...target, ...wrongFolders, wrongFile];

    return {
      type: 'build',
      instruction: description,
      hint: 'Нажимайте карточки снизу в нужном порядке. Чтобы убрать деталь из пути — нажмите на неё.',
      target,
      chips,
      explain: 'Полный путь: ' + target.join('\\')
    };
  }

  return {
    type: 'build',
    instruction: 'Соберите путь к файлу report.docx. Он в папке Отчёты, вложенной в Проекты на диске C.',
    hint: 'Нажимайте карточки снизу в нужном порядке.',
    target: ['C:', 'Проекты', 'Отчёты', 'report.docx'],
    chips: ['C:', 'Проекты', 'Отчёты', 'report.docx', 'Музыка', 'Фото', 'note.txt'],
    explain: 'Полный путь: C:\\Проекты\\Отчёты\\report.docx'
  };
}

/* ---------------------- СТАТИЧЕСКИЕ ЗАДАНИЯ (18) ---------------------- */

const STATIC_QUESTIONS = [
  /* 6 концептуальных */
  {
    type: 'choice',
    instruction: 'Что обозначает запись C:\\ ?',
    options: [
      'Корневой каталог (самая верхняя папка на диске C)',
      'Программу для работы с файлами',
      'Файл с именем C',
      'Папку с документами'
    ],
    correct: 'Корневой каталог (самая верхняя папка на диске C)',
    explain: 'C:\\ — корневой каталог, «основание шкафа» на системном диске C.'
  },
  {
    type: 'choice',
    instruction: 'Что такое папка (каталог)?',
    options: [
      'Контейнер для файлов и других папок',
      'Программа для обработки текста',
      'Файл для хранения картинок',
      'Устройство для печати'
    ],
    correct: 'Контейнер для файлов и других папок',
    explain: 'Папка — «полка», на которой могут лежать как файлы, так и другие папки.'
  },
  {
    type: 'choice',
    instruction: 'Что такое полный путь к файлу?',
    options: [
      'Адрес файла, начиная от корневого каталога до самого файла',
      'Только имя файла',
      'Размер файла в мегабайтах',
      'Расширение файла (например, .txt)'
    ],
    correct: 'Адрес файла, начиная от корневого каталога до самого файла',
    explain: 'Полный путь показывает, как добраться от корня C:\\ до нужного файла.'
  },
  {
    type: 'choice',
    instruction: 'Чем файл отличается от папки?',
    options: [
      'Файл содержит данные, а папка — контейнер для файлов и других папок',
      'Файл всегда меньше по размеру',
      'Файл может содержать другие файлы, а папка — нет',
      'Ничем не отличаются'
    ],
    correct: 'Файл содержит данные, а папка — контейнер для файлов и других папок',
    explain: 'В файле хранятся данные (текст, музыка, картинка), а папка нужна для организации и хранения.'
  },
  {
    type: 'choice',
    instruction: 'С чего начинается полный путь в Windows?',
    options: [
      'С буквы диска и двоеточия со слэшем, например C:\\',
      'С имени файла',
      'С косой черты /',
      'С точки .'
    ],
    correct: 'С буквы диска и двоеточия со слэшем, например C:\\',
    explain: 'Полный путь всегда начинается с корневого каталога, например C:\\'
  },
  {
    type: 'choice',
    instruction: 'Что значит «подняться на один уровень вверх»?',
    options: [
      'Перейти в родительскую папку (убрать последнюю папку из пути)',
      'Открыть файл на редактирование',
      'Удалить папку',
      'Создать новую папку внутри текущей'
    ],
    correct: 'Перейти в родительскую папку (убрать последнюю папку из пути)',
    explain: 'Подъём наверх = в пути убирается последняя папка.'
  },

  /* Сопоставления и точечные задачи */
  {
    type: 'match',
    instruction: 'Сопоставьте каждый путь и то, что он означает.',
    pairs: [
      { left: 'C:\\', right: 'Корневой каталог (самая верхняя папка)' },
      { left: 'C:\\учёба\\физика\\конспект.txt', right: 'Файл (документ)' },
      { left: 'C:\\учёба', right: 'Папка первого уровня' },
      { left: 'C:\\учёба\\физика', right: 'Папка, вложенная в «учёба»' }
    ],
    explain: 'C:\\ — корень; C:\\учёба — папка 1-го уровня; C:\\учёба\\физика — вложенная папка; а .txt — файл.'
  },
  {
    type: 'match',
    instruction: 'Текущая папка — C:\\учёба\\физика. Сопоставьте действие и результат.',
    pairs: [
      { left: 'Спуститься в папку ДЗ', right: 'C:\\учёба\\физика\\ДЗ' },
      { left: 'Подняться на один уровень вверх', right: 'C:\\учёба' },
      { left: 'Спуститься в папку Отчёты', right: 'C:\\учёба\\физика\\Отчёты' },
      { left: 'Подняться дважды вверх', right: 'C:\\' }
    ],
    explain: 'Спуск = добавить папку в конец пути. Подъём = убрать последнюю папку.'
  },
  {
    type: 'choice',
    instruction: 'Полный путь файла — C:\\Документы\\Работа\\план.txt. В какой папке лежит файл?',
    options: ['Работа', 'Документы', 'C:\\', 'план'],
    correct: 'Работа',
    explain: 'Файл лежит в последней папке перед ним — «Работа».'
  },
  {
    type: 'choice',
    instruction: 'Из папки C:\\Документы\\Работа файл отчёт.docx переместили в папку C:\\Документы\\Архив. Как теперь выглядит полный путь к файлу?',
    options: [
      'C:\\Документы\\Архив\\отчёт.docx',
      'C:\\Документы\\Работа\\отчёт.docx',
      'C:\\Архив\\отчёт.docx',
      'C:\\отчёт.docx'
    ],
    correct: 'C:\\Документы\\Архив\\отчёт.docx',
    explain: 'После перемещения файл находится в новой папке, а старая в пути уже не участвует.'
  },
  {
    type: 'multi',
    instruction: 'Выберите все ВЕРНЫЕ утверждения о файлах и папках.',
    options: [
      'В папке могут храниться и файлы, и другие папки',
      'Файл может содержать другие файлы',
      'Корневой каталог — это самый верхний уровень',
      'Полный путь начинается с буквы диска',
      'Папка не может быть вложена в другую папку'
    ],
    correct: [
      'В папке могут храниться и файлы, и другие папки',
      'Корневой каталог — это самый верхний уровень',
      'Полный путь начинается с буквы диска'
    ],
    explain: 'Файл не может содержать другие файлы, а папки могут быть вложены друг в друга.'
  },
  {
    type: 'choice',
    instruction: 'Файл photo.jpg лежит в папке Отпуск, которая вложена в папку Мои_фото на диске C. Какой путь правильный?',
    options: [
      'C:\\Мои_фото\\Отпуск\\photo.jpg',
      'C:\\Отпуск\\photo.jpg',
      'C:\\Мои_фото\\photo.jpg',
      'C:\\photo.jpg'
    ],
    correct: 'C:\\Мои_фото\\Отпуск\\photo.jpg',
    explain: 'Сначала корень, затем все вложенные папки по порядку, в конце — файл.'
  },
  {
    type: 'choice',
    instruction: 'Рассмотрите дерево каталогов. В какой папке лежит файл план.txt?',
    tree: String.raw`C:\
├── Документы\
│   ├── Школа\
│   │   └── ДЗ.txt
│   └── Работа\
│       └── план.txt
└── Музыка\
    └── song.mp3`,
    options: ['Работа', 'Школа', 'Документы', 'Музыка'],
    correct: 'Работа',
    explain: 'Файл план.txt находится прямо в папке «Работа».'
  },
  {
    type: 'choice',
    instruction: 'Рассмотрите дерево каталогов. Что произойдёт с файлом ДЗ.txt, если удалить папку Школа?',
    tree: String.raw`C:\
├── Документы\
│   ├── Школа\
│   │   └── ДЗ.txt
│   └── Работа\
│       └── план.txt
└── Музыка\
    └── song.mp3`,
    options: [
      'Файл ДЗ.txt удалится вместе с папкой Школа',
      'Файл ДЗ.txt останется и переместится в Документы',
      'Файл ДЗ.txt останется и переместится в корень',
      'Ничего не произойдёт, удалится только папка'
    ],
    correct: 'Файл ДЗ.txt удалится вместе с папкой Школа',
    explain: 'Удаление папки удаляет всё её содержимое — и файлы, и вложенные папки.'
  },
  {
    type: 'multi',
    instruction: 'Из папки C:\\Документы\\Школа файл дз.txt переместили в папку C:\\Документы\\Работа. Выберите все ВЕРНЫЕ утверждения.',
    options: [
      'В папке Школа файла дз.txt больше нет',
      'Файл теперь лежит в папке Работа',
      'Полный путь стал C:\\Документы\\Работа\\дз.txt',
      'В папке Школа появилась копия файла',
      'Удалился диск C:\\'
    ],
    correct: [
      'В папке Школа файла дз.txt больше нет',
      'Файл теперь лежит в папке Работа',
      'Полный путь стал C:\\Документы\\Работа\\дз.txt'
    ],
    explain: 'При перемещении файл исчезает из старой папки и появляется в новой. Копий не остаётся.'
  },
  {
    type: 'choice',
    instruction: 'В папке C:\\Музыка\\Хиты создали новую папку Новинки. Какой у неё полный путь?',
    options: ['C:\\Музыка\\Хиты\\Новинки', 'C:\\Новинки', 'C:\\Музыка\\Новинки', 'C:\\Музыка\\Хиты'],
    correct: 'C:\\Музыка\\Хиты\\Новинки',
    explain: 'Новая папка создаётся внутри текущей, поэтому её путь = путь текущей + имя новой.'
  },
  {
    type: 'match',
    instruction: 'Текущая папка — C:\\Музыка\\Хиты. Сопоставьте действие и результат.',
    pairs: [
      { left: 'Спуститься в папку Ретро', right: 'C:\\Музыка\\Хиты\\Ретро' },
      { left: 'Подняться на уровень вверх', right: 'C:\\Музыка' },
      { left: 'Подняться дважды вверх', right: 'C:\\' },
      { left: 'Создать папку Новинки', right: 'C:\\Музыка\\Хиты\\Новинки' }
    ],
    explain: 'Спуск добавляет папку в конец пути, подъём убирает последнюю папку, а создание добавляет новую внутрь текущей.'
  },
  {
    type: 'choice',
    instruction: 'Пользователь находится в папке C:\\Документы\\Школа\\7класс. Он поднялся на один уровень вверх, а затем спустился в папку 8класс. Где он оказался?',
    options: ['C:\\Документы\\Школа\\8класс', 'C:\\Документы\\8класс', 'C:\\Документы\\Школа\\7класс', 'C:\\8класс'],
    correct: 'C:\\Документы\\Школа\\8класс',
    explain: 'Подъём из 7класс → C:\\Документы\\Школа, спуск в 8класс → C:\\Документы\\Школа\\8класс.'
  }
];

/* ---------------------- СБОРКА ИТОГОВОГО СПИСКА (44 задания) ---------------------- */

const QUESTIONS = [
  ...STATIC_QUESTIONS.slice(0, 6),
  ...Array.from({ length: 15 }, () => generateNavigationTask()),
  ...Array.from({ length: 11 }, () => generateBuildTask()),
  ...STATIC_QUESTIONS.slice(6)
];

/* ---------------------- СОСТОЯНИЕ ---------------------- */

const state = {
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
  state.matchSel = {};

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

  if (q.tree) {
    const tree = document.createElement('pre');
    tree.className = 'tree-view';
    tree.textContent = q.tree;
    el.taskBody.appendChild(tree);
  }

  if (q.hint) {
    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.textContent = q.hint;
    el.taskBody.appendChild(hint);
  }

  if (q.type === 'choice')      renderChoice(q);
  else if (q.type === 'multi')  renderMulti(q);
  else if (q.type === 'build')  renderBuild(q);
  else if (q.type === 'match')  renderMatch(q);
}

/* --- тип 1: выбор одного варианта --- */
function renderChoice(q) {
  const wrap = document.createElement('div');
  wrap.className = 'options';
  const opts = shuffleOptionsGuaranteed(q.options, q.correct);
  opts.forEach((opt) => {
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
  const opts = shuffle(q.options);
  opts.forEach((opt) => {
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

/* --- тип 3: сборка пути --- */
function renderBuild(q) {
  state.selection = { built: [] };

  const builtWrap = document.createElement('div');
  builtWrap.className = 'path-built';
  el.taskBody.appendChild(builtWrap);

  const palette = document.createElement('div');
  palette.className = 'palette';
  el.taskBody.appendChild(palette);

  function refreshBuilt() {
    builtWrap.innerHTML = '';
    if (state.selection.built.length === 0) return;
    state.selection.built.forEach((item, i) => {
      if (i > 0) {
        const sep = document.createElement('span');
        sep.className = 'path-sep';
        sep.textContent = '\\';
        builtWrap.appendChild(sep);
      }
      const seg = document.createElement('button');
      seg.type = 'button';
      seg.className = 'card';
      seg.textContent = item;
      seg.addEventListener('click', () => {
        if (state.answered) return;
        state.selection.built.splice(i, 1);
        Array.from(palette.children).forEach((c) => {
          if (c.textContent === item) {
            c.disabled = false;
            c.classList.remove('used');
          }
        });
        refreshBuilt();
      });
      builtWrap.appendChild(seg);
    });
  }

  shuffle(q.chips).forEach((chipText) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'card';
    chip.textContent = chipText;
    chip.addEventListener('click', () => {
      if (state.answered) return;
      state.selection.built.push(chipText);
      chip.disabled = true;
      chip.classList.add('used');
      refreshBuilt();
    });
    palette.appendChild(chip);
  });

  refreshBuilt();
}

/* --- тип 4: сопоставление --- */
function renderMatch(q) {
  state.matchSel = {};
  const list = document.createElement('div');
  list.className = 'match-list';
  const rightOptions = shuffle(q.pairs.map((p) => p.right));
  const pairs = shuffle(q.pairs);

  if (pairs.length > 1 && rightOptions[0] === pairs[0].right) {
    const j = 1 + cryptoRandomInt(rightOptions.length - 1);
    [rightOptions[0], rightOptions[j]] = [rightOptions[j], rightOptions[0]];
  }

  pairs.forEach((pair) => {
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
    ph.textContent = '— выберите —';
    select.appendChild(ph);

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
  el.taskBody.querySelectorAll('.palette .card').forEach((chip) => {
    chip.disabled = true;
    chip.classList.remove('selected');
    if (q.correct.includes(chip.textContent)) chip.classList.add('ok');
    else if (state.selection.has(chip.textContent)) chip.classList.add('wrong');
  });
}

function markBuild(q) {
  el.taskBody.querySelectorAll('.path-built .card').forEach((seg, i) => {
    if (state.selection.built[i] === q.target[i]) seg.classList.add('ok');
    else seg.classList.add('wrong');
  });
  el.taskBody.querySelectorAll('.palette .card').forEach((c) => { c.disabled = true; });
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
    if (state.selection.size === 0) { setFeedback('warn', 'Выберите хотя бы один вариант.'); return; }
    isCorrect = state.selection.size === q.correct.length &&
                q.correct.every((v) => state.selection.has(v));
    correctText = q.correct.join('; ');
    markMulti(q);

  } else if (q.type === 'build') {
    if (state.selection.built.length === 0) { setFeedback('warn', 'Соберите путь из карточек.'); return; }
    isCorrect = state.selection.built.length === q.target.length &&
                state.selection.built.every((v, i) => v === q.target[i]);
    correctText = q.target.join('\\');
    markBuild(q);

  } else if (q.type === 'match') {
    const unfilled = q.pairs.some((p) => !state.matchSel[p.left]);
    if (unfilled) { setFeedback('warn', 'Сопоставьте все пункты.'); return; }
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

/* ---------------------- СТАРТ / СОБЫТИЯ ---------------------- */

function startOver() {
  // Перегенерировать задания при повторе
  const newQuestions = [
    ...STATIC_QUESTIONS.slice(0, 6),
    ...Array.from({ length: 15 }, () => generateNavigationTask()),
    ...Array.from({ length: 11 }, () => generateBuildTask()),
    ...STATIC_QUESTIONS.slice(6)
  ];
  QUESTIONS.length = 0;
  newQuestions.forEach(q => QUESTIONS.push(q));

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
