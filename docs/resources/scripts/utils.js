/*v1.0 2025-08-04T14:44:31.932Z*/

// --- State helpers
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const $ = (sel, ctx = document) => ctx.querySelector(sel);

// Small UI flash
const flashBox = document.createElement('div');
flashBox.className = 'fixed noprint bottom-6 left-1/2 -translate-x-1/2 bg-white/10 text-white/90 backdrop-blur px-4 py-2 rounded-xl border border-white/20 hidden';
document.body.appendChild(flashBox);
function flash(msg) { 
    flashBox.textContent = msg; 
    flashBox.classList.remove('hidden'); 
    setTimeout(() => flashBox.classList.add('hidden'), 1500); 
}

// Oath Heraldry
const oathSelect = document.getElementById('oath');
const oathImg = document.getElementById('oathImg');
const namePrefix = document.getElementById('namePrefix');

oathSelect.addEventListener('change', () => {
    const val = oathSelect.value;

    // Aggiorna l'araldica
    const iconMap = {
        england: '/assets/images/webp/allegiance/allegiance-crown-of-england.webp',
        spain: '/assets/images/webp/allegiance/allegiance-crown-of-spain.webp',
        papacy: '/assets/images/webp/allegiance/allegiance-papacy.webp'
    };
    if (val) {
        oathImg.src = iconMap[val] || '';
        oathImg.classList.remove('hidden');
    } else {
        oathImg.src = '';
        oathImg.classList.add('hidden');
    }

    // Aggiorna il prefisso
    if (val === 'england') {
        namePrefix.textContent = 'Seeker';
    } else if (val === 'spain') {
        namePrefix.textContent = 'Buscador';
    } else if (val === 'papacy') {
        namePrefix.textContent = 'Inquisitor';
    } else {
        namePrefix.textContent = '';
    }
});

//Aptitude Icons
document.querySelectorAll('.aptitude-input-wrapper').forEach(wrapper => {
    const img = wrapper.dataset.icon;
    wrapper.style.setProperty('--icon-url', `url('${img}')`);
});