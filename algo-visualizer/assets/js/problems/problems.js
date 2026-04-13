// ===== Classic DAA Problems — All Visualizers =====

// ── Tab switching ────────────────────────────────────────────────────────────
document.querySelectorAll('.prob-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.prob-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.prob-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// ── Shared helpers ───────────────────────────────────────────────────────────
function probSetStatus(prefix, state, text) {
  const badge = document.getElementById(prefix + '-status');
  const label = document.getElementById(prefix + '-status-text');
  if (badge) badge.className = 'status-badge ' + state;
  if (label) label.textContent = text;
}
function probSetDesc(prefix, html) {
  const el = document.getElementById(prefix + '-desc');
  if (el) el.innerHTML = html;
}
function probStat(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function probDelay(speed) {
  return new Promise(r => setTimeout(r, Math.max(8, (100 - speed) * 2)));
}


// ════════════════════════════════════════════════════════════════════════════
// 1. N-QUEENS
// ════════════════════════════════════════════════════════════════════════════
(function () {
  let N = 6, speed = 60, running = false, stopFlag = false;
  let steps = 0, solutions = 0, backtracks = 0, startTime = 0;

  const nSlider    = document.getElementById('nq-n');
  const nDisp      = document.getElementById('nq-n-display');
  const spSlider   = document.getElementById('nq-speed');
  const spDisp     = document.getElementById('nq-speed-display');
  const startBtn   = document.getElementById('nq-start');
  const resetBtn   = document.getElementById('nq-reset');
  const boardEl    = document.getElementById('nq-board');

  nSlider?.addEventListener('input', () => { N = +nSlider.value; nDisp.textContent = N; if (!running) buildBoard([]); });
  spSlider?.addEventListener('input', () => { speed = +spSlider.value; spDisp.textContent = speed; });
  startBtn?.addEventListener('click', () => { if (!running) startSolve(); });
  resetBtn?.addEventListener('click', () => { stopFlag = true; running = false; buildBoard([]); resetStats(); probSetStatus('nq','idle','Idle'); probSetDesc('nq','Press ▶ Solve to start backtracking'); });

  function resetStats() { steps=0; solutions=0; backtracks=0; probStat('nq-steps',0); probStat('nq-solutions',0); probStat('nq-backtracks',0); probStat('nq-time',0); }

  function buildBoard(queens, trying=-1, conflicts=[]) {
    if (!boardEl) return;
    boardEl.style.gridTemplateColumns = `repeat(${N}, 52px)`;
    boardEl.innerHTML = '';
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const cell = document.createElement('div');
        cell.className = 'nq-cell ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
        const hasQueen = queens[r] === c;
        const isTrying = r === trying;
        const isConflict = conflicts.some(([cr,cc]) => cr===r && cc===c);
        if (isConflict) cell.classList.add('conflict');
        else if (hasQueen) cell.classList.add('queen');
        else if (isTrying) cell.classList.add('trying');
        if (hasQueen) cell.textContent = '♛';
        boardEl.appendChild(cell);
      }
    }
  }

  function isSafe(queens, row, col) {
    for (let r = 0; r < row; r++) {
      const c = queens[r];
      if (c === col || Math.abs(c - col) === Math.abs(r - row)) return false;
    }
    return true;
  }

  function getConflicts(queens, row, col) {
    const cf = [];
    for (let r = 0; r < row; r++) {
      const c = queens[r];
      if (c === col || Math.abs(c - col) === Math.abs(r - row)) cf.push([r, c]);
    }
    return cf;
  }

  async function solve(queens, row) {
    if (stopFlag) return;
    if (row === N) {
      solutions++;
      probStat('nq-solutions', solutions);
      buildBoard(queens);
      probSetDesc('nq', `<span style="color:var(--success)">✓ Solution #${solutions} found!</span>`);
      await probDelay(speed * 0.5);
      return;
    }
    for (let col = 0; col < N; col++) {
      if (stopFlag) return;
      steps++;
      probStat('nq-steps', steps);
      probStat('nq-time', Date.now() - startTime);
      const conflicts = getConflicts(queens, row, col);
      if (conflicts.length > 0) {
        buildBoard(queens, row, conflicts);
        probSetDesc('nq', `Row ${row}, Col ${col} — <span style="color:var(--danger)">conflict!</span> Backtracking…`);
        backtracks++;
        probStat('nq-backtracks', backtracks);
        await probDelay(speed);
        continue;
      }
      queens[row] = col;
      buildBoard(queens, row);
      probSetDesc('nq', `Placing queen at row <b>${row}</b>, col <b>${col}</b> — safe ✓`);
      await probDelay(speed);
      await solve(queens, row + 1);
      if (stopFlag) return;
      queens[row] = undefined;
    }
  }

  async function startSolve() {
    running = true; stopFlag = false;
    resetStats();
    startTime = Date.now();
    probSetStatus('nq', 'running', 'Running');
    startBtn.disabled = true;
    await solve(new Array(N), 0);
    running = false;
    startBtn.disabled = false;
    if (!stopFlag) {
      probSetStatus('nq', 'done', 'Done');
      probSetDesc('nq', `<span style="color:var(--success)">✓ Found ${solutions} solution${solutions!==1?'s':''} for ${N}-Queens</span>`);
      showToast(`${solutions} solution${solutions!==1?'s':''} found!`, 'success');
    }
  }

  buildBoard([]);
})();


