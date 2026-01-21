import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Clean up database before tests
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Increase timeout for database operations
jest.setTimeout(30000);
