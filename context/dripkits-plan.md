# dripkits — plan

**Status:** **Live 3D redesign built and verified locally, 2026-10-03 (second pass).** Home is one
real-time WebGL jersey that sews itself together on load and travels the whole page with the scroll
(hero, how claiming works, most wanted, the table, footer), reprinting itself for each kit while the
page atmosphere takes that kit's colours. Lenis smooth scroll; measured 79-90 fps scrolling the
whole page on this laptop on charge. Asset pipeline: `scripts/garment` (pattern + XPBD sim) ->
`pnpm garment:web` (GLB + intro keyframes) and `pnpm kits:render` (kit atlases, via Remotion) ->
`public/models`, `public/kits`; catalogue renders unchanged (`pnpm products:render`). Phase 0 app,
schema and seed unchanged underneath.
**Not deployed:** needs his Vercel and Supabase accounts. Rest of Phase 1 (PLP, PDP, interest form,
auth) not started.

Decisions I took on my own: `decisions-dripkits-plan.md`.
The spec as he pasted it: `dripkits-spec.md`.

---

## His answers — the scope

**2026-09-26**, with the pasted spec:

- "lets plan on this"
- "the ui part i leave on you i want you to be creative and design a cool website you can use 3rd
  elements"
- "you dont have to follow the design prompt listed in the details above"
- "be creative and also you can freely choose tech stack acc to the work we need to do"
- "lets first make the plan"
- "use any dummy images,logos everything in the building process i will give you the exact photos
  glb etc after i am satisfied with your dummy"
- "6 ok" (to: Supabase's table editor is the admin until Phase 4)

**2026-09-27:**

- "i want this to be future proof means in future i would want to add a new category or i want to
  add new products in the existing category i should be able to do that through the admin pannel"
- "razor pay acc we will add at last means get the set up ready or use a demo or dev acc till then
  but i will add my acc details later"
- "go plan files first"
- To the three open questions, later the same day: "1 we can use demo or dev payment setup",
  "2 go with the better one means the quality should not be compromised", "3. for now use the the
  name as the logo(means try designing it properly) , i will provide the correct logo later"
- "ok lets gi" (go: record these)
- "build it"
- After seeing Phase 0: "i am not satisfied with the design you havent used 3d elements for scrolling
  effects , and the background is plain black" + install `greensock/gsap-skills` (scrolltrigger) and
  `gsap three` + "i think a 3d model of a jersey waving with the wind and reacting to the scroll or
  mouse movements and click will look cool i allow you to be creative this is just a suggestion"

- After the cloth-hero pass, with a Nike Air product-page image as reference: "what you designed was
  very basic here is an inspiration image means the tshirt just looks 2d i want a propermoder and
  also be creative with the background and scroll and mouse follow effects / you have full freedom
  to be creative"
- After the parametric-model pass, with a Pinterest board of bright product sites: "what you are
  doing is not looking good at all / first of all the 3rd model should be the center use and make
  real barcelona jersey / and first research properly that how does these cool 3d wesites are made
  and how do they look"
- **2026-10-03:** "download remotion skill so that you can create motion graphics as well / you are
  free to use remotion / you can change the full code base if you want / as its still somedays into
  development even if you fuck it all up i dont care thats why i am giving you full freedom / ...
  https://threeui.com/ https://21st.dev/ ... you can use these to get crazy refrences / dont do
  scroll animations like you are doing / let me tell you hoe to do it / generate a starting image
  then generate an ending image and then generate the animation starting from the starting image and
  leading to the ending image then properly map it according to the scroll and i dont want the
  website to look darkish make it look brighter / ok now go on"
- **2026-10-03, after the sequence hero:** "ok it is cool but the scroll is a bit stuttery / i want
  you to use full motion graphics / and not only rotate or whatever the tshirt on one spot i want it
  to move around the full website / and not only tshirt i an not liking the design as well / find
  other reference from those 2 webites and try using them / and i am talking about the full webite
  design not only the tshirt / you dont have to exactly follow my design commands / i have already
  given you full freedom of designing / if you thing the tshirt does not look cool then fuck it off
  bro / try anything you want just give me that wow element in the design / go on / you can change
  delete update add etc etc anything to the codebase i dont fuckin care bro just give a awsome
  design."

**Read as:** the spec's sitemap, pages, forms, data model and perf targets (§1-3, §5-6, §8) are
binding scope. §4 Design System and §7 Tech Stack are advisory. "3rd elements" = 3D elements.
Everything a shop owner might change is data he edits in admin, never code. **No launch without a
checkout:** Phases 0-2 ship before launch, Razorpay in test mode until his keys arrive. Admin is a
real UI from Phase 2 on, never the table editor. The wordmark is typographic until his logo arrives.

---

## What dripkits is

A demand-first jersey store for India. Fans register interest in kits before stock exists; he sources
against proven demand; then sells. The **Interested mechanic is the business.** Cart, checkout,
reviews are standard e-commerce around it.

Audience: young Indian football fans who wear kits as streetwear. Mobile, Android, 4G, UPI. Name says
it: drip.

---

## Design direction

**Revised again 2026-10-03 (second pass).** He liked the sewn jersey but called the scroll stuttery,
asked for full motion graphics, the shirt moving around the whole site instead of turning on one
spot, and a new design for the whole site from threeui.com and 21st.dev references, with full
freedom. The frame-sequence hero and the yellow field are superseded; their record is in the working
log and the decisions file. His start/end/between method still runs, live, as the intro.

**Design read:** consumer e-commerce for young Indian football fans, in a kit-launch motion-graphics
language: one live product travelling through a bright page, giant type behind it, the colours of
the kit on screen washing the page. React Three Fiber for the jersey, GSAP ScrollTrigger + Lenis for
the choreography, Tailwind v4 + shadcn customised, CSS for entrances.

**Dials** (taste skill, marketing surfaces only): VARIANCE 8 / MOTION 9 / DENSITY 3. Every motion
has a job: the intro tells the made-to-order story, the travel links the sections, the print pass is
the kit change, the counters are the claims.

**References used:** threeui.com product pages (NOEMA: a giant wordmark behind the product; Aurello:
the product's colour washing the page; Moraine 60 and Vow Atelier: live product plus finish
selector). All Pro templates, previews only, and nearly all dark: layouts carried over, palettes did
not. 21st.dev: liquid-glass buttons (the glass header, panels and secondary buttons), the motion
footer (a full-width wordmark), kinetic solid/outline type (the club marquee). Considered and not
used: Works Wheel / 3D carousel for the table, scroll-expansion hero.

**The taste skill governs Home and the brand layer only.** Product grids, checkout and admin follow
e-commerce convention.

### The signature: one jersey, the whole page

- A fixed, full-viewport WebGL layer between the page's giant type (behind) and its foreground (in
  front). The garment is the simulated one (`public/models/jersey.glb`), wearing a kit atlas.
