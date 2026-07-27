const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".site-nav a")];
const headerNode = document.querySelector(".site-header");
const revealSections = [...document.querySelectorAll("main section:not(.hero)")];
const heroSection = document.querySelector(".hero");
const heroMedia = document.querySelector(".hero-media");
const heroLayerPair = document.querySelector(".hero-layer-pair");
const heroLayerMid = document.querySelector(".hero-layer-mid");
const desktopViewportQuery = window.matchMedia("(min-width: 1201px)");

const isDesktopViewport = () => desktopViewportQuery.matches;
const getViewportMode = () => {
  if (window.innerWidth <= 800) return "mobile";
  if (window.innerWidth <= 1200) return "tablet";
  return "desktop";
};

const syncResponsivePictures = () => {
  const pictures = document.querySelectorAll("picture");

  pictures.forEach((picture) => {
    const img = picture.querySelector("img");
    if (!img) return;

    if (!img.dataset.defaultSrc) {
      img.dataset.defaultSrc = img.getAttribute("src") || "";
    }

    let nextSrc = img.dataset.defaultSrc || "";
    const sources = picture.querySelectorAll("source[srcset]");

    sources.forEach((source) => {
      const media = source.getAttribute("media");
      const srcset = source.getAttribute("srcset");

      if (!srcset) return;
      if (!media || window.matchMedia(media).matches) {
        nextSrc = srcset;
      }
    });

    if (nextSrc && img.getAttribute("src") !== nextSrc) {
      img.setAttribute("src", nextSrc);
    }
  });
};

