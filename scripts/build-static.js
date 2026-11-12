/*
 * Builds dist/static/: a server-less copy of the site for static hosts such as GitHub Pages.
 * Differences from the Node server version:
 *   - asset paths are relative, so the site works under any sub-path (e.g. /repo-name/)
 *   - pages use hash links (#page-about) because there is no server to answer /about
 *   - the enquiry form hands off to WhatsApp (no upload endpoint on a static host)
 */
const fs = require("fs");
const path = require("path");
const PUBLIC = path.join(__dirname, "..", "public");
const OUT = path.join(__dirname, "..", "dist", "static");

// Public address of the site, ending in "/". Set SITE_URL for a custom domain;
// on GitHub Actions it is worked out from the repository name.
const [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
const SITE = process.env.SITE_URL ? process.env.SITE_URL.replace(/\/?$/, "/") : owner ? `https://${owner.toLowerCase()}.github.io/${repo}/` : "";

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(PUBLIC, OUT, { recursive: true });

// The stylesheet moves next to index.html. Image paths held in CSS variables are resolved
// where they are used (stylesheet or inline style), so both must share the same base folder.
const css = fs.readFileSync(path.join(OUT, "css", "site.css"), "utf8").replace(/url\(\/(images|fonts)\//g, "url($1/");
fs.rmSync(path.join(OUT, "css"), { recursive: true });
fs.writeFileSync(path.join(OUT, "site.css"), css);

const htmlFile = path.join(OUT, "index.html");
const html = fs
  .readFileSync(htmlFile, "utf8")
  // Link previews (WhatsApp, LinkedIn, iMessage) need the share image as a full address
  .replaceAll('content="/images/share-card.jpg"', `content="${SITE}images/share-card.jpg"`)
  .replace('<meta property="og:site_name"', `${SITE ? `<meta property="og:url" content="${SITE}">\n` : ""}<meta property="og:site_name"`)
  .replace('href="/css/site.css"', 'href="site.css"')
  .replace(/(href|src|content)="\/(js|images|fonts|favicon)/g, '$1="$2')
  .replace(/href="\/(about|manufacturing|products|sourcing|capabilities|contact)"/g, 'href="#page-$1"')
  .replace(/href="\/"/g, 'href="#"')
  .replace('<script src="js/vendor/lenis.min.js" defer></script>', '<script>window.SV_ROUTER = "hash";</script>\n<script src="js/vendor/lenis.min.js" defer></script>');
// Add a version to the stylesheet and script addresses so browsers fetch new copies after each update
const version = require("crypto").createHash("sha1").update(css);
for (const f of ["content.js", "pages.js", "site.js"]) version.update(fs.readFileSync(path.join(OUT, "js", f)));
const v = version.digest("hex").slice(0, 10);
const versioned = html.replace(/(href="site\.css|src="js\/[^"]+\.js)"/g, `$1?v=${v}"`);
fs.writeFileSync(htmlFile, versioned);
fs.writeFileSync(path.join(OUT, "404.html"), versioned);
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
fs.rmSync(path.join(OUT, "robots.txt"), { force: true });
console.log("dist/static written");
