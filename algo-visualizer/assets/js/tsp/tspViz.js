// ===== TSP Visualizer Controller =====

(function () {
  const canvas = document.getElementById('tspCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let cities = [];
  let bestRoute = [], currentRoute = [];
  let isRunning = false;
  let solver = null;
  let currentAlgo = 'greedy';
  let startTime = null;
  let timerInterval = null;

  const cityCountSlider = document.getElementById('cityCount');
  const speedSlider = document.getElementById('speedControl');
  const cityDisplay = document.getElementById('cityDisplay');
  const speedDisplay = document.getElementById('speedDisplay');
  const generateBtn = document.getElementById('generateBtn');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');
  const algoNameEl = document.getElementById('currentAlgoName');
  const cityCount2El = document.getElementById('cityCount2');

  function resizeCanvas() {
    const wrap = canvas.parentElement;
    canvas.width = wrap.clientWidth;
    canvas.height = wrap.clientHeight;
    drawTSP();
  }

  window.addEventListener('resize', resizeCanvas);

  document.querySelectorAll('#algoList .algo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (isRunning) return;
      document.querySelectorAll('#algoList .algo-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAlgo = btn.dataset.algo;
      updateAlgorithmInfo(currentAlgo);
      if (algoNameEl) algoNameEl.textContent = ALGORITHM_INFO[currentAlgo]?.name || currentAlgo;
      resetViz();
    });
  });

  cityCountSlider?.addEventListener('input', () => {
    if (isRunning) return;
    cityDisplay.textContent = cityCountSlider.value;
    generateCities();
  });

  speedSlider?.addEventListener('input', () => {
    speedDisplay.textContent = speedSlider.value;
    if (solver) solver.setSpeed(parseInt(speedSlider.value));
  });

  generateBtn?.addEventListener('click', () => { if (!isRunning) generateCities(); });
  startBtn?.addEventListener('click', () => { if (!isRunning) runSolver(); });

  pauseBtn?.addEventListener('click', () => {
    if (!solver) return;
    if (solver.isPaused) {
      solver.resume();
      pauseBtn.textContent = '⏸ Pause';
      setStatus('running', 'Running');
    } else {
      solver.pause();
      pauseBtn.textContent = '▶ Resume';
      setStatus('paused', 'Paused');
    }
  });

  resetBtn?.addEventListener('click', () => {
    if (solver) solver.stop();
    clearInterval(timerInterval);
    isRunning = false;
    resetViz();
    updateStatistics({ bestDistance: 0, routesChecked: 0 });
    document.getElementById('time').textContent = '0';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '⏸ Pause';
    setStatus('idle', 'Idle');
  });

  function generateCities() {
    const count = parseInt(cityCountSlider?.value || 8);
    const W = canvas.width || 800;
    const H = canvas.height || 500;
    const pad = 60;
    cities = Array.from({ length: count }, (_, i) => ({
      x: pad + Math.random() * (W - pad * 2),
      y: pad + Math.random() * (H - pad * 2),
      id: i,
    }));
    if (cityCount2El) cityCount2El.textContent = count;
    resetViz();
  }

  function resetViz() {
    bestRoute = [];
    currentRoute = [];
    drawTSP();
    hideComplexityAnalysis();
  }

  function drawTSP() {
    if (!canvas.width) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!cities.length) return;

    // All edges (faint)
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#6c63ff';
    ctx.lineWidth = 1;
    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        ctx.beginPath();
        ctx.moveTo(cities[i].x, cities[i].y);
        ctx.lineTo(cities[j].x, cities[j].y);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // Current route
    if (currentRoute.length > 1) {
      ctx.beginPath();
      ctx.moveTo(cities[currentRoute[0]].x, cities[currentRoute[0]].y);
      for (let i = 1; i < currentRoute.length; i++) {
        ctx.lineTo(cities[currentRoute[i]].x, cities[currentRoute[i]].y);
      }
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Best route
    if (bestRoute.length > 1) {
      ctx.beginPath();
      ctx.moveTo(cities[bestRoute[0]].x, cities[bestRoute[0]].y);
      for (let i = 1; i < bestRoute.length; i++) {
        ctx.lineTo(cities[bestRoute[i]].x, cities[bestRoute[i]].y);
      }
      // Close tour
      ctx.lineTo(cities[bestRoute[0]].x, cities[bestRoute[0]].y);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Cities
    cities.forEach((c, i) => {
      const isInBest = bestRoute.includes(i);
      ctx.beginPath();
      ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = isInBest ? '#10b981' : '#6c63ff';
      ctx.fill();
      ctx.strokeStyle = isInBest ? '#059669' : '#5a52d5';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(i + 1, c.x, c.y);
    });
  }

  async function runSolver() {
    if (!cities.length) generateCities();
    isRunning = true;
    setStatus('running', 'Running');
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    bestRoute = [];
    currentRoute = [];

    solver = new TSPSolver();
    solver.setSpeed(parseInt(speedSlider?.value || 50));
    startTime = Date.now();
    timerInterval = setInterval(() => updateTime(startTime), 100);

    const cb = (state) => {
      if (state.bestRoute) bestRoute = [...state.bestRoute];
      if (state.currentRoute) currentRoute = [...state.currentRoute];
      updateStatistics({
        bestDistance: state.bestDistance || 0,
        routesChecked: state.routesChecked || 0,
      });
      drawTSP();
    };

    try {
      let result;
      if (currentAlgo === 'bruteforce') {
        result = await solver.solveBruteForce(cities, cb);
      } else {
        result = await solver.solveGreedy(cities, cb);
      }

      bestRoute = result.bestRoute || [];
      currentRoute = [];
      drawTSP();
      updateStatistics({ bestDistance: result.bestDistance, routesChecked: result.routesChecked || cities.length });
      setStatus('done', 'Done');
      showToast(`Best distance: ${Math.round(result.bestDistance)}`, 'success');
      showComplexityAnalysis({
        algo: currentAlgo,
        n: cities.length,
        ops: result.routesChecked || cities.length,
        elapsedMs: Date.now() - startTime,
        extra: [
          { label: 'Cities (n)', value: cities.length },
          { label: 'Best Distance', value: Math.round(result.bestDistance) },
          { label: 'Routes Checked', value: (result.routesChecked || cities.length).toLocaleString() },
        ]
      });
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

  // Init
  updateAlgorithmInfo('greedy');
  setTimeout(() => {
    resizeCanvas();
    generateCities();
  }, 100);
})();