const setActiveLink = () => {
  const offset = window.scrollY + window.innerHeight * 0.25;
  let currentId = sections[0]?.id;

  for (const section of sections) {
    if (offset >= section.offsetTop) {
      currentId = section.id;
    }
  }

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${currentId}`;
    link.classList.toggle("is-active", isActive);
  });
};

const portfolioProjects = [
  {
    image: "./assets/project-1-desktop.svg",
    alt: "Проект 1",
  },
  {
    image: "./assets/project-2-desktop.svg",
    alt: "Проект 2",
  },
  {
    image: "./assets/project-3-desktop.svg",
    alt: "Проект 3",
  },
  {
    image: "./assets/project-4-desktop.svg",
    alt: "Проект 4",
  },
  {
    image: "./assets/project-5-desktop.svg",
    alt: "Проект 5",
  },
  {
    image: "./assets/project-6-desktop.svg",
    alt: "Проект 6",
  },
];

const projectImageReadyCache = new Map();
const ensureProjectImageReady = (src) => {
  if (projectImageReadyCache.has(src)) {
    return projectImageReadyCache.get(src);
  }

  const image = new Image();
  image.src = src;

  const readyPromise = new Promise((resolve) => {
    const finish = () => resolve();

    if (image.complete) {
      finish();
      return;
    }

    image.addEventListener("load", finish, { once: true });
    image.addEventListener("error", finish, { once: true });
  }).then(() => {
    if (typeof image.decode === "function") {
      return image.decode().catch(() => {});
    }

    return undefined;
  });

  projectImageReadyCache.set(src, readyPromise);
  return readyPromise;
};

portfolioProjects.forEach((project) => {
  void ensureProjectImageReady(project.image);
});

const imageNodeBase = document.getElementById("portfolio-image-base");
const imageNodeOverlay = document.getElementById("portfolio-image-overlay");
const prevButton = document.querySelector(".portfolio-prev");
const nextButton = document.querySelector(".portfolio-next");
const portfolioSection = document.querySelector(".portfolio-section");
const portfolioVisual = document.querySelector(".portfolio-visual");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let currentProjectIndex = 0;
let lastScrollY = window.scrollY;
let switchTimeoutId = 0;
let animationFrameId = 0;
let isProjectTransitioning = false;
let portfolioCurrentShift = 0;
let portfolioTargetShift = 0;
let heroCurrentMediaScale = 1;
let heroTargetMediaScale = 1;
let heroCurrentScrollShift = 0;
let heroTargetScrollShift = 0;
let heroCurrentPairX = 0;
let heroCurrentPairY = 0;
let heroTargetPairX = 0;
let heroTargetPairY = 0;
let heroCurrentMidX = 0;
let heroCurrentMidY = 0;
let heroTargetMidX = 0;
let heroTargetMidY = 0;
let heroCurrentPairScale = 1.03;
let heroTargetPairScale = 1.03;
let heroCurrentMidScale = 1.01;
let heroTargetMidScale = 1.01;
let currentViewportMode = getViewportMode();
let projectTransitionId = 0;

const changeProject = (direction) => {
  if (isProjectTransitioning || !isDesktopViewport()) return;

  currentProjectIndex =
    (currentProjectIndex + direction + portfolioProjects.length) % portfolioProjects.length;
  renderProject(currentProjectIndex);
};

const renderProject = async (index, options = {}) => {
  const project = portfolioProjects[index];
  const immediate = options.immediate === true;
  if (!imageNodeBase || !imageNodeOverlay) return;

  if (!isDesktopViewport() || immediate || prefersReducedMotion.matches || !portfolioSection) {
    window.clearTimeout(switchTimeoutId);
    imageNodeBase.src = project.image;
    imageNodeBase.alt = project.alt;
    imageNodeOverlay.src = "";
    imageNodeOverlay.alt = "";
    portfolioSection.classList.remove("is-project-refresh");
    isProjectTransitioning = false;
    return;
  }

  if (isProjectTransitioning) {
    return;
  }

  if (imageNodeBase.getAttribute("src") === project.image) {
    return;
  }

  isProjectTransitioning = true;
  window.clearTimeout(switchTimeoutId);
  const activeTransitionId = ++projectTransitionId;
  await ensureProjectImageReady(project.image);

  if (activeTransitionId !== projectTransitionId) {
    return;
  }

  imageNodeBase.src = project.image;
  imageNodeBase.alt = project.alt;

  portfolioSection.classList.remove("is-project-refresh");
  void portfolioSection.offsetWidth;
  portfolioSection.classList.add("is-project-refresh");

  switchTimeoutId = window.setTimeout(() => {
    if (activeTransitionId !== projectTransitionId) {
      return;
    }

    portfolioSection.classList.remove("is-project-refresh");
    isProjectTransitioning = false;
  }, 220);
};

if (prevButton && nextButton) {
  renderProject(currentProjectIndex, { immediate: true });

  if (!prevButton.dataset.bound) {
    prevButton.dataset.bound = "true";
    prevButton.addEventListener("click", () => {
      changeProject(-1);
    });
  }

  if (!nextButton.dataset.bound) {
    nextButton.dataset.bound = "true";
    nextButton.addEventListener("click", () => {
      changeProject(1);
    });
  }
}

const updatePortfolioScrollEffect = () => {
  portfolioTargetShift = 0;
};

const updateHeroScrollEffect = () => {
  if (!heroSection || !heroMedia || prefersReducedMotion.matches || !isDesktopViewport()) {
    heroTargetScrollShift = 0;
    heroTargetMediaScale = 1;
    heroTargetPairScale = 1.03;
    heroTargetMidScale = 1.01;
    return;
  }

  const rect = heroSection.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const progress = Math.max(0, Math.min(1, -rect.top / Math.max(rect.height - viewportHeight, 1)));

  heroTargetScrollShift = progress * 26;
  heroTargetMediaScale = 1 - progress * 0.018;
  heroTargetPairScale = 1.03 + progress * 0.008;
  heroTargetMidScale = 1.01 + progress * 0.014;
};

const updateHeroPointerEffect = (event) => {
  if (!heroMedia || prefersReducedMotion.matches || !isDesktopViewport()) return;

  const rect = heroMedia.getBoundingClientRect();
  const relativeX = (event.clientX - rect.left) / rect.width;
  const relativeY = (event.clientY - rect.top) / rect.height;
  const normalizedX = (relativeX - 0.5) * 2;
  const normalizedY = (relativeY - 0.5) * 2;
  const shapedX = Math.sign(normalizedX) * Math.pow(Math.abs(normalizedX), 0.9);
  const shapedY = Math.sign(normalizedY) * Math.pow(Math.abs(normalizedY), 0.9);

  heroTargetPairX = shapedX * 11;
  heroTargetPairY = shapedY * 8;
  heroTargetMidX = shapedX * 28;
  heroTargetMidY = shapedY * 20;
};

const resetHeroPointerEffect = () => {
  heroTargetPairX = 0;
  heroTargetPairY = 0;
  heroTargetMidX = 0;
  heroTargetMidY = 0;
};

if (revealSections.length) {
  revealSections.forEach((section) => {
    section.classList.add("is-reveal-ready");
  });

  if (prefersReducedMotion.matches) {
    revealSections.forEach((section) => {
      section.classList.add("is-visible");
    });
    if (heroSection) {
      heroSection.classList.add("is-visible");
    }
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.12) {
            entry.target.classList.add("is-visible");
          } else {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: [0.08, 0.16, 0.24],
        rootMargin: "-6% 0px -6% 0px",
      }
    );

    revealSections.forEach((section) => {
      revealObserver.observe(section);
    });

    if (heroSection) {
      window.requestAnimationFrame(() => {
        heroSection.classList.add("is-visible");
      });
    }
  }
}

const animateScene = () => {
  if (!prefersReducedMotion.matches) {
    portfolioCurrentShift += (portfolioTargetShift - portfolioCurrentShift) * 0.12;
    heroCurrentMediaScale += (heroTargetMediaScale - heroCurrentMediaScale) * 0.08;
    heroCurrentScrollShift += (heroTargetScrollShift - heroCurrentScrollShift) * 0.08;
    heroCurrentPairX += (heroTargetPairX - heroCurrentPairX) * 0.18;
    heroCurrentPairY += (heroTargetPairY - heroCurrentPairY) * 0.18;
    heroCurrentMidX += (heroTargetMidX - heroCurrentMidX) * 0.2;
    heroCurrentMidY += (heroTargetMidY - heroCurrentMidY) * 0.2;
    heroCurrentPairScale += (heroTargetPairScale - heroCurrentPairScale) * 0.12;
    heroCurrentMidScale += (heroTargetMidScale - heroCurrentMidScale) * 0.12;

    if (portfolioVisual) {
      portfolioVisual.style.setProperty("--portfolio-shift", `${portfolioCurrentShift.toFixed(2)}px`);
    }

    if (heroMedia) {
      heroMedia.style.setProperty("--hero-scale", heroCurrentMediaScale.toFixed(4));
    }

    if (heroLayerPair) {
      heroLayerPair.style.setProperty("--hero-scroll-shift", `${heroCurrentScrollShift.toFixed(2)}px`);
      heroLayerPair.style.setProperty("--hero-pair-x", `${heroCurrentPairX.toFixed(2)}px`);
      heroLayerPair.style.setProperty("--hero-pair-y", `${heroCurrentPairY.toFixed(2)}px`);
      heroLayerPair.style.setProperty("--hero-pair-scale", heroCurrentPairScale.toFixed(4));
    }

    if (heroLayerMid) {
      heroLayerMid.style.setProperty("--hero-scroll-shift", `${heroCurrentScrollShift.toFixed(2)}px`);
      heroLayerMid.style.setProperty("--hero-mid-x", `${heroCurrentMidX.toFixed(2)}px`);
      heroLayerMid.style.setProperty("--hero-mid-y", `${heroCurrentMidY.toFixed(2)}px`);
      heroLayerMid.style.setProperty("--hero-mid-scale", heroCurrentMidScale.toFixed(4));
    }
  }

  animationFrameId = window.requestAnimationFrame(animateScene);
};

const updateHeaderState = () => {
  if (!headerNode) return;

  const currentScrollY = window.scrollY;
  const delta = currentScrollY - lastScrollY;
  const isNearTop = currentScrollY < 24;

  if (isNearTop) {
    headerNode.classList.remove("is-hidden", "is-scrolled-up");
    lastScrollY = currentScrollY;
    return;
  }

  if (delta > 6) {
    headerNode.classList.add("is-hidden");
    headerNode.classList.remove("is-scrolled-up");
  } else if (delta < -6) {
    headerNode.classList.remove("is-hidden");
    headerNode.classList.add("is-scrolled-up");
  }

  lastScrollY = currentScrollY;
};

setActiveLink();
updateHeaderState();
updatePortfolioScrollEffect();
updateHeroScrollEffect();
syncResponsivePictures();
animationFrameId = window.requestAnimationFrame(animateScene);

if (heroMedia && !prefersReducedMotion.matches) {
  heroMedia.addEventListener("mousemove", updateHeroPointerEffect);
  heroMedia.addEventListener("mouseleave", resetHeroPointerEffect);
}

window.addEventListener("scroll", () => {
  setActiveLink();
  updateHeaderState();
  updatePortfolioScrollEffect();
  updateHeroScrollEffect();
}, { passive: true });
window.addEventListener("resize", () => {
  resetHeroPointerEffect();
  const nextViewportMode = getViewportMode();

  if (nextViewportMode !== currentViewportMode) {
    currentViewportMode = nextViewportMode;
    syncResponsivePictures();
    renderProject(currentProjectIndex, { immediate: true });
  }

  updatePortfolioScrollEffect();
  updateHeroScrollEffect();
}, { passive: true });