- **On load it sews itself:** the four flat pieces fly in, curl round the body, and keyframes of the
  recorded simulation sew and drape it (the HeroBuild choreography, live, about 3.7 s).
- **Then it follows the scroll:** each section's scroll position is a keyframe of its pose
  (position, size, turn); between keys the pose eases, and the renderer damps toward it so it glides
  even when the wheel steps. The pointer tilts it.
- **Path, desktop:** right of centre in the hero, left with its back turned for how-claiming-works
  (turning to the front over the three steps), centre for most wanted, left beside the table wearing
  whatever card you point at, off the top for the players, then down between the footer links and the
  giant wordmark. Phones: centred poses; it steps away during the table, where the cards carry photos.
- **A kit change is a print pass:** a glowing line runs up the shirt with the new kit printed below
  it. The page atmosphere crossfades to the kit's colours; on the most-wanted wall the club's code
  slides in, in its colour.

### The signature idea: demand as a league table

Kept. The table puts buyable kits first, then ranks the rest by claims; most wanted shows the top
four with their claims size by size.

### Colour

One bright theme: cool light ground, ink for type and primary actions, and colour from the kit on
screen: three soft fields in its colours, crossfaded per kit. No fixed brand accent; the yellow field
is gone. Status: in stock green, upcoming blue, claim open ink, sold out grey.

### Type

Archivo variable: width 125 black for the giant words (DRIPKITS, club codes, player surnames), 116
heavy for headlines, 62 squeezed for counts; Geist Mono for prices and sizes.

### Shape

