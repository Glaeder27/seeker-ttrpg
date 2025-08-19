/*v1.10 2025-08-19T20:18:16.281Z*/

// ─── Tooltip Aug globale unico ───
let augTooltip = null;
let augTooltipSuppress = false;

function getAugTooltip() {
  if (!augTooltip) {
    const tooltip = document.createElement("div");
    tooltip.classList.add("aug-tooltip-box");
    tooltip.style.pointerEvents = "none";
    tooltip.style.opacity = "0";
    tooltip.style.transition = "opacity 0.2s ease, transform 0.2s ease";
    tooltip.style.transform = "translateY(4px)";
    tooltip.style.position = "absolute";
    tooltip.style.zIndex = "10000";

    const header = document.createElement("div");
    header.classList.add("aug-tooltip-header");

    const icon = document.createElement("div");
    icon.classList.add("aug-tooltip-icon");

    const title = document.createElement("strong");
    title.classList.add("aug-tooltip-title");

    header.appendChild(icon);
    header.appendChild(title);

    const description = document.createElement("div");
    description.classList.add("aug-tooltip-description");

    tooltip.appendChild(header);
    tooltip.appendChild(description);
    document.body.appendChild(tooltip);

    augTooltip = { tooltip, icon, title, description };
  }
  return augTooltip;
}

// ─── Mostra tooltip ───
function showAugTooltip(el, data) {
  if (augTooltipSuppress) return;
  const { tooltip, icon, title, description } = getAugTooltip();

  title.textContent = data?.name || "Unknown";
  description.textContent = data?.effect || data?.definition || "";
  icon.innerHTML = data?.icon
    ? `<img src="${data.icon}" alt="${data.name}" style="width:24px;height:24px;">`
    : "";

  const rect = el.getBoundingClientRect();
  tooltip.style.left = rect.left + window.scrollX + "px";
  tooltip.style.top = rect.bottom + window.scrollY + 8 + "px";
  tooltip.style.opacity = "1";
  tooltip.style.pointerEvents = "auto";
  tooltip.style.transform = "translateY(0)";
}

// ─── Nascondi tooltip ───
function hideAugTooltip() {
  const { tooltip } = getAugTooltip();
  tooltip.style.opacity = "0";
  tooltip.style.pointerEvents = "none";
  tooltip.style.transform = "translateY(4px)";
}

// ─── Funzione globale per chiudere manualmente ───
window.forceHideAugTooltip = hideAugTooltip;

// ─── Initialize tooltip delegation ───
function initializeAugmentationTooltips(augmentationsData) {
  const container = document.getElementById("skillContainer");
  if (!container) return;

  let hideTimeout = null;

  container.addEventListener("mouseover", (e) => {
    const el = e.target.closest("[data-aug-id]");
    if (!el || augTooltipSuppress) return;

    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }

    const augId = el.dataset.augId;
    const augData = augmentationsData.find((a) => a.id == augId);
    if (!augData) return;

    showAugTooltip(el, augData);
  });

  container.addEventListener("mouseout", (e) => {
    const el = e.target.closest("[data-aug-id]");
    if (!el) return;

    // Delay semplice per evitare flicker
    hideTimeout = setTimeout(() => {
      hideAugTooltip();
      hideTimeout = null;
    }, 100); // 100ms basta per togliere il flicker
  });

  container.addEventListener("click", (e) => {
    const el = e.target.closest("[data-aug-id]");
    if (!el) return;
    augTooltipSuppress = true;
    hideAugTooltip();
    setTimeout(() => (augTooltipSuppress = false), 150);
  });
}

// ─── Replace Data Placeholders ───
function replacePlaceholders(text, data) {
  if (!text) return "";
  return text.replace(/{{(.*?)}}/g, (_, key) => {
    const trimmedKey = key.trim();
    return data[trimmedKey] ?? `{{${trimmedKey}}}`;
  });
}
