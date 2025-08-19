/*v1.4 2025-08-19T21:16:04.245Z*/

// ─── Iconizer global ───
let iconizerReplacements = null;

// Carica i dati JSON una volta sola
async function loadIconizerData() {
  if (!iconizerReplacements) {
    try {
      const res = await fetch("/data/iconizer.json");
      iconizerReplacements = await res.json();
    } catch (err) {
      console.error("Iconizer error loading JSON:", err);
      iconizerReplacements = {};
    }
  }
  return iconizerReplacements;
}

// Funzione riutilizzabile: sostituisce le span.iconize nel container passato
function runIconizer(container = document) {
  if (!iconizerReplacements) return;

  const keys = Object.keys(iconizerReplacements).map(escapeRegex);
  if (!keys.length) return;
  const pattern = new RegExp(`\\b(${keys.join("|")})\\b`, "g");

  container.querySelectorAll("span.iconize").forEach((span) => {
    span.innerHTML = span.innerHTML.replace(pattern, (match) => {
      const rep = iconizerReplacements[match];
      if (!rep) return match;
      return `<img src="${rep.img}" alt="${rep.title}" title="${rep.title}" class="iconized-text">`;
    });
  });
}

// ─── Escape regex helper ───
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─── Inizializzazione automatica al DOMContentLoaded ───
document.addEventListener("DOMContentLoaded", async () => {
  await loadIconizerData();
  runIconizer(); // esegue su tutto il documento
});