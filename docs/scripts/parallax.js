/*v1.1 2025-08-09T15:56:56.764Z*/
document.addEventListener("DOMContentLoaded", () => {
  const parallaxElements = document.querySelectorAll(".parallax-vertical, .parallax-horizontal");

  window.addEventListener("scroll", () => {
    const viewportHeight = window.innerHeight;

    parallaxElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elementCenterY = rect.top + rect.height / 2;
      const offsetFromCenter = elementCenterY - viewportHeight / 2;

      const speed = parseFloat(el.dataset.speed) || 0.3;

      if (el.classList.contains("parallax-vertical")) {
        el.style.backgroundPosition = `center calc(50% + ${-offsetFromCenter * speed}px)`;
      } else if (el.classList.contains("parallax-horizontal")) {
        el.style.backgroundPosition = `calc(50% + ${-offsetFromCenter * speed}px) center`;
      }
    });
  });
});