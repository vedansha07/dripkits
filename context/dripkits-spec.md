# dripkits — the spec as he gave it

Pasted by him 2026-09-26, verbatim below the rule. This is the source document. `dripkits-plan.md`
says which parts are binding and which are advisory; his words there override anything here.

---

Football Jersey Store — Full Website Spec
One reference doc: sitemap, every page layout, every form field, design system, animation, and performance targets.

1. Sitemap
Home
├─ Shop
│   └─ By Category (26/27, Fan Version, All Interested)
│         ├─ National — Interested-only for now (no live browse yet)
│         └─ Player-tagged browsing (26/27 by player) — Interested-only for now
├─ Product Detail Page (PDP)
├─ Cart (drawer, overlays any page)
├─ Checkout
├─ Fit Profile / Size Quiz
├─ Account
│   ├─ Orders
│   ├─ My Interests (tracked "Interested" requests)
│   ├─ Wishlist
│   └─ Reviews written
├─ Track Order
├─ Contact / Support
└─ Policies (Shipping, Returns/Defect-only, Privacy, T&C)

Admin (separate app)
├─ Dashboard (demand + sales overview)
├─ Products (CRUD, variants, media)
├─ Demand Dashboard (Interested counts, convert to Upcoming)
├─ Orders
├─ Returns/Defect queue
├─ Reviews moderation
└─ Users
2. Page-by-Page Layout
2.1 Home
Zone	Content	Notes
Header	Logo, search bar, cart icon, account icon	Sticky, collapses on scroll-down
Hero	Full-bleed video/motion banner, 1 CTA	Auto-rotates max 3 slides, 5s each
Club picker	Horizontal scroll crests	Tap → filtered PLP
Shop by Player	Avatar row: Messi/Ronaldo/Mbappé/Haaland	Tap → player-tagged PLP
New/26-27 drop row	Product cards, 4-6 items	"View All" → PLP
Trending Interest	Top interested-count products	Amber "Interested" badge
UGC/social proof	Customer photo grid	Pulls from photo reviews
Footer	Nav links, policies, socials, newsletter	
2.2 Product Listing Page (PLP)
Launch scope: no By Club or By Player top-level browsing yet — not enough stock breadth to support it. Nav is Category-only: 26/27, Fan Version, All Interested. National and player-tagged browsing exist only inside the Interested/demand-collection flow for now, and open up as separate browsable sections once stock is confirmed.
Left (desktop) / bottom-sheet (mobile): Filters — Category, Kit type (Home/Away/Third), Size, Availability (In Stock/Interested/Upcoming), Price
Top bar: Sort pills — Popularity / New / Price / Most Wanted
Grid: 2 cols mobile, 4 cols desktop. Each card: image (hover=back view), club badge, name, price or "Interested" badge, size-dot availability, wishlist heart
Infinite scroll, skeleton loaders while fetching
2.3 Product Detail Page (PDP)
Order top to bottom (mobile):

Image gallery (swipeable, pinch-zoom, front/back/detail)
Title + club + kit type + price (or "Interested" state banner)
Size selector (chips) — greyed for unavailable sizes
Fit Finder — collapsed, "Find my size in 10 sec" expand
Buy box — sticky on scroll:
In Stock: Qty + Add to Cart + Buy Now
Interested: Size (required) + "I'm Interested" button, no payment
Upcoming: "Notify Me" + expected date
Out of Stock: greyed CTA + "Notify if restocked"
Complete the Kit (cross-sell rail — shorts/socks/matching player jersey)
Product details accordion (fabric, fit notes, care)
Reviews (photo-first grid, then text)
Related/You may also like
2.4 Cart (drawer)
Line items: image, name, size (editable dropdown), qty stepper, price, remove
Free shipping progress bar
Promo code field
Subtotal → "Checkout" CTA (full width, sticky bottom)
2.5 Checkout (single page, accordion steps)
Contact: Phone (OTP verify) or Email
Shipping address: Pincode (autofill city/state) → Address line 1/2, Landmark, City, State (auto), Pincode
Delivery method: Standard / Express (if offered)
Payment: UPI / Card / Netbanking / COD toggle — payment icons visible
Order summary sidebar (sticky on desktop, collapsible on mobile)
Guest checkout always available — no forced signup
2.6 Fit Profile / Size Quiz (modal or standalone page)
Fields:

