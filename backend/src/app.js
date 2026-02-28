require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const openapi = require("./openapi.json");
const swaggerJsdoc = require("swagger-jsdoc");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { authRequired, requireRoles } = require("./auth");
const { canUpdateOrderStatus } = require("./rbac");
const {
  userCreateSchema,
  productCreateSchema,
  orderCreateSchema,
  statusUpdateSchema,
} = require("./validation");

const prisma = new PrismaClient();
const app = express();

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "VLCP API", version: "1.0.0" },
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));
app.use(rateLimit({ windowMs: 60 * 1000, limit: 120 }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));
app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = jwt.sign(
    { role: user.role },
    process.env.JWT_ACCESS_SECRET || "dev_access_secret",
    { subject: user.id, expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { type: "refresh" },
    process.env.JWT_REFRESH_SECRET || "dev_refresh_secret",
    { subject: user.id, expiresIn: "30d" }
  );

  await prisma.authSession.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  res.json({ accessToken, refreshToken, user: { id: user.id, role: user.role, name: user.name } });
});

app.use(authRequired);

app.get("/users/me", async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

app.post("/users", requireRoles("admin"), async (req, res) => {
  const parsed = userCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });

  const payload = parsed.data;
  const passwordHash = payload.password ? await bcrypt.hash(payload.password, 10) : null;

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      passwordHash,
      role: payload.role,
      refundUpiId: payload.refundUpiId,
    },
  });

  await prisma.adminActionLog.create({
    data: {
      adminUserId: req.user.id,
      action: "CREATE_USER",
      entityType: "User",
      entityId: user.id,
      payload: payload,
    },
  });

  res.status(201).json(user);
});

app.post("/sellers", requireRoles("admin"), async (req, res) => {
  const { userId, shopName, sellerUpiId, address, isVerified } = req.body;

  const seller = await prisma.seller.create({
    data: { userId, shopName, sellerUpiId, address, isVerified: !!isVerified },
  });

  await prisma.adminActionLog.create({
    data: {
      adminUserId: req.user.id,
      action: "CREATE_SELLER",
      entityType: "Seller",
      entityId: seller.id,
      payload: req.body,
    },
  });

  res.status(201).json(seller);
});

app.patch("/sellers/:id", requireRoles("seller", "admin"), async (req, res) => {
  const seller = await prisma.seller.findUnique({ where: { id: req.params.id } });
  if (!seller) return res.status(404).json({ message: "Seller not found" });

  if (req.user.role === "seller" && seller.userId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const updated = await prisma.seller.update({ where: { id: req.params.id }, data: req.body });
  res.json(updated);
});

app.post("/products", requireRoles("seller", "admin"), async (req, res) => {
  const parsed = productCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const data = parsed.data;

  if (req.user.role === "seller") {
    const seller = await prisma.seller.findUnique({ where: { id: data.sellerId } });
    if (!seller || seller.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  const product = await prisma.product.create({ data });
  res.status(201).json(product);
});

app.patch("/products/:id", requireRoles("seller", "admin"), async (req, res) => {
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: "Product not found" });

  if (req.user.role === "seller") {
    const seller = await prisma.seller.findUnique({ where: { id: existing.sellerId } });
    if (!seller || seller.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  const product = await prisma.product.update({ where: { id: req.params.id }, data: req.body });
  res.json(product);
});

app.get("/products", async (req, res) => {
  const page = Number(req.query.page || 1);
  const pageSize = Math.min(Number(req.query.pageSize || 20), 100);
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true }, skip, take: pageSize, orderBy: { createdAt: "desc" } }),
    prisma.product.count({ where: { isActive: true } }),
  ]);

  res.json({ items, page, pageSize, total });
});

app.post("/orders", requireRoles("customer", "admin"), async (req, res) => {
  const parsed = orderCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const payload = parsed.data;

  if (req.user.role === "customer" && payload.customerId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const order = await prisma.order.create({
    data: {
      customerId: payload.customerId,
      totalAmount: payload.totalAmount,
      paymentStatus: payload.paymentStatus,
      paymentReceiverType: payload.paymentReceiverType,
      receiverUpiId: payload.receiverUpiId,
      addressId: payload.addressId,
      items: { create: payload.items },
      statusHistory: { create: { status: "PENDING", changedByUserId: req.user.id } },
    },
    include: { items: true },
  });

  res.status(201).json(order);
});

app.get("/orders", async (req, res) => {
  const role = req.user.role;

  if (role === "admin") {
    return res.json(await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } }));
  }

  if (role === "customer") {
    return res.json(await prisma.order.findMany({ where: { customerId: req.user.id }, include: { items: true }, orderBy: { createdAt: "desc" } }));
  }

  if (role === "seller") {
    const seller = await prisma.seller.findUnique({ where: { userId: req.user.id } });
    if (!seller) return res.json([]);

    return res.json(
      await prisma.order.findMany({ where: { items: { some: { sellerId: seller.id } } }, include: { items: true }, orderBy: { createdAt: "desc" } })
    );
  }

  if (role === "godown" || role === "delivery") {
    return res.json(await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } }));
  }

  return res.status(403).json({ message: "Forbidden" });
});

app.patch("/orders/:id/status", async (req, res) => {
  const parsed = statusUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });

  const { status } = parsed.data;
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true } });
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (!canUpdateOrderStatus(req.user.role, order.status, status)) {
    return res.status(403).json({ message: "Role cannot set this status or invalid sequence" });
  }

  if (req.user.role === "seller") {
    const seller = await prisma.seller.findUnique({ where: { userId: req.user.id } });
    if (!seller || !order.items.some((item) => item.sellerId === seller.id)) {
      return res.status(403).json({ message: "Seller not assigned to this order" });
    }
  }

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      status,
      statusHistory: { create: { status, changedByUserId: req.user.id } },
    },
    include: { statusHistory: true },
  });

  res.json(updated);
});

app.get("/orders/:id/history", async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (req.user.role === "customer" && order.customerId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const history = await prisma.orderStatusHistory.findMany({ where: { orderId: req.params.id }, orderBy: { changedAt: "asc" } });
  res.json(history);
});

app.get("/admin/audit-logs", requireRoles("admin"), async (req, res) => {
  const logs = await prisma.adminActionLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  res.json(logs);
});

app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = { app, prisma };
