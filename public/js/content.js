/*
 * Site content. Edit text here; pages.js and site.js turn it into markup.
 * Image numbers refer to the --imN variables at the top of css/site.css.
 * Every figure and claim comes from the company brief. Do not add
 * certifications, clients, export countries or statistics that are not verified.
 */
window.SV = {
  whatsapp: "918072544030",
  maps: "https://www.google.com/maps/place/Sreevari+apparels+private+limited/@11.0116777,77.0632521,951m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3ba85714bb697449:0xd5852ed1445fb75a!8m2!3d11.0116777!4d77.065827!16s%2Fg%2F11zd4ydxxx",
  email: "", // add the company email here to show it on the Contact page

  titles: {
    "": "Sreevari Apparels — Woven garment manufacturing & sourcing, Coimbatore",
    about: "About — Sreevari Apparels",
    manufacturing: "Manufacturing — Sreevari Apparels",
    products: "Products — Sreevari Apparels",
    sourcing: "Sourcing — Sreevari Apparels",
    contact: "Start a project — Sreevari Apparels",
  },

  // Manufacturing page, the seven stages: [title, text, short label, image, alt]
  stages: [
    [
      "Fabric inspection",
      "Fabric is inspected, selected and approved before production begins.",
      "Fabric",
      7,
      "A roll of woven fabric being unrolled and inspected",
    ],
    [
      "Pattern development / CAD",
      "CAD, pattern development and technical construction.",
      "CAD",
      6,
      "Pattern drafting on paper beside a CAD screen",
    ],
    [
      "Sample development",
      "Prototype development and approval to specification.",
      "Sample",
      5,
      "A sample shirt on a tailoring table",
    ],
    [
      "Fabric cutting",
      "Fabric preparation and cutting to the approved pattern.",
      "Cutting",
      4,
      "Fabric laid out on a cutting table",
    ],
    [
      "Shirt construction",
      "Sewing and garment assembly.",
      "Construction",
      3,
      "An operator sewing a shirt at a machine",
    ],
    [
      "Quality inspection",
      "In-line checking and final AQL inspection.",
      "Quality",
      2,
      "A finished shirt being measured with a tape",
    ],
    [
      "Finishing and packing",
      "Finishing, packing and export preparation.",
      "Packing",
      35,
      "A white shirt being pressed, with finished shirts on a rail behind",
    ],
  ],

  // Products page and homepage gallery: [name, image(s), made in-house?, text]
  products: [
    ["Shirts", [12, 32], true, "Men’s and women’s formal, casual and cargo shirts."],
    ["Trousers", [11, 33], true, "Chinos, formal pants and casual pants."],
    ["Jackets", 10, true, "Jackets and overshirts."],
    ["Uniforms", 26, true, "Uniforms for corporate and institutional use."],
    ["Workwear", 8, true, "Heavy cotton workwear and cargo styles."],
    ["Knitted Garments", 19, false, "Men’s and women’s knitted garments and T-shirts."],
    ["Home Textiles", 18, false, "Home textiles sourced to your specification."],
    ["Fabrics", 17, false, "Fabrics sourced to your specification."],
  ],

  sourcingLines: [
    [19, "Knitwear sourcing", "Men’s and women’s knitted garments and T-shirts."],
    [18, "Home textile sourcing", "Home textiles sourced to specification."],
    [17, "Fabric sourcing", "Fabrics sourced to specification."],
  ],

  aboutTimeline: [
    ["1993", "Established in Coimbatore", "Sreevari Apparels begins manufacturing woven garments in Tamil Nadu."],
    [
      "Own facility",
      "Made in Irugur",
      "Woven garments are produced in our own facility, to approved samples and buyer specifications.",
    ],
    [
      "Partner network",
      "Wider possibility",
      "Knitwear, home textiles and fabrics are sourced through manufacturing partners across India.",
    ],
  ],

  // Wording supplied by the company. The four pillars are the areas a SMETA 4-Pillar audit covers.
  compliance: {
    headline: ["SEDEX compliant.", "SMETA 4-Pillar."],
    text: "Our manufacturing facility is SEDEX compliant and operates against the SMETA 4-Pillar standard and audit requirements.",
    pillars: ["Labour standards", "Health and safety", "Environment", "Business ethics"],
  },

  // Products page fabric picker. Illustrative options only: real fabrics and colours follow the buyer's specification.
  fabricColours: [
    ["White", "#f7f8fa", "#dfe3ea", "#c9d2e6"],
    ["Light blue", "#bcd0f7", "#9db4ea", "#f4f7ff"],
    ["Navy", "#1b2c6b", "#14224f", "#4a61b5"],
    ["Grey", "#b9bcc4", "#a3a7b1", "#e9ebef"],
    ["Charcoal", "#3a3f4b", "#2c303a", "#6d7482"],
  ],
  fabricWeaves: ["Solid", "Stripe", "Check"],
};
