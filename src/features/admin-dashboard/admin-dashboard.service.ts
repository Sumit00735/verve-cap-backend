import { Injectable } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [totalUsers, pendingUsers, activeUsers, adminUsers, totalCompanies] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { status: UserStatus.PENDING } }),
        this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
        this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
        this.prisma.company.count(),
      ]);

    return {
      totalUsers,
      pendingUsers,
      activeUsers,
      adminUsers,
      totalCompanies,
    };
  }
}
