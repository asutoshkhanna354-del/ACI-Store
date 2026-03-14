# FF Panel Store

## Overview
A fully functional FF Panel selling store for iOS and Android with customer registration, admin management, multi-currency support, UPI + Crypto payments, and PWA install support.

## Architecture
- **Backend**: Node.js + Express 5 (server/index.js on port 5000)
- **Frontend**: React + Vite (client/ directory, built to client/dist/)
- **Database**: PostgreSQL (Neon-backed via DATABASE_URL)
- **Auth**: JWT-based authentication with bcryptjs
- **Currency**: Real-time exchange rates via Frankfurter API (cached 1hr)
- **PWA**: Service worker + manifest for installable app experience

## Project Structure
```
server/
  index.js          - Main Express server
  db.js             - PostgreSQL connection pool
  schema.sql        - Database schema with payment settings
  seed.js           - Initial data seeder
  auth.js           - JWT auth middleware
  routes/
    authRoutes.js   - Login, register, profile
    adminRoutes.js  - Admin CRUD operations
    storeRoutes.js  - Public store, cart, checkout APIs
client/
  public/
    manifest.json   - PWA manifest
    sw.js           - Service worker
    icon-192.png    - PWA icon 192x192
    icon-512.png    - PWA icon 512x512
  src/
    App.jsx         - Main app with routing
    api.js          - API helper functions
    context/
      AuthContext   - JWT auth state
      CartContext   - Shopping cart state
      CurrencyContext - Currency conversion & language selection
    components/
      Navbar        - Nav with logo, currency/language selectors
      Footer        - Site footer
      AdminLayout   - Admin sidebar layout
      Logo          - Custom diamond SVG logo
      InstallPrompt - PWA install banner
    pages/
      Home, Store, Cart, Checkout, MyOrders
    pages/admin/
      Dashboard, Sections, Panels, Orders, Promos, Settings, Users, PaymentOptions
```

## Key Features
- Customer registration/login with Telegram username
- Admin panel (user: admin, pass: admin123)
- Sections and panels management (CRUD)
- Pricing in USD: 1 day, 7 day, 30 day, 60 day durations (admin enters prices in USD, minimum $1)
- Multi-currency display (16 currencies with real-time conversion from USD base)
- IP-based geolocation auto-detects customer region and shows local currency
- Language selector (10 languages with full UI translations)
- Cart with promo code support
- **Payment Methods**:
  - UPI (Indian customers): QR code + UTR verification
  - Crypto (International): BTC and USDT (TRC20/ERC20/BEP20 networks)
- UTR/TxHash submission and manual verification flow
- Order status tracking (pending_payment > pending_verification > approved/rejected > delivered)
- Hybrid delivery system: admin can deliver activation keys, upload files (APKs, certificates, configs), or both
- File upload supports all file types (max 100MB each), with drag-and-drop in admin panel
- Customers can download delivered files from My Orders page
- Store settings (name, description, announcements)
- Admin payment options management (enable/disable UPI/Crypto, set addresses)
- PWA install prompt (Android native, iOS/PC add-to-home-screen instructions)
- Admin-customizable theme color (12 presets + custom color picker, default purple)
- Live particle effects (fire, snow, bubbles, stars, sparkles, matrix rain - admin selectable)
- Promotional banner system (news, discount, event, alert, custom - admin managed)
- All theme/effects/banner changes apply globally to all customers instantly
- Mobile optimized with hamburger nav, safe-area support, reduced-motion accessibility

## Recent Changes
- 2026-02-15: Initial build - complete store with all features
- 2026-02-15: Purple-black theme with breathing effects, mobile optimization
- 2026-02-15: Custom diamond logo, multi-currency, crypto payments, PWA support
- 2026-02-16: Base currency set to USD - admin enters prices in USD ($1 min), auto-converted to customer's local currency
- 2026-02-16: Added IP geolocation (ipwhois.app) to auto-detect customer region and show local currency
- 2026-02-16: Added full UI translations for 10 languages (EN, HI, AR, ES, PT, BN, MS, ID, TL, JA)
- 2026-02-17: Added admin theme customization (12 preset colors + custom color picker)
- 2026-02-17: Added 6 live particle effects (fire, snow, bubbles, stars, sparkles, matrix rain)
- 2026-02-17: Added promotional banner system (news, discount, event, alert, custom types)
- 2026-02-17: Liquid Glass (glassmorphism) UI - all components now translucent with backdrop-blur so particle effects show through

## Development
- Frontend builds to client/dist/ which is served statically by Express
- To rebuild frontend: `npx vite build` (from workspace root)
- Server starts on port 5000
- Prices stored in USD in database, converted client-side using Frankfurter API rates (base=USD)
- IP geolocation via ipwhois.app auto-sets customer currency based on country (fallback: USD)
