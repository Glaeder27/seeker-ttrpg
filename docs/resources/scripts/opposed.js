/*v1.0 2025-08-04T14:44:31.932Z*/

$('#btnResolve')?.addEventListener('click', () => {
    const a = { ad: +$('#atkAD')?.value, risk: +$('#atkRisk')?.value, esc: +$('#atkEsc')?.value, thr: +$('#atkThresh')?.value };
    const d = { ad: +$('#defAD')?.value, risk: +$('#defRisk')?.value, esc: +$('#defEsc')?.value, thr: +$('#defThresh')?.value };
    const aRoll = rollD6(Math.max(0, a.ad - a.risk) + a.esc);
    const dRoll = rollD6(Math.max(0, d.ad - d.risk) + d.esc);
    const aSucc = aRoll.filter(x => x >= a.thr).length;
    const dSucc = dRoll.filter(x => x >= d.thr).length;
    let out = `Attacker [${aRoll.join(', ')}] ⇒ ${aSucc} vs Defender [${dRoll.join(', ')}] ⇒ ${dSucc}. `;
    if (aSucc > dSucc) out += 'Attacker succeeds.';
    else if (dSucc > aSucc) out += 'Defense prevails.';
    else out += 'Tie — defense prevails.';
    $('#oppResult').textContent = out;
});