Interactive = pill, containers 20px, big panels 28px. Glass (a frosted web approximation) only over
the jersey and the atmosphere: header, most-wanted panels, secondary buttons.

### Imagery

Rendered dummy catalogue (14 kits x front, back, detail) plus a texture atlas per kit for the live
jersey. No crests, manufacturer or sponsor marks; our "DK" badge sits where a crest would. Players
are shown by the back of their kit; no photos of people. His real assets replace all of it.

### Wordmark

Typographic, lowercase, Archivo at width 125. Variants on `/design`: a solid, b "kits" outlined, c
condensed caps. Waiting on his pick.

---

## Home (the page the taste skill governs)

Seven zones, seven layout families, none repeated:

1. **Hero**, product over giant type. "You claim it. We make it.", a 19-word line, "Shop the table"
   and "How claiming works". A floating product tag beside the jersey on desktop.
2. **How claiming works**, pinned split: claim your size / we count every claim (live counter) /
   enough claims, we make the run.
3. **Most wanted**, pinned stage: top four by claims, giant club code, claims with a per-size chart,
   "Claim your size".
4. **The table**, sticky split: the jersey on the left wears the card you point at; two-up cards on
   the right; filters All / In stock / Claiming / Dropping soon.
5. **Club marquee**, the page's only marquee: solid and outlined names, leaning with scroll speed.
6. **Shop by player**, asymmetric four-up (a scroll-snap row on phones), kit backs.
7. **Footer**: links, the jersey's landing space, a full-width wordmark.

Reduced motion: no live jersey, no smooth scroll; sections collapse to normal height with still
renders and every step shown.

---

## Store surfaces (e-commerce convention, shadcn customised)

PLP, PDP, cart, checkout, fit quiz, account, track order, support, policies: as spec §2 and §3, with:

- **PDP buy box is a state machine** with exactly four states: `in_stock`, `interested`,
  `upcoming`, `out_of_stock`. One component, one Playwright test per state.
- **Checkout** is guest by default, single page, accordion. Razorpay's hosted modal, never a custom
  card form.
- **Cart** is client-side (zustand + localStorage), merged to the account on login.
- **Every form** is react-hook-form + zod, label above input, error below.

---

## The data-driven rule (his future-proofing)

**If he might ever change it, it is a row, not a constant.** Categories, kit types, seasons, clubs,
players, sizes, statuses, delivery methods: all tables. Nav, filters, PLP and PDP read from them.
Adding "Retro" or "Training" is a form in admin, zero code. Same for products, variants, media.

Admin for these arrives in Phase 2, as a real UI. He never touches the table editor; during Phases 0
and 1, I seed and edit data directly.

---

## Stack

| Layer | Pick | Instead of |
| --- | --- | --- |
| App | Next.js App Router, TypeScript, pnpm. One app; admin is a role-gated route group | Separate NestJS/FastAPI backend: overhead for one developer |
| UI | Tailwind v4, shadcn/ui customised, Phosphor. Motion for small UI states; GSAP ScrollTrigger + Lenis for the scroll choreography | |
| Data | Supabase: Postgres, Auth, Storage, Realtime. Drizzle for schema, migrations, typed queries | Neon + separate auth + separate storage: three services instead of one |
| Payments | Razorpay: UPI, cards, netbanking, COD. **Test mode until his account arrives** | Cashfree |
| Email | Resend. WhatsApp Business API in Phase 5 | WhatsApp first: Meta verification takes weeks |
| Search | Postgres full-text until the catalogue passes ~500 SKUs | Meilisearch/Algolia: overkill at launch |
| Hosting | Vercel, ISR, Speed Insights for real-user Core Web Vitals | |
| 3D | React Three Fiber + drei, lazy, one fixed canvas for the live jersey. Remotion renders the catalogue and the kit atlases | A frame sequence (tried, superseded) |
| Tests | Playwright on the money paths; Lighthouse CI budgets | |

Versions get pinned at scaffold time to whatever is current stable, and recorded in the log.

**Accounts:** Supabase, Vercel, Resend, Razorpay all start on dev/free tiers; ownership transfers to
him later. Razorpay test keys need no KYC; going live is a two-env-var swap.

---

## Phases

