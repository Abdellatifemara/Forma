import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserPreferences(userId: string) {
    let preferences = await this.prisma.userAIPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences
      preferences = await this.prisma.userAIPreference.create({
        data: { userId },
      });
    }

    return preferences;
  }

  async updateUserPreferences(userId: string, data: UpdatePreferencesDto) {
    return this.prisma.userAIPreference.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  // Ramadan Mode
  async enableRamadanMode(
    userId: string,
    data: {
      iftarTime: string;
      suhoorTime: string;
      workoutTiming: string;
    },
  ) {
    return this.prisma.userAIPreference.upsert({
      where: { userId },
      update: {
        ramadanModeEnabled: true,
        ramadanIftarTime: data.iftarTime,
        ramadanSuhoorTime: data.suhoorTime,
        ramadanWorkoutTiming: data.workoutTiming,
      },
      create: {
        userId,
        ramadanModeEnabled: true,
        ramadanIftarTime: data.iftarTime,
        ramadanSuhoorTime: data.suhoorTime,
        ramadanWorkoutTiming: data.workoutTiming,
      },
    });
  }

  async disableRamadanMode(userId: string) {
    return this.prisma.userAIPreference.upsert({
      where: { userId },
      update: { ramadanModeEnabled: false },
      create: { userId, ramadanModeEnabled: false },
    });
  }

  async getRamadanSettings(userId: string) {
    const prefs = await this.getUserPreferences(userId);

    // Calculate recommended workout time based on settings
    let recommendedWorkoutTime = '';
    let nutritionAdvice = '';

    if (prefs.ramadanModeEnabled) {
      const iftarTime = prefs.ramadanIftarTime || '18:30';
      const suhoorTime = prefs.ramadanSuhoorTime || '04:00';

      switch (prefs.ramadanWorkoutTiming) {
        case 'before_iftar':
          // 1-2 hours before iftar (light workout, stay hydrated after)
          recommendedWorkoutTime = this.subtractTime(iftarTime, 1.5);
          nutritionAdvice = 'Light workout recommended. Break fast with dates and water, then eat a balanced meal 30 mins later.';
          break;
        case 'after_iftar':
          // 2-3 hours after iftar (after digestion)
          recommendedWorkoutTime = this.addTime(iftarTime, 2.5);
          nutritionAdvice = 'Wait 2-3 hours after iftar. Have protein-rich meal before workout. Stay hydrated.';
          break;
        case 'after_taraweeh':
          // After taraweeh prayers (~10 PM)
          recommendedWorkoutTime = '22:00';
          nutritionAdvice = 'Late workout. Have a light protein snack before, and suhoor as post-workout meal.';
          break;
        case 'before_suhoor':
          // Early morning before suhoor
          recommendedWorkoutTime = this.subtractTime(suhoorTime, 1);
          nutritionAdvice = 'Early workout. Use suhoor as your post-workout meal. Focus on complex carbs and protein.';
          break;
        default:
          recommendedWorkoutTime = this.addTime(iftarTime, 2.5);
          nutritionAdvice = 'Workout after iftar recommended for most people.';
      }
    }

    return {
      enabled: prefs.ramadanModeEnabled,
      iftarTime: prefs.ramadanIftarTime,
      suhoorTime: prefs.ramadanSuhoorTime,
      workoutTiming: prefs.ramadanWorkoutTiming,
      recommendedWorkoutTime,
      nutritionAdvice,
      hydrationReminder: prefs.ramadanModeEnabled
        ? 'Drink 8-10 glasses of water between Iftar and Suhoor'
        : null,
    };
  }

  // Injury settings
  async updateInjuries(userId: string, injuries: string[]) {
    return this.prisma.userAIPreference.upsert({
      where: { userId },
      update: { injuries },
      create: { userId, injuries },
    });
  }

  async getInjuries(userId: string) {
    const prefs = await this.getUserPreferences(userId);
    return prefs.injuries || [];
  }

  // Equipment settings
  async updateEquipment(userId: string, equipment: string[]) {
    return this.prisma.userAIPreference.upsert({
      where: { userId },
      update: { availableEquipment: equipment },
      create: { userId, availableEquipment: equipment },
    });
  }

  // Helper functions
  private addTime(time: string, hours: number): string {
    const [h, m] = time.split(':').map(Number);
    const totalMinutes = h * 60 + m + hours * 60;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  }

  private subtractTime(time: string, hours: number): string {
    const [h, m] = time.split(':').map(Number);
    let totalMinutes = h * 60 + m - hours * 60;
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  }
}

interface UpdatePreferencesDto {
  isVegetarian?: boolean;
  isVegan?: boolean;
  isKeto?: boolean;
  isPescatarian?: boolean;
  allergies?: string[];
  dislikes?: string[];
  healthConditions?: string[];
  preferLocalFoods?: boolean;
  budgetLevel?: string;
  cookingSkillLevel?: string;
  maxCookingTime?: number;
  ramadanModeEnabled?: boolean;
  ramadanIftarTime?: string;
  ramadanSuhoorTime?: string;
  ramadanWorkoutTiming?: string;
  injuries?: string[];
  preferredWorkoutTime?: string;
  availableEquipment?: string[];
  workoutDurationMins?: number;
}
