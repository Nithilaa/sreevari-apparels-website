# Sreevari Apparels website

A Node.js (Express) site with seven pages, scroll-driven storytelling and a working enquiry form with file uploads.

## Run it

Needs Node.js 18 or newer.

```bash
npm install
npm start          # http://localhost:3000
```

`npm run dev` restarts the server when files change.

## What is where

| Path | What it holds |
|---|---|
| `server.js` | Express server: clean page URLs, per-page titles, sitemap, enquiry endpoint |
| `public/index.html` | Page shell and the homepage markup |
| `public/js/content.js` | All editable text and data for the inner pages and the homepage sequence |
| `public/js/pages.js` | Turns `content.js` into the About, Manufacturing, Products, Sourcing, Capabilities and Contact pages |
| `public/js/garment.js` | The shirt that is sketched, laid out as pattern pieces, sewn and multiplied as you scroll |
| `public/js/enquiry.js` | The four-step enquiry builder and its WhatsApp / server sending |
| `public/js/site.js` | Routing, page transitions, scroll animations, cursor effects |
| `public/css/site.css` | All styles. Image paths are the `--imN` variables near the top |
| `public/images/` | 34 WebP images and the company logo (`logo.png`) |
| `public/fonts/` | Self-hosted Instrument Serif, Manrope and JetBrains Mono |
| `scripts/build-preview.js` | Builds a single shareable HTML file (`npm run build:preview`) |

## Two ways to host it

| | Node server (`npm start`) | GitHub Pages (static) |
|---|---|---|
| Page addresses | `/about`, `/products` | `/about/`, `/products/` (each page is its own file, with its own title, description and sitemap entry) |
| Enquiry form | Saves the enquiry and files, can email them | Opens WhatsApp with every answer filled in, ready to send. The file field is hidden; files are attached in the chat |
| How it deploys | Any Node host | Automatically on every push to `main` (`.github/workflows/pages.yml`) |

The link preview image is `public/images/share-card.jpg` (1200 × 630). With a custom domain, add `SITE_URL: https://your-domain/` under `env:` on the build step in the workflow so previews point to the right address.

The GitHub Pages copy is built by `npm run build:static` into `dist/static/`. In the repository, **Settings → Pages → Source** must be set to **GitHub Actions**.

## Enquiry form

`POST /api/enquiry` accepts the form with up to 5 attachments (PDF or images, 10 MB each).

- Every enquiry is appended to `data/enquiries.jsonl`, and files are saved in `data/uploads/`.
- To also receive enquiries by email, copy `.env.example` to `.env` and fill in the SMTP settings and `ENQUIRY_TO`. Attachments are sent with the email.
- If the server cannot be reached, the form offers a WhatsApp link with the details filled in.
- A hidden honeypot field and a limit of 5 enquiries per 10 minutes per IP reduce spam.

`data/` holds customer details. Keep it out of version control (it is in `.gitignore`) and back it up.

## Colours

The palette follows the logo: blue `#0337B0`, grey `#A9ACB3`, navy `#0B1B4A` for dark sections and light grey `#E3E5EB` for the page background (it matches the backdrop of the product photos, so new product shots should use the same backdrop). The colour variables are at the top of `public/css/site.css` (they keep their original names: `--ivory`, `--forest`, `--sage`, `--umber`, `--ink`). The site uses one fixed theme and does not switch with the visitor's dark-mode setting.

## Before launch

1. Add the company email to `email` in `public/js/content.js` to show it on the Contact page.
2. Set `SITE_URL` in `.env` so `sitemap.xml` uses the real domain.
3. Replace AI-generated photographs that show people or the factory floor with real photographs of the Irugur facility. Captions such as "The sewing floor" and "Our facility" describe the image as Sreevari's own.
4. Host on any Node host (Render, Railway, a VPS with PM2, etc.) behind HTTPS. `data/` needs persistent disk storage.

## Replacing an image

Save the new file as WebP with the same filename in `public/images/`. To use a new filename, change the matching `--imN` line at the top of `public/css/site.css`.

## Image list

| File | Used in |
|---|---|
| hero-needle | Homepage hero |
| texture-woven-macro | Homepage manifesto |
| detail-button-placket, detail-collar | Homepage manifesto and "Experience" section, Capabilities |
| factory-sewing-floor | Homepage band, Manufacturing overview |
| making-01 to making-07 | Homepage "Made here" sequence, Manufacturing page |
| journey-reference-techpack | Homepage development journey |
| product-* (7 files) | Homepage product gallery, Products page |
| sourcing-knitwear-tshirts, sourcing-home-textiles, sourcing-fabric-swatches | Products and Sourcing pages |
| sourcing-fabric-rolls, sourcing-coordination | Sourcing page |
| manufacturing-trimming, manufacturing-final-inspection | Manufacturing page |
| capabilities-garment-check, capabilities-export-cartons | Capabilities page |
| texture-fabric-folds | About page, homepage "Experience" section |
| texture-dark-thread | Enquiry section background |
| texture-charcoal-folds | Spare (not currently used) |
| share-card.jpg | Link preview image for WhatsApp and social sharing |
| factory-exterior-irugur | About page, band above the footer on Home and Contact |
