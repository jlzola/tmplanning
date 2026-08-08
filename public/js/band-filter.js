(function () {
  const HF_BANDS = ['80m', '60m', '40m', '30m', '20m', '17m', '15m', '12m', '10m'];
  const VHF_UHF_BANDS = ['6m', '2m', '70cm', '23cm'];

  const filter = document.getElementById('band-filter');
  const bandChart = document.getElementById('band-chart');
  const matrix = document.getElementById('bands-matrix');
  const reserveBandSelect = document.getElementById('reserve-band');
  if (!filter || !bandChart || !matrix) return;

  const sessionId = matrix.dataset.sessionId;
  const STORAGE_KEY = `tmplanning:visible-bands:${sessionId}`;
  const checkboxes = [...filter.querySelectorAll('input[type="checkbox"]')];
  const allBands = checkboxes.map((cb) => cb.value);
  const hfBands = HF_BANDS.filter((band) => allBands.includes(band));
  const vhfUhfBands = VHF_UHF_BANDS.filter((band) => allBands.includes(band));
  let visibleBands = allBands;

  function loadSavedBands() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved)) return saved.filter((band) => allBands.includes(band));
    } catch {
      // préférence corrompue en localStorage : on revient à l'affichage par défaut
    }
    return hfBands;
  }

  window.refreshBandChartSrc = function refreshBandChartSrc() {
    const query = visibleBands.length < allBands.length
      ? `&bands=${visibleBands.map(encodeURIComponent).join(',')}`
      : '';
    bandChart.src = `/sessions/${sessionId}/bands.svg?t=${Date.now()}${query}`;
  };

  function updateReserveBandOptions(bands) {
    if (!reserveBandSelect) return;
    const previousValue = reserveBandSelect.value;
    const orderedBands = allBands.filter((band) => bands.includes(band));
    reserveBandSelect.innerHTML = orderedBands
      .map((band) => `<option value="${band}">${band}</option>`)
      .join('');
    if (orderedBands.includes(previousValue)) reserveBandSelect.value = previousValue;
  }

  function apply(bands) {
    visibleBands = bands;
    checkboxes.forEach((cb) => { cb.checked = bands.includes(cb.value); });
    matrix.querySelectorAll('.matrix-row').forEach((row) => {
      row.style.display = bands.includes(row.dataset.band) ? '' : 'none';
    });
    updateReserveBandOptions(bands);
    window.refreshBandChartSrc();
  }

  function select(bands) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bands));
    apply(bands);
  }

  filter.addEventListener('change', (event) => {
    if (event.target.type !== 'checkbox') return;
    select(checkboxes.filter((cb) => cb.checked).map((cb) => cb.value));
  });

  document.getElementById('band-filter-all').addEventListener('click', () => select(allBands));
  document.getElementById('band-filter-none').addEventListener('click', () => select([]));
  document.getElementById('band-filter-hf').addEventListener('click', () => select(hfBands));
  document.getElementById('band-filter-vhf').addEventListener('click', () => select(vhfUhfBands));

  apply(loadSavedBands());
})();
