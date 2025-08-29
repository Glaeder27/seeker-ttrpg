/*v2.33 2025-08-29T19:15Z - character-sheet.js (full script, image save/load fix)*/

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
// DOMContentLoaded: gestione sidebar, sezioni dinamiche e immagine personaggio
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".cs-sidebar-button");
  const content = document.getElementById("sheetContent");

  // --- CARICAMENTO DATI LOCALI PER CAMPi FISSI (se non loggato) ---
  if (!currentUserId) {
    const savedData = localStorage.getItem("characterSheet");
    if (savedData) {
      const data = JSON.parse(savedData);

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

      if (data.identity && data.identity.oath) {
        updateIdentityDisplay(data.identity.oath);
      }

      // --- Ripristina immagine personaggio se salvata ---
      if (data.characterImage) {
        const characterImg = document.getElementById("characterImg");
        if (characterImg) characterImg.src = data.characterImage;
      }
    }
  }

  async function loadSection(section) {
    const file = `character-sheet-${section}.html`;
    try {
      const res = await fetch(file);
      const html = await res.text();
      content.innerHTML = html;

      content.querySelectorAll("[data-field]").forEach((field) => {
        if (field.tagName === "TEXTAREA") return;
        field.addEventListener("input", saveSheet);
      })

      content.querySelectorAll("textarea[data-field]").forEach((textarea) => {
        textarea.addEventListener("input", saveSheetSuperDebounced);
      });

      if (section === "identity") {
        initCharacterIdentity();

        // --- Gestione caricamento immagine personaggio ---
        const uploadInput = document.getElementById("uploadCharacterImg");
        const pictureBox = document.getElementById("characterPicture");
        const characterImg = document.getElementById("characterImg");

        if (uploadInput && pictureBox && characterImg) {
          pictureBox.addEventListener("click", () => uploadInput.click());

          uploadInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const maxSize = 1024 * 1024;
            const maxWidth = 500;
            const maxHeight = 500;

            if (file.size > maxSize) {
              alert("Image too large. Max 1MB.");
              uploadInput.value = "";
              return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
              const img = new Image();
              img.onload = () => {
                if (img.width > maxWidth || img.height > maxHeight) {
                  alert(`Image too large. Max ${maxWidth}x${maxHeight}px`);
                  uploadInput.value = "";
                  return;
                }

                // Imposta src e data-field
                characterImg.src = event.target.result;
                characterImg.dataset.field = "characterImage";

                // Salva tutta la scheda
                saveSheet();
              };
              img.src = event.target.result;
            };
            reader.readAsDataURL(file);
          });
        }
      }

      enableAutoResize(content);
      enableAutoResize(document);

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

        if (section === "identity" && data.identity && data.identity.oath) {
          const oathSelect = document.querySelector("#oath");
          if (oathSelect) {
            oathSelect.value = data.identity.oath;
            updateIdentityDisplay(data.identity.oath);
          }
        }

        // --- Restore immagine se presente ---
        if (section === "identity" && data.identity?.characterImage) {
          const characterImg = document.getElementById("characterImg");
          if (characterImg) characterImg.src = data.identity.characterImage;
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

  const defaultBtn = document.querySelector(
    ".cs-sidebar-button[aria-selected='true']"
  );
  if (defaultBtn) loadSection(defaultBtn.getAttribute("data-section"));
});

// ==============================
// Funzione ausiliaria per salvare solo un campo
// ==============================
function saveSheetField(fieldName, value) {
  let data = {};
  if (currentUserId) {
    loadCharacter(currentUserId).then((loaded) => {
      data = loaded || {};
      if (!data.identity) data.identity = {};
      data.identity[fieldName] = value;
      saveCharacter(currentUserId, data);
    });
  } else {
    const saved = localStorage.getItem("characterSheet");
    data = saved ? JSON.parse(saved) : {};
    if (!data.identity) data.identity = {};
    data.identity[fieldName] = value;
    localStorage.setItem("characterSheet", JSON.stringify(data));
  }
}

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
      textarea.style.height = textarea.scrollHeight + "px";
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
// Aptitudes con categorie + tags
// ==============================
const aptitudeBar = document.getElementById("aptitudeBar");

const aptitudeCategories = {
  Combat: [
    { name: "Strength", icon: "/assets/icons/svg/aptitudes/strength-ico.svg" },
    { name: "Agility", icon: "/assets/icons/svg/aptitudes/agility-ico.svg" },
    { name: "Vigor", icon: "/assets/icons/svg/aptitudes/vigor-ico.svg" },
  ],
  Exploration: [
    {
      name: "Perception",
      icon: "/assets/icons/svg/aptitudes/perception-ico.svg",
    },
    {
      name: "Intellect",
      icon: "/assets/icons/svg/aptitudes/intellect-ico.svg",
    },
    {
      name: "Adaptability",
      icon: "/assets/icons/svg/aptitudes/adaptability-ico.svg",
    },
  ],
  Social: [
    { name: "Charisma", icon: "/assets/icons/svg/aptitudes/charisma-ico.svg" },
    { name: "Insight", icon: "/assets/icons/svg/aptitudes/insight-ico.svg" },
    {
      name: "Willpower",
      icon: "/assets/icons/svg/aptitudes/willpower-ico.svg",
    },
  ],
};

