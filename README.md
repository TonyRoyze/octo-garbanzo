# Reciptile

Reciptile has a React + TypeScript frontend and a Spring Boot 4 REST API backed by MongoDB.

If you are learning Spring Boot, start with the
[backend beginner guide](backend/BEGINNER_GUIDE.md). It explains the project structure,
the controller-service-repository pattern, the Spring annotations, and what each backend
method does.

## Prerequisites

- Java 21
- Node.js and pnpm
- A MongoDB Atlas cluster

## Run locally

In MongoDB Atlas, create a database user and add your current IP address under **Network Access**. Then create the backend environment file:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and replace the bracketed values in `MONGODB_URI` with the connection details from Atlas. If the password contains characters such as `@`, `:`, `/`, `?`, or `#`, URL-encode it.

Also replace these authentication settings:

- `ADMIN_EMAIL` and `ADMIN_PASSWORD` create the first administrator account on startup.
- `ADMIN_LOCATION` is saved on the seeded administrator but is not required at login.
- `JWT_SECRET` must be a random secret of at least 32 characters and must not be committed.
- `UPLOADTHING_TOKEN` is the v7 server token from **UploadThing dashboard → API Keys → V7**. Keep it in
  `backend/.env`; never expose it through a `VITE_*` variable.
- Customer accounts are created from the cart when a shopper continues to payment.

Start the backend:

```bash
./mvnw spring-boot:run
```

The backend loads `backend/.env` automatically and runs at `http://localhost:8080`. Confirm that Atlas is connected after startup:

```bash
curl http://localhost:8080/actuator/health
```

The response should contain `"status":"UP"`. The `.env` file is git-ignored and must never be committed.

To populate the configured database with demo users, products, and invoices, run
the backend once with `SEED_DATA=true`:

```bash
SEED_DATA=true ./mvnw spring-boot:run
```

The seed is idempotent, so rerunning it will not duplicate records.

Start the frontend in a second terminal from the project root:

```bash
pnpm install
pnpm dev
```

Vite proxies `/api` requests to the backend during development. For a separately hosted backend, set `VITE_API_URL`, for example `VITE_API_URL=https://api.example.com pnpm build`.

For a separately hosted frontend, also set `CORS_ALLOWED_ORIGINS=https://shop.example.com` on the backend. Multiple origins can be comma-separated.

## Product API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/products` | List products; accepts an optional `q` name filter |
| `GET` | `/api/products/{id}` | Get one product |
| `POST` | `/api/products` | Create a product |
| `PUT` | `/api/products/{id}` | Replace a product |
| `DELETE` | `/api/products/{id}` | Delete a product |

Product reads are public. Creating, updating, and deleting products require an admin bearer token.
The admin product form accepts up to four optional JPEG, PNG, WebP, or AVIF images of up to 5 MB
each. The first image is the main storefront image, and the other three appear in the product gallery.
Spring Boot authenticates the admin and prepares each UploadThing upload; the browser then sends the
files directly to UploadThing and saves the returned file keys and URLs with the product in MongoDB.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/uploads/product-images/prepare` | Prepare an admin-only UploadThing image upload |

## Authentication API

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Sign in an admin or customer |
| `POST` | `/api/auth/register` | Create a customer account |
| `POST` | `/api/checkout/prepare` | Validate a signed-in customer before payment |

## Invoice API

All invoice routes require an administrator bearer token.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/invoices` | List saved invoices |
| `GET` | `/api/invoices/{id}` | Get one invoice |
| `POST` | `/api/invoices` | Create an invoice from product IDs and quantities |
| `DELETE` | `/api/invoices/{id}` | Delete an invoice |

The backend snapshots product names and prices when an invoice is created. The admin interface provides a live A4 preview and generates downloadable PDFs in the browser.

Passwords are BCrypt-hashed in MongoDB. The frontend keeps the short-lived bearer token in session storage, so it is cleared when the browser tab closes.

Login requires only email and password. When a customer creates an account, the frontend asks the browser for latitude and longitude. Permission denial, an unsupported browser, or a timeout does not block registration; `browserLocation` is saved as `null` instead.

## Atlas regional distribution

New customer documents can contain a `browserLocation` object with latitude, longitude, and accuracy. The browser does not provide an ISO country code, so the Atlas `location` region remains blank until the application adds a trusted reverse-geocoding or IP-to-country service.

To distribute the `users` collection geographically:

1. Create an Atlas Global Cluster with Atlas-Managed Sharding and configure the required write zones.
2. Convert the captured coordinates to a supported country/subdivision code with a trusted server-side geocoding service.
3. Configure Atlas location mappings for those codes and populate `location` on every user document.
4. Only then add `reciptile.users` as a Global Writes collection with `location` as the required first shard-key field.

Do not shard while customer `location` values are blank. Atlas-managed global collections require every document to contain a supported location value.

Example request body:

```json
{
  "name": "Linen notebook",
  "description": "Hand-bound notebook with recycled paper",
  "price": 12.5,
  "status": "DRAFT"
}
```

Run checks with `pnpm build` and, from `backend/`, `./mvnw test`.
