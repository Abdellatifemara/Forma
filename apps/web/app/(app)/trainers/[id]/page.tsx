'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Globe,
  Instagram,
  MapPin,
  MessageSquare,
  Play,
  Star,
  Users,
  Youtube,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

const trainer = {
  id: '1',
  name: 'Coach Ahmed Mostafa',
  avatar: null,
  bio: 'Certified personal trainer with 8+ years of experience specializing in body transformation and strength training. I believe in a sustainable approach to fitness that combines proper nutrition, progressive overload, and lifestyle changes. My goal is to help you not just reach your fitness goals, but maintain them for life.',
  specializations: ['Muscle Building', 'Strength Training', 'Bodybuilding', 'Nutrition'],
  certifications: ['NASM Certified Personal Trainer', 'Precision Nutrition Level 1', 'CrossFit Level 1'],
  rating: 4.9,
  reviewCount: 127,
  clientCount: 45,
  experience: 8,
  hourlyRate: 300,
  monthlyRate: 2000,
  location: 'Cairo, Egypt',
  verified: true,
  languages: ['Arabic', 'English'],
  availability: 'Mon-Sat, 6AM-10PM',
  responseTime: 'Usually responds within 2 hours',
  socialLinks: {
    instagram: '@coach_ahmed_fit',
    youtube: 'CoachAhmedFitness',
    website: 'www.coachahmed.com',
  },
};

const programs = [
  {
    id: '1',
    name: '12-Week Body Transformation',
    description: 'Complete body recomposition program for beginners to intermediate',
    duration: '12 weeks',
    price: 5000,
    enrolled: 156,
    rating: 4.9,
  },
  {
    id: '2',
    name: 'Strength Foundation',
    description: 'Build your strength base with proper form and programming',
    duration: '8 weeks',
    price: 3500,
    enrolled: 89,
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Advanced Hypertrophy',
    description: 'For experienced lifters looking to maximize muscle growth',
    duration: '10 weeks',
    price: 4500,
    enrolled: 67,
    rating: 4.9,
  },
];

const reviews = [
  {
    id: '1',
    user: 'Mahmoud K.',
    avatar: null,
    rating: 5,
    date: '2 weeks ago',
    text: 'Coach Ahmed completely changed my approach to fitness. Lost 15kg in 4 months and gained significant strength. His attention to detail and constant support made all the difference.',
    program: '12-Week Body Transformation',
  },
  {
    id: '2',
    user: 'Aya M.',
    avatar: null,
    rating: 5,
    date: '1 month ago',
    text: 'Best trainer I\'ve worked with! Very knowledgeable and always available to answer questions. The meal plans are practical and delicious.',
    program: 'Strength Foundation',
  },
  {
    id: '3',
    user: 'Khaled A.',
    avatar: null,
    rating: 4,
    date: '1 month ago',
    text: 'Great programming and coaching. Would have given 5 stars but scheduling can be tricky sometimes. Otherwise excellent experience.',
    program: 'Advanced Hypertrophy',
  },
  {
    id: '4',
    user: 'Sara E.',
    avatar: null,
    rating: 5,
    date: '2 months ago',
    text: 'Ahmed is incredibly patient and understanding. He helped me overcome my fear of the gym and now I actually enjoy working out!',
    program: '12-Week Body Transformation',
  },
];

const ratingBreakdown = [
  { stars: 5, count: 98, percentage: 77 },
  { stars: 4, count: 22, percentage: 17 },
  { stars: 3, count: 5, percentage: 4 },
  { stars: 2, count: 2, percentage: 2 },
  { stars: 1, count: 0, percentage: 0 },
];

