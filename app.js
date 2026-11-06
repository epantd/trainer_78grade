/* =========================================================
   ГЛАВНОЕ МЕНЮ ТРЕНАЖЁРОВ
   Чтобы добавить новую тему — допишите объект в topics
   нужного класса (path — путь к папке с index.html).
   ========================================================= */

const GRADES = [
  {
    id: 7,
    title: '7 класс',
    topics: [
      {
        quarter: 'II четверть',
        title: 'Устройства компьютера',
        desc: 'Ввод и вывод информации, оперативная и долговременная память, внутренние и внешние устройства, порты.',
        emoji: '🖥️',
        path: '7grade/second/devices/index.html'
      },
      {
        quarter: 'II четверть',
        title: 'Файловая система',
        desc: 'Папки, файлы, полные пути, переходы вверх и вниз по дереву каталогов, задачи с перемещением и удалением.',
        emoji: '📁',
        path: '7grade/second/file_system/index.html'
      }

      /* Примеры на будущее:
      {
        quarter: 'III четверть',
        title: 'Файлы и папки',
        desc: 'Файловая система, типы файлов.',
        emoji: '📁',
        path: '7grade/third/files/index.html'
      },
      {
        quarter: 'IV четверть',
        title: '...',
        desc: '...',
        emoji: '✨',
        path: '7grade/fourth/xxx/index.html',
        available: false          // тема ещё не готова
      }
      */
    ]
  },
  {
    id: 8,
    title: '8 класс',
    topics: [
      {
        quarter: 'II четверть',
        title: 'Таблицы истинности · часть 1',
        desc: 'Построение таблиц истинности для логических выражений.',
        emoji: '🧮',
        path: '8grade/second/truth_part1/index.html'
      }
    ]
  }
];

/* ---------------------- DOM ---------------------- */

const el = {
  appSubtitle:  document.getElementById('appSubtitle'),
  screenGrades: document.getElementById('screen-grades'),
  screenTopics: document.getElementById('screen-topics'),
  gradeList:    document.getElementById('gradeList'),
  topicList:    document.getElementById('topicList'),
  backBtn:      document.getElementById('backBtn')
};

/* ---------------------- УТИЛИТЫ ---------------------- */

function plural(n, one, few, many) {
  const n10 = n % 10, n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return n + ' ' + one;
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return n + ' ' + few;
  return n + ' ' + many;
}

/* ---------------------- ЭКРАН КЛАССОВ ---------------------- */

function renderGrades() {
  el.gradeList.innerHTML = '';

  GRADES.forEach((grade) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'grade-card';

    btn.innerHTML =
      '<span class="grade-num">' + grade.id + '</span>' +
      '<span class="grade-body">' +
        '<span class="grade-title">' + grade.title + '</span>' +
        '<span class="grade-sub">' + plural(grade.topics.length, 'тема', 'темы', 'тем') + '</span>' +
      '</span>';

    btn.addEventListener('click', () => openGrade(grade));
    el.gradeList.appendChild(btn);
  });
}

function showGrades() {
  el.screenGrades.hidden = false;
  el.screenTopics.hidden = true;
  el.appSubtitle.textContent = 'Выберите класс';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------------------- ЭКРАН ТЕМ ---------------------- */

function openGrade(grade) {
  el.screenGrades.hidden = true;
  el.screenTopics.hidden = false;
  el.appSubtitle.textContent = grade.title + ' · выберите тему';
  window.scrollTo({ top: 0, behavior: 'smooth' });

  el.topicList.innerHTML = '';

  /* группируем темы по четвертям, сохраняя порядок */
  const quarters = [];
  grade.topics.forEach((topic) => {
    let q = quarters.find((x) => x.name === topic.quarter);
    if (!q) { q = { name: topic.quarter, topics: [] }; quarters.push(q); }
    q.topics.push(topic);
  });

  quarters.forEach((q) => {
    const heading = document.createElement('h2');
    heading.className = 'quarter-title';
    heading.textContent = q.name;
    el.topicList.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'topics';

    q.topics.forEach((topic) => {
      const unavailable = topic.available === false;

      const card = document.createElement('a');
      card.className = 'topic-card' + (unavailable ? ' disabled' : '');
      if (unavailable) {
        card.setAttribute('aria-disabled', 'true');
      } else {
        card.href = topic.path;
      }

      card.innerHTML =
        '<span class="topic-emoji">' + topic.emoji + '</span>' +
        '<h3>' + topic.title + '</h3>' +
        '<p>' + topic.desc + '</p>' +
        '<span class="topic-open">' + (unavailable ? 'Скоро' : 'Открыть →') + '</span>';

      grid.appendChild(card);
    });

    el.topicList.appendChild(grid);
  });
}

/* ---------------------- СОБЫТИЯ ---------------------- */

el.backBtn.addEventListener('click', showGrades);

/* ---------------------- СТАРТ ---------------------- */

renderGrades();
showGrades();
