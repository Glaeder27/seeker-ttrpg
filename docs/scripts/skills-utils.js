/*v1.3 2025-08-19T14:33:25.890Z*/

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

// ─── Initialize augmentation tooltips (.slot img) ───
function initializeAugmentationTooltips() {
  const { tooltip, icon, title, description } = createAugmentationTooltipBox();

  let hideTooltipTimeout = null;

  function showAugTooltip(img) {
    if (hideTooltipTimeout) clearTimeout(hideTooltipTimeout);
    img.classList.add("active-aug-tooltip");

    const augId = img.dataset.augId;
    const aug = augmentationsData.find((a) => a.id === augId);

    if (!aug) {
      title.textContent = "Unknown Augmentation";
      description.textContent = "";
      icon.innerHTML = "";
    } else {
      title.textContent = aug.name;
      description.textContent = aug.effect || "";
      icon.innerHTML = `<img src="${aug.icon}" alt="${aug.name}" style="width:24px;height:24px;">`;
    }

    const rect = img.getBoundingClientRect();
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

  // Mostra tooltip su hover
  document.addEventListener("mouseover", (e) => {
    if (suppressAugTooltip) return;
    if (e.target.matches(".slot img")) showAugTooltip(e.target);
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.matches(".slot img")) hideAugTooltip();
  });

  // Nascondi tooltip se clicchi sull'immagine
  document.addEventListener("click", (e) => {
    if (e.target.matches(".slot img")) {
      console.log("Clicked augmentation, hiding tooltip");
      forceHideAugTooltip();
      suppressAugTooltip = true;
      setTimeout(() => (suppressAugTooltip = false), 150);
    }
  });

  // Mantieni tooltip visibile se ci passi sopra
  tooltip.addEventListener("mouseenter", () => {
    if (hideTooltipTimeout) clearTimeout(hideTooltipTimeout);
  });

  tooltip.addEventListener("mouseleave", () => {
    forceHideAugTooltip();
  });
}

// Chiamare questa funzione dopo che augmentationsData e slot sono caricati
initializeAugmentationTooltips();
