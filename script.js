const businessNumber = "9723385781";
let selectedPackage = "Priority Detail";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function smsHref(packageName) {
  const body = `Hi Protect & Shine Detailing, I'd like to book the ${packageName}.`;
  return `sms:${businessNumber}?&body=${encodeURIComponent(body)}`;
}

function syncSelectedPackage(packageName) {
  selectedPackage = packageName;
  document.querySelectorAll("[data-selected-package-label]").forEach((label) => {
    label.textContent = packageName;
  });
  document.querySelectorAll("[data-quote-form] select[name='service']").forEach((select) => {
    if (Array.from(select.options).some((option) => option.value === packageName)) {
      select.value = packageName;
    }
  });
  document.querySelectorAll("[data-sms-link]").forEach((link) => {
    link.setAttribute("href", smsHref(packageName));
  });
}

function initPreloader() {
  const preloader = document.querySelector("[data-preloader]");
  if (!preloader) return;

  const bar = preloader.querySelector("[data-preloader-bar]");
  const percent = preloader.querySelector("[data-preloader-percent]");
  let progress = 0;
  let hidden = false;

  const updateProgress = (value) => {
    progress = Math.max(progress, Math.min(100, Math.round(value)));
    bar?.style.setProperty("--preloader-progress", `${progress / 100}`);
    if (percent) percent.textContent = `${progress}%`;
  };

  const timer = window.setInterval(() => {
    if (hidden) return;
    const next = progress + (progress < 55 ? 7 : progress < 82 ? 4 : 2);
    updateProgress(Math.min(next, 94));
  }, 120);

  const hide = () => {
    if (hidden) return;
    hidden = true;
    updateProgress(100);
    window.clearInterval(timer);
    window.setTimeout(() => preloader.classList.add("is-hidden"), 260);
  };

  updateProgress(0);
  window.addEventListener("load", () => window.setTimeout(hide, 1700), { once: true });
  window.setTimeout(hide, 3600);
}

function accentTextNodes(text) {
  const nodes = [];
  const tokens = text.match(/\s+|\S+/g) || [];
  let accentedWords = 0;

  const pushAccent = (value) => {
    const span = document.createElement("span");
    span.className = accentedWords === 0 ? "accent-blue" : "accent-red";
    span.textContent = value;
    nodes.push(span);
    accentedWords += 1;
  };

  tokens.forEach((token) => {
    const isWord = /[A-Za-z0-9]/.test(token) && token !== "&";
    const hyphenated = token.match(/^([A-Za-z0-9]+)-([A-Za-z0-9].*)$/);

    if (isWord && accentedWords < 2) {
      if (hyphenated && accentedWords === 0) {
        pushAccent(hyphenated[1]);
        nodes.push(document.createTextNode("-"));
        pushAccent(hyphenated[2]);
        return;
      }

      pushAccent(token);
      return;
    }

    nodes.push(document.createTextNode(token));
  });

  return { nodes, accentedWords };
}

function accentHeadlineElement(element) {
  if (!element || element.dataset.headlineAccented === "true") return;

  const textNode = Array.from(element.childNodes).find(
    (node) => node.nodeType === Node.TEXT_NODE && /[A-Za-z0-9]/.test(node.textContent)
  );

  if (!textNode) return;

  const { nodes, accentedWords } = accentTextNodes(textNode.textContent);
  if (!accentedWords) return;

  textNode.replaceWith(...nodes);
  element.dataset.headlineAccented = "true";
  element.classList.add("headline-accented");
}

function initHeadlineAccents() {
  document
    .querySelectorAll(
      [
        ".brand-mark strong",
        "#hero-title > span",
        "main section h2",
        ".service-card h3",
        ".service-promise article h3",
        ".promise-panel span",
        ".promise-panel strong",
        ".showcase-copy > span",
        ".showcase-copy h3",
        ".package-card h3",
        ".truck-service-grid h3",
        ".trust-card h3",
        ".map-notes h3",
        ".quote-card h3",
        ".hero-badge-card h2",
        ".preloader strong",
        ".testimonial-stack small",
        ".footer-brand p",
      ].join(", ")
    )
    .forEach(accentHeadlineElement);
}

function initHeader() {
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");

  const closeNav = () => {
    nav?.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.setAttribute("aria-label", "Open navigation");
  };

  const syncHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 20);

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  toggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("is-open") || false;
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  nav?.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeNav();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });
}

function initShowcases() {
  document.querySelectorAll("[data-showcase-card]").forEach((card) => {
    const media = card.querySelector("[data-showcase-media]");
    const counter = card.querySelector("[data-showcase-counter]");
    const sources = Array.from(card.querySelectorAll("[data-showcase-src]"))
      .map((item) => item.dataset.showcaseSrc)
      .filter(Boolean);

    if (!media || sources.length === 0) return;

    let active = 0;
    let timer = 0;
    card.classList.toggle("has-carousel", sources.length > 1);

    const render = (next) => {
      window.clearTimeout(timer);
      active = (next + sources.length) % sources.length;
      media.style.opacity = "0.32";

      window.setTimeout(() => {
        media.src = sources[active];
        media.style.opacity = "1";
        if (counter) {
          counter.textContent = `${String(active + 1).padStart(2, "0")} / ${String(sources.length).padStart(2, "0")}`;
        }
        if (sources.length > 1 && !reducedMotion()) {
          timer = window.setTimeout(() => render(active + 1), 5200);
        }
      }, 150);
    };

    card.querySelector(".showcase-prev")?.addEventListener("click", () => render(active - 1));
    card.querySelector(".showcase-next")?.addEventListener("click", () => render(active + 1));
    render(0);
  });
}

