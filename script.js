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


// Full-screen, split-screen course explorer.
const explorer = document.querySelector("#course-explorer");
const explorerScene = document.querySelector("#explorer-scene");
const explorerTitle = document.querySelector("#explorer-title");
const explorerDescription = document.querySelector("#explorer-description");
const explorerCategory = document.querySelector("#explorer-category");
const explorerIndex = document.querySelector(".explorer-index");
const explorerTags = document.querySelector("#explorer-tags");
const explorerCta = document.querySelector("#explorer-cta");
const sceneArt = document.querySelector("#scene-art");
const sceneOverline = document.querySelector("#scene-overline");
const sceneConcept = document.querySelector("#scene-concept");
const sceneCaption = document.querySelector("#scene-caption");
const explorerClose = document.querySelector(".explorer-close");
const explorerOptions = [...document.querySelectorAll(".explorer-option")];
let lastExplorerFocus = null;
let activeSubject = "physics";
let sceneSwapTimer = null;

const subjectData = {
  physics: {
    index: "01", category: "ЕСТЕСТВЕННЫЕ НАУКИ", title: "Физика",
    description: "Увидеть законы, которые управляют движением, светом и энергией. Не заучивать формулы вслепую — понимать, что за ними стоит.",
    tags: ["ЕГЭ", "ОГЭ", "ГРАФИКИ И ЗАКОНЫ"], url: "https://t.me/Alfred_physx_bot",
    scene: "scene-physics", overline: "PHYSICS / 01", concept: "Сила и движение", caption: "ЗАКОНЫ СТАНОВЯТСЯ ВИДИМЫМИ",
    svg: `<g class="scene-axis"><path d="M74 470 H535 M110 510 V90"/><path d="M530 464 l12 6 -12 6 M104 95 l6 -12 6 12"/></g>
      <g class="scene-graph"><path class="scene-draw" pathLength="1" d="M112 420 C175 420 184 370 230 337 S302 255 342 255 S424 177 505 126"/></g>
      <g class="scene-particles"><circle cx="230" cy="337" r="7"/><circle cx="342" cy="255" r="8"/><circle cx="505" cy="126" r="10"/></g>
      <g class="scene-formula"><rect x="145" y="130" width="174" height="76" rx="17"/><text x="232" y="178" text-anchor="middle">F = m · a</text></g>
      <g class="scene-ball"><circle cx="365" cy="375" r="57"/><circle cx="345" cy="355" r="14"/><path d="M325 400 Q365 430 407 392"/></g>
      <g class="scene-labels"><text x="117" y="495">0</text><text x="505" y="495">t →</text><text x="72" y="111">v</text><text x="377" y="340">m</text></g>`
  },
  math: {
    index: "02", category: "ТОЧНЫЕ НАУКИ", title: "Математика",
    description: "Увидеть логику за формулами: как ведут себя функции, где прячется закономерность и как шаг за шагом подойти к решению.",
    tags: ["ЕГЭ", "ФУНКЦИИ", "АЛГЕБРА И ГЕОМЕТРИЯ"], url: "https://t.me/PF_Math_bot",
    scene: "scene-math", overline: "MATHEMATICS / 02", concept: "Форма функции", caption: "ГРАФИК — ЭТО ТОЖЕ РАССКАЗ",
    svg: `<g class="scene-axis"><path d="M65 470 H540 M110 515 V80"/><path d="M534 464 l12 6 -12 6 M104 85 l6 -12 6 12"/></g>
      <g class="scene-graph"><path class="scene-draw" pathLength="1" d="M115 120 C155 430 230 500 310 330 S445 90 520 125"/></g>
      <g class="scene-particles"><circle cx="310" cy="330" r="8"/><circle cx="190" cy="408" r="7"/><circle cx="440" cy="155" r="9"/></g>
      <g class="scene-formula"><rect x="130" y="135" width="220" height="82" rx="17"/><text x="240" y="185" text-anchor="middle">y = x² − 2</text></g>
      <g class="scene-labels"><text x="116" y="495">0</text><text x="512" y="495">x →</text><text x="73" y="105">y</text><text x="326" y="307">f(x)</text></g>
      <g fill="none" stroke="var(--scene-accent-2)" stroke-width="3"><path class="scene-draw" pathLength="1" d="M190 408 V470 M190 470 H110"/></g>`
  },
  russian: {
    index: "03", category: "ЯЗЫК И СМЫСЛ", title: "Русский язык",
    description: "Разобрать правила по смыслу, увидеть структуру предложения и научиться замечать важные детали в заданиях и тексте.",
    tags: ["ЕГЭ", "ПРАВИЛА", "ТЕКСТ И ГРАММАТИКА"], url: "https://t.me/Gog_ya_bot",
    scene: "scene-russian", overline: "RUSSIAN / 03", concept: "Смысл в деталях", caption: "ЗАМЕЧАТЬ. ПОНИМАТЬ. ОБЪЯСНЯТЬ.",
    svg: `<g transform="rotate(-5 300 300)"><rect x="125" y="85" width="355" height="425" rx="22" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.55)" stroke-width="2"/>
      <path d="M165 155 H360 M165 185 H435 M165 215 H405 M165 245 H360 M165 305 H430 M165 335 H390 M165 365 H420 M165 395 H330" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="5" stroke-linecap="round"/>
      <rect x="158" y="265" width="220" height="22" rx="8" fill="var(--scene-accent)" opacity=".95"/><path class="scene-draw" pathLength="1" d="M164 276 H370" fill="none" stroke="var(--scene-accent-2)" stroke-width="3" stroke-linecap="round"/>
      <text x="165" y="130" fill="white" font-size="20" font-family="Georgia,serif">Предложение № 03</text></g>
      <g class="scene-formula"><rect x="335" y="105" width="170" height="74" rx="16"/><text x="420" y="150" text-anchor="middle">НЕ / НИ?</text></g>
      <g class="scene-particles"><circle cx="450" cy="385" r="9"/><circle cx="410" cy="420" r="6"/><circle cx="480" cy="445" r="7"/></g>
      <g class="scene-labels"><text x="125" y="550">СМЫСЛ</text><text x="420" y="550">ПРАВИЛО →</text></g>`
  },
  oge: {
    index: "04", category: "БАЗА И УВЕРЕННОСТЬ", title: "Математика",
    description: "ОГЭ: укрепить базу, читать чертежи и переводить условие задачи в понятные действия — без паники перед большим заданием.",
    tags: ["ОГЭ", "ГЕОМЕТРИЯ", "БАЗОВЫЕ НАВЫКИ"], url: "https://t.me/M_OGE_bot",
    scene: "scene-oge", overline: "MATH / OGE 04", concept: "Задача по шагам", caption: "СЛОЖНОЕ РАСКЛАДЫВАЕМ НА ПРОСТОЕ",
    svg: `<g class="scene-axis"><path d="M85 485 H525 M110 505 V95"/></g>
      <g fill="rgba(255,255,255,.07)" stroke="var(--scene-accent)" stroke-width="3" stroke-linejoin="round"><path class="scene-draw" pathLength="1" d="M145 430 L300 145 L495 430 Z"/><path class="scene-draw" pathLength="1" d="M300 145 V430"/><path class="scene-draw" pathLength="1" d="M300 385 H330 V430"/></g>
      <g class="scene-particles"><circle cx="145" cy="430" r="8"/><circle cx="300" cy="145" r="8"/><circle cx="495" cy="430" r="8"/></g>
      <g class="scene-formula"><rect x="130" y="105" width="155" height="66" rx="16"/><text x="207" y="145" text-anchor="middle">a² + b²</text></g>
      <g class="scene-labels"><text x="125" y="460">A</text><text x="300" y="125">B</text><text x="505" y="460">C</text><text x="310" y="350">h</text></g>
      <g fill="none" stroke="var(--scene-accent-2)" stroke-width="3"><path class="scene-draw" pathLength="1" d="M375 220 C420 200 447 230 438 255"/></g>`
  }
};