// ════════════════════════════════════════════════════════════════════════════
// 2. 0/1 KNAPSACK
// ════════════════════════════════════════════════════════════════════════════
(function () {
  let capacity = 10, speed = 60, running = false, stopFlag = false;
  let items = [], dp = [], startTime = 0;

  const capSlider  = document.getElementById('ks-cap');
  const capDisp    = document.getElementById('ks-cap-display');
  const spSlider   = document.getElementById('ks-speed');
  const spDisp     = document.getElementById('ks-speed-display');
  const genBtn     = document.getElementById('ks-generate');
  const startBtn   = document.getElementById('ks-start');
  const resetBtn   = document.getElementById('ks-reset');
  const itemsList  = document.getElementById('ks-items-list');
  const tableEl    = document.getElementById('ks-table');

  capSlider?.addEventListener('input', () => { capacity = +capSlider.value; capDisp.textContent = capacity; });
  spSlider?.addEventListener('input',  () => { speed = +spSlider.value; spDisp.textContent = speed; });
  genBtn?.addEventListener('click',    () => { if (!running) generateItems(); });
  startBtn?.addEventListener('click',  () => { if (!running) startSolve(); });
  resetBtn?.addEventListener('click',  () => {
    stopFlag = true; running = false;
    generateItems();
    probSetStatus('ks','idle','Idle');
    probSetDesc('ks','Press ▶ Solve to fill the DP table');
    probStat('ks-max-val',0); probStat('ks-weight',0); probStat('ks-cells',0); probStat('ks-time',0);
  });

  function generateItems() {
    const n = 4 + Math.floor(Math.random() * 4);
    items = Array.from({length: n}, (_, i) => ({
      id: i+1,
      weight: 1 + Math.floor(Math.random() * Math.min(capacity, 8)),
      value:  2 + Math.floor(Math.random() * 18)
    }));
    renderItemsList([], []);
    buildEmptyTable();
  }

  function renderItemsList(selected, traceback) {
    if (!itemsList) return;
    itemsList.innerHTML = '';
    items.forEach(it => {
      const row = document.createElement('div');
      row.className = 'ks-item-row' + (selected.includes(it.id) ? ' selected' : '');
      row.innerHTML = `<span class="ks-item-badge">i${it.id}</span><span class="ks-item-info">w=<span>${it.weight}</span> v=<span>${it.value}</span></span>`;
      itemsList.appendChild(row);
    });
  }

  function buildEmptyTable() {
    if (!tableEl) return;
    const n = items.length;
    tableEl.innerHTML = '';
    // Header row
    const thead = tableEl.createTHead();
    const hr = thead.insertRow();
    hr.insertCell().textContent = 'i\\w';
    for (let w = 0; w <= capacity; w++) {
      const th = document.createElement('th'); th.textContent = w; hr.appendChild(th);
    }
    const tbody = tableEl.createTBody();
    for (let i = 0; i <= n; i++) {
      const row = tbody.insertRow();
      const lbl = row.insertCell();
      lbl.textContent = i === 0 ? '0' : `i${i}`;
      lbl.style.background = 'var(--bg-2)'; lbl.style.color = 'var(--text-dim)'; lbl.style.fontWeight = '600';
      for (let w = 0; w <= capacity; w++) {
        const td = row.insertCell();
        td.id = `ks-${i}-${w}`;
        td.textContent = '—';
      }
    }
  }

  function setCell(i, w, val, cls) {
    const td = document.getElementById(`ks-${i}-${w}`);
    if (!td) return;
    td.textContent = val;
    td.className = cls || '';
  }

  async function startSolve() {
    running = true; stopFlag = false;
    startTime = Date.now();
    probSetStatus('ks','running','Running');
    startBtn.disabled = true;
    const n = items.length;
    dp = Array.from({length: n+1}, () => new Array(capacity+1).fill(0));
    let cellsFilled = 0;

    // Init row 0
    for (let w = 0; w <= capacity; w++) setCell(0, w, 0, '');

    for (let i = 1; i <= n && !stopFlag; i++) {
      const item = items[i-1];
      for (let w = 0; w <= capacity && !stopFlag; w++) {
        setCell(i, w, '…', 'current');
        probSetDesc('ks', `Item ${i} (w=${item.weight}, v=${item.value}) — capacity ${w}`);
        await probDelay(speed);
        if (item.weight > w) {
          dp[i][w] = dp[i-1][w];
          probSetDesc('ks', `Item ${i} too heavy (${item.weight} > ${w}) — keep dp[${i-1}][${w}] = ${dp[i][w]}`);
        } else {
          const take = dp[i-1][w - item.weight] + item.value;
          const skip = dp[i-1][w];
          dp[i][w] = Math.max(take, skip);
          probSetDesc('ks', `Take: ${take} vs Skip: ${skip} → dp[${i}][${w}] = <b>${dp[i][w]}</b>`);
        }
        setCell(i, w, dp[i][w], '');
        cellsFilled++;
        probStat('ks-cells', cellsFilled);
        probStat('ks-time', Date.now() - startTime);
      }
    }

    if (!stopFlag) {
      // Traceback
      const selected = [];
      let w = capacity;
      for (let i = n; i > 0; i--) {
        if (dp[i][w] !== dp[i-1][w]) {
          selected.push(items[i-1].id);
          setCell(i, w, dp[i][w], 'traceback');
          w -= items[i-1].weight;
        }
      }
      const totalVal = dp[n][capacity];
      const totalW   = items.filter(it => selected.includes(it.id)).reduce((s,it) => s+it.weight, 0);
      renderItemsList(selected, []);
      probStat('ks-max-val', totalVal);
      probStat('ks-weight', totalW);
      probSetStatus('ks','done','Done');
      probSetDesc('ks', `<span style="color:var(--success)">✓ Max value = ${totalVal}, weight used = ${totalW}/${capacity}</span>`);
      showToast(`Knapsack solved! Max value: ${totalVal}`, 'success');
    }
    running = false; startBtn.disabled = false;
  }

  generateItems();
})();


