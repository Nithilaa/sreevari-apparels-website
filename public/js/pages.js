/* Builds the six inner pages from content.js into their <main> containers. inner.js adds their behaviour. */
(() => {
  const SV = window.SV;
  const pad = (n) => String(n).padStart(2, "0");

  // Headline split into lines so each line can slide up on reveal
  const lines = (arr, tag = "h1") =>
    `<${tag} class="serif">${arr.map((x, i) => `<span class="l" style="--i:${i}"><span>${x}</span></span>`).join("")}</${tag}>`;

  // Image with a mask-wipe reveal and a slight parallax drift
  const img = (n, alt, cls = "") =>
    `<div class="im ${cls}" role="img" aria-label="${alt}"><div style="background-image:var(--im${n})"></div></div>`;

  // Page opening: headline on the left, a picture (or any block) on the right
  const header = (kicker, headline, media = "", sub = "") =>
    `<section class="rv pghead ${media ? "has" : ""}"><div><span class="mono fade kicker">${kicker}</span>${lines(headline)}${sub ? `<p class="fade lead sub" style="--i:3">${sub}</p>` : ""}</div>${media}</section>`;

  // Page opening as a full-width picture with the headline set over it, aligned to the page margins
  const cover = (kicker, headline, n, alt) =>
    `<section class="rv pghead cover dark"><div class="cbg" role="img" aria-label="${alt}" style="background-image:var(--im${n})"></div><div class="ctext"><span class="mono fade kicker">${kicker}</span>${lines(headline)}</div></section>`;

  const row = (i, n, title, text, extra = "") => {
    const alt = "Illustrative photograph: " + title;
    const media = Array.isArray(n) ? `<div class="pair">${n.map((k) => img(k, alt)).join("")}</div>` : img(n, alt);
    return `<div class="row rv">${media}<div><span class="mono fade kicker">${pad(i + 1)}</span><h3 class="serif fade">${title}</h3><p class="fade" style="--i:1">${text}</p>${extra}</div></div>`;
  };

  const compliance = () =>
    `<section class="dark comp rv"><span class="mono fade kicker">Compliance</span>${lines(SV.compliance.headline, "h2")}<p class="fade lead" style="--i:2">${SV.compliance.text}</p><div class="pillars">${SV.compliance.pillars
      .map(
        (x, i) =>
          `<div class="fade" style="--i:${i + 3}"><b class="serif">${["I", "II", "III", "IV"][i]}</b><i aria-hidden="true"></i><span class="mono">${x}</span></div>`,
      )
      .join("")}</div><p class="mono fade pnote" style="--i:7">The four pillars of a SMETA audit</p></section>`;

  const P = {};

  /* ---------- About ---------- */
  // The map: true compass directions from the factory, with distance on a compressed scale so that
  // a place 3 km away and one 400 km away both fit. Distances are straight lines between coordinates.
  const rad = (d) => (d * Math.PI) / 180;
  const F = SV.factory;
  const places = SV.places.map(([name, what, lat, lon]) => {
    const dLat = rad(lat - F.lat),
      dLon = rad(lon - F.lon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(F.lat)) * Math.cos(rad(lat)) * Math.sin(dLon / 2) ** 2;
    const km = 2 * 6371 * Math.asin(Math.sqrt(h));
    const bearing = Math.atan2(
      Math.sin(dLon) * Math.cos(rad(lat)),
      Math.cos(rad(F.lat)) * Math.sin(rad(lat)) - Math.sin(rad(F.lat)) * Math.cos(rad(lat)) * Math.cos(dLon),
    );
    return {
      name,
      what,
      km: km < 10 ? Math.round(km) : Math.round(km / (km < 100 ? 1 : 5)) * (km < 100 ? 1 : 5),
      bearing,
      raw: km,
    };
  });
  const CX = 400,
    CY = 300,
    ring = (km) => 2 + 113 * Math.log10(km);
  const mapSvg = `<svg class="wmap" viewBox="0 -22 860 648" role="img" aria-label="Diagram of places around the factory in Irugur, with compass directions and straight-line distances">${[
    10, 100, 400,
  ]
    .map(
      (k) =>
        `<circle class="wring" cx="${CX}" cy="${CY}" r="${ring(k)}"/><text class="wringt" x="${CX}" y="${CY - ring(k) - 6}" text-anchor="middle">${k} km</text>`,
    )
    .join("")}${places
    .map((p, i) => {
      const r = ring(p.raw),
        x = CX + r * Math.sin(p.bearing),
        y = CY - r * Math.cos(p.bearing);
      const left = x < CX;
      return `<g class="wplace" style="--i:${i}"><line pathLength="1" x1="${CX}" y1="${CY}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6"/><text x="${(x + (left ? -13 : 13)).toFixed(1)}" y="${(y + 6).toFixed(1)}" text-anchor="${left ? "end" : "start"}">${p.name} · ${p.km} km</text></g>`;
    })
    .join(
      "",
    )}<circle class="wpulse" cx="${CX}" cy="${CY}" r="12"/><circle class="whub" cx="${CX}" cy="${CY}" r="9"/><text class="whubt" x="${CX}" y="${CY + 34}" text-anchor="middle">IRUGUR</text><text class="wnorth" x="822" y="40" text-anchor="middle">N</text><path class="wnortha" d="M822 96 L822 52 M814 64 L822 52 L830 64"/></svg>`;

  /* ---------- About: who we are, where we are, who you talk to ---------- */
  P.about =
    cover(
      "About · Est. 1993",
      ["Three decades", "of understanding", "the garment."],
      21,
      "Exterior of the Sreevari facility in Irugur, Coimbatore",
    ) +
    `<section class="intro rv"><div><p class="fade lead">Sreevari Apparels Private Limited has made woven garments in its own facility in Coimbatore, Tamil Nadu since 1993. We also source knitwear, home textiles and fabrics through manufacturing partners across India.</p><p class="fade" style="--i:1">Development begins with whatever a buyer has: a sketch, tech pack, reference or sample. We build to approved samples and buyer specifications.</p></div>${img(37, "Finished shirts in white, light blue and navy on a rail, with folded stacks on a table", "ls")}</section>` +
    `<section class="dark where rv"><div class="wtext"><span class="mono fade kicker">Irugur, Coimbatore</span>${lines(["Where we are."], "h2")}<p class="fade" style="--i:1">Our facility is in Irugur, on the eastern side of Coimbatore in Tamil Nadu.</p><ol class="wlist">${places
      .map(
        (p, i) =>
          `<li class="fade" style="--i:${i + 2}"><b>${p.name}</b><span>${p.what}</span><em>${p.km} km</em></li>`,
      )
      .join(
        "",
      )}</ol><p class="mono wnote fade" style="--i:10">Straight-line distances from the factory, rounded. Road distances are longer. On the diagram, directions are true and distance is compressed.</p></div>${mapSvg}</section>` +
    `<div id="shravan-slot"></div>`;

  /* ---------- Manufacturing: the photo stays put while the seven stages scroll past it ---------- */
  P.manufacturing =
    cover(
      "Manufacturing · Coimbatore",
      ["Where fabric", "becomes form."],
      36,
      "Cutting tables in the foreground with sewing lines beyond",
    ) +
    `<section class="line" data-track><div class="linepic" aria-hidden="true">${SV.stages
      .map((m) => `<div style="background-image:var(--im${m[3]})"></div>`)
      .join(
        "",
      )}<span class="mono linecap"></span></div><ol class="linelist"><i class="rail" aria-hidden="true"><b></b></i>${SV.stages
      .map(
        (m, i) =>
          `<li><div class="lineph" role="img" aria-label="${m[4]}" style="background-image:var(--im${m[3]})"></div><span class="mono">${pad(i + 1)} / ${pad(SV.stages.length)}</span><h3 class="serif">${m[0]}</h3><p>${m[1]}</p></li>`,
      )
      .join("")}</ol></section>` +
    compliance();

  /* ---------- Products: recolour a shirt, then browse the range ---------- */
  const group = (made) =>
    SV.products
      .map((p, i) => [p, i])
      .filter(([p]) => p[2] === made)
      .map(([p, i]) => {
        const n = Array.isArray(p[1]) ? p[1][0] : p[1];
        const tag = made ? "Manufactured by Sreevari" : "Sourced through partners";
        return `<li data-i="${i}"><button type="button" aria-expanded="false"><span class="mono">${pad(i + 1)}</span><b class="serif">${p[0]}</b></button><div class="showin"><div class="showph" role="img" aria-label="${p[0]}" style="background-image:var(--im${n})"></div><p>${p[3]}</p><button class="btn mono enq" data-cat="${p[0]}" data-route="${made ? "Manufacturing" : "Sourcing"}">Enquire about ${p[0].toLowerCase()}</button></div></li>`;
      })
      .join("");
  P.products =
    `<section class="rv pghead phead"><div><span class="mono fade kicker">Products</span>${lines(["Made to", "your specification."])}<p class="fade lead sub" style="--i:3">Change the colour, the weave and the pocket. Every garment we make starts from choices like these.</p></div><div class="config fade" id="config" style="--i:2"></div></section>` +
    `<section class="dark show rv"><div class="showlist"><h2 class="serif">${`<span class="l"><span>The range.</span></span>`}</h2><span class="mono showtag">Manufactured by Sreevari</span><ol>${group(true)}</ol><span class="mono showtag s">Sourced through partners</span><ol>${group(false)}</ol></div><div class="showstage" aria-live="polite"><span class="shownum serif" aria-hidden="true"></span>${SV.products
      .map(
        (p) => `<div class="showimg" style="background-image:var(--im${Array.isArray(p[1]) ? p[1][0] : p[1]})"></div>`,
      )
      .join(
        "",
      )}<div class="showcard"><span class="mono tag"></span><h3 class="serif"></h3><p></p><button class="btn mono enq">Enquire</button></div></div></section>`;

  /* ---------- Sourcing: a network with enquiries travelling along it ---------- */
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
    cover(
      "Sourcing",
      ["India. A network", "of possibility."],
      27,
      "Fabric rolls in white, grey, light blue and navy stacked on shelves",
    ) +
    `<section class="intro rv"><div><p class="fade lead">Sreevari sources knitwear, home textiles and fabrics through suitable manufacturing partners across India. We coordinate; our partners manufacture.</p><p class="fade" style="--i:1">Woven garments remain a direct-manufacturing line, made in our own Coimbatore facility. Sourcing is a separate service, run through one point of contact.</p></div>${img(28, "Two people reviewing fabric swatches and a sample shirt at a table", "ls")}</section>` +
    `<section class="dark netsec rv"><svg class="net" viewBox="0 0 620 400" role="img" aria-label="Abstract network diagram: a central Sreevari node linked to unlabelled partner nodes">${nodes
      .map(
        (n, i) =>
          `<line x1="310" y1="200" x2="${n[0]}" y2="${n[1]}"/><circle cx="${n[0]}" cy="${n[1]}" r="6"/><circle class="pulse" r="3.5"><animateMotion dur="${2.6 + (i % 4) * 0.5}s" begin="${i * 0.45}s" repeatCount="indefinite" path="M310 200 L${n[0]} ${n[1]}"/></circle>`,
      )
      .join(
        "",
      )}<circle cx="310" cy="200" r="14" class="hub"/><text x="310" y="232" text-anchor="middle">SREEVARI</text></svg><p class="mono netnote">Illustrative only. Partner locations are not shown.</p></section>` +
    `<section class="rv"><div class="trio">${SV.sourcingLines
      .map(
        (m, i) =>
          `<div class="fade" style="--i:${i}"><div class="tile" role="img" aria-label="Illustrative photograph: ${m[1]}" style="background-image:var(--im${m[0]})"></div><span class="mono kicker">${pad(i + 1)}</span><h3 class="serif">${m[1]}</h3><p>${m[2]}</p></div>`,
      )
      .join("")}</div></section>`;

  P.contact = `<section class="rv pghead chead"><span class="mono fade kicker">Contact</span>${lines(["Let’s make", "something real."])}<p class="fade lead sub" style="--i:3">Tell us what you’re looking to manufacture or source.</p></section>`;

  for (const k in P) document.getElementById("page-" + k).innerHTML = P[k];
  // The Meet Shravan letter is written once in index.html and lives on the About page
  document.getElementById("shravan-slot").replaceWith(document.getElementById("shravan"));
})();
