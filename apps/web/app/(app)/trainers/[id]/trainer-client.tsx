'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  Check,
  ChevronRight,
  Clock,
  Globe,
  Instagram,
  MapPin,
  MessageSquare,
  Star,
  Users,
  Youtube,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { trainersApi, type Trainer } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

// Default rating breakdown (will be calculated from reviews when API supports it)
const defaultRatingBreakdown = [
  { stars: 5, count: 0, percentage: 0 },
  { stars: 4, count: 0, percentage: 0 },
  { stars: 3, count: 0, percentage: 0 },
  { stars: 2, count: 0, percentage: 0 },
  { stars: 1, count: 0, percentage: 0 },
];

export default function TrainerDetailPage() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'hourly' | 'monthly'>('monthly');

  // Redirect placeholder routes (static export artifact)
  useEffect(() => {
    if (id === '_placeholder' || id === '_placeholder_') {
      router.replace('/trainers');
    }
  }, [id, router]);

  useEffect(() => {
    if (id === '_placeholder' || id === '_placeholder_') return;

    async function loadTrainer() {
      try {
        setIsLoading(true);
        const data = await trainersApi.getById(id);
        setTrainer(data);
      } catch (err) {
        // Error handled
        setError(err instanceof Error ? err.message : (isAr ? 'فشل تحميل بيانات المدرب' : 'Failed to load trainer'));
      } finally {
        setIsLoading(false);
      }
    }
    loadTrainer();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !trainer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center pb-20">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Users className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">{isAr ? 'المدرب غير متاح' : 'Trainer Unavailable'}</h2>
        <p className="text-muted-foreground max-w-xs mb-6">
          {isAr ? 'بروفايل المدرب ده مش متاح حالياً. ممكن تتصفح المدربين المتاحين.' : 'This trainer profile is currently unavailable. Browse our available trainers.'}
        </p>
        <Button className="btn-primary" asChild>
          <Link href="/trainers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isAr ? 'تصفح المدربين' : 'Browse Trainers'}
          </Link>
        </Button>
      </div>
    );
  }

  // Derive trainer display values
  const trainerName = trainer.user?.firstName && trainer.user?.lastName
    ? `${trainer.user.firstName} ${trainer.user.lastName}`
    : trainer.user?.displayName || (isAr ? 'مدرب' : 'Trainer');
  const trainerAvatar = trainer.user?.avatarUrl || null;
  const trainerBio = trainer.bio || (isAr ? 'مدرب لياقة بدنية معتمد مخصص لمساعدتك في تحقيق أهدافك.' : 'Certified fitness professional dedicated to helping you achieve your goals.');
  const trainerSpecializations = trainer.specializations || [];
  const trainerCertifications = trainer.certifications || [];
  const trainerRating = trainer.rating || 0;
  const trainerReviewCount = trainer.reviewCount || 0;
  const trainerClientCount = trainer.clientCount || 0;
  const trainerExperience = trainer.experience || 0;
  const trainerHourlyRate = trainer.hourlyRate || 0;
  const trainerMonthlyRate = trainer.monthlyRate || (trainerHourlyRate * 8); // Default: 8 sessions/month
  const trainerLocation = trainer.location || 'Egypt';
  const trainerVerified = trainer.verified || false;
  const trainerLanguages = trainer.languages || ['Arabic'];
  const trainerAvailability = trainer.availability || (isAr ? 'تواصل للاستفسار' : 'Contact for availability');
  const trainerResponseTime = trainer.responseTime || (isAr ? 'عادةً بيرد خلال 24 ساعة' : 'Usually responds within 24 hours');
  const trainerSocialLinks = trainer.socialLinks || {};
  const trainerPrograms = trainer.programs || [];
  const trainerReviews = trainer.reviews || [];

  // Calculate rating breakdown from reviews
  const ratingBreakdown = trainerReviews.length > 0
    ? [5, 4, 3, 2, 1].map(stars => {
        const count = trainerReviews.filter((r: { rating: number }) => r.rating === stars).length;
        const percentage = Math.round((count / trainerReviews.length) * 100);
        return { stars, count, percentage };
      })
    : defaultRatingBreakdown;

  return (
    <div className="space-y-6 pb-20">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/trainers">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isAr ? 'رجوع للمدربين' : 'Back to Trainers'}
        </Link>
      </Button>

      {/* Hero Section */}
      <div className="rounded-2xl bg-gradient-to-br from-forma-orange/20 to-forma-orange/5 p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-6">
            <Avatar className="h-24 w-24 lg:h-32 lg:w-32">
              <AvatarImage src={trainerAvatar || undefined} />
              <AvatarFallback className="text-2xl">
                {trainerName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold lg:text-3xl">{trainerName}</h1>
                {trainerVerified && (
                  <Badge variant="forma">{isAr ? 'موثق' : 'Verified'}</Badge>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {trainerLocation}
                </span>
                {trainerExperience > 0 && (
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    {trainerExperience} {isAr ? 'سنة خبرة' : 'years experience'}
                  </span>
                )}
                {trainerClientCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {trainerClientCount}
                  </span>
                )}
              </div>
              {trainerRating > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    <span className="text-lg font-semibold">{trainerRating.toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">
                    ({trainerReviewCount} {isAr ? 'تقييم' : 'reviews'})
                  </span>
                </div>
              )}
              {trainerSpecializations.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {trainerSpecializations.map((spec) => (
                    <Badge key={spec} variant="secondary">
                      {spec}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pricing Card */}
          <Card className="min-w-[280px]">
            <CardContent className="p-4">
              <div className="mb-4 flex gap-2">
                <Button
                  variant={selectedPlan === 'monthly' ? 'forma' : 'outline'}
                  className="flex-1"
                  onClick={() => setSelectedPlan('monthly')}
                >
                  {isAr ? 'شهري' : 'Monthly'}
                </Button>
                <Button
                  variant={selectedPlan === 'hourly' ? 'forma' : 'outline'}
                  className="flex-1"
                  onClick={() => setSelectedPlan('hourly')}
                >
                  {isAr ? 'بالساعة' : 'Hourly'}
                </Button>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-forma-orange">
                  {selectedPlan === 'monthly' ? trainerMonthlyRate : trainerHourlyRate} {isAr ? 'ج.م' : 'EGP'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedPlan === 'monthly' ? (isAr ? 'في الشهر' : 'per month') : (isAr ? 'للجلسة' : 'per session')}
                </p>
              </div>
              <Button
                variant="forma"
                className="mt-4 w-full"
                onClick={() => setShowBookingDialog(true)}
              >
                {isAr ? 'ابدأ التدريب' : 'Start Training'}
              </Button>
              <Button variant="outline" className="mt-2 w-full" asChild>
                <Link href={`/messages?trainer=${trainer.id}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t.trainers.contactTrainer}
                </Link>
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {trainerResponseTime}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="about" className="space-y-6">
        <TabsList>
          <TabsTrigger value="about">{t.trainers.about}</TabsTrigger>
          <TabsTrigger value="programs">{isAr ? 'البرامج' : 'Programs'}</TabsTrigger>
          <TabsTrigger value="reviews">{t.trainers.reviews}</TabsTrigger>
        </TabsList>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t.trainers.about}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground">
                  {trainerBio}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{isAr ? 'التفاصيل' : 'Details'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isAr ? 'اللغات' : 'Languages'}</span>
                    <span className="font-medium">{trainerLanguages.join(', ')}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isAr ? 'التفرّغ' : 'Availability'}</span>
                    <span className="font-medium">{trainerAvailability}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isAr ? 'وقت الرد' : 'Response Time'}</span>
                    <span className="font-medium">{trainerResponseTime}</span>
                  </div>
                </CardContent>
              </Card>

              {(trainerSocialLinks.instagram || trainerSocialLinks.youtube || trainerSocialLinks.website) && (
                <Card>
                  <CardHeader>
                    <CardTitle>{isAr ? 'تواصل' : 'Connect'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {trainerSocialLinks.instagram && (
                      <Button variant="outline" className="w-full justify-start">
                        <Instagram className="mr-2 h-4 w-4" />
                        {trainerSocialLinks.instagram}
                      </Button>
                    )}
                    {trainerSocialLinks.youtube && (
                      <Button variant="outline" className="w-full justify-start">
                        <Youtube className="mr-2 h-4 w-4" />
                        {trainerSocialLinks.youtube}
                      </Button>
                    )}
                    {trainerSocialLinks.website && (
                      <Button variant="outline" className="w-full justify-start">
                        <Globe className="mr-2 h-4 w-4" />
                        {trainerSocialLinks.website}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Certifications */}
          {trainerCertifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t.trainers.certifications}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  {trainerCertifications.map((cert) => (
                    <div
                      key={cert}
                      className="flex items-center gap-3 rounded-lg border p-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forma-orange/10">
                        <Award className="h-5 w-5 text-forma-orange" />
                      </div>
                      <span className="font-medium">{cert}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-4">
          {trainerPrograms.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trainerPrograms.map((program: { id: string; name: string; description?: string; duration?: string; price?: number; enrolled?: number; rating?: number }) => (
                <Card key={program.id}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold">{program.name}</h3>
                    {program.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {program.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                      {program.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {program.duration}
                        </span>
                      )}
                      {program.enrolled !== undefined && program.enrolled > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {program.enrolled} {isAr ? 'مشترك' : 'enrolled'}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      {program.rating !== undefined && program.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="font-medium">{program.rating}</span>
                        </div>
                      )}
                      {program.price !== undefined && program.price > 0 && (
                        <p className="font-semibold text-forma-orange">
                          {program.price} {isAr ? 'ج.م' : 'EGP'}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" className="mt-4 w-full">
                      View Program
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No programs yet</h3>
                <p className="text-muted-foreground">
                  This trainer hasn't published any programs yet. Contact them for custom training.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          {/* Rating Summary */}
          {trainerRating > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-forma-orange">{trainerRating.toFixed(1)}</p>
                    <div className="mt-2 flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(trainerRating)
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-muted-foreground">
                      Based on {trainerReviewCount} reviews
                    </p>
                  </div>
                  <div className="space-y-2">
                    {ratingBreakdown.map((item) => (
                      <div key={item.stars} className="flex items-center gap-3">
                        <span className="w-12 text-sm">{item.stars} stars</span>
                        <Progress value={item.percentage} className="h-2 flex-1" />
                        <span className="w-8 text-sm text-muted-foreground">
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews List */}
          {trainerReviews.length > 0 ? (
            <div className="space-y-4">
              {trainerReviews.map((review: { id: string; user?: { firstName?: string; lastName?: string; displayName?: string }; userName?: string; rating: number; date?: string; createdAt?: string; text?: string; comment?: string; program?: string }) => {
                const reviewerName = review.user?.firstName && review.user?.lastName
                  ? `${review.user.firstName} ${review.user.lastName.charAt(0)}.`
                  : review.user?.displayName || review.userName || 'Anonymous';
                const reviewDate = review.date || (review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '');
                const reviewText = review.text || review.comment || '';

                return (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {reviewerName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{reviewerName}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${
                                      star <= review.rating
                                        ? 'fill-yellow-500 text-yellow-500'
                                        : 'text-muted'
                                    }`}
                                  />
                                ))}
                              </div>
                              {reviewDate && (
                                <span className="text-xs text-muted-foreground">
                                  {reviewDate}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {review.program && (
                          <Badge variant="outline" className="text-xs">
                            {review.program}
                          </Badge>
                        )}
                      </div>
                      {reviewText && (
                        <p className="mt-4 text-muted-foreground">{reviewText}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                <p className="text-muted-foreground">
                  Be the first to review this trainer after your training session.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Training with {trainerName}</DialogTitle>
            <DialogDescription>
              Choose your preferred training plan to get started
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div
              className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                selectedPlan === 'monthly'
                  ? 'border-forma-orange bg-forma-orange/5'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => setSelectedPlan('monthly')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Monthly Coaching</p>
                  <p className="text-sm text-muted-foreground">
                    Full program access + weekly check-ins
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{trainerMonthlyRate} EGP</p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-forma-orange" />
                  Personalized workout program
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-forma-orange" />
                  Custom meal plan
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-forma-orange" />
                  Weekly video check-ins
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-forma-orange" />
                  Direct messaging support
                </li>
              </ul>
            </div>

            <div
              className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                selectedPlan === 'hourly'
                  ? 'border-forma-orange bg-forma-orange/5'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => setSelectedPlan('hourly')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Single Session</p>
                  <p className="text-sm text-muted-foreground">
                    1-on-1 video training session
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{trainerHourlyRate} EGP</p>
                  <p className="text-xs text-muted-foreground">per session</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-forma-orange" />
                  60-minute video session
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-forma-orange" />
                  Form correction & technique
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-forma-orange" />
                  Q&A and advice
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
              {t.common.cancel}
            </Button>
            <Button variant="forma" asChild>
              <Link href={`/checkout?trainer=${trainer.id}&plan=${selectedPlan}&amount=${selectedPlan === 'monthly' ? trainerMonthlyRate : trainerHourlyRate}`}>
                Continue to Payment
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
