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
  const hide = () => preloader?.classList.add("is-hidden");

  window.addEventListener("load", () => window.setTimeout(hide, 1250), { once: true });
  window.setTimeout(hide, 2800);
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

function initReveal() {
  const items = document.querySelectorAll(
    ".section-kicker, .section-heading, .service-card, .service-promise, .service-promise article, .showcase-card, .package-card, .finish-media, .finish-copy, .trust-intro, .trust-card, .quote-copy, .testimonial-stack article, .quote-card, .map-frame, .map-copy, .map-notes article, .faq-item"
  );

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
initShowcases();
initPackages();
initFaq();
initShowcaseVideos();
initQuoteForm();
initReveal();