**0. Foundation.** Scaffold, tokens, fonts, shadcn base, schema + migrations, seed with dummy data,
Vercel deploy, Playwright smoke. *Done when* the deployed shell renders one seeded product from the DB
in both themes.

**1. Demand loop.** Home (all seven zones, 3D hero as a time-boxed stretch behind a static fallback),
PLP (category-only nav, filters, sort, infinite scroll), PDP (gallery, four-state buy box, Interest
form, Notify Me), email auth, Account → My Interests. **No payments.** *Done when* a fan can find a
kit, register interest, see it in My Interests, and he can see the counts.

**2. Commerce + slim admin.** Cart drawer, guest checkout, Razorpay test mode end to end, orders,
order emails, Track Order, Account → Orders. Plus the first slice of `/admin`: categories, products,
variants, photo upload, status flip. Built on the routes and components Phase 4 extends, not a
throwaway. *Done when* a test payment produces an order, an email and a trackable status, and he
adds a category and a product in it without me.

**Launch** = Phases 0-2 done and his live Razorpay keys in. Not before.

**3. Fit and social.** Size quiz + fit profile, wishlist, photo reviews, fan-photo grid, Complete the
Kit rail, support form, policy pages. *Done when* a review with a photo appears on Home.

**4. Admin, the rest.** Demand dashboard (Interested → Upcoming + notify), orders, defect queue,
review moderation, users. *Done when* he runs a week of the shop without asking me for a query.

**5. Signature and scale.** Per-product 3D, WhatsApp notifications, search service, National and
player browsing, video reviews, RUM-driven tuning.

---

## Data model (outline; the schema lands in Phase 0)

`categories` · `kit_types` · `seasons` · `clubs` · `players` · `sizes` · `products` ·
`product_media` · `product_players` · `variants` (size, status, stock_qty, interest_count) ·
`interest_requests` · `notify_requests` · `profiles` (fit_profile jsonb) · `wishlists` ·
`carts` (server-side copy for logged-in users) · `orders` · `order_items` · `addresses` ·
`payments` · `reviews` · `review_media` · `support_tickets`.

---

## Performance budget (spec §6, adopted; it is right)

Lighthouse mobile 90+. LCP < 2.5s on 4G. CLS < 0.1. TBT < 200ms. WebP/AVIF, `next/image`,
lazy below the fold. Two font families, subset, `swap`. Route-level code splitting, PDP prefetch on
card hover/viewport. ISR for product data. 3D is never on the critical path. Test on a mid-range
Android before any animation ships.

---

## Not in v1

By-club and by-player top-level nav. Express delivery. Phone OTP (email first; SMS costs money).
Video reviews. WhatsApp. Search service. Per-product 3D.

---

## Open — his call

1. **Wordmark:** a, b or c, on `/design`. Not blocking.
2. **Accounts, blocking the deploy:** Supabase (free tier) and Vercel (hobby), created by him so
   ownership is his from day one. He adds me as a collaborator or pastes the keys into `.env.local`.
   Resend and Razorpay can wait for Phase 2.

---

## Working log

### 2026-09-27

- Plan written. Spec saved verbatim to `dripkits-spec.md`. Decisions in
  `decisions-dripkits-plan.md`.
- Plan was first told in chat on the 26th under "just tell dont do"; he answered the questions and
  said "go plan files first". This file is that.
- Same day, later: the three open questions answered. No launch without checkout; slim admin into
  Phase 2 as a real UI; typographic wordmark until his logo. Phases 2 and 4 rewritten, Open emptied.

### 2026-09-27, Phase 0

- "build it" received. Scaffolded at the repo root: Next 16.3.6 (App Router, Cache Components on,
  typed routes), React 19.2, Tailwind 4.3.3, shadcn 4.21 (preset `radix-nova`, icons switched to
  Phosphor 2.1), Motion 13.4, Drizzle 0.45 + postgres-js, zod 4.6, react-hook-form 7.89, zustand 5,
  next-themes, Playwright 1.63 on system Chrome. pnpm 10.24, Node 22.17.
- **Next 16 is not the Next I know.** The generated `AGENTS.md` says so and it is right: `'use cache'`
  + `cacheLife` replace the fetch-cache model, uncached reads must sit in `<Suspense>`, `proxy.ts`
  replaces middleware. The bundled docs live in `node_modules/next/dist/docs/`; read before writing.
  Catalogue reads use `cacheLife("minutes")` + `cacheTag("products")` so admin can revalidate.
