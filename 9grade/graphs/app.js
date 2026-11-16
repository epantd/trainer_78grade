function generateRandomGraph() {
  for (let attempt = 0; attempt < 200; attempt++) {
    const numNodes = randInt(5, 7);              // минимум 5 узлов
    const endLetter = pick(END_CANDIDATES);

    // Слоёв: 3..min(5, numNodes)
    const numLayers = randInt(3, Math.min(5, numNodes));
    const layerCounts = new Array(numLayers).fill(1);
    let extra = numNodes - numLayers;
    while (extra > 0) {
      const l = randInt(1, numLayers - 2);
      layerCounts[l]++;
      extra--;
    }

    // Координаты X слоёв
    const xStep = 400 / (numLayers - 1);
    const layerX = [];
    for (let i = 0; i < numLayers; i++) layerX.push(60 + i * xStep);

    // Y для каждого слоя
    const nodes = [];
    for (let layer = 0; layer < numLayers; layer++) {
      const cnt = layerCounts[layer];
      const isFirst = layer === 0;
      const isLast = layer === numLayers - 1;

      let yPositions;
      if (cnt === 1) {
        if (isFirst || isLast) {
          yPositions = [200];                    // крайние — по центру
        } else {
          yPositions = [randInt(120, 280)];      // промежуточные — случайный Y
        }
      } else if (cnt === 2) {
        yPositions = [randInt(70, 130), randInt(270, 330)];
      } else {
        yPositions = [70, 200, 330];
      }

      for (let j = 0; j < cnt; j++) {
        nodes.push({ x: layerX[layer], y: yPositions[j], layer });
      }
    }

    // Проверка «плоскости» — если все узлы на одной высоте, перегенерируем
    const ys = nodes.map(n => n.y);
    if (Math.max(...ys) - Math.min(...ys) < 60) continue;

    // Разнообразие по X внутри слоя тоже должно быть
    const xs = [...new Set(nodes.map(n => n.x))];
    if (xs.length < 3) continue;

    // Назначаем буквы
    const middlePool = LETTER_POOL.filter(l => l !== 'A' && l !== endLetter);
    const middleLetters = shuffle(middlePool).slice(0, numNodes - 2);
    nodes[0].letter = 'A';
    nodes[nodes.length - 1].letter = endLetter;
    for (let i = 1; i < nodes.length - 1; i++) {
      nodes[i].letter = middleLetters[i - 1];
    }

    // Рёбра
    const edges = [];
    const edgeSet = new Set();
    const addEdge = (u, v) => {
      const key = u + '>' + v;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push([u, v]);
      }
    };

    nodes.forEach(u => {
      const candidates = nodes.filter(v => v.layer > u.layer);
      if (candidates.length === 0) return;
      const numConn = randInt(1, Math.min(2, candidates.length));
      const chosen = shuffle(candidates).slice(0, numConn);
      chosen.forEach(v => addEdge(u.letter, v.letter));
    });

    // Гарантируем связность
    const hasIn  = new Set(edges.map(([u, v]) => v));
    const hasOut = new Set(edges.map(([u, v]) => u));

    nodes.forEach((n, i) => {
      if (i === 0) return;
      if (!hasIn.has(n.letter)) {
        const c = nodes.filter(v => v.layer < n.layer);
        if (c.length) {
          const from = pick(c);
          addEdge(from.letter, n.letter);
          hasIn.add(n.letter); hasOut.add(from.letter);
        }
      }
    });
    nodes.forEach((n, i) => {
      if (i === nodes.length - 1) return;
      if (!hasOut.has(n.letter)) {
        const c = nodes.filter(v => v.layer > n.layer);
        if (c.length) {
          const to = pick(c);
          addEdge(n.letter, to.letter);
          hasOut.add(n.letter); hasIn.add(to.letter);
        }
      }
    });

    // Карта узлов
    const nodeMap = {};
    nodes.forEach(n => nodeMap[n.letter] = { x: n.x, y: n.y });

    // Проверяем ответ
    const paths = countPaths(edges, 'A', endLetter, nodeMap);
    if (paths > 0 && paths <= 30) {
      return { edges, nodeMap, start: 'A', end: endLetter, paths };
    }
  }

  // Fallback
  return {
    edges: [['A','B'], ['A','C'], ['B','F'], ['C','F']],
    nodeMap: { A: {x:80,y:200}, B: {x:200,y:100}, C: {x:200,y:300}, F: {x:440,y:200} },
    start: 'A', end: 'F', paths: 2
  };
}