// ════════════════════════════════════════════════════════════════════════════
// 3. COIN CHANGE
// ════════════════════════════════════════════════════════════════════════════
(function () {
  let amount = 15, speed = 60, running = false, stopFlag = false;
  let coins = [1,3,4,5], startTime = 0;

  const amtSlider  = document.getElementById('cc-amt');
  const amtDisp    = document.getElementById('cc-amt-display');
  const spSlider   = document.getElementById('cc-speed');
  const spDisp     = document.getElementById('cc-speed-display');
  const coinsInput = document.getElementById('cc-coins-input');
  const startBtn   = document.getElementById('cc-start');
  const resetBtn   = document.getElementById('cc-reset');
  const vizEl      = document.getElementById('cc-viz');

  amtSlider?.addEventListener('input', () => { amount = +amtSlider.value; amtDisp.textContent = amount; if (!running) renderEmpty(); });
  spSlider?.addEventListener('input',  () => { speed = +spSlider.value; spDisp.textContent = speed; });
  startBtn?.addEventListener('click',  () => { if (!running) startSolve(); });
  resetBtn?.addEventListener('click',  () => {
    stopFlag = true; running = false;
    renderEmpty();
    probSetStatus('cc','idle','Idle');
    probSetDesc('cc','Press ▶ Solve to animate the DP array');
    probStat('cc-min-coins','—'); probStat('cc-steps',0); probStat('cc-time',0); probStat('cc-coins-used','—');
  });

  function parseCoins() {
    const raw = coinsInput?.value || '1,3,4,5';
    const parsed = raw.split(/[\s,]+/).map(Number).filter(n => n > 0 && Number.isInteger(n));
    return [...new Set(parsed)].sort((a,b)=>a-b);
  }

  function renderEmpty() {
    coins = parseCoins();
    if (!vizEl) return;
    vizEl.innerHTML = '';
    // Coin row
    const coinRow = document.createElement('div');
    coinRow.className = 'cc-coins-row';
    coins.forEach(c => {
      const el = document.createElement('div');
      el.className = 'cc-coin'; el.textContent = c; el.id = `cc-coin-${c}`;
      coinRow.appendChild(el);
    });
    vizEl.appendChild(coinRow);
    // DP row
    const dpRow = document.createElement('div');
    dpRow.className = 'cc-dp-row';
    for (let i = 0; i <= amount; i++) {
      const wrap = document.createElement('div'); wrap.className = 'cc-cell-wrap';
      const cell = document.createElement('div'); cell.className = 'cc-cell'; cell.textContent = '∞'; cell.id = `cc-cell-${i}`;
      const idx  = document.createElement('div'); idx.className = 'cc-cell-idx'; idx.textContent = i;
      wrap.appendChild(cell); wrap.appendChild(idx);
      dpRow.appendChild(wrap);
    }
    vizEl.appendChild(dpRow);
  }

  function setDPCell(i, val, cls) {
    const el = document.getElementById(`cc-cell-${i}`);
    if (el) { el.textContent = val === Infinity ? '∞' : val; el.className = 'cc-cell ' + (cls||''); }
  }
  function setCoinActive(c, active) {
    const el = document.getElementById(`cc-coin-${c}`);
    if (el) el.className = 'cc-coin ' + (active ? 'active' : '');
  }

  async function startSolve() {
    coins = parseCoins();
    if (!coins.length) { showToast('Enter valid coin denominations', 'error'); return; }
    running = true; stopFlag = false;
    startTime = Date.now();
    probSetStatus('cc','running','Running');
    startBtn.disabled = true;
    renderEmpty();

    const INF = Infinity;
    const dp = new Array(amount + 1).fill(INF);
    const from = new Array(amount + 1).fill(-1);
    dp[0] = 0;
    setDPCell(0, 0, 'base');
    let steps = 0;

    for (let i = 1; i <= amount && !stopFlag; i++) {
      setDPCell(i, '…', 'current');
      for (const c of coins) {
        if (stopFlag) break;
        setCoinActive(c, true);
        probSetDesc('cc', `dp[${i}]: trying coin <b>${c}</b> — dp[${i-c}]=${dp[i-c]===INF?'∞':dp[i-c]}`);
        await probDelay(speed);
        if (i - c >= 0 && dp[i-c] !== INF && dp[i-c] + 1 < dp[i]) {
          dp[i] = dp[i-c] + 1;
          from[i] = c;
          setDPCell(i, dp[i], 'current');
        }
        setCoinActive(c, false);
        steps++;
        probStat('cc-steps', steps);
        probStat('cc-time', Date.now() - startTime);
      }
      setDPCell(i, dp[i] === INF ? '∞' : dp[i], dp[i] === INF ? '' : 'filled');
    }

    if (!stopFlag) {
      if (dp[amount] === INF) {
        probSetDesc('cc', `<span style="color:var(--danger)">✗ No solution — cannot make ${amount} with given coins</span>`);
        probStat('cc-min-coins', '✗');
        showToast('No solution possible', 'error');
      } else {
        // Traceback
        const used = [];
        let cur = amount;
        while (cur > 0) { used.push(from[cur]); setDPCell(cur, dp[cur], 'traceback'); cur -= from[cur]; }
        probStat('cc-min-coins', dp[amount]);
        probStat('cc-coins-used', used.join('+'));
        probSetDesc('cc', `<span style="color:var(--success)">✓ Min coins = ${dp[amount]}: [${used.join(', ')}]</span>`);
        showToast(`Min coins: ${dp[amount]}`, 'success');
      }
      probSetStatus('cc','done','Done');
    }
    running = false; startBtn.disabled = false;
  }

  renderEmpty();
})();


