/*v1.08 2025-07-25T11:00:00Z*/
const menuSrc = document.body.getAttribute("data-menu-src");
if (menuSrc) {
  fetch(menuSrc)
    .then(res => res.json())
    .then(data => {
      populateStaticMenu(data);
      generateChapterSections();
      initializeMenu(); // moved down to ensure sidenav exists
      initializeScrollSpy();
    })
    .catch(err => console.error("Failed to load sidenav menu:", err));
}

function initializeMenu() {
  const sideMenu = document.getElementById("sidenav");
  const toggleButton = document.getElementById("toggle-menu");

  // Read the state from localStorage
  const menuVisible = localStorage.getItem("menuVisible") !== "false"; // default to true
  sideMenu.classList.toggle("collapsed", !menuVisible);

  // Initial icon
  toggleButton.textContent = sideMenu.classList.contains("collapsed") ? "▶" : "◀";

  toggleButton.addEventListener("click", () => {
    const isNowVisible = sideMenu.classList.toggle("collapsed") === false;
    localStorage.setItem("menuVisible", isNowVisible);

    // State-specific icon
    toggleButton.textContent = sideMenu.classList.contains("collapsed") ? "▶" : "◀";
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

    const headers = section.querySelectorAll("h3[sidenav-inset], h4[sidenav-inset]");
    headers.forEach((header) => {
      const subLi = document.createElement("li");
      subLi.classList.add("subsection");

      const subA = document.createElement("a");
      subA.href = `#${id}`;
      subA.textContent = header.getAttribute("sidenav-inset") || header.textContent;
      subA.dataset.id = id;

      subLi.appendChild(subA);
      chapterMenu.appendChild(subLi);
    });
  });
}

function initializeScrollSpy() {
  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -30% 0px",
    threshold: 0.1,
  };

  const links = document.querySelectorAll("#chapter-sections a");
  const headers = document.querySelectorAll("h3[sidenav-inset], h4[sidenav-inset]");
  const sections = document.querySelectorAll("section.section-wrapper[id]");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const target = entry.target;
      const parentSection = target.closest("section.section-wrapper");
      if (!parentSection || !parentSection.id) return;

      const sectionId = parentSection.id;
      let activeHeader = null;
      let isSubsection = false;

      if (target.hasAttribute("sidenav-inset")) {
        activeHeader = target;
        isSubsection = true;
      }

      links.forEach((link) => {
        const linkIsSub = link.parentElement.classList.contains("subsection");
        const matchById = link.dataset.id === sectionId;
        const matchByText = activeHeader
          ? link.textContent.trim() === (activeHeader.getAttribute("sidenav-inset") || activeHeader.textContent).trim()
          : false;

        const shouldActivate = isSubsection
          ? (linkIsSub ? matchById && matchByText : matchById)
          : !linkIsSub && matchById;

        link.classList.toggle("active", shouldActivate);
      });
    });
  }, observerOptions);

  headers.forEach((header) => observer.observe(header));
  sections.forEach((section) => observer.observe(section)); // <-- fix: include full sections too
}

function populateStaticMenu(data) {
  const sideMenu = document.querySelector("#sidenav .sidenav-content");
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