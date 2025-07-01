import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  await prisma.platform.upsert({
    where: {
      key: "isSetupCompleted",
    },
    update: {},
    create: {
      key: "isSetupCompleted",
      value: "false",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
