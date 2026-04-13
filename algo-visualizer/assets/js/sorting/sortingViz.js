// ===== Sorting Visualizer — Array Cell Style =====

(function () {
  let array = [];
  let currentAlgo = 'bubble';
  let sorter = null;
  let startTime = null;
  let timerInterval = null;
  let isRunning = false;

  const cellsEl    = document.getElementById('arrayCells');
  const stepDescEl = document.getElementById('stepDesc');
  const generateBtn   = document.getElementById('generateBtn');
  const startBtn      = document.getElementById('startBtn');
  const pauseBtn      = document.getElementById('pauseBtn');
  const resetBtn      = document.getElementById('resetBtn');
  const arraySizeSlider = document.getElementById('arraySize');
  const speedSlider     = document.getElementById('speedControl');
  const sizeDisplay     = document.getElementById('sizeDisplay');
  const speedDisplay    = document.getElementById('speedDisplay');
  const algoNameEl      = document.getElementById('currentAlgoName');
  const arrayLenEl      = document.getElementById('arrayLen');
  const customInput     = document.getElementById('customInput');
  const applyInputBtn   = document.getElementById('applyInputBtn');

  // ── Algorithm selector ──────────────────────────────────────────────────
  document.querySelectorAll('#algoList .algo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (isRunning) return;
      document.querySelectorAll('#algoList .algo-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAlgo = btn.dataset.algo;
      updateAlgorithmInfo(currentAlgo);
      if (algoNameEl) algoNameEl.textContent = ALGORITHM_INFO[currentAlgo]?.name || currentAlgo;
      generateArray();
    });
  });

  arraySizeSlider?.addEventListener('input', () => {
    if (isRunning) return;
    sizeDisplay.textContent = arraySizeSlider.value;
    generateArray();
  });

  speedSlider?.addEventListener('input', () => {
    speedDisplay.textContent = speedSlider.value;
    if (sorter) sorter.setSpeed(parseInt(speedSlider.value));
  });

  generateBtn?.addEventListener('click', () => { if (!isRunning) generateArray(); });
  startBtn?.addEventListener('click',   () => { if (!isRunning) runSort(); });

  // ── Custom input ──────────────────────────────────────────────────────────
  applyInputBtn?.addEventListener('click', () => {
    if (isRunning) return;
    applyCustomInput();
  });

  customInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !isRunning) applyCustomInput();
  });

  // Live validation feedback while typing
  customInput?.addEventListener('input', () => {
    customInput.classList.remove('error', 'success');
    const val = customInput.value.trim();
    if (!val) return;
    const parsed = parseCustomInput(val);
    customInput.classList.add(parsed ? 'success' : 'error');
  });

  function parseCustomInput(raw) {
    const parts = raw.split(/[\s,]+/).filter(Boolean);
    if (!parts.length || parts.length > 20) return null;
    const nums = parts.map(Number);
    if (nums.some(n => isNaN(n) || !Number.isInteger(n) || n < 1 || n > 999)) return null;
    return nums;
  }

  function applyCustomInput() {
    const raw = customInput?.value.trim();
    if (!raw) { showToast('Enter some numbers first', 'error'); return; }
    const nums = parseCustomInput(raw);
    if (!nums) {
      customInput.classList.add('error');
      showToast('Use integers 1–999, max 20 values, comma-separated', 'error');
      return;
    }
    customInput.classList.remove('error');
    customInput.classList.add('success');
    array = nums;
    if (arrayLenEl) arrayLenEl.textContent = nums.length;
    renderCells(array, { comparing: [], swapping: [], sorted: [], pivot: [] });
    setDesc(`Custom array loaded — <span class="highlight-green">${nums.length} elements</span>. Press <strong>▶ Start Sort</strong>`);
    showToast(`Array loaded: [${nums.join(', ')}]`, 'success');
  }

  pauseBtn?.addEventListener('click', () => {
    if (!sorter) return;
    if (sorter.isPaused) {
      sorter.resume();
      pauseBtn.textContent = '⏸ Pause';
      setStatus('running', 'Running');
    } else {
      sorter.pause();
      pauseBtn.textContent = '▶ Resume';
      setStatus('paused', 'Paused');
    }
  });

  resetBtn?.addEventListener('click', () => {
    if (sorter) sorter.stop();
    clearInterval(timerInterval);
    isRunning = false;
    setStatus('idle', 'Idle');
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '⏸ Pause';
    if (customInput) customInput.classList.remove('error', 'success');
    generateArray();
    updateStatistics({ comparisons: 0, swaps: 0 });
    document.getElementById('time').textContent = '0';
  });

  // ── Array generation ─────────────────────────────────────────────────────
  function generateArray() {
    // Cap display size so cells don't overflow
    const raw  = parseInt(arraySizeSlider?.value || 20);
    const size = Math.min(raw, 20);          // max 20 cells for readability
    array = generateRandomArray(size, 5, 99);
    if (arrayLenEl) arrayLenEl.textContent = raw;
    renderCells(array, { comparing: [], swapping: [], sorted: [], pivot: [] });
    setDesc('Press <strong>▶ Start Sort</strong> to begin');
    hideComplexityAnalysis();
  }

  // ── Cell renderer ─────────────────────────────────────────────────────────
  /**
   * @param {number[]} arr
   * @param {{ comparing, swapping, sorted, pivot, minIdx, pointers }} state
   */
  function renderCells(arr, state = {}) {
    if (!cellsEl) return;
    const { comparing = [], swapping = [], sorted = [], pivot = [], minIdx = -1, pointers = {} } = state;

    cellsEl.innerHTML = '';

    arr.forEach((val, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'cell-wrap';

      // Arrow row (pointer labels like i↑, j↑)
      const arrow = document.createElement('div');
      arrow.className = 'cell-arrow';
      const ptrs = Object.entries(pointers).filter(([, idx]) => idx === i).map(([name]) => name);
      arrow.textContent = ptrs.join(' ');
      wrap.appendChild(arrow);

      // Cell box
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = val;

      if (pivot.includes(i))       cell.classList.add('pivot');
      else if (swapping.includes(i)) cell.classList.add('swapping');
      else if (comparing.includes(i)) cell.classList.add('comparing');
      else if (i === minIdx)        cell.classList.add('min-marker');
      else if (sorted.includes(i))  cell.classList.add('sorted');

      wrap.appendChild(cell);

      // Index label
      const idx = document.createElement('div');
      idx.className = 'cell-index';
      idx.textContent = i;
      wrap.appendChild(idx);

      cellsEl.appendChild(wrap);
    });
  }

  function setDesc(html) {
    if (stepDescEl) stepDescEl.innerHTML = html;
  }

  // ── Sorter factory ────────────────────────────────────────────────────────
  function getSorter() {
    const speed = parseInt(speedSlider?.value || 50);
    let s;
    switch (currentAlgo) {
      case 'bubble':    s = new BubbleSort();    break;
      case 'selection': s = new SelectionSort(); break;
      case 'merge':     s = new MergeSort();     break;
      case 'quick':     s = new QuickSort();     break;
      default:          s = new BubbleSort();
    }
    s.setSpeed(speed);
    return s;
  }

  // ── Step description builders ─────────────────────────────────────────────
  function descFor(state) {
    const { comparing, swapping, sorted, pivot } = state;
    if (swapping?.length === 2) {
      return `Swapping <span class="highlight">[${swapping[0]}]=${state.array?.[swapping[0]]}</span> ↔ <span class="highlight">[${swapping[1]}]=${state.array?.[swapping[1]]}</span>`;
    }
    if (comparing?.length === 2) {
      const a = state.array?.[comparing[0]], b = state.array?.[comparing[1]];
      return `Comparing <span class="highlight">[${comparing[0]}]=${a}</span> vs <span class="highlight">[${comparing[1]}]=${b}</span>`;
    }
    if (pivot?.length) {
      return `Pivot = <span class="highlight">${state.array?.[pivot[0]]}</span> at index [${pivot[0]}]`;
    }
    if (sorted?.length) {
      return `<span class="highlight-green">${sorted.length}</span> element${sorted.length > 1 ? 's' : ''} sorted`;
    }
    return 'Processing…';
  }

  // ── Run sort ──────────────────────────────────────────────────────────────
  async function runSort() {
    if (!array.length) generateArray();
    isRunning = true;
    setStatus('running', 'Running');
    startBtn.disabled = true;
    pauseBtn.disabled = false;

    sorter = getSorter();
    startTime = Date.now();
    timerInterval = setInterval(() => updateTime(startTime), 100);

    const arrCopy = [...array];

    // Build pointer map per algorithm
    function getPointers(state) {
      const { comparing = [], swapping = [], pivot = [] } = state;
      const ptrs = {};
      if (currentAlgo === 'bubble' || currentAlgo === 'merge') {
        if (comparing[0] !== undefined) ptrs['j'] = comparing[0];
        if (comparing[1] !== undefined) ptrs['j+1'] = comparing[1];
      } else if (currentAlgo === 'selection') {
        if (comparing[0] !== undefined) ptrs['i'] = comparing[0];
        if (comparing[1] !== undefined) ptrs['j'] = comparing[1];
      } else if (currentAlgo === 'quick') {
        if (pivot[0] !== undefined) ptrs['p'] = pivot[0];
        if (comparing[0] !== undefined) ptrs['j'] = comparing[0];
      }
      return ptrs;
    }

    try {
      await sorter.sort(arrCopy, (state) => {
        const pivotArr = state.pivot !== undefined ? [state.pivot] : [];
        renderCells(state.array || arrCopy, {
          comparing: state.comparing || [],
          swapping:  state.swapping  || [],
          sorted:    state.sorted    || [],
          pivot:     pivotArr,
          pointers:  getPointers({ ...state, pivot: pivotArr }),
        });
        setDesc(descFor({ ...state, pivot: pivotArr }));
        updateStatistics({ comparisons: state.comparisons, swaps: state.swaps });
      });

      // Final: all sorted
      const finalArr = sorter.array || arrCopy;
      renderCells(finalArr, {
        sorted: Array.from({ length: finalArr.length }, (_, i) => i),
      });
      setDesc(`<span class="highlight-green">✓ Sorted!</span> ${finalArr.join(', ')}`);
      setStatus('done', 'Done');
      showToast(`${ALGORITHM_INFO[currentAlgo]?.name} complete!`, 'success');
      showComplexityAnalysis({
        algo: currentAlgo,
        n: arrCopy.length,
        ops: sorter.comparisons || 0,
        elapsedMs: Date.now() - startTime,
        extra: [
          { label: 'Comparisons', value: (sorter.comparisons || 0).toLocaleString() },
          { label: 'Swaps / Moves', value: (sorter.swaps || 0).toLocaleString() },
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

  // ── Init ──────────────────────────────────────────────────────────────────
  updateAlgorithmInfo('bubble');
  generateArray();
})();