// Mappa dei tag (1 → negativo, 5 → positivo)
const aptitudeTags = {
  strength: { 1: "Weak", 5: "Mighty" },
  agility: { 1: "Clumsy", 5: "Swift" },
  vigor: { 1: "Frail", 5: "Resilient" },
  perception: { 1: "Distracted", 5: "Vigilant" },
  intellect: { 1: "Dull", 5: "Brilliant" },
  adaptability: { 1: "Rigid", 5: "Versatile" },
  charisma: { 1: "Uncouth", 5: "Magnetic" },
  insight: { 1: "Naive", 5: "Discerning" },
  willpower: { 1: "Volatile", 5: "Stoic" },
};

// Funzione per aggiornare il tag
function updateAptitudeTag(input, tagContainer) {
  const aptitudeName = input.dataset.field;
  const value = parseInt(input.value, 10);
  const tags = aptitudeTags[aptitudeName];

  tagContainer.innerHTML = ""; // pulisco
  if (tags && (value === 1 || value === 5)) {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = tags[value];
    tagContainer.appendChild(span);
  }

  // --- Riattiva tooltip su questo tag appena creato ---
  if (window.applyTagIcons) applyTagIcons();
  if (window.initializeTagTooltips) initializeTagTooltips(tagContainer);
}

// Funzione per aggiornare lo stile dei valori numerici
function updateAptitudeValueStyle(input) {
  const value = parseInt(input.value, 10);

  if (value === 5) {
    input.style.color = "var(--ancient-gold)";
  } else if (value === 1) {
    input.style.color = "var(--text-muted)";
  } else {
    input.style.color = "";
    input.style.fontWeight = "";
    input.style.fontSize = "";
  }
}

// Costruzione dinamica UI
Object.entries(aptitudeCategories).forEach(([categoryName, aptitudes]) => {
  const categoryBox = document.createElement("div");
  categoryBox.className = "aptitude-category " + categoryName.toLowerCase();

  const title = document.createElement("h5");
  title.textContent = categoryName;
  categoryBox.appendChild(title);

  const aptitudeGroup = document.createElement("div");
  aptitudeGroup.className = "aptitude-group";

  aptitudes.forEach((a) => {
    const box = document.createElement("div");
    box.className = "aptitude-box";

    const aptitudeWrapper = document.createElement("div");
    aptitudeWrapper.className = "aptitude-input-wrapper";
    aptitudeWrapper.style.setProperty("--aptitude-icon", `url(${a.icon})`);

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

    const label = document.createElement("div");
    label.className = "aptitude-name";
    label.textContent = a.name;

    const tagContainer = document.createElement("div");
    tagContainer.className = "aptitude-tag";

    // Inizializza il tag
    updateAptitudeTag(input, tagContainer);
    updateAptitudeValueStyle(input);

    plus.addEventListener("click", () => {
      input.value = Math.min(parseInt(input.value) + 1, 5);
      updateAptitudeTag(input, tagContainer);
      updateAptitudeValueStyle(input);
      saveSheetDebounced();
    });
    minus.addEventListener("click", () => {
      input.value = Math.max(parseInt(input.value) - 1, 1);
      updateAptitudeTag(input, tagContainer);
      updateAptitudeValueStyle(input);
      saveSheetDebounced();
    });

    input.addEventListener("input", () => {
      updateAptitudeTag(input, tagContainer);
      updateAptitudeValueStyle(input);
      saveSheet();
    });

    aptitudeWrapper.appendChild(plus);
    aptitudeWrapper.appendChild(input);
    aptitudeWrapper.appendChild(minus);

    box.appendChild(aptitudeWrapper);
    box.appendChild(label);
    box.appendChild(tagContainer);

    aptitudeGroup.appendChild(box);
  });

  categoryBox.appendChild(aptitudeGroup);
  aptitudeBar.appendChild(categoryBox);
});

// ==============================
// Salvataggio dinamico della scheda con categorie automatiche
// ==============================
function saveSheet() {
  // Oggetto dati iniziale
  const data = {
    utils: { updatedAt: new Date().toISOString() },
  };

  // Seleziona **tutti i campi** con data-field in tutto il documento
  document.querySelectorAll("[data-field]").forEach((field) => {
    const key = field.dataset.field;
    if (!key) return;

    const category = field.dataset.category || "root";
    if (!data[category]) data[category] = {};

    let value;
    if (
      field.tagName === "INPUT" ||
      field.tagName === "TEXTAREA" ||
      field.tagName === "SELECT"
    ) {
      value = field.value;
    } else if (
      field.tagName === "IMG" &&
      field.dataset.field === "characterImage"
    ) {
      value = field.src;
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

          const tagContainer = input
            .closest(".aptitude-box")
            .querySelector(".aptitude-tag");
          updateAptitudeTag(input, tagContainer);
          updateAptitudeValueStyle(input);
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

            const tagContainer = input
              .closest(".aptitude-box")
              .querySelector(".aptitude-tag");
            updateAptitudeTag(input, tagContainer);
            updateAptitudeValueStyle(input);
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
