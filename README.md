# VLCP Monorepo

This repository contains:
- `app/` Expo React Native mobile app (customer + seller/godown/delivery/admin role-aware views)
- `backend/` Node.js + Express + Prisma API
- `admin-web/` Next.js admin dashboard scaffold

## 1) Mobile app
```bash
npm install
npm run start
```

## 2) Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

API docs: `http://localhost:4000/docs`

## 3) Admin web
```bash
cd admin-web
npm install
npm run dev
```

Dashboard: `http://localhost:3000/dashboard`

## Notes
- Configure environment variables in `backend/.env`.
- Current mobile app includes fixes for:
  - login validation/token gating
  - order detail navigation
  - cart totals box + UPI action visibility
