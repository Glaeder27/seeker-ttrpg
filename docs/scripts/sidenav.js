/*v1.20 2025-08-03T20:32:05.085Z*/

const menuSrc = document.body.getAttribute("data-menu-src");
if (menuSrc) {
  fetch(menuSrc)
    .then((res) => res.json())
    .then((data) => {
      populateStaticMenu(data);
      generateChapterSections();
      initializeMenu();
      initializeScrollSpy();

      const sidenav = document.getElementById("sidenav");
      setTimeout(() => {
        sidenav?.classList.remove("no-transition");
      }, 100);
    })
    .catch((err) => console.error("Failed to load sidenav menu:", err));
}

function initializeMenu() {
  const sideMenu = document.getElementById("sidenav");
  const toggleButton = document.getElementById("toggle-menu");
  const toggleIcon = toggleButton.querySelector("i");

  // Read the state from localStorage
  const menuVisible = localStorage.getItem("menuVisible") !== "false"; // default to true
  sideMenu.classList.toggle("collapsed", !menuVisible);

  // Btn initial state
  if (menuVisible) {
    toggleButton.style.transform = "translate(370px, 0)";
  } else {
    toggleButton.style.transform = "translate(0, 0)";
  }
  toggleIcon.className = menuVisible
    ? "fa-solid fa-square-xmark"
    : "fa-solid fa-right-from-bracket";

  // Deactivate Btn animation on mobile
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (isMobile) return;

  toggleButton.addEventListener("click", () => {
    const wasCollapsed = sideMenu.classList.contains("collapsed");
    const isNowVisible = sideMenu.classList.toggle("collapsed") === false;
    localStorage.setItem("menuVisible", isNowVisible);

    toggleIcon.className = isNowVisible
      ? "fa-solid fa-square-xmark"
      : "fa-solid fa-right-from-bracket";

    // Reset animation
    toggleButton.classList.remove("animate-open", "animate-close");
    void toggleButton.offsetWidth; // force reflow

    if (wasCollapsed) {
      toggleButton.classList.add("animate-open");
    } else {
      toggleButton.classList.add("animate-close");
    }
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
  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -30% 0px",
    threshold: 0.1,
  };

  const links = document.querySelectorAll("#chapter-sections a");
  const headers = document.querySelectorAll("h3[sidenav-2], h4[sidenav-2]");
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

      if (target.hasAttribute("sidenav-2")) {
        activeHeader = target;
        isSubsection = true;
      }

      links.forEach((link) => {
        const linkIsSub = link.parentElement.classList.contains("subsection");
        const matchById = link.dataset.id === sectionId;
        const matchByText = activeHeader
          ? link.textContent.trim() ===
            (
              activeHeader.getAttribute("sidenav-2") || activeHeader.textContent
            ).trim()
          : false;

        const shouldActivate = isSubsection
          ? linkIsSub
            ? matchById && matchByText
            : matchById
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
  ul.id = "site-index";

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

  // ➤ Dynamic chapter section
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

  initializeCollapsibles();
}

function initializeCollapsibles() {
  const items = document.querySelectorAll(".collapsible-sidenav-item");

  items.forEach(item => {
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