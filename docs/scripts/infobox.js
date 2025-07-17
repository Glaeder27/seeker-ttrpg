(() => {

    const DEFINITIONS_URL = 'https://glaeder27.github.io/seeker-ttrpg/data/tooltipDefinitions.json';
    let tooltipDefinitions = {};

    const tooltip = document.createElement('div');
    tooltip.className = 'global-tooltip';
    tooltip.style.cssText = `
    position: fixed; pointer-events: none; opacity: 0; visibility: hidden;
    transition: opacity .2s;
  `;
    tooltip.innerHTML = `
    <div class="tooltip-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </div>
    <div class="tooltip-content-wrapper"></div>
  `;
    document.body.appendChild(tooltip);
    const tooltipContentWrapper = tooltip.querySelector('.tooltip-content-wrapper');

    function showTooltip(targetEl, html) {
        tooltipContentWrapper.innerHTML = html;
        const rect = targetEl.getBoundingClientRect();
        tooltip.style.left = `${rect.left}px`;
        tooltip.style.top = `${rect.bottom + 8}px`;
        tooltip.style.visibility = 'visible';
        tooltip.style.opacity = '1';
        tooltip.style.pointerEvents = 'auto';
    }
    function hideTooltip() {
        tooltip.style.opacity = '0';
        tooltip.style.pointerEvents = 'none';
        setTimeout(() => { if (tooltip.style.opacity === '0') tooltip.style.visibility = 'hidden'; }, 250);
    }

    document.addEventListener('DOMContentLoaded', () => {

        fetch(DEFINITIONS_URL)
            .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
            .then(data => {
                tooltipDefinitions = data;
                bindTooltips();
            })
            .catch(console.error);

        document.querySelectorAll('.infobox details').forEach(det => {
            det.addEventListener('toggle', () => {
                if (det.open) det.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        });

        const toggleBtn = document.getElementById('toggle-infobox');
        if (toggleBtn) {
            const details = document.querySelectorAll('.infobox details');

            function updateButtonLabel() {
                const allOpen = [...details].every(d => d.open);
                toggleBtn.textContent = allOpen ? 'Collapse All' : 'Expand All';
            }

            toggleBtn.addEventListener('click', () => {
                const allOpen = [...details].every(d => d.open);
                details.forEach(d => d.open = !allOpen);
                updateButtonLabel();
            });

            details.forEach(d => {
                d.addEventListener('toggle', updateButtonLabel);
            });

            updateButtonLabel(); // Initialize correct label on load
        }
    });

    function bindTooltips() {
        document.querySelectorAll('.tooltip').forEach(el => {
            el.addEventListener('mouseenter', () => {
                const key = el.dataset.tooltipKey;
                if (tooltipDefinitions[key]) showTooltip(el, tooltipDefinitions[key]);
            });
            el.addEventListener('mouseleave', hideTooltip);
        });
    }

})();
