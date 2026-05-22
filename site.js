const header = document.querySelector("[data-header]");
const intro = document.querySelector("[data-intro]");
const cursor = document.querySelector(".cursor-dot");
const revealItems = document.querySelectorAll(".reveal");
const bigCountItems = document.querySelectorAll("[data-big-count]");
const zoomSection = document.querySelector("[data-zoom-section]");
const partnersTitle = document.querySelector(".partners h2");
const referenceSection = document.querySelector("[data-reference-section]");
const truthLetters = Array.from(document.querySelectorAll("[data-letter]"));
const truthLetterStage = document.querySelector(".truth-letters");
const contactModal = document.querySelector("[data-contact-modal]");
const openContactButtons = document.querySelectorAll("[data-open-contact]");
const closeContactButton = document.querySelector("[data-close-contact]");
const menuCluster = document.querySelector("[data-menu-cluster]");
const menuToggle = document.querySelector("[data-menu-toggle]");
let scrollMotionFrame = 0;

const scrollTextItems = [
  { element: document.querySelector(".hero h1"), strength: -0.16, vertical: -0.05 },
  { element: document.querySelector(".number-showcase h2"), strength: 0.1, vertical: -0.04 },
].filter((item) => item.element);

scrollTextItems.forEach(({ element }) => element.classList.add("scroll-reactive"));

const finishIntro = () => {
  if (!intro || intro.classList.contains("is-done")) return;
  intro.classList.add("is-done");
  document.body.classList.remove("intro-playing");

  window.setTimeout(() => {
    intro.remove();
  }, 700);
};

if (intro) {
  window.setTimeout(finishIntro, 2300);
  window.addEventListener("load", () => window.setTimeout(finishIntro, 1700), { once: true });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const bigCountObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const target = entry.target;
      const end = Number(target.dataset.bigCount || 0);
      const duration = 1100;
      const startTime = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        target.textContent = Math.round(end * eased).toLocaleString("ko-KR");

        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      bigCountObserver.unobserve(target);
    });
  },
  { threshold: 0.45 }
);

bigCountItems.forEach((item) => bigCountObserver.observe(item));

document.addEventListener("mousemove", (event) => {
  if (!cursor) return;
  cursor.style.left = `${event.clientX}px`;
  cursor.style.top = `${event.clientY}px`;
  cursor.style.opacity = "1";
});

document.querySelectorAll("a, button").forEach((item) => {
  item.addEventListener("mouseenter", () => cursor?.classList.add("is-active"));
  item.addEventListener("mouseleave", () => cursor?.classList.remove("is-active"));
});

openContactButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!contactModal) return;
    if (typeof contactModal.showModal === "function") {
      contactModal.showModal();
    } else {
      contactModal.setAttribute("open", "");
    }
  });
});

closeContactButton?.addEventListener("click", () => contactModal?.close());

contactModal?.addEventListener("click", (event) => {
  if (event.target === contactModal) contactModal.close();
});

contactModal?.querySelector(".contact-modal-panel")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const submitButton = event.currentTarget.querySelector(".modal-submit");
  submitButton.textContent = "문의가 접수되었습니다";
  submitButton.disabled = true;

  window.setTimeout(() => {
    contactModal.close();
    submitButton.textContent = "문의 보내기";
    submitButton.disabled = false;
    event.currentTarget.reset();
  }, 1100);
});

document.querySelectorAll(".service-options button").forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("is-selected");
  });
});

menuToggle?.addEventListener("click", () => {
  const isOpen = menuCluster?.classList.toggle("is-open") || false;
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.addEventListener("click", (event) => {
  if (!menuCluster?.contains(event.target)) {
    menuCluster?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const updateTruthLetters = (progress) => {
  const finalGap = Math.min(window.innerWidth * 0.034, 36);
  const wordGap = finalGap * 1.35;
  const breakpoints = [7, 10, 13];
  const totalWidth = finalGap * (truthLetters.length - 1) + wordGap * breakpoints.length;
  const startX = -totalWidth * 0.5;
  const eased = 1 - Math.pow(1 - progress, 3);
  truthLetterStage?.style.setProperty("--truth-final-opacity", clamp((progress - 0.76) / 0.18, 0, 1).toFixed(3));

  truthLetters.forEach((letter, index) => {
    const fromX = Number(letter.dataset.x || 0);
    const fromY = Number(letter.dataset.y || 0);
    const fromR = Number(letter.dataset.r || 0);
    const wordOffset = breakpoints.filter((point) => index >= point).length * wordGap;
    const targetX = startX + index * finalGap + wordOffset;
    const targetY = 0;
    const x = fromX + (targetX - fromX) * eased;
    const y = fromY + (targetY - fromY) * eased;
    const r = fromR * (1 - eased);

    letter.style.setProperty("--truth-x", `${x.toFixed(2)}px`);
    letter.style.setProperty("--truth-y", `${y.toFixed(2)}px`);
    letter.style.setProperty("--truth-r", `${r.toFixed(2)}deg`);
  });
};

const updateScrollMotion = () => {
  scrollMotionFrame = 0;
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight || 1;

  header?.classList.toggle("is-scrolled", scrollY > 24);

  if (zoomSection) {
    const rect = zoomSection.getBoundingClientRect();
    const scrollable = Math.max(1, rect.height - viewportHeight);
    const progress = clamp(-rect.top / scrollable, 0, 1);
    const scale = 0.72 + progress * 5.4;
    const endGlow = clamp((progress - 0.72) / 0.28, 0, 1);

    zoomSection.style.setProperty("--zoom-progress", progress.toFixed(3));
    zoomSection.style.setProperty("--zoom-scale", scale.toFixed(3));
    zoomSection.style.setProperty("--zoom-end", endGlow.toFixed(3));
    zoomSection.style.setProperty("--ghost-x", `${(progress * 80).toFixed(2)}px`);
    zoomSection.style.setProperty("--ghost-y", `${(-progress * 60).toFixed(2)}px`);
  }

  if (partnersTitle) {
    const rect = partnersTitle.getBoundingClientRect();
    const distance = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
    partnersTitle.style.setProperty("--partners-title-x", `${clamp(distance * -120, -140, 140).toFixed(2)}px`);
  }

  if (referenceSection) {
    const rect = referenceSection.getBoundingClientRect();
    const scrollable = Math.max(1, viewportHeight * 0.82);
    const progress = clamp(-rect.top / scrollable, 0, 1);
    updateTruthLetters(progress);
  }

  scrollTextItems.forEach(({ element, strength, vertical }) => {
    const rect = element.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const distance = (center - viewportHeight / 2) / viewportHeight;
    const x = clamp(distance * viewportHeight * strength, -90, 90);
    const y = clamp(distance * viewportHeight * vertical, -34, 34);

    element.style.setProperty("--scroll-text-x", `${x.toFixed(2)}px`);
    element.style.setProperty("--scroll-text-y", `${y.toFixed(2)}px`);
  });
};

const requestScrollMotion = () => {
  if (scrollMotionFrame) return;
  scrollMotionFrame = requestAnimationFrame(updateScrollMotion);
};

window.addEventListener("scroll", requestScrollMotion, { passive: true });
window.addEventListener("resize", requestScrollMotion);
requestScrollMotion();
