(function () {
  const dialog = document.getElementById('reserve-dialog');
  if (!dialog) return;

  const form = document.getElementById('reserve-form');
  const cancelBtn = document.getElementById('reserve-cancel');
  const bandSelect = document.getElementById('reserve-band');
  const modeSelect = document.getElementById('reserve-mode');
  const operatorSelect = document.getElementById('reserve-operator');
  const frequencyInput = document.getElementById('reserve-frequency');

  const sessionId = document.getElementById('bands-matrix')?.dataset.sessionId;
  const lastOperatorKey = 'tmplanning:last-operator';
  const lastModeKey = `tmplanning:last-mode:${sessionId}`;
  const DEFAULT_MODE = 'SSB';

  function openDialog(band, mode) {
    const fromRow = Boolean(band && mode);
    form.reset();
    if (band) bandSelect.value = band;
    if (mode) {
      modeSelect.value = mode;
    } else {
      const savedMode = localStorage.getItem(lastModeKey);
      const hasSavedMode = Boolean(
        savedMode && [...modeSelect.options].some((o) => o.value === savedMode)
      );
      modeSelect.value = hasSavedMode ? savedMode : DEFAULT_MODE;
    }

    const lastOperator = localStorage.getItem(lastOperatorKey);
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
    localStorage.setItem(lastOperatorKey, operatorSelect.value);
    localStorage.setItem(lastModeKey, modeSelect.value);
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
