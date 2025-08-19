/*v1.0 2025-08-04T14:44:31.932Z*/
 
function addRow(tbody, cols) {
    const tr = document.createElement('tr');
    cols.forEach((c, i) => {
        const td = document.createElement('td'); td.className = 'p-1';
        const inp = document.createElement('input');
        inp.className = 'w-full px-2 py-1 rounded-lg bg-black/30 border border-white/10';
        inp.placeholder = c;
        td.appendChild(inp); tr.appendChild(td);
    });
    tbody.appendChild(tr);
    return tr;
}
$('#addGear')?.addEventListener('click', () => addRow($('#gearTable'), ['Item', 'Tags', 'Notes', 'Wt']));
$('#addWeap')?.addEventListener('click', () => addRow($('#weapTable'), ['Weapon', 'Reach', 'Tags', 'Notes']));
$('#addPower')?.addEventListener('click', () => addRow($('#powerTable'), ['Rite / Power', 'Cost', 'Tags', 'Effect']));
$('#addHex')?.addEventListener('click', () => addRow($('#hexTable'), ['A1', 'coast', 'ruins', 'hostile', '...']));

// Load starting rows
for (let i = 0; i < 2; i++) { $('#addGear')?.click(); $('#addWeap')?.click(); $('#addPower')?.click(); }