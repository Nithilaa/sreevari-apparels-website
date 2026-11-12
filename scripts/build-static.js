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
  .replace('href="/css/site.css"', 'href="site.css"')
  .replace(/(href|src|content)="\/(js|images|fonts|favicon)/g, '$1="$2')
  .replace(/href="\/(about|manufacturing|products|sourcing|capabilities|contact)"/g, 'href="#page-$1"')
  .replace(/href="\/"/g, 'href="#"')
  .replace('<script src="js/vendor/lenis.min.js" defer></script>', '<script>window.SV_ROUTER = "hash";</script>\n<script src="js/vendor/lenis.min.js" defer></script>');
fs.writeFileSync(htmlFile, html);
fs.writeFileSync(path.join(OUT, "404.html"), html);
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
fs.rmSync(path.join(OUT, "robots.txt"), { force: true });
console.log("dist/static written");
