const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector("#mobile-nav");

if (menuButton && mobileNav) {
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Открыть меню");
    mobileNav.hidden = true;
  };

  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!open));
    menuButton.setAttribute("aria-label", open ? "Открыть меню" : "Закрыть меню");
    mobileNav.hidden = open;
  });

  mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuButton.focus();
    }
  });
}

const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());

const progress = document.querySelector("#scroll-progress");
let scrollQueued = false;
function updateProgress() {
  if (!progress) return;
  const root = document.documentElement;
  const scrollable = root.scrollHeight - root.clientHeight;
  const amount = scrollable > 0 ? root.scrollTop / scrollable : 0;
  progress.style.transform = `scaleX(${Math.min(1, Math.max(0, amount))})`;
  scrollQueued = false;
}
window.addEventListener("scroll", () => {
  if (scrollQueued) return;
  scrollQueued = true;
  window.requestAnimationFrame(updateProgress);
}, { passive: true });
updateProgress();

// Split the main heading into individually animated characters, while the accessible
// name stays on the h1 itself.
let characterIndex = 0;
document.querySelectorAll("[data-split]").forEach((line) => {
  const text = line.textContent || "";
  line.textContent = "";
  for (const character of text) {
    const span = document.createElement("i");
    span.textContent = character === " " ? "\u00a0" : character;
    span.style.setProperty("--i", String(characterIndex));
    line.appendChild(span);
    characterIndex += 1;
  }
});

// Draw SVG paths in sequence, giving each drawing its own hand-inked rhythm.
document.querySelectorAll(".hero-doodle, .method-icon svg, .paper-back svg, .cta-spark").forEach((drawing) => {
  drawing.querySelectorAll(".draw-line").forEach((path, index) => {
    path.style.setProperty("--draw-i", String(index));
  });
});
document.querySelectorAll(".course-card").forEach((card, index) => {
  card.style.setProperty("--draw-delay", `${index * 90}ms`);
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealTargets = document.querySelectorAll(".reveal");
if (reduceMotion || !("IntersectionObserver" in window)) {
  revealTargets.forEach((element) => element.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      activeObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

  revealTargets.forEach((element) => observer.observe(element));
}

// Cursor light follows the pointer only on devices that actually have a mouse.
const heroVisual = document.querySelector(".hero-visual");
if (heroVisual && !reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  heroVisual.addEventListener("pointermove", (event) => {
    const rect = heroVisual.getBoundingClientRect();
    heroVisual.style.setProperty("--spot-x", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    heroVisual.style.setProperty("--spot-y", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  });
  heroVisual.addEventListener("pointerleave", () => {
    heroVisual.style.setProperty("--spot-x", "52%");
    heroVisual.style.setProperty("--spot-y", "42%");
  });
}
