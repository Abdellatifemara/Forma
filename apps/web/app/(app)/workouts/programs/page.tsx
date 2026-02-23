'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Clock, Calendar, Dumbbell, Flame, Home, Target, Zap, Trophy, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { programsApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ProgramItem {
  id: string;
  nameEn: string;
  nameAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  durationWeeks: number;
  sourceType: string | null;
}

const CATEGORIES = [
  { key: 'all', labelEn: 'All', labelAr: 'الكل', icon: Dumbbell },
  { key: 'strength', labelEn: 'Strength', labelAr: 'قوة', icon: Zap },
  { key: 'hypertrophy', labelEn: 'Hypertrophy', labelAr: 'تضخيم', icon: Flame },
  { key: 'home', labelEn: 'Home', labelAr: 'منزلي', icon: Home },
  { key: 'endurance', labelEn: 'Endurance', labelAr: 'تحمل', icon: Target },
  { key: 'crossfit', labelEn: 'CrossFit', labelAr: 'كروس فيت', icon: Trophy },
] as const;

function getCategoryFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('crossfit') || lower.includes('wod') || lower.includes('metcon')) return 'crossfit';
  if (lower.includes('home') || lower.includes('bodyweight') || lower.includes('no equipment') || lower.includes('band')) return 'home';
  if (lower.includes('endurance') || lower.includes('cardio') || lower.includes('hiit') || lower.includes('run') || lower.includes('marathon')) return 'endurance';
  if (lower.includes('hypertrophy') || lower.includes('size') || lower.includes('mass') || lower.includes('bulk') || lower.includes('bro') || lower.includes('phat') || lower.includes('phul')) return 'hypertrophy';
  if (lower.includes('strength') || lower.includes('power') || lower.includes('531') || lower.includes('5/3/1') || lower.includes('strongman') || lower.includes('gzcl') || lower.includes('starting strength') || lower.includes('madcow') || lower.includes('texas')) return 'strength';
  return 'strength'; // default
}

function getDurationColor(weeks: number): string {
  if (weeks <= 4) return 'text-emerald-600 dark:text-emerald-400';
  if (weeks <= 8) return 'text-blue-600 dark:text-blue-400';
  return 'text-purple-600 dark:text-purple-400';
}

export default function ProgramLibraryPage() {
  const { isRTL } = useLanguage();
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    programsApi.browse()
      .then(data => setPrograms(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = programs;

    if (category !== 'all') {
      result = result.filter(p => getCategoryFromName(p.nameEn) === category);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.nameEn.toLowerCase().includes(q) ||
        (p.nameAr && p.nameAr.includes(q)) ||
        (p.descriptionEn && p.descriptionEn.toLowerCase().includes(q))
      );
    }

    return result;
  }, [programs, category, search]);

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/workouts" className="p-2 -ms-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className={cn('h-5 w-5', isRTL && 'rotate-180')} />
          </Link>
          <div>
            <h1 className={cn('text-lg font-bold', isRTL && 'font-cairo')}>
              {isRTL ? 'مكتبة البرامج' : 'Program Library'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isRTL ? `${programs.length} برنامج متاح` : `${programs.length} programs available`}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-24">
        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isRTL ? 'ابحث عن برنامج...' : 'Search programs...'}
            className={cn(
              'w-full ps-10 pe-4 py-2.5 rounded-xl border bg-muted/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
              isRTL && 'font-cairo text-right'
            )}
          />
        </div>

        {/* Category Filter */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const active = category === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {isRTL ? cat.labelAr : cat.labelEn}
              </button>
            );
          })}
        </div>

        {/* Programs List */}
        {loading ? (
          <div className="mt-6 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-muted animate-shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-16 text-center">
            <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/30" />
            <p className={cn('mt-3 text-muted-foreground', isRTL && 'font-cairo')}>
              {isRTL ? 'مفيش برامج مطابقة' : 'No matching programs'}
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {filtered.map(program => {
              const cat = getCategoryFromName(program.nameEn);
              const catInfo = CATEGORIES.find(c => c.key === cat) || CATEGORIES[0];
              const CatIcon = catInfo.icon;

              return (
                <Link
                  key={program.id}
                  href={`/workouts/programs/${program.id}`}
                  className="block group"
                >
                  <div className="p-4 rounded-2xl border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'mt-0.5 h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0',
                        cat === 'strength' && 'bg-orange-100 dark:bg-orange-950/50',
                        cat === 'hypertrophy' && 'bg-red-100 dark:bg-red-950/50',
                        cat === 'home' && 'bg-green-100 dark:bg-green-950/50',
                        cat === 'endurance' && 'bg-blue-100 dark:bg-blue-950/50',
                        cat === 'crossfit' && 'bg-yellow-100 dark:bg-yellow-950/50',
                      )}>
                        <CatIcon className={cn(
                          'h-5 w-5',
                          cat === 'strength' && 'text-orange-600 dark:text-orange-400',
                          cat === 'hypertrophy' && 'text-red-600 dark:text-red-400',
                          cat === 'home' && 'text-green-600 dark:text-green-400',
                          cat === 'endurance' && 'text-blue-600 dark:text-blue-400',
                          cat === 'crossfit' && 'text-yellow-600 dark:text-yellow-400',
                        )} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className={cn('font-semibold text-sm leading-tight', isRTL && 'font-cairo')}>
                          {isRTL && program.nameAr ? program.nameAr : program.nameEn}
                        </h3>
                        {(isRTL ? program.descriptionAr : program.descriptionEn) && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {isRTL ? program.descriptionAr : program.descriptionEn}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-3">
                          <span className={cn('inline-flex items-center gap-1 text-xs', getDurationColor(program.durationWeeks))}>
                            <Calendar className="h-3 w-3" />
                            {program.durationWeeks} {isRTL ? 'أسبوع' : 'weeks'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {isRTL ? catInfo.labelAr : catInfo.labelEn}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className={cn(
                        'h-4 w-4 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity',
                        isRTL && 'rotate-180'
                      )} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
