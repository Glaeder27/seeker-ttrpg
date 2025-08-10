/*v1.5 2025-08-10T09:57:04.618Z*/
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

      // leggi gli offset iniziali da attributi custom, default a 0
      const initialOffsetY = parseFloat(el.dataset.offsetY) || 0;
      const initialOffsetX = parseFloat(el.dataset.offsetX) || 0;
      const initialZoomPercent = parseFloat(el.dataset.offsetZoom) || 100;

      // calcolo zoom dinamico, max +10% rispetto al valore iniziale
      const zoomFactor = initialZoomPercent / 100 + Math.min(Math.abs(offsetFromCenter) / viewportHeight, 0.5) * 0.1;
      // ↑ max 10% di zoom quando l’elemento è molto lontano dal centro

      if (el.classList.contains("parallax-vertical")) {
        el.style.backgroundPosition =
          `calc(50% + ${initialOffsetX}px + ${-offsetFromCenter * crossSpeed}px) calc(50% + ${initialOffsetY}px + ${-offsetFromCenter * speed}px)`;
      } 
      else if (el.classList.contains("parallax-horizontal")) {
        el.style.backgroundPosition =
          `calc(50% + ${initialOffsetX}px + ${-offsetFromCenter * speed}px) calc(50% + ${initialOffsetY}px + ${-offsetFromCenter * crossSpeed}px)`;
      }

      el.style.backgroundSize = `${zoomFactor * 100}% auto`; // zoom dinamico
    });
  });
});
