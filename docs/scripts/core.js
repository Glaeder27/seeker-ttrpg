/*v2.13 2025-08-03T15:05:22.387Z*/

// ─── Version Checker ───
// ─── Version Checker Enhanced ───
const versionTargets = [
  { label: "📄 HTML", path: location.pathname, isHTML: true },
  { label: "🎨 style.css", path: "/style/style.css" },
  { label: "🔣 core.js", path: document.currentScript.src },
  { label: "📂 sidenav.js", path: "/scripts/sidenav.js" },
  { label: "💬 infobox.js", path: "/scripts/infobox.js" },
  { label: "📑 sidebar.js", path: "/scripts/sidebar.js" },
];

const versionRegex = /v([\d.]+)\s+([\d\-T:.Z]+)/; // accetta anche commenti HTML

Promise.all(
  versionTargets.map((target) =>
    fetch(target.path)
      .then((res) => (res.ok ? res.text() : null))
      .then((text) => {
        if (!text) return { label: target.label, version: "❌" };

        let match;
        if (target.isHTML) {
          // Cerca solo nei primi 500 caratteri (inizio file)
          match = text.slice(0, 500).match(/<!--\s*v([\d.]+)\s+([\d\-T:.Z]+)\s*-->/);
        } else {
          match = text.match(/\/\*v([\d.]+)\s+([\d\-T:.Z]+)\*\//);
        }

        return match
          ? { label: target.label, version: `v${match[1]} – ${match[2]}` }
          : { label: target.label, version: "❓" };
      })
      .catch(() => ({ label: target.label, version: "❌" }))
  )
).then((results) => {
  const styles = [
    "color: DarkGoldenRod; font-weight: bold; text-decoration: underline dotted",
    "color: GoldenRod; font-weight: bold;",
    "color: Gold; font-weight: bold;",
    "color: PaleGoldenRod; font-weight: bold;",
    "color: Chocolate; font-weight: bold;",
    "color: DarkOrange; font-weight: bold;"
  ];

  results.forEach((entry, i) => {
    console.log(`%c${entry.label} %c${entry.version}`, "color: gray; font-weight: bold;", styles[i % styles.length]);
  });
});

// ─── Globals ───
let tooltipDefinitions = {};
let tagDefinitions = {};
let categoryColors = {};

// ─── Remove preload/fadeout classes when page is ready ───
window.addEventListener("pageshow", () => {
  document.documentElement.classList.remove("preload");
  document.body.classList.remove("fade-out");
});

document.addEventListener("DOMContentLoaded", () => {
  // Remove preload asap
  requestAnimationFrame(() => {
    document.documentElement.classList.remove("preload");
  });

  // ─── Tooltip Container Factory ───
  function createTooltipBox() {
    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip-box");

    const header = document.createElement("div");
    header.classList.add("tooltip-header");

    const icon = document.createElement("div");
    icon.classList.add("tooltip-icon");

    const title = document.createElement("strong");
    title.classList.add("tooltip-title");

    header.appendChild(icon);
    header.appendChild(title);

    const description = document.createElement("div");
    description.classList.add("tooltip-description");

    tooltip.appendChild(header);
    tooltip.appendChild(description);

    document.body.appendChild(tooltip);

    return { tooltip, icon, title, description };
  }

  // ─── Initialize standard glossary tooltips (.tooltip) ───
  function initializeTooltips() {
    const hoverWords = document.querySelectorAll(".tooltip");
    if (!hoverWords.length) return;

    // One tooltip box for all glossary tooltips - no icon, no title shown
    const { tooltip, icon, title, description } = createTooltipBox();
    icon.style.display = "none";
    title.style.display = "none";

    hoverWords.forEach((word) => {
      word.addEventListener("mouseenter", () => {
        word.classList.add("active-tooltip");

        const key = word.dataset.tooltipKey || word.textContent.trim(); // fallback
        const content =
          tooltipDefinitions[key] ||
          `No description available for <strong>${key}</strong>.`;
        description.innerHTML = content;

        const rect = word.getBoundingClientRect();
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft =
          window.pageXOffset || document.documentElement.scrollLeft;

        tooltip.style.left = rect.left + scrollLeft + "px";
        tooltip.style.top = rect.bottom + scrollTop + 10 + "px";

        tooltip.classList.add("visible");
        tooltip.style.pointerEvents = "auto";
      });

      word.addEventListener("mouseleave", () => {
        word.classList.remove("active-tooltip");
        tooltip.classList.remove("visible");
        tooltip.style.pointerEvents = "none";
      });
    });
  }

  // ─── Initialize tag tooltips (.tag) ───
  function initializeTagTooltips() {
    const tagElements = document.querySelectorAll(".tag");
    if (!tagElements.length) return;

    const { tooltip, icon, title, description } = createTooltipBox();
    // Show icon and title for tags
    icon.style.display = "";
    title.style.display = "";

    tagElements.forEach((tag) => {
      tag.addEventListener("mouseenter", () => {
        tag.classList.add("active-tag-tooltip");

        const tagKey = tag.textContent.trim();
        const tagData = tagDefinitions[tagKey];
        const category = tagData?.category || "";
        const color = categoryColors[category] || "#D4B55A";

        icon.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 512 512">
            <path fill="${color}" d="M345 39.1L472.8 168.4c52.4 53 52.4 138.2 0 191.2L360.8 472.9c-9.3 9.4-24.5 9.5-33.9 .2s-9.5-24.5-.2-33.9L438.6 325.9c33.9-34.3 33.9-89.4 0-123.7L310.9 72.9c-9.3-9.4-9.2-24.6 .2-33.9s24.6-9.2 33.9 .2zM0 229.5L0 80C0 53.5 21.5 32 48 32l149.5 0c17 0 33.3 6.7 45.3 18.7l168 168c25 25 25 65.5 0 90.5L277.3 442.7c-25 25-65.5 25-90.5 0l-168-168C6.7 262.7 0 246.5 0 229.5zM144 144a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/>
          </svg>`;

        tooltip.style.borderColor = color;
        tooltip.style.setProperty("--tooltip-color", color);

        title.textContent = tagKey;
        description.innerHTML =
          tagData?.definition ||
          `No description available for <strong>${tagKey}</strong>.`;

        const rect = tag.getBoundingClientRect();
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft =
          window.pageXOffset || document.documentElement.scrollLeft;

        tooltip.style.left = rect.left + scrollLeft + "px";
        tooltip.style.top = rect.bottom + scrollTop + 10 + "px";

        tooltip.classList.add("visible");
        tooltip.style.pointerEvents = "auto";
      });

      tag.addEventListener("mouseleave", () => {
        tag.classList.remove("active-tag-tooltip");
        tooltip.classList.remove("visible");
        tooltip.style.pointerEvents = "none";
      });
    });
  }

  // ─── Load tooltip definitions ───
  fetch("/data/tooltips.json")
    .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
    .then((data) => {
      tooltipDefinitions = data;
      initializeTooltips();
    })
    .catch((err) => console.error("Error loading tooltip definitions:", err));

  // ─── Load tag and category definitions ───
  fetch("/data/tags.json")
    .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
    .then((data) => {
      if (data.tags)
        data.tags.forEach((tag) => (tagDefinitions[tag.name] = tag));
      if (data.categories)
        data.categories.forEach(
          (cat) => (categoryColors[cat.name] = cat.color || "#D4B55A")
        );

      document.querySelectorAll(".tag").forEach((tag) => {
        const tagName = tag.textContent.trim();
        const tagData = tagDefinitions[tagName];
        const color = categoryColors[tagData?.category];
        if (color) {
          tag.style.borderColor = color;
          tag.style.color = color;
        }
      });

      applyTagIcons();

      initializeTagTooltips();
    })
    .catch((err) => console.error("Error loading tag definitions:", err));

  // ─── Expandable Sections ───
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

    // Start collapsed
    content.style.height = "0px";

    header.addEventListener("click", () => {
      item.classList.toggle("expanded");
      icon?.classList.toggle("expanded-icon");

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

      // After transition, fix height to auto if expanded
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

  // ─── Rule Toggles ───
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

  // ─── Visibility Functions ───
  function updateVisibility(rule, on) {
    document.querySelectorAll(".rule-" + rule).forEach((el) => {
      el.style.display = on ? "" : "none";
    });
  }
  function applyTagIcons() {
    document.querySelectorAll(".tag").forEach((tag) => {
      const tagName = tag.textContent.trim();
      const tagData = tagDefinitions[tagName];
      if (tagData?.icon) {
        tag.style.setProperty("--tag-icon", `url("${tagData.icon}")`);
      }
    });
  }

  // ─── Page Fade Navigation ───
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href");
    if (
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      link.target === "_blank" ||
      (link.hostname && link.hostname !== location.hostname)
    )
      return;

    e.preventDefault();
    document.body.classList.add("fade-out");
    setTimeout(() => (window.location.href = href), 500);
  });
});
