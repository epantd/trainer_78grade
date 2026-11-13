/* =========================================================
   ТРЕНАЖЁР: Файловая система (30 заданий)
   ========================================================== */

const QUESTIONS = [
  /* ---------- 1-6: ПОНЯТИЯ ---------- */
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

  /* ---------- 7-12: ПЕРЕХОДЫ ВВЕРХ / ВНИЗ ---------- */
  {
    type: 'choice',
    instruction: 'Из папки C:\\учёба\\математика спустились на один уровень вниз в папку ГИА. Где вы оказались?',
    options: [
      'C:\\учёба\\математика\\ГИА',
      'C:\\учёба\\ГИА',
      'C:\\ГИА',
      'C:\\учёба'
    ],
    correct: 'C:\\учёба\\математика\\ГИА',
    explain: 'Спуск вниз = добавить имя дочерней папки в конец пути.'
  },
  {
    type: 'choice',
    instruction: 'Из папки C:\\учёба\\математика\\ГИА поднялись на один уровень вверх. Где вы оказались?',
    options: [
      'C:\\учёба\\математика',
      'C:\\учёба',
      'C:\\',
      'C:\\учёба\\математика\\ГИА'
    ],
    correct: 'C:\\учёба\\математика',
    explain: 'Подъём наверх = убрать последнюю папку из пути.'
  },
  {
    type: 'choice',
    instruction: 'Из папки C:\\Музыка спустились в папку Хиты. Где вы оказались?',
    options: [
      'C:\\Музыка\\Хиты',
      'C:\\Хиты',
      'C:\\',
      'C:\\Музыка'
    ],
    correct: 'C:\\Музыка\\Хиты',
    explain: 'Спуск вниз добавляет имя папки в конец пути.'
  },
  {
    type: 'choice',
    instruction: 'Из папки C:\\Музыка\\Хиты\\Ретро поднялись на один уровень вверх. Где вы оказались?',
    options: [
      'C:\\Музыка\\Хиты',
      'C:\\Музыка',
      'C:\\Музыка\\Хиты\\Ретро',
      'C:\\'
    ],
    correct: 'C:\\Музыка\\Хиты',
    explain: 'Убрали последнюю папку «Ретро» — и оказались в родительской папке.'
  },
  {
    type: 'choice',
    instruction: 'Из папки C:\\Проекты\\2024\\Отчёты поднялись дважды на уровень вверх. Где вы оказались?',
    options: [
      'C:\\Проекты',
      'C:\\Проекты\\2024',
      'C:\\',
      'C:\\Проекты\\2024\\Отчёты'
    ],
    correct: 'C:\\Проекты',
    explain: 'Первый подъём → C:\\Проекты\\2024, второй → C:\\Проекты.'
  },
  {
    type: 'choice',
    instruction: 'Из папки C:\\Проекты спустились в папку 2024, затем — в папку Отчёты. Где вы оказались?',
    options: [
      'C:\\Проекты\\2024\\Отчёты',
      'C:\\Проекты\\Отчёты',
      'C:\\Проекты\\2024',
      'C:\\Отчёты'
    ],
    correct: 'C:\\Проекты\\2024\\Отчёты',
    explain: 'Каждый спуск добавляет имя папки в конец пути.'
  },

  /* ---------- 13-18: СБОРКА ПУТИ, СОПОСТАВЛЕНИЕ, ОПЕРАЦИИ ---------- */
  {
    type: 'build',
    instruction: 'Соберите полный путь к файлу ДЗ.txt. Файл лежит в папке Школа на диске C, а папка Школа вложена в папку Документы.',
    hint: 'Нажимайте на карточки снизу в нужном порядке. Чтобы убрать деталь из пути — нажмите на неё.',
    target: ['C:', 'Документы', 'Школа', 'ДЗ.txt'],
    chips: ['C:', 'Документы', 'Школа', 'ДЗ.txt', 'Музыка', 'Картинки'],
    explain: 'Полный путь: C:\\Документы\\Школа\\ДЗ.txt'
  },
  {
    type: 'build',
    instruction: 'Соберите полный путь к файлу song.mp3. Файл лежит в папке Рок, которая вложена в папку Музыка на диске C.',
    hint: 'Порядок карточек = порядок вложенности папок от корня до файла.',
    target: ['C:', 'Музыка', 'Рок', 'song.mp3'],
    chips: ['C:', 'Музыка', 'Рок', 'song.mp3', 'Документы', 'Видео'],
    explain: 'Полный путь: C:\\Музыка\\Рок\\song.mp3'
  },
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
    type: 'build',
    instruction: 'Соберите полный путь к файлу report.docx. Он лежит в папке Отчёты, которая вложена в 2024, а 2024 — в Проекты на диске C.',
    hint: 'Файл — последняя карточка в пути.',
    target: ['C:', 'Проекты', '2024', 'Отчёты', 'report.docx'],
    chips: ['C:', 'Проекты', '2024', 'Отчёты', 'report.docx', 'Музыка', 'Фото'],
    explain: 'Полный путь: C:\\Проекты\\2024\\Отчёты\\report.docx'
  },
  {
    type: 'choice',
    instruction: 'Полный путь файла — C:\\Документы\\Работа\\план.txt. В какой папке лежит файл?',
    options: ['Работа', 'Документы', 'C:\\', 'план'],
    correct: 'Работа',
    explain: 'Файл лежит в последней папке перед ним — «Работа».'
  },

  /* ---------- 19-24: МНОГОШАГОВЫЕ ЗАДАЧИ ---------- */
  {
    type: 'choice',
    instruction: 'Дима начал работу с каталога C:\\Музыка\\Хиты. Сначала спустился на один уровень вниз в каталог Ретро, затем поднялся на один уровень вверх, потом спустился в каталог Лучшие, после чего спустился в каталог Про_цветы и нашёл там файл Белые_розы.mp3. Запишите полный путь к этому файлу.',
    options: [
      'C:\\Белые_розы.mp3',
      'C:\\Музыка\\Хиты\\Ретро\\Про_цветы\\Белые_розы.mp3',
      'C:\\Музыка\\Хиты\\Лучшие\\Про_цветы\\Белые_розы.mp3',
      'C:\\Про_цветы\\Белые_розы.mp3'
    ],
    correct: 'C:\\Музыка\\Хиты\\Лучшие\\Про_цветы\\Белые_розы.mp3',
    explain: 'Старт C:\\Музыка\\Хиты → вниз в Ретро → вверх обратно в Хиты → вниз в Лучшие → вниз в Про_цветы.'
  },
  {
    type: 'choice',
    instruction: 'Маша работала в папке C:\\Документы\\Школа. Она поднялась на уровень вверх, затем спустилась в папку Фото, потом спустилась в папку Лето и нашла там файл beach.jpg. Запишите полный путь к файлу.',
    options: [
      'C:\\Документы\\Фото\\Лето\\beach.jpg',
      'C:\\Документы\\Школа\\Фото\\Лето\\beach.jpg',
      'C:\\Фото\\Лето\\beach.jpg',
      'C:\\Документы\\Лето\\beach.jpg'
    ],
    correct: 'C:\\Документы\\Фото\\Лето\\beach.jpg',
    explain: 'Старт C:\\Документы\\Школа → вверх в Документы → вниз в Фото → вниз в Лето.'
  },
  {
    type: 'choice',
    instruction: 'Петя начал работу в папке C:\\Игры. Он спустился в папку Стратегии, поднялся на один уровень вверх, затем спустился в папку Аркады. Где он оказался?',
    options: [
      'C:\\Игры\\Аркады',
      'C:\\Аркады',
      'C:\\Игры\\Стратегии\\Аркады',
      'C:\\Стратегии'
    ],
    correct: 'C:\\Игры\\Аркады',
    explain: 'Старт C:\\Игры → вниз в Стратегии (C:\\Игры\\Стратегии) → вверх (C:\\Игры) → вниз в Аркады.'
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

  /* ---------- 25-30: РАБОТА С ДЕРЕВОМ КАТАЛОГОВ ---------- */
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
    options: [
      'C:\\Музыка\\Хиты\\Новинки',
      'C:\\Новинки',
      'C:\\Музыка\\Новинки',
      'C:\\Музыка\\Хиты'
    ],
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
    options: [
      'C:\\Документы\\Школа\\8класс',
      'C:\\Документы\\8класс',
      'C:\\Документы\\Школа\\7класс',
      'C:\\8класс'
    ],
    correct: 'C:\\Документы\\Школа\\8класс',
    explain: 'Подъём из 7класс → C:\\Документы\\Школа, спуск в 8класс → C:\\Документы\\Школа\\8класс.'
  }
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

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

/* --- тип 1: выбор одного варианта (с перемешиванием) --- */
function renderChoice(q) {
  const wrap = document.createElement('div');
  wrap.className = 'options';
  const shuffledOptions = shuffle(q.options);   // <-- перемешиваем
  shuffledOptions.forEach((opt) => {
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

/* --- тип 2: множественный выбор (с перемешиванием) --- */
function renderMulti(q) {
  state.selection = new Set();
  const palette = document.createElement('div');
  palette.className = 'palette';
  const shuffledOptions = shuffle(q.options);   // <-- перемешиваем
  shuffledOptions.forEach((opt) => {
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

/* --- тип 4: сопоставление (с перемешиванием строк) --- */
function renderMatch(q) {
  state.matchSel = {};
  const list = document.createElement('div');
  list.className = 'match-list';
  const rightOptions = shuffle(q.pairs.map((p) => p.right));
  const shuffledPairs = shuffle(q.pairs);   // <-- перемешиваем строки

  shuffledPairs.forEach((pair) => {
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
