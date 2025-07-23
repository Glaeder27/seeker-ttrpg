/* v3.4 2025-07-23T11:50:00Z */
fetch("navbar.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("navbar-top").innerHTML = html;

    // Highlight active link
    const path = window.location.pathname;
    const currentPage = path === "/" || path === "/seeker-ttrpg/"
      ? "index.html"
      : path.split("/").pop();

    document.querySelectorAll(".nav-link").forEach(link => {
      const href = link.getAttribute("href");
      if (
        href.includes(currentPage) ||
        (currentPage === "index.html" && (href === "index.html" || href === "./" || href === "/"))
      ) {
        link.classList.add("active");
      }
    });

    // Mobile menu logic
    const toggleBtn = document.getElementById("navbar-toggle");
    const mobileMenu = document.getElementById("navbar-links-mobile");
    const closeBtn = document.getElementById("navbar-close");

    function openMenu() {
      mobileMenu.classList.add("show");
      closeBtn?.classList.add("rotated");

      // Trigger slide-in animation on each list item
      const links = mobileMenu.querySelectorAll("li");
      links.forEach((li, i) => {
        li.style.animation = `slideIn 0.4s forwards`;
        li.style.animationDelay = `${0.1 * i}s`;
      });

      // Fade-in background
      mobileMenu.style.animation = "fadeInBackground 0.4s forwards";
    }

    function closeMenu() {
      closeBtn?.classList.remove("rotated");

      // Trigger slide-out animation on each list item
      const links = mobileMenu.querySelectorAll("li");
      links.forEach((li, i) => {
        li.style.animation = `slideOut 0.3s forwards`;
        li.style.animationDelay = `${0.05 * i}s`;
      });

      // Fade-out background
      mobileMenu.style.animation = "fadeOutBackground 0.4s forwards";

      // Remove .show after delay
      setTimeout(() => {
        mobileMenu.classList.remove("show");

        // Reset styles
        links.forEach(li => {
          li.style.opacity = "";
          li.style.transform = "";
          li.style.animation = "";
          li.style.animationDelay = "";
        });
        mobileMenu.style.removeProperty("animation");
      }, 400);
    }

    toggleBtn?.addEventListener("click", openMenu);
    closeBtn?.addEventListener("click", closeMenu);

    // Close menu when a mobile link is clicked
    mobileMenu?.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMenu);
    });
  });