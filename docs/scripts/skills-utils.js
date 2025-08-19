/*v1.4 2025-08-19T14:41:37.187Z*/

let suppressAugTooltip = false;

// ─── Tooltip Container Factory ───
function createAugmentationTooltipBox() {
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

// ─── Initialize augmentation tooltips (.slot img + .aug-tag) ───
function initializeAugmentationTooltips() {
  const { tooltip, icon, title, description } = createAugmentationTooltipBox();
  let hideTooltipTimeout = null;

  function showAugTooltip(el, data) {
    if (hideTooltipTimeout) clearTimeout(hideTooltipTimeout);
    el.classList.add("active-aug-tooltip");

    if (!data) {
      title.textContent = "Unknown";
      description.textContent = "";
      icon.innerHTML = "";
    } else {
      title.textContent = data.name;
      description.textContent = data.effect || data.definition || "";
      icon.innerHTML = data.icon ? `<img src="${data.icon}" alt="${data.name}" style="width:24px;height:24px;">` : "";
    }

    const rect = el.getBoundingClientRect();
    tooltip.style.left = rect.left + window.scrollX + "px";
    tooltip.style.top = rect.bottom + window.scrollY + 8 + "px";
    tooltip.classList.add("visible");
    tooltip.style.pointerEvents = "auto";
  }

  function hideAugTooltip() {
    hideTooltipTimeout = setTimeout(() => {
      document.querySelectorAll(".active-aug-tooltip").forEach((el) =>
        el.classList.remove("active-aug-tooltip")
      );
      tooltip.classList.remove("visible");
      tooltip.style.pointerEvents = "none";
    }, 150);
  }

  function forceHideAugTooltip() {
    if (hideTooltipTimeout) clearTimeout(hideTooltipTimeout);
    hideTooltipTimeout = null;

    document.querySelectorAll(".active-aug-tooltip").forEach((el) =>
      el.classList.remove("active-aug-tooltip")
    );

    tooltip.classList.remove("visible");
    tooltip.style.pointerEvents = "none";
  }

  // ─── Hover sui slot delle augmentation ───
  document.addEventListener("mouseover", (e) => {
    if (suppressAugTooltip) return;
    if (e.target.matches(".slot img")) {
      const augId = e.target.dataset.augId;
      const augData = augmentationsData.find((a) => a.id === augId);
      showAugTooltip(e.target, augData);
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.matches(".slot img")) hideAugTooltip();
  });

  // ─── Click per forzare la chiusura dei tooltip ───
  document.addEventListener("click", (e) => {
    if (e.target.matches(".slot img, .aug-tag")) {
      forceHideAugTooltip();
      suppressAugTooltip = true;
      setTimeout(() => (suppressAugTooltip = false), 150);
    }
  });

  // ─── Hover su eventuali custom tags (solo classe .aug-tag) ───
  document.querySelectorAll(".aug-tag").forEach((tagEl) => {
    tagEl.addEventListener("mouseenter", () => {
      const tagKey = tagEl.textContent.trim();
      const tagData = tagDefinitions[tagKey]; // usa i tuoi dati per tooltip custom
      showAugTooltip(tagEl, tagData);
    });
    tagEl.addEventListener("mouseleave", () => hideAugTooltip());
  });

  tooltip.addEventListener("mouseenter", () => {
    if (hideTooltipTimeout) clearTimeout(hideTooltipTimeout);
  });

  tooltip.addEventListener("mouseleave", () => {
    forceHideAugTooltip();
  });
}

// Chiamare questa funzione dopo che augmentationsData e slot sono caricati
initializeAugmentationTooltips();
