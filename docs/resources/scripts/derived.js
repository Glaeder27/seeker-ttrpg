/*v1.0 2025-08-04T14:44:31.932Z*/

function recalcLoad() {
    let wt = 0;
    $$('#gearTable tr').forEach(tr => { 
        const v = parseFloat(tr.children[3]?.querySelector('input')?.value || '0'); 
        wt += isNaN(v) ? 0 : v; 
    });
    $('#loadCurrent').value = wt.toFixed(1);
}
new MutationObserver(recalcLoad).observe($('#gearTable'), { childList: true, subtree: true });
$('#gearTable').addEventListener('input', recalcLoad);

// Boot
load(); recalcLoad();