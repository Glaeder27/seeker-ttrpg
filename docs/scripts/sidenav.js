/* v1.07 2025-07-24T00:00:00Z */
const menuSrc = document.body.getAttribute("data-menu-src");
if (menuSrc) {
  fetch(menuSrc)
    .then(res => res.json())
    .then(data => {
      populateStaticMenu(data);
      generateChapterSections();
      restoreMenuState();      // <-- NEW: persist state BEFORE toggle event
      initializeMenu();
      initializeScrollSpy();
    })
    .catch(err => console.error("Failed to load sidenav menu:", err));
}

function restoreMenuState() {
  const sideMenu = document.getElementById("side-menu");
  const menuVisible = localStorage.getItem("menuVisible") !== "false";
  sideMenu.classList.toggle("collapsed", !menuVisible);
}

function initializeMenu() {
  const sideMenu = document.getElementById("side-menu");
  const toggleButton = document.getElementById("toggle-menu");

  toggleButton.addEventListener("click", () => {
    const isNowVisible = !sideMenu.classList.toggle("collapsed");
    localStorage.setItem("menuVisible", isNowVisible);
  });

  // Highlight the link on page load (hash-based)
  const links = document.querySelectorAll("#chapter-sections a");
  const currentHash = window.location.hash;
  if (currentHash) {
    links.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === currentHash);
    });
  }
}

function generateChapterSections() {
  const chapterMenu = document.getElementById("chapter-sections");
  if (!chapterMenu) return;

  const sections = document.querySelectorAll("section.section-wrapper[id]");
  const headers = document.querySelectorAll("h3[sidenav-inset], h4[sidenav-inset]");

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
  });

  headers.forEach((header) => {
    const section = header.closest("section.section-wrapper");
    if (!section || !section.id) return;
    const id = section.id;
    const title = header.getAttribute("sidenav-inset") || header.textContent;
    const li = document.createElement("li");
    li.classList.add("subsection");
    const a = document.createElement("a");
    a.href = `#${id}`;
    a.textContent = title;
    a.dataset.id = id;
    li.appendChild(a);
    chapterMenu.appendChild(li);
  });
}

function initializeScrollSpy() {
  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -70% 0px",
    threshold: 0,
  };

  const links = document.querySelectorAll("#chapter-sections a");
  const headers = document.querySelectorAll("h3[sidenav-inset], h4[sidenav-inset]");
  const sections = document.querySelectorAll("section.section-wrapper[id]");

  const observer = new IntersectionObserver((entries) => {
    let currentSectionId = null;
    let currentHeaderText = null;

    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const target = entry.target;
      const section = target.closest("section.section-wrapper");
      if (!section || !section.id) return;

      const sectionId = section.id;

      if (target.hasAttribute("sidenav-inset")) {
        // Sottosezione
        currentSectionId = sectionId;
        currentHeaderText = target.getAttribute("sidenav-inset") || target.textContent.trim();
      } else if (target.tagName === "SECTION") {
        // Sezione principale (senza sottosezioni)
        currentSectionId = sectionId;
        currentHeaderText = null;
      }
    });

    links.forEach((link) => {
      const isSub = link.parentElement.classList.contains("subsection");
      const matchesId = link.dataset.id === currentSectionId;

      if (isSub && currentHeaderText) {
        const matchesText = link.textContent.trim() === currentHeaderText.trim();
        link.classList.toggle("active", matchesId && matchesText);
      } else if (!isSub && currentHeaderText === null) {
        link.classList.toggle("active", matchesId);
      } else {
        link.classList.remove("active");
      }
    });
  }, observerOptions);

  headers.forEach((header) => observer.observe(header));
  sections.forEach((section) => observer.observe(section));
}

function populateStaticMenu(data) {
  const sideMenu = document.querySelector("#side-menu .menu-content");
  if (!sideMenu || !data || !data.items) return;

  sideMenu.innerHTML = "";

  const title = document.createElement("h3");
  title.classList.add("menu-section");
  title.textContent = data.title;
  sideMenu.appendChild(title);

  const ul = document.createElement("ul");
  data.items.forEach(item => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.textContent = item.label;
    a.href = item.href;
    if (item.href.includes("/rules/")) a.setAttribute("data-partial", "");
    li.appendChild(a);
    ul.appendChild(li);
  });
  sideMenu.appendChild(ul);

  const dynamicNav = document.createElement("h3");
  dynamicNav.classList.add("menu-section");
  dynamicNav.textContent = "This Chapter";
  sideMenu.appendChild(dynamicNav);

  const chapterList = document.createElement("ul");
  chapterList.id = "chapter-sections";
  sideMenu.appendChild(chapterList);
}