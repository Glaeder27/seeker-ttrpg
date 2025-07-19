// core.js

let tooltipDefinitions = {};
let tagDefinitions = {};
let categoryColors = {};

// Handle page show for back/forward cache (bfcache) fixes
function handlePageShow() {
  document.documentElement.classList.remove("preload");
  document.body.classList.remove("fade-out");
}
window.addEventListener("pageshow", handlePageShow);

// ── Initialize tooltips ──
function initializeTooltips() {
  const hoverWords = document.querySelectorAll(".tooltip");
  if (!hoverWords.length) return;

  // Create or reuse the tooltip container
  let tooltip = document.querySelector(".global-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.classList.add("global-tooltip");
    document.body.appendChild(tooltip);
  }

  // Setup tooltip icon and content wrapper
  const tooltipIcon = document.createElement("div");
  tooltipIcon.classList.add("tooltip-icon");
  tooltipIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>`;
  tooltip.innerHTML = "";
  tooltip.appendChild(tooltipIcon);

  const tooltipContentWrapper = document.createElement("div");
  tooltipContentWrapper.classList.add("tooltip-content-wrapper");
  tooltip.appendChild(tooltipContentWrapper);

  tooltip.style.opacity = "0";
  tooltip.style.pointerEvents = "none";
  tooltip.style.visibility = "hidden";
  tooltip.style.display = "block";

  hoverWords.forEach((word) => {
    word.addEventListener("mouseenter", () => {
      const tooltipKey = word.dataset.tooltipKey || word.dataset.tooltip;
      const content = tooltipDefinitions[tooltipKey] || "";
      tooltipContentWrapper.innerHTML = content;

      const rect = word.getBoundingClientRect();
      tooltip.style.left = `${rect.left}px`;
      tooltip.style.top = `${rect.bottom + 10}px`;

      tooltip.style.visibility = "visible";
      tooltip.style.opacity = "1";
      tooltip.style.pointerEvents = "auto";
    });

    word.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
      tooltip.style.pointerEvents = "none";
      setTimeout(() => {
        if (tooltip.style.opacity === "0") {
          tooltip.style.visibility = "hidden";
        }
      }, 300);
    });
  });
}

// ── Initialize tag tooltips ──
function initializeTagTooltips() {
  const tagElements = document.querySelectorAll(".tag");
  if (!tagElements.length) return;

  let tooltip = document.querySelector(".global-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.classList.add("global-tooltip");
    document.body.appendChild(tooltip);
  }

  const tooltipIcon = document.createElement("div");
  tooltipIcon.classList.add("tooltip-icon");
  tooltip.innerHTML = "";
  tooltip.appendChild(tooltipIcon);

  const tooltipContentWrapper = document.createElement("div");
  tooltipContentWrapper.classList.add("tooltip-content-wrapper");
  tooltip.appendChild(tooltipContentWrapper);

  tooltip.style.opacity = "0";
  tooltip.style.pointerEvents = "none";
  tooltip.style.visibility = "hidden";
  tooltip.style.display = "block";

  tagElements.forEach((tag) => {
    tag.addEventListener("mouseenter", () => {
      const tagKey = tag.textContent.trim();
      const tagData = tagDefinitions[tagKey];
      const category = tagData?.category || "";
      const color = categoryColors[category] || "#D4B55A";

      tooltipIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 512 512">
          <path fill="${color}" d="M345 39.1L472.8 168.4c52.4 53 52.4 138.2 0 191.2L360.8 472.9c-9.3 9.4-24.5 9.5-33.9 .2s-9.5-24.5-.2-33.9L438.6 325.9c33.9-34.3 33.9-89.4 0-123.7L310.9 72.9c-9.3-9.4-9.2-24.6 .2-33.9s24.6-9.2 33.9 .2zM0 229.5L0 80C0 53.5 21.5 32 48 32l149.5 0c17 0 33.3 6.7 45.3 18.7l168 168c25 25 25 65.5 0 90.5L277.3 442.7c-25 25-65.5 25-90.5 0l-168-168C6.7 262.7 0 246.5 0 229.5zM144 144a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/>
        </svg>`;

      tooltip.style.borderColor = color;

      tooltipContentWrapper.innerHTML =
        tagData && tagData.definition
          ? `<strong>${tagKey}</strong><br>${tagData.definition}`
          : `No description available for <strong>${tagKey}</strong>.`;

      const tagRect = tag.getBoundingClientRect();
      tooltip.style.left = `${tagRect.left}px`;
      tooltip.style.top = `${tagRect.bottom + 10}px`;

      tooltip.style.visibility = "visible";
      tooltip.style.opacity = "1";
      tooltip.style.pointerEvents = "auto";
    });

    tag.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
      tooltip.style.pointerEvents = "none";
      setTimeout(() => {
        if (tooltip.style.opacity === "0") {
          tooltip.style.visibility = "hidden";
        }
      }, 300);
    });
  });
}

