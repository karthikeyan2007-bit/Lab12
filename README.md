# Lab 12 — Dog-Ear Books

**Dog-Ear Books** is an online bookstore built with HTML, CSS, JavaScript and XML. The book catalogue and the demo account live in **XML files** that the browser loads with `fetch()` and parses with `DOMParser`.

The site is fully static (no build step, no frameworks, every path relative), so it runs on GitHub Pages or any static host.

---

## Pages

| # | Page | File | What it does |
|---|------|------|--------------|
| 1 | Home | `index.html` | Hero with search, "Book of the week" (highest-rated featured book in stock), shelf tiles for each category, staff favourites. |
| 2 | Catalogue | `catalogue.html` | All 16 books from `data/books.xml`; live search, category filter, sorting (price, rating, title), stock-aware add to cart. |
| 3 | Cart & Payment | `cart.html` | Quantity +/− capped at stock, remove, subtotal, MRP savings, delivery (₹49, free from ₹499), delivery address, and payment by card (Luhn check), UPI or cash on delivery. Login is required to pay. |
| 4 | Order confirmation | `confirmation.html` | Order number, dates, items, total, delivery address and payment method (card masked to the last 4 digits). |
| 5 | Log in | `login.html` | Checks `data/users.xml` and accounts registered in this browser; supports `?next=cart.html`. |
| 6 | Register | `register.html` | Name, mobile (10 digits), email, address and password with live validation and a strength meter. Passwords are stored only as SHA-256 hashes (`crypto.subtle`). |

The cart, registered users, the current session and the last order are kept in `localStorage` under keys starting with `dogear.`.

---

## Demo account

From `data/users.xml`:

| Email | Password |
|-------|----------|
| `demo@dogear.test` | `Demo@123` |

### Test payment details
- **Card:** `4111 1111 1111 1111`, any future expiry (e.g. `12/30`), any 3-digit CVV.
- **UPI:** any ID in the form `name@bank`, e.g. `reader@okbank`.
- **Cash on delivery:** no extra details needed.

No real payment is taken. Card numbers and CVVs are never stored.

---

## Run locally

Browsers block `fetch()` on `file://` pages, so serve the folder over HTTP. From inside this folder:

```powershell
python -m http.server 8117
```

Then open <http://localhost:8117>.

## Host on GitHub Pages

Push the folder's contents to the root of a repository, then Settings → Pages → Deploy from a branch → `main` / `(root)`.

---

## How the XML is used

```javascript
fetch("data/books.xml")
  .then((res) => res.text())
  .then((text) => new DOMParser().parseFromString(text, "application/xml"))
  .then((doc) => {
    const books = doc.getElementsByTagName("book");
    // title, author, price, mrp, rating, pages, stock, description, cover colours
  });
```

## Design

- **Style:** claymorphism — soft, rounded "clay" cards with a bright inner highlight and a soft drop shadow, on a lavender background.
- **Colours:** lavender `#F4F1FF` background, indigo ink `#1E1B4B`, violet `#6D28D9` for actions, with mint, sky, peach, pink and butter pastels as tints.
- **Fonts:** Nunito (headings) and DM Sans (body), from Google Fonts.
- **Book covers:** drawn in CSS from each book's `<cover from to>` colours, with a dog-eared top corner.
- **Accessibility:** WCAG AA contrast, visible focus rings, 44px+ touch targets, labelled form fields with inline errors, `prefers-reduced-motion` respected, and no horizontal scrolling from 320px up.
"# Lab12" 
