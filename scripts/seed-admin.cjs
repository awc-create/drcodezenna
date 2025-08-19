// scripts/seed-admin.cjs
require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@example.com").toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMeNow!";
  if (!email || !password) {
    console.error("Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD"); process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { role: "admin", passwordHash, name: "Admin" },
    create: { email, role: "admin", passwordHash, name: "Admin" },
  });

  console.log("✅ Admin ready:", email);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
