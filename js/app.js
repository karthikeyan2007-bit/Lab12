/**
 * Dog-Ear Books — Lab 12 (CSS + JS + XML Online Bookstore)
 * Single script shared by all pages. Dispatches by document.body.dataset.page.
 *
 * Product catalogue:  data/books.xml (fetch + DOMParser)
 * Demo credentials:   data/users.xml (fetch + DOMParser)
 * Cart, registered users, active session, and last order are stored in localStorage
 * with keys prefixed "dogear." and safely wrapped in try/catch blocks.
 */
(function () {
  "use strict";

  /* ================= Storage ================= */
  const KEYS = {
    cart: "dogear.cart",
    users: "dogear.users",
    session: "dogear.session",
    order: "dogear.lastOrder",
  };

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        /* Storage blocked or unavailable */
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        /* Ignore */
      }
    },
  };

  /* ================= Helpers ================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));

  const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
  const money = (n) => inr.format(n);

  const SHIPPING_FEE = 49;
  const FREE_SHIP_FROM = 499;

  /* SVG icons (Lucide-style outlines, no emoji) */
  const SVG_ICONS = {
    sparkles: '<path d="M9.94 14.06 4 20M14 4l1.5 3.5L19 9l-3.5 1.5L14 14l-1.5-3.5L9 9l3.5-1.5z"/><path d="M5 3v4M3 5h4"/>',
    flask: '<path d="M9 3h6M10 3v6.5L4.5 19a1.5 1.5 0 0 0 1.3 2.2h12.4a1.5 1.5 0 0 0 1.3-2.2L14 9.5V3"/><path d="M7 15h10"/>',
    cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    landmark: '<path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l8 5H4z"/>',
    logo: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19v15H6.5A2.5 2.5 0 0 0 4 19.5Zm0 0A2.5 2.5 0 0 0 6.5 22H19v-5"/>',
    book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
    cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
    phone: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
    cash: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
    eye: '<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20M14.12 14.12a3 3 0 1 1-4.24-4.24"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    feather: '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/>',
    arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    package: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12M3.29 7 12 12l8.71-5"/>',
  };

  const icon = (name, cls = "icon") =>
    `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SVG_ICONS[name] || ""}</svg>`;

  /* ================= XML Loading ================= */
  const xmlCache = {};
  function loadXML(url) {
    if (!xmlCache[url]) {
      xmlCache[url] = fetch(url, { cache: "no-cache" })
        .then((res) => {
          if (!res.ok) throw new Error(`Could not load ${url} (HTTP ${res.status})`);
          return res.text();
        })
        .then((text) => {
          const doc = new DOMParser().parseFromString(text, "application/xml");
          const err = doc.querySelector("parsererror");
          if (err) throw new Error(`${url} is not valid XML`);
          return doc;
        });
    }
    return xmlCache[url];
  }

  const textNode = (el, tag) => (el.getElementsByTagName(tag)[0] || {}).textContent?.trim() ?? "";

  let catalogPromise = null;
  function getCatalog() {
    if (!catalogPromise) {
      catalogPromise = loadXML("data/books.xml").then((doc) => {
        const categories = Array.from(doc.querySelectorAll("categories > category")).map((c) => ({
          id: c.getAttribute("id"),
          name: c.textContent.trim(),
        }));
        const catNameMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

        const books = Array.from(doc.getElementsByTagName("book")).map((b) => {
          const cover = b.getElementsByTagName("cover")[0];
          return {
            id: b.getAttribute("id") || "",
            category: b.getAttribute("category") || "fiction",
            categoryName: catNameMap[b.getAttribute("category")] || b.getAttribute("category") || "General",
            featured: b.getAttribute("featured") === "true",
            title: textNode(b, "title"),
            author: textNode(b, "author"),
            price: Number(textNode(b, "price")) || 0,
            mrp: Number(textNode(b, "mrp")) || 0,
            rating: Number(textNode(b, "rating")) || 0,
            pages: Number(textNode(b, "pages")) || 0,
            stock: Number(textNode(b, "stock")) || 0,
            description: textNode(b, "description"),
            c1: cover?.getAttribute("from") || "#C2410C",
            c2: cover?.getAttribute("to") || "#0F5257",
          };
        });

        return {
          categories,
          books,
          byId: Object.fromEntries(books.map((b) => [b.id, b])),
        };
      });
    }
    return catalogPromise;
  }

  function getXmlUsers() {
    return loadXML("data/users.xml").then((doc) =>
      Array.from(doc.getElementsByTagName("user")).map((u) => ({
        name: textNode(u, "name"),
        email: textNode(u, "email").toLowerCase(),
        password: textNode(u, "password"),
        phone: textNode(u, "phone"),
        address: textNode(u, "address"),
        source: "xml",
      }))
    );
  }

  /* ================= Cart ================= */
  const cart = {
    items() {
      return store.get(KEYS.cart, []).filter((i) => i && i.id && i.qty > 0);
    },
    save(items) {
      store.set(KEYS.cart, items);
      updateCartBadge();
    },
    count() {
      return this.items().reduce((n, i) => n + i.qty, 0);
    },
    qtyOf(id) {
      return (this.items().find((i) => i.id === id) || { qty: 0 }).qty;
    },
    add(id, qty, max) {
      const items = this.items();
      const line = items.find((i) => i.id === id);
      const cur = line ? line.qty : 0;
      const next = Math.min(cur + qty, max);
      if (line) {
        line.qty = next;
      } else if (next > 0) {
        items.push({ id, qty: next });
      }
      this.save(items);
      return next;
    },
    setQty(id, qty) {
      const items = this.items()
        .map((i) => (i.id === id ? { ...i, qty } : i))
        .filter((i) => i.qty > 0);
      this.save(items);
    },
    remove(id) {
      this.save(this.items().filter((i) => i.id !== id));
    },
    clear() {
      store.remove(KEYS.cart);
      updateCartBadge();
    },
  };

  function computeTotals(lines) {
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const savings = lines.reduce(
      (s, l) => s + Math.max(0, (l.mrp || l.price) - l.price) * l.qty,
      0
    );
    const shipping = subtotal === 0 || subtotal >= FREE_SHIP_FROM ? 0 : SHIPPING_FEE;
    return { subtotal, savings, shipping, total: subtotal + shipping };
  }

  /* ================= Session ================= */
  const session = {
    user() {
      return store.get(KEYS.session, null);
    },
    login(u) {
      store.set(KEYS.session, {
        name: u.name,
        email: u.email,
        phone: u.phone || "",
        address: u.address || "",
      });
    },
    logout() {
      store.remove(KEYS.session);
    },
  };

  async function sha256(str) {
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
    return "hash:" + str;
  }

  function safeNext(fallback) {
    const next = new URLSearchParams(location.search).get("next") || "";
    return /^[a-z]+\.html$/.test(next) ? next : fallback;
  }

  /* ================= Toast Notification ================= */
  function toast(html) {
    let region = $("#toast-region");
    if (!region) {
      region = document.createElement("div");
      region.id = "toast-region";
      region.className = "toast-region";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `${icon("check")} <span>${html}</span>`;
    region.appendChild(t);
    setTimeout(() => {
      t.classList.add("fade-out");
      setTimeout(() => t.remove(), 250);
    }, 3200);
  }

  /* ================= Header and Navigation ================= */
  function renderChrome() {
    const page = document.body.dataset.page;
    const user = session.user();

    const link = (href, label, pageKey) =>
      `<a href="${href}" class="nav-link"${page === pageKey ? ' aria-current="page"' : ""}>${label}</a>`;

    // Either "Log in + Register" or "Hi, name + Log out" — each shown exactly once.
    let authNavHtml = "";
    if (user) {
      const firstName = user.name ? user.name.split(" ")[0] : "Reader";
      authNavHtml = `
        <span class="nav-greeting"><span class="nav-avatar" aria-hidden="true">${esc(firstName.charAt(0).toUpperCase())}</span>Hi, ${esc(firstName)}</span>
        <button type="button" class="nav-link" id="logout-btn" data-logout>Log out</button>`;
    } else {
      authNavHtml = `
        ${link("login.html", "Log in", "login")}
        ${link("register.html", "Register", "register")}`;
    }

    const header = $("#site-header");
    if (header) {
      header.className = "site-header";
      header.innerHTML = `
        <div class="container">
          <div class="header-bar">
            <a class="brand" href="index.html" aria-label="Dog-Ear Books home">
              <span class="brand-mark" aria-hidden="true">${icon("logo")}</span>
              <span class="brand-name">Dog-Ear <span>Books</span></span>
            </a>
            <nav class="site-nav" id="site-nav" aria-label="Main navigation">
              ${link("index.html", "Home", "home")}
              ${link("catalogue.html", "Catalogue", "catalogue")}
              ${link("cart.html", "Cart &amp; Payment", "cart")}
              ${authNavHtml}
            </nav>
            <div class="header-tools">
              <a class="cart-btn" href="cart.html" aria-label="Shopping cart">
                ${icon("cart")}
                <span class="cart-label">Cart</span>
                <span class="cart-badge" id="cart-badge" hidden>0</span>
              </a>
              <button class="menu-btn" id="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open navigation menu">
                ${icon("menu")}
              </button>
            </div>
          </div>
        </div>`;

      // Header event listeners
      const menuBtn = $("#menu-btn");
      if (menuBtn) {
        menuBtn.addEventListener("click", () => {
          const nav = $("#site-nav");
          const open = nav.classList.toggle("open");
          menuBtn.setAttribute("aria-expanded", String(open));
          menuBtn.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
          menuBtn.innerHTML = open ? icon("close") : icon("menu");
        });
        document.addEventListener("keydown", (e) => {
          const nav = $("#site-nav");
          if (e.key === "Escape" && nav && nav.classList.contains("open")) menuBtn.click();
        });
      }

      $$("[data-logout]", header).forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          session.logout();
          location.href = "index.html";
        });
      });
    }

    const footer = $("#site-footer");
    if (footer) {
      footer.className = "site-footer";
      footer.innerHTML = `
        <div class="container footer-inner">
          <div>
            <span class="footer-brand">Dog-Ear Books</span>
            <p class="footer-text">A small online bookshop for people who fold page corners. Fiction, science, technology, self-help and history.</p>
            <p class="footer-small">&copy; ${new Date().getFullYear()} Dog-Ear Books &middot; Lab 12: CSS, JavaScript &amp; XML</p>
          </div>
          <nav class="footer-links" aria-label="Footer navigation">
            <span class="footer-heading">Explore</span>
            <a href="index.html">Home</a>
            <a href="catalogue.html">Catalogue</a>
            <a href="cart.html">Cart &amp; Payment</a>
            <a href="login.html">Log in</a>
            <a href="register.html">Register</a>
          </nav>
        </div>`;
    }

    updateCartBadge();
  }

  function updateCartBadge() {
    const badge = $("#cart-badge");
    if (!badge) return;
    const count = cart.count();
    badge.hidden = count === 0;
    badge.textContent = count > 99 ? "99+" : String(count);
    const parent = badge.closest("a");
    if (parent) {
      parent.setAttribute(
        "aria-label",
        count ? `Shopping cart with ${count} item${count === 1 ? "" : "s"}` : "Shopping cart is empty"
      );
    }
  }

  /* ================= Book cover (pure CSS from the XML colours) ================= */
  const TINTS = ["var(--primary-soft)", "var(--mint)", "var(--sky)", "var(--peach)", "var(--pink)", "var(--butter)"];
  const tintFor = (key) => TINTS[[...String(key)].reduce((n, c) => n + c.charCodeAt(0), 0) % TINTS.length];

  function coverHTML(b) {
    return `
      <div class="cover" style="--c1:${esc(b.c1)};--c2:${esc(b.c2)}" role="img" aria-label="Cover of ${esc(b.title)} by ${esc(b.author)}">
        <p class="cover-title">${esc(b.title)}</p>
        <span class="cover-author">${esc(b.author)}</span>
      </div>`;
  }

  const ratingHTML = (b) =>
    `<span class="rating" aria-label="Rated ${b.rating.toFixed(1)} out of 5">${icon("star")}${b.rating.toFixed(1)}</span>`;

  function bookCardHTML(b) {
    const off = b.mrp > b.price ? Math.round((1 - b.price / b.mrp) * 100) : 0;
    const out = b.stock <= 0;
    const stock = out
      ? '<span class="stock stock-out">Out of stock</span>'
      : b.stock <= 5
      ? `<span class="stock stock-low">Only ${b.stock} left</span>`
      : `<span class="stock stock-in">In stock</span>`;
    return `
      <article class="book-card" data-id="${esc(b.id)}">
        <div class="book-card-cover" style="--tint:${tintFor(b.id)}">
          ${coverHTML(b)}
          <div class="book-card-tags">
            <span class="pill">${esc(b.categoryName)}</span>
            ${off && !out ? `<span class="pill pill-solid">${off}% off</span>` : ""}
          </div>
        </div>
        <div class="book-card-body">
          <h3 class="book-card-title"><a href="catalogue.html?q=${encodeURIComponent(b.title)}">${esc(b.title)}</a></h3>
          <p class="book-card-author">${esc(b.author)}</p>
          <p class="book-card-blurb">${esc(b.description)}</p>
          <div class="price-row">
            <span class="price">${money(b.price)}</span>
            ${b.mrp > b.price ? `<span class="price-mrp"><span class="sr-only">was </span>${money(b.mrp)}</span>` : ""}
            ${ratingHTML(b)}
          </div>
          ${stock}
        </div>
        <button class="btn ${out ? "" : "btn-primary"} btn-block" type="button" data-add="${esc(b.id)}" ${out ? "disabled" : ""}>
          ${out ? "Sold out" : `${icon("plus")} Add to cart`}
        </button>
      </article>`;
  }

  function bindAddButtons(root, catalog) {
    root.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-add]");
      if (!btn || btn.disabled) return;
      const b = catalog.byId[btn.dataset.add];
      if (!b) return;
      if (b.stock <= 0) {
        toast(`<strong>${esc(b.title)}</strong> is currently sold out.`);
        return;
      }
      const before = cart.qtyOf(b.id);
      const now = cart.add(b.id, 1, b.stock);
      if (now === before) {
        toast(`That's every copy we have: only <strong>${b.stock}</strong> in stock.`);
      } else {
        toast(`Added <strong>${esc(b.title)}</strong> to your cart &middot; <a href="cart.html">View cart</a>`);
      }
    });
  }

  function showLoadError(container, err) {
    container.innerHTML = `
      <div class="alert alert-error" style="grid-column: 1 / -1;">
        ${icon("alert")}
        <div>
          <strong>Could not load the catalogue.</strong>
          ${esc(err.message)}. Open the site through a web server (for example <code>python -m http.server</code> or GitHub Pages), not as a file:// page.
        </div>
      </div>`;
  }

  const skeletons = (n) =>
    Array.from(
      { length: n },
      () => `
      <div class="skeleton" aria-hidden="true">
        <div class="sk-cover"></div>
        <div class="sk-line"></div>
        <div class="sk-line sk-short"></div>
        <div class="sk-btn"></div>
      </div>`
    ).join("");

  /* ================= Form Validation Helpers ================= */
  function setError(input, message) {
    const err = document.getElementById(input.id + "-error");
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (err) {
      err.innerHTML = message ? `${icon("alert")} ${esc(message)}` : "";
    }
    return !message;
  }

  function wirePasswordToggles() {
    $$(".pw-toggle-btn").forEach((btn) => {
      const targetId = btn.dataset.for;
      const input = document.getElementById(targetId);
      if (!input) return;
      const updateIcon = () => {
        const isShown = input.type === "text";
        btn.innerHTML = icon(isShown ? "eyeOff" : "eye");
        btn.setAttribute("aria-label", isShown ? "Hide password" : "Show password");
      };
      updateIcon();
      btn.addEventListener("click", () => {
        input.type = input.type === "password" ? "text" : "password";
        updateIcon();
      });
    });
  }

  function liveValidate(form, rules) {
    Object.entries(rules).forEach(([id, rule]) => {
      const el = document.getElementById(id);
      if (!el) return;
      let touched = false;
      el.addEventListener("blur", () => {
        touched = true;
        setError(el, rule(el.value, el));
      });
      const recheck = () => {
        if (touched || el.getAttribute("aria-invalid") === "true") {
          setError(el, rule(el.value, el));
        }
      };
      el.addEventListener("input", recheck);
      el.addEventListener("change", recheck);
    });

    return () => {
      let firstBad = null;
      Object.entries(rules).forEach(([id, rule]) => {
        const el = document.getElementById(id);
        if (!el || el.closest("[hidden]")) return;
        const valid = setError(el, rule(el.value, el));
        if (!valid && !firstBad) firstBad = el;
      });
      if (firstBad) firstBad.focus();
      return !firstBad;
    };
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* ================= Pages Dispatch ================= */
  const pages = {};

  /* ---------- Home Page ---------- */
  pages.home = async function () {
    const grid = $("#featured-grid");
    const shelves = $("#shelves-grid");
    const botw = $("#staff-pick");

    if (grid) grid.innerHTML = skeletons(4);

    try {
      const catalog = await getCatalog();
      const featured = catalog.books.filter((b) => b.featured);

      // Book of the week = highest rated featured book in stock
      const pick = featured.filter((b) => b.stock > 0).sort((a, b) => b.rating - a.rating)[0];

      if (grid) {
        const otherFeatured = featured.filter((b) => b !== pick).slice(0, 4);
        grid.innerHTML = otherFeatured.map(bookCardHTML).join("");
        bindAddButtons(grid, catalog);
      }

      if (botw && pick) {
        botw.innerHTML = `
          <div class="pick-card">
            <div class="pick-head">
              <span class="pill pill-butter">${icon("sparkles")} Book of the week</span>
              <span class="pill pill-sky">${esc(pick.categoryName)} &middot; ${pick.pages} pages</span>
            </div>
            <div class="pick-inner">
              <div class="pick-cover">${coverHTML(pick)}</div>
              <div>
                <h2 class="pick-title">${esc(pick.title)}</h2>
                <p class="pick-author">by ${esc(pick.author)}</p>
                <p class="pick-blurb">${esc(pick.description)}</p>
                <div class="price-row">
                  <span class="price">${money(pick.price)}</span>
                  ${pick.mrp > pick.price ? `<span class="price-mrp"><span class="sr-only">was </span>${money(pick.mrp)}</span>` : ""}
                  ${ratingHTML(pick)}
                </div>
                <button class="btn btn-primary" type="button" data-add="${esc(pick.id)}">
                  ${icon("plus")} Add to cart
                </button>
              </div>
            </div>
          </div>`;
        bindAddButtons(botw, catalog);
      }

      if (shelves) {
        const shelfIcons = { fiction: "feather", science: "flask", tech: "cpu", selfhelp: "heart", history: "landmark" };
        const shelfTints = ["var(--primary-soft)", "var(--mint)", "var(--sky)", "var(--peach)", "var(--pink)"];
        shelves.innerHTML = catalog.categories
          .map((c, idx) => {
            const count = catalog.books.filter((b) => b.category === c.id).length;
            return `
              <a class="shelf-tile" href="catalogue.html?cat=${encodeURIComponent(c.id)}" style="--tint:${shelfTints[idx % shelfTints.length]}">
                <span class="shelf-icon" aria-hidden="true">${icon(shelfIcons[c.id] || "book")}</span>
                <span>
                  <span class="shelf-name">${esc(c.name)}</span><br>
                  <span class="shelf-count">${count} book${count === 1 ? "" : "s"}</span>
                </span>
              </a>`;
          })
          .join("");
      }

      const countEl = $("#total-catalog-count");
      if (countEl) countEl.textContent = catalog.books.length;
    } catch (err) {
      if (grid) showLoadError(grid, err);
    }
  };

  /* ---------- Catalogue Page ---------- */
  pages.catalogue = async function () {
    const grid = $("#spinner-grid");
    const chipsContainer = $("#category-filters");
    const searchInput = $("#catalogue-search");
    const sortSelect = $("#catalogue-sort");
    const countEl = $("#catalogue-count");

    const params = new URLSearchParams(location.search);
    const state = {
      q: params.get("q") || "",
      cat: params.get("cat") || "all",
      sort: params.get("sort") || "featured",
    };

    if (searchInput) searchInput.value = state.q;
    if (sortSelect) sortSelect.value = state.sort;
    if (grid) grid.innerHTML = skeletons(8);

    let catalog;
    try {
      catalog = await getCatalog();
    } catch (err) {
      if (grid) showLoadError(grid, err);
      return;
    }

    if (state.cat !== "all" && !catalog.categories.some((c) => c.id === state.cat)) {
      state.cat = "all";
    }

    // Render filter buttons
    if (chipsContainer) {
      chipsContainer.innerHTML = [{ id: "all", name: "All books" }, ...catalog.categories]
        .map(
          (c) =>
            `<button class="chip" type="button" data-cat="${esc(c.id)}" aria-pressed="${c.id === state.cat}">${esc(c.name)}</button>`
        )
        .join("");
    }

    const sorters = {
      featured: (a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating,
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
      title: (a, b) => a.title.localeCompare(b.title),
    };

    function renderList() {
      const q = state.q.trim().toLowerCase();
      const filtered = catalog.books
        .filter((b) => state.cat === "all" || b.category === state.cat)
        .filter(
          (b) =>
            !q ||
            `${b.title} ${b.author} ${b.categoryName} ${b.description}`
              .toLowerCase()
              .includes(q)
        )
        .sort(sorters[state.sort] || sorters.featured);

      if (countEl) {
        countEl.textContent = `Showing ${filtered.length} book${filtered.length === 1 ? "" : "s"}${
          q ? ` for "${state.q.trim()}"` : ""
        }`;
      }

      if (grid) {
        grid.innerHTML = filtered.length
          ? filtered.map(bookCardHTML).join("")
          : `
            <div class="empty">
              <div class="empty-blob">${icon("search")}</div>
              <h2>No books found</h2>
              <p>Nothing matches that search on this shelf. Try another word or show every book.</p>
              <button class="btn btn-soft" type="button" id="btn-clear-filters">Clear filters</button>
            </div>`;
      }

      // Sync URL
      const url = new URL(location.href);
      ["q", "cat", "sort"].forEach((k) => url.searchParams.delete(k));
      if (state.q.trim()) url.searchParams.set("q", state.q.trim());
      if (state.cat !== "all") url.searchParams.set("cat", state.cat);
      if (state.sort !== "featured") url.searchParams.set("sort", state.sort);
      history.replaceState(null, "", url);
    }

    if (chipsContainer) {
      chipsContainer.addEventListener("click", (e) => {
        const chip = e.target.closest("[data-cat]");
        if (!chip) return;
        state.cat = chip.dataset.cat;
        $$(".chip", chipsContainer).forEach((c) =>
          c.setAttribute("aria-pressed", String(c === chip))
        );
        renderList();
      });
    }

    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          state.q = searchInput.value;
          renderList();
        }, 150);
      });
    }

    const searchForm = $("#catalogue-search-form");
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        state.q = searchInput ? searchInput.value : "";
        renderList();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        state.sort = sortSelect.value;
        renderList();
      });
    }

    if (grid) {
      grid.addEventListener("click", (e) => {
        if (e.target.closest("#btn-clear-filters")) {
          state.q = "";
          state.cat = "all";
          if (searchInput) searchInput.value = "";
          if (chipsContainer) {
            $$(".chip", chipsContainer).forEach((c) =>
              c.setAttribute("aria-pressed", String(c.dataset.cat === "all"))
            );
          }
          renderList();
        }
      });
      bindAddButtons(grid, catalog);
    }

    renderList();
  };

  /* ---------- Login Page ---------- */
  pages.login = function () {
    wirePasswordToggles();
    const form = $("#login-form");
    const alertBox = $("#login-alert");
    const nextDestination = safeNext("index.html");

    if (new URLSearchParams(location.search).get("next") === "cart.html") {
      const note = $("#checkout-required-note");
      if (note) note.hidden = false;
    }

    if (new URLSearchParams(location.search).get("registered")) {
      if (alertBox) {
        alertBox.className = "alert alert-success";
        alertBox.innerHTML = `${icon("check")} <span>Account created successfully. Please enter your credentials.</span>`;
        alertBox.hidden = false;
      }
    }

    const current = session.user();
    if (current && alertBox) {
      alertBox.className = "alert alert-info";
      alertBox.innerHTML = `${icon("user")} <span>Currently active session for <strong>${esc(current.email)}</strong>. Logging in will switch accounts.</span>`;
      alertBox.hidden = false;
    }

    const validate = liveValidate(form, {
      email: (v) =>
        !v.trim()
          ? "Please provide your registered email."
          : !EMAIL_RE.test(v.trim())
          ? "Please enter a valid email format (e.g. reader@dogear.test)."
          : "",
      password: (v) => (!v ? "Password cannot be blank." : ""),
    });

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (alertBox) alertBox.hidden = true;
        if (!validate()) return;

        const btn = $("button[type=submit]", form);
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Verifying…";
        }

        const email = $("#email").value.trim().toLowerCase();
        const password = $("#password").value;

        try {
          const xmlUsers = await getXmlUsers().catch(() => []);
          let matched = xmlUsers.find((u) => u.email === email && u.password === password);

          if (!matched) {
            const hash = await sha256(password);
            matched = store.get(KEYS.users, []).find((u) => u.email === email && u.hash === hash);
          }

          if (matched) {
            session.login(matched);
            location.href = nextDestination;
            return;
          }

          if (alertBox) {
            alertBox.className = "alert alert-error";
            alertBox.innerHTML = `${icon("alert")} <span>Invalid email or password. Please verify your credentials or register a new account.</span>`;
            alertBox.hidden = false;
          }
        } catch (err) {
          if (alertBox) {
            alertBox.className = "alert alert-error";
            alertBox.innerHTML = `${icon("alert")} <span>${esc(err.message)}</span>`;
            alertBox.hidden = false;
          }
        } finally {
          if (btn) {
            btn.disabled = false;
            btn.textContent = "Log in";
          }
        }
      });
    }
  };

  /* ---------- Registration Page ---------- */
  pages.register = function () {
    wirePasswordToggles();
    const form = $("#register-form");
    const alertBox = $("#register-alert");
    const pwInput = $("#password");
    const strengthBar = $("#strength-bar");
    const strengthLabel = $("#strength-label");

    function testStrength(v) {
      let score = 0;
      if (v.length >= 8) score++;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
      if (/\d/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      return score;
    }

    if (pwInput && strengthBar && strengthLabel) {
      pwInput.addEventListener("input", () => {
        const s = testStrength(pwInput.value);
        const tiers = [
          ["10%", "var(--danger)", "Too short: use at least 8 characters"],
          ["25%", "var(--danger)", "Weak: mix letters and numbers"],
          ["50%", "#D97706", "Okay"],
          ["75%", "var(--success)", "Good"],
          ["100%", "var(--success)", "Strong"],
        ][s];
        strengthBar.style.width = pwInput.value ? tiers[0] : "0%";
        strengthBar.style.backgroundColor = tiers[1];
        strengthLabel.textContent = pwInput.value
          ? `Strength: ${tiers[2]}`
          : "Use 8+ characters with upper and lower case letters and a number.";
      });
    }

    const validate = liveValidate(form, {
      fullname: (v) =>
        v.trim().length < 3
          ? "Please provide your full legal name (at least 3 letters)."
          : !/^[A-Za-z][A-Za-z .'-]+$/.test(v.trim())
          ? "Name may only contain letters, spaces, dots, or hyphens."
          : "",
      email: (v) =>
        !EMAIL_RE.test(v.trim())
          ? "Please enter a valid email address (e.g. name@example.com)."
          : "",
      phone: (v) =>
        !/^[6-9]\d{9}$/.test(v.replace(/\s+/g, ""))
          ? "Please enter a valid 10-digit mobile number starting with 6-9."
          : "",
      password: (v) =>
        testStrength(v) < 3 || v.length < 8
          ? "Password requires at least 8 characters including uppercase, lowercase, and a number."
          : "",
      confirm: (v) =>
        !v
          ? "Please re-type your password for confirmation."
          : v !== pwInput.value
          ? "Passwords do not match."
          : "",
      address: (v) =>
        v.trim().length < 10
          ? "Please provide complete delivery street address (minimum 10 characters)."
          : "",
      terms: (v, el) =>
        !el.checked ? "You must accept the terms of purchase to create an account." : "",
    });

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (alertBox) alertBox.hidden = true;
        if (!validate()) return;

        const email = $("#email").value.trim().toLowerCase();
        const xmlUsers = await getXmlUsers().catch(() => []);
        const localUsers = store.get(KEYS.users, []);

        if (xmlUsers.some((u) => u.email === email) || localUsers.some((u) => u.email === email)) {
          setError($("#email"), "An account with this email address already exists.");
          $("#email").focus();
          return;
        }

        const newUser = {
          name: $("#fullname").value.trim().replace(/\s+/g, " "),
          email,
          phone: $("#phone").value.replace(/\s+/g, ""),
          address: $("#address").value.trim(),
          hash: await sha256(pwInput.value),
          createdAt: new Date().toISOString(),
        };

        localUsers.push(newUser);
        store.set(KEYS.users, localUsers);
        session.login(newUser);

        toast(`Welcome to Dog-Ear Books, <strong>${esc(newUser.name.split(" ")[0])}</strong>!`);
        setTimeout(() => {
          location.href = safeNext("catalogue.html");
        }, 800);
      });
    }
  };

  /* ---------- Cart & Payment Page ---------- */
  pages.cart = async function () {
    const itemsContainer = $("#cart-items-list");
    const summaryContainer = $("#order-summary-box");
    const checkoutGrid = $("#cart-layout-grid");
    const emptyState = $("#cart-empty-state");

    let catalog;
    try {
      catalog = await getCatalog();
    } catch (err) {
      if (itemsContainer) showLoadError(itemsContainer, err);
      return;
    }

    const getLines = () =>
      cart
        .items()
        .map((i) => {
          const book = catalog.byId[i.id];
          if (!book) return null;
          return {
            ...book,
            qty: Math.min(i.qty, Math.max(book.stock, 0)),
          };
        })
        .filter((line) => line && line.qty > 0);

    function renderCart() {
      const lines = getLines();
      const totals = computeTotals(lines);

      const countHeader = $("#cart-headline-count");
      if (countHeader) {
        countHeader.textContent = lines.length
          ? `${cart.count()} book${cart.count() === 1 ? "" : "s"} in your cart`
          : "Your cart is empty";
      }

      if (!lines.length) {
        if (checkoutGrid) checkoutGrid.hidden = true;
        if (emptyState) emptyState.hidden = false;
        return;
      }

      if (checkoutGrid) checkoutGrid.hidden = false;
      if (emptyState) emptyState.hidden = true;

      if (itemsContainer) {
        itemsContainer.innerHTML = lines
          .map(
            (l) => `
          <div class="line-item" data-id="${esc(l.id)}">
            ${coverHTML(l)}
            <div>
              <h3 class="line-title">${esc(l.title)}</h3>
              <p class="line-meta">${esc(l.author)} &middot; ${money(l.price)} each</p>
              <div class="line-actions">
                <div class="stepper" role="group" aria-label="Quantity of ${esc(l.title)}">
                  <button type="button" class="stepper-btn" data-dec="${esc(l.id)}" aria-label="Decrease quantity" ${l.qty <= 1 ? "disabled" : ""}>${icon("minus")}</button>
                  <output class="stepper-val" aria-live="polite">${l.qty}</output>
                  <button type="button" class="stepper-btn" data-inc="${esc(l.id)}" aria-label="Increase quantity" ${l.qty >= l.stock ? "disabled" : ""}>${icon("plus")}</button>
                </div>
                <button type="button" class="remove-btn" data-remove="${esc(l.id)}" aria-label="Remove ${esc(l.title)} from cart">
                  ${icon("trash")} Remove
                </button>
              </div>
            </div>
            <div class="line-total"><small>Subtotal</small>${money(l.price * l.qty)}</div>
          </div>`
          )
          .join("");
      }

      if (summaryContainer) {
        summaryContainer.innerHTML = `
          <div class="summary-rows">
            <div class="summary-row">
              <span>Subtotal</span>
              <strong>${money(totals.subtotal)}</strong>
            </div>
            <div class="summary-row saving">
              <span>You save (vs MRP)</span>
              <strong>&minus; ${money(totals.savings)}</strong>
            </div>
            <div class="summary-row">
              <span>Delivery</span>
              <strong>${totals.shipping ? money(totals.shipping) : "Free"}</strong>
            </div>
            <div class="summary-row summary-total">
              <span>Total</span>
              <strong>${money(totals.total)}</strong>
            </div>
          </div>
          <div class="ship-note">
            ${icon("truck")}
            <span>${
              totals.shipping
                ? `Add <strong>${money(FREE_SHIP_FROM - totals.subtotal)}</strong> more for free delivery.`
                : "Free delivery unlocked."
            }</span>
          </div>`;
      }

      const payAmt = $("#submit-pay-amount");
      if (payAmt) payAmt.textContent = money(totals.total);
    }

    if (itemsContainer) {
      itemsContainer.addEventListener("click", (e) => {
        const inc = e.target.closest("[data-inc]");
        const dec = e.target.closest("[data-dec]");
        const rem = e.target.closest("[data-remove]");

        if (inc) {
          const book = catalog.byId[inc.dataset.inc];
          if (book) {
            cart.setQty(book.id, Math.min(cart.qtyOf(book.id) + 1, book.stock));
          }
        } else if (dec) {
          const id = dec.dataset.dec;
          cart.setQty(id, Math.max(cart.qtyOf(id) - 1, 1));
        } else if (rem) {
          const book = catalog.byId[rem.dataset.remove];
          if (book) {
            cart.remove(book.id);
            toast(`Removed <strong>${esc(book.title)}</strong> from your cart.`);
          }
        }
        renderCart();
      });
    }

    renderCart();

    /* --- Checkout Form Logic (Requires Logged-In User) --- */
    const user = session.user();
    const loginPrompt = $("#checkout-login-guard");
    const checkoutForm = $("#checkout-payment-form");

    if (!user) {
      if (loginPrompt) loginPrompt.hidden = false;
      if (checkoutForm) checkoutForm.hidden = true;
      return;
    }

    if (loginPrompt) loginPrompt.hidden = true;
    if (checkoutForm) checkoutForm.hidden = false;

    // Pre-fill user information
    const shipName = $("#ship-name");
    const shipPhone = $("#ship-phone");
    const shipAddress = $("#ship-address");
    if (shipName) shipName.value = user.name;
    if (shipPhone) shipPhone.value = user.phone || "";
    if (shipAddress) shipAddress.value = user.address || "";

    const methodRadios = $$("input[name=payment_method]", checkoutForm);
    const updatePaymentPanel = () => {
      const activeMethod = methodRadios.find((r) => r.checked)?.value || "card";
      $$(".method-panel", checkoutForm).forEach((panel) => {
        panel.hidden = panel.dataset.method !== activeMethod;
      });
      const btnLabel = $("#pay-button-action-label");
      if (btnLabel) {
        btnLabel.textContent = activeMethod === "cod" ? "Place order" : "Pay now";
      }
    };
    methodRadios.forEach((r) => r.addEventListener("change", updatePaymentPanel));
    updatePaymentPanel();

    // Card input auto-formatting
    const cardNumInput = $("#card-number");
    if (cardNumInput) {
      cardNumInput.addEventListener("input", (e) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
        e.target.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
      });
    }

    const cardExpInput = $("#card-exp");
    if (cardExpInput) {
      cardExpInput.addEventListener("input", (e) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
        e.target.value = digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
      });
    }

    const cardCvvInput = $("#card-cvv");
    if (cardCvvInput) {
      cardCvvInput.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/\D/g, "").slice(0, 3);
      });
    }

    const luhnCheck = (num) => {
      let sum = 0;
      num.split("").reverse().forEach((ch, idx) => {
        let n = Number(ch);
        if (idx % 2) {
          n *= 2;
          if (n > 9) n -= 9;
        }
        sum += n;
      });
      return sum % 10 === 0;
    };

    const validateCheckout = liveValidate(checkoutForm, {
      "ship-name": (v) => (v.trim().length < 3 ? "Please enter recipient name." : ""),
      "ship-phone": (v) =>
        !/^[6-9]\d{9}$/.test(v.replace(/\s+/g, ""))
          ? "Please enter 10-digit mobile number."
          : "",
      "ship-address": (v) =>
        v.trim().length < 10 ? "Please enter full delivery street address." : "",
      "ship-pin": (v) => (!/^[1-9]\d{5}$/.test(v.trim()) ? "Please enter a valid 6-digit PIN code." : ""),
      "card-number": (v) => {
        const d = v.replace(/\s/g, "");
        if (d.length !== 16) return "Card number must be 16 digits.";
        if (!luhnCheck(d)) return "Card number failed Luhn validation check.";
        return "";
      },
      "card-name": (v) => (v.trim().length < 3 ? "Enter cardholder name as printed on card." : ""),
      "card-exp": (v) => {
        const match = /^(\d{2})\/(\d{2})$/.exec(v);
        if (!match) return "Enter expiry as MM/YY.";
        const month = Number(match[1]);
        const year = Number(match[2]);
        if (month < 1 || month > 12) return "Expiry month must be 01 to 12.";
        const expDate = new Date(2000 + year, month, 1);
        if (expDate <= new Date()) return "Card has expired.";
        return "";
      },
      "card-cvv": (v) => (!/^\d{3}$/.test(v) ? "CVV must be 3 digits." : ""),
      "upi-id": (v) =>
        !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(v.trim()) ? "Please enter a valid UPI ID (e.g. reader@bank)." : "",
    });

    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateCheckout()) return;

      const lines = getLines();
      if (!lines.length) return;

      const totals = computeTotals(lines);
      const chosenMethod = methodRadios.find((r) => r.checked)?.value || "card";
      const submitBtn = $("#btn-place-order");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Placing your order…";
      }

      const now = new Date();
      const eta = new Date(now.getTime() + 4 * 864e5);

      const orderRecord = {
        id: "DOG-" + now.toISOString().slice(2, 10).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000),
        placed: now.toISOString(),
        eta: eta.toISOString(),
        customer: user.email,
        ship: {
          name: $("#ship-name").value.trim(),
          phone: $("#ship-phone").value.trim(),
          address: $("#ship-address").value.trim(),
          pin: $("#ship-pin").value.trim(),
        },
        method: chosenMethod,
        methodLabel:
          chosenMethod === "card"
            ? "Card ending " + $("#card-number").value.replace(/\s/g, "").slice(-4)
            : chosenMethod === "upi"
            ? "UPI · " + $("#upi-id").value.trim()
            : "Cash on Delivery",
        items: lines.map((l) => ({
          id: l.id,
          title: l.title,
          author: l.author,
          price: l.price,
          qty: l.qty,
        })),
        ...totals,
      };

      // Simulated postal dispatch delay
      setTimeout(() => {
        store.set(KEYS.order, orderRecord);
        cart.clear();
        location.href = "confirmation.html";
      }, 750);
    });
  };

  /* ---------- Order Confirmation Page ---------- */
  pages.confirmation = function () {
    const order = store.get(KEYS.order, null);
    const emptyState = $("#confirm-empty-state");
    const receiptBox = $("#confirm-receipt-slip");

    if (!order) {
      if (emptyState) emptyState.hidden = false;
      if (receiptBox) receiptBox.hidden = true;
      return;
    }

    if (emptyState) emptyState.hidden = true;
    if (receiptBox) receiptBox.hidden = false;

    const fmtDate = (iso) =>
      new Date(iso).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });

    const firstName = order.ship?.name ? order.ship.name.split(" ")[0] : "reader";
    const nameEl = $("#confirm-recipient-firstname");
    if (nameEl) nameEl.textContent = firstName;

    const orderIdEl = $("#confirm-order-id");
    if (orderIdEl) orderIdEl.textContent = order.id;

    const dateEl = $("#confirm-order-date");
    if (dateEl) dateEl.textContent = fmtDate(order.placed);

    const etaEl = $("#confirm-order-eta");
    if (etaEl) etaEl.textContent = fmtDate(order.eta);

    const methodEl = $("#confirm-order-method");
    if (methodEl) methodEl.textContent = String(order.methodLabel || "").replace(/&middot;/g, "·");

    const linesContainer = $("#confirm-line-items");
    if (linesContainer && order.items) {
      linesContainer.innerHTML =
        order.items
          .map(
            (i) => `
          <li>
            <span><strong>${esc(i.title)}</strong> &times; ${Number(i.qty) || 0}</span>
            <span>${money(i.price * i.qty)}</span>
          </li>`
          )
          .join("") +
        `
        <li class="muted-row">
          <span>Delivery</span>
          <span>${order.shipping ? money(order.shipping) : "Free"}</span>
        </li>`;
    }

    const totalEl = $("#confirm-order-total");
    if (totalEl) totalEl.textContent = money(order.total);

    const addressEl = $("#confirm-shipping-address");
    if (addressEl && order.ship) {
      addressEl.innerHTML = `
        <strong>${esc(order.ship.name)}</strong><br>
        ${esc(order.ship.address)} &ndash; PIN ${esc(order.ship.pin)}<br>
        Contact: ${esc(order.ship.phone)}`;
    }

    const stampEl = $("#confirm-payment-stamp");
    if (stampEl) {
      stampEl.textContent = order.method === "cod" ? "will be paid on delivery" : "paid";
    }
  };

  /* ================= Startup ================= */
  document.addEventListener("DOMContentLoaded", () => {
    renderChrome();
    const currentPage = document.body.dataset.page;
    const pageHandler = pages[currentPage];
    if (pageHandler) pageHandler();
  });

  window.addEventListener("storage", (e) => {
    if (e.key === KEYS.cart) updateCartBadge();
  });
})();
