// Load the menu
fetch("/sidenav.html")
  .then((res) => res.text())
  .then((html) => {
    document.body.insertAdjacentHTML("afterbegin", html);
    initializeMenu();
    generateChapterSections(); // After loading, generate the chapter submenu
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
// Populate menu
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
