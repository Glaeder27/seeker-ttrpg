document.addEventListener('DOMContentLoaded', function () {
    let tooltipDefinitions = {}; // Inizializza l'oggetto vuoto

    // --- TOOLTIP INITIALIZATION FUNCTION ---
    // Define the function that sets up the tooltips
    function initializeTooltips() {
        const hoverWords = document.querySelectorAll('.hover-word');
        const tooltip = document.createElement('div');
        tooltip.classList.add('global-tooltip');

        // --- AGGIUNTA ICONA LENTE D'INGRANDIMENTO ---
        const tooltipIcon = document.createElement('div');
        tooltipIcon.classList.add('tooltip-icon');
        tooltipIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

        const tooltipContentWrapper = document.createElement('div');
        tooltipContentWrapper.classList.add('tooltip-content-wrapper');

        tooltip.appendChild(tooltipIcon);
        tooltip.appendChild(tooltipContentWrapper);
        // --- FINE AGGIUNTA ICONA ---

        document.body.appendChild(tooltip);

        tooltip.style.opacity = '0';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.visibility = 'hidden';
        tooltip.style.display = 'block';

        hoverWords.forEach(word => {
            word.addEventListener('mouseenter', (event) => {
                const tooltipKey = word.dataset.tooltipKey;
                // Make sure tooltipDefinitions is available in this scope.
                // Since it's declared with 'let' in the outer scope, it is.
                const tooltipContent = tooltipDefinitions[tooltipKey];

                tooltipContentWrapper.innerHTML = tooltipContent;

                const wordRect = word.getBoundingClientRect();

                // Misura le dimensioni del tooltip prima di posizionarlo
                const tooltipWidth = tooltip.offsetWidth; // This might be 0 if display is 'none' initially, but you set it to 'block'
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
    // --- END TOOLTIP INITIALIZATION FUNCTION ---


    // --- FETCH TOOLTIP DEFINITIONS FROM GITHUB ---
    const definitionsUrl = 'https://glaeder27.github.io/seeker-ttrpg/tooltipDefinitions.json';

    fetch(definitionsUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Parsa la risposta come JSON
        })
        .then(data => {
            tooltipDefinitions = data; // Assegna i dati scaricati all'oggetto
            console.log('Tooltip definitions loaded:', tooltipDefinitions); // Per debug
            initializeTooltips(); // Chiama la funzione per inizializzare i tooltip DOPO aver caricato le definizioni
        })
        .catch(error => {
            console.error('Error loading tooltip definitions:', error);
            // Puoi gestire l'errore qui, ad esempio, caricando definizioni di fallback
            // o mostrando un messaggio all'utente.
        });
    // --- END FETCH TOOLTIP DEFINITIONS ---

    // Collapsible list logic (this part doesn't depend on tooltipDefinitions, so it can run immediately)
    const collapsibleItems = document.querySelectorAll('.collapsible-item');
    collapsibleItems.forEach(item => {
        const header = item.querySelector('.collapsible-header');
        const content = item.querySelector('.collapsible-content');
        const icon = header.querySelector('.collapsible-icon'); // Assuming you have an icon for this too

        content.style.height = '0px';

        header.addEventListener('click', () => {
            item.classList.toggle('expanded');
            if (icon) { // Toggle icon rotation if icon exists
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
                content.removeEventListener('transitionend', handler, { once: true }); // Add { once: true } here as well
            });
        });
    });

    // You might have another collapsible logic for .collapsible-overlap here,
    // which also runs immediately as it doesn't depend on tooltipDefinitions.
});
