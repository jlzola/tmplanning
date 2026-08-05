const refreshBtn = document.getElementById('refresh-btn');
const table = document.getElementById('grid-table');
const sessionId = table?.dataset.sessionId;

async function refreshGrid() {
  const res = await fetch(`/api/sessions/${sessionId}/bands`);
  if (!res.ok) return;
  const grid = await res.json();
  const rows = table.tBodies[0].rows;

  grid.forEach((item, i) => {
    const row = rows[i];
    if (!row) return;
    row.className = item.free ? 'free' : 'busy';
    row.cells[2].innerHTML = `<span class="chip chip-${item.free ? 'free' : 'busy'}">${item.free ? 'Libre' : 'Occupée'}</span>`;
    row.cells[3].textContent = item.operator ?? '';
    row.cells[4].textContent = item.locator ?? '';
    row.cells[5].textContent = item.department ?? '';
    row.cells[6].textContent = item.frequency ?? '';
    row.cells[7].textContent = item.qrvSince ?? '';

    const actionCell = row.cells[8];
    actionCell.innerHTML = '';
    if (!item.free) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `/sessions/${sessionId}/release`;
      form.innerHTML = `
        <input type="hidden" name="band" value="${item.band}">
        <input type="hidden" name="mode" value="${item.mode}">
        <button type="submit" class="btn-danger btn-small">QRT</button>
      `;
      actionCell.appendChild(form);
    }
  });
}

if (refreshBtn) {
  refreshBtn.addEventListener('click', refreshGrid);
  setInterval(refreshGrid, 30000);
}