Height (cm/ft toggle)
Weight (kg)
Fit preference: Slim / Regular / Loose (radio, illustrated)
Usual size in Nike/Adidas/Puma (optional dropdown) → Output: Recommended size + confidence line + "Save to profile" (auto-fills future PDPs)
2.7 Account → My Interests
List of all "Interested" submissions: product, size, date requested, status (Waiting / Upcoming / Ready to buy)
One-tap "Buy Now" once status flips to Ready
3. Every Form — Field-Level Spec
Interest Request Form (PDP inline)

Size* (chip select) — required
Phone or Email* (prefilled if logged in)
Submit → confirmation toast: "You're #N interested — we'll notify you"
Size Quiz Form

Height* / Weight* / Fit preference* / Brand-size reference (optional)
Checkout Form

Phone* (OTP) or Email*
Full name*
Pincode* → auto city/state
Address line 1*, line 2 (optional), landmark (optional)
Payment method* (radio)
Review Form

Rating* (1-5 stars)
Review text* (min 10 chars)
Photo upload (multi, optional but incentivized)
Video upload (field present, disabled/"coming soon" in v1)
Newsletter/Notify Form

Email or phone only, single field, single submit
Contact/Support Form

Order ID (optional), Issue type (dropdown: Defect / Order issue / Sizing help / Other), Description, Photo upload (required if Defect)
4. Design System
Typography

Headings: condensed/athletic sans (e.g. Bebas Neue, Anton, or similar bold condensed) — jersey-number feel
Body: clean geometric sans (Inter, General Sans)
Scale: 12/14/16/20/28/40px, 8px line-height rhythm
Color

Base: neutral dark/light theme pair (dark mode default optional)
Accent: one primary brand color (pick one — not club colors globally)
Contextual tint: subtle club-color tint on PDP background per club (low opacity, 4-6%)
Status colors: Green = In Stock, Amber = Interested, Blue = Upcoming, Grey = Out of Stock
Spacing/Grid

8px base unit, 4/8/16/24/32/48/64 scale
12-col grid desktop, 4-col mobile
Corner radius: 8px small components, 16px cards
Components

Buttons: filled (primary action), outline (secondary), text (tertiary)
Cards: consistent shadow-sm, hover lift (desktop only)
Badges: pill-shaped, status-colored (In Stock/Interested/Upcoming/Out of Stock)
5. Animation & Micro-interactions
Interaction	Animation	Duration
Page nav (PLP↔PDP)	Fade/slide transition	200-250ms
Scroll reveal (product rows)	Fade + slight upward slide	250-300ms, staggered 50ms/item
Add to cart	Icon "flies" to cart badge, badge pulses	400ms
Wishlist heart	Fill + scale bounce	200ms
Filter drawer/bottom-sheet	Slide up/in	250ms ease-out
Toast notifications	Slide in from top/bottom, auto-dismiss	3s hold
Loading states	Skeleton screens, never blank/spinner-only	—
Rule: transforms/opacity only (GPU-accelerated), test on mid-range Android before shipping any animation.

6. Performance / Speed Targets
Lighthouse mobile: 90+, LCP < 2.5s on 4G, CLS < 0.1, TBT < 200ms
Images: WebP/AVIF, responsive srcset, lazy-load below fold, CDN-served (Cloudflare/S3+CloudFront)
Fonts: subset + font-display: swap, max 2 font families
JS: code-split by route, prefetch PDP on PLP card hover/viewport-enter
Caching: static product data via ISR/CDN edge cache, cart/session client-side only
Monitor: Core Web Vitals via real-user monitoring (Vercel Analytics / GA4), not just lab tests
7. Tech Stack (recommended)
Storefront: Next.js + Tailwind CSS (SSR/ISR for SEO + speed)
Backend/API: Node (NestJS/Express) or FastAPI + PostgreSQL
Admin app: Same backend, separate React app (role-gated) or gated route in same app for v1
Search: Meilisearch or Algolia (instant search-as-you-type)
Media: Cloudflare R2/S3 + CDN
Notifications: WhatsApp Business API (primary, India), email fallback (Resend/SendGrid)
Payments: Razorpay/Cashfree (UPI, cards, COD support)
8. Data Model (core)
Product
 ├─ club, season, kit_type, category, player_tags[]
 ├─ media[] (images, videos)
 └─ Variants (per size)
      ├─ status: in_stock | interested | upcoming | out_of_stock
      ├─ stock_qty
      ├─ interest_count
      └─ InterestRequests[] → user_id, size, timestamp, notified

Order → items[], address, payment_status, fulfillment_status
Review → product_id, rating, text, media[], approved(bool)
User → fit_profile{height, weight, fit_pref, brand_size}, interests[], wishlist[]
