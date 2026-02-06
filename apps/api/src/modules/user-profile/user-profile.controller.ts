import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserProfileService } from './user-profile.service';

@Controller('user-profile')
@UseGuards(JwtAuthGuard)
export class UserProfileController {
  constructor(private readonly profileService: UserProfileService) {}

  // ==========================================
  // COMPLETE AI PROFILE
  // ==========================================

  @Get('ai-profile')
  async getAIProfile(@Request() req) {
    return this.profileService.getCompleteAIProfile(req.user.id);
  }

  @Get('completion-status')
  async getCompletionStatus(@Request() req) {
    return this.profileService.getProfileCompletionStatus(req.user.id);
  }

  // ==========================================
  // EQUIPMENT INVENTORY
  // ==========================================

  @Get('equipment')
  async getEquipment(@Request() req) {
    return this.profileService.getEquipmentInventory(req.user.id);
  }

  @Put('equipment')
  async updateEquipment(@Request() req, @Body() data: any) {
    return this.profileService.updateEquipmentInventory(req.user.id, data);
  }

  // ==========================================
  // EXERCISE CAPABILITY
  // ==========================================

  @Get('capability')
  async getCapability(@Request() req) {
    return this.profileService.getExerciseCapability(req.user.id);
  }

  @Put('capability')
  async updateCapability(@Request() req, @Body() data: any) {
    return this.profileService.updateExerciseCapability(req.user.id, data);
  }

  // ==========================================
  // MOVEMENT SCREENING
  // ==========================================

  @Get('movement')
  async getMovement(@Request() req) {
    return this.profileService.getMovementScreen(req.user.id);
  }

  @Put('movement')
  async updateMovement(@Request() req, @Body() data: any) {
    return this.profileService.updateMovementScreen(req.user.id, data);
  }

  // ==========================================
  // HEALTH PROFILE
  // ==========================================

  @Get('health')
  async getHealth(@Request() req) {
    return this.profileService.getHealthProfile(req.user.id);
  }

  @Put('health')
  async updateHealth(@Request() req, @Body() data: any) {
    return this.profileService.updateHealthProfile(req.user.id, data);
  }

  @Post('health/injuries')
  async addInjury(@Request() req, @Body() data: any) {
    return this.profileService.addInjury(req.user.id, data);
  }

  @Put('health/injuries/:id')
  async updateInjury(@Param('id') id: string, @Body() data: any) {
    return this.profileService.updateInjury(id, data);
  }

  @Delete('health/injuries/:id')
  async deleteInjury(@Param('id') id: string) {
    return this.profileService.deleteInjury(id);
  }

  // ==========================================
  // NUTRITION PROFILE
  // ==========================================

  @Get('nutrition')
  async getNutrition(@Request() req) {
    return this.profileService.getNutritionProfile(req.user.id);
  }

  @Put('nutrition')
  async updateNutrition(@Request() req, @Body() data: any) {
    return this.profileService.updateNutritionProfile(req.user.id, data);
  }

  // ==========================================
  // LIFESTYLE PROFILE
  // ==========================================

  @Get('lifestyle')
  async getLifestyle(@Request() req) {
    return this.profileService.getLifestyleProfile(req.user.id);
  }

  @Put('lifestyle')
  async updateLifestyle(@Request() req, @Body() data: any) {
    return this.profileService.updateLifestyleProfile(req.user.id, data);
  }

  // ==========================================
  // BODY COMPOSITION
  // ==========================================

  @Get('body')
  async getBody(@Request() req) {
    return this.profileService.getBodyComposition(req.user.id);
  }

  @Put('body')
  async updateBody(@Request() req, @Body() data: any) {
    return this.profileService.updateBodyComposition(req.user.id, data);
  }

  // ==========================================
  // DAILY READINESS
  // ==========================================

  @Get('readiness/today')
  async getTodayReadiness(@Request() req) {
    return this.profileService.getTodayReadiness(req.user.id);
  }

  @Get('readiness/history')
  async getReadinessHistory(@Request() req) {
    return this.profileService.getReadinessHistory(req.user.id);
  }

  @Post('readiness')
  async logReadiness(@Request() req, @Body() data: any) {
    return this.profileService.logDailyReadiness(req.user.id, data);
  }

  // ==========================================
  // WORKOUT FEEDBACK
  // ==========================================

  @Get('feedback/:workoutLogId')
  async getWorkoutFeedback(@Param('workoutLogId') workoutLogId: string) {
    return this.profileService.getWorkoutFeedback(workoutLogId);
  }

  @Post('feedback/:workoutLogId')
  async logWorkoutFeedback(
    @Request() req,
    @Param('workoutLogId') workoutLogId: string,
    @Body() data: any,
  ) {
    return this.profileService.logWorkoutFeedback(req.user.id, workoutLogId, data);
  }

  // ==========================================
  // MUSCLE RECOVERY
  // ==========================================

  @Get('recovery')
  async getMuscleRecovery(@Request() req) {
    return this.profileService.getMuscleRecoveryStatus(req.user.id);
  }

  @Post('recovery/:muscleGroup')
  async updateMuscleRecovery(
    @Request() req,
    @Param('muscleGroup') muscleGroup: string,
    @Body() data: any,
  ) {
    return this.profileService.updateMuscleRecovery(req.user.id, muscleGroup, data);
  }

  // ==========================================
  // TRAINING HISTORY
  // ==========================================

  @Get('training')
  async getTrainingHistory(@Request() req) {
    return this.profileService.getTrainingHistory(req.user.id);
  }

  @Put('training')
  async updateTrainingHistory(@Request() req, @Body() data: any) {
    return this.profileService.updateTrainingHistory(req.user.id, data);
  }

  // ==========================================
  // GOALS PROFILE
  // ==========================================

  @Get('goals')
  async getGoals(@Request() req) {
    return this.profileService.getGoalsProfile(req.user.id);
  }

  @Put('goals')
  async updateGoals(@Request() req, @Body() data: any) {
    return this.profileService.updateGoalsProfile(req.user.id, data);
  }

  // ==========================================
  // FASTING PROFILE
  // ==========================================

  @Get('fasting')
  async getFasting(@Request() req) {
    return this.profileService.getFastingProfile(req.user.id);
  }

  @Put('fasting')
  async updateFasting(@Request() req, @Body() data: any) {
    return this.profileService.updateFastingProfile(req.user.id, data);
  }
}
