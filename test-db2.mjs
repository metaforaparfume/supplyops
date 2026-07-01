import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
try {
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, password: true } });
  for (const u of users) {
    const match = await bcrypt.compare("password123", u.password);
    console.log(`${u.email} (${u.role}): password hash = ${u.password.substring(0,20)}..., match = ${match}`);
  }
} catch (e) {
  console.error('ERROR:', e.message);
} finally {
  await prisma.$disconnect();
}