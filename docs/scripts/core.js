// core.js

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

  const mainColumn = document.querySelector("#main-content");

  // ── Load partial content and reinitialize components ──
  function loadPartial(href, push = true) {
    fetch(href)
      .then(response => {
        if (!response.ok) throw new Error("File not found");
        return response.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const scripts = doc.querySelectorAll("script");
        const content = doc.body.innerHTML;

        // Replace main content with new partial HTML
        mainColumn.innerHTML = content;

        // Execute scripts in the loaded partial
        scripts.forEach(oldScript => {
          const newScript = document.createElement("script");
          if (oldScript.src) {
            newScript.src = oldScript.src;
            newScript.async = false;
          } else {
            newScript.textContent = oldScript.textContent;
          }
          document.body.appendChild(newScript);
        });

        // Initialize tooltips, collapsibles, toggles, etc.
        if (typeof initPartialContent === "function") {
          initPartialContent();
        }

        if (push) history.pushState({ href }, "", href);
        window.scrollTo(0, 0);
      })
      .catch(err => {
        mainColumn.innerHTML = "<p>Could not load content.</p>";
        console.error(err);
      });
  }

  // If loaded directly on a partial URL, redirect to rules.html and load partial
  const path = window.location.pathname;
  if (path.startsWith("/partials/") && mainColumn) {
    history.replaceState({ href: path }, "", "/rules.html");
    loadPartial(path);
  }

  // Delegate click on partial links
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-partial]");
    if (!link) return;

    e.preventDefault();
    const href = link.getAttribute("href");

    document.body.classList.add("fade-out");
    setTimeout(() => {
      document.body.classList.remove("fade-out");
      loadPartial(href, true);
    }, 300);
  });

  // Handle back/forward navigation
  window.addEventListener("popstate", event => {
    if (event.state?.href) {
      loadPartial(event.state.href, false);
    }
  });

  // ── Tooltip Initialization ──
  window.initializeTooltips = function initializeTooltips() {
    const hoverWords = document.querySelectorAll(".tooltip");
    if (!hoverWords.length) return;

    let tooltip = document.querySelector(".global-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.classList.add("global-tooltip");
      document.body.appendChild(tooltip);
    }

    // Clear previous listeners by cloning elements
    hoverWords.forEach(word => {
      const newWord = word.cloneNode(true);
      word.parentNode.replaceChild(newWord, word);

      newWord.addEventListener("mouseenter", () => {
        const key = newWord.dataset.tooltipKey || newWord.dataset.tooltip;
        const content = tooltipDefinitions[key] || "";
        tooltip.innerHTML = content;
        const rect = newWord.getBoundingClientRect();

        tooltip.style.left = `${rect.left}px`;
        tooltip.style.top = `${rect.bottom + 10}px`;
        tooltip.style.visibility = "visible";
        tooltip.style.opacity = "1";
        tooltip.style.pointerEvents = "auto";
      });

      newWord.addEventListener("mouseleave", () => {
        tooltip.style.opacity = "0";
        tooltip.style.pointerEvents = "none";
        setTimeout(() => {
          if (tooltip.style.opacity === "0") {
            tooltip.style.visibility = "hidden";
          }
        }, 300);
      });
    });
  };

  // ── Tag Tooltip Initialization ──
  window.initializeTagTooltips = function initializeTagTooltips() {
    const tagElements = document.querySelectorAll(".tag");
    if (!tagElements.length) return;

    let tooltip = document.querySelector(".global-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.classList.add("global-tooltip");
      document.body.appendChild(tooltip);
    }

    // Rebind events on tags
    tagElements.forEach(tag => {
      const newTag = tag.cloneNode(true);
      tag.parentNode.replaceChild(newTag, tag);

      newTag.addEventListener("mouseenter", () => {
        const tagKey = newTag.textContent.trim();
        const tagData = tagDefinitions[tagKey];
        const category = tagData?.category || "";
        const color = categoryColors[category] || "#D4B55A";

        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 512 512">
            <path fill="${color}" d="M345 39.1L472.8 168.4c52.4 53 52.4 138.2 0 191.2L360.8 472.9c-9.3 9.4-24.5 9.5-33.9 .2s-9.5-24.5-.2-33.9L438.6 325.9c33.9-34.3 33.9-89.4 0-123.7L310.9 72.9c-9.3-9.4-9.2-24.6 .2-33.9s24.6-9.2 33.9 .2zM0 229.5L0 80C0 53.5 21.5 32 48 32l149.5 0c17 0 33.3 6.7 45.3 18.7l168 168c25 25 25 65.5 0 90.5L277.3 442.7c-25 25-65.5 25-90.5 0l-168-168C6.7 262.7 0 246.5 0 229.5zM144 144a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/>
          </svg>`;

        tooltip.innerHTML = svg + (tagData?.definition
          ? `<strong>${tagKey}</strong><br>${tagData.definition}`
          : `No description available for <strong>${tagKey}</strong>.`);

        tooltip.style.borderColor = color;

        const rect = newTag.getBoundingClientRect();
        tooltip.style.left = `${rect.left}px`;
        tooltip.style.top = `${rect.bottom + 10}px`;

        tooltip.style.visibility = "visible";
        tooltip.style.opacity = "1";
        tooltip.style.pointerEvents = "auto";
      });

      newTag.addEventListener("mouseleave", () => {
        tooltip.style.opacity = "0";
        tooltip.style.pointerEvents = "none";
        setTimeout(() => {
          if (tooltip.style.opacity === "0") {
            tooltip.style.visibility = "hidden";
          }
        }, 300);
      });
    });
  };

  // ── Fetch tooltip and tag definitions JSON ──
  fetch("data/tooltips.json")
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(data => {
      tooltipDefinitions = data;
      initializeTooltips();
    })
    .catch(err => console.error("Error loading tooltip definitions:", err));

  fetch("data/tags.json")
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(data => {
      if (data.tags) {
        data.tags.forEach(entry => tagDefinitions[entry.name] = entry);
      }
      if (data.categories) {
        data.categories.forEach(entry => categoryColors[entry.name] = entry.color || "#D4B55A");
      }

      // Style tags with category color
      document.querySelectorAll(".tag").forEach(tag => {
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
    .catch(err => console.error("Error loading tag definitions:", err));

  // ── Collapsible logic ──
  const collapsibleItems = document.querySelectorAll(".collapsible-item, .collapsible-item-sb");
  collapsibleItems.forEach((item) => {
    const header = item.querySelector(".collapsible-header, .collapsible-header-sb");
    const content = item.querySelector(".collapsible-content, .collapsible-content-sb");
    const icon = item.querySelector(".collapsible-icon, .collapsible-icon-sb");

    if (!header || !content) return;

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

      content.addEventListener("transitionend", function handler() {
        if (item.classList.contains("expanded")) {
          content.style.height = "auto";
        }
        content.removeEventListener("transitionend", handler, { once: true });
      }, { once: true });
    });
  });

  // ── Rule visibility toggles ──
  const toggles = document.querySelectorAll(".rule-switch input[data-rule]");
  toggles.forEach(cb => {
    const key = "rule-" + cb.dataset.rule;
    if (localStorage.getItem(key) === "false") cb.checked = false;
    updateVisibility(cb.dataset.rule, cb.checked);
  });

  toggles.forEach(cb =>
    cb.addEventListener("change", (e) => {
      const rule = e.target.dataset.rule;
      const on = e.target.checked;
      localStorage.setItem("rule-" + rule, on);
      updateVisibility(rule, on);
    })
  );

  function updateVisibility(rule, on) {
    document.querySelectorAll(".rule-" + rule).forEach(el => {
      el.style.display = on ? "" : "none";
    });
  }

  // ── Page fade-out on full-page internal links (non partial) ──
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link || link.hasAttribute("data-partial")) return;

    const href = link.getAttribute("href");

    if (
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      link.target === "_blank" ||
      (link.hostname && link.hostname !== window.location.hostname)
    ) return;

    e.preventDefault();
    document.body.classList.add("fade-out");

    setTimeout(() => {
      window.location.href = href;
    }, 500);
  });
});