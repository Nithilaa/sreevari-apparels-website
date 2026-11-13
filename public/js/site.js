/* Behaviour: routing, reveals, scroll-driven sections, cursor effects and the enquiry form. */
(() => {
  const SV = window.SV;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const pad = (n) => String(n).padStart(2, "0");

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  // The single-file preview build and file:// use hash routes; the server uses real paths.
  const HASH_MODE = window.SV_ROUTER === "hash" || location.protocol === "file:";
  // Folder the site lives in. "/" on the Node server; "/repo-name/" on GitHub Pages.
  const BASE = window.SV_BASE || "/";
  // True when there is no server behind the site (GitHub Pages, the single-file preview): the form then sends through WhatsApp
  const NO_SERVER = HASH_MODE || window.SV_STATIC === true;
  const PAGES = ["about", "manufacturing", "products", "sourcing", "contact"];
  const MOVED = { capabilities: "manufacturing" }; // pages that were merged into another

  /* ---------- Smooth scrolling (desktop only, off for reduced motion) ---------- */
  let lenis = null;
  if (window.Lenis && fine && !reduced) {
    lenis = new window.Lenis({ lerp: 0.11 });
    const raf = (t) => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }
  function scrollToY(y, smooth) {
    if (lenis) lenis.scrollTo(y, { immediate: !smooth, force: true });
    else scrollTo({ top: y, behavior: smooth && !reduced ? "smooth" : "instant" });
  }
  const scrollToEl = (el, smooth) => scrollToY(scrollY + el.getBoundingClientRect().top, smooth);

  /* ---------- Reveal on scroll, with number counters ---------- */
  const fmt = (n) => n.toLocaleString("en-IN");
  function countUp(el) {
    const target = +el.dataset.count;
    if (reduced) return void (el.textContent = fmt(target));
    let start = null;
    const step = (ts) => {
      start = start || ts;
      const p = Math.min((ts - start) / 1600, 1);
      el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
        $$("[data-count]", e.target).forEach(countUp);
      }),
    { threshold: 0.15 },
  );
  const observeReveals = () => $$(".rv:not(.in)").forEach((e) => io.observe(e));

  /* ---------- Homepage: the shirt that comes together (drawn in garment.js) ---------- */
  const gSteps = $$("#gsteps li"),
    gNames = gSteps.map((li) => $("b", li).textContent);
  let gActive = -1;
  function garmentScroll() {
    const r = $("#journey").getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight));
    SV.garment.update(p);
    const i = Math.min(gSteps.length - 1, Math.floor(p * gSteps.length));
    $(".ghint").style.opacity = p > 0.03 ? 0 : 1;
    if (i === gActive) return;
    gActive = i;
    gSteps.forEach((li, k) => li.classList.toggle("on", k === i));
    $("#gcap").textContent = `${pad(i + 1)} · ${gNames[i]}`;
  }
  gSteps.forEach((li, k) =>
    li.addEventListener("click", () => {
      const r = $("#journey").getBoundingClientRect();
      scrollToY(scrollY + r.top + ((k + 0.55) / gSteps.length) * (r.height - innerHeight), true);
    }),
  );

  /* ---------- Homepage: product gallery (scrolls sideways on desktop, swipes on phones) ---------- */
  const hwrap = $("#hwrap"),
    htrack = $("#htrack");
  htrack.innerHTML = SV.products
    .map((p, i) => {
      const n = Array.isArray(p[1]) ? p[1][0] : p[1];
      return `<article class="hcard"><div class="himg" role="img" aria-label="${p[0]}" style="background-image:var(--im${n})"></div><div class="hmeta"><span class="mono">${pad(i + 1)}</span><span class="mono tag ${p[2] ? "" : "s"}">${p[2] ? "Manufactured by Sreevari" : "Sourced through partners"}</span></div><h3 class="serif">${p[0]}</h3><p>${p[3]}</p><button class="btn mono enq" data-cat="${p[0]}" data-route="${p[2] ? "Manufacturing" : "Sourcing"}">Enquire</button></article>`;
    })
    .join("");
  const sideways = matchMedia("(min-width: 821px)");
  function galleryScroll() {
    if (!sideways.matches) return void (htrack.style.transform = "");
    const r = hwrap.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight));
    htrack.style.transform = `translate3d(${-p * (htrack.scrollWidth - innerWidth)}px,0,0)`;
    $("#hbar").style.width = p * 100 + "%";
  }

  /* ---------- Manifesto: words brighten as you scroll through them ---------- */
  $$(".scrub").forEach((p) => {
    p.innerHTML = p.textContent
      .trim()
      .split(/\s+/)
      .map((w) => `<span>${w}</span>`)
      .join(" ");
  });
  function scrubScroll() {
    $$(".scrub").forEach((p) => {
      const words = $$("span", p),
        r = p.getBoundingClientRect();
      const prog = reduced ? 1 : clamp((innerHeight * 0.9 - r.top) / (innerHeight * 0.5));
      words.forEach((w, i) => w.classList.toggle("on", i < prog * words.length));
    });
  }

  /* ---------- Progress bar and parallax ---------- */
  function ambientScroll() {
    $("#pb").style.width = (scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) * 100 + "%";
    if (reduced) return;
    $$("main:not([hidden]) .im, #enquire:not([hidden]) .im").forEach((m) => {
      const r = m.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      m.firstElementChild.style.translate = `0 ${(r.top + r.height / 2 - innerHeight / 2) * -0.07}px`;
    });
    $$(".band").forEach((b) => {
      const r = b.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      b.style.backgroundPosition = `center ${30 + ((r.top + r.height) / (innerHeight + r.height)) * 40}%`;
    });
    const sw = $(".swatch");
    if (sw && !$("#home").hidden) sw.style.backgroundPosition = `center ${50 + sw.getBoundingClientRect().top * 0.02}%`;
  }

  /* ---------- Hero drifts and scales as it leaves; wide photos open like a window ---------- */
  function heroScroll() {
    if (reduced || scrollY > innerHeight) return;
    const p = scrollY / innerHeight;
    $(".hero .zoom").style.scale = 1 + p * 0.14;
    $(".hero h1").style.translate = `0 ${p * 90}px`;
    $(".hero h1").style.opacity = 1 - p * 1.1;
  }
  function windowScroll() {
    $$(".band").forEach((b) => {
      if (b.hidden) return;
      const r = b.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = clamp((innerHeight - r.top) / (innerHeight * 0.75));
      b.style.setProperty("--cx", (1 - p) * 9 + "%");
      b.style.setProperty("--cy", (1 - p) * 16 + "%");
    });
  }

  // The floating WhatsApp button steps aside while the enquiry builder is on screen, so it never covers its buttons
  new IntersectionObserver(([e]) => $(".sticky-wa").classList.toggle("away", e.isIntersecting), {
    rootMargin: "0px 0px -120px 0px",
  }).observe($("#builder"));

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      if (!$("#home").hidden) {
        garmentScroll();
        galleryScroll();
        heroScroll();
      }
      scrubScroll();
      ambientScroll();
      if (!reduced) windowScroll();
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);

  /* ---------- Router with a curtain transition ---------- */
  const curtain = $("#cu"),
    menu = $("#mm"),
    menuBtn = $("#mb");
  let shown = null,
    ready = false;

  function currentPage() {
    if (HASH_MODE) {
      const h = location.hash.slice(1);
      return h.startsWith("page-") && PAGES.includes(h.slice(5)) ? h.slice(5) : "";
    }
    const p = location.pathname
      .slice(BASE.length)
      .replace(/index\.html$/, "")
      .replace(/^\/+|\/+$/g, "");
    return PAGES.includes(p) ? p : MOVED[p] || "";
  }

  function closeMenu() {
    menu.classList.remove("on");
    menuBtn.textContent = "Menu";
    menuBtn.setAttribute("aria-expanded", "false");
    if (lenis) lenis.start();
  }

  function swap(page, anchor) {
    $$("main").forEach((m) => (m.hidden = m.id !== (page ? "page-" + page : "home")));
    // The enquiry form and the facility photo close the homepage and the Contact page only
    $("#enquire").hidden = !(page === "" || page === "contact");
    $("#shravan").hidden = page !== "";
    document.title = SV.titles[page];
    $$("nav .links a, #mm a").forEach((a) => {
      const on = page !== "" && a.getAttribute("href").replace(/^#page-|^\.?\/|\/$/g, "") === page;
      on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
    });
    closeMenu();
    const target = anchor && document.getElementById(anchor);
    target && !target.hidden ? scrollToEl(target, false) : scrollToY(0, false);
    if (ready) observeReveals();
    gActive = -1;
    if (SV.innerRefresh) SV.innerRefresh();
    onScroll();
  }

  function render(anchor) {
    const page = currentPage();
    if (shown === null || shown === page || reduced) {
      shown = page;
      return swap(page, anchor);
    }
    shown = page;
    $("span", curtain).textContent = page ? page[0].toUpperCase() + page.slice(1) : "Sreevari";
    curtain.className = "cover";
    setTimeout(() => {
      swap(page, anchor);
      curtain.className = "leave";
      setTimeout(() => (curtain.className = ""), 650);
    }, 600);
  }

  let pendingAnchor = null;
  function navigate(page, anchor) {
    if (HASH_MODE) {
      pendingAnchor = anchor || null;
      const next = page ? "#page-" + page : "#";
      if (location.hash === next || (!page && !currentPage())) render(anchor);
      else location.hash = next;
    } else {
      // Static hosts serve each page from its own folder, so those addresses end in "/"
      history.pushState({}, "", BASE + (page && window.SV_BASE ? page + "/" : page));
      render(anchor);
    }
  }
  addEventListener(HASH_MODE ? "hashchange" : "popstate", () => {
    render(pendingAnchor);
    pendingAnchor = null;
  });

  // Internal links: "/about" style routes and "#section" anchors
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute("href");
    // The static build writes page links as "#page-about"; the server build uses "/about"
    const route = href === "#" ? "" : (href.match(/^#page-(\w+)$/) || [])[1];
    if (route !== undefined && (route === "" || PAGES.includes(route))) {
      e.preventDefault();
      navigate(route);
    } else if (href.startsWith("#") && href.length > 1) {
      const el = document.getElementById(href.slice(1));
      if (!el) return;
      e.preventDefault();
      closeMenu();
      scrollToEl(el, true);
    } else if (!/^(#|[a-z]+:)/i.test(href)) {
      // "/about" on the server, "about/" on static hosts, "/" or "./" for home
      const page = href.replace(/^\.?\//, "").replace(/\/$/, "");
      if (page !== "" && !PAGES.includes(page)) return;
      e.preventDefault();
      navigate(page);
    }
  });

  menuBtn.addEventListener("click", () => {
    const open = menu.classList.toggle("on");
    menuBtn.textContent = open ? "Close" : "Menu";
    menuBtn.setAttribute("aria-expanded", String(open));
    if (lenis) open ? lenis.stop() : lenis.start();
  });
  addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());

  /* ---------- "Enquire" buttons hand the chosen product to the enquiry builder (enquiry.js) ---------- */
  // Used by every "Enquire" button: choose the product in the builder, then bring the builder into view
  SV.goEnquire = (category, route, note, fromHome) => {
    SV.enquiry.select(category, route, note);
    fromHome ? scrollToEl($("#enquire"), true) : navigate("contact", "enquire");
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".enq");
    if (b) SV.goEnquire(b.dataset.cat, b.dataset.route, "", !!b.closest("#home"));
  });

  /* ---------- Pointer effects (mouse only) ---------- */
  if (fine && !reduced) {
    const dot = $("#dot");
    let x = 0,
      y = 0,
      tx = 0,
      ty = 0;
    addEventListener("mousemove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
      dot.style.opacity = 1;
      dot.classList.toggle("big", !!e.target.closest("a, button, #gsteps li"));
    });
    (function follow() {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      dot.style.transform = `translate(${x - 6}px,${y - 6}px)`;
      requestAnimationFrame(follow);
    })();

    $(".hero").addEventListener("mousemove", (e) => {
      const z = $(".zoom");
      z.style.setProperty("--mx", (e.clientX / innerWidth - 0.5) * 34);
      z.style.setProperty("--my", (e.clientY / innerHeight - 0.5) * 22);
    });

    // Magnetic buttons (delegated so buttons inside generated pages work too)
    document.addEventListener("mousemove", (e) => {
      const b = e.target.closest(".btn");
      $$(".btn.mag").forEach((o) => {
        if (o !== b) {
          o.style.transform = "";
          o.classList.remove("mag");
        }
      });
      if (!b) return;
      const r = b.getBoundingClientRect();
      b.classList.add("mag");
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.15}px,${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
    });
  }

  /* ---------- Intro, then start ---------- */
  function start() {
    document.documentElement.classList.add("ready");
    ready = true;
    observeReveals();
  }
  if (!HASH_MODE)
    addEventListener("hashchange", () => {
      const old = (location.hash.match(/^#page-(\w+)$/) || [])[1];
      if (PAGES.includes(old)) {
        history.replaceState({}, "", BASE);
        navigate(old);
      }
    });
  // Older links used "#page-about"; send them to the page's real address
  const legacy = (location.hash.match(/^#page-(\w+)$/) || [])[1];
  if (!HASH_MODE && PAGES.includes(legacy))
    history.replaceState({}, "", BASE + (window.SV_BASE ? legacy + "/" : legacy));
  render(HASH_MODE ? null : location.hash.slice(1));
  const pre = $("#pre");
  let seen = false;
  try {
    seen = sessionStorage.getItem("sv-seen") === "1";
    sessionStorage.setItem("sv-seen", "1");
  } catch {}
  if (seen || reduced) {
    pre.remove();
    start();
  } else {
    pre.classList.add("run");
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.all([fonts, new Promise((r) => setTimeout(r, 1700))]).then(() => {
      pre.classList.add("done");
      start();
      setTimeout(() => pre.remove(), 1000);
    });
  }
})();
