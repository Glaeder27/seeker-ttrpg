document.addEventListener('DOMContentLoaded', function () {
    let tooltipDefinitions = {}; // Inizializza l'oggetto vuoto

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

    // Collapsible list logic
    const collapsibleItems = document.querySelectorAll('.collapsible-item');
    collapsibleItems.forEach(item => {
        const header = item.querySelector('.collapsible-header');
        const content = item.querySelector('.collapsible-content');
        content.style.height = '0px';

        header.addEventListener('click', () => {
            item.classList.toggle('expanded');
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
                content.removeEventListener('transitionend', handler);
            });
        });
    });

    // Pop-up/Tooltip logic
    const hoverWords = document.querySelectorAll('.hover-word');
    const tooltip = document.createElement('div');
    tooltip.classList.add('global-tooltip');

    // --- AGGIUNTA ICONA LENTE D'INGRANDIMENTO ---
    // 1. Crea il contenitore per l'icona
    const tooltipIcon = document.createElement('div');
    tooltipIcon.classList.add('tooltip-icon');
    tooltipIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

    // 3. Crea un wrapper per il contenuto testuale
    const tooltipContentWrapper = document.createElement('div');
    tooltipContentWrapper.classList.add('tooltip-content-wrapper');

    // 4. Appendi l'icona e il wrapper del contenuto al div principale del tooltip
    tooltip.appendChild(tooltipIcon);
    tooltip.appendChild(tooltipContentWrapper);
    // --- FINE AGGIUNTA ICONA ---

    document.body.appendChild(tooltip);

    // Inizializza il tooltip come nascosto non appena viene creato
    tooltip.style.opacity = '0';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.visibility = 'hidden';
    tooltip.style.display = 'block'; /* Mantiene display:block per misurazioni accurate */


    hoverWords.forEach(word => {
        word.addEventListener('mouseenter', (event) => {
            const tooltipKey = word.dataset.tooltipKey;
            const tooltipContent = tooltipDefinitions[tooltipKey];

            // Inserisci il contenuto nel wrapper, non nel div principale del tooltip
            tooltipContentWrapper.innerHTML = tooltipContent;

            const wordRect = word.getBoundingClientRect();

            // Misura le dimensioni del tooltip prima di posizionarlo
            const tooltipWidth = tooltip.offsetWidth;
            const tooltipHeight = tooltip.offsetHeight;

            // Calcola la posizione (semplificata, sotto e allineato a sinistra)
            let tooltipLeft = wordRect.left;
            let tooltipTop = wordRect.bottom + 10; // 10px sotto la parola

            // Applica la posizione
            tooltip.style.left = tooltipLeft + 'px';
            tooltip.style.top = tooltipTop + 'px';

            // Rendi il tooltip visibile
            tooltip.style.visibility = 'visible';
            tooltip.style.opacity = '1';
            tooltip.style.pointerEvents = 'auto';
        });

        word.addEventListener('mouseleave', () => {
            // Nascondi il tooltip
            tooltip.style.opacity = '0';
            tooltip.style.pointerEvents = 'none';
            // Completa la transizione e poi nascondi completamente
            setTimeout(() => {
                if (tooltip.style.opacity === '0') {
                    tooltip.style.visibility = 'hidden';
                }
            }, 300);
        });
    });
});