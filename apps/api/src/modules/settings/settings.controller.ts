import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SettingsService } from './settings.service';

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
    @Body() body: any,
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
