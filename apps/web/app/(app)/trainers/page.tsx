'use client';

import { useState } from 'react';
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

const specializations = [
  'All',
  'Weight Loss',
  'Muscle Building',
  'Strength Training',
  'HIIT & Cardio',
  'Bodybuilding',
  'CrossFit',
  'Yoga',
  'Sports Performance',
];

const trainers = [
  {
    id: '1',
    name: 'Coach Ahmed Mostafa',
    avatar: null,
    bio: 'Certified personal trainer with 8+ years of experience specializing in body transformation and strength training.',
    specializations: ['Muscle Building', 'Strength Training', 'Bodybuilding'],
    rating: 4.9,
    reviewCount: 127,
    clientCount: 45,
    experience: 8,
    hourlyRate: 300,
    monthlyRate: 2000,
    location: 'Cairo, Egypt',
    verified: true,
    languages: ['Arabic', 'English'],
    featured: true,
  },
  {
    id: '2',
    name: 'Coach Sara El-Din',
    avatar: null,
    bio: 'Women\'s fitness specialist focused on sustainable weight loss and building healthy habits.',
    specializations: ['Weight Loss', 'HIIT & Cardio', 'Nutrition'],
    rating: 4.8,
    reviewCount: 89,
    clientCount: 32,
    experience: 5,
    hourlyRate: 250,
    monthlyRate: 1500,
    location: 'Alexandria, Egypt',
    verified: true,
    languages: ['Arabic', 'English'],
    featured: true,
  },
  {
    id: '3',
    name: 'Coach Omar Hassan',
    avatar: null,
    bio: 'Former competitive powerlifter now helping others build strength and confidence through proper programming.',
    specializations: ['Strength Training', 'Powerlifting'],
    rating: 4.9,
    reviewCount: 156,
    clientCount: 38,
    experience: 10,
    hourlyRate: 350,
    monthlyRate: 2500,
    location: 'Cairo, Egypt',
    verified: true,
    languages: ['Arabic', 'English', 'French'],
    featured: false,
  },
  {
    id: '4',
    name: 'Coach Nour Ibrahim',
    avatar: null,
    bio: 'Certified yoga instructor and wellness coach helping clients find balance through mindful movement.',
    specializations: ['Yoga', 'Flexibility', 'Mindfulness'],
    rating: 4.7,
    reviewCount: 64,
    clientCount: 28,
    experience: 6,
    hourlyRate: 200,
    monthlyRate: 1200,
    location: 'Giza, Egypt',
    verified: true,
    languages: ['Arabic', 'English'],
    featured: false,
  },
  {
    id: '5',
    name: 'Coach Youssef Ali',
    avatar: null,
    bio: 'CrossFit L2 trainer passionate about functional fitness and community-driven training.',
    specializations: ['CrossFit', 'HIIT & Cardio', 'Functional Training'],
    rating: 4.8,
    reviewCount: 92,
    clientCount: 41,
    experience: 7,
    hourlyRate: 280,
    monthlyRate: 1800,
    location: 'Cairo, Egypt',
    verified: true,
    languages: ['Arabic', 'English'],
    featured: false,
  },
  {
    id: '6',
    name: 'Coach Mariam Fahmy',
    avatar: null,
    bio: 'Sports nutritionist and fitness coach specializing in athletic performance and competition prep.',
    specializations: ['Sports Performance', 'Nutrition', 'Bodybuilding'],
    rating: 4.9,
    reviewCount: 78,
    clientCount: 25,
    experience: 9,
    hourlyRate: 320,
    monthlyRate: 2200,
    location: 'Cairo, Egypt',
    verified: true,
    languages: ['Arabic', 'English'],
    featured: false,
  },
];

export default function TrainersMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTrainers = trainers
    .filter((trainer) => {
      const matchesSearch =
        trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainer.bio.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialization =
        specializationFilter === 'All' ||
        trainer.specializations.includes(specializationFilter);
      const matchesPrice =
        trainer.hourlyRate >= priceRange[0] && trainer.hourlyRate <= priceRange[1];
      return matchesSearch && matchesSpecialization && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        case 'price_low':
          return a.hourlyRate - b.hourlyRate;
        case 'price_high':
          return b.hourlyRate - a.hourlyRate;
        case 'experience':
          return b.experience - a.experience;
        default:
          return 0;
      }
    });

  const featuredTrainers = filteredTrainers.filter((t) => t.featured);
  const regularTrainers = filteredTrainers.filter((t) => !t.featured);

  return (
    <div className="space-y-6 pb-20 lg:ml-64 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Find a Trainer</h1>
        <p className="text-muted-foreground">
          Connect with certified fitness professionals to accelerate your progress
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search trainers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="reviews">Most Reviews</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="experience">Most Experienced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Specialization
                  </label>
                  <Select
                    value={specializationFilter}
                    onValueChange={setSpecializationFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Price Range (EGP/hour): {priceRange[0]} - {priceRange[1]}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={500}
                    step={50}
                    className="mt-4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Featured Trainers */}
      {featuredTrainers.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Featured Trainers</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {featuredTrainers.map((trainer) => (
              <Card
                key={trainer.id}
                className="overflow-hidden border-forma-teal/30 bg-gradient-to-br from-forma-teal/5 to-transparent"
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={trainer.avatar || undefined} />
                      <AvatarFallback className="text-xl">
                        {trainer.name.split(' ').slice(1).map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{trainer.name}</h3>
                            {trainer.verified && (
                              <Badge variant="forma" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {trainer.location}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            <span className="font-semibold">{trainer.rating}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            ({trainer.reviewCount} reviews)
                          </span>
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                        {trainer.bio}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {trainer.specializations.slice(0, 3).map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            {trainer.experience} years
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {trainer.clientCount} clients
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-forma-teal">
                            {trainer.hourlyRate} EGP/hr
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="forma" className="mt-4 w-full" asChild>
                    <Link href={`/trainers/${trainer.id}`}>
                      View Profile
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Trainers */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            All Trainers ({filteredTrainers.length})
          </h2>
        </div>
        <div className="space-y-4">
          {regularTrainers.map((trainer) => (
            <Card key={trainer.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={trainer.avatar || undefined} />
                    <AvatarFallback>
                      {trainer.name.split(' ').slice(1).map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{trainer.name}</h3>
                          {trainer.verified && (
                            <Badge variant="outline" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            {trainer.rating} ({trainer.reviewCount})
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {trainer.location}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{trainer.hourlyRate} EGP/hr</p>
                        <p className="text-xs text-muted-foreground">
                          {trainer.monthlyRate} EGP/month
                        </p>
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
                      {trainer.bio}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {trainer.specializations.slice(0, 3).map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/trainers/${trainer.id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {filteredTrainers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No trainers found</h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search or filters
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchQuery('');
              setSpecializationFilter('All');
              setPriceRange([0, 500]);
            }}
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
