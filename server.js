/*
 * Sreevari Apparels website server.
 * Serves the static site from /public, gives each page a clean URL,
 * and receives enquiries (with file uploads) at POST /api/enquiry.
 */
require("dotenv").config();
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const compression = require("compression");
const multer = require("multer");
const nodemailer = require("nodemailer");

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, "public");
const DATA = path.join(__dirname, "data");
const UPLOADS = path.join(DATA, "uploads");
fs.mkdirSync(UPLOADS, { recursive: true });

const PAGES = require("./pages-meta");

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(compression());
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  next();
});

/* ---------- Pages ---------- */
const indexHtml = () => fs.readFileSync(path.join(PUBLIC, "index.html"), "utf8");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

// Link previews (WhatsApp, LinkedIn) need the share image as a full address
const withShareImage = (html, req) =>
  html.replaceAll('content="/images/share-card.jpg"', `content="${process.env.SITE_URL || `${req.protocol}://${req.get("host")}`}/images/share-card.jpg"`);

app.get("/", (req, res) => res.set("Cache-Control", "no-cache").type("html").send(withShareImage(indexHtml(), req)));

for (const [slug, [title, description]] of Object.entries(PAGES)) {
  app.get("/" + slug, (req, res) => {
    const html = withShareImage(indexHtml(), req)
      .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*"/, `$1${esc(description)}"`);
    res.set("Cache-Control", "no-cache").type("html").send(html);
  });
}

app.get("/capabilities", (req, res) => res.redirect(301, "/manufacturing")); // merged into Manufacturing

app.get("/sitemap.xml", (req, res) => {
  const base = process.env.SITE_URL || `${req.protocol}://${req.get("host")}`;
  const urls = ["", ...Object.keys(PAGES)].map((p) => `<url><loc>${base}/${p}</loc></url>`).join("");
  res.type("xml").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
});

app.use(
  express.static(PUBLIC, {
    setHeaders(res, file) {
      const longLived = /\.(webp|woff2|png|jpg)$/.test(file);
      // Images and fonts are cached for a month; pages, CSS and JS are re-checked on every visit
      res.setHeader("Cache-Control", longLived ? "public, max-age=2592000" : "no-cache");
    },
  }),
);

/* ---------- Enquiries ---------- */
const ALLOWED = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic", "image/gif"];
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS,
    filename: (req, file, cb) =>
      cb(null, `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, "")}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) =>
    ALLOWED.includes(file.mimetype) ? cb(null, true) : cb(Object.assign(new Error("Only PDF and image files can be attached."), { status: 400 })),
});

// Simple per-IP limit: 5 enquiries every 10 minutes
const hits = new Map();
function rateLimit(req, res, next) {
  const now = Date.now();
  const recent = (hits.get(req.ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (recent.length >= 5) return res.status(429).json({ ok: false, error: "Too many enquiries. Try again in a few minutes, or use WhatsApp." });
  hits.set(req.ip, [...recent, now]);
  next();
}

const FIELDS = ["Name", "Company", "Email", "Phone", "Country", "Category", "Route", "Quantity", "Market", "Description"];
const mailer = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

const removeFiles = (files) => (files || []).forEach((f) => fs.unlink(f.path, () => {}));

app.post("/api/enquiry", rateLimit, upload.array("files", 5), async (req, res) => {
  const body = req.body || {};
  // Honeypot: real visitors never fill this hidden field
  if (body.website) {
    removeFiles(req.files);
    return res.json({ ok: true });
  }

  const enquiry = {};
  for (const f of FIELDS) enquiry[f] = String(body[f] || "").trim().slice(0, f === "Description" ? 5000 : 200);

  if (!enquiry.Name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(enquiry.Email)) {
    removeFiles(req.files);
    return res.status(400).json({ ok: false, error: "Enter your name and a valid email address." });
  }

  const record = {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    ...enquiry,
    files: (req.files || []).map((f) => ({ name: f.originalname, saved: f.filename, size: f.size })),
  };
  fs.appendFileSync(path.join(DATA, "enquiries.jsonl"), JSON.stringify(record) + "\n");

  if (mailer && process.env.ENQUIRY_TO) {
    try {
      await mailer.sendMail({
        from: process.env.ENQUIRY_FROM || process.env.SMTP_USER,
        to: process.env.ENQUIRY_TO,
        replyTo: enquiry.Email,
        subject: `New enquiry: ${enquiry.Category} (${enquiry.Route}) from ${enquiry.Name}`,
        text: FIELDS.map((f) => `${f}: ${enquiry[f] || "-"}`).join("\n"),
        attachments: (req.files || []).map((f) => ({ filename: f.originalname, path: f.path })),
      });
    } catch (err) {
      // The enquiry is already saved to data/enquiries.jsonl, so it is not lost.
      console.error("Email failed:", err.message);
    }
  }

  res.json({ ok: true });
});

/* ---------- Errors ---------- */
app.use((req, res) => res.status(404).type("html").send(indexHtml().replace(/<title>.*?<\/title>/, "<title>Page not found — Sreevari Apparels</title>")));
app.use((err, req, res, next) => {
  removeFiles(req.files);
  if (err instanceof multer.MulterError) {
    const error = err.code === "LIMIT_FILE_SIZE" ? "Each file must be 10 MB or smaller." : "Attach up to 5 files.";
    return res.status(413).json({ ok: false, error });
  }
  if (err.status === 400) return res.status(400).json({ ok: false, error: err.message });
  console.error(err);
  res.status(500).json({ ok: false, error: "Something went wrong on our side." });
});

app.listen(PORT, () => {
  console.log(`Sreevari site running at http://localhost:${PORT}`);
  if (!mailer) console.log("Email is not configured: enquiries are saved to data/enquiries.jsonl only (see .env.example).");
});
