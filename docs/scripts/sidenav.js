/*v1.26 2025-08-27T09:45:17.290Z*/

const menuSources = [
  "/data/menu-lorebook.json",
  "/data/menu-rulebook.json",
];

Promise.all(
  menuSources.map(src =>
    fetch(src)
      .then(res => res.json())
      .catch(err => {
        console.error("Failed to load menu:", src, err);
        return null;
      })
  )
).then(menus => {
  const sideMenu = document.querySelector("#sidenav .sidenav-content");
  if (!sideMenu) return;

  sideMenu.innerHTML = ""; // svuoto per inserire tutto

  // --- Static menus (Lorebook + Rulebook, entrambi sempre presenti)
  menus.filter(Boolean).forEach(data => populateStaticMenu(data, sideMenu));

  // --- Dynamic chapter section
  const dynamicNav = document.createElement("h3");
  dynamicNav.classList.add("menu-section");

  const pageHeader = document.querySelector("header.title h1");
  const chapterTitle = pageHeader
    ? pageHeader.textContent.trim()
    : "This Chapter";
  dynamicNav.textContent = chapterTitle;

  sideMenu.appendChild(dynamicNav);

  const chapterList = document.createElement("ul");
  chapterList.id = "chapter-sections";
  sideMenu.appendChild(chapterList);

  // --- Init features
  generateChapterSections();
  initializeMenu();
  initializeScrollSpy();
  initializeCollapsibles();

  const sidenav = document.getElementById("sidenav");
  setTimeout(() => {
    sidenav?.classList.remove("no-transition");
  }, 100);
});

function initializeMenu() {
  const sideMenu = document.getElementById("sidenav");
  const toggleButton = document.getElementById("toggle-menu");
  const toggleIcon = toggleButton.querySelector("i");
  const overlay = document.getElementById("sidenav-overlay");

  // Read the state from localStorage
  const menuVisible = localStorage.getItem("menuVisible") === "true"; // default false
  sideMenu.classList.toggle("collapsed", !menuVisible);

  // Overlay iniziale solo se mobile e menu aperto
  if (window.innerWidth <= 768 && menuVisible) {
    overlay.classList.add("show");
  }

  // Btn initial state
  if (menuVisible) {
    toggleButton.style.transform = "translate(370px, 0)";
  } else {
    toggleButton.style.transform = "translate(0, 0)";
  }
  toggleIcon.className = menuVisible
    ? "fa-solid golden fa-left-from-bracket"
    : "fa-solid golden fa-right-from-bracket";

  toggleButton.addEventListener("click", () => {
    const wasCollapsed = sideMenu.classList.contains("collapsed");
    const isNowVisible = sideMenu.classList.toggle("collapsed") === false;
    localStorage.setItem("menuVisible", isNowVisible);

    toggleIcon.className = isNowVisible
      ? "fa-solid golden fa-left-from-bracket"
      : "fa-solid golden fa-right-from-bracket";

    // Reset animation
    toggleButton.classList.remove("animate-open", "animate-close");
    void toggleButton.offsetWidth; // force reflow

    if (wasCollapsed) {
      toggleButton.classList.add("animate-open");
    } else {
      toggleButton.classList.add("animate-close");
    }

    // Mostra/nascondi overlay solo su mobile
    if (window.innerWidth <= 768) {
      if (isNowVisible) {
        overlay.classList.add("show");
      } else {
        overlay.classList.remove("show");
      }
    }
  });

  // Chiudi menu cliccando l’overlay
  overlay.addEventListener("click", () => {
    sideMenu.classList.add("collapsed");
    overlay.classList.remove("show");
    localStorage.setItem("menuVisible", false);
    toggleIcon.className = "fa-solid golden fa-right-from-bracket";
  });

  // Highlight the link on page load (hash-based)
  const links = document.querySelectorAll("#chapter-sections a");
  const currentHash = window.location.hash;
  if (currentHash) {
    links.forEach((link) => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === currentHash
      );
    });
  }
}

