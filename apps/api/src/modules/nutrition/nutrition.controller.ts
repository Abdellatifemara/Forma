import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NutritionService } from './nutrition.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { User, MealType } from '@prisma/client';

@ApiTags('nutrition')
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  // Foods (Public)
  @Public()
  @Get('foods')
  @ApiOperation({ summary: 'Search foods database' })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'isEgyptian', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async searchFoods(
    @Query('query') query?: string,
    @Query('category') category?: string,
    @Query('isEgyptian') isEgyptian?: boolean,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.nutritionService.searchFoods({
      query,
      category,
      isEgyptian,
      page,
      pageSize,
    });
  }

  @Public()
  @Get('foods/categories')
  @ApiOperation({ summary: 'Get food categories with counts' })
  async getCategories() {
    return this.nutritionService.getCategories();
  }

  @Public()
  @Get('foods/:id')
  @ApiOperation({ summary: 'Get food by ID' })
  async getFoodById(@Param('id') id: string) {
    return this.nutritionService.getFoodById(id);
  }

  @Public()
  @Get('foods/barcode/:barcode')
  @ApiOperation({ summary: 'Get food by barcode' })
  async getFoodByBarcode(@Param('barcode') barcode: string) {
    return this.nutritionService.getFoodByBarcode(barcode);
  }

  // Meal Logging (Authenticated)
  @UseGuards(JwtAuthGuard)
  @Post('meals')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log a meal' })
  async logMeal(
    @CurrentUser() user: User,
    @Body() data: {
      mealType: MealType;
      foods: { foodId: string; servings: number }[];
      notes?: string;
      photoUrl?: string;
    },
  ) {
    return this.nutritionService.logMeal(user.id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('meals')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get meal logs for a date' })
  @ApiQuery({ name: 'date', required: false, description: 'Date in YYYY-MM-DD format' })
  async getMealLogs(
    @CurrentUser() user: User,
    @Query('date') dateStr?: string,
  ) {
    const date = dateStr ? new Date(dateStr) : new Date();
    return this.nutritionService.getMealLogs(user.id, date);
  }

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get daily nutrition summary' })
  @ApiQuery({ name: 'date', required: false, description: 'Date in YYYY-MM-DD format' })
  async getDailySummary(
    @CurrentUser() user: User,
    @Query('date') dateStr?: string,
  ) {
    const date = dateStr ? new Date(dateStr) : new Date();
    return this.nutritionService.getDailyNutritionSummary(user.id, date);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('meals/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a meal log' })
  async deleteMealLog(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    await this.nutritionService.deleteMealLog(user.id, id);
    return { success: true };
  }
}
