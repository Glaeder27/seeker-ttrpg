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

    const collapsibleItems = document.querySelectorAll('.collapsible-item');
    collapsibleItems.forEach(item => {
        const header = item.querySelector('.collapsible-header');
        const content = item.querySelector('.collapsible-content');
        const icon = header.querySelector('.collapsible-icon');

        content.style.height = '0px';

        header.addEventListener('click', () => {
            item.classList.toggle('expanded');
            if (icon) {
                icon.classList.toggle('expanded-icon');
            }
            if (item.classList.contains('expanded')) {
                content.style.height = content.scrollHeight + 'px';
                content.classList.add('expanded-content');
            } else {
                content.style.height = content.offsetHeight + 'px';
                requestAnimationFrame(() => {
                    content.style.height = '0px';
                });
                content.classList.remove('expanded-content');
            }
            content.addEventListener('transitionend', function handler() {
                if (item.classList.contains('expanded')) {
                    content.style.height = 'auto';
                }
                content.removeEventListener('transitionend', handler, { once: true });
            });
        });
    });

});

document.fonts.ready.then(function () {
  const headerOffset = 80;

  document.querySelectorAll('.toc a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const targetID = this.getAttribute('href');
      const targetElement = document.querySelector(targetID);

      if (targetElement) {
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});