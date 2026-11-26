import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../core/auth/admin.guard';
import { AuthGuard } from '../../core/auth/auth.guard';
import { Feature } from '../../core/features/feature.decorator';
import { AdminDashboardService } from './admin-dashboard.service';

@Feature('admin-dashboard')
@Controller('admin/dashboard')
@UseGuards(AuthGuard, AdminGuard)
export class AdminDashboardController {
  constructor(private readonly dashboard: AdminDashboardService) {}

  @Get()
  summary() {
    return this.dashboard.summary();
  }
}