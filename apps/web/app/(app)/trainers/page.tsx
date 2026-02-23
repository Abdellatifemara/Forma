'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DynamicLink } from '@/components/ui/dynamic-link';
import {
  Award,
  ChevronRight,
  Filter,
  Search,
  Star,
  Users,
  X,
  Flame,
  Crown,
  Dumbbell,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { trainersApi, type Trainer } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const specializations = [
  { value: 'All', en: 'All', ar: 'الكل' },
  { value: 'Weight Loss', en: 'Weight Loss', ar: 'خسارة وزن' },
  { value: 'Muscle Building', en: 'Muscle Building', ar: 'بناء عضلات' },
  { value: 'Strength Training', en: 'Strength Training', ar: 'تمارين قوة' },
  { value: 'HIIT & Cardio', en: 'HIIT & Cardio', ar: 'كارديو و HIIT' },
  { value: 'Bodybuilding', en: 'Bodybuilding', ar: 'كمال أجسام' },
  { value: 'CrossFit', en: 'CrossFit', ar: 'كروس فت' },
  { value: 'Yoga', en: 'Yoga', ar: 'يوجا' },
  { value: 'Sports Performance', en: 'Sports Performance', ar: 'أداء رياضي' },
];

export default function TrainersMarketplacePage() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function loadTrainers() {
      try {
        setIsLoading(true);
        const response = await trainersApi.getMarketplace();
        const raw = response.data || (response as any).trainers || [];
        // Filter out system/bot trainers
        const real = raw.filter((tr: Trainer) => {
          const email = (tr as any).user?.email || '';
          const name = `${tr.user?.firstName || ''} ${tr.user?.lastName || ''}`.toLowerCase();
          return !email.includes('system@') && !name.includes('forma system');
        });
        setTrainers(real);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'LOAD_FAILED');
      } finally {
        setIsLoading(false);
      }
    }
    loadTrainers();
  }, []);

  const filteredTrainers = trainers
    .filter((trainer) => {
      const trainerName = trainer.user?.firstName && trainer.user?.lastName
        ? `${trainer.user.firstName} ${trainer.user.lastName}`
        : trainer.user?.displayName || '';
      const matchesSearch =
        trainerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (trainer.bio || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialization =
        specializationFilter === 'All' ||
        (trainer.specializations || []).some(s =>
          s.toLowerCase().includes(specializationFilter.toLowerCase())
        ) ||
        specializations.some(sp => sp.value === specializationFilter &&
          (trainer.specializations || []).some(s =>
            s.toLowerCase().includes(sp.en.toLowerCase())
          )
        );
      const price = trainer.monthlyPrice || trainer.hourlyRate || 0;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      return matchesSearch && matchesSpecialization && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.averageRating || b.rating || 0) - (a.averageRating || a.rating || 0);
        case 'reviews':
          return (b.totalReviews || b.reviewCount || 0) - (a.totalReviews || a.reviewCount || 0);
        case 'price_low':
          return (a.monthlyPrice || a.hourlyRate || 0) - (b.monthlyPrice || b.hourlyRate || 0);
        case 'price_high':
          return (b.monthlyPrice || b.hourlyRate || 0) - (a.monthlyPrice || a.hourlyRate || 0);
        case 'experience':
          return (b.yearsExperience || b.experience || 0) - (a.yearsExperience || a.experience || 0);
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-lg animate-shimmer" />
          <div className="h-4 w-64 rounded-lg animate-shimmer" />
        </div>
        <div className="h-10 w-full rounded-xl animate-shimmer" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-2xl animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">{isAr ? 'مقدرناش نحمّل المدربين' : 'Failed to load trainers'}</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className={cn('text-2xl font-bold', isAr && 'font-cairo')}>{t.trainers.findTrainer}</h1>
        <p className="text-muted-foreground">{t.trainers.title}</p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t.trainers.searchTrainers}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-primary text-primary-foreground' : ''}
          >
            <Filter className="h-4 w-4 me-2" />
            {t.common.filter}
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.trainers.specialization}</label>
                  <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {specializations.map((spec) => (
                        <SelectItem key={spec.value} value={spec.value}>
                          {isAr ? spec.ar : spec.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.common.sort}</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">{isAr ? 'الأعلى تقييم' : 'Highest Rated'}</SelectItem>
                      <SelectItem value="reviews">{isAr ? 'الأكتر مراجعات' : 'Most Reviews'}</SelectItem>
                      <SelectItem value="price_low">{isAr ? 'السعر: الأقل' : 'Price: Low to High'}</SelectItem>
                      <SelectItem value="price_high">{isAr ? 'السعر: الأعلى' : 'Price: High to Low'}</SelectItem>
                      <SelectItem value="experience">{isAr ? 'الأكتر خبرة' : 'Most Experienced'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t.trainers.priceRange} ({isAr ? 'ج.م/شهر' : 'EGP/mo'}): {priceRange[0]} - {priceRange[1]}
                  </label>
                  <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={5000} step={100} className="mt-6" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => { setSpecializationFilter('All'); setPriceRange([0, 5000]); setSortBy('rating'); }}>
                  <X className="h-4 w-4 me-1" />
                  {isAr ? 'مسح الفلاتر' : 'Reset Filters'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results */}
      {filteredTrainers.length === 0 ? (
        <div className="space-y-4">
          {!searchQuery && specializationFilter === 'All' ? (
            /* Empty marketplace — become first trainer */
            <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-orange-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-purple-500/10" />
              <div className="relative py-16 px-6 text-center">
                <div className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <Crown className="h-10 w-10 text-white" />
                </div>
                <h3 className={cn('text-2xl font-bold mb-3', isAr && 'font-cairo')}>
                  {isAr ? 'كن أول مدرب في فورما!' : "Become Forma's First Trainer!"}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  {isAr
                    ? 'السوق لسه فاضي — سجّل دلوقتي كمدرب معتمد وابدأ استقبل عملاء من أول يوم. عملاءك هياخدوا Premium مجاناً!'
                    : 'The marketplace is brand new — register as a certified trainer and start accepting clients from day one. Your clients get free Premium!'}
                </p>
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25 rounded-xl h-12 px-8" asChild>
                  <Link href="/become-trainer">
                    <Flame className="me-2 h-5 w-5" />
                    {isAr ? 'سجّل كمدرب' : 'Apply as Trainer'}
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">{t.trainers.noTrainers}</h3>
                <p className="text-muted-foreground">{isAr ? 'جرّب تعدّل البحث أو الفلاتر' : 'Try adjusting your search or filters'}</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="grid gap-5">
          {filteredTrainers.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Hero-style Trainer Card ────────────────────────────────
function TrainerCard({ trainer }: { trainer: Trainer }) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const firstName = trainer.user?.firstName || '';
  const lastName = trainer.user?.lastName || '';
  const name = firstName && lastName
    ? `${firstName} ${lastName}`
    : trainer.user?.displayName || firstName || (isAr ? 'مدرب' : 'Trainer');
  const avatarUrl = trainer.user?.avatarUrl || '';
  const isTrusted = trainer.tier === 'TRUSTED_PARTNER';

  const rating = trainer.averageRating ?? trainer.rating ?? 0;
  const reviewCount = trainer.totalReviews ?? trainer.reviewCount ?? 0;
  const experience = trainer.yearsExperience ?? trainer.experience ?? 0;
  const price = trainer.monthlyPrice ?? trainer.hourlyRate ?? 0;
  const clientCount = (trainer as any)._count?.clients ?? 0;

  return (
    <DynamicLink href={`/trainers/${trainer.id}`} className="block group">
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5">
        {/* Background image area */}
        <div className="relative h-48 overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-orange-500/70 to-red-500/60 flex items-center justify-center">
              <Dumbbell className="h-16 w-16 text-white/30" />
            </div>
          )}
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 start-3 flex gap-2">
            {isTrusted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-black shadow-lg">
                <Crown className="h-3 w-3" />
                {isAr ? 'شريك موثوق' : 'Trusted Partner'}
              </span>
            )}
            {experience > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">
                <Award className="h-3 w-3" />
                {experience} {isAr ? 'سنة' : 'yrs'}
              </span>
            )}
          </div>

          {/* Price badge */}
          {price > 0 && (
            <div className="absolute top-3 end-3">
              <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold bg-white/95 dark:bg-black/80 text-foreground shadow-lg">
                {price} <span className="text-xs font-normal text-muted-foreground ms-1">{isAr ? 'ج.م/شهر' : 'EGP/mo'}</span>
              </span>
            </div>
          )}

          {/* Name + rating overlay at bottom of image */}
          <div className="absolute bottom-0 inset-x-0 p-4">
            <h3 className={cn('text-xl font-bold text-white drop-shadow-lg', isAr && 'font-cairo')}>
              {name}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              {rating > 0 && (
                <span className="flex items-center gap-1 text-sm text-white/90">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{rating.toFixed(1)}</span>
                  {reviewCount > 0 && (
                    <span className="text-white/60">({reviewCount})</span>
                  )}
                </span>
              )}
              {clientCount > 0 && (
                <span className="flex items-center gap-1 text-sm text-white/70">
                  <Users className="h-3.5 w-3.5" />
                  {clientCount} {isAr ? 'متدرب' : 'clients'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content below image */}
        <div className="p-4">
          {/* Bio */}
          <p className={cn('text-sm text-muted-foreground line-clamp-2 mb-3', isAr && 'font-cairo')}>
            {trainer.bio || (isAr ? 'مدرب لياقة بدنية معتمد' : 'Certified fitness professional')}
          </p>

          {/* Specializations */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(trainer.specializations || []).slice(0, 4).map((spec) => (
              <span
                key={spec}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
              >
                {spec}
              </span>
            ))}
          </div>

          {/* View Profile CTA */}
          <div className="flex items-center justify-between">
            <span className={cn('text-sm font-medium text-primary', isAr && 'font-cairo')}>
              {isAr ? 'عرض البروفايل' : 'View Profile'}
            </span>
            <ChevronRight className={cn('h-4 w-4 text-primary transition-transform group-hover:translate-x-1', isAr && 'rotate-180 group-hover:-translate-x-1')} />
          </div>
        </div>
      </div>
    </DynamicLink>
  );
}