// ════════════════════════════════════════════════════════════════════════════
// 4. FIBONACCI DP
// ════════════════════════════════════════════════════════════════════════════
(function () {
  let N = 12, speed = 60, running = false, stopFlag = false;

  const nSlider  = document.getElementById('fib-n');
  const nDisp    = document.getElementById('fib-n-display');
  const spSlider = document.getElementById('fib-speed');
  const spDisp   = document.getElementById('fib-speed-display');
  const startBtn = document.getElementById('fib-start');
  const resetBtn = document.getElementById('fib-reset');
  const vizEl    = document.getElementById('fib-viz');

  nSlider?.addEventListener('input', () => { N = +nSlider.value; nDisp.textContent = N; if (!running) renderEmpty(); });
  spSlider?.addEventListener('input', () => { speed = +spSlider.value; spDisp.textContent = speed; });
  startBtn?.addEventListener('click', () => { if (!running) startSolve(); });
  resetBtn?.addEventListener('click', () => {
    stopFlag = true; running = false;
    renderEmpty();
    probSetStatus('fib','idle','Idle');
    probSetDesc('fib','Press ▶ Compute to animate the DP table');
    probStat('fib-result','—'); probStat('fib-calls',0); probStat('fib-naive',0); probStat('fib-time',0);
  });

  function naiveCalls(n) { return n <= 1 ? 1 : naiveCalls(n-1) + naiveCalls(n-2) + 1; }

  function renderEmpty() {
    if (!vizEl) return;
    vizEl.innerHTML = '';
    const label = document.createElement('div');
    label.className = 'fib-row-label';
    label.textContent = `Fibonacci DP Table — F(0) to F(${N})`;
    vizEl.appendChild(label);
    const cells = document.createElement('div');
    cells.className = 'fib-cells';
    for (let i = 0; i <= N; i++) {
      const wrap = document.createElement('div'); wrap.className = 'fib-cell-wrap';
      const cell = document.createElement('div'); cell.className = 'fib-cell'; cell.textContent = '?'; cell.id = `fib-cell-${i}`;
      const idx  = document.createElement('div'); idx.className = 'fib-cell-idx'; idx.textContent = i;
      wrap.appendChild(cell); wrap.appendChild(idx);
      cells.appendChild(wrap);
    }
    vizEl.appendChild(cells);
  }

  function setFibCell(i, val, cls) {
    const el = document.getElementById(`fib-cell-${i}`);
    if (el) { el.textContent = val; el.className = 'fib-cell ' + (cls||''); }
  }

  async function startSolve() {
    running = true; stopFlag = false;
    const startTime = Date.now();
    probSetStatus('fib','running','Running');
    startBtn.disabled = true;
    renderEmpty();

    const dp = new Array(N+1).fill(0);
    dp[0] = 0; dp[1] = 1;
    setFibCell(0, 0, 'base');
    setFibCell(1, 1, 'base');
    probSetDesc('fib', 'Base cases: F(0)=0, F(1)=1');
    await probDelay(speed);

    for (let i = 2; i <= N && !stopFlag; i++) {
      setFibCell(i, '…', 'current');
      probSetDesc('fib', `F(${i}) = F(${i-1}) + F(${i-2}) = ${dp[i-1]} + ${dp[i-2]}`);
      await probDelay(speed);
      dp[i] = dp[i-1] + dp[i-2];
      setFibCell(i, dp[i], 'filled');
      probStat('fib-calls', i-1);
      probStat('fib-time', Date.now() - startTime);
    }

    if (!stopFlag) {
      setFibCell(N, dp[N], 'base');
      const naive = naiveCalls(N);
      probStat('fib-result', dp[N]);
      probStat('fib-calls', N-1);
      probStat('fib-naive', naive);
      probSetStatus('fib','done','Done');
      probSetDesc('fib', `<span style="color:var(--success)">✓ F(${N}) = ${dp[N]}</span> — DP used <b>${N-1}</b> calls vs naive <b>${naive}</b>`);
      showToast(`F(${N}) = ${dp[N]}`, 'success');
    }
    running = false; startBtn.disabled = false;
  }

  renderEmpty();
})();


