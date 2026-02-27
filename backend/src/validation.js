const { z } = require("zod");

const userCreateSchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^\d{10}$/).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["customer", "seller", "godown", "delivery", "admin"]),
  refundUpiId: z.string().optional(),
});

const productCreateSchema = z.object({
  sellerId: z.string().min(2),
  title: z.string().min(2),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  images: z.array(z.string().url()).default([]),
  categoryId: z.string().min(2),
  isActive: z.boolean().optional(),
});

const orderCreateSchema = z.object({
  customerId: z.string().min(2),
  totalAmount: z.number().nonnegative(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).default("PENDING"),
  paymentReceiverType: z.enum(["platform", "godown", "seller"]),
  receiverUpiId: z.string().optional(),
  addressId: z.string().min(2),
  items: z.array(
    z.object({
      productId: z.string().min(2),
      sellerId: z.string().min(2),
      qty: z.number().int().positive(),
      price: z.number().nonnegative(),
    })
  ).min(1),
});

const statusUpdateSchema = z.object({
  status: z.enum([
    "PENDING",
    "ACCEPTED",
    "PACKED",
    "READY_FOR_PICKUP",
    "DISPATCHED",
    "PICKED_UP",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]),
});

module.exports = {
  userCreateSchema,
  productCreateSchema,
  orderCreateSchema,
  statusUpdateSchema,
};
