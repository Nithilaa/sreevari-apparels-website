/*
 * Behaviour for the inner pages:
 *   Products       a shirt you can recolour and re-weave, which feeds the enquiry
 *   Manufacturing  the photo stays in place and changes as the seven stages scroll past
 *   About          a thread that draws itself down the company's story
 */
(() => {
  const SV = window.SV;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const wide = matchMedia("(min-width: 821px)");

  /* ---------- Products: fabric and colour picker ---------- */
  const config = $("#config");
  if (config && SV.shirtMarkup) {
    const pick = { colour: 1, weave: 0, pocket: true };
    config.innerHTML = `
<div class="cstage">${SV.shirtMarkup()}<span class="mono cnote">Illustration</span></div>
<div class="cctl">
  <span class="mono">Colour</span>
  <div class="cdots" role="group" aria-label="Colour">${SV.fabricColours.map((c, i) => `<button type="button" data-colour="${i}" aria-pressed="false" aria-label="${c[0]}" title="${c[0]}" style="--dot:${c[1]}"></button>`).join("")}</div>
  <span class="mono">Weave</span>
  <div class="cseg" role="group" aria-label="Weave">${SV.fabricWeaves.map((w, i) => `<button type="button" data-weave="${i}" aria-pressed="false">${w}</button>`).join("")}</div>
  <span class="mono">Pocket</span>
  <div class="cseg" role="group" aria-label="Pocket"><button type="button" data-pocket="1" aria-pressed="false">With</button><button type="button" data-pocket="0" aria-pressed="false">Without</button></div>
  <p class="csum" aria-live="polite"></p>
  <button type="button" class="btn mono" id="cenq">Enquire about this shirt</button>
  <p class="cfine">A few options to show the idea. Fabric, colour and construction follow your specification.</p>
</div>`;
    const svg = $(".cshirt", config);
    const summary = () =>
      `${SV.fabricColours[pick.colour][0]}, ${SV.fabricWeaves[pick.weave].toLowerCase()}, ${pick.pocket ? "with" : "without"} a chest pocket`;
    function paint() {
      const [, fab, fab2, stripe] = SV.fabricColours[pick.colour];
      svg.style.setProperty("--fab", fab);
      svg.style.setProperty("--fab2", fab2);
      svg.style.setProperty("--stripe", stripe);
      svg.dataset.weave = SV.fabricWeaves[pick.weave].toLowerCase();
      svg.classList.toggle("nopocket", !pick.pocket);
      svg.classList.toggle("deep", pick.colour === 2 || pick.colour === 4);
      $$("[data-colour]", config).forEach((b, i) => b.setAttribute("aria-pressed", String(i === pick.colour)));
      $$("button[data-weave]", config).forEach((b, i) => b.setAttribute("aria-pressed", String(i === pick.weave)));
      $$("[data-pocket]", config).forEach((b) =>
        b.setAttribute("aria-pressed", String((b.dataset.pocket === "1") === pick.pocket)),
      );
      $(".csum", config).textContent = summary();
      // a quick settle each time the fabric changes
      svg.classList.remove("swap");
      void svg.getBoundingClientRect();
      svg.classList.add("swap");
    }
    config.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.colour) pick.colour = +b.dataset.colour;
      else if (b.dataset.weave) pick.weave = +b.dataset.weave;
      else if (b.dataset.pocket) pick.pocket = b.dataset.pocket === "1";
      else if (b.id === "cenq") return SV.goEnquire("Shirts", "Manufacturing", "Shirt: " + summary() + ".");
      paint();
    });
    paint();
  }

  /* ---------- Products: the range. Hover or tap a category to bring it onto the stage ---------- */
  const showItems = $$(".showlist li"),
    showImgs = $$(".showimg");
  function showProduct(i, toggle) {
    showItems.forEach((li) => {
      const open = +li.dataset.i === i && !(toggle && li.classList.contains("on"));
      li.classList.toggle("on", open);
      $("button", li).setAttribute("aria-expanded", String(open));
    });
    showImgs.forEach((im, k) => im.classList.toggle("on", k === i));
    const p = SV.products[i],
      card = $(".showcard");
    $(".shownum").textContent = String(i + 1).padStart(2, "0");
    $(".tag", card).textContent = p[2] ? "Manufactured by Sreevari" : "Sourced through partners";
    $("h3", card).textContent = p[0];
    $("p", card).textContent = p[3];
    const b = $(".enq", card);
    b.textContent = "Enquire about " + p[0].toLowerCase();
    b.dataset.cat = p[0];
    b.dataset.route = p[2] ? "Manufacturing" : "Sourcing";
    card.classList.remove("swap");
    void card.offsetWidth;
    card.classList.add("swap");
  }
  showItems.forEach((li) => {
    const i = +li.dataset.i,
      btn = li.firstElementChild;
    btn.addEventListener("click", () => showProduct(i, !wide.matches));
    li.addEventListener("mouseenter", () => wide.matches && showProduct(i));
    btn.addEventListener("focus", () => wide.matches && showProduct(i));
  });
  if (showItems.length) showProduct(0);

  /* ---------- Scroll-linked pieces: Manufacturing stages and the About thread ---------- */
  const lineItems = $$(".linelist li"),
    linePics = $$(".linepic > div");
  let lineActive = -1;
  function onScroll() {
    $$("[data-track]").forEach((el) => {
      if (!el.offsetParent) return; // page not showing
      const r = el.getBoundingClientRect();
      el.style.setProperty("--p", clamp((innerHeight * 0.55 - r.top) / r.height));
    });
    $$(".knot").forEach(
      (k) => k.offsetParent && k.classList.toggle("lit", k.getBoundingClientRect().top < innerHeight * 0.58),
    );
    if (lineItems.length && lineItems[0].offsetParent) {
      const mid = innerHeight * 0.5;
      let best = 0,
        dist = 1e9;
      lineItems.forEach((li, i) => {
        const r = li.getBoundingClientRect(),
          d = Math.abs(r.top + r.height / 2 - mid);
        if (d < dist) ((dist = d), (best = i));
      });
      if (best !== lineActive) {
        lineActive = best;
        lineItems.forEach((li, i) => li.classList.toggle("on", i === best));
        linePics.forEach((p, i) => p.classList.toggle("on", i === best));
        $(".linecap").textContent = `${String(best + 1).padStart(2, "0")} · ${SV.stages[best][0]}`;
      }
    }
  }
  let ticking = false;
  const queue = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => ((ticking = false), onScroll()));
  };
  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue);
  SV.innerRefresh = () => ((lineActive = -1), onScroll());
  onScroll();
})();
