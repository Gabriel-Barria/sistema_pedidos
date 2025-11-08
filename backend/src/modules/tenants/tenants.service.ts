import { Injectable, NotFoundException } from '@nestjs/common';
import { Tenant } from '@prisma/client';
import { TenantsRepository } from './tenants.repository';

@Injectable()
export class TenantsService {
  constructor(private readonly repository: TenantsRepository) {}

  async findById(id: string): Promise<Tenant> {
    const tenant = await this.repository.findById(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.repository.findBySlug(slug);
  }

  async findByDomain(domain: string): Promise<Tenant | null> {
    return this.repository.findByDomain(domain);
  }

  async findAll(): Promise<Tenant[]> {
    return this.repository.findAll();
  }
}
