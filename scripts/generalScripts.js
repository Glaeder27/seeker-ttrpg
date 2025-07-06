// Tooltip Logic

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

    // Definition Fetch Logic
    fetch(definitionsUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            tooltipDefinitions = data; 
            // console.log('Tooltip definitions loaded:', tooltipDefinitions); // Use for debugging
            initializeTooltips();
        })
        .catch(error => {
            console.error('Error loading tooltip definitions:', error);
        });

// Collapsible Logic

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

// Content Toggle Logic - TO BE DELETED (?)

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('contents-toggle');
  const contentsList = document.getElementById('contents-list');

  toggleBtn.addEventListener('click', () => {
    const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', !expanded);
    contentsList.hidden = expanded;
  });

  const contentsLinks = document.querySelectorAll('#contents-list a[href^="#"]');
  contentsLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        history.pushState(null, '', '#' + targetId);
      }
    });
  });
});

// Scroll to Anchor logic - TO BE DELETED

document.addEventListener("DOMContentLoaded", () => {
  const sections = Array.from(document.querySelectorAll("h2.section[id]"));
  const navLinks = Array.from(document.querySelectorAll(".contents-content a"));

  let lastKnownScrollY = 0;
  let ticking = false;

  function updateScrollSpy() {
    let currentSectionId = "";

    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.3) {
        currentSectionId = section.id;
      } else {
        break;
      }
    }

    for (const link of navLinks) {
      const targetId = link.getAttribute("href").slice(1);
      link.classList.toggle("active", targetId === currentSectionId);
    }

    ticking = false;
  }

  function onScroll() {
    lastKnownScrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(updateScrollSpy);
      ticking = true;
    }
  }

  document.addEventListener("scroll", onScroll);
  updateScrollSpy();
});

// Rule Visibility Logic

document.addEventListener('DOMContentLoaded', () => {
  const toggles = document.querySelectorAll('.rule-switch input[data-rule]');
  toggles.forEach(cb => {
    const key = 'rule-' + cb.dataset.rule;
    if (localStorage.getItem(key) === 'false') cb.checked = false;
    updateVisibility(cb.dataset.rule, cb.checked);
  });

  toggles.forEach(cb => cb.addEventListener('change', e => {
    const rule = e.target.dataset.rule;
    const on   = e.target.checked;
    localStorage.setItem('rule-' + rule, on);
    updateVisibility(rule, on);
  }));

  function updateVisibility(rule, on) {
    document.querySelectorAll('.rule-' + rule).forEach(el => {
      el.style.display = on ? '' : 'none';
    });
  }
});