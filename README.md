# Palett

Drawing app (brushes, shapes, layers, scroll canvases) with a real backend:
Cloudflare **Pages** (static frontend) + **Pages Functions** (API) + **D1** (SQLite database).

```
public/                 static frontend (served as-is)
  index.html            markup only
  css/styles.css
  js/01…22-*.js         classic scripts, loaded in order (see index.html)
    01-04  canvas engine (state, rendering, pointer input, editor/layers)
    05-06  icons, logo
    07     api.js        fetch wrapper → /api/*
    08-12  helpers, store (data layer), library, "new paintbook", nav
    13-17  legal, account, archive, settings, auth
    18-22  events, sidebar tree, bindings, brush UI, init
functions/api/          Pages Functions = the backend (file path = URL)
  _middleware.js        session check, CSRF/origin check, error handling
  auth/{signup,login,logout}.js
  me.js                 GET/PATCH profile + theme
  archive/{verify,lock,status}.js   "secret folder": bcrypt check + server-side unlock
  books/index.js        GET list / POST create
  books/[id]/index.js   GET open / PUT save / PATCH rename,fav,archive / DELETE
  books/[id]/duplicate.js
src/lib/                shared backend code (not routed)
schema.sql              D1 tables
wrangler.toml           Pages + D1 config
```

## 1. Run locally

```bash
npm install
npx wrangler login                       # once
npx wrangler d1 create palett-db         # prints a database_id
```

Paste that `database_id` into `wrangler.toml`, then:

```bash
npm run db:local        # creates tables in the local D1
npm run dev             # http://localhost:8788
```

## 2. Create the remote tables

```bash
npm run db:remote
```

## 3. Push to GitHub

```bash
git init && git add . && git commit -m "Palett"
git branch -M main
git remote add origin https://github.com/<you>/palett.git
git push -u origin main
```

## 4. Deploy on Cloudflare Pages (gives you `<name>.pages.dev`)

Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → pick the repo.

- Framework preset: **None**
- Build command: *(leave empty)*
- Build output directory: `public`

Save and deploy. Cloudflare builds the `functions/` folder automatically, and
`wrangler.toml` supplies the D1 binding (`DB`). Your URL is
`https://<project-name>.pages.dev`. If the name is taken, Cloudflare adds a suffix.

Every `git push` to `main` redeploys. Other branches get preview URLs.

**Alternative without GitHub integration:** `npm run deploy`
(Note: a Direct Upload project cannot be converted to Git integration later.)

## Already ran the first schema?

Add the new column once (fresh databases don't need this):

```bash
npx wrangler d1 execute palett-db --local  --file=./migrations/001_archive_unlock.sql
npx wrangler d1 execute palett-db --remote --file=./migrations/001_archive_unlock.sql
```

Also run `npm install` again (adds `bcryptjs`).

## Notes

- **Secret folder (archive):** the password is hashed with bcrypt (cost 10, `BCRYPT_COST` in
  `wrangler.toml [vars]` to change) and checked only on the server. A correct password unlocks
  *that session* for 15 minutes (sliding), stored in the `sessions` table. While locked, the API
  never returns archived paintbooks (list/open/save/rename/delete/duplicate all behave as if they
  don't exist). The browser only ever receives `{ ok, expiresAt }`. Guessing is capped at 10 tries per 15 min and 30 failures per 24 h per account (atomic
  counters, so parallel bursts can't slip through). Passwords are 6–72 bytes (a bcrypt limit).
- **bcrypt on the free plan:** bcrypt is CPU-heavy. Cloudflare's free Workers plan allows ~10 ms
  of CPU per request, which bcrypt cost 10 can exceed (error 1102). If you see that, use the paid
  plan or lower `BCRYPT_COST` (minimum 4, weaker).

- Because `wrangler.toml` has `pages_build_output_dir`, it is the source of truth for
  bindings. Do not edit bindings in the dashboard.
- Passwords: PBKDF2-SHA256 (100k iterations, per-user salt). Sessions: random token in an
  HttpOnly, SameSite=Lax cookie (Secure on https); only its SHA-256 is stored.
- Each paintbook is stored as chunked JSON in `book_chunks` (D1 rows max 2 MB). Cap: ~10 MB
  per paintbook, 500 paintbooks per user. Raise/lower in `src/lib/books.js`.
- Saving is manual (Save button / Ctrl+S / "Save before leaving?"), same as the original.
- Back up: `npx wrangler d1 export palett-db --remote --output=backup.sql`
