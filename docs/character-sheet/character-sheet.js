/*v2.31 2025-08-28T10:15Z - character-sheet.js*/

// ==============================
// Imports Firebase Realtime Database
// ==============================
import { auth, realtimeDB } from "/scripts/config.js";
import {
  ref,
  set,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// ==============================
// UID utente
// ==============================
let currentUserId = null;
const db = realtimeDB;

// ==============================
// Funzioni Database
// ==============================
export async function saveCharacter(userId, characterData) {
  try {
    await set(ref(db, "characters/" + userId), characterData);
    console.log("Scheda salvata su Firebase!");
  } catch (err) {
    console.error("Errore salvataggio Firebase:", err);
  }
}

export async function loadCharacter(userId) {
  try {
    const snapshot = await get(child(ref(db), "characters/" + userId));
    if (snapshot.exists()) return snapshot.val();
    return null;
  } catch (err) {
    console.error("Errore caricamento Firebase:", err);
    return null;
  }
}

// ==============================
// DOMContentLoaded: gestione sidebar e sezioni dinamiche
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".cs-sidebar-button");
  const content = document.getElementById("sheetContent");

  // --- CARICAMENTO DATI LOCALI PER CAMPi FISSI (se non loggato) ---
  if (!currentUserId) {
    const savedData = localStorage.getItem("characterSheet");
    if (savedData) {
      const data = JSON.parse(savedData);

      // Ripristina tutti i campi con data-field e data-category
      document.querySelectorAll("[data-field]").forEach((field) => {
        const key = field.dataset.field;
        const category = field.dataset.category || "root";
        if (data[category] && data[category][key] !== undefined) {
          if (
            field.tagName === "INPUT" ||
            field.tagName === "TEXTAREA" ||
            field.tagName === "SELECT"
          ) {
            field.value = data[category][key];
          } else {
            field.textContent = data[category][key];
          }
        }
      });

      // Aggiorna l'Identity display (prefix + bandiera)
      if (data.identity && data.identity.oath) {
        updateIdentityDisplay(data.identity.oath);
      }
    }
  }

  async function loadSection(section) {
    const file = `character-sheet-${section}.html`;
    try {
      const res = await fetch(file);
      const html = await res.text();
      content.innerHTML = html;

      // Listener su tutti i campi dinamici
      content.querySelectorAll("[data-field]").forEach((field) => {
        field.addEventListener("input", saveSheet);
      });

      const bioField = content.querySelector("#bio");
      if (bioField) {
        bioField.addEventListener("input", saveSheetSuperDebounced);
      }

      // Se identity: inizializza nomi e icone
      if (section === "identity") initCharacterIdentity();

      enableAutoResize(content);

      // --- POPOLA DATI SALVATI SE PRESENTI ---
      let data = null;
      if (currentUserId) {
        data = await loadCharacter(currentUserId);
      } else {
        const savedData = localStorage.getItem("characterSheet");
        if (savedData) data = JSON.parse(savedData);
      }

      if (data) {
        content.querySelectorAll("[data-field]").forEach((field) => {
          const key = field.dataset.field;
          const category = field.dataset.category || "root";
          if (data[category] && data[category][key] !== undefined) {
            if (
              field.tagName === "INPUT" ||
              field.tagName === "TEXTAREA" ||
              field.tagName === "SELECT"
            ) {
              field.value = data[category][key];
            } else {
              field.textContent = data[category][key];
            }
          }
        });

        // Identity specifico
        if (section === "identity" && data.identity && data.identity.oath) {
          const oathSelect = document.querySelector("#oath");
          if (oathSelect) {
            oathSelect.value = data.identity.oath;
            updateIdentityDisplay(data.identity.oath);
          }
        }

        requestAnimationFrame(() => resizeAllAutoTextareas(content));
      }
    } catch (err) {
      content.innerHTML = `<p class="cs-error">Error loading section: ${err.message}</p>`;
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.setAttribute("aria-selected", "false"));
      btn.setAttribute("aria-selected", "true");
      loadSection(btn.getAttribute("data-section"));
    });
  });

  // --- Caricamento sezione di default ---
  const defaultBtn = document.querySelector(
    ".cs-sidebar-button[aria-selected='true']"
  );
  if (defaultBtn)
    loadSection(defaultBtn.getAttribute("data-section"));
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
    papacy: "/assets/images/webp/allegiance/allegiance-papacy.webp",
  };

  const prefixMap = {
    england: "Seeker",
    spain: "Buscador",
    papacy: "Inquisitor",
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
// Aggiorna prefix e bandiera
function updateIdentityDisplay(oathValue) {
  const oathImg = document.querySelector("#oathImg");
  const namePrefix = document.querySelector("#namePrefix");

  const iconMap = {
    england: "/assets/images/webp/allegiance/allegiance-crown-of-england.webp",
    spain: "/assets/images/webp/allegiance/allegiance-crown-of-spain.webp",
    papacy: "/assets/images/webp/allegiance/allegiance-papacy.webp",
  };

  const prefixMap = {
    england: "Seeker",
    spain: "Buscador",
    papacy: "Inquisitor",
  };

  namePrefix.textContent = prefixMap[oathValue] || "";
  if (iconMap[oathValue]) {
    oathImg.src = iconMap[oathValue];
    oathImg.classList.remove("hidden");
  } else {
    oathImg.src = "";
    oathImg.classList.add("hidden");
  }
}

// ==============================
// Auto-resize textarea
// ==============================
function enableAutoResize(context = document) {
  context.querySelectorAll(".auto-resize").forEach((textarea) => {
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
function resizeAllAutoTextareas(context = document) {
  context.querySelectorAll(".auto-resize").forEach((textarea) => {
    textarea.style.height = "auto";
    textarea.style.height =
      Math.min(
        textarea.scrollHeight,
        parseInt(getComputedStyle(textarea).maxHeight) || 500
      ) + "px";
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
  {
    name: "Perception",
    icon: "/assets/icons/svg/aptitudes/perception-ico.svg",
  },
  { name: "Intellect", icon: "/assets/icons/svg/aptitudes/intellect-ico.svg" },
  {
    name: "Adaptability",
    icon: "/assets/icons/svg/aptitudes/adaptability-ico.svg",
  },
  { name: "Charisma", icon: "/assets/icons/svg/aptitudes/charisma-ico.svg" },
  { name: "Insight", icon: "/assets/icons/svg/aptitudes/insight-ico.svg" },
  { name: "Willpower", icon: "/assets/icons/svg/aptitudes/willpower-ico.svg" },
];

aptitudes.forEach((a) => {
  const box = document.createElement("div");
  box.className = "aptitude-box";

  const wrapper = document.createElement("div");
  wrapper.className = "aptitude-input-wrapper";
  wrapper.style.setProperty("--aptitude-icon", `url(${a.icon})`);

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
  input.dataset.category = "aptitudes";
  input.id = `apt-${a.name.toLowerCase()}`;

  const minus = document.createElement("button");
  minus.type = "button";
  minus.textContent = "–";
  minus.className = "aptitude-btn";

  plus.addEventListener("click", () => {
    input.value = Math.min(parseInt(input.value) + 1, 5);
    saveSheetDebounced();
  });
  minus.addEventListener("click", () => {
    input.value = Math.max(parseInt(input.value) - 1, 1);
    saveSheetDebounced();
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
// Salvataggio dinamico della scheda con categorie automatiche
// ==============================
function saveSheet() {
  // Oggetto dati iniziale
  const data = {
    utils: { updatedAt: new Date().toISOString() }
  };

  // Seleziona **tutti i campi** con data-field in tutto il documento
  document.querySelectorAll("[data-field]").forEach(field => {
    const key = field.dataset.field;
    if (!key) return;

    // Categoria (identity, aptitudes, ecc.)
    const category = field.dataset.category || "root";
    if (!data[category]) data[category] = {};

    // Valore del campo
    let value;
    if (field.tagName === "INPUT" || field.tagName === "TEXTAREA" || field.tagName === "SELECT") {
      value = field.value;
    } else {
      value = field.textContent;
    }

    data[category][key] = value !== undefined ? value : null;
  });

  // --- Salvataggio ---
  if (currentUserId) {
    saveCharacter(currentUserId, data); // Firebase
  } else {
    localStorage.setItem("characterSheet", JSON.stringify(data));
    console.log("Scheda salvata localmente:", data);
  }
}

let saveTimeout = null;

function saveSheetDebounced() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveSheet, 500); // 500ms dopo l’ultimo input
}
function saveSheetSuperDebounced() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveSheet, 2000); // 2000ms dopo l’ultimo input
}

// ==============================
// Caricamento dati dopo login o da localStorage
// ==============================
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUserId = user.uid;
    console.log("Utente loggato:", currentUserId);

    // Carica dati da Firebase
    const data = await loadCharacter(currentUserId);
    if (!data) return;

    const characterNameInput = document.querySelector("#character-name");
    const oathSelect = document.querySelector("#oath");

    // Imposta i valori dei campi
    if (data.characterName && characterNameInput)
      characterNameInput.value = data.characterName;

    // <-- Qui imposto l'allegiance salvata
    if (data.oath && oathSelect) {
      oathSelect.value = data.oath;
      updateIdentityDisplay(data.oath); // Aggiorna prefix e bandiera subito
    }

    if (data.aptitudes) {
      document
        .querySelectorAll(".aptitude-input-wrapper input")
        .forEach((input) => {
          const key = input.dataset.field;
          if (data.aptitudes[key] !== undefined)
            input.value = data.aptitudes[key];
        });
    }

    document.querySelectorAll("[data-field]").forEach((field) => {
      const key = field.dataset.field;
      if (data[key] !== undefined) field.value = data[key];
    });

    requestAnimationFrame(() => {
      resizeAllAutoTextareas();
    });
  } else {
    currentUserId = null;
    console.log("Utente non loggato: carico dati locali.");

    const savedData = localStorage.getItem("characterSheet");
    if (savedData) {
      const data = JSON.parse(savedData);
      const characterNameInput = document.querySelector("#character-name");
      const oathSelect = document.querySelector("#oath");

      if (data.name && characterNameInput) characterNameInput.value = data.name;

      // <-- Anche qui imposto l'allegiance salvata
      if (data.oath && oathSelect) {
        oathSelect.value = data.oath;
        updateIdentityDisplay(data.oath); // Aggiorna prefix e bandiera subito
      }

      if (data.aptitudes) {
        document
          .querySelectorAll(".aptitude-input-wrapper input")
          .forEach((input) => {
            const key = input.dataset.field;
            if (data.aptitudes[key] !== undefined)
              input.value = data.aptitudes[key];
          });
      }

      document.querySelectorAll("[data-field]").forEach((field) => {
        const key = field.dataset.field;
        if (data[key] !== undefined) field.value = data[key];
      });
    }
  }
});

// --- Save Button ---
const saveBtn = document.getElementById("saveButton");
if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    saveSheet();
    alert("Character saved!"); // feedback rapido
  });
}