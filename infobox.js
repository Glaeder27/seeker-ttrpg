document.addEventListener('DOMContentLoaded', function () {
    let tooltipDefinitions = {};

    function initializeTooltips() {
        const hoverWords = document.querySelectorAll('.tooltip');
        const tooltip = document.createElement('div');
        tooltip.classList.add('global-tooltip');

        const tooltipIcon = document.createElement('div');
        tooltipIcon.classList.add('tooltip-icon');
        tooltipIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

        const tooltipContentWrapper = document.createElement('div');
        tooltipContentWrapper.classList.add('tooltip-content-wrapper');

        tooltip.appendChild(tooltipIcon);
        tooltip.appendChild(tooltipContentWrapper);

        document.body.appendChild(tooltip);

        tooltip.style.opacity = '0';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.visibility = 'hidden';
        tooltip.style.display = 'block';

        hoverWords.forEach(word => {
            word.addEventListener('mouseenter', (event) => {
                const tooltipKey = word.dataset.tooltipKey;
                const tooltipContent = tooltipDefinitions[tooltipKey];

                tooltipContentWrapper.innerHTML = tooltipContent;

                const wordRect = word.getBoundingClientRect();

                const tooltipWidth = tooltip.offsetWidth;
                const tooltipHeight = tooltip.offsetHeight;

                let tooltipLeft = wordRect.left;
                let tooltipTop = wordRect.bottom + 10;

                tooltip.style.left = tooltipLeft + 'px';
                tooltip.style.top = tooltipTop + 'px';

                tooltip.style.visibility = 'visible';
                tooltip.style.opacity = '1';
                tooltip.style.pointerEvents = 'auto';
            });

            word.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
                tooltip.style.pointerEvents = 'none';
                setTimeout(() => {
                    if (tooltip.style.opacity === '0') {
                        tooltip.style.visibility = 'hidden';
                    }
                }, 300);
            });
        });
    }
  });

    const definitionsUrl = 'https://glaeder27.github.io/seeker-ttrpg/tooltipDefinitions.json';

    fetch(definitionsUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            tooltipDefinitions = data; 
            // console.log('Tooltip definitions loaded:', tooltipDefinitions); // Per debug
            initializeTooltips();
        })
        .catch(error => {
            console.error('Error loading tooltip definitions:', error);
        });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.infobox details').forEach(det => {
    det.addEventListener('toggle', () => {
      if (det.open) {
        // scroll into view when a section opens
        det.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const toggleBtn = document.getElementById('toggle-infobox');

  toggleBtn.addEventListener('click', () => {
    const details = document.querySelectorAll('.infobox details');
    const allOpen = Array.from(details).every(d => d.open);

    details.forEach(d => {
      d.open = !allOpen;
    });

    toggleBtn.textContent = allOpen ? 'Expand All' : 'Collapse All';
  });
});