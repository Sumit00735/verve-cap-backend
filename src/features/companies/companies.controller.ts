import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { ActiveGuard } from '../../core/auth/active.guard';
import { AuthGuard } from '../../core/auth/auth.guard';
import type { SessionUser } from '../../core/auth/auth.types';
import { CurrentUser } from '../../core/auth/current-user.decorator';
import { AppException } from '../../core/errors/app.exception';
import { Feature } from '../../core/features/feature.decorator';
import { CompaniesService } from './companies.service';
import { createCompanySchema } from './dto/create-company.dto';
import { updateCompanySchema } from './dto/update-company.dto';

const listSchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    cursor: z.string().uuid().optional(),
    q: z.string().max(120).optional(),
  })
  .strict();

@Feature('companies')
@Controller('companies')
@UseGuards(AuthGuard, ActiveGuard)
export class CompaniesController {
  constructor(private readonly companies: CompaniesService) {}

  @Get()
  async list(@Query() query: Record<string, unknown>) {
    const parsed = listSchema.safeParse(query);
    if (!parsed.success) {
      throw new AppException('bad_request', 'Invalid query', 400);
    }
    return this.companies.list({
      limit: parsed.data.limit,
      cursor: parsed.data.cursor,
      query: parsed.data.q,
    });
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.companies.getById(id);
  }

  @Post()
  async create(
    @CurrentUser() actor: SessionUser | undefined,
    @Body() body: unknown,
  ) {
    if (!actor) {
      throw new AppException('unauthorized', 'Sign in required', 401);
    }
    const parsed = createCompanySchema.safeParse(body);
    if (!parsed.success) {
      throw new AppException('bad_request', 'Invalid company', 400);
    }
    return this.companies.create(actor, parsed.data);
  }

  @Patch(':id')
  async update(
    @CurrentUser() actor: SessionUser | undefined,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    if (!actor) {
      throw new AppException('unauthorized', 'Sign in required', 401);
    }
    const parsed = updateCompanySchema.safeParse(body);
    if (!parsed.success) {
      throw new AppException('bad_request', 'Invalid company', 400);
    }
    return this.companies.update(actor, id, parsed.data);
  }
}
