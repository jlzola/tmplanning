(function () {
  const dialog = document.getElementById('reserve-dialog');
  if (!dialog) return;

  const form = document.getElementById('reserve-form');
  const cancelBtn = document.getElementById('reserve-cancel');
  const bandSelect = document.getElementById('reserve-band');
  const modeSelect = document.getElementById('reserve-mode');
  const operatorSelect = document.getElementById('reserve-operator');
  const frequencyInput = document.getElementById('reserve-frequency');

  const sessionId = document.getElementById('grid-table')?.dataset.sessionId;
  const lastOperatorKey = sessionId ? `tmplanning:last-operator:${sessionId}` : null;

  function openDialog(band, mode) {
    const fromRow = Boolean(band && mode);
    form.reset();
    if (band) bandSelect.value = band;
    if (mode) modeSelect.value = mode;

    const lastOperator = lastOperatorKey ? localStorage.getItem(lastOperatorKey) : null;
    const hasSavedOperator = Boolean(
      lastOperator && [...operatorSelect.options].some((o) => o.value === lastOperator)
    );
    if (hasSavedOperator) {
      operatorSelect.value = lastOperator;
    }

    dialog.showModal();

    if (!fromRow) {
      bandSelect.focus();
    } else if (hasSavedOperator) {
      frequencyInput.focus();
    } else {
      operatorSelect.focus();
    }
  }

  form.addEventListener('submit', () => {
    if (lastOperatorKey) localStorage.setItem(lastOperatorKey, operatorSelect.value);
  });

  const openBtn = document.getElementById('reserve-open-btn');
  if (openBtn) {
    openBtn.addEventListener('click', () => openDialog());
  }

  document.addEventListener('click', (event) => {
    const rowBtn = event.target.closest('.row-reserve-btn');
    if (!rowBtn) return;
    openDialog(rowBtn.dataset.band, rowBtn.dataset.mode);
  });

  cancelBtn.addEventListener('click', () => dialog.close());
})();
