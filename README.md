# JJ Baked Goods

Online storefront and order dashboard for JJ Baked Goods, a bake-to-order home bakery.

- **Customers**: browse the menu, mix concha flavors, pick a bake day and pickup window, and place an order (pay at pickup). English and Spanish.
- **The baker** (`/admin`): orders appear live, grouped by bake day with a bake list (how many of each item and flavor to make); confirm → ready → picked up; edit menu, prices, sold-out; set bake days, cutoffs, pickup windows, and daily limits; see party/custom requests and the "notify me" list; download a QR code for the shop.

Stack: Next.js 16 (App Router) · Supabase (Postgres) · Resend (optional email) · Vercel.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no Supabase keys set, the app runs in **demo mode** and saves everything to `.data/db.json` on your computer. The dev admin password is `bakery`.

```bash
npm test        # scheduling + pricing tests
npm run lint
```

## Go live

1. **Supabase**: create a project at supabase.com. In the SQL editor, run `supabase/schema.sql`, then `supabase/seed.sql`.
2. **Vercel**: import this GitHub repo, then add these environment variables:

| Variable | What it is |
| --- | --- |
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page, `service_role` key. **Server only, never share it.** |
| `ADMIN_PASSWORD` | The baker's dashboard password |
| `SESSION_SECRET` | Any random string of 32+ characters (`openssl rand -base64 48`) |
| `NEXT_PUBLIC_SITE_URL` | The live URL, e.g. `https://jjbakedgoods.com` |
| `BAKERY_TZ` | Bakery timezone, e.g. `America/New_York` (default) |
| `RESEND_API_KEY` | Optional: emails new orders to the baker and receipts to customers |
| `EMAIL_FROM` | Optional: e.g. `JJ Baked Goods <orders@jjbakedgoods.com>` (domain verified in Resend) |

3. Log in at `/admin/settings` and fill in pickup address, payment note, bake days, and the email for order alerts.

## How ordering works

- Customers order for a **bake day**. Orders close `cutoffHours` before that day starts (default 48h), in the bakery's timezone.
- Each bake day takes up to `maxOrdersPerDay` orders. The check and the insert happen in one database transaction (`place_order`), so the last spot can't be double-booked.
- Prices are always recalculated on the server from the menu; the browser never sets a price.
- The pickup address is only shown on the order confirmation page, never publicly.

## Editing content

- Menu items, prices, and descriptions: `/admin/menu`.
- Site copy (English and Spanish): `src/lib/i18n.ts`.
- Product photos: `public/images/menu/`.
- Starting menu for a fresh database: `src/lib/catalog.ts`. Regenerate the SQL with `node scripts/gen-seed.mts`.
