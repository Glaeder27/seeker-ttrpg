/*v1.97 2025-07-24T11:45:00Z*/

// Version Checker
const versionTargets = [
  { label: '🎨 style.css', path: '/style/style.css' },
  { label: '🔣 core.js', path: document.currentScript.src },
  { label: '📂 sidenav.js', path: '/scripts/sidenav.js' },
  { label: '💬 infobox.js', path: '/scripts/infobox.js' },
  { label: '📑 sidebar.js', path: '/scripts/sidebar.js' }
];

Promise.all(versionTargets.map(target =>
  fetch(target.path)
    .then(res => res.ok ? res.text() : null)
    .then(text => {
      const match = text?.match(/\/\*v([\d.]+)\s+([\d\-T:Z]+)\*\//);
      return match
        ? `${target.label} v${match[1]} – ${match[2]}`
        : `${target.label} ❓`;
    })
    .catch(() => `${target.label} ❌`)
)).then(versionMessages => {
  const styles = [
    'color: lightgreen; font-weight: bold;',
    'color: teal; font-weight: bold;',
    'color: orange; font-weight: bold;',
    'color: hotpink; font-weight: bold;',
    'color: cornflowerblue; font-weight: bold;'
  ];

  const logFormat = versionMessages.map(() => '%c%s').join(' ');
  const logValues = versionMessages.flatMap((msg, i) => [styles[i % styles.length], msg]);

  console.log(logFormat, ...logValues);
});

// ───────────────────────────────────────────────────────────────────
// ── MAIN SCRIPT ────────────────────────────────────────────────────
// ───────────────────────────────────────────────────────────────────

let tooltipDefinitions = {};
let tagDefinitions = {};
let categoryColors = {};

function handlePageShow() {
  document.documentElement.classList.remove("preload");
  document.body.classList.remove("fade-out");
}
window.addEventListener("pageshow", handlePageShow);

// ── Fade-in on load ──
document.addEventListener("DOMContentLoaded", () => {
  requestAnimationFrame(() => {
    document.documentElement.classList.remove("preload");
  });

  // ── Tooltip Logic ──
  function initializeTooltips() {
    const hoverWords = document.querySelectorAll(".tooltip");
    if (!hoverWords.length) return;

    const tooltip = document.createElement("div");
    tooltip.classList.add("global-tooltip");

    const tooltipIcon = document.createElement("div");
    tooltipIcon.classList.add("tooltip-icon");
    tooltipIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>`;

    const tooltipContentWrapper = document.createElement("div");
    tooltipContentWrapper.classList.add("tooltip-content-wrapper");

    tooltip.appendChild(tooltipIcon);
    tooltip.appendChild(tooltipContentWrapper);
    document.body.appendChild(tooltip);

    tooltip.style.opacity = "0";
    tooltip.style.pointerEvents = "none";
    tooltip.style.visibility = "hidden";
    tooltip.style.display = "block";

    hoverWords.forEach((word) => {
      word.addEventListener("mouseenter", () => {
        const tooltipKey = word.dataset.tooltipKey;
        const tooltipContent = tooltipDefinitions[tooltipKey];

        tooltipContentWrapper.innerHTML = tooltipContent || "";

        const wordRect = word.getBoundingClientRect();
        tooltip.style.left = `${wordRect.left}px`;
        tooltip.style.top = `${wordRect.bottom + 10}px`;

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

  // ── Tag Tooltips Logic ──
  function initializeTagTooltips() {
    const tagElements = document.querySelectorAll(".tag");
    if (!tagElements.length) return;

    const tooltip = document.createElement("div");
    tooltip.classList.add("global-tooltip");

    const tooltipIcon = document.createElement("div");
    tooltipIcon.classList.add("tooltip-icon");

    const tooltipContentWrapper = document.createElement("div");
    tooltipContentWrapper.classList.add("tooltip-content-wrapper");

    tooltip.appendChild(tooltipIcon);
    tooltip.appendChild(tooltipContentWrapper);
    document.body.appendChild(tooltip);

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

  // ── Fetch tooltip definitions ──
  fetch("/data/tooltips.json")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      tooltipDefinitions = data;
      initializeTooltips();
    })
    .catch((err) => console.error("Error loading tooltip definitions:", err));

  // ── Fetch tag definitions + category colors ──
  fetch("/data/tags.json")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (data.tags) {
        data.tags.forEach((entry) => {
          tagDefinitions[entry.name] = entry;
        });
      }
      if (data.categories) {
        data.categories.forEach((entry) => {
          categoryColors[entry.name] = entry.color || "#D4B55A";
        });
      }

      document.querySelectorAll(".tag").forEach((tag) => {
        const tagName = tag.textContent.trim();
        const tagData = tagDefinitions[tagName];
        const color = categoryColors[tagData?.category];
        if (color) {
          tag.style.borderColor = color;
          tag.style.color = color;
        }
      });

      initializeTagTooltips();
    })
    .catch((err) => console.error("Error loading tag definitions:", err));

  // ── Collapsible Logic ──
  const collapsibleItems = document.querySelectorAll(
    ".collapsible-item, .collapsible-item-sb"
  );
  collapsibleItems.forEach((item) => {
    const header = item.querySelector(
      ".collapsible-header, .collapsible-header-sb"
    );
    const content = item.querySelector(
      ".collapsible-content, .collapsible-content-sb"
    );
    const icon = item.querySelector(".collapsible-icon, .collapsible-icon-sb");

    content.style.height = "0px";

    header.addEventListener("click", () => {
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

      content.addEventListener(
        "transitionend",
        function handler() {
          if (item.classList.contains("expanded")) {
            content.style.height = "auto";
          }
          content.removeEventListener("transitionend", handler, { once: true });
        },
        { once: true }
      );
    });
  });

  // ── Rule Visibility Logic ──
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

  // ── Page fade-out on internal link click ──
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");

    if (
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      link.target === "_blank" ||
      (link.hostname && link.hostname !== window.location.hostname)
    )
      return;

    e.preventDefault();
    document.body.classList.add("fade-out");

    setTimeout(() => {
      window.location.href = href;
    }, 500);
  });
});

function handlePageShow() {
  document.documentElement.classList.remove("preload");
  document.body.classList.remove("fade-out");
}

window.addEventListener("pageshow", handlePageShow);