/*v1.0 2025-08-04T14:44:31.932Z*/

$$('nav [data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
        // Deseleziona tutti i tab
        $$('nav [data-tab]').forEach(b => b.setAttribute('aria-selected', 'false'));
        btn.setAttribute('aria-selected', 'true');

        const id = btn.getAttribute('data-tab');

        $$('section[data-panel]').forEach(p => {
            if (p.getAttribute('data-panel') === 'general') {
                p.classList.remove('hidden');
            } else {
                p.classList.toggle('hidden', p.getAttribute('data-panel') !== id);
            }
        });
    });
});
