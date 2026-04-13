// ===== Graph Visualizer Controller =====

(function () {
  const canvas = document.getElementById('graphCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let nodes = [], edges = [], adjacency = {};
  let startNode = null, endNode = null;
  let visitedNodes = new Set(), pathNodes = [], currentNode = null;
  // MST state
  let mstEdges = [], consideringEdge = null, acceptedEdge = null;

  let selectMode = null;
  let isRunning = false;
  let algo = null;
  let currentAlgo = 'bfs';
  let startTime = null;
  let timerInterval = null;

  const nodeCountSlider = document.getElementById('nodeCount');
  const speedSlider     = document.getElementById('speedControl');
  const nodeDisplay     = document.getElementById('nodeDisplay');
  const speedDisplay    = document.getElementById('speedDisplay');
  const generateBtn     = document.getElementById('generateGraphBtn');
  const selectStartBtn  = document.getElementById('selectStartBtn');
  const selectEndBtn    = document.getElementById('selectEndBtn');
  const startBtn        = document.getElementById('startBtn');
  const pauseBtn        = document.getElementById('pauseBtn');
  const resetBtn        = document.getElementById('resetBtn');
  const selectHint      = document.getElementById('selectHint');
  const algoNameEl      = document.getElementById('currentAlgoName');
  const totalNodesEl    = document.getElementById('totalNodes');
  const pathLengthEl    = document.getElementById('pathLength');

  // ── helpers ──────────────────────────────────────────────────────────────
  function isMST() { return currentAlgo === 'kruskal' || currentAlgo === 'prim'; }

  function resizeCanvas() {
    const wrap = canvas.parentElement;
    canvas.width  = wrap.clientWidth;
    canvas.height = wrap.clientHeight;
    drawGraph();
  }
  window.addEventListener('resize', resizeCanvas);

  // ── algo buttons ─────────────────────────────────────────────────────────
  document.querySelectorAll('#algoList .algo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (isRunning) return;
      document.querySelectorAll('#algoList .algo-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAlgo = btn.dataset.algo;
      updateAlgorithmInfo(currentAlgo);
      if (algoNameEl) algoNameEl.textContent = ALGORITHM_INFO[currentAlgo]?.name || currentAlgo;
      // Show/hide start-end buttons for MST algos
      toggleMSTMode();
      resetViz();
    });
  });

  function toggleMSTMode() {
    const hide = isMST();
    if (selectStartBtn) selectStartBtn.style.display = hide ? 'none' : '';
    if (selectEndBtn)   selectEndBtn.style.display   = hide ? 'none' : '';
    if (pathLengthEl) {
      pathLengthEl.closest('.stat-item').querySelector('.stat-label').textContent =
        hide ? 'MST Edges' : 'Path Len';
    }
  }

  nodeCountSlider?.addEventListener('input', () => {
    if (isRunning) return;
    nodeDisplay.textContent = nodeCountSlider.value;
    generateGraph();
  });

  speedSlider?.addEventListener('input', () => {
    speedDisplay.textContent = speedSlider.value;
    if (algo) algo.setSpeed(parseInt(speedSlider.value));
  });

  generateBtn?.addEventListener('click',    () => { if (!isRunning) generateGraph(); });
  selectStartBtn?.addEventListener('click', () => setSelectMode('start'));
  selectEndBtn?.addEventListener('click',   () => setSelectMode('end'));
  startBtn?.addEventListener('click',       () => { if (!isRunning) runAlgo(); });

  pauseBtn?.addEventListener('click', () => {
    if (!algo) return;
    if (algo.isPaused) {
      algo.resume();
      pauseBtn.textContent = '⏸ Pause';
      setStatus('running', 'Running');
    } else {
      algo.pause();
      pauseBtn.textContent = '▶ Resume';
      setStatus('paused', 'Paused');
    }
  });

  resetBtn?.addEventListener('click', () => {
    if (algo) algo.stop();
    clearInterval(timerInterval);
    isRunning = false;
    resetViz();
    updateStatistics({ nodesVisited: 0, pathLength: 0 });
    document.getElementById('time').textContent = '0';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '⏸ Pause';
    setStatus('idle', 'Idle');
  });

  canvas.addEventListener('click', (e) => {
    if (!selectMode) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hit = nodes.find(n => Math.hypot(n.x - mx, n.y - my) < 22);
    if (!hit) return;
    if (selectMode === 'start') { startNode = hit.id; showToast(`Start: ${hit.id}`, 'info'); }
    else                        { endNode   = hit.id; showToast(`End: ${hit.id}`,   'info'); }
    selectMode = null;
    if (selectHint) selectHint.style.display = 'none';
    drawGraph();
  });

  function setSelectMode(mode) {
    selectMode = mode;
    if (selectHint) {
      selectHint.style.display = 'block';
      selectHint.textContent = `Click a node to set as ${mode === 'start' ? 'Start' : 'End'}`;
    }
  }

  // ── graph generation ──────────────────────────────────────────────────────
  function generateGraph() {
    const count = parseInt(nodeCountSlider?.value || 10);
    const W = canvas.width || 800, H = canvas.height || 500, pad = 60;

    nodes = Array.from({ length: count }, (_, i) => ({
      id: String.fromCharCode(65 + i),
      x: pad + Math.random() * (W - pad * 2),
      y: pad + Math.random() * (H - pad * 2),
    }));

    edges = [];
    adjacency = {};
    nodes.forEach(n => { adjacency[n.id] = {}; });

    nodes.forEach((n, i) => {
      const sorted = nodes
        .filter((_, j) => j !== i)
        .sort((a, b) => Math.hypot(a.x - n.x, a.y - n.y) - Math.hypot(b.x - n.x, b.y - n.y));
      const k = Math.min(2 + Math.floor(Math.random() * 2), sorted.length);
      for (let j = 0; j < k; j++) {
        const m = sorted[j];
        const w = Math.round(Math.hypot(n.x - m.x, n.y - m.y) / 10);
        if (!edges.find(e => (e.a === n.id && e.b === m.id) || (e.a === m.id && e.b === n.id))) {
          edges.push({ a: n.id, b: m.id, w });
          adjacency[n.id][m.id] = w;
          adjacency[m.id][n.id] = w;
        }
      }
    });

    startNode = nodes[0]?.id;
    endNode   = nodes[nodes.length - 1]?.id;
    if (totalNodesEl) totalNodesEl.textContent = count;
    resetViz();
  }

  function resetViz() {
    visitedNodes    = new Set();
    pathNodes       = [];
    currentNode     = null;
    mstEdges        = [];
    consideringEdge = null;
    acceptedEdge    = null;
    drawGraph();
    hideComplexityAnalysis();
  }

  // ── draw ──────────────────────────────────────────────────────────────────
  function edgeInMST(ea, eb) {
    return mstEdges.some(e =>
      (e.u === ea && e.v === eb) || (e.u === eb && e.v === ea) ||
      (e.a === ea && e.b === eb) || (e.a === eb && e.b === ea)
    );
  }

  function drawGraph() {
    if (!canvas.width) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    edges.forEach(e => {
      const a = nodes.find(n => n.id === e.a);
      const b = nodes.find(n => n.id === e.b);
      if (!a || !b) return;

      const inMST = edgeInMST(e.a, e.b);
      const isConsidering = consideringEdge &&
        ((consideringEdge.u === e.a && consideringEdge.v === e.b) ||
         (consideringEdge.u === e.b && consideringEdge.v === e.a));
      const isPath = !isMST() && pathNodes.length > 1 &&
        pathNodes.some((p, i) => i < pathNodes.length - 1 &&
          ((p === e.a && pathNodes[i + 1] === e.b) || (p === e.b && pathNodes[i + 1] === e.a)));

      let strokeColor = '#3a3a60';
      let lineWidth   = 1.5;
      let alpha       = 0.4;

      if (inMST)          { strokeColor = '#10b981'; lineWidth = 3;   alpha = 1; }
      else if (isPath)    { strokeColor = '#10b981'; lineWidth = 3;   alpha = 1; }
      else if (isConsidering) { strokeColor = '#f59e0b'; lineWidth = 2.5; alpha = 0.9; }

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth   = lineWidth;
      ctx.globalAlpha = alpha;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Weight label
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      ctx.fillStyle  = inMST ? '#10b981' : (isConsidering ? '#f59e0b' : '#64748b');
      ctx.font       = `${inMST ? 'bold ' : ''}10px Inter, sans-serif`;
      ctx.textAlign  = 'center';
      ctx.fillText(e.w, mx, my - 5);
    });

    // Nodes
    const mstNodeSet = new Set(mstEdges.flatMap(e => [e.u || e.a, e.v || e.b]));

    nodes.forEach(n => {
      let fill      = '#2e2e50';
      let stroke    = '#3a3a60';
      let textColor = '#94a3b8';

      if (isMST()) {
        if (n.id === currentNode)       { fill = '#f59e0b'; stroke = '#d97706'; textColor = '#fff'; }
        else if (mstNodeSet.has(n.id))  { fill = '#10b981'; stroke = '#059669'; textColor = '#fff'; }
      } else {
        if (n.id === startNode)         { fill = '#06d6a0'; stroke = '#059669'; textColor = '#fff'; }
        else if (n.id === endNode)      { fill = '#ef4444'; stroke = '#dc2626'; textColor = '#fff'; }
        else if (pathNodes.includes(n.id)) { fill = '#10b981'; stroke = '#059669'; textColor = '#fff'; }
        else if (n.id === currentNode)  { fill = '#f59e0b'; stroke = '#d97706'; textColor = '#fff'; }
        else if (visitedNodes.has(n.id)){ fill = '#6c63ff'; stroke = '#5a52d5'; textColor = '#fff'; }
      }

      if (n.id === currentNode) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 24, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245,158,11,0.18)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, 18, 0, Math.PI * 2);
      ctx.fillStyle   = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth   = 2;
      ctx.stroke();

      ctx.fillStyle     = textColor;
      ctx.font          = 'bold 12px Inter, sans-serif';
      ctx.textAlign     = 'center';
      ctx.textBaseline  = 'middle';
      ctx.fillText(n.id, n.x, n.y);
    });
  }

  // ── run ───────────────────────────────────────────────────────────────────
  async function runAlgo() {
    if (!isMST() && (!startNode || !endNode)) {
      showToast('Set start and end nodes first', 'error'); return;
    }
    if (!isMST() && startNode === endNode) {
      showToast('Start and end must be different', 'error'); return;
    }

    isRunning = true;
    setStatus('running', 'Running');
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    visitedNodes    = new Set();
    pathNodes       = [];
    currentNode     = null;
    mstEdges        = [];
    consideringEdge = null;

    const speed = parseInt(speedSlider?.value || 50);
    startTime = Date.now();
    timerInterval = setInterval(() => updateTime(startTime), 100);

    try {
      if (currentAlgo === 'kruskal') {
        algo = new Kruskal();
        algo.setSpeed(speed);
        const result = await algo.run(adjacency, (state) => {
          mstEdges        = state.mstEdges || [];
          consideringEdge = state.considering || null;
          currentNode     = null;
          updateStatistics({ nodesVisited: state.edgesAdded, pathLength: state.edgesAdded });
          drawGraph();
        });
        mstEdges = result.mstEdges;
        consideringEdge = null;
        drawGraph();
        updateStatistics({ nodesVisited: result.edgesAdded, pathLength: result.edgesAdded });
        setStatus('done', 'Done');
        showToast(`MST built! ${result.edgesAdded} edges, total weight: ${result.totalWeight}`, 'success');
        showComplexityAnalysis({
          algo: 'kruskal',
          n: nodes.length,
          e: edges.length,
          ops: result.edgesAdded,
          elapsedMs: Date.now() - startTime,
          extra: [
            { label: 'MST Edges', value: result.edgesAdded },
            { label: 'Total Weight', value: result.totalWeight },
            { label: 'Total Edges', value: edges.length },
          ]
        });

      } else if (currentAlgo === 'prim') {
        algo = new Prim();
        algo.setSpeed(speed);
        const result = await algo.run(adjacency, startNode, (state) => {
          mstEdges    = state.mstEdges || [];
          currentNode = state.current || null;
          updateStatistics({ nodesVisited: state.nodesVisited, pathLength: state.edgesAdded });
          drawGraph();
        });
        mstEdges    = result.mstEdges;
        currentNode = null;
        drawGraph();
        updateStatistics({ nodesVisited: result.edgesAdded + 1, pathLength: result.edgesAdded });
        setStatus('done', 'Done');
        showToast(`MST built! ${result.edgesAdded} edges, total weight: ${result.totalWeight}`, 'success');
        showComplexityAnalysis({
          algo: 'prim',
          n: nodes.length,
          e: edges.length,
          ops: result.edgesAdded,
          elapsedMs: Date.now() - startTime,
          extra: [
            { label: 'MST Edges', value: result.edgesAdded },
            { label: 'Total Weight', value: result.totalWeight },
            { label: 'Nodes in MST', value: result.edgesAdded + 1 },
          ]
        });

      } else {
        // BFS / DFS / Dijkstra
        let a;
        switch (currentAlgo) {
          case 'bfs':      a = new BFS();      break;
          case 'dfs':      a = new DFS();      break;
          case 'dijkstra': a = new Dijkstra(); break;
          default:         a = new BFS();
        }
        a.setSpeed(speed);
        algo = a;

        const cb = (state) => {
          visitedNodes = new Set(state.visited || []);
          currentNode  = state.current || null;
          pathNodes    = state.path || [];
          updateStatistics({ nodesVisited: state.nodesVisited || visitedNodes.size });
          drawGraph();
        };

        const result = await algo.search(adjacency, startNode, endNode, cb);
        pathNodes    = result.path || [];
        visitedNodes = new Set(result.visited || []);
        currentNode  = null;
        drawGraph();
        updateStatistics({ nodesVisited: result.nodesVisited, pathLength: pathNodes.length });
        setStatus('done', 'Done');
        showToast(
          pathNodes.length > 1 ? `Path found! Length: ${pathNodes.length}` : 'No path found',
          pathNodes.length > 1 ? 'success' : 'error'
        );
        showComplexityAnalysis({
          algo: currentAlgo,
          n: nodes.length,
          e: edges.length,
          ops: result.nodesVisited || visitedNodes.size,
          elapsedMs: Date.now() - startTime,
          extra: [
            { label: 'Nodes Visited', value: result.nodesVisited || visitedNodes.size },
            { label: 'Path Length', value: pathNodes.length > 1 ? pathNodes.length : 'No path' },
            { label: 'Total Edges', value: edges.length },
          ]
        });
      }
    } catch (e) {
      setStatus('idle', 'Stopped');
    }

    clearInterval(timerInterval);
    updateTime(startTime);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '⏸ Pause';
  }

  // ── init ──────────────────────────────────────────────────────────────────
  updateAlgorithmInfo('bfs');
  toggleMSTMode();
  setTimeout(() => { resizeCanvas(); generateGraph(); }, 100);
})();
