/*
 * Builds dist/static/: a server-less copy of the site for static hosts such as GitHub Pages.
 *
 * When the public address is known (SITE_URL, or GitHub Actions), every page gets its own
 * folder and real address (/about/, /products/ ...), its own title and description, and a
 * sitemap. Without an address (a plain local build) pages fall back to "#page-about" links,
 * which work from any folder.
 *
 * The enquiry form hands off to WhatsApp, because a static host cannot receive uploads.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const PAGES = require("../pages-meta");
const PUBLIC = path.join(__dirname, "..", "public");
const OUT = path.join(__dirname, "..", "dist", "static");

// Public address of the site, ending in "/". Set SITE_URL for a custom domain;
// on GitHub Actions it is worked out from the repository name.
const [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
const SITE = process.env.SITE_URL ? process.env.SITE_URL.replace(/\/?$/, "/") : owner ? `https://${owner.toLowerCase()}.github.io/${repo}/` : "";
const BASE = SITE ? new URL(SITE).pathname : "";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(PUBLIC, OUT, { recursive: true });

// The stylesheet moves next to index.html. Image paths held in CSS variables are resolved
// where they are used (stylesheet or inline style), so both must share the same base folder.
const css = fs.readFileSync(path.join(OUT, "css", "site.css"), "utf8").replace(/url\(\/(images|fonts)\//g, "url($1/");
fs.rmSync(path.join(OUT, "css"), { recursive: true });
fs.writeFileSync(path.join(OUT, "site.css"), css);

// A version in the stylesheet and script addresses makes browsers fetch new copies after each update
const hash = crypto.createHash("sha1").update(css);
for (const f of ["content.js", "pages.js", "garment.js", "enquiry.js", "inner.js", "site.js"]) hash.update(fs.readFileSync(path.join(OUT, "js", f)));
const v = hash.digest("hex").slice(0, 10);

const pageLink = (slug) => (SITE ? `${slug}/` : `#page-${slug}`);
const template = fs
  .readFileSync(path.join(OUT, "index.html"), "utf8")
  // Link previews (WhatsApp, LinkedIn, iMessage) need the share image as a full address
  .replaceAll('content="/images/share-card.jpg"', `content="${SITE}images/share-card.jpg"`)
  .replace('href="/css/site.css"', 'href="site.css"')
  .replace(/(href|src|content)="\/(js|images|fonts|favicon)/g, '$1="$2')
  .replace(/href="\/(about|manufacturing|products|sourcing|contact)"/g, (m, slug) => `href="${pageLink(slug)}"`)
  .replace(/href="\/"/g, SITE ? 'href="./"' : 'href="#"')
  .replace(/(href="site\.css|src="js\/[^"]+\.js)"/g, `$1?v=${v}"`)
  .replace(
    '<script src="js/vendor/lenis.min.js',
    `<script>window.SV_STATIC = true; ${SITE ? `window.SV_BASE = ${JSON.stringify(BASE)};` : 'window.SV_ROUTER = "hash";'}</script>\n<script src="js/vendor/lenis.min.js`,
  );

function page(slug) {
  const address = SITE + (slug ? slug + "/" : "");
  let html = template;
  if (SITE) {
    // <base> keeps every relative link and image working from inside a page folder
    html = html
      .replace('<meta name="viewport"', `<base href="${BASE}">\n<link rel="canonical" href="${address}">\n<meta name="viewport"`)
      .replace('<meta property="og:site_name"', `<meta property="og:url" content="${address}">\n<meta property="og:site_name"`);
  }
  if (slug) {
    const [title, description] = PAGES[slug];
    html = html
      .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*"/, `$1${esc(description)}"`)
      .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${esc(title)}"`)
      .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${esc(description)}"`);
  }
  return html;
}

fs.writeFileSync(path.join(OUT, "index.html"), page(""));
fs.writeFileSync(path.join(OUT, "404.html"), page(""));
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");

if (SITE) {
  for (const slug of Object.keys(PAGES)) {
    fs.mkdirSync(path.join(OUT, slug));
    fs.writeFileSync(path.join(OUT, slug, "index.html"), page(slug));
  }
  const urls = ["", ...Object.keys(PAGES)].map((s) => `<url><loc>${SITE}${s ? s + "/" : ""}</loc></url>`).join("");
  fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
} else {
  fs.rmSync(path.join(OUT, "robots.txt"), { force: true });
}
console.log(`dist/static written (${SITE ? "page addresses under " + SITE : "hash links, no site address set"})`);