- **Local DB:** Docker `dripkits-pg` (postgres:17-alpine), volume `dripkits-pg-data`, host port
  **54329**. Started on 5433 first; migrate failed with no error text and the probe showed
  "password authentication failed": another process on this machine also listens on 5433 and wins
  the connection (native Postgres instances also sit on 5432 and 5434). Moved rather than touched.
  His support-bot containers untouched; its Postgres is on 55500.
- Schema: 14 tables, four-state `variant_status` enum, prices in paise, `interest_count`
  denormalised on the variant. Migration `0000` applied. Seed: 14 products, 84 variants, 10 clubs
  (2 national), 4 players, all imagery picsum, crests null (initials render instead).
- Built: tokens (kit gold = Interested colour, dark default, `.light` panel class, radius rule
  applied at the component level so buttons are pill and inputs 8px), Archivo with the `wdth` axis
  + Geist Mono, wordmark a/b/c, `Crest`, `StatusBadge`, `ProductCard`, `MostWanted` (The Table),
  `FeaturedRail`, home shell, `/design`, `scripts/screenshots.mjs`.
- **Verified:** `pnpm dev` renders `/` and `/design` with real rows; `pnpm build` passes and
  prerenders `/` static with a 1-minute revalidate; `pnpm lint` and `pnpm typecheck` clean; 6
  Playwright smoke tests pass (mobile + desktop); screenshots reviewed in both themes.
- **Fixed after looking:** hero was four lines on desktop (rule is two); status badge overlaid on
  photos was unreadable, moved into the card body; The Table showed zero-interest rows, now
  excluded; first rail image marked `priority` for LCP.
- **Not done:** the Vercel deploy. No accounts exist yet. Phase 0's done-when said "deployed";
  everything but that word is done.

### 2026-09-27, design pass (Phase 1 Home, pulled forward)

- He rejected the Phase 0 look: no 3D, no scroll effects, flat black. Fair; the plan had the visual
  layer in Phase 1 and he is judging the screen. Pulled the seven-zone Home forward.
- **Hero:** a cloth-simulated shirt on a gold rail. CPU Verlet cloth (`src/lib/cloth.ts`, 36x45 on
  desktop, 24x30 on phones), rendered with raw three.js in a dynamic, client-only leaf. The kit is a
  **generated canvas texture** (`src/lib/jersey-texture.ts`): front print (chest wordmark + 10) and
  back print (DRIPKITS + 10) on two meshes sharing one geometry, so the number reads from both
  sides. Wind follows the pointer, pointer speed stiffens it, click gusts. GSAP ScrollTrigger pins
  the section for one viewport and scrubs the rail through a half turn, front to back, while the
  copy drifts up. Reduced motion, save-data or no WebGL gets a still of the same kit and no pin.
- **Depth:** kit-gold radial glow behind the shirt (stronger in dark), a fade into the next section,
  a fixed grain layer above everything at 5-7%. Not a mesh gradient.
- **Zones:** hero, The Table (rows reveal on scroll), 26/27 rail, the single crest marquee, four
  player tiles in a 7/5 + 5/7 grid, "Worn by you" as a designed empty state, footer. Motion handles
  the reveals; GSAP and three never share a tree with it.
- Skills: `gsap-scrolltrigger` installed to `.claude/skills/` (the `skills` CLI targets Claude Code
  correctly with `--agent claude-code`), read in full before the scroll code. Packages: gsap 3.15,
  @gsap/react 2.1, three 0.186, @types/three.
- **Found by looking:** the shirt was invisible in the first capture. Cause: three reads `alphaMap`
  from the **green** channel and the kit body is near-black, so the alpha test discarded it. Fixed
  by using the map's own alpha and no alphaMap. Also: a `max-w-[Nch]` on a wrapper measures in the
  body font, not the headline's (seven-line headline); reveals do not fire in a full-page capture
  unless the tool scrolls first; light-mode glow needed toning down; `THREE.Clock` and
  `PCFSoftShadowMap` are deprecated in 0.186 (`Timer`, `PCFShadowMap`).
