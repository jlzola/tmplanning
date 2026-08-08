(function () {
  const HF_BANDS = ['80m', '60m', '40m', '30m', '20m', '17m', '15m', '12m', '10m'];
  const VHF_UHF_BANDS = ['6m', '2m', '70cm', '23cm'];

  const openBtn = document.getElementById('share-open-btn');
  const dialog = document.getElementById('share-dialog');
  if (!openBtn || !dialog) return;

  const sessionId = openBtn.dataset.sessionId;
  const form = document.getElementById('share-form');
  const errorEl = document.getElementById('share-error');
  const linkRow = document.getElementById('share-link-row');
  const linkInput = document.getElementById('share-link-input');
  const openLink = document.getElementById('share-open-link');
  const copyBtn = document.getElementById('share-copy-btn');
  const copiedEl = document.getElementById('share-copied');
  const closeBtn = document.getElementById('share-close-btn');
  const saveBtn = document.getElementById('share-save-btn');
  const enabledRow = document.getElementById('share-enabled-row');
  const enabledInput = document.getElementById('share-enabled');
  const showUsageInput = document.getElementById('share-show-usage');
  const showStatusInput = document.getElementById('share-show-status');
  const bandCheckboxes = [...form.querySelectorAll('.share-band-checkbox')];
  const allBands = bandCheckboxes.map((cb) => cb.value);
  const hfBands = HF_BANDS.filter((band) => allBands.includes(band));
  const vhfUhfBands = VHF_UHF_BANDS.filter((band) => allBands.includes(band));

  function selectBands(bands) {
    bandCheckboxes.forEach((cb) => { cb.checked = bands.includes(cb.value); });
  }

  document.getElementById('share-band-all').addEventListener('click', () => selectBands(allBands));
  document.getElementById('share-band-none').addEventListener('click', () => selectBands([]));
  document.getElementById('share-band-hf').addEventListener('click', () => selectBands(hfBands));
  document.getElementById('share-band-vhf').addEventListener('click', () => selectBands(vhfUhfBands));

  let currentShare = null;
  try {
    currentShare = JSON.parse(openBtn.dataset.share || 'null');
  } catch {
    currentShare = null;
  }

  function shareLink(share) {
    return `${window.location.origin}/share/${share.token}`;
  }

  function applyShareToForm(share) {
    bandCheckboxes.forEach((cb) => { cb.checked = share.bands.includes(cb.value); });
    showUsageInput.checked = share.showUsage;
    showStatusInput.checked = share.showStatus;
    enabledInput.checked = share.enabled;
    enabledRow.hidden = false;
    saveBtn.textContent = 'Enregistrer';
    linkRow.hidden = false;
    linkInput.value = shareLink(share);
    openLink.href = shareLink(share);
  }

  function updateOpenButton(share) {
    const active = !!(share && share.enabled);
    openBtn.classList.toggle('share-active', active);
    openBtn.textContent = active ? '🔗 Partage actif' : '🔗 Partage';
  }

  function openDialog() {
    errorEl.hidden = true;
    copiedEl.hidden = true;
    if (currentShare) applyShareToForm(currentShare);
    dialog.showModal();
  }

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  async function submitForm() {
    const bands = bandCheckboxes.filter((cb) => cb.checked).map((cb) => cb.value);
    const showUsage = showUsageInput.checked;
    const showStatus = showStatusInput.checked;

    if (!bands.length) {
      showError('Sélectionnez au moins une bande');
      return;
    }

    if (!showUsage && !showStatus) {
      showError('Sélectionnez au moins un bloc à afficher (Utilisation des bandes et/ou État des bandes)');
      return;
    }

    const enabled = currentShare ? enabledInput.checked : true;

    try {
      const res = await fetch(`/sessions/${sessionId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bands, showUsage, showStatus, enabled })
      });
      const data = await res.json();
      if (!data.ok) {
        showError(data.error || 'Erreur lors de l’enregistrement');
        return;
      }
      currentShare = data.share;
      openBtn.dataset.share = JSON.stringify(currentShare);
      updateOpenButton(currentShare);
      applyShareToForm(currentShare);
      errorEl.hidden = true;
    } catch {
      showError('Erreur réseau, réessayez');
    }
  }

  openBtn.addEventListener('click', openDialog);
  closeBtn.addEventListener('click', () => dialog.close());

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitForm();
  });

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(linkInput.value);
      copiedEl.hidden = false;
      setTimeout(() => { copiedEl.hidden = true; }, 2000);
    } catch {
      linkInput.select();
    }
  });
})();
