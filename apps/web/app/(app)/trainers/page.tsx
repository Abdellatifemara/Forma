'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  ChevronRight,
  Filter,
  MapPin,
  Search,
  Star,
  Users,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function loadTrainers() {
      try {
        setIsLoading(true);
        const response = await trainersApi.getMarketplace();
        setTrainers(response.data || (response as any).trainers || []);
      } catch (err) {
        // Error handled
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

  // Trusted Partners first, then top-rated, then rest
  const trustedPartners = filteredTrainers.filter((tr) => tr.tier === 'TRUSTED_PARTNER');
  const featuredTrainers = filteredTrainers.filter((tr) => tr.tier !== 'TRUSTED_PARTNER' && (tr.verified || tr.verifiedAt) && (tr.averageRating || tr.rating || 0) >= 4.5);
  const regularTrainers = filteredTrainers.filter((tr) => !trustedPartners.includes(tr) && !featuredTrainers.includes(tr));

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-lg animate-shimmer" />
          <div className="h-4 w-64 rounded-lg animate-shimmer" />
        </div>
        <div className="h-10 w-full rounded-xl animate-shimmer" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-2xl border border-border/60 bg-white dark:bg-card p-5">
              <div className="flex gap-4">
                <div className="h-16 w-16 rounded-full animate-shimmer flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 rounded animate-shimmer" />
                  <div className="h-3 w-24 rounded animate-shimmer" />
                  <div className="h-4 w-full rounded animate-shimmer" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded-full animate-shimmer" />
                    <div className="h-6 w-20 rounded-full animate-shimmer" />
                  </div>
                </div>
              </div>
            </div>
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
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t.trainers.findTrainer}</h1>
        <p className="text-muted-foreground">
          {t.trainers.title}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t.trainers.searchTrainers}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
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

        {/* Expandable Filters */}
        {showFilters && (
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.trainers.specialization}</label>
                  <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">{isAr ? 'الأعلى تقييم' : 'Highest Rated'}</SelectItem>
                      <SelectItem value="reviews">{isAr ? 'الأكتر مراجعات' : 'Most Reviews'}</SelectItem>
                      <SelectItem value="price_low">{isAr ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</SelectItem>
                      <SelectItem value="price_high">{isAr ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</SelectItem>
                      <SelectItem value="experience">{isAr ? 'الأكتر خبرة' : 'Most Experienced'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t.trainers.priceRange} ({isAr ? 'ج.م/ساعة' : 'EGP/hour'}): {priceRange[0]} - {priceRange[1]}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={500}
                    step={25}
                    className="mt-6"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSpecializationFilter('All');
                    setPriceRange([0, 500]);
                    setSortBy('rating');
                  }}
                >
                  <X className="h-4 w-4 me-1" />
                  {isAr ? 'مسح الفلاتر' : 'Reset Filters'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {isAr
          ? `تم العثور على ${filteredTrainers.length} مدرب`
          : `${filteredTrainers.length} trainer${filteredTrainers.length !== 1 ? 's' : ''} found`}
      </p>

      {/* No Trainers Found */}
      {filteredTrainers.length === 0 && (
        <div className="space-y-4">
          {/* Become first trainer CTA */}
          {!searchQuery && specializationFilter === 'All' && (
            <Card className="border-2 border-dashed border-forma-orange/30 bg-gradient-to-br from-forma-orange/5 to-orange-500/5">
              <CardContent className="py-10 text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-forma-orange/10 flex items-center justify-center">
                  <Award className="h-8 w-8 text-forma-orange" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {isAr ? 'كن أول مدرب في فورما!' : "Become Forma's First Trainer!"}
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                  {isAr
                    ? 'السوق لسه فاضي — سجّل دلوقتي كمدرب معتمد وابدأ استقبل عملاء من أول يوم.'
                    : 'The marketplace is brand new — register now as a certified trainer and start accepting clients from day one.'}
                </p>
                <Button className="bg-forma-orange hover:bg-forma-orange/90 text-white" asChild>
                  <Link href="/become-trainer">
                    <Star className="me-2 h-4 w-4" />
                    {isAr ? 'سجّل كمدرب' : 'Apply as Trainer'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
          {(searchQuery || specializationFilter !== 'All') && (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">{t.trainers.noTrainers}</h3>
                <p className="text-muted-foreground">
                  {isAr ? 'جرّب تعدّل البحث أو الفلاتر' : 'Try adjusting your search or filters'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Trusted Partners */}
      {trustedPartners.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            {isAr ? 'شركاء موثوقين' : 'Trusted Partners'}
          </h2>
          <p className="text-sm text-muted-foreground -mt-2">{isAr ? 'مدربين مميزين - عملاءهم بياخدوا Premium مجاناً' : 'Premium trainers - their clients get free Premium access'}</p>
          <div className="grid gap-4 md:grid-cols-2">
            {trustedPartners.map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} trusted />
            ))}
          </div>
        </div>
      )}

      {/* Featured Trainers */}
      {featuredTrainers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            {isAr ? 'أعلى المدربين تقييماً' : 'Top Rated Trainers'}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {featuredTrainers.map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} featured />
            ))}
          </div>
        </div>
      )}

      {/* All Trainers */}
      {regularTrainers.length > 0 && (
        <div className="space-y-4">
          {featuredTrainers.length > 0 && (
            <h2 className="text-lg font-semibold">{isAr ? 'كل المدربين' : 'All Trainers'}</h2>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {regularTrainers.map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TrainerCard({ trainer, featured = false, trusted = false }: { trainer: Trainer; featured?: boolean; trusted?: boolean }) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const name = trainer.user?.firstName && trainer.user?.lastName
    ? `${trainer.user.firstName} ${trainer.user.lastName}`
    : trainer.user?.displayName || (isAr ? 'مدرب' : 'Trainer');
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const isTrusted = trusted || trainer.tier === 'TRUSTED_PARTNER';

  // Normalize backend field names
  const rating = trainer.averageRating ?? trainer.rating ?? 0;
  const reviewCount = trainer.totalReviews ?? trainer.reviewCount ?? 0;
  const experience = trainer.yearsExperience ?? trainer.experience ?? 0;
  const price = trainer.monthlyPrice ?? trainer.hourlyRate ?? 0;

  return (
    <Link href={`/trainers/${trainer.id}`}>
      <Card className={`cursor-pointer transition-all hover:border-primary/50 ${isTrusted ? 'border-amber-500/40 bg-amber-500/5' : featured ? 'border-yellow-500/30 bg-yellow-500/5' : ''}`}>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/30">
              <AvatarImage src={trainer.user?.avatarUrl || undefined} />
              <AvatarFallback className="text-lg bg-primary text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{name}</h3>
                {isTrusted && (
                  <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/50">
                    <Award className="h-3 w-3 me-1" />
                    {isAr ? 'شريك موثوق' : 'Trusted Partner'}
                  </Badge>
                )}
                {featured && !isTrusted && (
                  <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/50">
                    <Star className="h-3 w-3 me-1 fill-current" />
                    {isAr ? 'تقييم عالي' : 'Top Rated'}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {trainer.bio || (isAr ? 'مدرب لياقة بدنية معتمد' : 'Certified fitness professional')}
              </p>
              <div className="flex flex-wrap gap-1 mb-2">
                {(trainer.specializations || []).slice(0, 3).map((spec) => (
                  <Badge key={spec} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  {rating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      {rating.toFixed(1)}
                      {reviewCount > 0 && (
                        <span className="text-muted-foreground">({reviewCount})</span>
                      )}
                    </span>
                  )}
                  {experience > 0 && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Award className="h-4 w-4" />
                      {experience}{isAr ? ' سنة خبرة' : 'y exp'}
                    </span>
                  )}
                </div>
                {price > 0 && (
                  <span className="font-semibold text-primary">
                    {price} {isAr ? 'ج.م/شهر' : 'EGP/mo'}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground self-center" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
