import { Injectable } from '@nestjs/common';
import { Tenant, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class TenantsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.TenantCreateInput): Promise<Tenant> {
    return this.prisma.tenant.create({ data });
  }

  async findById(id: string): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({ where: { slug } });
  }

  async findByDomain(domain: string): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({ where: { domain } });
  }

  async findAll(): Promise<Tenant[]> {
    return this.prisma.tenant.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(
    id: string,
    data: Prisma.TenantUpdateInput,
  ): Promise<Tenant> {
    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Tenant> {
    return this.prisma.tenant.delete({ where: { id } });
  }
}
