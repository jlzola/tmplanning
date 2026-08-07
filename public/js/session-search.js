(() => {
  const searchInput = document.getElementById('session-search');
  const openOnlyToggle = document.getElementById('filter-open-only');
  const noResults = document.getElementById('no-results-message');
  const cards = Array.from(document.querySelectorAll('.session-card'));
  if (!searchInput || !cards.length) return;

  const entries = cards.map((card) => {
    const nameEl = card.querySelector('[data-hl="name"]');
    const creatorEl = card.querySelector('[data-hl="creator"]');
    if (nameEl) nameEl.dataset.original = nameEl.textContent;
    if (creatorEl) creatorEl.dataset.original = creatorEl.textContent;
    return { card, nameEl, creatorEl };
  });

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlight(el, query) {
    if (!el) return;
    const original = el.dataset.original ?? '';
    if (!query) {
      el.textContent = original;
      return;
    }
    const re = new RegExp(`(${escapeRegExp(query)})`, 'ig');
    el.innerHTML = original.replace(re, '<mark>$1</mark>');
  }

  function applyFilters() {
    const query = searchInput.value.trim();
    const q = query.toLowerCase();
    const openOnly = Boolean(openOnlyToggle?.checked);
    let visibleCount = 0;

    entries.forEach(({ card, nameEl, creatorEl }) => {
      const haystack = [card.dataset.name, card.dataset.operators, card.dataset.creator]
        .join(' ')
        .toLowerCase();

      const matchesQuery = !q || haystack.includes(q);
      const matchesStatus = !openOnly || card.dataset.status === 'ongoing';
      const visible = matchesQuery && matchesStatus;

      card.hidden = !visible;
      if (visible) visibleCount += 1;

      highlight(nameEl, q);
      highlight(creatorEl, q);
    });

    if (noResults) noResults.hidden = visibleCount !== 0;
  }

  searchInput.addEventListener('input', applyFilters);
  openOnlyToggle?.addEventListener('change', applyFilters);
})();
