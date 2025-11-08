import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Product } from '@prisma/client';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { TenantContext } from '../tenants/tenant-context';
import { CacheService } from '../../infrastructure/cache/cache.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly cacheService: CacheService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    // Check if SKU already exists for this tenant
    const existing = await this.productsRepository.findBySku(
      tenantId,
      createProductDto.sku,
    );
    if (existing) {
      throw new ConflictException('Product SKU already exists in this tenant');
    }

    const { categoryIds, variants, addons, ...productData } = createProductDto;

    // Create product with tenant relation
    const product = await this.productsRepository.create({
      ...productData,
      tenant: { connect: { id: tenantId } },
    });

    // Add categories if provided
    if (categoryIds && categoryIds.length > 0) {
      await this.productsRepository.addCategories(product.id, categoryIds);
    }

    // Add variants if provided
    if (variants && variants.length > 0) {
      await this.productsRepository.createVariants(product.id, variants);
    }

    // Add addons if provided
    if (addons && addons.length > 0) {
      await this.productsRepository.createAddons(product.id, addons);
    }

    // Invalidate cache for this tenant
    await this.cacheService.invalidatePattern(`catalog:${tenantId}:*`);

    return this.findById(product.id);
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    active?: boolean;
    search?: string;
    categoryId?: string;
  }): Promise<Product[]> {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    // Generate cache key
    const cacheKey = `catalog:${tenantId}:${JSON.stringify(params || {})}`;

    // Try cache first
    const cached = await this.cacheService.get<Product[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const where: any = {
      tenantId,
      deletedAt: null, // Exclude soft-deleted products
    };

    if (params?.active !== undefined) {
      where.active = params.active;
    }

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { sku: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params?.categoryId) {
      where.categories = {
        some: {
          categoryId: params.categoryId,
        },
      };
    }

    const products = await this.productsRepository.findAll({
      where,
      orderBy: { createdAt: 'desc' },
      skip: params?.skip,
      take: params?.take,
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' },
        },
        addons: {
          orderBy: { sortOrder: 'asc' },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Cache result for 5 minutes (300 seconds)
    await this.cacheService.set(cacheKey, products, 300);

    return products;
  }

  async findById(id: string): Promise<Product> {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const product = await this.productsRepository.findById(id, {
      variants: {
        orderBy: { sortOrder: 'asc' },
      },
      addons: {
        orderBy: { sortOrder: 'asc' },
      },
      categories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Validate product belongs to current tenant
    if (product.tenantId !== tenantId) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    // Validate product exists and belongs to tenant
    await this.findById(id);

    const tenantId = TenantContext.getTenantId()!;

    // If updating SKU, check for conflicts
    if (updateProductDto.sku) {
      const existing = await this.productsRepository.findBySku(
        tenantId,
        updateProductDto.sku,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException('Product SKU already exists in this tenant');
      }
    }

    const { categoryIds, variants, addons, ...productData } = updateProductDto;

    // Update product data
    const product = await this.productsRepository.update(id, productData);

    // Update categories if provided
    if (categoryIds !== undefined) {
      await this.productsRepository.removeCategories(id);
      if (categoryIds.length > 0) {
        await this.productsRepository.addCategories(id, categoryIds);
      }
    }

    // Update variants if provided
    if (variants !== undefined) {
      await this.productsRepository.deleteVariants(id);
      if (variants.length > 0) {
        await this.productsRepository.createVariants(id, variants);
      }
    }

    // Update addons if provided
    if (addons !== undefined) {
      await this.productsRepository.deleteAddons(id);
      if (addons.length > 0) {
        await this.productsRepository.createAddons(id, addons);
      }
    }

    // Invalidate cache for this tenant
    await this.cacheService.invalidatePattern(`catalog:${tenantId}:*`);

    return this.findById(id);
  }

  async delete(id: string, hard: boolean = false): Promise<Product> {
    // Validate product exists and belongs to tenant
    const product = await this.findById(id);

    const tenantId = TenantContext.getTenantId()!;

    let result: Product;
    if (hard) {
      result = await this.productsRepository.hardDelete(id);
    } else {
      result = await this.productsRepository.softDelete(id);
    }

    // Invalidate cache for this tenant
    await this.cacheService.invalidatePattern(`catalog:${tenantId}:*`);

    return result;
  }
}