// ════════════════════════════════════════════════════════════════════════════
// 6. ACTIVITY SELECTION
// ════════════════════════════════════════════════════════════════════════════
(function () {
  let numAct = 8, speed = 60, running = false, stopFlag = false;
  let activities = [], startTime = 0;

  const nSlider  = document.getElementById('act-n');
  const nDisp    = document.getElementById('act-n-display');
  const spSlider = document.getElementById('act-speed');
  const spDisp   = document.getElementById('act-speed-display');
  const genBtn   = document.getElementById('act-generate');
  const startBtn = document.getElementById('act-start');
  const resetBtn = document.getElementById('act-reset');
  const vizEl    = document.getElementById('act-viz');

  nSlider?.addEventListener('input', () => { numAct = +nSlider.value; nDisp.textContent = numAct; if (!running) generateActivities(); });
  spSlider?.addEventListener('input', () => { speed = +spSlider.value; spDisp.textContent = speed; });
  genBtn?.addEventListener('click',   () => { if (!running) generateActivities(); });
  startBtn?.addEventListener('click', () => { if (!running) startSolve(); });
  resetBtn?.addEventListener('click', () => {
    stopFlag = true; running = false;
    generateActivities();
    probSetStatus('act','idle','Idle');
    probSetDesc('act','Press ▶ Select to run the greedy algorithm');
    probStat('act-selected',0); probStat('act-rejected',0); probStat('act-total',0); probStat('act-time',0);
  });

  const TIMELINE = 20; // max time units

  function generateActivities() {
    activities = [];
    for (let i = 0; i < numAct; i++) {
      const s = Math.floor(Math.random() * (TIMELINE - 2));
      const e = s + 1 + Math.floor(Math.random() * 5);
      activities.push({ id: i+1, start: s, end: Math.min(e, TIMELINE) });
    }
    // Sort by finish time (greedy order)
    activities.sort((a,b) => a.end - b.end);
    probStat('act-total', numAct);
    renderBars(activities.map(() => 'idle'));
  }

  function renderBars(states) {
    if (!vizEl) return;
    vizEl.innerHTML = '';
    // Time axis header
    const header = document.createElement('div');
    header.className = 'act-timeline-header';
    for (let t = 0; t <= TIMELINE; t += 4) {
      const span = document.createElement('span');
      span.textContent = t;
      span.style.flex = t === 0 ? '0 0 0' : '4';
      span.style.textAlign = 'center';
      header.appendChild(span);
    }
    vizEl.appendChild(header);

    activities.forEach((act, i) => {
      const row = document.createElement('div'); row.className = 'act-row';
      const label = document.createElement('div');
      label.className = 'act-label';
      label.textContent = `A${act.id} [${act.start},${act.end})`;
      const track = document.createElement('div'); track.className = 'act-track';
      const bar = document.createElement('div');
      bar.className = 'act-bar ' + (states[i] || 'idle');
      bar.style.left  = `${(act.start / TIMELINE) * 100}%`;
      bar.style.width = `${((act.end - act.start) / TIMELINE) * 100}%`;
      bar.textContent = `A${act.id}`;
      track.appendChild(bar);
      row.appendChild(label); row.appendChild(track);
      vizEl.appendChild(row);
    });
  }

  async function startSolve() {
    running = true; stopFlag = false;
    startTime = Date.now();
    probSetStatus('act','running','Running');
    startBtn.disabled = true;

    const states = activities.map(() => 'idle');
    const selected = [];
    let lastEnd = 0, rejected = 0;

    for (let i = 0; i < activities.length && !stopFlag; i++) {
      const act = activities[i];
      states[i] = 'current';
      renderBars(states);
      probSetDesc('act', `Considering A${act.id} [${act.start}, ${act.end}) — last end = ${lastEnd}`);
      await probDelay(speed);

      if (act.start >= lastEnd) {
        states[i] = 'selected';
        selected.push(act);
        lastEnd = act.end;
        probSetDesc('act', `<span style="color:var(--success)">✓ Selected A${act.id}</span> — no conflict, finish time = ${act.end}`);
        probStat('act-selected', selected.length);
      } else {
        states[i] = 'rejected';
        rejected++;
        probSetDesc('act', `<span style="color:var(--danger)">✗ Rejected A${act.id}</span> — overlaps (start ${act.start} < last end ${lastEnd})`);
        probStat('act-rejected', rejected);
      }
      renderBars(states);
      probStat('act-time', Date.now() - startTime);
      await probDelay(speed);
    }

    if (!stopFlag) {
      probSetStatus('act','done','Done');
      probSetDesc('act', `<span style="color:var(--success)">✓ Selected ${selected.length} activities: ${selected.map(a=>'A'+a.id).join(', ')}</span>`);
      showToast(`${selected.length} activities selected`, 'success');
    }
    running = false; startBtn.disabled = false;
  }

  generateActivities();
})();
