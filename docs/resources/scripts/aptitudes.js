/*v1.0 2025-08-04T14:44:31.932Z*/

const aptMap = [
    ['Might', 'apt_might'], ['Agility', 'apt_agility'], ['Wits', 'apt_wits'], 
    ['Presence', 'apt_presence'], ['Survival', 'apt_survival'], ['Mystic', 'apt_mystic']
];
const adApt = $('#adApt');
aptMap.forEach(([name, id]) => {
    const op = document.createElement('option'); 
    op.value = id; 
    op.textContent = name; 
    adApt.appendChild(op);
});

function computeAD() {
    const apt = Number($('#' + adApt.value)?.value || 0);
    let risk = Number($('#adRisk')?.value || 0);
    const tags = Number($('#adTags')?.value || 0);
    const pol = $('#polarity')?.value;
    const polRule = $('#adPolarityRule')?.value;
    let successOn = 6;
    if (polRule === 'riskmod') {
        if (pol === 'Sun') risk = Math.max(0, risk - 1);
        if (pol === 'Shade') risk = risk + 1;
    } else if (polRule === 'thresh') {
        if (pol === 'Sun') successOn = 5;
        if (pol === 'Shade') successOn = 6;
    }
    const total = Math.max(0, apt + tags - risk);
    $('#adTotal').textContent = total;
    $('#adSuccessOn').textContent = successOn === 5 ? '5–6' : '6';
    return { total, successOn };
}
['change', 'input'].forEach(ev => {
    ['#adRisk', '#adTags', ...aptMap.map(a => '#' + a[1]), '#adPolarityRule', '#polarity'].forEach(sel => {
        const el = $(sel);
        if (el) el.addEventListener(ev, computeAD);
    });
});
computeAD();

// Simple dice roller
function rollD6(n) { return Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 6)); }
$('#btnRollAD')?.addEventListener('click', () => {
    const { total, successOn } = computeAD();
    const r = rollD6(total);
    const succ = r.filter(x => x >= (successOn === 5 ? 5 : 6)).length;
    $('#rollResult').textContent = `Rolled [${r.join(', ')}] ⇒ Successes: ${succ}`;
});