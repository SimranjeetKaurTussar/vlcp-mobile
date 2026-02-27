const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@vlcp.local" },
    update: {},
    create: {
      name: "VLCP Admin",
      email: "admin@vlcp.local",
      role: "admin",
      passwordHash: adminPassword,
    },
  });

  const sellerUser = await prisma.user.upsert({
    where: { email: "seller@vlcp.local" },
    update: {},
    create: {
      name: "Village Seller",
      email: "seller@vlcp.local",
      role: "seller",
      passwordHash: await bcrypt.hash("Seller@123", 10),
    },
  });

  const category = await prisma.category.upsert({
    where: { name: "Vegetables" },
    update: {},
    create: { name: "Vegetables" },
  });

  const seller = await prisma.seller.upsert({
    where: { userId: sellerUser.id },
    update: {},
    create: {
      userId: sellerUser.id,
      shopName: "Green Farm Shop",
      sellerUpiId: "greenshop@upi",
      address: "Rampur, Punjab",
      isVerified: true,
      kycStatus: "APPROVED",
    },
  });

  await prisma.product.upsert({
    where: { id: "seed_product_onion" },
    update: {},
    create: {
      id: "seed_product_onion",
      sellerId: seller.id,
      title: "Fresh Onion",
      description: "Farm fresh onions",
      price: 30,
      stock: 100,
      images: ["https://picsum.photos/300"],
      categoryId: category.id,
      isActive: true,
    },
  });

  // eslint-disable-next-line no-console
  console.log("Seed complete", { adminId: admin.id, sellerId: seller.id });
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
