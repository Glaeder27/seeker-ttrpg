document.addEventListener("DOMContentLoaded", () => {
  const parallaxElements = document.querySelectorAll(".parallax-vertical, .parallax-horizontal");

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.speed) || 0.3;
      if (el.classList.contains("parallax-vertical")) {
        el.style.backgroundPosition = `center ${scrollY * speed}px`;
      } else if (el.classList.contains("parallax-horizontal")) {
        el.style.backgroundPosition = `${scrollY * speed}px center`;
      }
    });
  });
});
