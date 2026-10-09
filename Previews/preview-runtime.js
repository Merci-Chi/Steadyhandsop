(() => {
  "use strict";
  const params = new URLSearchParams(window.location.search);
  const siteKey = (params.get("sitekey") || "").trim();

  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[ch]);
  const value = (...values) => {
    for (const v of values) {
      if (v == null) continue;
      const s = String(v).trim();
      if (s && s.toUpperCase() !== "NOT FOUND") return s;
    }
    return "";
  };
  const list = v => (Array.isArray(v) ? v : String(v || "").split(/[,\n\r]+/))
    .map(x => String(x).trim()).filter(Boolean);
  const url = v => {
    const raw = value(v);
    if (!raw) return "";
    try {
      const u = new URL(/^https?:\/\//i.test(raw) ? raw : "https://" + raw);
      return (u.protocol === "https:" || u.protocol === "http:") ? u.href : "";
    } catch (_) { return ""; }
  };
  function decode(encoded) {
    if (!encoded) return null;
    try {
      const s = encoded.replace(/-/g, "+").replace(/_/g, "/");
      const raw = atob(s + "=".repeat((4 - s.length % 4) % 4));
      return JSON.parse(new TextDecoder().decode(Uint8Array.from(raw, ch => ch.charCodeAt(0))));
    } catch (_) {
      try { return JSON.parse(decodeURIComponent(encoded)); } catch (_) { return null; }
    }
  }
  function fromSession(key) {
    try {
      const raw = sessionStorage.getItem("steadyhands.preview." + key);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }
  function config() {
    if (window.STEADY_HANDS) return Promise.resolve(window.STEADY_HANDS);
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "../config.js?v=20261008-unified-template2";
      s.onload = () => window.STEADY_HANDS ? resolve(window.STEADY_HANDS) : reject(new Error("Preview configuration is unavailable."));
      s.onerror = () => reject(new Error("Could not load preview configuration."));
      document.head.appendChild(s);
    });
  }
  async function lookup(key) {
    const cfg = await config();
    const response = await fetch(cfg.supabaseUrl.replace(/\/$/, "") + "/rest/v1/rpc/get_site_by_key", {
      method: "POST",
      headers: {
        apikey: cfg.supabaseAnonKey,
        Authorization: "Bearer " + cfg.supabaseAnonKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ p_site_key: key })
    });
    if (!response.ok) throw new Error("Site lookup returned HTTP " + response.status + ".");
    const data = await response.json();
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;
    return {
      siteKey: row.site_key || key,
      category: row.template_key || "",
      categoryLabel: row.business_category || row.template_key || "",
      businessName: row.company_name || "",
      email: row.public_email || row.email || "",
      phone: row.public_phone || row.phone || "",
      services: row.services || "",
      about: row.about_business || "",
      description: row.about_business || "",
      address: row.address_or_service_area || "",
      instagram: row.instagram_url || "",
      facebook: row.facebook_url || "",
      tiktok: row.tiktok_url || "",
      website: row.website_url || ""
    };
  }
  function errorView(message) {
    document.title = "Preview unavailable";
    document.body.innerHTML =
      '<main class="error-wrap"><section class="error-card">' +
      '<p class="section-label">Steady Hands Preview</p><h1>We couldn’t load this preview.</h1>' +
      '<p>' + esc(message) + '</p><a class="button button-primary" href="../preview.html">Back to preview entry</a>' +
      '</section></main>';
  }

  const TEMPLATE_PHOTO_DATA_GZIP_BASE64 = ["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"].join("");
  async function loadTemplatePhotoMap() {
    if (!("DecompressionStream" in window)) return {};
    try {
      const binary = atob(TEMPLATE_PHOTO_DATA_GZIP_BASE64);
      const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
      return JSON.parse(await new Response(stream).text());
    } catch (err) {
      console.warn("Could not load template photo map", err);
      return {};
    }
  }
  const CATEGORY_ALIASES = {
    "bookkeeping service":"tax-accounting","bookkeeping":"tax-accounting","bookkeeper":"tax-accounting",
    "accountant":"tax-accounting","accounting service":"tax-accounting","tax preparation service":"tax-accounting","tax preparer":"tax-accounting",
    "auto repair shop":"auto-repair","auto mechanic":"auto-repair","automotive repair shop":"auto-repair",
    "auto body shop":"auto-body","beauty salon":"beauty","hair salon":"beauty","barber shop":"barber-salon","barber":"barber-salon",
    "chiropractor":"chiropractic","trucking company":"trucking-freight","attorney":"attorney-law","law firm":"attorney-law",
    "optometrist":"optometry","plumber":"plumbing","insurance agency":"insurance","day care center":"daycare-childcare",
    "daycare center":"daycare-childcare","electrician":"electrical","used car dealer":"auto-dealer","roofing contractor":"roofing",
    "pet groomer":"pet-grooming","landscaper":"landscaping","mexican restaurant":"restaurant","bakery":"bakery-desserts",
    "real estate agency":"real-estate","veterinarian":"veterinary","nail salon":"day-spa-med-spa",
    "restaurant":"restaurant","cleaning service":"cleaning","janitorial service":"cleaning","hvac contractor":"hvac",
    "landscape service":"landscaping","tax accountant":"tax-accounting","tax preparer service":"tax-accounting",
    "general contractor":"construction","plumbing service":"plumbing","electrical contractor":"electrical",
    "massage therapist":"massage-spa","event venue":"event-venue","driving school":"driving-school"
  };
  function categorySlug(label, photoMap) {
    const normalized = String(label || "generic").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const raw = String(label || "generic").trim().toLowerCase();
    const slug = CATEGORY_ALIASES[raw] || normalized;
    if (photoMap[slug]) return slug;
    if (photoMap[normalized]) return normalized;
    const words = normalized.split("-").filter(Boolean);
    for (const [candidate, photos] of Object.entries(photoMap)) {
      if (photos.length && (candidate === slug || candidate === normalized)) return candidate;
      if (words.length >= 2 && words.every(word => candidate.includes(word))) return candidate;
    }
    return photoMap.generic ? "generic" : "";
  }
  function photoUrl(short) {
    if (!short) return "";
    if (short.startsWith("u:")) return "https://images.unsplash.com/" + short.slice(2) + "?auto=format&fit=crop&w=1800&q=85";
    if (short.startsWith("p:")) return "https://images.pexels.com" + short.slice(2) + "?auto=compress&cs=tinysrgb&w=1500";
    return "";
  }

  function render(record, photoMap) {
    const business = value(record.businessName, record.companyName, record.company_name, record.name);
    const category = value(record.categoryLabel, record.business_category, record.category, record.template_key);
    const selectedSlug = categorySlug(category, photoMap || {});
    const photos = (photoMap || {})[selectedSlug] || [];
    const heroPhoto = photoUrl(photos[0]);
    const secondaryPhoto = photoUrl(photos[1]);
    const phone = value(record.public_phone, record.phone);
    const email = value(record.public_email, record.email);
    const address = value(record.address, record.address_or_service_area, record.serviceArea);
    const about = value(record.about, record.description, record.about_business);
    const website = url(record.website || record.website_url);
    const services = list(record.services);
    const socials = [
      ["Facebook", url(record.facebook || record.facebook_url)],
      ["Instagram", url(record.instagram || record.instagram_url)],
      ["TikTok", url(record.tiktok || record.tiktok_url)]
    ].filter(x => x[1]);

    const contactButtons = [];
    if (phone) contactButtons.push('<a class="button button-primary" href="tel:' + esc(phone.replace(/[^\d+]/g, "")) + '">Call ' + esc(phone) + '</a>');
    if (email) contactButtons.push('<a class="button button-secondary" href="mailto:' + esc(email) + '">Email us</a>');
    if (website) contactButtons.push('<a class="text-link" href="' + esc(website) + '" target="_blank" rel="noopener noreferrer">Visit website ↗</a>');

    let html = '<header class="site-header"><div class="container nav">' +
      '<a class="brand" href="#top">' + esc(business || "Business website preview") + '</a><nav aria-label="Main navigation">';
    if (services.length) html += '<a href="#services">Services</a>';
    if (about) html += '<a href="#about">About</a>';
    if (phone || email || address || website || socials.length) html += '<a href="#contact">Contact</a>';
    html += '</nav></div></header><main id="top"><section class="hero"' +
      (heroPhoto ? ' style="background-image:linear-gradient(110deg,rgba(7,20,30,.88),rgba(7,20,30,.38)),url(&quot;' + esc(heroPhoto) + '&quot;);background-position:center;background-size:cover;"' : '') +
      '><div class="container hero-inner">';
    if (category) html += '<p class="eyebrow">' + esc(category) + '</p>';
    html += '<h1>' + esc(business || "Business website preview") + '</h1>';
    if (about) html += '<p class="hero-description">' + esc(about) + '</p>';
    if (contactButtons.length) html += '<div class="hero-actions">' + contactButtons.slice(0, 2).join("") + '</div>';
    html += '</div></section>';

    if (secondaryPhoto && (business || category)) {
      html += '<section class="photo-band" aria-label="Business photography" style="background-image:linear-gradient(100deg,rgba(7,20,30,.76),rgba(7,20,30,.25)),url(&quot;' + esc(secondaryPhoto) + '&quot;);background-position:center;background-size:cover;">' +
        '<div class="container photo-band-inner">' +
        (category ? '<p class="section-label">' + esc(category) + '</p>' : '') +
        (business ? '<h2>' + esc(business) + '</h2>' : '') +
        '</div></section>';
    }

    if (services.length) {
      html += '<section id="services" class="section"><div class="container"><p class="section-label">What we offer</p><h2>Services</h2><div class="service-grid">';
      html += services.map(s => '<article class="service-card"><span class="service-mark" aria-hidden="true">✦</span><h3>' + esc(s) + '</h3></article>').join("");
      html += '</div></div></section>';
    }
    if (about) {
      html += '<section id="about" class="section about-section"><div class="container about-inner"><p class="section-label">About</p><h2>' +
        esc(business || "About us") + '</h2><p class="body-copy">' + esc(about) + '</p></div></section>';
    }
    if (phone || email || address || website || socials.length) {
      html += '<section id="contact" class="section contact-section"><div class="container contact-inner"><p class="section-label">Get in touch</p><h2>Contact' +
        (business ? ' ' + esc(business) : ' us') + '</h2>';
      if (address) html += '<p class="contact-detail">' + esc(address) + '</p>';
      if (contactButtons.length) html += '<div class="contact-actions">' + contactButtons.join("") + '</div>';
      if (socials.length) html += '<div class="social-links">' + socials.map(x => '<a href="' + esc(x[1]) + '" target="_blank" rel="noopener noreferrer">' + esc(x[0]) + ' ↗</a>').join("") + '</div>';
      html += '</div></section>';
    }
    html += '</main><footer class="site-footer"><div class="container footer-inner"><span>' +
      esc(business || "Business website preview") + '</span><span>' + esc(category) + '</span></div></footer>';
    document.title = (business || "Business website preview") + (category ? " | " + category : "");
    document.body.innerHTML = html;
  }

  const style = document.createElement("style");
  style.textContent = ":root{color-scheme:light;--ink:#172633;--muted:#64727d;--line:#e1e7eb;--paper:#f5f7f8;--white:#fff;--navy:#102332;--gold:#d5a95f}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;line-height:1.65}a{color:inherit}.container{width:min(1120px,calc(100% - 40px));margin:0 auto}.site-header{background:var(--navy);color:#fff;border-bottom:1px solid rgba(255,255,255,.12)}.nav{min-height:78px;display:flex;align-items:center;justify-content:space-between;gap:24px}.brand{font-weight:800;font-size:1.05rem;text-decoration:none;letter-spacing:-.02em}.nav nav{display:flex;gap:26px}.nav nav a{font-size:.94rem;font-weight:650;text-decoration:none;color:#e4ebef}.hero{background:linear-gradient(125deg,#102332,#1c3c50);color:#fff;padding:clamp(76px,12vw,146px) 0;background-position:center;background-size:cover}.photo-band{min-height:310px;display:flex;align-items:center;color:#fff;background-color:#223743;padding:54px 0}.photo-band-inner{width:100%}.photo-band h2{font-size:clamp(1.9rem,5vw,3.4rem);max-width:900px;letter-spacing:-.045em;line-height:1.1;margin:0}.photo-band .section-label{color:#f2d39b}.eyebrow,.section-label{text-transform:uppercase;letter-spacing:.16em;font-size:.75rem;font-weight:800;color:var(--gold);margin:0 0 16px}.hero h1{font-size:clamp(2.6rem,7vw,5.4rem);line-height:1.03;letter-spacing:-.055em;max-width:900px;margin:0;font-weight:850;overflow-wrap:anywhere}.hero-description{max-width:740px;color:#d7e0e5;font-size:1.1rem;margin:24px 0 0}.hero-actions,.contact-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}.button{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:11px 18px;border-radius:7px;font-weight:750;text-decoration:none}.button-primary{background:var(--gold);color:#142634}.button-secondary{background:#fff;color:#152c3b}.text-link{font-weight:750;text-decoration:underline;text-underline-offset:4px;padding:11px 0}.section{padding:76px 0}.section h2{font-size:clamp(2rem,4vw,3.15rem);letter-spacing:-.045em;line-height:1.1;margin:0 0 26px}.section-label{color:#99702e}.service-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}.service-card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:26px;min-height:126px;box-shadow:0 10px 26px rgba(14,33,45,.04)}.service-mark{color:#b98734;font-size:1.1rem}.service-card h3{font-size:1.05rem;margin:12px 0 0;overflow-wrap:anywhere}.about-section{background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.about-inner{max-width:880px}.body-copy{max-width:800px;color:#53636e;font-size:1.08rem;white-space:pre-wrap}.contact-inner{max-width:900px}.contact-detail{color:#52626e;margin:0 0 12px}.contact-actions{margin:18px 0}.social-links{display:flex;flex-wrap:wrap;gap:18px;margin-top:22px}.social-links a{font-weight:700;text-decoration:none}.site-footer{background:#0c1c28;color:#cdd7de;padding:25px 0}.footer-inner{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:.9rem}.error-wrap{min-height:100vh;display:grid;place-items:center;padding:24px;background:var(--paper)}.error-card{width:min(620px,100%);background:#fff;border:1px solid var(--line);border-radius:14px;padding:clamp(24px,5vw,48px);box-shadow:0 18px 54px rgba(10,30,42,.08)}.error-card h1{line-height:1.1;letter-spacing:-.04em}.error-card p{color:var(--muted)}@media(max-width:640px){.container{width:min(100% - 28px,1120px)}.nav{min-height:68px;align-items:flex-start;flex-direction:column;justify-content:center;padding:13px 0;gap:9px}.nav nav{flex-wrap:wrap;gap:14px}.hero{padding:72px 0}.section{padding:54px 0}.hero-actions .button,.contact-actions .button{width:100%}}";
  document.head.appendChild(style);

  (async () => {
    try {
      const encoded = decode(params.get("data") || "");
      let record = encoded && value(encoded.siteKey, encoded.site_key) ? encoded : null;
      if (!record && siteKey) record = fromSession(siteKey);
      if (!record && siteKey) record = await lookup(siteKey);
      if (!record) {
        errorView(siteKey ? "This site key was not found or is inactive. Check the code and try again." : "Enter your assigned site key on the Preview page to load your business information.");
        return;
      }
      const photoMap = await loadTemplatePhotoMap();
      render(record, photoMap);
    } catch (err) {
      console.error("Steady Hands preview:", err);
      errorView(err && err.message ? err.message : "An unexpected error occurred.");
    }
  })();
})();