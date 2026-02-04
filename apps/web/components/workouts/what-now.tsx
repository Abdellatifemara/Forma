'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { workoutsApi, WhatNowInput, WhatNowRecommendation } from '@/lib/api';
import {
  Zap,
  Clock,
  MapPin,
  Battery,
  BatteryLow,
  BatteryFull,
  Dumbbell,
  Home,
  Trees,
  Bed,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

const energyLevels = [
  { id: 'low', label: 'Low', labelAr: 'منخفض', icon: BatteryLow, color: 'text-orange-500' },
  { id: 'medium', label: 'Medium', labelAr: 'متوسط', icon: Battery, color: 'text-yellow-500' },
  { id: 'high', label: 'High', labelAr: 'مرتفع', icon: BatteryFull, color: 'text-green-500' },
];

const locations = [
  { id: 'gym', label: 'Gym', labelAr: 'صالة', icon: Dumbbell },
  { id: 'home', label: 'Home', labelAr: 'بيت', icon: Home },
  { id: 'outdoor', label: 'Outdoor', labelAr: 'خارج', icon: Trees },
];

const timeOptions = [10, 15, 20, 30, 45, 60];

export function WhatNowButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [recommendation, setRecommendation] = useState<WhatNowRecommendation | null>(null);
  const [input, setInput] = useState<WhatNowInput>({
    availableMinutes: 30,
    energyLevel: 'medium',
    location: 'gym',
  });

  const mutation = useMutation({
    mutationFn: (data: WhatNowInput) => workoutsApi.getWhatNow(data),
    onSuccess: (data) => {
      setRecommendation(data);
    },
  });

  const handleGetRecommendation = () => {
    mutation.mutate(input);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-2xl p-6 shadow-lg transition-all hover:shadow-xl group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold">What Now?</h3>
              <p className="text-sm text-white/80">Get a smart workout recommendation</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-xl font-bold">What Now?</h2>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              setRecommendation(null);
            }}
            className="text-white/80 hover:text-white text-sm"
          >
            Close
          </button>
        </div>
      </div>

      {!recommendation ? (
        // Input Form
        <div className="p-6 space-y-6">
          {/* Available Time */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Clock className="w-4 h-4" />
              Available Time
            </label>
            <div className="flex flex-wrap gap-2">
              {timeOptions.map((mins) => (
                <button
                  key={mins}
                  onClick={() => setInput({ ...input, availableMinutes: mins })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    input.availableMinutes === mins
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Battery className="w-4 h-4" />
              Energy Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {energyLevels.map((level) => {
                const Icon = level.icon;
                const isSelected = input.energyLevel === level.id;
                return (
                  <button
                    key={level.id}
                    onClick={() => setInput({ ...input, energyLevel: level.id as 'low' | 'medium' | 'high' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-violet-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${level.color}`} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-violet-700 dark:text-violet-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {level.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <MapPin className="w-4 h-4" />
              Where are you?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {locations.map((loc) => {
                const Icon = loc.icon;
                const isSelected = input.location === loc.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => setInput({ ...input, location: loc.id as 'gym' | 'home' | 'outdoor' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-violet-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-violet-600' : 'text-gray-500'}`} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-violet-700 dark:text-violet-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {loc.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleGetRecommendation}
            disabled={mutation.isPending}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {mutation.isPending ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Get Recommendation
              </>
            )}
          </button>
        </div>
      ) : (
        // Recommendation Display
        <div className="p-6 space-y-6">
          {/* Type Badge */}
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              recommendation.type === 'rest'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : recommendation.type === 'active_recovery'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : recommendation.type === 'quick_workout'
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            }`}>
              {recommendation.type === 'rest' && <Bed className="w-4 h-4 inline mr-1" />}
              {recommendation.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </span>
            {recommendation.durationMinutes > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {recommendation.durationMinutes} min
              </span>
            )}
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {recommendation.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {recommendation.description}
            </p>
          </div>

          {/* Reason */}
          <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-4">
            <p className="text-sm text-violet-800 dark:text-violet-300">
              <Sparkles className="w-4 h-4 inline mr-2" />
              {recommendation.reason}
            </p>
          </div>

          {/* Target Muscles */}
          {recommendation.targetMuscles.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Muscles
              </h4>
              <div className="flex flex-wrap gap-2">
                {recommendation.targetMuscles.map((muscle) => (
                  <span
                    key={muscle}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {muscle.charAt(0) + muscle.slice(1).toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Exercises */}
          {recommendation.exercises.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Exercises
              </h4>
              <div className="space-y-3">
                {recommendation.exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-lg flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {exercise.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {exercise.equipment.toLowerCase().replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {exercise.sets} x {exercise.reps}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setRecommendation(null)}
              className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                // TODO: Start this workout
                alert('Starting workout...');
              }}
              className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-purple-700"
            >
              Start Workout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
