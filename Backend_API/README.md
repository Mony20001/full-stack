# Skincare Shop API

## Start

Copy `.env.example` to `.env`, set `MONGODB_URI`, then run:

```bash
npm install
npm run dev
```

All JSON endpoints are rooted at `http://localhost:<PORT>/api`. The supplied local
`.env` uses port `5001`, so its endpoints are rooted at `http://localhost:5001/api`.

## Google sign-in

The Admin app uses Google Identity Services: it receives a Google ID token and sends
it to `POST /api/auth/google`, where the API verifies its signature and audience.
Use the **same Web application OAuth client ID** in both places:

```env
# Backend_API/.env
GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com

# Frontend_Admin/.env
VITE_GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

In Google Cloud Console, open **APIs & Services → Credentials → that Web client**
and add these Authorized JavaScript origins for local development:

- `http://localhost:5174`
- `http://127.0.0.1:5174` (only if you open the Admin app with this address)

For a deployed app, add its exact HTTPS origin too, for example
`https://admin.example.com`. Do not add a path such as `/login` and do not add the
API address (`http://localhost:5001`) as a JavaScript origin. If the OAuth consent
screen is in Testing mode, add each tester under **OAuth consent screen → Test users**.

| Resource | Endpoints |
| --- | --- |
| Categories | `GET, POST /categories`; `GET, PATCH, DELETE /categories/:id` |
| Products | `GET, POST /products`; `GET, PATCH, DELETE /products/:id` |
| Inventory | `GET, POST /inventory`; `GET, PATCH, DELETE /inventory/:id` |
| Orders | `GET, POST /orders`; `GET /orders/:id`; `PATCH /orders/:id/status` |
| Deliveries | `GET, POST /deliveries`; `GET, PATCH, DELETE /deliveries/:id` |

List endpoints accept `page`, `limit`, and `search` (categories/products); `GET /orders` also accepts `customer_id`.

### Create a category

```json
POST /api/categories
{ "name": "Serums", "description": "Targeted skincare treatments" }
```

### Create a product

```json
POST /api/products
{ "category_id": "CATEGORY_OBJECT_ID", "name": "Vitamin C Serum", "image": "https://example.com/serum.jpg", "price": 24.99, "stock": 50 }
```

### Create an order

Prices are always taken from the saved products; clients cannot override them. Creating an order decrements product/inventory stock, and changing its status to `cancelled` restores it.

```json
POST /api/orders
{ "customer_id": "USER_OBJECT_ID", "items": [{ "product_id": "PRODUCT_OBJECT_ID", "quantity": 2 }] }
```

### Create a delivery

```json
POST /api/deliveries
{ "order_id": "ORDER_OBJECT_ID", "customer_id": "USER_OBJECT_ID", "carrier": "DHL", "destination": "123 Main St, Bangkok", "est_delivery": "2026-11-07T09:00:00.000Z" }
```
