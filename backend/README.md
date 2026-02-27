# VLCP Backend (Node.js + Prisma)

## Setup
1. Create `.env` in `backend/`:
   - `DATABASE_URL=postgresql://user:pass@localhost:5432/vlcp`
2. Install deps: `npm install`
3. Generate DB schema:
   - `npx prisma migrate dev --name init`
4. Run server:
   - `npm run dev`

## Auth Model
This backend expects a demo bearer token format:
- `Authorization: Bearer <role>:<userId>`
- Example: `Bearer seller:usr_123`

## Core APIs
- `POST /users` (admin)
- `GET /users/me`
- `POST /sellers` (admin)
- `PATCH /sellers/:id` (seller-owner/admin)
- `POST /products` (seller/admin)
- `PATCH /products/:id` (seller-owner/admin)
- `GET /products`
- `POST /orders` (customer/admin)
- `GET /orders` (role-scoped)
- `PATCH /orders/:id/status` (role-scoped status transition)
- `GET /orders/:id/history`

## Role-based status updates
- seller: `ACCEPTED`, `PACKED`, `READY_FOR_PICKUP`
- godown: `DISPATCHED`
- delivery: `PICKED_UP`, `OUT_FOR_DELIVERY`, `DELIVERED`
- admin: all statuses
- customer: none
