import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface JsonProgram {
  id: string;
  name_en: string;
  name_ar: string;
  category?: string;
  difficulty?: string;
  duration_weeks: number;
  days_per_week?: number;
  description_en: string;
  description_ar: string;
  tags?: string[];
}

const PROGRAM_FILES = [
  'workout-programs-popular.json',
  'workout-programs-advanced.json',
  'workout-programs-home.json',
  'workout-programs-lifestyle.json',
  'workout-programs-endurance.json',
  'workout-programs-more.json',
  'workout-programs-specialty.json',
  'workout-programs-extended.json',
];

async function getOrCreateSystemTrainer(): Promise<string> {
  const SYSTEM_EMAIL = 'system@forma.fitness';

  // Check if system user + trainer profile exists
  let user = await prisma.user.findUnique({
    where: { email: SYSTEM_EMAIL },
    include: { trainerProfile: true },
  });

  if (user?.trainerProfile) {
    return user.trainerProfile.id;
  }

  // Create system user if needed
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: SYSTEM_EMAIL,
        firstName: 'Forma',
        lastName: 'System',
        language: 'en',
        fitnessLevel: 'ADVANCED',
        role: 'ADMIN',
      },
      include: { trainerProfile: true },
    });
  }

  // Create trainer profile
  const profile = await prisma.trainerProfile.create({
    data: {
      userId: user.id,
      bio: 'Forma system trainer — curated workout programs',
      specializations: ['strength', 'hypertrophy', 'calisthenics', 'endurance'],
      yearsExperience: 10,
      monthlyPrice: 0,
      status: 'APPROVED',
      verifiedAt: new Date(),
    },
  });

  return profile.id;
}

async function main() {
  console.log('\n🏋️ SEEDING PUBLIC TEMPLATE PROGRAMS\n');

  const trainerId = await getOrCreateSystemTrainer();
  console.log(`✅ System trainer ID: ${trainerId}\n`);

  const seedDataDir = path.join(__dirname, 'seed-data');
  let totalCreated = 0;
  let totalSkipped = 0;

  for (const fileName of PROGRAM_FILES) {
    const filePath = path.join(seedDataDir, fileName);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${fileName}`);
      continue;
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    let programs: JsonProgram[];
    try {
      programs = JSON.parse(raw);
    } catch {
      console.log(`⚠️  Invalid JSON: ${fileName}`);
      continue;
    }

    if (!Array.isArray(programs)) {
      console.log(`⚠️  Not an array: ${fileName}`);
      continue;
    }

    console.log(`📂 ${fileName} — ${programs.length} programs`);

    for (const prog of programs) {
      // Skip if already exists (by name)
      const existing = await prisma.trainerProgram.findFirst({
        where: { nameEn: prog.name_en, trainerId },
      });

      if (existing) {
        totalSkipped++;
        continue;
      }

      await prisma.trainerProgram.create({
        data: {
          trainerId,
          nameEn: prog.name_en,
          nameAr: prog.name_ar || null,
          descriptionEn: prog.description_en || null,
          descriptionAr: prog.description_ar || null,
          durationWeeks: prog.duration_weeks || 4,
          isTemplate: true,
          status: 'ACTIVE',
          sourceType: 'system',
        },
      });

      totalCreated++;
    }
  }

  console.log(`\n✅ Done! Created: ${totalCreated}, Skipped (existing): ${totalSkipped}`);
  console.log(`📊 Total public programs in DB: ${await prisma.trainerProgram.count({ where: { isTemplate: true, status: 'ACTIVE' } })}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
