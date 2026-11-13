/*
 * Builds dist/sreevari-preview.html: the whole site in one self-contained file
 * that opens by double-click, with no server. Useful for sharing a quick preview.
 * The enquiry form in this file hands off to WhatsApp, since there is no server behind it.
 */
const fs = require("fs");
const path = require("path");
const PUBLIC = path.join(__dirname, "..", "public");
const read = (p) => fs.readFileSync(path.join(PUBLIC, p), "utf8");
const dataUri = (p, mime) => `data:${mime};base64,${fs.readFileSync(path.join(PUBLIC, p)).toString("base64")}`;

let css = read("css/site.css")
  .replace(/url\(\/images\/([^)]+\.webp)\)/g, (m, f) => `url(${dataUri("images/" + f, "image/webp")})`)
  .replace(/url\(\/fonts\/([^)]+\.woff2)\)/g, (m, f) => `url(${dataUri("fonts/" + f, "font/woff2")})`);

const js = ["js/vendor/lenis.min.js", "js/content.js", "js/pages.js", "js/garment.js", "js/enquiry.js", "js/inner.js", "js/site.js"]
  .map((f) => read(f).replace(/<\/script/g, "<\\/script"))
  .join("\n;\n");

const html = read("index.html")
  .replace(/<link rel="(icon|preload)"[^>]*>\n/g, "")
  .replace(/<meta (property="og:image"|name="twitter:card")[^>]*>\n/g, "")
  .replace(/src="\/images\/([^"]+\.png)"/g, (m, f) => `src="${dataUri("images/" + f, "image/png")}"`)
  .replace('<link rel="stylesheet" href="/css/site.css">', () => `<style>\n${css}\n</style>`)
  .replace(/<script src="[^"]+" defer><\/script>\n/g, "")
  .replace("</body>", () => `<script>window.SV_ROUTER="hash";\n${js}\n</script>\n</body>`);

const out = path.join(__dirname, "..", "dist");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "sreevari-preview.html"), html);
console.log(`dist/sreevari-preview.html written (${(html.length / 1048576).toFixed(1)} MB)`);
