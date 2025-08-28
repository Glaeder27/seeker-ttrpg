/*v2.30 2025-08-28T08:23Z - character-sheet.js*/

// ==============================
// Imports Firebase Realtime Database
// ==============================
import { realtimeDB } from "/scripts/config.js";
import { ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// ==============================
// UID utente (da sostituire con auth.currentUser.uid)
// ==============================
const userId = "demoUser123"; // esempio temporaneo
const db = realtimeDB;

// ==============================
// Funzioni Database
// ==============================
export async function saveCharacter(userId, characterData) {
  try {
    await set(ref(db, "characters/" + userId), characterData);
    console.log("Scheda salvata!");
  } catch (err) {
    console.error("Errore salvataggio:", err);
  }
}

export async function loadCharacter(userId) {
  try {
    const snapshot = await get(child(ref(db), "characters/" + userId));
    if (snapshot.exists()) return snapshot.val();
    return null;
  } catch (err) {
    console.error("Errore caricamento:", err);
    return null;
  }
}

// ==============================
// DOMContentLoaded: gestione sidebar e sezioni dinamiche
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".cs-sidebar-button");
  const content = document.getElementById("sheetContent");

  async function loadSection(section) {
    const file = `character-sheet-${section}.html`;
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error("Failed to load " + file);
      const html = await res.text();
      content.innerHTML = html;

      // Listener su tutti i campi dinamici
      content.querySelectorAll("[data-field]").forEach(field => {
        field.addEventListener("input", saveSheet);
      });

      // Se identity: inizializza nomi e icone
      if (section === "identity") initCharacterIdentity();

      enableAutoResize(content);

    } catch (err) {
      content.innerHTML = `<p class="cs-error">Error loading section: ${err.message}</p>`;
    }
  }

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.setAttribute("aria-selected", "false"));
      btn.setAttribute("aria-selected", "true");
      loadSection(btn.getAttribute("data-section"));
    });
  });

  // Carica sezione di default
  const defaultBtn = document.querySelector(".cs-sidebar-button[aria-selected='true']");
  if (defaultBtn) loadSection(defaultBtn.getAttribute("data-section"));
});

// ==============================
// Character Identity
// ==============================
function initCharacterIdentity() {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);

  const oathSelect = $("#oath");
  const oathImg = $("#oathImg");
  const namePrefix = $("#namePrefix");
  if (!oathSelect || !oathImg || !namePrefix) return;

  const iconMap = {
    england: "/assets/images/webp/allegiance/allegiance-crown-of-england.webp",
    spain: "/assets/images/webp/allegiance/allegiance-crown-of-spain.webp",
    papacy: "/assets/images/webp/allegiance/allegiance-papacy.webp"
  };

  const prefixMap = {
    england: "Seeker",
    spain: "Buscador",
    papacy: "Inquisitor"
  };

  oathSelect.addEventListener("change", () => {
    const val = oathSelect.value;
    namePrefix.textContent = prefixMap[val] || "";
    if (iconMap[val]) {
      oathImg.src = iconMap[val];
      oathImg.classList.remove("hidden");
    } else {
      oathImg.src = "";
      oathImg.classList.add("hidden");
    }
    saveSheet();
  });
}

// ==============================
// Auto-resize textarea
// ==============================
function enableAutoResize(context = document) {
  context.querySelectorAll(".auto-resize").forEach(textarea => {
    const resize = () => {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = parseInt(getComputedStyle(textarea).maxHeight) || 500;
      textarea.style.height = Math.min(scrollHeight, maxHeight) + "px";
    };
    resize();
    textarea.addEventListener("input", resize);
  });
}

// ==============================
// Aptitudes
// ==============================
const aptitudeBar = document.getElementById("aptitudeBar");

