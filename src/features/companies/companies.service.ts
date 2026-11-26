import { Injectable } from '@nestjs/common';
import { Company, Prisma } from '@prisma/client';
import type { SessionUser } from '../../core/auth/auth.types';
import { AppException } from '../../core/errors/app.exception';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import type { CreateCompanyInput } from './dto/create-company.dto';
import type { UpdateCompanyInput } from './dto/update-company.dto';
import { normalizeCompanyName, normalizeIdentifier } from './normalize-company';

type CompanyListItem = {
  id: string;
  name: string;
  cin: string | null;
  isin: string | null;
  symbol: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class CompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityLogService,
  ) {}

  async list(params: { limit: number; cursor?: string; query?: string }) {
    const q = params.query?.trim();
    if (q) {
      return this.search(q, params.limit);
    }

    const rows = await this.prisma.company.findMany({
      take: params.limit + 1,
      orderBy: { createdAt: 'desc' },
      ...(params.cursor
        ? { cursor: { id: params.cursor }, skip: 1 }
        : undefined),
    });

    return this.paginate(rows, params.limit);
  }

  async getById(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new AppException('not_found', 'Not found', 404);
    }
    return this.toResponse(company);
  }

  async create(actor: SessionUser, input: CreateCompanyInput) {
    const cin = input.cin?.trim() ? normalizeIdentifier(input.cin) : undefined;
    const isin = input.isin?.trim()
      ? normalizeIdentifier(input.isin)
      : undefined;
    const symbol = input.symbol?.trim()
      ? normalizeIdentifier(input.symbol)
      : undefined;
    const normalizedName = normalizeCompanyName(input.name);

    await this.assertNotDuplicate({ normalizedName, cin, isin, symbol });

    try {
      const company = await this.prisma.company.create({
        data: {
          name: input.name.trim(),
          normalizedName,
          cin,
          isin,
          symbol,
          createdById: actor.id,
        },
      });

      await this.activity.record({
        actorId: actor.id,
        action: 'company.created',
        targetType: 'company',
        targetId: company.id,
        detail: company.name,
      });

      return this.toResponse(company);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new AppException(
          'duplicate_company',
          'A matching company already exists',
          409,
        );
      }
      throw error;
    }
  }

  async update(actor: SessionUser, id: string, input: UpdateCompanyInput) {
    const existing = await this.prisma.company.findUnique({ where: { id } });
    if (!existing) {
      throw new AppException('not_found', 'Not found', 404);
    }

    const name = input.name?.trim() ?? existing.name;
    const normalizedName =
      input.name !== undefined
        ? normalizeCompanyName(input.name)
        : existing.normalizedName;
    const cin =
      input.cin === undefined
        ? existing.cin
        : input.cin === null
          ? null
          : normalizeIdentifier(input.cin);
    const isin =
      input.isin === undefined
        ? existing.isin
        : input.isin === null
          ? null
          : normalizeIdentifier(input.isin);
    const symbol =
      input.symbol === undefined
        ? existing.symbol
        : input.symbol === null
          ? null
          : normalizeIdentifier(input.symbol);

    await this.assertNotDuplicate(
      {
        normalizedName,
        cin: cin ?? undefined,
        isin: isin ?? undefined,
        symbol: symbol ?? undefined,
      },
      id,
    );

    try {
      const company = await this.prisma.company.update({
        where: { id },
        data: {
          name,
          normalizedName,
          cin,
          isin,
          symbol,
        },
      });

      await this.activity.record({
        actorId: actor.id,
        action: 'company.updated',
        targetType: 'company',
        targetId: company.id,
        detail: company.name,
      });

      return this.toResponse(company);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new AppException(
          'duplicate_company',
          'A matching company already exists',
          409,
        );
      }
      throw error;
    }
  }

  private async search(query: string, limit: number) {
    const pattern = `%${query}%`;
    const rows = await this.prisma.$queryRaw<CompanyListItem[]>`
      SELECT
        c.id,
        c.name,
        c.cin,
        c.isin,
        c.symbol,
        c."createdAt",
        c."updatedAt"
      FROM "Company" c
      WHERE
        c.name % ${query}
        OR c.name ILIKE ${pattern}
        OR COALESCE(c.cin, '') ILIKE ${pattern}
        OR COALESCE(c.isin, '') ILIKE ${pattern}
        OR COALESCE(c.symbol, '') ILIKE ${pattern}
      ORDER BY similarity(c.name, ${query}) DESC, c."createdAt" DESC
      LIMIT ${limit + 1}
    `;

    return this.paginate(rows, limit);
  }

  private paginate(rows: CompanyListItem[] | Company[], limit: number) {
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    return {
      items: items.map((row) => this.toResponse(row)),
      nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null,
    };
  }

  private toResponse(company: Company | CompanyListItem) {
    return {
      id: company.id,
      name: company.name,
      cin: company.cin,
      isin: company.isin,
      symbol: company.symbol,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
    };
  }

  private async assertNotDuplicate(
    input: {
      normalizedName: string;
      cin?: string;
      isin?: string;
      symbol?: string;
    },
    excludeId?: string,
  ): Promise<void> {
    const or: Prisma.CompanyWhereInput[] = [
      { normalizedName: input.normalizedName },
    ];
    if (input.cin) {
      or.push({ cin: input.cin });
    }
    if (input.isin) {
      or.push({ isin: input.isin });
    }
    if (input.symbol) {
      or.push({ symbol: input.symbol });
    }

    const duplicate = await this.prisma.company.findFirst({
      where: {
        OR: or,
        ...(excludeId ? { NOT: { id: excludeId } } : undefined),
      },
    });

    if (duplicate) {
      throw new AppException(
        'duplicate_company',
        'A matching company already exists',
        409,
      );
    }
  }
}
