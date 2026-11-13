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
    capabilities: "Capabilities — Sreevari Apparels",
    contact: "Start a project — Sreevari Apparels",
  },

  // Homepage "Made here" sequence: [title, text, short label, image, alt]
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
      13,
      "Folded shirts being packed into cartons",
    ],
  ],

  // Manufacturing page: [image, title, text]
  manufacturing: [
    [
      16,
      "Overview",
      "Woven garments are made in our own Coimbatore facility, from fabric approval through to export preparation.",
    ],
    [
      6,
      "CAD and pattern development",
      "CAD, pattern development and pattern making, from sketches, tech packs, references and samples.",
    ],
    [
      7,
      "Fabric sourcing and approval",
      "Fabric is sourced and approved against the buyer’s specification before production begins.",
    ],
    [4, "Cutting", "Fabric prepared and cut to the approved pattern."],
    [3, "Sewing", "Garment assembly on 120+ sewing machines."],
    [24, "Trimming", "Trims added and checked as the garment is assembled."],
    [2, "Quality checking", "In-line checking during production."],
    [25, "Final inspection", "Final AQL inspection before the goods are packed."],
    [12, "Finishing", "Finishing, with washing support available."],
    [13, "Packing", "Packing and export preparation."],
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

  sourcingSteps: [
    ["01", "Requirement", "Share product specifications."],
    ["02", "Sourcing", "Identify suitable manufacturing partners."],
    ["03", "Development", "Coordinate sampling and product development."],
    ["04", "Approval", "Review samples and specifications."],
    ["05", "Production", "Coordinate the agreed programme."],
    ["06", "Delivery", "Coordinate finishing, packing and shipment."],
  ],

  aboutTimeline: [
    ["1993", "Established in Coimbatore", "Sreevari Apparels begins manufacturing in Tamil Nadu."],
    ["Woven focus", "Specialised knowledge", "A focused understanding of woven fabrics, construction and finishing."],
    ["Own facility", "Made in Irugur", "120+ sewing machines and approximately 1,500–2,000 pieces per day."],
    [
      "Compliance",
      "SEDEX compliant",
      "Our facility operates against the SMETA 4-Pillar standard and audit requirements.",
    ],
    [
      "Partner network",
      "Wider possibility",
      "Knitwear, home textiles and fabrics sourced through partners across India.",
    ],
    ["One contact", "Shravan J.", "A dedicated point of contact from enquiry to shipment."],
  ],

  // Wording supplied by the company. The four pillars are the areas a SMETA 4-Pillar audit covers.
  compliance: {
    headline: ["SEDEX compliant.", "SMETA 4-Pillar."],
    text: "Our manufacturing facility is SEDEX compliant and operates against the SMETA 4-Pillar standard and audit requirements.",
    pillars: ["Labour standards", "Health and safety", "Environment", "Business ethics"],
  },

  capabilities: [
    "Fabric sourcing and approval",
    "CAD and pattern development",
    "Sampling and product development",
    "Cutting and sewing",
    "Trimming and checking",
    "In-line quality control",
    "Final AQL inspection",
    "Finishing and packing",
    "Washing support",
    "Export preparation",
  ],
};
