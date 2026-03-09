import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SettingsService } from './settings.service';

class UpdatePreferencesDto {
  @IsOptional() @IsBoolean() isVegetarian?: boolean;
  @IsOptional() @IsBoolean() isVegan?: boolean;
  @IsOptional() @IsBoolean() isKeto?: boolean;
  @IsOptional() @IsBoolean() isPescatarian?: boolean;
  @IsOptional() @IsBoolean() preferLocalFoods?: boolean;
  @IsOptional() @IsString() budgetLevel?: string;
  @IsOptional() @IsString() cookingSkillLevel?: string;
  @IsOptional() @IsInt() @Min(5) @Max(180) maxCookingTime?: number;
  @IsOptional() @IsBoolean() ramadanModeEnabled?: boolean;
  @IsOptional() @IsString() ramadanIftarTime?: string;
  @IsOptional() @IsString() ramadanSuhoorTime?: string;
  @IsOptional() @IsString() ramadanWorkoutTiming?: string;
  @IsOptional() @IsString() preferredWorkoutTime?: string;
  @IsOptional() @IsInt() @Min(10) @Max(240) workoutDurationMins?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) allergies?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) dislikes?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) healthConditions?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) injuries?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) availableEquipment?: string[];
}

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('preferences')
  async getPreferences(@Request() req: { user: { id: string } }) {
    return this.settingsService.getUserPreferences(req.user.id);
  }

  @Put('preferences')
  async updatePreferences(
    @Request() req: { user: { id: string } },
    @Body() body: UpdatePreferencesDto,
  ) {
    return this.settingsService.updateUserPreferences(req.user.id, body);
  }

  // Ramadan Mode endpoints
  @Get('ramadan')
  async getRamadanSettings(@Request() req: { user: { id: string } }) {
    return this.settingsService.getRamadanSettings(req.user.id);
  }

  @Post('ramadan/enable')
  async enableRamadanMode(
    @Request() req: { user: { id: string } },
    @Body()
    body: {
      iftarTime: string;
      suhoorTime: string;
      workoutTiming: string;
    },
  ) {
    return this.settingsService.enableRamadanMode(req.user.id, body);
  }

  @Post('ramadan/disable')
  async disableRamadanMode(@Request() req: { user: { id: string } }) {
    return this.settingsService.disableRamadanMode(req.user.id);
  }

  // Injury endpoints
  @Get('injuries')
  async getInjuries(@Request() req: { user: { id: string } }) {
    return this.settingsService.getInjuries(req.user.id);
  }

  @Put('injuries')
  async updateInjuries(
    @Request() req: { user: { id: string } },
    @Body() body: { injuries: string[] },
  ) {
    return this.settingsService.updateInjuries(req.user.id, body.injuries);
  }

  // Equipment endpoints
  @Put('equipment')
  async updateEquipment(
    @Request() req: { user: { id: string } },
    @Body() body: { equipment: string[] },
  ) {
    return this.settingsService.updateEquipment(req.user.id, body.equipment);
  }
}
