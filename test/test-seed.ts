import { PrismaClient } from '@prisma/client';
import { fakeAccounts } from './fakes/fake-accounts';

export async function seed() {
  const client = new PrismaClient();

  try {
    await client.$connect();
    await client.accounts.createMany({
      data: fakeAccounts,
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await client.$disconnect();
  }
}
