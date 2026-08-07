document.querySelectorAll('.password-toggle').forEach((button) => {
  const wrapper = button.closest('.password-field');
  const input = wrapper.querySelector('input');

  button.addEventListener('click', () => {
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    button.classList.toggle('is-visible', !showing);
    button.setAttribute('aria-label', showing ? 'Afficher le mot de passe' : 'Masquer le mot de passe');
    button.title = showing ? 'Afficher le mot de passe' : 'Masquer le mot de passe';
  });
});