function generateChapterSections() {
  const chapterMenu = document.getElementById("chapter-sections");
  if (!chapterMenu) return;

  chapterMenu.innerHTML = ""; // Clear all

  const sections = document.querySelectorAll("section.section-wrapper[id]");

  sections.forEach((section) => {
    const id = section.id;
    const title = section.getAttribute("sidenav") || id;

    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${id}`;
    a.textContent = title;
    a.dataset.id = id;
    li.appendChild(a);
    chapterMenu.appendChild(li);

    const headers = section.querySelectorAll("h3[sidenav-2], h4[sidenav-2]");
    headers.forEach((header) => {
      const subLi = document.createElement("li");
      subLi.classList.add("subsection");

      const subA = document.createElement("a");
      subA.href = `#${id}`;
      subA.textContent = header.getAttribute("sidenav-2") || header.textContent;
      subA.dataset.id = id;

      subLi.appendChild(subA);
      chapterMenu.appendChild(subLi);
    });
  });
}

function initializeScrollSpy() {
  const links = document.querySelectorAll("#chapter-sections a");
  const headers = document.querySelectorAll("h3[sidenav-2], h4[sidenav-2]");
  const sections = document.querySelectorAll("section.section-wrapper[id]");

  function updateActiveLink() {
    const viewportCenter = window.innerHeight / 2;

    let closestSection = null;
    let closestSectionDist = Infinity;
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const dist = Math.abs(rect.top - viewportCenter);
      if (dist < closestSectionDist) {
        closestSectionDist = dist;
        closestSection = section;
      }
    });

    let closestHeader = null;
    let closestHeaderDist = Infinity;
    if (closestSection) {
      const headersInSection = closestSection.querySelectorAll("h3[sidenav-2], h4[sidenav-2]");
      headersInSection.forEach((header) => {
        const rect = header.getBoundingClientRect();
        const dist = Math.abs(rect.top - viewportCenter);
        if (dist < closestHeaderDist) {
          closestHeaderDist = dist;
          closestHeader = header;
        }
      });
    }

    links.forEach((link) => {
      const isSubLink = link.parentElement.classList.contains("subsection");
      const matchSection = link.dataset.id === closestSection?.id;
      const matchHeader = closestHeader
        ? link.textContent.trim() ===
          (closestHeader.getAttribute("sidenav-2") || closestHeader.textContent).trim()
        : false;

      const shouldActivate = closestHeader
        ? (isSubLink ? matchSection && matchHeader : matchSection)
        : (!isSubLink && matchSection);

      link.classList.toggle("active", shouldActivate);
    });
  }

  window.addEventListener("scroll", updateActiveLink, { passive: true });
  window.addEventListener("resize", updateActiveLink);
  updateActiveLink();
}

function populateStaticMenu(data, sideMenu) {
  if (!sideMenu || !data || !data.items) return;

  const collapsibleItem = document.createElement("div");
  collapsibleItem.classList.add("collapsible-sidenav-item");

  const collapsibleHeader = document.createElement("div");
  collapsibleHeader.classList.add("collapsible-sidenav-header");

  const title = document.createElement("h3");
  title.classList.add("menu-section");
  title.textContent = data.title;

  const icon = document.createElement("i");
  icon.classList.add("collapsible-sidenav-icon", "fas", "fa-angle-right");

  collapsibleHeader.appendChild(title);
  collapsibleHeader.appendChild(icon);
  collapsibleItem.appendChild(collapsibleHeader);

  const collapsibleContent = document.createElement("div");
  collapsibleContent.classList.add("collapsible-sidenav-content");

  const ul = document.createElement("ul");
  ul.id = `site-index-${data.title.toLowerCase()}`;

  data.items.forEach((item) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.textContent = item.label;
    a.href = item.href;
    if (item.href.includes("/rulebook/")) {
      a.setAttribute("data-partial", "");
    }
    li.appendChild(a);
    ul.appendChild(li);
  });

  collapsibleContent.appendChild(ul);
  collapsibleItem.appendChild(collapsibleContent);
  sideMenu.appendChild(collapsibleItem);
}

function initializeCollapsibles() {
  const items = document.querySelectorAll(".collapsible-sidenav-item");

  items.forEach((item) => {
    const header = item.querySelector(".collapsible-sidenav-header");
    const content = item.querySelector(".collapsible-sidenav-content");
    const icon = item.querySelector(".collapsible-sidenav-icon");

    header.addEventListener("click", () => {
      const expanded = item.classList.toggle("expanded");
      content.style.height = expanded ? `${content.scrollHeight}px` : "0px";
      icon.style.transform = expanded ? "rotate(90deg)" : "rotate(0deg)";
    });

    // Collapse on load
    content.style.height = "0px";
  });
}
