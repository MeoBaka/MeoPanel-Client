import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { AuditAction, AuditResource } from '../entities/audit-logs.entity';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  async getAuditLogs(
    @Query('username') username?: string,
    @Query('action') action?: AuditAction,
    @Query('resource') resource?: AuditResource,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 50;
    const offsetNum = offset ? parseInt(offset) : 0;

    const filters = {
      username,
      action,
      resource,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const [logs, total] = await this.auditService.getFilteredAuditLogs(filters, limitNum, offsetNum);
    return {
      logs,
      total,
      page: Math.floor(offsetNum / limitNum) + 1,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  @Get('stats')
  async getAuditStats() {
    // This could return aggregated statistics about audit logs
    // For now, just return basic counts
    const recentLogs = await this.auditService.getRecentAuditLogs(1000);

    const stats = {
      total: recentLogs.length,
      byAction: {},
      byResource: {},
      recentActivity: recentLogs.slice(0, 10),
    };

    // Count by action
    recentLogs.forEach(log => {
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
    });

    // Count by resource
    recentLogs.forEach(log => {
      stats.byResource[log.resource] = (stats.byResource[log.resource] || 0) + 1;
    });

    return stats;
  }
}