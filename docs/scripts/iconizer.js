/*v1.3 2025-08-12T16:24:43.839Z*/

document.addEventListener("DOMContentLoaded", () => {
  fetch("/data/iconizer.json")
    .then((res) => res.json())
    .then((replacements) => {
      const keys = Object.keys(replacements).map((k) => escapeRegex(k));
      const pattern = new RegExp(`\\b(${keys.join("|")})\\b`, "g");

      document.querySelectorAll("span.iconize").forEach((span) => {
        span.innerHTML = span.innerHTML.replace(pattern, (match) => {
          const rep = replacements[match];
          if (!rep) return match;
          return `<img src="${rep.img}" alt="${rep.title}" title="${rep.title}" class="iconized-text">`;
        });
      });
    })
    .catch((err) => console.error("Iconizer error loading JSON:", err));
});

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
