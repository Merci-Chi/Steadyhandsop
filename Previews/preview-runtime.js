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
      s.src = "../config.js?v=20261009-placeholder-unlock1";
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

  const TEMPLATE_PHOTO_DATA_GZIP_BASE64 = "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";
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

  function categoryProfile(slug, label) {
    const common = {
      "tax-accounting": {
        title:"Bookkeeping & Accounting", services:["Bookkeeping","Tax Preparation","Payroll Support","Financial Organization","Business Tax Planning","Consultation"],
        about:"SAMPLE PREVIEW TEXT: Get organized with practical bookkeeping and accounting support designed around your business. Replace this sample introduction with your own story, experience, and approach after unlocking your site.",
        benefits:["Clear, organized records","Support for small businesses","Straightforward communication"],
        cta:"Schedule a Consultation"
      },
      "barber-salon": {
        title:"Barbering & Grooming", services:["Classic Haircuts","Skin Fades","Beard Trims","Lineups & Shape-Ups","Kids’ Cuts","Style Consultation"],
        about:"SAMPLE PREVIEW TEXT: A neighborhood grooming experience focused on your preferred style and a clean finish. Add your specialties, experience, and booking details after unlocking your site.",
        benefits:["Styles tailored to you","Attention to detail","A comfortable experience"], cta:"Request an Appointment"
      },
      "beauty": {
        title:"Beauty & Salon Services",services:["Hair Styling","Color Services","Treatments","Special-Event Styling","Consultations","Maintenance & Care"],
        about:"SAMPLE PREVIEW TEXT: A beauty space for everyday maintenance and special-occasion looks. Replace this example with your services, credentials, and salon story after unlocking your site.",
        benefits:["Personalized service","Careful attention to detail","Options for different styles"],cta:"Book a Consultation"
      },
      "landscaping": {
        title:"Landscaping & Outdoor Care",services:["Landscape Maintenance","Yard Cleanups","Irrigation & Sprinklers","Planting & Enhancements","Turf & Pavers","Seasonal Property Care"],
        about:"SAMPLE PREVIEW TEXT: Keep outdoor spaces neat, healthy, and welcoming with landscaping services tailored to each property. Add your service area, project photos, and business story after unlocking your site.",
        benefits:["Care for residential properties","Flexible maintenance options","Attention to curb appeal"],cta:"Request an Estimate"
      },
      "restaurant": {
        title:"Dining & Food Service",services:["Dine-In","Takeout","Signature Dishes","Family Favorites","Catering Inquiries","Group Orders"],
        about:"SAMPLE PREVIEW TEXT: Discover a welcoming food experience with a menu made for sharing and enjoying. Replace this sample copy with your real menu, hours, story, and ordering details after unlocking your site.",
        benefits:["A welcoming dining experience","Options for different occasions","Friendly service"],cta:"View Menu"
      },
      "cleaning": {
        title:"Cleaning Services",services:["Recurring Cleaning","Deep Cleaning","Move-In / Move-Out","Office Cleaning","Kitchen & Bathroom Care","Custom Cleaning Plans"],
        about:"SAMPLE PREVIEW TEXT: Keep your space fresh and organized with cleaning options suited to your home or workplace. Add your real service area, availability, and cleaning checklist after unlocking your site.",
        benefits:["Plans tailored to each space","Attention to the details","Flexible service options"],cta:"Request a Quote"
      },
      "auto-repair": {
        title:"Automotive Repair & Maintenance",services:["Diagnostic Checks","Routine Maintenance","Brake Service","Engine & Performance","Fluid & Filter Service","Repair Estimates"],
        about:"SAMPLE PREVIEW TEXT: Practical automotive maintenance and repair support to help you understand your vehicle’s needs. Add your real specialties, certifications, and service policies after unlocking your site.",
        benefits:["Clear repair explanations","Maintenance-focused service","Options based on vehicle needs"],cta:"Request Service"
      },
      "auto-body": {
        title:"Auto Body & Collision",services:["Bodywork Estimates","Dent Repair","Paint & Finish","Bumper Repair","Panel Alignment","Collision Repair Consultation"],
        about:"SAMPLE PREVIEW TEXT: Auto body services focused on restoring appearance and fit after everyday damage or a collision. Add your actual repair capabilities, insurance guidance, and shop details after unlocking your site.",
        benefits:["Detail-focused workmanship","Repair options explained","Help planning next steps"],cta:"Request an Estimate"
      },
      "plumbing": {
        title:"Plumbing Services",services:["Leak Repairs","Drain Service","Fixture Installation","Water Heater Service","Pipe Repairs","Plumbing Inspections"],
        about:"SAMPLE PREVIEW TEXT: Plumbing support for common repairs, installations, and maintenance needs. Replace this example with your licensed services, coverage area, and availability after unlocking your site.",
        benefits:["Clear next steps","Maintenance and repair options","Care for your property"],cta:"Request Service"
      },
      "electrical": {
        title:"Electrical Services",services:["Troubleshooting","Lighting Installation","Outlet & Switch Service","Panel Consultation","Fixture Upgrades","Electrical Maintenance"],
        about:"SAMPLE PREVIEW TEXT: Electrical service options for maintenance, upgrades, and troubleshooting. Add your real license details, covered services, and service area after unlocking your site.",
        benefits:["Safety-minded work","Options explained clearly","Service for different property needs"],cta:"Request Service"
      },
      "hvac": {
        title:"Heating & Air Conditioning",services:["System Maintenance","Heating Service","Cooling Service","Airflow Troubleshooting","Thermostat Installation","System Estimates"],
        about:"SAMPLE PREVIEW TEXT: Heating and cooling support to help maintain comfort across the seasons. Add your true equipment specialties, coverage area, and scheduling details after unlocking your site.",
        benefits:["Seasonal maintenance options","Clear recommendations","Support for comfort needs"],cta:"Request Service"
      },
      "dentist": {
        title:"Dental Care",services:["Routine Exams","Preventive Care","Cleaning Appointments","Treatment Consultations","Oral Health Guidance","Follow-Up Visits"],
        about:"SAMPLE PREVIEW TEXT: A welcoming place to learn about dental care and available appointment options. Replace this with your actual practice information, providers, and accepted services after unlocking your site.",
        benefits:["Patient-focused communication","Preventive care information","Appointment guidance"],cta:"Request an Appointment"
      },
      "medical-clinic": {
        title:"Health & Wellness Services",services:["Appointment Requests","General Consultations","Wellness Visits","Follow-Up Care","Patient Information","Care Coordination"],
        about:"SAMPLE PREVIEW TEXT: A professional place to learn about available healthcare services and appointment options. Add verified provider information, actual services, and patient instructions after unlocking your site.",
        benefits:["Clear patient information","Respectful communication","Guidance on appointment options"],cta:"Request an Appointment"
      },
      "day-spa-med-spa": {
        title:"Spa & Personal Care",services:["Relaxation Treatments","Skin Care Consultations","Personal Care Services","Wellness Packages","Appointment Planning","Treatment Information"],
        about:"SAMPLE PREVIEW TEXT: Explore spa and personal-care options in a comfortable setting. Add your real service menu, qualifications, and booking rules after unlocking your site.",
        benefits:["A relaxing experience","Options explained before booking","Personalized care"],cta:"Book a Consultation"
      },
      "driving-school": {
        title:"Driving Lessons & Training",services:["Beginner Lessons","Behind-the-Wheel Practice","Road-Test Preparation","Refresher Lessons","Scheduling Guidance","Student Information"],
        about:"SAMPLE PREVIEW TEXT: Learn about lesson options and training for different experience levels. Replace this with your real instructor credentials, locations, and scheduling information after unlocking your site.",
        benefits:["Lessons for different experience levels","Clear training expectations","Practice-focused learning"],cta:"Request Lesson Information"
      },
      "real-estate": {
        title:"Real Estate Services",services:["Buying Guidance","Selling Preparation","Property Search","Market Consultations","Listing Support","Local Area Guidance"],
        about:"SAMPLE PREVIEW TEXT: Explore property options and learn how professional guidance can support your next move. Add your genuine listings, license details, and service areas after unlocking your site.",
        benefits:["Guidance through the process","Clear communication","Support for your property goals"],cta:"Request a Consultation"
      },
      "pet-grooming": {
        title:"Pet Grooming & Care",services:["Bath & Brush","Haircuts & Styling","Nail Trimming","Coat Maintenance","Breed-Specific Grooming","Appointment Consultation"],
        about:"SAMPLE PREVIEW TEXT: Grooming options designed to help pets look and feel their best. Add your real grooming menu, pet requirements, and appointment policies after unlocking your site.",
        benefits:["Careful handling","Options for different coats","Clear appointment information"],cta:"Request an Appointment"
      },
      "plumbing-service": {
        title:"Home Service & Repairs",services:["Service Consultation","Routine Maintenance","Repairs","Installation Support","Property Care","Estimate Requests"],
        about:"SAMPLE PREVIEW TEXT: Home and property service options designed around common maintenance needs. Customize this page with your real specialties, credentials, and coverage area after unlocking your site.",
        benefits:["Practical service options","Clear estimates","Care for your property"],cta:"Request an Estimate"
      },
      "generic": {
        title:"Professional Business Services",services:["Consultations","Service Planning","Custom Solutions","Ongoing Support","Project Requests","Frequently Asked Questions"],
        about:"SAMPLE PREVIEW TEXT: A professional business focused on helpful service, clear communication, and solutions tailored to each customer. Replace this example with your actual company story and offerings after unlocking your site.",
        benefits:["Personalized attention","Clear communication","Solutions shaped around your needs"],cta:"Contact Us"
      }
    };
    const key = common[slug] ? slug : "generic";
    const profile = common[key];
    return {
      categoryTitle: profile.title || label || "Professional Services",
      services: profile.services,
      about: profile.about,
      benefits: profile.benefits,
      cta: profile.cta
    };
  }

  function render(record, photoMap) {
    const category = value(record.categoryLabel, record.business_category, record.category, record.template_key) || "Professional Services";
    const selectedSlug = categorySlug(category, photoMap || {});
    const profile = categoryProfile(selectedSlug, category);
    const photos = (photoMap || {})[selectedSlug] || (photoMap || {}).generic || [];
    const usablePhotos = photos.map(photoUrl).filter(Boolean);
    const heroPhoto = usablePhotos[0] || "";
    const galleryPhotos = [usablePhotos[1] || usablePhotos[0] || "", usablePhotos[2] || usablePhotos[0] || "", usablePhotos[3] || usablePhotos[1] || usablePhotos[0] || ""].filter(Boolean);

    const businessReal = value(record.businessName, record.companyName, record.company_name, record.name);
    const business = businessReal || ("Your Example " + profile.categoryTitle + " Business");
    const phoneReal = value(record.public_phone, record.phone);
    const emailReal = value(record.public_email, record.email);
    const addressReal = value(record.address, record.address_or_service_area, record.serviceArea);
    const aboutReal = value(record.about, record.description, record.about_business);
    const websiteReal = url(record.website || record.website_url);
    const servicesReal = list(record.services);
    const phone = phoneReal || "(000)000-0000";
    const email = emailReal || "email@example.com";
    const address = addressReal || "1234 Example Street, Example City, ST 00000";
    const about = aboutReal || profile.about;
    const services = servicesReal.length ? servicesReal : profile.services;
    const isPlaceholder = {
      business: !businessReal, phone: !phoneReal, email: !emailReal,
      address: !addressReal, about: !aboutReal, services: !servicesReal.length,
      website: !websiteReal
    };
    const socials = [
      ["Facebook", url(record.facebook || record.facebook_url)],
      ["Instagram", url(record.instagram || record.instagram_url)],
      ["TikTok", url(record.tiktok || record.tiktok_url)]
    ].filter(item => item[1]);

    const placeholderTag = '<span class="sample-tag">Example placeholder</span>';
    const fakeMark = key => isPlaceholder[key] ? placeholderTag : "";
    const tel = phone.replace(/[^\d+]/g, "");
    const navItem = (href, text) => '<a href="' + href + '" data-preview-lock>' + text + '</a>';
    const button = (label, kind) => '<a class="preview-button ' + (kind || "") + '" href="#unlock" data-preview-lock>' + label + '</a>';
    const serviceCards = services.map((service, index) =>
      '<article class="service-card"><div class="service-icon">' + ["✦","◈","✧","⌁","◇","✳"][index % 6] + '</div><h3>' + esc(service) + '</h3><p>Sample service detail. Replace this with your actual service information after unlocking.</p></article>'
    ).join("");
    const benefitCards = profile.benefits.map((benefit, index) =>
      '<article class="benefit-card"><span>' + ["01","02","03"][index] + '</span><h3>' + esc(benefit) + '</h3><p>Sample preview content — customize this detail for your business.</p></article>'
    ).join("");
    const gallery = galleryPhotos.length ? '<div class="gallery-grid">' + galleryPhotos.map((src,index) =>
      '<button class="gallery-tile" type="button" data-preview-lock aria-label="Preview gallery item ' + (index + 1) + '"><img src="' + esc(src) + '" alt="Stock photo placeholder for ' + esc(category) + '"><span>Stock photo · example</span></button>'
    ).join("") + '</div>' : '<div class="gallery-empty">Stock photos for this category will appear here after the template finishes loading.</div>';

    document.title = business + " | " + category + " Preview";
    document.body.innerHTML =
      '<div class="preview-banner"><span>WEBSITE PREVIEW — interactions are disabled. <strong>This is just a preview. Unlock the full site to unlock it.</strong></span><button type="button" data-open-unlock>Unlock this site <span aria-hidden="true">↗</span></button></div>' +
      '<header class="site-header"><div class="container nav"><a class="brand" href="#top" data-preview-lock>' + esc(business) + '</a><nav aria-label="Main navigation">' +
        navItem("#services","Services") + navItem("#about","About") + navItem("#gallery","Gallery") + navItem("#contact","Contact") +
      '</nav><button class="mobile-menu" type="button" aria-label="Open navigation" data-preview-lock>☰</button></div></header>' +
      '<main id="top">' +
        '<section class="hero"' + (heroPhoto ? ' style="background-image:linear-gradient(110deg,rgba(6,20,31,.88),rgba(6,20,31,.30)),url(&quot;' + esc(heroPhoto) + '&quot;)"' : '') + '>' +
          '<div class="container hero-inner"><div class="hero-copy"><p class="eyebrow">' + esc(category) + ' · WEBSITE PREVIEW</p><h1>' + esc(business) + '</h1>' +
          '<p class="hero-description">' + esc(about) + '</p>' +
          (isPlaceholder.about ? '<p class="placeholder-note">SAMPLE PLACEHOLDER TEXT — replace this with your actual business description.</p>' : '') +
          '<div class="hero-actions">' + button('☎ ' + esc(phone) + fakeMark("phone"),"button-primary") + button(esc(profile.cta),"button-light") + '</div>' +
          '<p class="hero-placeholder-line">' + fakeMark("business") + ' ' + fakeMark("phone") + '</p></div></div></section>' +

        '<section class="quick-facts"><div class="container quick-facts-grid">' +
          '<article><span class="fact-icon">☎</span><div><p>Call us</p><strong>' + esc(phone) + '</strong>' + fakeMark("phone") + '</div></article>' +
          '<article><span class="fact-icon">✉</span><div><p>Email</p><strong>' + esc(email) + '</strong>' + fakeMark("email") + '</div></article>' +
          '<article><span class="fact-icon">⌖</span><div><p>Location</p><strong>' + esc(address) + '</strong>' + fakeMark("address") + '</div></article>' +
        '</div></section>' +

        '<section id="services" class="section"><div class="container"><div class="section-heading"><p class="section-kicker">What we do</p><h2>Services designed around your needs</h2><p>Sample service cards show how your business offerings can be presented. Your final site can use your real service names and descriptions.</p>' + (isPlaceholder.services ? placeholderTag : '') + '</div><div class="service-grid">' + serviceCards + '</div><div class="section-actions">' + button("Explore all services","button-outline") + button(esc(profile.cta),"button-primary") + '</div></div></section>' +

        (gallery ? '<section id="gallery" class="section photo-section"><div class="container"><div class="section-heading"><p class="section-kicker">A look at our work</p><h2>Gallery & inspiration</h2><p>Category-matched stock photography is used as a visual placeholder until your own photos are added.</p></div>' + gallery + '<div class="section-actions">' + button("View More Photos","button-outline") + button("Ask About This Service","button-primary") + '</div></div></section>' : '') +

        '<section class="photo-band"' + (usablePhotos[1] ? ' style="background-image:linear-gradient(110deg,rgba(6,20,31,.85),rgba(6,20,31,.30)),url(&quot;' + esc(usablePhotos[1]) + '&quot;)"' : '') + '><div class="container photo-band-inner"><p class="section-kicker">Service with a personal touch</p><h2>' + esc(business) + '</h2><p>' + esc(profile.about) + '</p>' + button(esc(profile.cta),"button-light") + '</div></section>' +

        '<section id="about" class="section about-section"><div class="container about-grid"><div><p class="section-kicker">About the business</p><h2>' + esc(business) + '</h2><p class="body-copy">' + esc(about) + '</p>' + (isPlaceholder.about ? '<p class="placeholder-note">EXAMPLE COPY — customize this paragraph with your own story.</p>' : '') + '</div><aside class="about-side"><div class="about-image"' + (usablePhotos[2] ? ' style="background-image:url(&quot;' + esc(usablePhotos[2]) + '&quot;)"' : '') + '></div><p>Category-matched stock photography · Replace with your own work after unlocking.</p></aside></div></section>' +

        '<section class="section benefits-section"><div class="container"><div class="section-heading"><p class="section-kicker">Why choose us</p><h2>A few reasons customers may choose your business</h2><p>These are sample content blocks, not verified claims or customer reviews.</p></div><div class="benefit-grid">' + benefitCards + '</div></div></section>' +

        '<section class="section reviews-section"><div class="container"><div class="section-heading"><p class="section-kicker">Customer feedback</p><h2>Reviews & testimonials</h2><p>Clearly marked examples show where genuine customer reviews can go. No real reviews have been invented.</p></div><div class="review-grid">' +
          '<article class="review-card"><div class="review-stars">★★★★★</div><p>“Example review placeholder — add a real customer review here after you have permission to use it.”</p><strong>Sample Customer</strong><span>Placeholder testimonial</span></article>' +
          '<article class="review-card"><div class="review-stars">★★★★★</div><p>“Sample feedback content — replace with an authentic review from your customer.”</p><strong>Example Client</strong><span>Placeholder testimonial</span></article>' +
          '<article class="review-card"><div class="review-stars">★★★★★</div><p>“Your customer experience could be highlighted here with a real, approved testimonial.”</p><strong>Example Reviewer</strong><span>Placeholder testimonial</span></article>' +
        '</div><div class="section-actions">' + button("Read More Reviews","button-outline") + '</div></div></section>' +

        '<section id="contact" class="section contact-section"><div class="container contact-grid"><div><p class="section-kicker">Get in touch</p><h2>Let’s talk about what you need</h2><p>Use the contact details below as placeholders when the business has not supplied them yet.</p><div class="contact-actions">' + button("Call " + esc(phone),"button-primary") + button("Email " + esc(email),"button-light") + button("Get Directions","button-outline") + '</div></div><div class="contact-card"><h3>Contact details</h3><p><strong>Phone</strong><br>' + esc(phone) + ' ' + fakeMark("phone") + '</p><p><strong>Email</strong><br>' + esc(email) + ' ' + fakeMark("email") + '</p><p><strong>Address</strong><br>' + esc(address) + ' ' + fakeMark("address") + '</p><p><strong>Website</strong><br>' + esc(value(websiteReal) || "www.example.com") + ' ' + (isPlaceholder.website ? placeholderTag : '') + '</p>' +
          (socials.length ? '<div class="social-list">' + socials.map(item=>'<a href="' + esc(item[1]) + '" data-preview-lock>' + esc(item[0]) + '</a>').join("") + '</div>' : '<p class="placeholder-note">Example social links can be added after unlocking your website.</p>') +
        '</div></div></section>' +
        '<section class="final-cta"><div class="container"><p class="section-kicker">Your website starts here</p><h2>Ready to make this site yours?</h2><p>Unlock to replace sample content with your real business details and customize your website.</p>' + button("Unlock the Full Site","button-primary") + '</div></section>' +
      '</main><footer class="site-footer"><div class="container footer-inner"><div><strong>' + esc(business) + '</strong><p>Website preview · Sample content is clearly marked</p></div><div><span>' + esc(category) + '</span><p>© ' + new Date().getFullYear() + ' · Preview only</p></div></div></footer>' +

      '<div class="unlock-modal" id="unlock-modal" hidden role="dialog" aria-modal="true" aria-labelledby="unlock-title"><div class="unlock-backdrop" data-close-unlock></div><div class="unlock-dialog"><button class="unlock-close" type="button" aria-label="Close popup" data-close-unlock>×</button><p class="section-kicker">Steady Hands Preview</p><h2 id="unlock-title">This is just a preview.</h2><p>Unlock the full site to unlock it. Your real business details, custom content, and working interactions can be added in the site questionnaire.</p><a class="preview-button button-primary" href="../make-site.html" data-allow-navigation>Unlock this site <span aria-hidden="true">↗</span></a><button class="preview-button button-outline" type="button" data-close-unlock>Keep Previewing</button></div></div>';

    const modal = document.getElementById("unlock-modal");
    const openModal = () => {
      modal.hidden = false;
      document.body.classList.add("unlock-open");
      const close = modal.querySelector(".unlock-close");
      if (close) close.focus();
    };
    const closeModal = () => {
      modal.hidden = true;
      document.body.classList.remove("unlock-open");
    };
    document.addEventListener("click", function previewClickHandler(event) {
      const allow = event.target.closest("[data-allow-navigation]");
      if (allow) return;
      const close = event.target.closest("[data-close-unlock]");
      if (close) { event.preventDefault(); closeModal(); return; }
      const unlock = event.target.closest("[data-open-unlock]");
      if (unlock) { event.preventDefault(); openModal(); return; }
      const locked = event.target.closest("[data-preview-lock],.preview-button");
      if (locked && !modal.contains(locked)) { event.preventDefault(); openModal(); }
    });
    document.addEventListener("keydown", function previewEscapeHandler(event) {
      if (event.key === "Escape" && !modal.hidden) closeModal();
    });

    const appended = document.createElement("style");
    appended.textContent = ".preview-banner{position:sticky;top:0;z-index:99999;display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;background:#102b4c;color:#fff;padding:10px 16px;text-align:center;font:700 14px/1.4 Arial,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.18)}.preview-banner strong{color:#ffbf00}.preview-banner button{border:0;background:transparent;color:white;text-decoration:underline;font:800 14px Arial,sans-serif;cursor:pointer;padding:4px 8px}.sample-tag{display:inline-block;background:#fff4d9;border:1px dashed #b68630;color:#76531e;border-radius:5px;padding:2px 7px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.05em;vertical-align:middle}.sample-tag:empty{display:none}.placeholder-note{margin-top:12px!important;padding:9px 12px;border-left:3px solid #d6aa60;background:rgba(255,255,255,.10);font-size:.82rem!important}.hero-placeholder-line{margin-top:14px!important;font-size:.8rem!important}.hero{position:relative;min-height:570px;display:flex;align-items:center;background-color:#203443;background-position:center;background-size:cover;padding:84px 0;color:#fff}.hero-inner{width:100%}.hero-copy{max-width:860px}.hero h1{font-size:clamp(2.8rem,7vw,5.7rem);line-height:.98;letter-spacing:-.05em;margin:12px 0 22px;overflow-wrap:anywhere}.hero-description{max-width:780px;font-size:1.08rem;color:rgba(255,255,255,.9);white-space:pre-wrap}.eyebrow{color:#f4d69e;text-transform:uppercase;letter-spacing:.15em;font-size:.76rem;font-weight:900}.hero-actions,.section-actions,.contact-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}.preview-button{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:12px 18px;border-radius:7px;text-decoration:none;font-weight:850;border:1px solid transparent;cursor:pointer;font:inherit}.button-primary{background:#d5a95f;color:#132837}.button-light{background:#fff;color:#132837}.button-outline{background:transparent;color:inherit;border-color:currentColor}.quick-facts{position:relative;z-index:2;margin-top:-26px}.quick-facts-grid{display:grid;grid-template-columns:repeat(3,1fr);background:#fff;border-radius:12px;box-shadow:0 18px 50px rgba(5,20,35,.14);overflow:hidden}.quick-facts-grid article{padding:24px;display:flex;gap:14px;align-items:flex-start;border-right:1px solid #e3e9ed}.quick-facts-grid article:last-child{border:0}.fact-icon{width:42px;height:42px;flex:0 0 auto;display:grid;place-items:center;border-radius:50%;background:#f5ebd8;color:#8d682e;font-size:1.2rem}.quick-facts p{margin:0 0 4px;color:#70808a;font-size:.85rem}.quick-facts strong{overflow-wrap:anywhere;color:#142e40}.section{padding:78px 0}.section-heading{max-width:760px;margin-bottom:30px}.section-kicker{color:#a67b34;text-transform:uppercase;font-size:.76rem;letter-spacing:.16em;font-weight:900;margin:0 0 10px}.section h2,.final-cta h2{font-size:clamp(2rem,4.5vw,3.7rem);letter-spacing:-.045em;line-height:1.06;margin:0 0 16px;color:#173348}.section-heading>p:not(.section-kicker),.contact-grid>div>p:not(.section-kicker),.final-cta p{color:#5e6d76}.service-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.service-card{min-height:172px;background:#fff;border:1px solid #e0e6e9;border-radius:10px;padding:24px;box-shadow:0 9px 26px rgba(12,35,48,.05)}.service-icon{font-size:1.3rem;color:#bd8b3d}.service-card h3{color:#1d394c;font-size:1.1rem;margin:14px 0 8px}.service-card p{font-size:.89rem;color:#6b7880}.photo-section{background:#eef2f3}.gallery-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.gallery-tile{position:relative;height:260px;border:0;border-radius:10px;overflow:hidden;padding:0;background:#dbe3e7;cursor:pointer}.gallery-tile img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .25s}.gallery-tile span{position:absolute;left:12px;bottom:12px;background:rgba(12,30,44,.78);color:#fff;padding:6px 9px;border-radius:4px;font-size:.7rem;font-weight:800}.gallery-tile:hover img{transform:scale(1.03)}.photo-band{background-color:#18374a;background-position:center;background-size:cover;color:#fff;padding:70px 0;min-height:300px;display:flex;align-items:center}.photo-band-inner{width:100%}.photo-band h2{color:#fff;max-width:900px}.photo-band p:not(.section-kicker){color:rgba(255,255,255,.86);max-width:760px}.about-section{background:#fff}.about-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:38px;align-items:center}.body-copy{white-space:pre-wrap;color:#5f6d75;font-size:1.05rem}.about-side{background:#f3f5f6;padding:12px;border-radius:12px}.about-image{min-height:290px;border-radius:8px;background-color:#d9e2e7;background-size:cover;background-position:center}.about-side p{font-size:.77rem;color:#687983;margin:10px 4px 2px}.benefits-section{background:#f0f3f4}.benefit-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.benefit-card{background:#fff;padding:23px;border:1px solid #e0e6e9;border-radius:10px}.benefit-card>span{color:#bd8b3d;font-size:.8rem;font-weight:900;letter-spacing:.12em}.benefit-card h3{font-size:1.1rem;color:#1a384a;margin:14px 0 8px}.benefit-card p{font-size:.88rem;color:#6a777f}.reviews-section{background:#fff}.review-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.review-card{border:1px solid #e2e7e9;border-radius:10px;padding:24px;background:#fbfcfc}.review-stars{color:#bd8b3d;letter-spacing:.12em;margin-bottom:12px}.review-card p{color:#52616a;font-size:.94rem}.review-card strong,.review-card span{display:block}.review-card strong{margin-top:18px;color:#243e4d}.review-card span{font-size:.75rem;color:#a1742e}.contact-section{background:#eef2f3}.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:35px;align-items:start}.contact-card{background:#fff;border:1px solid #dfe6e8;border-radius:12px;padding:25px;box-shadow:0 12px 32px rgba(12,35,48,.06)}.contact-card h3{color:#183549;margin:0 0 18px}.contact-card>p{color:#52636d;margin:0 0 15px;overflow-wrap:anywhere}.contact-card strong{font-size:.82rem;color:#17374c}.social-list{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}.social-list a{border:1px solid #d6dfe3;padding:8px 11px;border-radius:5px;text-decoration:none;font-weight:800}.final-cta{background:#122d40;color:#fff;padding:70px 0}.final-cta h2{color:#fff}.final-cta p{color:#d2dce2;max-width:760px}.site-footer{background:#0a1b27;color:#d1dae0;padding:26px 0}.footer-inner{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}.footer-inner p{color:#9dabb3;font-size:.8rem;margin-top:5px}.unlock-modal[hidden]{display:none!important}.unlock-modal{position:fixed;inset:0;z-index:1000000;display:grid;place-items:center;padding:20px}.unlock-backdrop{position:absolute;inset:0;background:rgba(4,14,27,.76);backdrop-filter:blur(7px)}.unlock-dialog{position:relative;z-index:1;width:min(500px,100%);padding:36px;background:#fff;color:#173348;border-radius:18px;box-shadow:0 30px 100px rgba(0,0,0,.4)}.unlock-dialog h2{font-size:clamp(1.8rem,5vw,2.5rem);line-height:1.08;letter-spacing:-.04em;margin:10px 0 14px}.unlock-dialog p:not(.section-kicker){color:#5c6c77}.unlock-dialog .preview-button{width:100%;margin-top:12px}.unlock-close{position:absolute;top:9px;right:12px;border:0;background:transparent;color:#415563;font-size:30px;cursor:pointer}.unlock-open{overflow:hidden}.mobile-menu{display:none;border:1px solid rgba(255,255,255,.25);border-radius:7px;background:transparent;color:inherit;padding:8px 11px}@media(max-width:780px){.quick-facts-grid,.service-grid,.benefit-grid,.review-grid,.gallery-grid{grid-template-columns:1fr}.quick-facts{margin-top:0}.quick-facts-grid article{border-right:0;border-bottom:1px solid #e3e9ed}.about-grid,.contact-grid{grid-template-columns:1fr}.gallery-tile{height:230px}.nav nav{display:flex;gap:10px;flex-wrap:wrap}.mobile-menu{display:block}.hero{min-height:520px;padding:64px 0}.section{padding:54px 0}.quick-facts-grid article{padding:17px}.unlock-dialog{padding:30px 22px}.preview-banner{font-size:12px}.preview-banner button{font-size:12px}}";
    document.head.appendChild(appended);

    modal.querySelectorAll("a[data-allow-navigation]").forEach(link => {
      link.href = "../make-site.html";
    });
    document.addEventListener("click", function previewClickHandler(event) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const allowNavigation = target.closest("[data-allow-navigation]");
      if (allowNavigation) return;
      const close = target.closest("[data-close-unlock]");
      if (close) { event.preventDefault(); closeModal(); return; }
      const open = target.closest("[data-open-unlock]");
      if (open) { event.preventDefault(); openModal(); return; }
      const locked = target.closest("[data-preview-lock],.preview-button");
      if (locked && !modal.contains(locked)) {
        event.preventDefault();
        openModal();
      }
    }, true);
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !modal.hidden) closeModal();
    });
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