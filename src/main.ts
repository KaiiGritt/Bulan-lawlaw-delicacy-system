import { prisma } from "@/app/lib/prisma";

async function main() {
  const users = await prisma.users.findMany();
  console.log(users);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
