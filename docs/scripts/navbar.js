/* v3.70 2025-07-23T21:30:00Z */
fetch("navbar.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("navbar-top").innerHTML = html;

    // Highlight current page in navbar
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

    // Mobile menu toggle logic
    const toggleBtn = document.getElementById("navbar-toggle");
    const mobileMenu = document.getElementById("navbar-links-mobile");
    const closeBtn = document.getElementById("navbar-close");

    function openMenu() {
      mobileMenu.classList.add("show");
      mobileMenu.classList.remove("fade-out");
      closeBtn?.classList.add("rotated");

      // Trigger staggered slide-in animation for each item
      const links = mobileMenu.querySelectorAll("li");
      links.forEach((li, i) => {
        li.style.animation = `slideIn 0.4s forwards`;
        li.style.animationDelay = `${0.1 * i}s`;
      });

      // Menu fade-in background
      mobileMenu.style.animation = `fadeInBackground 0.4s forwards`;
    }

    function closeMenu() {
      closeBtn?.classList.remove("rotated");

      const links = mobileMenu.querySelectorAll("li");
      links.forEach((li, i) => {
        li.style.animation = `slideOut 0.3s forwards`;
        li.style.animationDelay = `${0.05 * i}s`;
      });

      // Menu fade-out
      mobileMenu.classList.add("fade-out");

      // Trigger background fade-out
      mobileMenu.style.animation = `fadeOutBackground 0.4s forwards`;

      // Hide the menu after animations finish
      setTimeout(() => {
        mobileMenu.classList.remove("show", "fade-out");

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

    // Close menu when any mobile link is clicked
    mobileMenu?.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMenu);
    });
  });