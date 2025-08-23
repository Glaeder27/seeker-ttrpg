let masteriesData = [];
const gridContainer = document.querySelector(".mastery-board");

// --- Carica masteries.json ---
async function loadMasteries() {
  const res = await fetch("/data/masteries.json");
  const data = await res.json();
  masteriesData = data.masteries;
  attachEvents();

  // --- render recap appena caricate le masteries ---
  const recapContainer = document.getElementById("masteryRecap");
  const selected = getSelectedMasteriesFromBoard(gridContainer, masteriesData);
  renderMasteryRecap(selected, recapContainer);
}

// --- Collega eventi ai bottoni già presenti ---
function attachEvents() {
  const hexes = gridContainer.querySelectorAll(".hex:not(.core)");
  hexes.forEach((hex) => {
    hex.addEventListener("click", () => openPicker(hex));
  });
}

// --- Tooltip globale Mastery ---
let masteryTooltip = null;
let masteryTooltipSuppress = false;

function getMasteryTooltip() {
  if (!masteryTooltip) {
    const tooltip = document.createElement("div");
    tooltip.classList.add("aug-tooltip-box", "no-before");
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

    masteryTooltip = { tooltip, icon, title, description };
  }
  return masteryTooltip;
}

function showMasteryTooltip(el, data) {
  if (masteryTooltipSuppress) return;
  const { tooltip, icon, title, description } = getMasteryTooltip();

  title.textContent = data?.name || "Unknown";
  description.innerHTML = `
    ${data?.description || ""}
    ${
      el.dataset.warning
        ? `<div class="aug-tooltip-warning" style="color:#f55; margin-top:4px; font-weight:bold;">${el.dataset.warning}</div>`
        : ""
    }
  `;

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

function hideMasteryTooltip() {
  const { tooltip } = getMasteryTooltip();
  tooltip.style.opacity = "0";
  tooltip.style.pointerEvents = "none";
  tooltip.style.transform = "translateY(4px)";
}

window.forceHideMasteryTooltipNow = function () {
  masteryTooltipSuppress = true;
  hideMasteryTooltip();
  requestAnimationFrame(() => (masteryTooltipSuppress = false));
};

// --- Apri picker ---
function openPicker(hex) {
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "rgba(0,0,0,0.5)";
  overlay.style.backdropFilter = "blur(4px)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = 9999;

  const picker = document.createElement("div");
  picker.classList.add("picker");
  picker.style.display = "grid";
  picker.style.gridTemplateColumns = "repeat(8, 1fr)";
  picker.style.gap = "6px";
  picker.style.background = "var(--background-dark-1)";
  picker.style.border = "1px solid var(--pale-beige)";
  picker.style.padding = "16px";
  picker.style.maxWidth = "90%";
  picker.style.maxHeight = "80%";
  picker.style.overflowY = "auto";
  overlay.appendChild(picker);

  const label = document.createElement("p");
  label.textContent = "Choose Mastery:";
  label.style.gridColumn = `1 / -1`;
  label.style.margin = "0 0 6px 0";
  label.style.fontWeight = "normal";
  picker.appendChild(label);

  const assignedIds = Array.from(
    document.querySelectorAll(".hex[data-mastery-id]")
  ).map((h) => h.dataset.masteryId);

  const grouped = masteriesData.reduce((acc, m) => {
    const cat = m.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(m);
    return acc;
  }, {});

  Object.entries(grouped).forEach(([category, masters]) => {
    const label = document.createElement("p");
    label.textContent = category;
    label.style.gridColumn = "1 / -1";
    label.style.margin = "6px 0 2px 0";
    label.style.color = "var(--ancient-gold)";
    label.style.borderBottom = "1px solid rgba(255,255,255,0.2)";
    picker.appendChild(label);

    masters.forEach((m) => {
      const icon = document.createElement("img");
      icon.src = m.icon || "/assets/icons/default.png";
      icon.alt = m.name;
      icon.title = m.name;
      icon.dataset.masteryId = m.id;
      icon.style.width = "50px";
      icon.style.height = "50px";
      icon.style.cursor = "pointer";

      const isTaken = assignedIds.includes(m.id);

      if (isTaken) {
        icon.style.opacity = "0.5";
        icon.style.border = "2px solid red";
        icon.dataset.warning = "Already assigned to another slot";

        icon.addEventListener("click", () => {
          const assignedHex = document.querySelector(
            `.hex[data-mastery-id="${m.id}"]`
          );
          if (assignedHex) {
            clearMastery(assignedHex);
          }
          forceHideMasteryTooltipNow();
          overlay.remove();
        });
      } else {
        icon.addEventListener("click", () => {
          assignMastery(hex, m);
          forceHideMasteryTooltipNow();
          overlay.remove();
        });
      }

      // --- Tooltip mouseenter/mouseleave ---
      icon.addEventListener("mouseenter", () => showMasteryTooltip(icon, m));
      icon.addEventListener("mouseleave", hideMasteryTooltip);

      picker.appendChild(icon);
    });
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);
}

function showMasteryTooltip(el, data) {
  if (masteryTooltipSuppress) return;
  const { tooltip, icon, title, description } = getMasteryTooltip();

  title.textContent = data?.name || "Unknown";
  description.innerHTML = `
    ${data?.description || ""}
    ${
      el.dataset.warning
        ? `<div class="aug-tooltip-warning" style="color:#f55; margin-top:4px; font-weight:bold;">${el.dataset.warning}</div>`
        : ""
    }
  `;

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

// --- Assegna mastery a un esagono ---
function assignMastery(hex, mastery) {
  hex.dataset.masteryId = mastery.id;
  hex.style.setProperty("--icon-url", `url(${mastery.icon})`);

  const enterListener = () => showMasteryTooltip(hex, mastery);
  const leaveListener = () => hideMasteryTooltip();

  hex._tooltipEnter = enterListener;
  hex._tooltipLeave = leaveListener;

  hex.addEventListener("mouseenter", enterListener);
  hex.addEventListener("mouseleave", leaveListener);

  const categoryColors = {
    Combat: "var(--category-combat)",
    Exploration: "var(--category-exploration)",
    Social: "var(--category-social)",
  };
  hex.style.setProperty(
    "--border-color",
    categoryColors[mastery.category] || "--category-locked"
  );

  const oldSlots = hex.querySelector(".slots");
  if (oldSlots) oldSlots.remove();

  const slotsContainer = document.createElement("div");
  slotsContainer.className = "slots";
  slotsContainer.style.display = "flex";
  slotsContainer.style.gap = "2px";
  slotsContainer.style.justifyContent = "center";

  hex.appendChild(slotsContainer);

  const selected = getSelectedMasteriesFromBoard(gridContainer, masteriesData);
  renderMasteryRecap(selected, recapContainer);
}

// --- Clear Mastery ---

function clearMastery(hex) {
  delete hex.dataset.masteryId;
  hex.style.removeProperty("--icon-url");
  hex.style.setProperty("--border-color", "var(--category-locked)");

  const oldSlots = hex.querySelector(".slots");
  if (oldSlots) oldSlots.remove();

  if (hex._tooltipEnter) {
    hex.removeEventListener("mouseenter", hex._tooltipEnter);
    delete hex._tooltipEnter;
  }
  if (hex._tooltipLeave) {
    hex.removeEventListener("mouseleave", hex._tooltipLeave);
    delete hex._tooltipLeave;
  }

  const selected = getSelectedMasteriesFromBoard(gridContainer, masteriesData);
  renderMasteryRecap(selected, recapContainer);
}

// --- Write Mastery Core text with enhanced formatting ---
function composeMasteryCore(mastery) {
  // Tags HTML
  const tagsHtml = (mastery.tags || [])
    .map((t) => `<span class="tag">${t}</span>`)
    .join(" ");

  // Struttura dell'elemento
  return `
    <li class="mastery-recap-item" style="margin-bottom: 12px;">
      <div class="mastery-name" style="font-weight:bold; font-size:1.1em;">${
        mastery.name
      }</div>
      <div class="mastery-tags" style="margin: 2px 0;">${tagsHtml}</div>
      <div class="mastery-description" style="font-size:0.95em; color:var(--muted);">
        ${mastery.description || ""}
      </div>
    </li>
  `;
}

// --- Render Mastery recap ---
function renderMasteryRecap(masteriesSelected, container) {
  if (!container) return;

  if (!masteriesSelected || masteriesSelected.length === 0) {
    container.innerHTML = `
    <div class="card mastery-recap">
      <h3 class="box-title">Selected Masteries</h3>
      <p class="muted">No Masteries selected yet.</p>
      </div>
  `;
    return;
  }

  const items = masteriesSelected.map(composeMasteryCore).join("");

  container.innerHTML = `
    <div class="card mastery-recap">
      <h3 class="box-title">Selected Masteries</h3>
      <ul>
        ${items}
      </ul>
    </div>
  `;
}

// --- Get Masteries from Board ---
function getSelectedMasteriesFromBoard(boardContainer, allMasteriesData) {
  const selectedIds = Array.from(
    boardContainer.querySelectorAll(".hex[data-mastery-id]")
  )
    .map((hex) => hex.dataset.masteryId)
    .filter(Boolean);

  // Recupera oggetti Mastery completi dai dati
  return selectedIds.map((id) => allMasteriesData.find((m) => m.id === id));
}

// --- Update Recap ---
const recapContainer = document.getElementById("masteryRecap");

gridContainer.addEventListener("click", () => {
  const selected = getSelectedMasteriesFromBoard(gridContainer, masteriesData);
  renderMasteryRecap(selected, recapContainer);
});

loadMasteries();
