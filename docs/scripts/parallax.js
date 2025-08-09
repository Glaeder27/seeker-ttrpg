document.addEventListener("DOMContentLoaded", () => {
  const parallaxElements = document.querySelectorAll(".parallax-vertical, .parallax-horizontal");

  function updateParallax() {
    parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.speed) || 0.3;
      const rect = el.getBoundingClientRect();
      const offset = rect.top * speed;

      if (el.classList.contains("parallax-vertical")) {
        el.style.backgroundPosition = `center ${offset}px`;
      } else if (el.classList.contains("parallax-horizontal")) {
        el.style.backgroundPosition = `${offset}px center`;
      }
    });
  }

  window.addEventListener("scroll", updateParallax);
  window.addEventListener("resize", updateParallax);
  updateParallax(); // initial call
});