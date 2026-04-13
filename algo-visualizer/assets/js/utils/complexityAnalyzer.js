// ===== Complexity Analyzer =====
// Detects best/average/worst case from actual run data and shows a clear breakdown.

function showComplexityAnalysis({ algo, n, e = 0, ops, elapsedMs, extra = [] }) {
  const info = ALGORITHM_INFO[algo];
  if (!info) return;

  // ── 1. Detect which case ─────────────────────────────────────────────────
  const detectedCase = info.detectCase
    ? info.detectCase({ comparisons: ops, nodesVisited: ops, totalNodes: n, n, e })
    : 'average';

  // ── 2. Re-render the complexity panel with the detected case highlighted ──
  updateAlgorithmInfo(algo, detectedCase);

  // ── 3. Build the result panel ─────────────────────────────────────────────
  const panel = document.getElementById('complexityResult');
  const grid  = document.getElementById('cxGrid');
  if (!panel || !grid) return;

  const caseInfo = info[detectedCase];
  const META = {
    best:    { label: 'Best Case',    icon: '✅', cls: 'good',    color: 'var(--success)' },
    average: { label: 'Average Case', icon: '⚡', cls: 'average', color: 'var(--warning)' },
    worst:   { label: 'Worst Case',   icon: '🔴', cls: 'bad',     color: 'var(--danger)'  },
  };
  const meta = META[detectedCase];

  // Theoretical ops for this case
  const eEst = e || Math.round(n * 1.5);
  const theorOps = caseInfo?.ops ? caseInfo.ops(n, eEst) : null;
  const pct = (theorOps && isFinite(theorOps) && theorOps > 0)
    ? Math.min(Math.round((ops / theorOps) * 100), 999)
    : null;

  grid.innerHTML = `
    <!-- Big verdict banner -->
    <div class="cxa-banner ${meta.cls}">
      <span class="cxa-icon">${meta.icon}</span>
      <div class="cxa-banner-text">
        <div class="cxa-case-label">${meta.label}</div>
        <div class="cxa-formula">${caseInfo?.time || info.timeComplexity}</div>
      </div>
    </div>

    <!-- Why this case -->
    <div class="cxa-why">
      <span class="cxa-why-label">Why:</span>
      <span class="cxa-why-text">${caseInfo?.condition || '—'}</span>
    </div>

    <!-- Actual vs theoretical ops -->
    <div class="cxa-ops-block">
      <div class="cxa-ops-row">
        <span class="cxa-ops-label">Actual ops</span>
        <span class="cxa-ops-val" style="color:${meta.color}">${ops.toLocaleString()}</span>
      </div>
      ${theorOps && isFinite(theorOps) ? `
      <div class="cxa-ops-row">
        <span class="cxa-ops-label">Theoretical (${detectedCase})</span>
        <span class="cxa-ops-val">${theorOps.toLocaleString()}</span>
      </div>
      ` : ''}
      ${pct !== null ? `
      <div class="cxa-ops-row">
        <span class="cxa-ops-label">% of theoretical</span>
        <span class="cxa-ops-val" style="color:${meta.color}">${pct}%</span>
      </div>
      <div class="cxa-bar-wrap">
        <div class="cxa-bar-fill ${meta.cls}" style="width:0%" data-target="${Math.max(4, Math.min(pct, 100))}"></div>
      </div>
      ` : ''}
    </div>

    <!-- Key metrics -->
    <div class="cxa-metrics">
      <div class="cxa-metric">
        <span class="cxa-metric-val">${n}</span>
        <span class="cxa-metric-label">Input (n)</span>
      </div>
      <div class="cxa-metric">
        <span class="cxa-metric-val">${ops.toLocaleString()}</span>
        <span class="cxa-metric-label">Operations</span>
      </div>
      <div class="cxa-metric">
        <span class="cxa-metric-val">${elapsedMs}ms</span>
        <span class="cxa-metric-label">Time</span>
      </div>
      <div class="cxa-metric">
        <span class="cxa-metric-val">${info.spaceComplexity}</span>
        <span class="cxa-metric-label">Space</span>
      </div>
    </div>

    <!-- All 3 cases comparison -->
    <div class="cxa-cases-title">All Cases</div>
    <div class="cxa-cases">
      ${['best','average','worst'].map(c => {
        const ci = info[c];
        const isActive = c === detectedCase;
        const cm = META[c];
        return `
          <div class="cxa-case-chip ${isActive ? 'active ' + cm.cls : ''}">
            <span class="cxa-chip-icon">${cm.icon}</span>
            <span class="cxa-chip-name">${cm.label}</span>
            <span class="cxa-chip-formula">${ci?.time || '—'}</span>
            ${isActive ? '<span class="cxa-chip-you">← You</span>' : ''}
          </div>
        `;
      }).join('')}
    </div>

    ${extra.length ? `
    <div class="cxa-extra">
      ${extra.map(ex => `
        <div class="cxa-extra-row">
          <span class="cxa-extra-label">${ex.label}</span>
          <span class="cxa-extra-val">${ex.value}</span>
        </div>
      `).join('')}
    </div>
    ` : ''}
  `;

  // Animate bar after render
  requestAnimationFrame(() => {
    const bar = grid.querySelector('.cxa-bar-fill');
    if (bar) bar.style.width = bar.dataset.target + '%';
  });

  panel.style.display = 'block';
}

function hideComplexityAnalysis() {
  const panel = document.getElementById('complexityResult');
  if (panel) panel.style.display = 'none';
  // Reset complexity panel — remove detected case highlight
  // We don't know the current algo here, so just remove active classes
  ['best', 'average', 'worst'].forEach(c => {
    document.getElementById(`cx-row-${c}`)?.classList.remove('cx-row-active');
  });
  // Remove detected banner if present
  document.querySelector('.cx-detected-banner')?.remove();
}
