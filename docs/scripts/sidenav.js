/*v1.00 2025-07-23T23:30:00Z*/
document.addEventListener("DOMContentLoaded", () => {
  const menuSrc = document.body.getAttribute("data-menu-src");
  if (menuSrc) {
    fetch(menuSrc)
      .then(res => res.json())
      .then(data => {
        populateStaticMenu(data);
        generateChapterSections(); // Submenu
        initializeMenu();
      })
      .catch(err => console.error("Failed to load sidenav menu:", err));
  }
});

function initializeMenu() {
  const sideMenu = document.getElementById("side-menu");
  const toggleButton = document.getElementById("toggle-menu");

  // Read the state from localStorage
  const menuVisible = localStorage.getItem("menuVisible") === "true";
  if (!menuVisible) sideMenu.classList.add("collapsed");

  toggleButton.addEventListener("click", () => {
    sideMenu.classList.toggle("collapsed");
    const isVisible = !sideMenu.classList.contains("collapsed");
    localStorage.setItem("menuVisible", isVisible);
  });

  // Automatically highlight the current section
  const links = document.querySelectorAll("#chapter-sections a");
  const currentHash = window.location.hash;
  links.forEach((link) => {
    if (link.getAttribute("href") === currentHash) {
      link.classList.add("active");
    }
  });
}

function generateChapterSections() {
  const chapterMenu = document.getElementById("chapter-sections");
  if (!chapterMenu) return;

  const sections = document.querySelectorAll("section.section-wrapper");
  const headers = document.querySelectorAll("h4[sidenav-inset]");

  sections.forEach((section) => {
    const id = section.id;
    const title = section.getAttribute("sidenav") || id;
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${id}`;
    a.textContent = title;
    li.appendChild(a);
    chapterMenu.appendChild(li);
  });

  headers.forEach((h4) => {
    const section = h4.closest("section.section-wrapper");
    if (!section) return;
    const id = section.id;
    const title = h4.getAttribute("sidenav-inset") || h4.textContent;
    const li = document.createElement("li");
    li.classList.add("subsection");
    const a = document.createElement("a");
    a.href = `#${id}`;
    a.textContent = title;
    li.appendChild(a);
    chapterMenu.appendChild(li);
  });
}

function populateStaticMenu(data) {
  const sideMenu = document.querySelector("#side-menu .menu-content");
  if (!sideMenu || !data || !data.items) return;

  // Clear existing static sections
  sideMenu.innerHTML = "";

  // Title
  const title = document.createElement("h3");
  title.classList.add("menu-section");
  title.textContent = data.title;
  sideMenu.appendChild(title);

  // Items
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

  // Chapter nav
  const dynamicNav = document.createElement("h3");
  dynamicNav.classList.add("menu-section");
  dynamicNav.textContent = "This Chapter";
  sideMenu.appendChild(dynamicNav);

  const chapterList = document.createElement("ul");
  chapterList.id = "chapter-sections";
  sideMenu.appendChild(chapterList);
}