// ── Initialize collapsible items ──
function initializeCollapsibles() {
  document.querySelectorAll(".collapsible-item").forEach((item) => {
    const header = item.querySelector(".collapsible-header");
    const content = item.querySelector(".collapsible-content");
    if (!header || !content) return;

    // Remove duplicate listeners by replacing the header node
    header.replaceWith(header.cloneNode(true));
    const newHeader = item.querySelector(".collapsible-header");

    newHeader.addEventListener("click", () => {
      const isExpanded = item.classList.contains("expanded");

      // Close other expanded items
      document.querySelectorAll(".collapsible-item.expanded").forEach((other) => {
        if (other !== item) {
          other.classList.remove("expanded");
          other.querySelector(".collapsible-content").style.maxHeight = null;
        }
      });

      item.classList.toggle("expanded");

      if (isExpanded) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });
}

// ── Initialize narrative toggles ──
function initializeNarrativeToggles() {
  document.querySelectorAll(".narrative-toggle").forEach((row) => {
    // Remove duplicate listeners by replacing the node
    row.replaceWith(row.cloneNode(true));
    // Select the new node after replacement
    const newRow = document.querySelector(".narrative-toggle");
    if (!newRow) return;

    newRow.addEventListener("click", () => {
      newRow.classList.toggle("expanded");
    });
  });
}

// ── Initialize rule visibility toggles ──
function initializeRuleVisibilityToggles() {
  const toggles = document.querySelectorAll(".rule-switch input[data-rule]");
  toggles.forEach((cb) => {
    const key = "rule-" + cb.dataset.rule;
    if (localStorage.getItem(key) === "false") cb.checked = false;
    updateVisibility(cb.dataset.rule, cb.checked);
  });

  toggles.forEach((cb) =>
    cb.addEventListener("change", (e) => {
      const rule = e.target.dataset.rule;
      const on = e.target.checked;
      localStorage.setItem("rule-" + rule, on);
      updateVisibility(rule, on);
    })
  );

  function updateVisibility(rule, on) {
    document.querySelectorAll(".rule-" + rule).forEach((el) => {
      el.style.display = on ? "" : "none";
    });
  }
}

// ── Initialize all partial content features ──
function initPartialContent() {
  initializeCollapsibles();
  initializeNarrativeToggles();
  initializeTooltips();
  initializeTagTooltips();
  initializeRuleVisibilityToggles();
}

// ── Partial loading system ──
document.addEventListener("DOMContentLoaded", () => {
  requestAnimationFrame(() => {
    document.documentElement.classList.remove("preload");
  });

  const mainColumn = document.querySelector("#main-content");

  function loadPartial(href, push = true) {
    fetch(href)
      .then((response) => {
        if (!response.ok) throw new Error("File not found");
        return response.text();
      })
      .then((html) => {
        // Parse HTML to extract scripts and content separately
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const scripts = doc.querySelectorAll("script");
        const content = doc.body.innerHTML;

        // Insert only the content HTML
        mainColumn.innerHTML = content;

        // Re-execute scripts to maintain any dynamic behavior
        scripts.forEach((oldScript) => {
          const newScript = document.createElement("script");
          if (oldScript.src) {
            newScript.src = oldScript.src;
            newScript.async = false;
          } else {
            newScript.textContent = oldScript.textContent;
          }
          document.body.appendChild(newScript);
        });

        if (push) history.pushState({ href }, "", href);
        window.scrollTo(0, 0);

        // Initialize features inside the partial content
        if (typeof initPartialContent === "function") {
          initPartialContent();
        }
      })
      .catch(() => {
        mainColumn.innerHTML = "<p>Could not load content.</p>";
      });
  }

  // If loaded directly on a partial URL, load partial and rewrite URL to rules.html
  const path = window.location.pathname;
  if (path.startsWith("/partials/") && mainColumn) {
    history.replaceState({ href: path }, "", "/rules.html");
    loadPartial(path, false);
  }

  // Delegate click for partial loading on all links with [data-partial]
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-partial]");
    if (!link) return;

    e.preventDefault();
    const href = link.getAttribute("href");

    // Apply fade-out effect to main content column only
    mainColumn.classList.add("fade-out");
    setTimeout(() => {
      mainColumn.classList.remove("fade-out");
      loadPartial(href, true);
    }, 300);
  });

  // Handle browser back/forward buttons
  window.addEventListener("popstate", (event) => {
    if (event.state?.href) {
      loadPartial(event.state.href, false);
    }
  });
});