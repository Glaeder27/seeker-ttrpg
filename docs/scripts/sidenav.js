// Caricamento menu
fetch("/sidenav.html")
  .then((res) => res.text())
  .then((html) => {
    document.body.insertAdjacentHTML("afterbegin", html);
    initializeMenu();
  });

function initializeMenu() {
  const sideMenu = document.getElementById("side-menu");
  const toggleButton = document.getElementById("toggle-menu");

  // Leggi stato da localStorage
  const menuVisible = localStorage.getItem("menuVisible") === "true";
  if (!menuVisible) sideMenu.classList.add("collapsed");

  toggleButton.addEventListener("click", () => {
    sideMenu.classList.toggle("collapsed");
    const isVisible = !sideMenu.classList.contains("collapsed");
    localStorage.setItem("menuVisible", isVisible);
  });

  // Highlight automatico sezione corrente
  const links = document.querySelectorAll("#chapter-sections a");
  const currentHash = window.location.hash;
  links.forEach((link) => {
    if (link.getAttribute("href") === currentHash) {
      link.classList.add("active");
    }
  });
}