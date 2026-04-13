// ===== Main JS — shared init, theme, navbar =====

document.addEventListener('DOMContentLoaded', async () => {
  // Load navbar
  const navbarEl = document.getElementById('navbar-container');
  if (navbarEl) {
    const res = await fetch('components/navbar.html');
    navbarEl.innerHTML = await res.text();
    initNavbar();
  }

  // Load footer
  const footerEl = document.getElementById('footer-container');
  if (footerEl) {
    const res = await fetch('components/footer.html');
    footerEl.innerHTML = await res.text();
  }
});

function initNavbar() {
  // Theme
  const themeBtn = document.getElementById('themeToggle');
  const saved = localStorage.getItem('theme') || 'dark';
  applyTheme(saved);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = document.body.classList.contains('light') ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem('theme', next);
    });
  }

  // Hamburger
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // Active link
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Sidebar toggle (mobile)
  const sidebarToggle = document.getElementById('sidebarToggle');
  const mainSidebar   = document.getElementById('mainSidebar');
  if (sidebarToggle && mainSidebar) {
    sidebarToggle.addEventListener('click', () => {
      const open = mainSidebar.classList.toggle('open');
      sidebarToggle.classList.toggle('open', open);
    });
  }

  // Close nav on link click (mobile)
  document.querySelectorAll('.navbar-links a').forEach(a => {
    a.addEventListener('click', () => {
      document.getElementById('navLinks')?.classList.remove('open');
    });
  });
}

function applyTheme(theme) {
  const btn = document.getElementById('themeToggle');
  if (theme === 'light') {
    document.body.classList.add('light');
    if (btn) btn.textContent = '☀️';
  } else {
    document.body.classList.remove('light');
    if (btn) btn.textContent = '🌙';
  }
}

// ===== Shared UI helpers =====

function setStatus(state, text) {
  const badge = document.getElementById('statusBadge');
  const label = document.getElementById('statusText');
  if (!badge || !label) return;
  badge.className = `status-badge ${state}`;
  label.textContent = text;
}

function updateAlgorithmInfo(algoKey, detectedCase = null) {
  const info = ALGORITHM_INFO[algoKey];
  const panel = document.getElementById('algoInfo');
  if (!panel || !info) return;

  const BADGE = {
    best:    `<span class="cx-inline-badge best">✓ Best Case</span>`,
    average: `<span class="cx-inline-badge average">⚡ Average Case</span>`,
    worst:   `<span class="cx-inline-badge worst">⚠ Worst Case</span>`,
  };

  // Pick the time formula to display - show actual detected case
  let timeFormula = info.timeComplexity;
  let timeBadge   = '';
  let caseNote    = '';
  
  if (detectedCase && info[detectedCase]) {
    timeFormula = info[detectedCase].time;
    timeBadge   = BADGE[detectedCase];
    caseNote    = `<div class="complexity-note">${info[detectedCase].condition}</div>`;
  }

  panel.innerHTML = `
    <div class="complexity-row ${detectedCase ? 'detected-case' : ''}">
      <span class="complexity-label">Time</span>
      <span class="complexity-value">${timeFormula}</span>
    </div>
    ${detectedCase ? `<div class="complexity-badge-row">${timeBadge}</div>` : ''}
    ${caseNote}
    <div class="complexity-row">
      <span class="complexity-label">Space</span>
      <span class="complexity-value">${info.spaceComplexity}</span>
    </div>
    ${detectedCase ? `
    <div class="complexity-divider">All Cases</div>
    <div class="complexity-row compact ${detectedCase === 'best' ? 'active-case' : ''}">
      <span class="complexity-label">Best</span>
      <span class="complexity-value">${info.best?.time || '—'}</span>
    </div>
    <div class="complexity-row compact ${detectedCase === 'average' ? 'active-case' : ''}">
      <span class="complexity-label">Average</span>
      <span class="complexity-value">${info.average?.time || '—'}</span>
    </div>
    <div class="complexity-row compact ${detectedCase === 'worst' ? 'active-case' : ''}">
      <span class="complexity-label">Worst</span>
      <span class="complexity-value">${info.worst?.time || '—'}</span>
    </div>
    ` : ''}
    <p class="algo-desc">${info.description}</p>
  `;
}

function updateStatistics(data) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.textContent = typeof val === 'number' && !Number.isInteger(val) ? val.toFixed(1) : val;
  };
  set('comparisons', data.comparisons);
  set('swaps', data.swaps);
  set('nodesVisited', data.nodesVisited);
  set('pathLength', data.pathLength);
  set('bestDistance', data.bestDistance !== undefined ? Math.round(data.bestDistance) : undefined);
  set('routesChecked', data.routesChecked);
}

function updateTime(startTime) {
  const el = document.getElementById('time');
  if (el) el.textContent = Date.now() - startTime;
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
