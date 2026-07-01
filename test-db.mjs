import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
try {
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
  console.log(JSON.stringify(users));
} catch (e) {
  console.error('ERROR:', e.message);
} finally {
  await prisma.$disconnect();
}