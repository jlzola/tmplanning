const refreshBtn = document.getElementById('refresh-btn');
const table = document.getElementById('grid-table');
const bandChart = document.getElementById('band-chart');
const sessionId = table?.dataset.sessionId;

function refreshBandChart() {
  if (bandChart) window.refreshBandChartSrc();
}

function formatDateTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function refreshGrid() {
  const res = await fetch(`/api/sessions/${sessionId}/bands`);
  if (!res.ok) return;
  const grid = await res.json();
  const rows = table.tBodies[0].rows;
  refreshBandChart();

  grid.forEach((item, i) => {
    const row = rows[i];
    if (!row) return;
    row.className = item.free ? 'free' : 'busy';
    row.cells[2].innerHTML = `<span class="chip chip-${item.free ? 'free' : 'busy'}">${item.free ? 'Libre' : 'Occupée'}</span>`;
    row.cells[3].textContent = item.operator ?? '';
    row.cells[4].textContent = item.locator ?? '';
    row.cells[5].textContent = item.department ?? '';
    row.cells[6].textContent = item.frequency ?? '';
    row.cells[7].textContent = formatDateTime(item.qrvSince);

    const actionCell = row.cells[8];
    actionCell.innerHTML = '';
    if (item.free) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-secondary btn-small row-action-btn row-reserve-btn';
      btn.dataset.band = item.band;
      btn.dataset.mode = item.mode;
      btn.textContent = 'Réserver';
      actionCell.appendChild(btn);
    } else {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `/sessions/${sessionId}/release`;
      form.innerHTML = `
        <input type="hidden" name="band" value="${item.band}">
        <input type="hidden" name="mode" value="${item.mode}">
        <button type="submit" class="btn-danger btn-small row-action-btn">QRT</button>
      `;
      actionCell.appendChild(form);
    }
  });
}

if (refreshBtn) {
  refreshBtn.addEventListener('click', refreshGrid);
  setInterval(refreshGrid, 30000);
}
