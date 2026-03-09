import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrossfitWodType, CrossfitScoreType } from '@prisma/client';

interface WodDef {
  name: string;
  type: string;
  description: string;
}

// Classic Girl WODs
const GIRL_WODS: WodDef[] = [
  { name: 'Fran', type: 'FOR_TIME' as const, description: '21-15-9: Thrusters (95/65 lb), Pull-ups' },
  { name: 'Grace', type: 'FOR_TIME' as const, description: '30 Clean & Jerks (135/95 lb)' },
  { name: 'Helen', type: 'FOR_TIME' as const, description: '3 rounds: 400m Run, 21 KB Swings, 12 Pull-ups' },
  { name: 'Diane', type: 'FOR_TIME' as const, description: '21-15-9: Deadlifts (225/155 lb), Handstand Push-ups' },
  { name: 'Elizabeth', type: 'FOR_TIME' as const, description: '21-15-9: Cleans (135/95 lb), Ring Dips' },
  { name: 'Annie', type: 'FOR_TIME' as const, description: '50-40-30-20-10: Double-unders, Sit-ups' },
  { name: 'Karen', type: 'FOR_TIME' as const, description: '150 Wall Balls (20/14 lb)' },
  { name: 'Jackie', type: 'FOR_TIME' as const, description: '1000m Row, 50 Thrusters (45 lb), 30 Pull-ups' },
  { name: 'Isabel', type: 'FOR_TIME' as const, description: '30 Snatches (135/95 lb)' },
  { name: 'Nancy', type: 'FOR_TIME' as const, description: '5 rounds: 400m Run, 15 Overhead Squats (95/65 lb)' },
];

// Classic Hero WODs
const HERO_WODS: WodDef[] = [
  { name: 'Murph', type: 'FOR_TIME' as const, description: '1 mile Run, 100 Pull-ups, 200 Push-ups, 300 Squats, 1 mile Run (20/14 lb vest)' },
  { name: 'DT', type: 'FOR_TIME' as const, description: '5 rounds: 12 Deadlifts, 9 Hang Power Cleans, 6 Push Jerks (155/105 lb)' },
  { name: 'Nate', type: 'AMRAP' as const, description: '20 min AMRAP: 2 Muscle-ups, 4 HSPU, 8 KB Swings (70/53 lb)' },
  { name: 'JT', type: 'FOR_TIME' as const, description: '21-15-9: HSPU, Ring Dips, Push-ups' },
  { name: 'Michael', type: 'FOR_TIME' as const, description: '3 rounds: 800m Run, 50 Back Extensions, 50 Sit-ups' },
];

@Injectable()
export class CrossfitService {
  constructor(private readonly prisma: PrismaService) {}

  // ── WOD of the Day ──────────────────────────────────────────

  getWodOfDay() {
    // Deterministic "random" based on date
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000,
    );
    const allWods = [...GIRL_WODS, ...HERO_WODS];
    const wod = allWods[dayOfYear % allWods.length];
    return {
      ...wod,
      date: today.toISOString().split('T')[0],
      category: GIRL_WODS.includes(wod) ? 'girl' : 'hero',
    };
  }

  getRandomWod(type?: 'girl' | 'hero') {
    const pool = type === 'girl' ? GIRL_WODS : type === 'hero' ? HERO_WODS : [...GIRL_WODS, ...HERO_WODS];
    const wod = pool[Math.floor(Math.random() * pool.length)];
    return {
      ...wod,
      category: GIRL_WODS.includes(wod) ? 'girl' : 'hero',
    };
  }

  // ── Score Logging ───────────────────────────────────────────

  async logScore(
    userId: string,
    data: {
      wodName: string;
      wodType: CrossfitWodType;
      scoreType: CrossfitScoreType;
      scoreValue: number;
      rx?: boolean;
      scaled?: boolean;
      notes?: string;
    },
  ) {
    return this.prisma.crossfitScore.create({
      data: {
        userId,
        wodName: data.wodName,
        wodType: data.wodType,
        scoreType: data.scoreType,
        scoreValue: data.scoreValue,
        rx: data.rx ?? false,
        scaled: data.scaled ?? false,
        notes: data.notes,
      },
    });
  }

  async getScoreHistory(userId: string, wodName?: string) {
    const where: any = { userId };
    if (wodName) where.wodName = wodName;

    const scores = await this.prisma.crossfitScore.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return { scores };
  }

  async getBenchmarkHistory(userId: string) {
    // Get best scores for each benchmark WOD
    const scores = await this.prisma.crossfitScore.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Group by WOD name, find best for each
    const byWod: Record<string, typeof scores> = {};
    scores.forEach(s => {
      if (!byWod[s.wodName]) byWod[s.wodName] = [];
      byWod[s.wodName].push(s);
    });

    const benchmarks = Object.entries(byWod).map(([wodName, entries]) => {
      // For time-based: lower is better. For reps/rounds: higher is better.
      const best = entries[0].scoreType === 'TIME'
        ? entries.reduce((min, e) => e.scoreValue < min.scoreValue ? e : min)
        : entries.reduce((max, e) => e.scoreValue > max.scoreValue ? e : max);

      return {
        wodName,
        bestScore: best.scoreValue,
        scoreType: best.scoreType,
        rx: best.rx,
        date: best.createdAt,
        totalAttempts: entries.length,
        history: entries.slice(0, 5),
      };
    });

    return { benchmarks };
  }

  // ── PR Board ────────────────────────────────────────────────

  async logPR(
    userId: string,
    data: {
      movement: string;
      value: number;
      unit: string;
      notes?: string;
    },
  ) {
    return this.prisma.crossfitPR.create({
      data: {
        userId,
        movement: data.movement,
        value: data.value,
        unit: data.unit,
        notes: data.notes,
      },
    });
  }

  async getPRBoard(userId: string) {
    const prs = await this.prisma.crossfitPR.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Group by movement, keep the best (highest value)
    const byMovement: Record<string, typeof prs> = {};
    prs.forEach(pr => {
      if (!byMovement[pr.movement]) byMovement[pr.movement] = [];
      byMovement[pr.movement].push(pr);
    });

    const board = Object.entries(byMovement).map(([movement, entries]) => {
      const best = entries.reduce((max, e) => e.value > max.value ? e : max);
      return {
        movement,
        bestValue: best.value,
        unit: best.unit,
        date: best.createdAt,
        history: entries.slice(0, 5).map(e => ({
          value: e.value,
          unit: e.unit,
          date: e.createdAt,
          notes: e.notes,
        })),
      };
    });

    return { board };
  }
}
