import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing Prisma query...');

    const foods = await prisma.food.findMany({
      where: {
        OR: [
          { nameEn: { contains: 'chicken', mode: 'insensitive' } },
          { nameAr: { contains: 'chicken', mode: 'insensitive' } },
          { category: { contains: 'chicken', mode: 'insensitive' } },
        ]
      },
      take: 3
    });

    console.log('SUCCESS! Found', foods.length, 'foods');
    if (foods.length > 0) {
      console.log('First food:', foods[0].nameEn);
    }

    // Test without any filter
    const allFoods = await prisma.food.count();
    console.log('Total foods in DB:', allFoods);

  } catch (error: any) {
    console.log('ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
