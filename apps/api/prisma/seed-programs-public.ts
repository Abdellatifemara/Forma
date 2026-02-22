import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface JsonProgram {
  id?: string;
  // snake_case format (popular, advanced, home, etc.)
  name_en?: string;
  name_ar?: string;
  description_en?: string;
  description_ar?: string;
  duration_weeks?: number;
  // camelCase format (extended)
  nameEn?: string;
  nameAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  durationWeeks?: number;
  category?: string;
  difficulty?: string;
  days_per_week?: number;
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
      const parsed = JSON.parse(raw);
      // Handle both flat arrays and { basePrograms: [...] } format
      if (Array.isArray(parsed)) {
        programs = parsed;
      } else if (parsed?.basePrograms && Array.isArray(parsed.basePrograms)) {
        programs = parsed.basePrograms;
      } else {
        console.log(`⚠️  Unrecognized format: ${fileName}`);
        continue;
      }
    } catch {
      console.log(`⚠️  Invalid JSON: ${fileName}`);
      continue;
    }

    console.log(`📂 ${fileName} — ${programs.length} programs`);

    for (const prog of programs) {
      // Normalize both snake_case and camelCase formats
      const nameEn = prog.name_en || prog.nameEn;
      const nameAr = prog.name_ar || prog.nameAr;
      const descEn = prog.description_en || prog.descriptionEn;
      const descAr = prog.description_ar || prog.descriptionAr;
      const weeks = prog.duration_weeks || prog.durationWeeks || 4;

      if (!nameEn) continue;

      // Skip if already exists (by name)
      const existing = await prisma.trainerProgram.findFirst({
        where: { nameEn, trainerId },
      });

      if (existing) {
        totalSkipped++;
        continue;
      }

      await prisma.trainerProgram.create({
        data: {
          trainerId,
          nameEn,
          nameAr: nameAr || null,
          descriptionEn: descEn || null,
          descriptionAr: descAr || null,
          durationWeeks: weeks,
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
