const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authRequired, requireRoles } = require("./auth");
const { canUpdateOrderStatus } = require("./rbac");

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use(authRequired);

// Users
app.post("/users", requireRoles("admin"), async (req, res) => {
  const { name, phone, email, role, refundUpiId } = req.body;
  const user = await prisma.user.create({
    data: { name, phone, email, role, refundUpiId },
  });
  res.status(201).json(user);
});

app.get("/users/me", async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// Sellers
app.post("/sellers", requireRoles("admin"), async (req, res) => {
  const { userId, shopName, sellerUpiId, address, isVerified } = req.body;
  const seller = await prisma.seller.create({
    data: { userId, shopName, sellerUpiId, address, isVerified: !!isVerified },
  });
  res.status(201).json(seller);
});

app.patch("/sellers/:id", requireRoles("seller", "admin"), async (req, res) => {
  const seller = await prisma.seller.findUnique({ where: { id: req.params.id } });
  if (!seller) return res.status(404).json({ message: "Seller not found" });
  if (req.user.role === "seller" && seller.userId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const updated = await prisma.seller.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(updated);
});

// Products
app.post("/products", requireRoles("seller", "admin"), async (req, res) => {
  const { sellerId, title, description, price, stock, images, categoryId, isActive } = req.body;

  if (req.user.role === "seller") {
    const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
    if (!seller || seller.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  const product = await prisma.product.create({
    data: { sellerId, title, description, price, stock, images, categoryId, isActive },
  });
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

app.get("/products", async (_req, res) => {
  const products = await prisma.product.findMany({ where: { isActive: true } });
  res.json(products);
});

// Orders
app.post("/orders", requireRoles("customer", "admin"), async (req, res) => {
  const {
    customerId,
    totalAmount,
    paymentStatus,
    paymentReceiverType,
    receiverUpiId,
    addressId,
    items,
  } = req.body;

  if (req.user.role === "customer" && customerId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const order = await prisma.order.create({
    data: {
      customerId,
      totalAmount,
      paymentStatus,
      paymentReceiverType,
      receiverUpiId,
      addressId,
      items: {
        create: items,
      },
      statusHistory: {
        create: {
          status: "PENDING",
          changedByUserId: req.user.id,
        },
      },
    },
    include: { items: true },
  });

  res.status(201).json(order);
});

app.get("/orders", async (req, res) => {
  const role = req.user.role;

  if (role === "admin") {
    return res.json(await prisma.order.findMany({ include: { items: true } }));
  }

  if (role === "customer") {
    return res.json(
      await prisma.order.findMany({
        where: { customerId: req.user.id },
        include: { items: true },
      })
    );
  }

  if (role === "seller") {
    const seller = await prisma.seller.findUnique({ where: { userId: req.user.id } });
    if (!seller) return res.json([]);

    return res.json(
      await prisma.order.findMany({
        where: { items: { some: { sellerId: seller.id } } },
        include: { items: true },
      })
    );
  }

  if (role === "godown" || role === "delivery") {
    return res.json(await prisma.order.findMany({ include: { items: true } }));
  }

  return res.status(403).json({ message: "Forbidden" });
});

app.patch("/orders/:id/status", async (req, res) => {
  const { status } = req.body;
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true },
  });
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (!canUpdateOrderStatus(req.user.role, status)) {
    return res.status(403).json({ message: "Role cannot set this status" });
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
      statusHistory: {
        create: { status, changedByUserId: req.user.id },
      },
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

  const history = await prisma.orderStatusHistory.findMany({
    where: { orderId: req.params.id },
    orderBy: { changedAt: "asc" },
  });

  res.json(history);
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on :${port}`);
});
