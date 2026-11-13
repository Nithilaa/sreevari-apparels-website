/*
 * "From a reference to a real garment": a shirt that is sketched, laid out as pattern pieces,
 * sewn together, checked and then multiplied, driven by scroll position.
 *
 * Every piece is drawn once, in its place on the finished shirt. The pattern layout is the same
 * pieces moved apart, so assembling is just each piece travelling home.
 * site.js calls SV.garment.update(p) with p from 0 (top of the section) to 1 (bottom).
 */
(() => {
  const host = document.getElementById("garment");
  if (!host) return;

  const mirror = (d) =>
    // Reflect a path left-to-right across the shirt's centre line (x = 300). Paths use absolute M/L/Q only.
    d.replace(
      /([MLQ])([^MLQZ]+)/g,
      (m, cmd, nums) =>
        cmd +
        nums
          .trim()
          .split(/[ ,]+/)
          .map((n, i) => (i % 2 ? n : 600 - n))
          .join(" "),
    );

  // Shapes in finished-shirt coordinates
  const FRONT_L = "M252 92 L168 128 Q188 190 182 250 L188 585 Q245 604 296 600 L296 150 Q268 128 252 92 Z";
  const SLEEVE_L = "M168 128 Q188 190 182 250 L140 486 L92 470 Q112 280 168 128 Z";
  const CUFF_L = "M92 470 L140 486 L134 519 L86 503 Z";
  const COLLAR_L = "M250 88 L300 146 L266 172 L238 112 Z";
  const BACK =
    "M252 92 Q300 104 348 92 L432 128 Q412 190 418 250 L412 585 Q300 612 188 585 L182 250 Q188 190 168 128 Z";
  const STAND = "M250 88 Q300 70 350 88 L338 106 Q300 94 262 106 Z";
  const POCKET = "M330 236 L388 236 L388 294 L359 310 L330 294 Z";
  const PLACKET = "M291 149 L309 149 L309 601 L291 601 Z";

  // [id, path, label, away-from-home offset x, y, rotation when laid out, grainline?]
  const PIECES = [
    ["back", BACK, "Back", 132, 0, 0, true],
    ["sleeveL", SLEEVE_L, "Sleeve", -222, 6, 12, true],
    ["sleeveR", mirror(SLEEVE_L), "Sleeve", 177, 6, -12, true],
    ["cuffL", CUFF_L, "Cuff", -196, 92, -18, false],
    ["cuffR", mirror(CUFF_L), "Cuff", 151, 92, 18, false],
    ["frontL", FRONT_L, "Front", -178, 0, 0, true],
    ["frontR", mirror(FRONT_L), "Front", -159, 0, 0, true],
    ["placket", PLACKET, "", -159, 0, 0, false],
    ["stand", STAND, "Collar stand", -70, -42, 0, false],
    ["collarL", COLLAR_L, "Collar", -215, -88, 32, false],
    ["collarR", mirror(COLLAR_L), "Collar", -195, -88, -32, false],
    ["pocket", POCKET, "Pocket", 80, -232, 0, false],
  ];

  // Seams, in the order they are sewn
  const SEAMS = [
    "M252 92 L168 128",
    mirror("M252 92 L168 128"),
    "M168 128 Q188 190 182 250",
    mirror("M168 128 Q188 190 182 250"),
    "M182 250 L188 585",
    mirror("M182 250 L188 585"),
    "M190 576 Q245 595 296 591",
    mirror("M190 576 Q245 595 296 591"),
    "M291 152 L291 598",
    "M309 152 L309 598",
    "M94 476 L138 491",
    mirror("M94 476 L138 491"),
    "M243 112 L267 165 L296 147",
    mirror("M243 112 L267 165 L296 147"),
    "M335 241 L383 241 L383 291 L359 304 L335 291 Z",
  ];
  const BUTTONS = [178, 240, 302, 364, 426, 488, 550];

  const centre = (d) => {
    const n = d.match(/-?\d+(\.\d+)?/g).map(Number);
    let x0 = 1e9,
      x1 = -1e9,
      y0 = 1e9,
      y1 = -1e9;
    for (let i = 0; i < n.length; i += 2) {
      x0 = Math.min(x0, n[i]);
      x1 = Math.max(x1, n[i]);
      y0 = Math.min(y0, n[i + 1]);
      y1 = Math.max(y1, n[i + 1]);
    }
    return [(x0 + x1) / 2, (y0 + y1) / 2, y1 - y0];
  };

  const pieceMarkup = PIECES.map(([id, d, label, , , , grain]) => {
    const [cx, cy, h] = centre(d);
    const g = grain
      ? `<path class="grain" d="M${cx} ${cy - h * 0.28} L${cx} ${cy + h * 0.28} M${cx - 5} ${cy - h * 0.28 + 9} L${cx} ${cy - h * 0.28} L${cx + 5} ${cy - h * 0.28 + 9}"/>`
      : "";
    const t = label
      ? `<text class="plabel" x="${cx}" y="${cy + (grain ? h * 0.36 : 4)}" text-anchor="middle">${label.toUpperCase()}</text>`
      : "";
    return `<g class="piece" data-id="${id}"><path class="cloth ${id === "back" || id === "stand" ? "under" : ""}" d="${d}"/>${g}${t}</g>`;
  }).join("");

  host.innerHTML = `
<svg viewBox="0 0 600 640" role="img" aria-label="A shirt shown as a sketch, then as flat pattern pieces, then sewn together, measured and produced in quantity">
  <defs>
    <mask id="sewn" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="640">${SEAMS.map((d) => `<path class="sewmask" pathLength="1" d="${d}"/>`).join("")}</mask>
    <g id="shirtBody">
      ${pieceMarkup}
      <g class="stitches" mask="url(#sewn)">${SEAMS.map((d) => `<path d="${d}"/>`).join("")}</g>
      <g class="buttons">${BUTTONS.map((y) => `<circle cx="300" cy="${y}" r="4.6"/>`).join("")}</g>
    </g>
  </defs>

  <g class="run">
    <use class="copy" href="#shirtBody" data-dx="-236" style="--fab:#1b2c6b;--fab2:#14224f;--edge:#0a1233"/>
    <use class="copy" href="#shirtBody" data-dx="236" style="--fab:#c9ccd4;--fab2:#b3b7c1"/>
    <use class="copy" href="#shirtBody" data-dx="-118" style="--fab:#f4f5f7;--fab2:#dfe2e9"/>
    <use class="copy" href="#shirtBody" data-dx="118" style="--fab:#f4f5f7;--fab2:#dfe2e9"/>
    <g class="main">
      <g class="sketch">${[
        BACK,
        SLEEVE_L,
        mirror(SLEEVE_L),
        CUFF_L,
        mirror(CUFF_L),
        FRONT_L,
        mirror(FRONT_L),
        COLLAR_L,
        mirror(COLLAR_L),
        POCKET,
      ]
        .map((d) => `<path pathLength="1" d="${d}"/>`)
        .join(
          "",
        )}<path class="guide" pathLength="1" d="M300 60 L300 628"/><path class="guide" pathLength="1" d="M150 338 L450 338"/></g>
      <use href="#shirtBody"/>
      <g class="checks">
        <path d="M184 338 L416 338 M184 330 L184 346 M416 330 L416 346"/><text x="356" y="330" text-anchor="middle">CHEST</text>
        <path d="M224 132 L224 588 M216 132 L232 132 M216 588 L232 588"/><text x="214" y="372" text-anchor="middle" transform="rotate(-90 214 372)">LENGTH</text>
        <path d="M444 150 L500 462 M436 152 L452 148 M492 464 L508 460"/><text x="484" y="300" text-anchor="middle" transform="rotate(80 484 300)">SLEEVE</text>
        <g class="stamp" transform="rotate(-11 372 508)"><rect x="318" y="486" width="108" height="44" rx="4"/><text x="372" y="514" text-anchor="middle">APPROVED</text></g>
      </g>
    </g>
  </g>
</svg>`;

  const svg = host.firstElementChild;
  const pieces = PIECES.map((p) => ({
    el: svg.querySelector(`#shirtBody [data-id="${p[0]}"]`),
    c: centre(p[1]),
    dx: p[3],
    dy: p[4],
    rot: p[5],
  }));
  const q = (s) => svg.querySelector(s),
    qa = (s) => [...svg.querySelectorAll(s)];
  const sketch = q(".sketch"),
    sketchLines = qa(".sketch path"),
    sewMasks = qa(".sewmask"),
    buttons = q("#shirtBody .buttons");
  const checks = q(".checks"),
    main = q(".main"),
    copies = qa(".copy"),
    body = q("#shirtBody");

  const clamp = (v) => Math.max(0, Math.min(1, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = (t) => t * t * (3 - 2 * t);

  function update(p) {
    const drawn = seg(p, 0.02, 0.17);
    const sketchOn = 1 - seg(p, 0.2, 0.27);
    const laidOut = ease(seg(p, 0.2, 0.3));
    const coloured = seg(p, 0.4, 0.47);
    const home = ease(seg(p, 0.42, 0.58)); // 0 = pattern layout, 1 = assembled
    const sewn = seg(p, 0.5, 0.62);
    const checked = seg(p, 0.63, 0.72) * (1 - seg(p, 0.8, 0.84));
    const many = ease(seg(p, 0.82, 0.96));

    sketch.style.opacity = sketchOn;
    sketchLines.forEach((l, i) => (l.style.strokeDashoffset = 1 - clamp(drawn * 1.6 - i * 0.05)));

    body.style.setProperty("--show", laidOut);
    body.style.setProperty("--fill", coloured);
    body.style.setProperty("--label", laidOut * (1 - seg(p, 0.4, 0.46)));
    pieces.forEach((pc) => {
      const k = 1 - home;
      pc.el.setAttribute(
        "transform",
        `translate(${pc.dx * k} ${pc.dy * k}) rotate(${pc.rot * k} ${pc.c[0]} ${pc.c[1]})`,
      );
    });
    sewMasks.forEach((m, i) => (m.style.strokeDashoffset = 1 - clamp(sewn * 1.5 - (i / sewMasks.length) * 0.5)));
    buttons.style.opacity = seg(p, 0.56, 0.62);
    checks.style.opacity = checked;
    checks.style.setProperty("--stamp", seg(p, 0.7, 0.75));

    // The layout is wider than the finished shirt, so the view pulls back for it, and again for the row of shirts
    const scale = (0.69 + 0.29 * home) * (1 - 0.34 * many);
    const cx = 277 + (300 - 277) * home,
      cy = 300 + (346 - 300) * home;
    q(".run").setAttribute("transform", `translate(300 320) scale(${scale}) translate(${-cx} ${-cy})`);
    copies.forEach((c, i) => {
      const t = ease(clamp(many * 1.4 - (i < 2 ? 0.25 : 0)));
      c.setAttribute("transform", `translate(${c.dataset.dx * t} ${Math.abs(c.dataset.dx) * 0.03 * t})`);
      c.style.opacity = t;
    });
    main.style.opacity = 1;
  }

  window.SV.garment = { update };

  // A finished shirt on its own, for the fabric and colour picker on the Products page.
  // Colours come from the --fab / --fab2 / --stripe variables on the <svg>; data-pattern picks the weave.
  window.SV.shirtMarkup = () => {
    const part = (id) => PIECES.find((x) => x[0] === id)[1];
    const cloth = (d, cls = "") => `<path class="c ${cls}" d="${d}"/>`;
    const seam = (d) => `<path class="cs" d="${d}"/>`;
    // Variants drawn for the picker only
    const SHORT_L = "M168 128 Q188 190 182 250 L176 298 L118 274 Q138 196 168 128 Z";
    const SHORT_HEM = "M124 266 L176 288";
    const BAND_L = "M246 90 L260 86 Q272 122 300 144 L300 160 Q262 138 246 90 Z";
    return `<svg class="cshirt" viewBox="70 56 460 572" role="img" aria-label="Illustration of a shirt with the chosen fabric, colour, collar and sleeve">
  <defs>
    <pattern id="wStripe" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" class="pf"/><rect x="6" width="3" height="16" class="ps"/></pattern>
    <pattern id="wCheck" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" class="pf"/><rect x="8" width="5" height="22" class="ps"/><rect y="8" width="22" height="5" class="ps"/></pattern>
  </defs>
  ${cloth(part("back"), "under")}${cloth(part("stand"), "under")}
  <g class="v-long">${cloth(part("sleeveL"))}${cloth(part("sleeveR"))}${cloth(part("cuffL"))}${cloth(part("cuffR"))}</g>
  <g class="v-short">${cloth(SHORT_L)}${cloth(mirror(SHORT_L))}</g>
  ${cloth(part("frontL"))}${cloth(part("frontR"))}${cloth(part("placket"))}
  <g class="v-leaf">${cloth(part("collarL"))}${cloth(part("collarR"))}</g>
  <g class="v-band">${cloth(BAND_L)}${cloth(mirror(BAND_L))}</g>
  <g class="cpocket">${cloth(part("pocket"))}${seam(SEAMS[14])}</g>
  <g class="cstitch">${SEAMS.slice(0, 10).map(seam).join("")}</g>
  <g class="v-long">${seam(SEAMS[10])}${seam(SEAMS[11])}</g>
  <g class="v-short">${seam(SHORT_HEM)}${seam(mirror(SHORT_HEM))}</g>
  <g class="v-leaf">${seam(SEAMS[12])}${seam(SEAMS[13])}</g>
  <g class="cbuttons">${BUTTONS.map((y) => `<circle cx="300" cy="${y}" r="4.6"/>`).join("")}<g class="v-bd"><circle cx="268" cy="163" r="3.4"/><circle cx="332" cy="163" r="3.4"/></g></g>
</svg>`;
  };

  update(0);
})();
