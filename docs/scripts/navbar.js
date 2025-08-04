/*v3.73 2025-08-04T13:33:25.108Z*/

// Aggiungi queste variabili all'inizio del tuo script navbar.js
const userIcon = document.getElementById('user-icon');
const userDropdownMenu = document.getElementById('user-dropdown-menu');
const dropdownAuthLink = document.getElementById('dropdown-auth-link');
const mobileUserLink = document.getElementById('mobile-user-link');

// Gestisci la visualizzazione del menu a tendina
userIcon.addEventListener('click', (e) => {
    e.preventDefault();
    userDropdownMenu.classList.toggle('show');
});

// Nascondi il menu se l'utente clicca fuori
document.addEventListener('click', (e) => {
    if (!userMenuContainer.contains(e.target)) {
        userDropdownMenu.classList.remove('show');
    }
});

// Aggiungi il listener per lo stato di autenticazione di Firebase
auth.onAuthStateChanged(user => {
    if (user) {
        // L'utente è loggato
        // Mostra il link per la pagina del profilo e il logout
        dropdownAuthLink.textContent = 'Logout';
        dropdownAuthLink.href = '#'; // Cambia l'URL per il logout
        dropdownAuthLink.addEventListener('click', async (e) => {
            e.preventDefault();
            await auth.signOut();
            window.location.href = '/auth.html';
        });

        // Aggiorna il link del menu mobile
        mobileUserLink.style.display = 'block';

    } else {
        // L'utente non è loggato
        // Mostra il link per il login
        dropdownAuthLink.textContent = 'Login';
        dropdownAuthLink.href = '/auth.html';
        
        // Nascondi il link del menu mobile
        mobileUserLink.style.display = 'none';
    }
});

fetch("/navbar.html")
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
        li.style.animation = `slideIn 0.8s forwards`;
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
      mobileMenu.style.animation = `fadeOutBackground 0.8s forwards`;

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
      }, 50);
    }

    toggleBtn?.addEventListener("click", openMenu);
    closeBtn?.addEventListener("click", closeMenu);

    // Close menu when any mobile link is clicked
    mobileMenu?.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMenu);
    });
  });