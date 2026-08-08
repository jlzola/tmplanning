const refreshBtn = document.getElementById('refresh-btn');
const matrix = document.getElementById('bands-matrix');
const bandChart = document.getElementById('band-chart');
const sessionId = matrix?.dataset.sessionId;
const sessionEnded = matrix?.dataset.sessionEnded === 'true';

function refreshBandChart() {
  if (bandChart) window.refreshBandChartSrc();
}

function formatDateTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function freeCellHtml(item) {
  const band = escapeHtml(item.band);
  const mode = escapeHtml(item.mode);
  if (sessionEnded) {
    return `<div class="cell free cell-disabled" data-band="${band}" data-mode="${mode}" title="Session terminée">
      <span class="cell-dot" aria-hidden="true">·</span>
    </div>`;
  }
  return `<button type="button" class="cell free row-reserve-btn" data-band="${band}" data-mode="${mode}" title="Réserver ${band} · ${mode}">
    <span class="cell-dot" aria-hidden="true">·</span>
    <span class="cell-reserve" aria-hidden="true">+ Réserver</span>
  </button>`;
}

function releaseConfirmMessage(item) {
  const lines = [`Libérer le créneau de ${item.operator} ?`, '', `${item.band} · ${item.mode}`];
  if (item.locator) {
    lines.push(`${item.locator}${item.department ? ` (${item.department})` : ''}`);
  } else if (item.department) {
    lines.push(`(${item.department})`);
  }
  if (item.frequency) lines.push(`${item.frequency} kHz`);
  lines.push(`QRV depuis ${formatDateTime(item.qrvSince)}`);
  return lines.join('\n');
}

function busyCellHtml(item) {
  const band = escapeHtml(item.band);
  const mode = escapeHtml(item.mode);
  const locator = item.locator
    ? `${escapeHtml(item.locator)}${item.department ? ` (${escapeHtml(item.department)})` : ''}`
    : (item.department ? `(${escapeHtml(item.department)})` : '');
  const frequency = item.frequency ? `${escapeHtml(item.frequency)} kHz` : '';
  const confirmMessage = escapeHtml(releaseConfirmMessage(item));
  return `<div class="cell busy" data-band="${band}" data-mode="${mode}">
    <div class="cell-row">
      <span class="cell-call">${escapeHtml(item.operator)}</span>
      <span class="cell-info-right">${locator}</span>
    </div>
    <div class="cell-row">
      <span class="cell-info-left">${frequency}</span>
      <span class="cell-info-right">depuis ${formatDateTime(item.qrvSince)}</span>
    </div>
    <form method="POST" action="/sessions/${sessionId}/release" class="cell-qrt" data-confirm="${confirmMessage}">
      <input type="hidden" name="band" value="${band}">
      <input type="hidden" name="mode" value="${mode}">
      <button type="submit" class="btn-danger btn-small">QRT</button>
    </form>
  </div>`;
}

async function refreshGrid() {
  const res = await fetch(`/api/sessions/${sessionId}/bands`);
  if (!res.ok) return;
  const grid = await res.json();
  refreshBandChart();

  grid.forEach((item) => {
    const current = matrix.querySelector(
      `.cell[data-band="${CSS.escape(item.band)}"][data-mode="${CSS.escape(item.mode)}"]`
    );
    if (!current) return;
    current.outerHTML = item.free ? freeCellHtml(item) : busyCellHtml(item);
  });
}

if (refreshBtn) {
  refreshBtn.addEventListener('click', refreshGrid);
  setInterval(refreshGrid, 30000);
}
