# VLCP Backend (Production-oriented scaffold)

Express + Prisma + PostgreSQL backend for VLCP multi-role commerce.

## Features
- JWT auth middleware (`access` token) + refresh session persistence
- RBAC for roles: `customer`, `seller`, `godown`, `delivery`, `admin`
- Order status transitions with both **role checks** and **sequence checks**
- Input validation via Zod
- Security middlewares: Helmet, CORS, rate limiting
- API docs at `/docs` (Swagger UI)
- Audit logs (`AdminActionLog`) + order status history
- Pagination support on product listing

## Database schema
See `prisma/schema.prisma`:
- Users
- Sellers
- Categories
- Products
- Orders
- OrderItems
- OrderStatusHistory
- AuthSession
- OtpRequest
- AdminActionLog

## Environment variables
Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vlcp
JWT_ACCESS_SECRET=change_me_access
JWT_REFRESH_SECRET=change_me_refresh
PORT=4000
```

## Run locally
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

## API docs
- Swagger UI: `http://localhost:4000/docs`
- Health: `GET /health`

## Auth usage
Use bearer access token from `POST /auth/login`:

```http
Authorization: Bearer <jwt_access_token>
```

## Tests
```bash
cd backend
npm test
```

## Critical role rules (enforced)
- customer: cannot update order statuses
- seller: can set `ACCEPTED`, `PACKED`, `READY_FOR_PICKUP` in allowed sequence
- godown: can set `DISPATCHED` in allowed sequence
- delivery: can set `PICKED_UP`, `OUT_FOR_DELIVERY`, `DELIVERED` in allowed sequence
- admin: can perform all transitions that satisfy sequence policy
