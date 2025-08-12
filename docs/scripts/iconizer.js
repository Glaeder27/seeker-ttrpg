/*v1.2 2025-08-12T16:22:02.480Z*/

document.addEventListener("DOMContentLoaded", () => {
  fetch("/data/iconizer.json")
    .then((res) => res.json())
    .then((replacements) => {
      const keys = Object.keys(replacements).map((k) => escapeRegex(k));
      const pattern = new RegExp(`\\b(${keys.join("|")})\\b`, "g");

      document.querySelectorAll("span.iconize").forEach((span) => {
        span.innerHTML = span.innerHTML.replace(pattern, (match) => {
          console.log("Matched:", match); // Qui logga cosa trova
          const rep = replacements[match];
          if (!rep) {
            console.log("No replacement for:", match); // Se non trova la chiave nel JSON
            return match;
          }
          const imgHtml = `<img src="${rep.img}" alt="${rep.title}" title="${rep.title}" class="iconized-text">`;
          console.log("Replacing with:", imgHtml); // Cosa va a inserire
          return imgHtml;
        });
      });
    })
    .catch((err) => console.error("Iconizer error loading JSON:", err));
});

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
