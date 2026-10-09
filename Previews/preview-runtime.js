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
  function render(record) {
    const business = value(record.businessName, record.companyName, record.company_name, record.name);
    const category = value(record.categoryLabel, record.business_category, record.category, record.template_key);
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
    html += '</nav></div></header><main id="top"><section class="hero"><div class="container hero-inner">';
    if (category) html += '<p class="eyebrow">' + esc(category) + '</p>';
    html += '<h1>' + esc(business || "Business website preview") + '</h1>';
    if (about) html += '<p class="hero-description">' + esc(about) + '</p>';
    if (contactButtons.length) html += '<div class="hero-actions">' + contactButtons.slice(0, 2).join("") + '</div>';
    html += '</div></section>';

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
  style.textContent = ":root{color-scheme:light;--ink:#172633;--muted:#64727d;--line:#e1e7eb;--paper:#f5f7f8;--white:#fff;--navy:#102332;--gold:#d5a95f}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;line-height:1.65}a{color:inherit}.container{width:min(1120px,calc(100% - 40px));margin:0 auto}.site-header{background:var(--navy);color:#fff;border-bottom:1px solid rgba(255,255,255,.12)}.nav{min-height:78px;display:flex;align-items:center;justify-content:space-between;gap:24px}.brand{font-weight:800;font-size:1.05rem;text-decoration:none;letter-spacing:-.02em}.nav nav{display:flex;gap:26px}.nav nav a{font-size:.94rem;font-weight:650;text-decoration:none;color:#e4ebef}.hero{background:linear-gradient(125deg,#102332,#1c3c50);color:#fff;padding:clamp(76px,12vw,146px) 0}.eyebrow,.section-label{text-transform:uppercase;letter-spacing:.16em;font-size:.75rem;font-weight:800;color:var(--gold);margin:0 0 16px}.hero h1{font-size:clamp(2.6rem,7vw,5.4rem);line-height:1.03;letter-spacing:-.055em;max-width:900px;margin:0;font-weight:850;overflow-wrap:anywhere}.hero-description{max-width:740px;color:#d7e0e5;font-size:1.1rem;margin:24px 0 0}.hero-actions,.contact-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}.button{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:11px 18px;border-radius:7px;font-weight:750;text-decoration:none}.button-primary{background:var(--gold);color:#142634}.button-secondary{background:#fff;color:#152c3b}.text-link{font-weight:750;text-decoration:underline;text-underline-offset:4px;padding:11px 0}.section{padding:76px 0}.section h2{font-size:clamp(2rem,4vw,3.15rem);letter-spacing:-.045em;line-height:1.1;margin:0 0 26px}.section-label{color:#99702e}.service-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}.service-card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:26px;min-height:126px;box-shadow:0 10px 26px rgba(14,33,45,.04)}.service-mark{color:#b98734;font-size:1.1rem}.service-card h3{font-size:1.05rem;margin:12px 0 0;overflow-wrap:anywhere}.about-section{background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.about-inner{max-width:880px}.body-copy{max-width:800px;color:#53636e;font-size:1.08rem;white-space:pre-wrap}.contact-inner{max-width:900px}.contact-detail{color:#52626e;margin:0 0 12px}.contact-actions{margin:18px 0}.social-links{display:flex;flex-wrap:wrap;gap:18px;margin-top:22px}.social-links a{font-weight:700;text-decoration:none}.site-footer{background:#0c1c28;color:#cdd7de;padding:25px 0}.footer-inner{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:.9rem}.error-wrap{min-height:100vh;display:grid;place-items:center;padding:24px;background:var(--paper)}.error-card{width:min(620px,100%);background:#fff;border:1px solid var(--line);border-radius:14px;padding:clamp(24px,5vw,48px);box-shadow:0 18px 54px rgba(10,30,42,.08)}.error-card h1{line-height:1.1;letter-spacing:-.04em}.error-card p{color:var(--muted)}@media(max-width:640px){.container{width:min(100% - 28px,1120px)}.nav{min-height:68px;align-items:flex-start;flex-direction:column;justify-content:center;padding:13px 0;gap:9px}.nav nav{flex-wrap:wrap;gap:14px}.hero{padding:72px 0}.section{padding:54px 0}.hero-actions .button,.contact-actions .button{width:100%}}";
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
      render(record);
    } catch (err) {
      console.error("Steady Hands preview:", err);
      errorView(err && err.message ? err.message : "An unexpected error occurred.");
    }
  })();
})();