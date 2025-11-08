import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Category } from '@prisma/client';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TenantContext } from '../tenants/tenant-context';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    // Check if category name already exists for this tenant
    const existing = await this.categoriesRepository.findByName(
      tenantId,
      createCategoryDto.name,
    );
    if (existing) {
      throw new ConflictException('Category name already exists in this tenant');
    }

    return this.categoriesRepository.create({
      ...createCategoryDto,
      tenant: { connect: { id: tenantId } },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    active?: boolean;
  }): Promise<Category[]> {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const where: any = { tenantId };
    if (params?.active !== undefined) {
      where.active = params.active;
    }

    return this.categoriesRepository.findAll({
      where,
      orderBy: { sortOrder: 'asc' },
      skip: params?.skip,
      take: params?.take,
    });
  }

  async findById(id: string): Promise<Category> {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Validate category belongs to current tenant
    if (category.tenantId !== tenantId) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    // Validate category exists and belongs to tenant
    await this.findById(id);

    // If updating name, check for conflicts
    if (updateCategoryDto.name) {
      const tenantId = TenantContext.getTenantId()!;
      const existing = await this.categoriesRepository.findByName(
        tenantId,
        updateCategoryDto.name,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException('Category name already exists in this tenant');
      }
    }

    return this.categoriesRepository.update(id, updateCategoryDto);
  }

  async delete(id: string): Promise<Category> {
    // Validate category exists and belongs to tenant
    await this.findById(id);

    return this.categoriesRepository.delete(id);
  }
}
