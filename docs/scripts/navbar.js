  // v3.3 2025-07-22T17:30:00Z
  fetch("navbar.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("navbar-top").innerHTML = html;

      // Highlight
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

        // Trigger animation on each list item
        const links = mobileMenu.querySelectorAll("li");
        links.forEach((li, i) => {
          li.style.opacity = "0";
          li.style.transform = "translateY(20px)";
          li.style.animation = `slideIn 0.4s forwards`;
          li.style.animationDelay = `${0.1 * i}s`;
        });
      }

      function closeMenu() {
        mobileMenu.classList.remove("show");
        closeBtn?.classList.remove("rotated");

        // Reset animation styles
        const links = mobileMenu.querySelectorAll("li");
        links.forEach(li => {
          li.style.opacity = "";
          li.style.transform = "";
          li.style.animation = "";
          li.style.animationDelay = "";
        });
      }

      toggleBtn?.addEventListener("click", openMenu);
      closeBtn?.addEventListener("click", closeMenu);

      // Close menu when a mobile link is clicked
      mobileMenu?.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMenu);
      });
    });