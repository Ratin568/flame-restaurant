import 'dotenv/config';
import {PrismaPg} from '@prisma/adapter-pg';
import {PrismaClient} from '../src/generated/prisma/client';

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL});
const prisma = new PrismaClient({adapter});

const email = process.argv[2]?.toLowerCase();

if (!email) {
  console.error('Usage: npm run admin:make -- user@example.com');
  process.exit(1);
}

async function main() {
  const user = await prisma.user.findUnique({where: {email}});
  if (!user) {
    console.error(`❌ User not found: ${email} — register first at /register`);
    process.exit(1);
  }
  await prisma.user.update({where: {email}, data: {role: 'ADMIN'}});
  console.log(`✅ ${email} is now ADMIN`);
}

main().catch(console.error).finally(() => prisma.$disconnect());