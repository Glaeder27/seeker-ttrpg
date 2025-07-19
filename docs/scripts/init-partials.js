// main-init.js
function initPartialContent() {
  // ── Sidebar collapsible logic ──
  document.querySelectorAll('.collapsible-item').forEach((item) => {
    const header = item.querySelector('.collapsible-header');
    const content = item.querySelector('.collapsible-content');

    if (!header || !content) return;

    header.addEventListener('click', () => {
      const isExpanded = item.classList.contains('expanded');
      document.querySelectorAll('.collapsible-item.expanded').forEach((other) => {
        if (other !== item) {
          other.classList.remove('expanded');
          other.querySelector('.collapsible-content').style.maxHeight = null;
        }
      });

      item.classList.toggle('expanded');
      if (isExpanded) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  // ── Tooltip Logic ──
  const tooltipDefinitions = {};
  const hoverWords = document.querySelectorAll('.tooltip');
  let tooltip = document.querySelector('.global-tooltip');

  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.classList.add('global-tooltip');
    document.body.appendChild(tooltip);
  }

  hoverWords.forEach((word) => {
    word.addEventListener('mouseenter', () => {
      const key = word.dataset.tooltip;
      const text = tooltipDefinitions[key] || key;
      tooltip.textContent = text;
      tooltip.style.display = 'block';
    });

    word.addEventListener('mousemove', (e) => {
      tooltip.style.left = e.pageX + 12 + 'px';
      tooltip.style.top = e.pageY + 12 + 'px';
    });

    word.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
  });

  // ── Narrative Toggle ──
  document.querySelectorAll('.narrative-toggle').forEach((row) => {
    row.addEventListener('click', () => {
      row.classList.toggle('expanded');
    });
  });
}