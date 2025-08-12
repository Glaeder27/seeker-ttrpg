/*v1.0 2025-08-12T16:00:24.256Z*/

document.addEventListener("DOMContentLoaded", () => {
  fetch("/data/iconizer.json")
    .then((res) => res.json())
    .then((replacements) => {
      const keys = Object.keys(replacements).map((k) => escapeRegex(k));
      const pattern = new RegExp(`\\b(${keys.join("|")})\\b`, "g");

      document.querySelectorAll("span.iconize").forEach((span) => {
        span.innerHTML = span.innerHTML.replace(
          pattern,
          (match) => replacements[match] || match
        );
      });
    })
    .catch((err) => console.error("Iconizer error loading JSON:", err));
});

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
