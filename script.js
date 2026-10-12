const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector("#mobile-nav");

if (menuButton && mobileNav) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    mobileNav.hidden = isOpen;
    menuButton.setAttribute("aria-label", isOpen ? "Открыть меню" : "Закрыть меню");
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Открыть меню");
      mobileNav.hidden = true;
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Открыть меню");
      mobileNav.hidden = true;
      menuButton.focus();
    }
  });
}

const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealTargets = document.querySelectorAll(
  ".method-item, .group-visual, .group-copy, .course-card, .why-title, .why-copy, .final-cta, .footer"
);

revealTargets.forEach((element, index) => {
  element.setAttribute("data-reveal", "");
  if (element.classList.contains("course-card")) {
    element.style.setProperty("--reveal-delay", `${(index % 4) * 80}ms`);
  } else {
    element.style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 70}ms`);
  }
});

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealTargets.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -45px 0px" });

  revealTargets.forEach((element) => revealObserver.observe(element));
}

// Move the soft highlight with the pointer on the hero illustration.
const heroArt = document.querySelector(".hero-art");
if (heroArt && !reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  heroArt.addEventListener("pointermove", (event) => {
    const rect = heroArt.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    heroArt.style.setProperty("--spot-x", `${x}%`);
    heroArt.style.setProperty("--spot-y", `${y}%`);
  });
  heroArt.addEventListener("pointerleave", () => {
    heroArt.style.setProperty("--spot-x", "50%");
    heroArt.style.setProperty("--spot-y", "40%");
  });
}
