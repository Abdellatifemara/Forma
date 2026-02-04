'use client';

import { useState } from 'react';
import { Moon, Sun, Droplets, Dumbbell, Check, X } from 'lucide-react';
import { useRamadanSettings, useEnableRamadanMode, useDisableRamadanMode } from '@/hooks/use-settings';

const workoutTimings = [
  {
    id: 'before_iftar',
    label: 'Before Iftar',
    labelAr: 'قبل الإفطار',
    description: 'Light workout 1-2 hours before breaking fast',
    icon: Sun,
  },
  {
    id: 'after_iftar',
    label: 'After Iftar',
    labelAr: 'بعد الإفطار',
    description: 'Full workout 2-3 hours after breaking fast',
    icon: Moon,
  },
  {
    id: 'after_taraweeh',
    label: 'After Taraweeh',
    labelAr: 'بعد التراويح',
    description: 'Late evening workout after prayers',
    icon: Moon,
  },
  {
    id: 'before_suhoor',
    label: 'Before Suhoor',
    labelAr: 'قبل السحور',
    description: 'Early morning workout before pre-dawn meal',
    icon: Sun,
  },
];

export function RamadanModeSettings() {
  const { data: settings, isLoading } = useRamadanSettings();
  const enableMutation = useEnableRamadanMode();
  const disableMutation = useDisableRamadanMode();

  const [iftarTime, setIftarTime] = useState('18:30');
  const [suhoorTime, setSuhoorTime] = useState('04:00');
  const [workoutTiming, setWorkoutTiming] = useState<string>('after_iftar');

  const handleEnable = () => {
    enableMutation.mutate({
      iftarTime,
      suhoorTime,
      workoutTiming: workoutTiming as 'before_iftar' | 'after_iftar' | 'after_taraweeh' | 'before_suhoor',
    });
  };

  const handleDisable = () => {
    disableMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Moon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Ramadan Mode
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              وضع رمضان
            </p>
          </div>
        </div>
        {settings?.enabled && (
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-full">
            Active
          </span>
        )}
      </div>

      {settings?.enabled ? (
        // Active Ramadan Mode View
        <div className="space-y-6">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Iftar Time</p>
                <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                  {settings.iftarTime || '18:30'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Suhoor Time</p>
                <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                  {settings.suhoorTime || '04:00'}
                </p>
              </div>
            </div>
          </div>

          {settings.recommendedWorkoutTime && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Dumbbell className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Recommended Workout: {settings.recommendedWorkoutTime}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  {settings.nutritionAdvice}
                </p>
              </div>
            </div>
          )}

          {settings.hydrationReminder && (
            <div className="flex items-start gap-3 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
              <Droplets className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mt-0.5" />
              <p className="text-sm text-cyan-800 dark:text-cyan-200">
                {settings.hydrationReminder}
              </p>
            </div>
          )}

          <button
            onClick={handleDisable}
            disabled={disableMutation.isPending}
            className="w-full py-3 px-4 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            {disableMutation.isPending ? 'Disabling...' : 'Disable Ramadan Mode'}
          </button>
        </div>
      ) : (
        // Setup Ramadan Mode View
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Enable Ramadan mode to get personalized workout timing and nutrition advice
            during the holy month.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Iftar Time
              </label>
              <input
                type="time"
                value={iftarTime}
                onChange={(e) => setIftarTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Suhoor Time
              </label>
              <input
                type="time"
                value={suhoorTime}
                onChange={(e) => setSuhoorTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Preferred Workout Time
            </label>
            <div className="grid grid-cols-2 gap-3">
              {workoutTimings.map((timing) => {
                const Icon = timing.icon;
                const isSelected = workoutTiming === timing.id;
                return (
                  <button
                    key={timing.id}
                    onClick={() => setWorkoutTiming(timing.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`} />
                      <span className={`text-sm font-medium ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {timing.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {timing.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleEnable}
            disabled={enableMutation.isPending}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Check className="w-4 h-4" />
            {enableMutation.isPending ? 'Enabling...' : 'Enable Ramadan Mode'}
          </button>
        </div>
      )}
    </div>
  );
}