- Second look: headline still three lines at 1440 (column widened to 52%, size capped at 6xl). On
  phones the shirt filled the screen behind the copy; I tuned camera values against it twice before
  finding the real cause: `renderer.setSize(w, h, false)` leaves the canvas without CSS size, so on
  a 2.6x phone the canvas was 2.6 times its box and clipped. Fixed by letting `setSize` style the
  canvas; phones (below `lg`) also get a wider lens, the camera back and the rig dropped so the
  whole shirt hangs above the copy. Portrait is decided from the viewport, not the scene box (the
  desktop box is taller than wide too). Favicon added (`src/app/icon.svg`, the rail motif).
- Verified at the end: lint, types, `next build`, 6/6 smoke, captures at rest, mid-pin and end of
  pin on desktop and mobile, both themes.
- Still dummy: kit art, crests, player photos, product photos.

**Next:** he looks at `/` and says what is off. Then the rest of Phase 1: PLP, PDP with the
four-state buy box and Interest form, email auth, My Interests. Still waiting on: wordmark pick,
Supabase + Vercel accounts, the commit block.

### 2026-09-27 to 09-29, two rejected passes and the research

- **Parametric shirt (rejected):** replaced the cloth plane with a lofted torso, sleeves and collar,
  fabric material, swinging hanger, view chips and three colourways, a giant outlined wordmark and
  brushed-stroke background. He: "very basic", "looks 2d", wants a proper model, centred, a real
  Barcelona kit, and research first. Stopped mid-verification at his request.
- **Research, told not built:** live 3D product sites run on a real garment asset (scanned or
  sculpted), centred and large, over a saturated field with giant type; several of his Pinterest
  references are rendered video, not live 3D. Free jersey models checked: Sketchfab (CC-BY, login),
  Poly Pizza (low-poly). Barcelona 26/27 home kit documented from Footy Headlines, SoccerBible and
  Football Shirt Culture. Line drawn and stated: stripes and colours yes, crest and sponsor marks no.
- 09-29: started the local server for him (Docker Desktop was down; started it, then `dripkits-pg`).

### 2026-10-03, the bright rebuild: a jersey sewn into existence

- **Remotion skills** installed project-local (7 of the 12 in `remotion-dev/skills`), read before
  use. Detail in `skills-plan.md`.
- **His method, done literally, but rendered not generated.** No image or video generation tool is
  available in this environment, so start frame, end frame and everything between are rendered
  deterministically in Remotion. Start and end were rendered as stills and reviewed before the
  in-between was rendered. The player accepts any frame source, so AI-generated frames (Kling or Veo
  first/last frame) can drop in later as a video converted to frames.
- **A real garment, built from a sewing pattern** (`scripts/garment/`): front, back and two set-in
  sleeves with a V-neck, the sleeve cap solved to the armhole length; triangulated, rolled around an
  invisible A-pose mannequin (an SDF), and sewn shut by an XPBD cloth solver that records every
  frame. Debugged by rendering the mannequin under the cloth. Found and fixed by measuring: a stuck
  seam (upper chest too flat to hold the V region), the yoke sliding off the shoulders (cloth too
  stretchy: more substeps, two stretch passes, friction from the start), a centre-front pleat
  (panels started too far from the body), an atlas overlap painting sleeve colour onto the hem, and
  an invalid canvas font string that rendered the chest wordmark as a dot.
- **Kit art painted in pattern space**, like sublimation: Barcelona 26/27-style four tonal stripes,
  navy V-neck and cuffs with gold piping, gold name and number in Anton, Senyera blocks under the back
  collar, our "DK" badge where a crest would be. Generalised to 14 club-inspired colourways.
- **Hero sequence** (`remotion/scenes/HeroBuild.tsx`): 150 frames, 1400px, transparent. Pieces fly
  in with a quaternion turn, curl round the body, the recorded sim sews and drapes, it turns to
  three-quarter. Exported cropped to 72% of the square: 5 MB desktop (1200), 2.8 MB phone (720).
