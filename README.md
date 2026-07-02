# DistributeIQ — Kirana OS

A mobile-first store operating system for Indian kirana shop owners: one-tap
sales logging, AI bill scanning, shelf-count inventory, and live analytics.
Built with React 19 + TypeScript + Vite, **Firebase Auth (Google)**, and
**Cloud Firestore**.

## Features

- **Google sign-in** (Firebase Auth) with a guided store-setup onboarding that
  pre-loads common Indian SKUs (Maggi, Amul, Parle-G, …).
- **Daily Sales Log** — one-tap counting; saving a log writes a `sale` doc and
  decrements product stock atomically.
- **Shelf Count & Inventory** — category-grouped cards, low-stock flags,
  debounced stock writes, and weekly snapshots.
- **Bill Scanning** — upload → simulated AI parse → review → applies stock to
  Firestore (matched SKUs incremented, unmatched created) in one batch.
- **Live analytics** — Dashboard & Reports compute revenue, units, 7-day trend,
  category mix, top products, recent orders, and inventory health entirely from
  Firestore data.
- **Settings** — editable store profile and preference toggles persisted to
  Firestore; sign-out.

## Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication → Sign-in method →** enable **Google**.
3. **Firestore Database →** create a database (production mode).
4. **Project settings → Your apps → Web app →** copy the config and paste it
   into `.env.local` (template in `.env.example`):

   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

5. Deploy the security rules in `firestore.rules` (each user owns
   `/stores/{uid}` and everything beneath it):

   ```bash
   firebase deploy --only firestore:rules
   ```

6. Add your dev domain (e.g. `localhost`) under **Authentication → Settings →
   Authorized domains** if it isn't already.

Until the env vars are filled in, the app shows a "Connect Firebase" screen
instead of crashing.

## Develop

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
```

## Firestore data model

```
stores/{uid}                         # StoreProfile (name, owner, prefs, onboarded)
stores/{uid}/products/{id}           # Product (stock, price, cost, lowStockAt…)
stores/{uid}/sales/{id}              # Sale (items[], totalUnits, totalValue, date)
stores/{uid}/bills/{id}              # Bill (lines[], total, supplier, date)
stores/{uid}/snapshots/{id}          # Weekly inventory snapshot
```

New stores are seeded with the selected starter catalogue plus ~10 days of
sample sales and a few supplier bills so the analytics are populated on first
login.
