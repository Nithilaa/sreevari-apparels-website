/*
 * Guided enquiry: four short steps in place of one long form, with a ticket that fills in as you go.
 * With a server behind the site it posts to /api/enquiry (with attachments).
 * On static hosting (GitHub Pages) or the single-file preview it opens WhatsApp with every answer filled in.
 */
(() => {
  const SV = window.SV,
    host = document.getElementById("builder");
  if (!host) return;
  const NO_SERVER = window.SV_STATIC === true || window.SV_ROUTER === "hash" || location.protocol === "file:";
  const $ = (s, r = host) => r.querySelector(s),
    $$ = (s, r = host) => [...r.querySelectorAll(s)];
  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const QTY = [100, 250, 500, 1000, 2000, 3000, 5000, 7500, 10000, 15000, 20000, 30000, 50000];
  const qtyText = (i) =>
    (i === QTY.length - 1 ? "50,000 or more" : "About " + QTY[i].toLocaleString("en-IN")) + " pieces";
  const state = {
    category: "",
    other: "",
    route: "",
    qty: null,
    market: "",
    name: "",
    company: "",
    email: "",
    phone: "",
    country: "",
    description: "",
  };
  const STEPS = [
    "What would you like to make?",
    "How many, and for which market?",
    "Who should Shravan reply to?",
    "Check it and send",
  ];
  let step = 0;

  const cards = SV.products
    .map((p) => {
      const img = Array.isArray(p[1]) ? p[1][0] : p[1];
      return `<button type="button" class="bcard" data-cat="${p[0]}" data-route="${p[2] ? "Manufacturing" : "Sourcing"}" aria-pressed="false"><i style="background-image:var(--im${img})"></i><span>${p[0]}</span></button>`;
    })
    .join("");

  host.innerHTML = `
<div class="bhead"><span class="mono" id="bcount"></span><div class="bprog" aria-hidden="true"><i></i></div></div>
<h3 class="serif" id="btitle" tabindex="-1"></h3>
<div class="bbody">
  <div class="bstep" data-step="0">
    <div class="bcards">${cards}<button type="button" class="bcard other" data-cat="Other" data-route="Not sure yet" aria-pressed="false"><i><b>+</b></i><span>Something else</span></button></div>
    <label class="bfield" id="botherWrap" hidden><span class="mono">Tell us the product</span><input id="bother" autocomplete="off" placeholder="Type the product you need"></label>
  </div>
  <div class="bstep" data-step="1">
    <span class="mono blabel">Route</span>
    <div class="bseg" role="group" aria-label="Manufacturing or sourcing">${["Manufacturing", "Sourcing", "Not sure yet"].map((r) => `<button type="button" data-route="${r}" aria-pressed="false">${r}</button>`).join("")}</div>
    <span class="mono blabel">Estimated quantity</span>
    <div class="bqty"><output class="serif" id="bqtyOut">Drag to set</output><input type="range" id="bqty" min="0" max="${QTY.length - 1}" step="1" value="3" aria-label="Estimated quantity"><div class="bticks mono"><span>100</span><span>50,000+</span></div></div>
    <label class="bfield"><span class="mono">Target market</span><input data-k="market" autocomplete="off" placeholder="Country or region the garments are for"></label>
  </div>
  <div class="bstep" data-step="2">
    <div class="bgrid">
      <label class="bfield"><span class="mono">Name</span><input data-k="name" autocomplete="name" required></label>
      <label class="bfield"><span class="mono">Company</span><input data-k="company" autocomplete="organization"></label>
      <label class="bfield"><span class="mono">Email</span><input data-k="email" type="email" autocomplete="email"></label>
      <label class="bfield"><span class="mono">Phone / WhatsApp</span><input data-k="phone" type="tel" autocomplete="tel"></label>
      <label class="bfield w"><span class="mono">Country</span><input data-k="country" autocomplete="country-name"></label>
      <label class="bfield w"><span class="mono">Anything else we should know</span><textarea data-k="description" rows="2"></textarea></label>
      ${NO_SERVER ? "" : `<label class="bfield w"><span class="mono">Reference / tech pack (PDF or images, up to 5 files of 10 MB)</span><input type="file" id="bfiles" accept=".pdf,image/*" multiple></label>`}
    </div>
    <label class="hp" aria-hidden="true">Website<input id="bhp" tabindex="-1" autocomplete="off"></label>
  </div>
  <div class="bstep" data-step="3">
    <dl class="breview" id="breview"></dl>
    <p class="bnote">${NO_SERVER ? "Sending opens WhatsApp with these details written out. Press send there, and attach any tech pack or photos in the chat." : "Your enquiry and any attachments go straight to Shravan."}</p>
  </div>
  <div class="bstep bdone" data-step="4"><b class="serif">✓</b><p id="bdoneText"></p><button type="button" class="btn mono" id="bagain">Start another enquiry</button></div>
</div>
<p class="bmsg" id="bmsg" role="status" aria-live="polite"></p>
<div class="bnav"><button type="button" class="btn mono" id="bback">Back</button><button type="button" class="btn fill mono" id="bnext"></button></div>`;

  /* The ticket beside the builder (desktop) mirrors the answers so far */
  const ticket = document.getElementById("ticket");
  const routeText = () =>
    state.route === "Manufacturing"
      ? "Manufactured by Sreevari"
      : state.route === "Sourcing"
        ? "Sourced through partners"
        : state.route;
  const product = () => (state.category === "Other" ? (state.other ? "Other: " + state.other : "") : state.category);
  const rows = () => [
    ["Product", product(), 0],
    ["Route", routeText(), 1],
    ["Quantity", state.qty === null ? "" : qtyText(state.qty), 1],
    ["Market", state.market, 1],
    ["From", [state.name, state.company].filter(Boolean).join(", "), 2],
    ["Reply to", [state.email, state.phone].filter(Boolean).join(" · "), 2],
    ["Country", state.country, 2],
    ["Notes", state.description, 2],
  ];
  function paint() {
    if (ticket)
      ticket.innerHTML =
        `<span class="mono thead">Enquiry ticket</span>` +
        rows()
          .slice(0, 6)
          .map(
            ([k, v]) => `<div class="${v ? "on" : ""}"><span class="mono">${k}</span><b>${v ? esc(v) : "—"}</b></div>`,
          )
          .join("");
    $("#breview").innerHTML = rows()
      .filter(([, v]) => v)
      .map(
        ([k, v, s]) =>
          `<div><dt class="mono">${k}</dt><dd>${esc(v)}</dd><button type="button" class="mono bedit" data-go="${s}">Edit</button></div>`,
      )
      .join("");
    $$(".bcard").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.cat === state.category)));
    $$(".bseg button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.route === state.route)));
    $("#botherWrap").hidden = state.category !== "Other";
  }

  const say = (html, kind = "") => {
    $("#bmsg").innerHTML = html;
    $("#bmsg").dataset.state = kind;
  };

  function show(n, focus) {
    step = n;
    $$(".bstep").forEach((s) => s.classList.toggle("on", +s.dataset.step === n));
    const done = n === 4;
    $("#bcount").textContent = done ? "Sent" : `Step ${n + 1} of 4`;
    $(".bprog i").style.width = (done ? 100 : ((n + 1) / 4) * 100) + "%";
    $("#btitle").textContent = done ? "Thank you." : STEPS[n];
    $("#bback").hidden = n === 0 || done;
    $("#bnext").hidden = done;
    $("#bnext").textContent = n === 3 ? (NO_SERVER ? "Send enquiry on WhatsApp" : "Send enquiry") : "Next";
    say("");
    paint();
    if (focus) $("#btitle").focus({ preventScroll: true });
  }

  function valid() {
    if (step === 0 && !state.category) return (say("Choose a product to continue.", "error"), false);
    if (step === 0 && state.category === "Other" && !state.other)
      return (say("Type the product you need.", "error"), $("#bother").focus(), false);
    if (step === 2 && !state.name)
      return (say("Add your name so Shravan knows who to reply to.", "error"), $("[data-k=name]").focus(), false);
    if (step === 2 && state.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(state.email))
      return (say("Check the email address.", "error"), false);
    if (step === 2 && !NO_SERVER && !state.email) return (say("Add an email address for the reply.", "error"), false);
    return true;
  }

  function payload() {
    return {
      Name: state.name,
      Company: state.company,
      Email: state.email,
      Phone: state.phone,
      Country: state.country,
      Category: product(),
      Route: state.route,
      Quantity: state.qty === null ? "" : qtyText(state.qty),
      Market: state.market,
      Description: state.description,
    };
  }
  const LABELS = {
    Name: "Name",
    Company: "Company",
    Email: "Email",
    Phone: "Phone / WhatsApp",
    Country: "Country",
    Category: "Product",
    Route: "Manufacturing or sourcing",
    Quantity: "Estimated quantity",
    Market: "Target market",
    Description: "Notes",
  };
  function whatsappLink() {
    const data = payload();
    let text = "*New project enquiry — Sreevari Apparels*\n\n";
    for (const k in LABELS) if (data[k]) text += `*${LABELS[k]}:* ${data[k]}\n`;
    return `https://wa.me/${SV.whatsapp}?text=${encodeURIComponent(text)}`;
  }

  async function send() {
    const wa = whatsappLink();
    if (NO_SERVER) {
      window.open(wa, "_blank", "noopener");
      $("#bdoneText").innerHTML =
        `WhatsApp has opened with your enquiry written out. Press send there to deliver it. <a href="${wa}" target="_blank" rel="noopener">Open WhatsApp again →</a>`;
      return show(4, true);
    }
    const files = [...($("#bfiles")?.files || [])];
    if (files.length > 5 || files.some((f) => f.size > 10 * 1024 * 1024))
      return say("Attach up to 5 files of 10 MB or less each.", "error");
    const fd = new FormData();
    Object.entries(payload()).forEach(([k, v]) => fd.append(k, v));
    fd.append("website", $("#bhp").value);
    files.forEach((f) => fd.append("files", f));
    $("#bnext").disabled = true;
    say("Sending your enquiry…");
    try {
      const res = await fetch("/api/enquiry", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if ([400, 413, 429].includes(res.status))
        return say(esc(data.error || "Check your details and try again."), "error");
      if (!res.ok || !data.ok) throw new Error("send failed");
      $("#bdoneText").textContent = "Your enquiry has been sent. Shravan will reply by email or WhatsApp.";
      show(4, true);
    } catch {
      say(
        `Enquiry not sent. <a href="${wa}" target="_blank" rel="noopener">Send it on WhatsApp instead →</a>`,
        "error",
      );
    } finally {
      $("#bnext").disabled = false;
    }
  }

  /* Events */
  host.addEventListener("click", (e) => {
    const card = e.target.closest(".bcard"),
      seg = e.target.closest(".bseg button"),
      edit = e.target.closest(".bedit");
    if (card) {
      state.category = card.dataset.cat;
      state.route = card.dataset.route;
      paint();
      say("");
      if (state.category === "Other") $("#bother").focus();
      else setTimeout(() => step === 0 && show(1, true), 320);
    } else if (seg) {
      state.route = seg.dataset.route;
      paint();
    } else if (edit) show(+edit.dataset.go, true);
  });
  host.addEventListener("input", (e) => {
    const k = e.target.dataset.k;
    if (k) state[k] = e.target.value.trim();
    if (e.target.id === "bother") state.other = e.target.value.trim();
    if (e.target.id === "bqty") {
      state.qty = +e.target.value;
      $("#bqtyOut").textContent = qtyText(state.qty);
      $("#bqtyOut").classList.add("set");
      e.target.style.setProperty("--fillp", (state.qty / (QTY.length - 1)) * 100 + "%");
    }
    paint();
  });
  host.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type !== "range") {
      e.preventDefault();
      $("#bnext").click();
    }
  });
  $("#bnext").addEventListener("click", () => {
    if (!valid()) return;
    step === 3 ? send() : show(step + 1, true);
  });
  $("#bback").addEventListener("click", () => show(step - 1, true));
  $("#bagain").addEventListener("click", () => {
    Object.keys(state).forEach((k) => (state[k] = k === "qty" ? null : ""));
    $$("input, textarea").forEach((i) => i.type !== "range" && (i.value = ""));
    $("#bqtyOut").textContent = "Drag to set";
    $("#bqtyOut").classList.remove("set");
    show(0, true);
  });

  // Called by the "Enquire" buttons around the site: the product is already chosen, so start at step 2
  SV.enquiry = {
    select(category, route) {
      state.category = category;
      state.route = route;
      show(1);
    },
  };

  show(0);
})();
