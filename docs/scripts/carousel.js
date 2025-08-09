document.addEventListener("DOMContentLoaded", function () {
  const track = document.querySelector(".carousel-track");
  const wrapper = document.querySelector(".carousel-wrapper");
  const leftArrow = document.querySelector(".carousel-arrow.left");
  const rightArrow = document.querySelector(".carousel-arrow.right");

  let isDown = false;
  let startX = 0;
  let scrollStart = 0;
  let animationFrame;

  function updateArrows() {
    const scrollLeft = track.scrollLeft;
    const maxScroll = track.scrollWidth - track.clientWidth;

    if (scrollLeft <= 0) {
      leftArrow.classList.add("hidden");
    } else {
      leftArrow.classList.remove("hidden");
    }

    if (scrollLeft >= maxScroll - 1) {
      rightArrow.classList.add("hidden");
    } else {
      rightArrow.classList.remove("hidden");
    }
  }

  // ── Drag ───────────────────────
  track.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.clientX;
    scrollStart = track.scrollLeft;
    track.classList.add("active");
    document.body.style.userSelect = "none";
  });

  track.addEventListener("mouseup", () => {
    isDown = false;
    track.classList.remove("active");
    document.body.style.userSelect = "";
    if (animationFrame) cancelAnimationFrame(animationFrame);
    updateArrows();
  });

  track.addEventListener("mouseleave", () => {
    if (isDown) {
      isDown = false;
      track.classList.remove("active");
      document.body.style.userSelect = "";
      if (animationFrame) cancelAnimationFrame(animationFrame);
      updateArrows();
    }
  });

  track.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const walk = e.clientX - startX;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(() => {
      track.scrollLeft = scrollStart - walk;
      updateArrows();
    });
  });

  // ── Arrows ───────────────────────
  const scrollAmount = 300;

  leftArrow.addEventListener("click", () => {
    track.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });

  rightArrow.addEventListener("click", () => {
    track.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });

  // ─ Update arrows on scroll
  track.addEventListener("scroll", updateArrows);
  window.addEventListener("resize", updateArrows);

  // Initial check
  updateArrows();
});