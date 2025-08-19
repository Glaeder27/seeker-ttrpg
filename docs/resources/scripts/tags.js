/*v1.0 2025-08-04T14:44:31.932Z*/

const baseTags = [
    { id: 'Combat', desc: 'anything that directly applies to fighting' },
    { id: 'Social', desc: 'interactions, influence, deception, empathy' },
    { id: 'Exploration', desc: 'travel, navigation, terrain, survival tasks' },
    { id: 'Knowledge', desc: 'academia, lore, decoding, research' },
    { id: 'Craft', desc: 'making, repairing, tinkering' },
    { id: 'Mystic', desc: 'rites, channeling, occult signs' }
];
const tagList = $('#tagList');
baseTags.forEach(t => {
    const el = document.createElement('label');
    el.className = 'flex items-center gap-2 text-sm';
    el.innerHTML = `<input type="checkbox" data-tag="${t.id}"> ${t.id} <span class="text-white/50">(${t.desc})</span>`;
    tagList.appendChild(el);
});