const aptitudes = [
  { name: "Strength", icon: "/assets/icons/svg/aptitudes/strength-ico.svg" },
  { name: "Agility", icon: "/assets/icons/svg/aptitudes/agility-ico.svg" },
  { name: "Vigor", icon: "/assets/icons/svg/aptitudes/vigor-ico.svg" },
  { name: "Perception", icon: "/assets/icons/svg/aptitudes/perception-ico.svg" },
  { name: "Intellect", icon: "/assets/icons/svg/aptitudes/intellect-ico.svg" },
  { name: "Adaptability", icon: "/assets/icons/svg/aptitudes/adaptability-ico.svg" },
  { name: "Charisma", icon: "/assets/icons/svg/aptitudes/charisma-ico.svg" },
  { name: "Insight", icon: "/assets/icons/svg/aptitudes/insight-ico.svg" },
  { name: "Willpower", icon: "/assets/icons/svg/aptitudes/willpower-ico.svg" }
];

aptitudes.forEach(a => {
  const box = document.createElement("div");
  box.className = "aptitude-box";

  const wrapper = document.createElement("div");
  wrapper.className = "aptitude-input-wrapper";
  wrapper.style.setProperty('--aptitude-icon', `url(${a.icon})`);

  const plus = document.createElement("button");
  plus.type = "button";
  plus.textContent = "+";
  plus.className = "aptitude-btn";

  const input = document.createElement("input");
  input.type = "number";
  input.min = 1;
  input.max = 5;
  input.value = 1;
  input.readOnly = true;
  input.dataset.field = a.name.toLowerCase();
  input.id = `apt-${a.name.toLowerCase()}`;

  const minus = document.createElement("button");
  minus.type = "button";
  minus.textContent = "–";
  minus.className = "aptitude-btn";

  plus.addEventListener("click", () => {
    input.value = Math.min(parseInt(input.value)+1, 5);
    saveSheet();
  });
  minus.addEventListener("click", () => {
    input.value = Math.max(parseInt(input.value)-1, 1);
    saveSheet();
  });

  input.addEventListener("input", saveSheet);

  wrapper.appendChild(plus);
  wrapper.appendChild(input);
  wrapper.appendChild(minus);

  const label = document.createElement("div");
  label.className = "aptitude-name";
  label.textContent = a.name;

  box.appendChild(wrapper);
  box.appendChild(label);
  aptitudeBar.appendChild(box);
});

// ==============================
// Salvataggio dinamico della scheda
// ==============================
function saveSheet() {
  const data = { updatedAt: new Date().toISOString() };

  // Identity
  const characterNameInput = document.querySelector("#character-name");
  const oathSelect = document.querySelector("#oath");
  if (characterNameInput) data.name = characterNameInput.value;
  if (oathSelect) data.oath = oathSelect.value;

  // Aptitudes
  data.aptitudes = {};
  document.querySelectorAll(".aptitude-input-wrapper input").forEach(input => {
    data.aptitudes[input.dataset.field] = parseInt(input.value);
  });

  // Altri campi dinamici
  document.querySelectorAll("[data-field]").forEach(field => {
    const key = field.dataset.field;
    if (!data[key]) data[key] = field.value;
  });

  saveCharacter(userId, data);
}

// ==============================
// Caricamento dati all'avvio
// ==============================
window.addEventListener("DOMContentLoaded", async () => {
  const data = await loadCharacter(userId);
  if (!data) return;

  const characterNameInput = document.querySelector("#character-name");
  const oathSelect = document.querySelector("#oath");
  if (data.name && characterNameInput) characterNameInput.value = data.name;
  if (data.oath && oathSelect) oathSelect.value = data.oath;

  if (data.aptitudes) {
    document.querySelectorAll(".aptitude-input-wrapper input").forEach(input => {
      const key = input.dataset.field;
      if (data.aptitudes[key] !== undefined) input.value = data.aptitudes[key];
    });
  }

  // Sezioni dinamiche
  document.querySelectorAll("[data-field]").forEach(field => {
    const key = field.dataset.field;
    if (data[key] !== undefined) field.value = data[key];
  });
});