function renderSubject(key, initial = false) {
  const data = subjectData[key];
  if (!data || !explorer) return;
  activeSubject = key;
  explorerOptions.forEach((button) => {
    const active = button.dataset.subject === key;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  {
    explorerScene.classList.add("is-changing");
    if (sceneSwapTimer) window.clearTimeout(sceneSwapTimer);
    sceneSwapTimer = window.setTimeout(() => {
      explorerTitle.innerHTML = `${data.title}<span class="explorer-period">.</span>`;
      explorerDescription.textContent = data.description;
      explorerCategory.textContent = data.category;
      explorerIndex.textContent = data.index;
      explorerTags.replaceChildren(...data.tags.map((tag) => {
        const item = document.createElement("span");
        item.textContent = tag;
        return item;
      }));
      explorerCta.href = data.url;
      explorerScene.className = `explorer-scene ${data.scene}`;
      sceneArt.classList.add("is-exiting");
      document.querySelectorAll(".scene-float-card").forEach((card) => card.classList.add("is-exiting"));
      sceneOverline.textContent = data.overline;
      sceneConcept.textContent = data.concept;
      sceneCaption.textContent = data.caption;
      sceneArt.setAttribute("aria-label", `Анимированная визуализация: ${data.title}`);
      sceneArt.innerHTML = `<defs><filter id="scene-glow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>${data.svg}`;
      // Re-enter with a fresh animation after the wipe has covered the scene.
      void sceneArt.getBoundingClientRect();
      explorerScene.classList.add("is-changing");
      window.setTimeout(() => {
        sceneArt.classList.remove("is-exiting");
        document.querySelectorAll(".scene-float-card").forEach((card) => card.classList.remove("is-exiting"));
      }, reduceMotion ? 0 : 240);
      window.setTimeout(() => explorerScene.classList.remove("is-changing"), reduceMotion ? 0 : 660);
    }, initial ? 0 : 220);
  }
}

function openExplorer(event) {
  if (!explorer) return;
  if (event) event.preventDefault();
  lastExplorerFocus = event && event.currentTarget instanceof HTMLElement ? event.currentTarget : document.activeElement;
  explorer.hidden = false;
  explorer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  renderSubject(activeSubject, true);
  window.requestAnimationFrame(() => {
    explorer.classList.add("is-open");
    explorerClose?.focus();
  });
}
function closeExplorer() {
  if (!explorer || explorer.hidden) return;
  explorer.classList.remove("is-open");
  explorer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  window.setTimeout(() => { explorer.hidden = true; }, reduceMotion ? 0 : 360);
  if (lastExplorerFocus && typeof lastExplorerFocus.focus === "function") lastExplorerFocus.focus();
}
document.querySelectorAll("[data-open-selector]").forEach((link) => link.addEventListener("click", openExplorer));
explorerClose?.addEventListener("click", closeExplorer);
explorer?.addEventListener("click", (event) => {
  if (event.target === explorer) closeExplorer();
});
explorerOptions.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.subject === activeSubject) {
      explorerScene.classList.remove("is-changing");
      void sceneArt.getBoundingClientRect();
      explorerScene.classList.add("is-changing");
      window.setTimeout(() => explorerScene.classList.remove("is-changing"), reduceMotion ? 0 : 660);
      return;
    }
    renderSubject(button.dataset.subject);
  });
});
document.addEventListener("keydown", (event) => {
  if (!explorer || explorer.hidden) return;
  if (event.key === "Escape") closeExplorer();
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    const index = explorerOptions.findIndex((button) => button.dataset.subject === activeSubject);
    const next = (index + (event.key === "ArrowDown" ? 1 : explorerOptions.length - 1)) % explorerOptions.length;
    explorerOptions[next].focus();
  }
});