function initPackages() {
  syncSelectedPackage(selectedPackage);

  document.querySelectorAll("[data-package]").forEach((button) => {
    button.addEventListener("click", () => {
      syncSelectedPackage(button.dataset.package || selectedPackage);
      document.querySelector("#quote")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function initFaq() {
  document.querySelectorAll(".faq-item button").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      if (!item) return;
      const isOpen = item.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  });
}

function initShowcaseVideos() {
  const videos = document.querySelectorAll(".showcase-card video");
  if (!videos.length) return;

  const playVideo = (video) => {
    video.muted = true;
    video.playsInline = true;
    video.play().catch(() => {});
  };

  const observer = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            playVideo(video);
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.18 })
    : null;

  videos.forEach((video) => {
    video.addEventListener("stalled", () => {
      video.load();
      playVideo(video);
    });
    video.addEventListener("waiting", () => window.setTimeout(() => playVideo(video), 300));
    video.closest(".showcase-card")?.addEventListener("mouseenter", () => playVideo(video));
    observer?.observe(video);
    playVideo(video);
  });
}

function initQuoteForm() {
  const form = document.querySelector("[data-quote-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const service = data.get("service") || selectedPackage;
    const details = [
      ["Name", data.get("name")],
      ["Phone", data.get("phone")],
      ["Service", service],
      ["Vehicle", data.get("vehicle")],
      ["Area", data.get("area")],
      ["Timing", data.get("timing")],
      ["Notes", data.get("notes")]
    ]
      .filter(([, value]) => String(value || "").trim())
      .map(([label, value]) => `${label}: ${String(value).trim()}`)
      .join("\n");

    const body = `Hi Protect & Shine Detailing, I'd like a quote.\n${details || `Service: ${service}`}`;
    window.location.href = `sms:${businessNumber}?&body=${encodeURIComponent(body)}`;
  });
}

function initCustomCursor() {
  if (!window.matchMedia("(pointer: fine)").matches || reducedMotion()) return;

  const dot = document.querySelector("[data-cursor-dot]");
  const ring = document.querySelector("[data-cursor-ring]");
  if (!dot || !ring) return;

  const gsapApi = window.gsap;
  if (gsapApi) {
    gsapApi.set([dot, ring], { xPercent: -50, yPercent: -50 });
  }

  const moveDot = gsapApi
    ? gsapApi.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" })
    : null;
  const moveDotY = gsapApi
    ? gsapApi.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" })
    : null;
  const moveRing = gsapApi
    ? gsapApi.quickTo(ring, "x", { duration: 0.34, ease: "power3.out" })
    : null;
  const moveRingY = gsapApi
    ? gsapApi.quickTo(ring, "y", { duration: 0.34, ease: "power3.out" })
    : null;

  window.addEventListener("mousemove", (event) => {
    dot.classList.add("is-visible");
    ring.classList.add("is-visible");

    if (gsapApi) {
      moveDot(event.clientX);
      moveDotY(event.clientY);
      moveRing(event.clientX);
      moveRingY(event.clientY);
      return;
    }

    dot.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
  }, { passive: true });

  document.querySelectorAll("a, button, input, select, textarea, .service-card, .package-card").forEach((item) => {
    item.addEventListener("mouseenter", () => ring.classList.add("is-hovering"));
    item.addEventListener("mouseleave", () => ring.classList.remove("is-hovering"));
  });
}

function initGsapAnimations() {
  const gsapApi = window.gsap;
  if (!gsapApi || reducedMotion()) return;

  if (window.ScrollTrigger) {
    gsapApi.registerPlugin(window.ScrollTrigger);
  }

  document.querySelectorAll(".package-card").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      gsapApi.to(card, {
        rotateX: y * -2,
        rotateY: x * 2,
        transformPerspective: 900,
        duration: 0.35,
        ease: "power3.out"
      });
    });

    card.addEventListener("mouseleave", () => {
      gsapApi.to(card, { rotateX: 0, rotateY: 0, duration: 0.45, ease: "power3.out" });
    });
  });
}

function initReveal() {
  const items = Array.from(document.querySelectorAll(
    ".section-kicker, .section-heading, .service-card, .service-promise, .service-promise article, .showcase-card, .package-card, .finish-media, .finish-copy, .trust-intro, .trust-card, .quote-copy, .testimonial-stack article, .quote-card, .map-frame, .map-copy, .map-notes article, .faq-item"
  )).filter((item) => !item.closest(".packages"));

  if (!("IntersectionObserver" in window) || reducedMotion()) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });

  items.forEach((item, index) => {
    item.classList.add("reveal-ready");
    item.style.setProperty("--reveal-delay", `${Math.min(index % 5, 4) * 55}ms`);
    observer.observe(item);
  });
}

initPreloader();
initHeader();
initHeadlineAccents();
initShowcases();
initPackages();
initFaq();
initShowcaseVideos();
initQuoteForm();
initCustomCursor();
initReveal();
initGsapAnimations();
