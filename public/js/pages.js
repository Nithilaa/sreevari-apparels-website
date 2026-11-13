/* Builds the six inner pages from content.js into their <main> containers. */
(() => {
  const SV = window.SV;
  const pad = (n) => String(n).padStart(2, "0");

  // Headline split into lines so each line can slide up on reveal
  const lines = (arr, tag = "h1") =>
    `<${tag} class="serif">${arr
      .map((x, i) => `<span class="l" style="--i:${i}"><span>${x}</span></span>`)
      .join("")}</${tag}>`;

  // Image with a mask-wipe reveal and a slight parallax drift
  const img = (n, alt, cls = "") =>
    `<div class="im ${cls}" role="img" aria-label="${alt}"><div style="background-image:var(--im${n})"></div></div>`;

  const header = (kicker, headline) =>
    `<section class="rv pghead"><span class="mono fade kicker">${kicker}</span>${lines(headline)}</section>`;

  const row = (i, n, title, text, extra = "") => {
    const alt = "Illustrative photograph: " + title;
    const media = Array.isArray(n) ? `<div class="pair">${n.map((k) => img(k, alt)).join("")}</div>` : img(n, alt);
    return `<div class="row rv">${media}<div><span class="mono fade kicker">${pad(i + 1)}</span><h3 class="serif fade">${title}</h3><p class="fade" style="--i:1">${text}</p>${extra}</div></div>`;
  };

  const timeline = (items) =>
    `<div class="tl">${items
      .map(
        (x) =>
          `<div class="fade"><span class="mono">${x[0]}</span><div><h3 class="serif">${x[1]}</h3><p>${x[2]}</p></div></div>`,
      )
      .join("")}</div>`;

  const compliance = () =>
    `<section class="dark comp rv"><span class="mono fade kicker">Compliance</span>${lines(SV.compliance.headline, "h2")}<p class="fade lead" style="--i:2">${SV.compliance.text}</p><div class="pillars">${SV.compliance.pillars
      .map(
        (x, i) =>
          `<div class="fade" style="--i:${i + 3}"><b class="serif">${["I", "II", "III", "IV"][i]}</b><i aria-hidden="true"></i><span class="mono">${x}</span></div>`,
      )
      .join("")}</div><p class="mono fade pnote" style="--i:7">The four pillars of a SMETA audit</p></section>`;

  const P = {};

  P.about =
    header("About · Est. 1993", ["Three decades", "of understanding", "the garment."]) +
    `<section class="split rv"><div><p class="fade lead">Sreevari Apparels Private Limited was established in 1993 in Coimbatore, Tamil Nadu. We specialise in woven garments made in our own facility in Irugur, and we source knitwear, home textiles and fabrics through a manufacturing partner network across India.</p><p class="fade" style="margin-top:22px;--i:1">Development begins with whatever a buyer has: a sketch, tech pack, reference or sample. We build to approved samples and buyer specifications.</p></div>${img(21, "Exterior of the Sreevari facility in Irugur, Coimbatore", "ls")}</section>` +
    `<section class="dark rv">${lines(["The business,", "plainly."], "h2")}${timeline(SV.aboutTimeline)}</section>` +
    `<section class="rv">${img(34, "Soft folds of woven fabric in sand, olive and charcoal tones", "wd2")}</section>`;

  P.manufacturing =
    header("Manufacturing · Coimbatore", ["Where fabric", "becomes form."]) +
    `<section class="rv"><div class="stats fade"><div><b class="serif">120+</b><span class="mono">Sewing machines</span></div><div><b class="serif">1,500–2,000</b><span class="mono">Pieces per day, approximately</span></div></div></section>` +
    compliance() +
    `<section>${SV.manufacturing.map((m, i) => row(i, m[0], m[1], m[2])).join("")}</section>`;

  P.products =
    header("Products", ["Made to", "your specification."]) +
    `<section>${SV.products
      .map((p, i) =>
        row(
          i,
          p[1],
          p[0],
          p[3],
          `<span class="mono tag ${p[2] ? "" : "s"}">${p[2] ? "Manufactured by Sreevari" : "Sourced through partners"}</span>` +
            `<button class="btn mono enq" data-cat="${p[0]}" data-route="${p[2] ? "Manufacturing" : "Sourcing"}">Enquire about this category</button>`,
        ),
      )
      .join("")}</section>`;

  // Abstract diagram only. Node positions are decorative, not partner locations.
  const nodes = [
    [110, 70],
    [190, 330],
    [490, 60],
    [540, 300],
    [320, 40],
    [80, 200],
    [580, 180],
    [420, 370],
    [250, 120],
  ];
  P.sourcing =
    header("Sourcing", ["India. A network", "of possibility."]) +
    `<section class="split rv"><div><p class="fade lead">Sreevari sources knitwear, home textiles and fabrics through suitable manufacturing partners across India. We coordinate; our partners manufacture.</p><p class="fade" style="margin-top:22px">Woven garments remain a direct-manufacturing line, made in our own Coimbatore facility. Sourcing is a separate service, run through one point of contact.</p></div>${img(28, "Two people reviewing fabric swatches and a sample shirt at a table", "ls")}</section>` +
    `<section class="rv">${img(27, "Fabric rolls and folded knit fabrics stacked on shelves in soft window light", "wd")}</section>` +
    `<section class="dark netsec rv"><svg class="net" viewBox="0 0 620 400" role="img" aria-label="Abstract network diagram: a central Sreevari node linked to unlabelled partner nodes">${nodes
      .map((n) => `<line x1="310" y1="200" x2="${n[0]}" y2="${n[1]}"/><circle cx="${n[0]}" cy="${n[1]}" r="6"/>`)
      .join(
        "",
      )}<circle cx="310" cy="200" r="14" class="hub"/><text x="310" y="232" text-anchor="middle">SREEVARI</text></svg><p class="mono netnote">Illustrative only. Partner locations are not shown.</p></section>` +
    `<section>${SV.sourcingLines.map((m, i) => row(i, m[0], m[1], m[2])).join("")}</section>` +
    `<section class="light rv">${lines(["How sourcing", "works."], "h2")}${timeline(SV.sourcingSteps)}</section>`;

  P.capabilities =
    header("Capabilities · Dossier", ["Everything a", "garment needs."]) +
    `<section class="rv"><div class="caps">${SV.capabilities
      .map(
        (c, i) =>
          `<div class="fade"><span class="mono kicker">CAP-${pad(i + 1)}</span><h3 class="serif">${c}</h3></div>`,
      )
      .join("")}</div></section>` +
    compliance() +
    `<section class="rv"><div class="duo">${img(30, "A pallet of sealed cartons with generic markings, ready for dispatch", "ls")}${img(29, "Garments laid out on a table being checked by hand")}</div></section>`;

  P.contact =
    header("Contact", ["Let’s make", "something", "real."]) +
    `<section class="rv"><p class="fade lead" style="max-width:34ch">Tell us what you’re looking to manufacture or source.</p>${SV.email ? `<p class="fade" style="margin-top:18px"><a href="mailto:${SV.email}">${SV.email}</a></p>` : ""}</section>`;

  for (const k in P) document.getElementById("page-" + k).innerHTML = P[k];
})();
