/*v2.35 2025-08-19T20:01:17.776Z*/

// ─── Globals ───
let tooltipDefinitions = {};
let tagDefinitions = {};
let categoryColors = {};

window.applyTagIcons = function() {
  document.querySelectorAll(".tag").forEach((tag) => {
    const tagName = tag.textContent.trim();
    const tagData = tagDefinitions[tagName];
    if (tagData?.icon) {
      tag.style.setProperty("--tag-icon", `url("${tagData.icon}")`);
    }
    if (tagData?.category) {
      const color = categoryColors[tagData.category];
      if (color) {
        tag.style.borderColor = color;
        tag.style.color = color;
      }
    }
  });
};

window.initializeTagTooltips = function() {
  // copia la logica già presente in core.js per inizializzare tooltip
};

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

    return { tooltip, icon, title, description, header };
  }

  // ─── Initialize standard glossary tooltips (.tooltip) ───
  function initializeTooltips() {
    const hoverWords = document.querySelectorAll(".tooltip");
    if (!hoverWords.length) return;

    // One tooltip box for all glossary tooltips - no icon, no title shown
    const { tooltip, icon, title, description, header } = createTooltipBox();
    icon.style.display = "none";
    title.style.display = "none";
    header.style.display = "none";

    let hideTooltipTimeout = null;

    hoverWords.forEach((word) => {
      word.addEventListener("mouseenter", () => {
        if (hideTooltipTimeout) clearTimeout(hideTooltipTimeout);
        word.classList.add("active-tooltip");

        const rawKey = word.dataset.tooltipKey || word.textContent.trim();
        const key = rawKey.toLowerCase();
        const entry = tooltipDefinitions[key];

        description.innerHTML =
          entry && entry.description
            ? entry.description
            : `No description available for <strong>${rawKey}</strong>.`;

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
        hideTooltipTimeout = setTimeout(() => {
          word.classList.remove("active-tooltip");
          tooltip.classList.remove("visible");
          tooltip.style.pointerEvents = "none";
        }, 150);
      });
    });

    tooltip.addEventListener("mouseenter", () => {
      if (hideTooltipTimeout) clearTimeout(hideTooltipTimeout);
    });

    tooltip.addEventListener("mouseleave", () => {
      tooltip.classList.remove("visible");
      tooltip.style.pointerEvents = "none";
      document
        .querySelector(".active-tooltip")
        ?.classList.remove("active-tooltip");
    });
  }

  // ─── Initialize tag tooltips (.tag) ───
  function initializeTagTooltips() {
    const tagElements = document.querySelectorAll(".tag");
    if (!tagElements.length) return;

    const { tooltip, icon, title, description } = createTooltipBox();
    icon.style.display = "";
    title.style.display = "";

    let hideTooltipTimeout = null;

    tagElements.forEach((tag) => {
      tag.addEventListener("mouseenter", async () => {
        if (hideTooltipTimeout) clearTimeout(hideTooltipTimeout);
        tag.classList.add("active-tag-tooltip");

        const tagKey = tag.textContent.trim();
        const tagData = tagDefinitions[tagKey];

        if (!tagData) {
          title.textContent = tagKey;
          description.innerHTML = `No description available for <strong>${tagKey}</strong>.`;
          return;
        }

        const category = tagData.category || "";
        const color = categoryColors[category] || "#D4B55A";
        tooltip.style.borderColor = color;
        tooltip.style.setProperty("--tooltip-color", color);

        title.textContent = tagKey;
        description.innerHTML = tagData.definition || "";

        // Load SVG from icon URL
        try {
          const response = await fetch(tagData.icon);
          const svgText = await response.text();
          icon.innerHTML = svgText;
        } catch (error) {
          icon.innerHTML = ""; // fallback in caso di errore
        }

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
        hideTooltipTimeout = setTimeout(() => {
          tag.classList.remove("active-tag-tooltip");
          tooltip.classList.remove("visible");
          tooltip.style.pointerEvents = "none";
        }, 150);
      });
    });

    tooltip.addEventListener("mouseenter", () => {
      if (hideTooltipTimeout) clearTimeout(hideTooltipTimeout);
    });

    tooltip.addEventListener("mouseleave", () => {
      tooltip.classList.remove("visible");
      tooltip.style.pointerEvents = "none";
      document
        .querySelector(".active-tag-tooltip")
        ?.classList.remove("active-tag-tooltip");
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
