// === character-sheet.js ===

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

    // Se la sezione caricata è identity, inizializza gli script
    if (section === "identity") {
      initCharacterIdentity();
    }
    // Applica auto-resize sui textarea appena caricati
      enableAutoResize();
  } catch (err) {
    content.innerHTML = `<p class="cs-error">Error loading section: ${err.message}</p>`;
  }
}


  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // aggiorna stato attivo
      buttons.forEach((b) => b.setAttribute("aria-selected", "false"));
      btn.setAttribute("aria-selected", "true");

      // carica sezione
      const section = btn.getAttribute("data-section");
      loadSection(section);
    });
  });

  // Carica la sezione di default (quella con aria-selected="true")
  const defaultBtn = document.querySelector(".cs-sidebar-button[aria-selected='true']");
  if (defaultBtn) {
    loadSection(defaultBtn.getAttribute("data-section"));
  }
});

// === Character Identity Script Init ===
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
  });
}

// === Text Area Auto-resize ===
function enableAutoResize(selector = ".auto-resize", context = document) {
    const textareas = context.querySelectorAll(selector);

    textareas.forEach(textarea => {
        const resize = () => {
            textarea.style.height = "auto"; // reset
            const scrollHeight = textarea.scrollHeight;
            const maxHeight = parseInt(getComputedStyle(textarea).maxHeight);
            textarea.style.height = Math.min(scrollHeight, maxHeight) + "px";
        };

        resize(); // iniziale
        textarea.addEventListener("input", resize);
    });
}

// Attiva su DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => enableAutoResize());

// === Aptitudes ===
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

    // imposta l'icona come ::before tramite CSS custom property
    wrapper.style.setProperty('--aptitude-icon', `url(${a.icon})`);

    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.className = "aptitude-btn";

    const input = document.createElement("input");
    input.type = "number";
    input.min = 1;
    input.max = 5;
    input.value = 1; // default value
    input.readOnly = true;

    // identifica l'input per Firebase
    input.dataset.field = a.name.toLowerCase();
    input.id = `apt-${a.name.toLowerCase()}`;

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "–";
    minus.className = "aptitude-btn";

    plus.addEventListener("click", () => {
        input.value = Math.min(parseInt(input.value)+1, 5);
        // saveToFirebase(input.dataset.field, parseInt(input.value));
    });
    minus.addEventListener("click", () => {
        input.value = Math.max(parseInt(input.value)-1, 1);
        // saveToFirebase(input.dataset.field, parseInt(input.value));
    });

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