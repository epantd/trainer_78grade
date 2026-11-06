/* =========================================================
   ТРЕНАЖЁР: Сети TCP/IP (Динамические числа, фиксированный порядок)
   ========================================================= */

function generateQuestions() {
  const questions = [];

  /* ---------------------- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---------------------- */

  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const octetFromPrefix = (p) => (0xFF << (8 - p)) & 0xFF;

  const maskFromPrefix = (prefix) => {
    let parts = [];
    let rem = prefix;
    for (let i = 0; i < 4; i++) {
      if (rem >= 8) { parts.push(255); rem -= 8; }
      else if (rem > 0) { parts.push(octetFromPrefix(rem)); rem = 0; }
      else { parts.push(0); }
    }
    return parts.join('.');
  };

  const networkAddress = (ip, mask) => {
    return ip.split('.').map((o, i) => Number(o) & Number(mask.split('.')[i])).join('.');
  };

  const nodeNumber = (ip, mask) => {
    const ipP = ip.split('.').map(Number);
    const maskP = mask.split('.').map(Number);
    let bin = '';
    for (let i = 0; i < 4; i++) {
      const o = ipP[i] & (~maskP[i] & 0xFF);
      bin += o.toString(2).padStart(8, '0');
    }
    return parseInt(bin, 2);
  };

  const countOnesInIp = (ip) => {
    return ip.split('.').map(o => Number(o).toString(2).split('1').length - 1).reduce((a, b) => a + b, 0);
  };

  const isMaskValid = (maskStr) => {
    const parts = maskStr.split('.').map(Number);
    let seenZero = false;
    for (let i = 0; i < 4; i++) {
      const o = parts[i];
      if (o === 255) {
        if (seenZero) return false;
      } else if (o === 0) {
        seenZero = true;
      } else {
        const binary = o.toString(2).padStart(8, '0');
        if (!/^1+0+$/.test(binary)) return false;
        if (seenZero) return false;
        seenZero = true;
      }
    }
    return true;
  };

  const isValidIp = (str) => {
    const parts = str.split('.');
    if (parts.length !== 4) return false;
    return parts.every(p => /^\d+$/.test(p) && parseInt(p) >= 0 && parseInt(p) <= 255);
  };

  /* =====================================================
     БЛОК 1: ОСНОВЫ IP-АДРЕСАЦИИ (5 вопросов)
     ===================================================== */
  questions.push({
    type: 'choice',
    instruction: 'Из скольких байт (октетов) состоит стандартный IPv4-адрес?',
    options: ['Из 2', 'Из 4', 'Из 6', 'Из 8'],
    correct: 'Из 4',
    explain: 'IPv4-адрес состоит из 4 чисел (октетов), каждое занимает 8 бит. Итого 32 бита.'
  });

  questions.push({
    type: 'choice',
    instruction: 'Какое максимальное число можно записать в одном октете IP-адреса?',
    options: ['100', '128', '255', '256'],
    correct: '255',
    explain: 'Один октет — это 8 бит. Максимальное двоичное число 11111111 в десятичной системе равно 255.'
  });

  // 3. Некорректный IP (рандом)
  {
    const ips = [];
    for (let i = 0; i < 3; i++) {
      ips.push([randInt(0, 255), randInt(0, 255), randInt(0, 255), randInt(0, 255)].join('.'));
    }
    const badOctet = randInt(256, 300);
    const badIpArr = [randInt(0, 255), randInt(0, 255), randInt(0, 255), randInt(0, 255)];
    badIpArr[randInt(0, 3)] = badOctet;
    const badIp = badIpArr.join('.');
    ips.push(badIp);
    shuffle(ips); // перемешиваем только варианты ответа внутри вопроса

    questions.push({
      type: 'choice',
      instruction: 'Какой из этих IP-адресов записан НЕКОРРЕКТНО?',
      options: ips,
      correct: badIp,
      explain: 'Число ' + badOctet + ' больше максимально допустимого значения для октета (255).'
    });
  }

  questions.push({
    type: 'choice',
    instruction: 'Что определяют единицы (1) в двоичной записи маски подсети?',
    options: ['Адрес узла (компьютера)', 'Адрес сети', 'Номер порта', 'Широковещательный адрес'],
    correct: 'Адрес сети',
    explain: 'Старшие биты маски, равные 1, отводятся под адрес сети. Нули (0) — под адрес компьютера в этой сети.'
  });

  // 5. Корректная маска (рандом)
  {
    const validMask = maskFromPrefix(randInt(8, 30));
    const invalidMasks = [];
    while (invalidMasks.length < 3) {
      const cand = [randInt(0,255), randInt(0,255), randInt(0,255), randInt(0,255)].join('.');
      if (!isMaskValid(cand) && cand !== validMask && !invalidMasks.includes(cand)) {
        invalidMasks.push(cand);
      }
    }
    const opts = shuffle([validMask, ...invalidMasks]);
    questions.push({
      type: 'choice',
      instruction: 'Какая из перечисленных масок является корректной?',
      options: opts,
      correct: validMask,
      explain: 'В корректной маске сначала всегда идут единицы, а затем нули. Запись ' + invalidMasks[0] + ' нарушает это правило.'
    });
  }

  /* =====================================================
     БЛОК 2: ДВОИЧНАЯ СИСТЕМА И МАСКИ (7 вопросов)
     ===================================================== */
  const maskOctets = [128, 192, 224, 240, 248, 252, 254, 255];
  for (let i = 0; i < 4; i++) {
    const val = maskOctets[randInt(0, maskOctets.length - 1)];
    const bin = val.toString(2).padStart(8, '0');
    questions.push({
      type: 'input',
      instruction: 'Переведите десятичное число ' + val + ' в двоичную систему счисления (введите только нули и единицы).',
      correct: bin,
      explain: val + ' = ' + bin + ' в двоичной системе.'
    });
  }

  // 5. Нули в маске (рандом)
  {
    const prefix = randInt(1, 7);
    const octet = octetFromPrefix(prefix);
    const zeros = 8 - prefix;
    questions.push({
      type: 'choice',
      instruction: 'Маска 255.255.255.' + octet + '. Сколько нулей в её двоичной записи?',
      options: [zeros.toString(), (zeros + 1).toString(), (zeros + 2).toString(), (zeros + 3).toString()],
      correct: zeros.toString(),
      explain: octet + ' = ' + octet.toString(2).padStart(8, '0') + '. В последнем октете ' + zeros + ' нулей и ' + prefix + ' единиц. Всего в маске ' + zeros + ' нулей.'
    });
  }

  // 6. Единицы в маске (рандом)
  {
    const prefix = randInt(1, 7);
    const octet = octetFromPrefix(prefix);
    const ones = 16 + prefix;
    questions.push({
      type: 'input',
      instruction: 'Сколько единиц в двоичной записи маски 255.255.' + octet + '.0?',
      correct: ones.toString(),
      explain: '255 (8 единиц) + 255 (8 единиц) + ' + octet + ' (' + prefix + ' единиц) = ' + ones + ' единиц.'
    });
  }

  // 7. Маска из префикса (рандом)
  {
    const prefix = randInt(24, 30);
    const mask = maskFromPrefix(prefix);
    const lastOctet = mask.split('.')[3];
    const options = shuffle([
      mask,
      maskFromPrefix(prefix - 1),
      maskFromPrefix(prefix + 1),
      maskFromPrefix(prefix - 2)
    ]);
    questions.push({
      type: 'choice',
      instruction: 'Маска записана как /' + prefix + '. Как она выглядит в десятичном виде?',
      options: options,
      correct: mask,
      explain: '/' + prefix + ' означает ' + prefix + ' единиц. Первые три октета (24 единицы) = 255.255.255. Остаётся ' + (prefix - 24) + ' единицы: ' + (lastOctet || '0') + ' = ' + lastOctet + '.'
    });
  }

  /* =====================================================
     БЛОК 3: АДРЕС СЕТИ И УЗЛА (8 вопросов)
     ===================================================== */
  // 1-4: Адрес сети (рандом)
  for (let i = 0; i < 4; i++) {
    const prefix = randInt(16, 28);
    const mask = maskFromPrefix(prefix);
    const ip = [randInt(1, 254), randInt(0, 255), randInt(0, 255), randInt(0, 255)].join('.');
    const net = networkAddress(ip, mask);
    questions.push({
      type: 'input',
      instruction: 'Найдите адрес сети для IP ' + ip + ' с маской ' + mask + '.',
      hint: 'Примените операцию побитового И к IP и маске. Там, где в маске нули, в адресе сети тоже будут нули.',
      correct: net,
      explain: 'IP ' + ip + ' и маска ' + mask + ' дают адрес сети ' + net + '.'
    });
  }

  // 5-8: Номер компьютера (рандом)
  for (let i = 0; i < 4; i++) {
    const prefix = randInt(26, 30);
    const mask = maskFromPrefix(prefix);
    const ip = [randInt(1, 254), randInt(0, 255), randInt(0, 255), randInt(0, 255)].join('.');
    const node = nodeNumber(ip, mask);
    questions.push({
      type: 'input',
      instruction: 'Дан IP-адрес ' + ip + ' и маска ' + mask + '. Чему равен номер компьютера в сети (адрес узла)?',
      hint: 'Номер компьютера — это та часть IP, которая соответствует нулям в маске.',
      correct: node.toString(),
      explain: 'Маска ' + mask + '. На номер узла отводятся последние ' + (32 - prefix) + ' бит. IP ' + ip + ' даёт номер компьютера ' + node + '.'
    });
  }

  /* =====================================================
     БЛОК 4: КОЛИЧЕСТВО КОМПЬЮТЕРОВ В СЕТИ (5 вопросов)
     ===================================================== */
  for (let i = 0; i < 5; i++) {
    const prefix = randInt(20, 28);
    const mask = maskFromPrefix(prefix);
    const zeros = 32 - prefix;
    const total = Math.pow(2, zeros);
    const computers = total - 2;

    if (i % 2 === 0) {
      questions.push({
        type: 'input',
        instruction: 'Сколько всего IP-адресов (включая зарезервированные) в сети с маской ' + mask + '?',
        correct: total.toString(),
        explain: 'Маска ' + mask + ' содержит ' + zeros + ' нулей. 2^' + zeros + ' = ' + total + '.'
      });
    } else {
      questions.push({
        type: 'input',
        instruction: 'Сколько КОМПЬЮТЕРОВ можно подключить к сети с маской ' + mask + '?',
        correct: computers.toString(),
        explain: 'Маска ' + mask + ' = ' + zeros + ' нулей. 2^' + zeros + ' = ' + total + '. Вычитаем адрес сети и broadcast: ' + total + ' - 2 = ' + computers + '.'
      });
    }
  }

  /* =====================================================
     БЛОК 5: ЗАДАЧИ ИЗ ЕГЭ (5 вопросов)
     ===================================================== */

  // 1. Последний байт маски (рандом)
  {
    const prefix = randInt(25, 30);
    const mask = maskFromPrefix(prefix);
    const ip = [randInt(1, 254), randInt(0, 255), randInt(0, 255), randInt(1, 254)].join('.');
    const net = networkAddress(ip, mask);
    const lastMask = mask.split('.')[3];
    questions.push({
      type: 'input',
      instruction: 'Для узла с IP-адресом ' + ip + ' адрес сети равен ' + net + '. Чему равен последний (самый правый) байт маски?',
      hint: 'Переведите последние октеты IP и сети в двоичную систему. Поймите, какая маска их объединяет.',
      correct: lastMask,
      explain: 'IP: ' + ip + ', сеть: ' + net + '. Последний байт маски — ' + lastMask + '.'
    });
  }

  // 2. Восстановление IP по фрагментам (рандом)
  {
    let ipStr, parts, partToLetter, correctSeq, validPerms;
    let attempts = 0;
    do {
      attempts++;
      ipStr = [randInt(1, 254), randInt(0, 255), randInt(0, 255), randInt(0, 255)].join('.');
      const cuts = [];
      while (cuts.length < 3) {
        const c = randInt(1, ipStr.length - 1);
        if (!cuts.includes(c)) cuts.push(c);
      }
      cuts.sort((a, b) => a - b);
      parts = [
        ipStr.slice(0, cuts[0]),
        ipStr.slice(cuts[0], cuts[1]),
        ipStr.slice(cuts[1], cuts[2]),
        ipStr.slice(cuts[2])
      ];
      partToLetter = shuffle(['А', 'Б', 'В', 'Г']);
      correctSeq = partToLetter.join('');

      const allPerms = [];
      function permute(arr, l = 0) {
        if (l === arr.length) { allPerms.push(arr.join('')); return; }
        for (let i = l; i < arr.length; i++) {
          [arr[l], arr[i]] = [arr[i], arr[l]];
          permute(arr, l + 1);
          [arr[l], arr[i]] = [arr[i], arr[l]];
        }
      }
      permute([...partToLetter]);
      const uniquePerms = [...new Set(allPerms)];

      validPerms = [];
      for (const perm of uniquePerms) {
        let reassembled = '';
        for (const char of perm) {
          const idx = partToLetter.indexOf(char);
          reassembled += parts[idx];
        }
        if (isValidIp(reassembled)) {
          validPerms.push({ perm, reassembled });
        }
      }
    } while (validPerms.length !== 1 && attempts < 50);

    if (validPerms.length === 1) {
      const correctPerm = validPerms[0].perm;
      const allPerms = [];
      function permute2(arr, l = 0) {
        if (l === arr.length) { allPerms.push(arr.join('')); return; }
        for (let i = l; i < arr.length; i++) {
          [arr[l], arr[i]] = [arr[i], arr[l]];
          permute2(arr, l + 1);
          [arr[l], arr[i]] = [arr[i], arr[l]];
        }
      }
      permute2([...partToLetter]);
      const uniquePerms = [...new Set(allPerms)];
      const incorrectPerms = uniquePerms.filter(p => p !== correctPerm);
      shuffle(incorrectPerms);
      const options = shuffle([correctPerm, incorrectPerms[0], incorrectPerms[1], incorrectPerms[2]]);

      const fragmentDisplay = partToLetter.map((letter, i) => letter + ' = ' + parts[i]).join(', ');

      questions.push({
        type: 'choice',
        instruction: 'Восстановите IP-адрес из фрагментов: ' + fragmentDisplay + '. В ответе укажите последовательность букв.',
        options: options,
        correct: correctPerm,
        explain: 'Собираем пазл: ' + partToLetter.map((letter, i) => letter + '(' + parts[i] + ')').join(' + ') + ' = ' + ipStr + '.'
      });
    }
  }

  // 3-5. Задачи на перебор адресов в подсети (рандом)
  function generateSubnetQuestion(conditionFunc, fallback) {
    let attempts = 0;
    while (attempts < 1000) {
      const prefix = randInt(26, 30); // от 4 до 64 адресов
      const mask = maskFromPrefix(prefix);
      const ip = [randInt(1, 254), randInt(0, 255), randInt(0, 255), randInt(0, 255)].join('.');
      const net = networkAddress(ip, mask);
      const zeros = 32 - prefix;
      const total = Math.pow(2, zeros);
      let count = 0;
      const netParts = net.split('.').map(Number);

      for (let i = 0; i < total; i++) {
        let curr = netParts.slice();
        curr[3] += i;
        while (curr[3] > 255) { curr[3] -= 256; curr[2]++; }
        const addrStr = curr.join('.');
        if (conditionFunc(addrStr, countOnesInIp(addrStr))) count++;
      }

      if (count > 0 && count < total) {
        return { ip, mask, net, count, total, prefix };
      }
      attempts++;
    }
    return fallback; // fallback на случай, если за 1000 попыток не удалось
  }

  // 3. Чётная сумма единиц
  {
    const fb = { ip: '192.168.1.10', mask: '255.255.255.240', net: '192.168.1.0', count: 8, total: 16, prefix: 28 };
    const q = generateSubnetQuestion((ipStr, ones) => ones % 2 === 0, fb);
    questions.push({
      type: 'input',
      instruction: 'Сеть задана IP-адресом ' + q.ip + ' и маской сети ' + q.mask + '. Сколько в этой сети IP-адресов, для которых сумма единиц в двоичной записи IP-адреса чётна?',
      hint: 'Всего адресов в сети: ' + q.total + '. Переберите все адреса и посчитайте единицы.',
      correct: q.count.toString(),
      explain: 'Сеть ' + q.net + '/' + q.prefix + ' содержит ' + q.total + ' адресов. Чётная сумма единиц у ' + q.count + ' адресов.'
    });
  }

  // 4. Не кратно 4
  {
    const fb = { ip: '122.159.136.144', mask: '255.255.255.248', net: '122.159.136.144', count: 7, total: 8, prefix: 29 };
    const q = generateSubnetQuestion((ipStr, ones) => ones % 4 !== 0, fb);
    questions.push({
      type: 'input',
      instruction: 'Сеть задана IP-адресом ' + q.ip + ' и маской сети ' + q.mask + '. Сколько в этой сети IP-адресов, для которых количество единиц в двоичной записи IP-адреса не кратно 4?',
      hint: 'Всего адресов в сети: ' + q.total + '. Переберите все адреса и посчитайте единицы.',
      correct: q.count.toString(),
      explain: 'Сеть ' + q.net + '/' + q.prefix + ' содержит ' + q.total + ' адресов. Не кратна 4 у ' + q.count + ' адресов.'
    });
  }

  // 5. Ровно K единиц
  {
    const targetK = randInt(10, 16);
    const fb = { ip: '10.0.0.0', mask: '255.255.255.240', net: '10.0.0.0', count: 1, total: 16, prefix: 28 };
    const q = generateSubnetQuestion((ipStr, ones) => ones === targetK, fb);
    questions.push({
      type: 'input',
      instruction: 'Сеть задана IP-адресом ' + q.ip + ' и маской сети ' + q.mask + '. Сколько в этой сети IP-адресов, двоичная запись которых содержит ровно ' + targetK + ' единиц?',
      hint: 'Всего адресов в сети: ' + q.total + '. Переберите все адреса и посчитайте единицы.',
      correct: q.count.toString(),
      explain: 'Сеть ' + q.net + '/' + q.prefix + ' содержит ' + q.total + ' адресов. Ровно ' + targetK + ' единиц у ' + q.count + ' адресов.'
    });
  }

  // ВАЖНО: Возвращаем массив без перемешивания!
  return questions;
}

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
  helpBtn:      document.getElementById('helpBtn'),
  helpModal:    document.getElementById('helpModal'),
  closeHelpBtn: document.getElementById('closeHelpBtn')
};

/* ---------------------- УТИЛИТЫ ---------------------- */

// Инициализируем вопросы (порядок фиксирован внутри генератора)
let QUESTIONS = generateQuestions();

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

/* --- тип 2: текстовый ввод --- */
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
    input.value = q.correct;
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

/* ---------------------- СПРАВКА ---------------------- */

function openHelp() {
  el.helpModal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeHelp() {
  el.helpModal.hidden = true;
  document.body.style.overflow = '';
}

el.helpBtn.addEventListener('click', openHelp);
el.closeHelpBtn.addEventListener('click', closeHelp);
el.helpModal.addEventListener('click', (e) => {
  if (e.target === el.helpModal) closeHelp();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !el.helpModal.hidden) closeHelp();
});

/* ---------------------- СТАРТ / СОБЫТИЯ ---------------------- */

function startOver() {
  state.qIndex = 0;
  state.correct = 0;
  state.answered = false;
  QUESTIONS = generateQuestions(); // Новые числа, но порядок блоков тот же
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
