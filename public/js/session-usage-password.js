(function () {
  const banner = document.getElementById('usage-readonly-banner');
  if (!banner) return;

  const sessionId = banner.dataset.sessionId;
  const dialog = document.getElementById('usage-password-dialog');
  const openBtn = document.getElementById('usage-unlock-btn');
  const form = document.getElementById('usage-password-form');
  const input = document.getElementById('usage-password-input');
  const errorEl = document.getElementById('usage-password-error');
  const cancelBtn = document.getElementById('usage-password-cancel');
  const storageKey = `tmplanning:usage-pw:${sessionId}`;

  // Simple obfuscation (pas un vrai chiffrement : sans clé secrète propre au
  // navigateur, il n'y a pas de moyen de chiffrer réellement côté client).
  // Ça évite juste que le mot de passe traîne en clair dans localStorage.
  function obfuscate(value) {
    return btoa(unescape(encodeURIComponent(value)));
  }

  function deobfuscate(value) {
    try {
      return decodeURIComponent(escape(atob(value)));
    } catch {
      return null;
    }
  }

  async function verify(password) {
    const res = await fetch(`/sessions/${sessionId}/verify-usage-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    return res.json();
  }

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
    input.value = '';
    input.focus();
  }

  function openDialog() {
    errorEl.hidden = true;
    input.value = '';
    dialog.showModal();
    input.focus();
  }

  openBtn.addEventListener('click', openDialog);
  cancelBtn.addEventListener('click', () => dialog.close());

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = input.value;

    try {
      const data = await verify(password);
      if (data.ok) {
        localStorage.setItem(storageKey, obfuscate(password));
        window.location.reload();
      } else {
        showError(data.error || 'Mot de passe incorrect');
      }
    } catch {
      showError('Erreur réseau, réessayez');
    }
  });

  async function tryAutoUnlock() {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;

    const password = deobfuscate(stored);
    if (!password) {
      localStorage.removeItem(storageKey);
      return;
    }

    try {
      const data = await verify(password);
      if (data.ok) {
        window.location.reload();
        return;
      }
      localStorage.removeItem(storageKey);
    } catch {
      // Réseau indisponible : la bannière reste affichée, l'utilisateur peut saisir manuellement.
    }
  }

  tryAutoUnlock();
})();
