/*v1.0 2025-08-04T14:44:31.932Z*/

const FIELDS = ['name', 'concept', 'origin', 'polarity', 'xp', 'hp', 'stress', 'solaria', 'risk', 'apt_might', 'apt_agility', 'apt_wits', 'apt_presence', 'apt_survival', 'apt_mystic', 'notes', 'loadLimit', 'navSpeed', 'navSupply', 'navWeather', 'navRisk'];

function save() {
    const data = {};
    FIELDS.forEach(id => data[id] = $('#' + id)?.value ?? null);
    data.tags = baseTags.map(t => ({ id: t.id, on: document.querySelector(`[data-tag="${t.id}"]`)?.checked }));
    data.stance = document.querySelector('input[name="stance"]:checked')?.value;
    data.tables = ['gearTable', 'weapTable', 'powerTable', 'hexTable'].map(tid => 
        $$('#' + tid + ' tr').map(tr => Array.from(tr.querySelectorAll('input')).map(i => i.value))
    );
    localStorage.setItem('seekerSheet', JSON.stringify(data));
    return data;
}

function load() {
    const raw = localStorage.getItem('seekerSheet'); if (!raw) return;
    const data = JSON.parse(raw);
    FIELDS.forEach(id => { if ($('#' + id)) $('#' + id).value = data[id] ?? $('#' + id).value; });
    if (data.tags) { data.tags.forEach(t => { const box = document.querySelector(`[data-tag="${t.id}"]`); if (box) box.checked = !!t.on; }); }
    if (data.stance) { const r = Array.from(document.querySelectorAll('input[name="stance"]')).find(x => x.value === data.stance); if (r) { r.checked = true; $('#actionsPerRound').textContent = stanceActions[r.value] || 2; } }
    ['gearTable', 'weapTable', 'powerTable', 'hexTable'].forEach((tid, idx) => {
        const body = $('#' + tid); body.innerHTML = '';
        (data.tables?.[idx] || []).forEach(row => { const tr = addRow(body, row.map(() => '')); row.forEach((val, i) => tr.children[i].querySelector('input').value = val); });
    });
}

$('#btnSave')?.addEventListener('click', () => { save(); flash('Saved to browser.'); });
$('#btnLoad')?.addEventListener('click', () => { load(); flash('Loaded from browser.'); });

// Export / Import
function dl(filename, text) {
    const a = document.createElement('a');
    a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(text);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

$('#btnExport')?.addEventListener('click', () => {
    const data = save();
    if (data) dl('seeker-character.json', JSON.stringify(data, null, 2));
});

$('#importFile')?.addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
        localStorage.setItem('seekerSheet', reader.result);
        load();
        flash('Imported.');
    };
    reader.readAsText(f);
});

// Print
$('#btnPrint')?.addEventListener('click', () => window.print());