- **Site:** `ScrollSequence` player (sticky stage, GSAP ScrollTrigger scrub, frames loaded coarse to
  fine, first frame as the LCP `<img>`, `--p` and `data-step` drive the HTML layers, reduced motion
  gets the finished frame static). Bright tokens, yellow hero field, giant white "26/27" fading in
  with the shirt, three copy steps, overlay header turning solid after the hero, category-only nav.
  Removed: the real-time three.js hero, the theme toggle and dark default, the Motion scroll reveals.
- **Catalogue shots:** 42 renders (14 products x front, back, detail) in 77 s via `@remotion/renderer`
  driven from `scripts/products/render.mts`; the seed now points at them; cards show the back on
  hover, as the spec asks.
- Verified: types, lint (vendored skill examples excluded), captures of hero start, middle and end on
  desktop and phone, the rail, the tiles. Smoke 8/8 (4 tests x phone and desktop: hero and rows,
  scroll paints frames and steps reach 2, reduced motion gets the end frame unpinned, `/design`).
  `next build` passes; `/` static, 1m revalidate. Final hero export: 150 frames, crop 57% of the
  square, 4.9 MB at 1200 and 2.8 MB at 720.

**Next:** he reviews `/`. Then the rest of Phase 1: PLP, PDP with the four-state buy box and the
interest form, email auth, My Interests. Still owed by him: wordmark pick, Supabase + Vercel
accounts, the commit block.

### 2026-10-03, second pass: one live jersey for the whole page

- **His feedback** (verbatim in His answers): stuttery scroll, full motion graphics, the shirt moving
  around the whole site, the whole design redone from threeui.com and 21st.dev, full freedom.
- **Research:** threeui.com landing pages (screenshots of Moraine 60, NOEMA N1, Aurello, Tandem, Nexus
  Pro X, AUBE; all Pro, previews only) and the 21st.dev catalogue (hero, scroll-area, shaders,
  backgrounds, text, gallery). What was taken: Design direction, References.
- **Built:** `scripts/garment/export-web.ts` (`pnpm garment:web`: jersey.glb 293 KB, intro data
  313 KB gzipped), a `KitAtlas` Remotion still + `scripts/kits/render.mts` (`pnpm kits:render`: 14
  kit atlases at 2048 and 1024 plus the knit tile, 1.2 MB in all), the stage
  (`src/components/stage`: pose store, real-time intro, kit material with the print pass, R3F canvas,
  loader), Lenis (`src/components/motion`), the new home (`src/components/home`: hero, how it works,
  most wanted, the table, marquee, players, choreography), glass header, wordmark footer, tokens,
  `/design`, smoke tests. Removed: the frame-sequence player, its 300 frames and export script, the
  old hero, rail, fan-photo and player-tile components.
- **Stutter, measured and fixed.** First build: 51 fps (dev) and 41 fps (production) wheel-scrolling.
  Variants isolated it: tweening the kit colour variables on :root restyled the whole document every
  frame (frozen: 56 to 79 fps); replaced by an atmosphere crossfade. Then a 2048 px texture upload
  cost 67-79 ms (raw-pixel decode: 34-56 ms; all of the page's kits now upload before the jersey
  appears), the intro's normals made 22 ms frames (typed-array normals: 90 fps), and links to unbuilt
  pages prefetched 404s mid-scroll (prefetch off). Result, production build, this laptop on charge:
  wheel-scrolling the whole page from one second after load, 79-90 fps, 0-2 % slow frames, worst
  frame 44 ms (the display runs at 90 Hz).
- **Battery note:** at 9 % battery Chrome's energy saver capped the page at 30 fps (every frame
  34 ms); with the saver off, 72-84 fps on the same battery. Below 20 % battery, judge smoothness on
  charge.
- **Verified:** typecheck, lint, `next build` (`/` static, 1 m revalidate), smoke 8/8 on phone and
  desktop, screenshots of every section on both, the intro and a print pass captured mid-motion.
- **Not verified:** a real mid-range Android, which the performance budget asks for before animation
  ships. Phone checks were an emulated Pixel 7 viewport on this laptop's GPU.
- **Started:** Docker Desktop (it was not running) and `dripkits-pg` only.

**Next:** he reviews `/` (production build on :3100 for real speed; dev on :3000). Then the rest of
Phase 1: PLP, PDP with the four-state buy box and the interest form, email auth, My Interests. Still
owed by him: wordmark pick, Supabase + Vercel accounts, the commit block.
