(function () {
  const link = document.getElementById('manage-link');
  const dialog = document.getElementById('password-dialog');
  if (!link || !dialog) return;

  const locked = link.dataset.locked === 'true';
  if (!locked) return;

  const sessionId = link.dataset.sessionId;
  const form = document.getElementById('password-form');
  const input = document.getElementById('password-input');
  const errorEl = document.getElementById('password-error');
  const cancelBtn = document.getElementById('password-cancel');

  function openDialog() {
    errorEl.hidden = true;
    input.value = '';
    dialog.showModal();
    input.focus();
  }

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
    input.value = '';
    input.focus();
  }

  async function submitPassword(password) {
    try {
      const res = await fetch(`/sessions/${sessionId}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.ok) {
        window.location.href = data.redirect;
      } else {
        showError(data.error || 'Mot de passe incorrect');
      }
    } catch (err) {
      showError('Erreur réseau, réessayez');
    }
  }

  link.addEventListener('click', (event) => {
    event.preventDefault();
    openDialog();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitPassword(input.value);
  });

  cancelBtn.addEventListener('click', () => dialog.close());

  const params = new URLSearchParams(window.location.search);
  if (params.get('locked') === '1') openDialog();
})();
