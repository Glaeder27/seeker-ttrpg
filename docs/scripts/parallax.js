/*v1.2 2025-08-09T19:13:56.935Z*/
document.addEventListener("DOMContentLoaded", () => {
  const parallaxElements = document.querySelectorAll(".parallax-vertical, .parallax-horizontal");

  window.addEventListener("scroll", () => {
    const viewportHeight = window.innerHeight;

    parallaxElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elementCenterY = rect.top + rect.height / 2;
      const offsetFromCenter = elementCenterY - viewportHeight / 2;

      const speed = parseFloat(el.dataset.speed) || 0.3;
      const crossSpeed = speed * 0.1; // 10% dello speed

      if (el.classList.contains("parallax-vertical")) {
        el.style.backgroundPosition = 
          `calc(50% + ${-offsetFromCenter * crossSpeed}px) calc(50% + ${-offsetFromCenter * speed}px)`;
      } 
      else if (el.classList.contains("parallax-horizontal")) {
        el.style.backgroundPosition = 
          `calc(50% + ${-offsetFromCenter * speed}px) calc(50% + ${-offsetFromCenter * crossSpeed}px)`;
      }
    });
  });
});