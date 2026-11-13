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

  /* ---------- About: a line that draws itself down the company's story ---------- */
  P.about =
    header(
      "About · Est. 1993",
      ["Three decades", "of understanding", "the garment."],
      img(21, "Exterior of the Sreevari facility in Irugur, Coimbatore", "ls"),
    ) +
    `<section class="split rv"><div><p class="fade lead">Sreevari Apparels Private Limited was established in 1993 in Coimbatore, Tamil Nadu. We specialise in woven garments made in our own facility in Irugur, and we source knitwear, home textiles and fabrics through a manufacturing partner network across India.</p><p class="fade" style="margin-top:22px;--i:1">Development begins with whatever a buyer has: a sketch, tech pack, reference or sample. We build to approved samples and buyer specifications.</p></div>${img(37, "Finished shirts in white, light blue and navy on a rail, with folded stacks on a table")}</section>` +
    `<section class="dark story"><div class="rv">${lines(["The business,", "plainly."], "h2")}</div><div class="thread" data-track><i class="rail" aria-hidden="true"><b></b></i>${SV.aboutTimeline
      .map(
        (x) =>
          `<div class="knot rv"><span class="dot" aria-hidden="true"></span><span class="mono fade">${x[0]}</span><h3 class="serif fade">${x[1]}</h3><p class="fade" style="--i:1">${x[2]}</p></div>`,
      )
      .join("")}</div></section>`;

  /* ---------- Manufacturing: the photo stays put while the seven stages scroll past it ---------- */
  P.manufacturing =
    header(
      "Manufacturing · Coimbatore",
      ["Where fabric", "becomes form."],
      img(36, "Cutting tables in the foreground with sewing lines beyond", "ls"),
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

  /* ---------- Products: a shirt you can recolour, then the categories ---------- */
  P.products =
    header(
      "Products",
      ["Made to", "your specification."],
      `<div class="config fade" id="config" style="--i:2"></div>`,
    ) +
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
    header(
      "Sourcing",
      ["India. A network", "of possibility."],
      img(27, "Fabric rolls in white, grey, light blue and navy stacked on shelves", "ls"),
    ) +
    `<section class="split rv"><div><p class="fade lead">Sreevari sources knitwear, home textiles and fabrics through suitable manufacturing partners across India. We coordinate; our partners manufacture.</p><p class="fade" style="margin-top:22px">Woven garments remain a direct-manufacturing line, made in our own Coimbatore facility. Sourcing is a separate service, run through one point of contact.</p></div>${img(28, "Two people reviewing fabric swatches and a sample shirt at a table", "ls")}</section>` +
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
          `<div class="fade" style="--i:${i}">${img(m[0], "Illustrative photograph: " + m[1])}<span class="mono kicker">${pad(i + 1)}</span><h3 class="serif">${m[1]}</h3><p>${m[2]}</p></div>`,
      )
      .join("")}</div></section>`;

  P.contact = header(
    "Contact",
    ["Let’s make", "something", "real."],
    img(38, "A light blue shirt laid flat with a tape measure, pattern paper and navy thread", "ls"),
    "Tell us what you’re looking to manufacture or source.",
  );

  for (const k in P) document.getElementById("page-" + k).innerHTML = P[k];
})();