export default function TrainerDetailPage() {
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'hourly' | 'monthly'>('monthly');

  return (
    <div className="space-y-6 pb-20 lg:ml-64 lg:pb-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/trainers">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trainers
        </Link>
      </Button>

      {/* Hero Section */}
      <div className="rounded-2xl bg-gradient-to-br from-forma-teal/20 to-forma-teal/5 p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-6">
            <Avatar className="h-24 w-24 lg:h-32 lg:w-32">
              <AvatarImage src={trainer.avatar || undefined} />
              <AvatarFallback className="text-2xl">
                {trainer.name.split(' ').slice(1).map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold lg:text-3xl">{trainer.name}</h1>
                {trainer.verified && (
                  <Badge variant="forma">Verified</Badge>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {trainer.location}
                </span>
                <span className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  {trainer.experience} years experience
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {trainer.clientCount} active clients
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  <span className="text-lg font-semibold">{trainer.rating}</span>
                </div>
                <span className="text-muted-foreground">
                  ({trainer.reviewCount} reviews)
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {trainer.specializations.map((spec) => (
                  <Badge key={spec} variant="secondary">
                    {spec}
                  </Badge>
                ))}
              </div>
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
                  Monthly
                </Button>
                <Button
                  variant={selectedPlan === 'hourly' ? 'forma' : 'outline'}
                  className="flex-1"
                  onClick={() => setSelectedPlan('hourly')}
                >
                  Hourly
                </Button>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-forma-teal">
                  {selectedPlan === 'monthly' ? trainer.monthlyRate : trainer.hourlyRate} EGP
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedPlan === 'monthly' ? 'per month' : 'per session'}
                </p>
              </div>
              <Button
                variant="forma"
                className="mt-4 w-full"
                onClick={() => setShowBookingDialog(true)}
              >
                Start Training
              </Button>
              <Button variant="outline" className="mt-2 w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {trainer.responseTime}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="about" className="space-y-6">
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground">
                  {trainer.bio}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Languages</span>
                    <span className="font-medium">{trainer.languages.join(', ')}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Availability</span>
                    <span className="font-medium">{trainer.availability}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Response Time</span>
                    <span className="font-medium">~2 hours</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Connect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trainer.socialLinks.instagram && (
                    <Button variant="outline" className="w-full justify-start">
                      <Instagram className="mr-2 h-4 w-4" />
                      {trainer.socialLinks.instagram}
                    </Button>
                  )}
                  {trainer.socialLinks.youtube && (
                    <Button variant="outline" className="w-full justify-start">
                      <Youtube className="mr-2 h-4 w-4" />
                      {trainer.socialLinks.youtube}
                    </Button>
                  )}
                  {trainer.socialLinks.website && (
                    <Button variant="outline" className="w-full justify-start">
                      <Globe className="mr-2 h-4 w-4" />
                      {trainer.socialLinks.website}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                {trainer.certifications.map((cert) => (
                  <div
                    key={cert}
                    className="flex items-center gap-3 rounded-lg border p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forma-teal/10">
                      <Award className="h-5 w-5 text-forma-teal" />
                    </div>
                    <span className="font-medium">{cert}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <Card key={program.id}>
                <CardContent className="p-6">
                  <h3 className="font-semibold">{program.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {program.description}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {program.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {program.enrolled} enrolled
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-medium">{program.rating}</span>
                    </div>
                    <p className="font-semibold text-forma-teal">
                      {program.price} EGP
                    </p>
                  </div>
                  <Button variant="outline" className="mt-4 w-full">
                    View Program
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          {/* Rating Summary */}
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="text-center">
                  <p className="text-5xl font-bold text-forma-teal">{trainer.rating}</p>
                  <div className="mt-2 flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(trainer.rating)
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-muted-foreground">
                    Based on {trainer.reviewCount} reviews
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

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {review.user.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.user}</p>
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
                          <span className="text-xs text-muted-foreground">
                            {review.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {review.program}
                    </Badge>
                  </div>
                  <p className="mt-4 text-muted-foreground">{review.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Training with {trainer.name}</DialogTitle>
            <DialogDescription>
              Choose your preferred training plan to get started
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div
              className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                selectedPlan === 'monthly'
                  ? 'border-forma-teal bg-forma-teal/5'
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
                  <p className="text-xl font-bold">{trainer.monthlyRate} EGP</p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-forma-teal" />
                  Personalized workout program
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-forma-teal" />
                  Custom meal plan
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-forma-teal" />
                  Weekly video check-ins
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-forma-teal" />
                  Direct messaging support
                </li>
              </ul>
            </div>

            <div
              className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                selectedPlan === 'hourly'
                  ? 'border-forma-teal bg-forma-teal/5'
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
                  <p className="text-xl font-bold">{trainer.hourlyRate} EGP</p>
                  <p className="text-xs text-muted-foreground">per session</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-forma-teal" />
                  60-minute video session
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-forma-teal" />
                  Form correction & technique
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-forma-teal" />
                  Q&A and advice
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
              Cancel
            </Button>
            <Button variant="forma">
              Continue to Payment
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
