const versionTargets = [
  { label: "📄 This page (.html)", path: location.pathname, isHTML: true },
  { label: "🔣 core.js", path: document.currentScript.src },
  { label: "🎨 style.css", path: "/style/style.css" },

  { label: "navbar.js", path: "/scripts/navbar.js" },
  { label: "sidenav.js", path: "/scripts/sidenav.js" },
  { label: "sidebar.js", path: "/scripts/sidebar.js" },
  { label: "infobox.js", path: "/scripts/infobox.js" },
  { label: "user-page.js", path: "/scripts/user-page.js" },
  { label: "auth.js", path: "/scripts/auth.js" },
  { label: "config.js", path: "/scripts/config.js" },

  { label: "archives.json", path: "/data/archives.json", isJSON: true },
  { label: "glossary.json", path: "/data/glossary.json", isJSON: true },
  { label: "iconizer.json", path: "/data/iconizer.json", isJSON: true },
  {
    label: "menu-lorebook.json",
    path: "/data/menu-lorebook.json",
    isJSON: true,
  },
  {
    label: "menu-rulebook.json",
    path: "/data/menu-rulebook.json",
    isJSON: true,
  },
  { label: "tags.json", path: "/data/tags.json", isJSON: true },
  { label: "tooltips.json", path: "/data/tooltips.json", isJSON: true },
];

const versionRegexHTML = /<!--\s*v([\d.]+)\s+([\d\-T:.Z]+)\s*-->/;
const versionRegexOther = /\/\*v([\d.]+)\s+([\d\-T:.Z]+)\*\//;

Promise.all(
  versionTargets.map((target) =>
    fetch(target.path)
      .then((res) => (res.ok ? res.text() : null))
      .then((text) => {
        if (!text) return { Resource: target.label, Version: "❌", Date: "" };

        if (target.isJSON) {
          try {
            const json = JSON.parse(text);
            return {
              Resource: target.label,
              Version: json.__version || "❓",
              Date: json.__versionDate || "",
            };
          } catch {
            return { Resource: target.label, Version: "❌", Date: "" };
          }
        }

        const match = target.isHTML
          ? text.slice(0, 500).match(versionRegexHTML)
          : text.match(versionRegexOther);

        return match
          ? {
              Resource: target.label,
              Version: `v${match[1]}`,
              Date: match[2],
            }
          : {
              Resource: target.label,
              Version: "❓",
              Date: "",
            };
      })
      .catch(() => ({ Resource: target.label, Version: "❌", Date: "" }))
  )
).then((rows) => {
  // Divido le risorse JSON da quelle non JSON
  const jsonRows = rows.filter((r) => r.Resource.includes("json"));
  const otherRows = rows.filter((r) => !r.Resource.includes("json"));

  console.log(
    "%c📦 Resource Versions (HTML, JS, CSS)",
    "color: goldenrod; font-weight: bold; font-size: 14px;"
  );
  console.table(otherRows);

  console.log(
    "%c📦 JSON Versions",
    "color: teal; font-weight: bold; font-size: 14px;"
  );
  console.table(jsonRows);
});
