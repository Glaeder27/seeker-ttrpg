/*v1.3 2025-08-09T20:39:21.681Z*/
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
      
      // Calcolo zoom: aumenta con la distanza dal centro
      const zoomFactor = 1 + Math.min(Math.abs(offsetFromCenter) / viewportHeight, 0.5) * 0.2;
      // ↑ max 20% di zoom quando l’elemento è molto lontano dal centro

      if (el.classList.contains("parallax-vertical")) {
        el.style.backgroundPosition =
          `calc(50% + ${-offsetFromCenter * crossSpeed}px) calc(50% + ${-offsetFromCenter * speed}px)`;
      } 
      else if (el.classList.contains("parallax-horizontal")) {
        el.style.backgroundPosition =
          `calc(50% + ${-offsetFromCenter * speed}px) calc(50% + ${-offsetFromCenter * crossSpeed}px)`;
      }

      el.style.backgroundSize = `${zoomFactor * 100}% auto`; // zoom dinamico
    });
  });
});