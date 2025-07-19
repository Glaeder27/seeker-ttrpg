// init-partials.js

function initPartialContent() {
  // ── Collapsible Logic ──
  const collapsibleItems = document.querySelectorAll(".collapsible-item, .collapsible-item-sb");
  collapsibleItems.forEach((item) => {
    const header = item.querySelector(".collapsible-header, .collapsible-header-sb");
    const content = item.querySelector(".collapsible-content, .collapsible-content-sb");
    const icon = item.querySelector(".collapsible-icon, .collapsible-icon-sb");

    if (!header || !content) return;

    // Rimuovi listener precedenti per evitare duplicazioni
    const newHeader = header.cloneNode(true);
    header.parentNode.replaceChild(newHeader, header);

    newHeader.addEventListener("click", () => {
      item.classList.toggle("expanded");
      if (icon) icon.classList.toggle("expanded-icon");

      if (item.classList.contains("expanded")) {
        content.style.height = content.scrollHeight + "px";
        content.classList.add("expanded-content");
      } else {
        content.style.height = content.offsetHeight + "px";
        requestAnimationFrame(() => {
          content.style.height = "0px";
        });
        content.classList.remove("expanded-content");
      }

      content.addEventListener("transitionend", function handler() {
        if (item.classList.contains("expanded")) {
          content.style.height = "auto";
        }
        content.removeEventListener("transitionend", handler, { once: true });
      }, { once: true });
    });
  });

  // ── Tooltip e Tag Tooltip ──
  // Queste funzioni sono definite in core.js e gestiscono il binding globale
  if (typeof initializeTooltips === "function") initializeTooltips();
  if (typeof initializeTagTooltips === "function") initializeTagTooltips();

  // ── Narrative Toggle ──
  document.querySelectorAll('.narrative-toggle').forEach(row => {
    const newRow = row.cloneNode(true);
    row.parentNode.replaceChild(newRow, row);

    newRow.addEventListener('click', () => {
      newRow.classList.toggle('expanded');
    });
  });
}

// Chiama initPartialContent anche al caricamento pagina per setup iniziale
document.addEventListener("DOMContentLoaded", () => {
  initPartialContent();
});