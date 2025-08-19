/*v1.0 2025-08-04T14:44:31.932Z*/

const stanceActions = { Aggressive: 2, Defensive: 2, Evasive: 2, Inquisitive: 2, Balanced: 2, Mystic: 2 };
$$('input[name="stance"]').forEach(r => r.addEventListener('change', () => {
    $('#actionsPerRound').textContent = stanceActions[r.value] || 2;
}));