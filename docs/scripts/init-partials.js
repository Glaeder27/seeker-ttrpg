// init-partials.js

function initPartialContent() {
  // ── Sidebar collapsible logic ──
  document.querySelectorAll('.collapsible-item').forEach((item) => {
    const header = item.querySelector('.collapsible-header');
    const content = item.querySelector('.collapsible-content');

    if (!header || !content) return;

    // Rimuovo eventuali event listener duplicati (per sicurezza)
    header.replaceWith(header.cloneNode(true));
    const newHeader = item.querySelector('.collapsible-header');

    newHeader.addEventListener('click', () => {
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

  // ── Narrative Toggle ──
  document.querySelectorAll('.narrative-toggle').forEach((row) => {
    // Rimuovo eventuali event listener duplicati
    row.replaceWith(row.cloneNode(true));
    const newRow = document.querySelector('.narrative-toggle');

    newRow.addEventListener('click', () => {
      newRow.classList.toggle('expanded');
    });
  });

  // ── Inizializza tooltip e tag tooltip definiti in core.js ──
  if (typeof initializeTooltips === "function") {
    initializeTooltips();
  }
  if (typeof initializeTagTooltips === "function") {
    initializeTagTooltips();
  }
}