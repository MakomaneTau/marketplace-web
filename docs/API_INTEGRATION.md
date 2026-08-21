# Marketplace API integration

## Branch

Frontend integration is isolated on `feat/api-integration`. Do not merge it until the API branch has been reviewed and merged first.

## Connected flows

- Authentication: signup, login, refresh, logout, current session, and password recovery.
- Reference data: universities, campuses, and categories.
- Marketplace: catalogue, search, product details, favourites, and product/shop reviews.
- Buyer commerce: delivery or campus-pickup checkout, order history, and completed-order reviews.
- Seller commerce: shop profile/images/pickup areas, inventory CRUD/images, order transitions, dashboard, and analytics.
- Communication: conversations, messages, unread notifications, and mark-all-read.
- Account: buyer/seller profile updates, preferences, and seller verification uploads.

## Run locally

The API and web app are independent packages. Open two PowerShell terminals.

API:

```powershell
cd "C:\Workspace\marketpalce application\marketplace-api"
npm.cmd install
npm.cmd run dev
```

Web:

```powershell
cd "C:\Workspace\marketpalce application\marketplace-web"
Copy-Item .env.example .env.local
npm.cmd install
npm.cmd run dev
```

Open `http://127.0.0.1:3000`. The default API URL is `http://127.0.0.1:4000`; override `NEXT_PUBLIC_API_URL` in `.env.local` when required.

## Validate locally

```powershell
cd "C:\Workspace\marketpalce application\marketplace-api"
npm.cmd test

cd "C:\Workspace\marketpalce application\marketplace-web"
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
```

Manual acceptance should use separate buyer and seller accounts:

1. Sign up and log in as a seller, submit verification, create a shop, select pickup campuses, and publish a product with an image.
2. In a separate browser profile, log in as a buyer, search for the product, save it, message the seller, and place both a delivery and campus-pickup order.
3. As the seller, reply to the message and move the orders from `new` to `preparing`, `ready`, and `completed`.
4. As the buyer, confirm the completed order appears and submit a review; reload the product page to see it.
5. Confirm seller dashboard totals, analytics, notifications, profile edits, and preference toggles persist after reload.

Do not use database reset commands during acceptance: they are destructive and remove local test data.
