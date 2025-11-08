import { Injectable } from '@nestjs/common';
import { Product, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({ data });
  }

  async findAll(params: {
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
    skip?: number;
    take?: number;
    include?: Prisma.ProductInclude;
  }): Promise<Product[]> {
    return this.prisma.product.findMany(params);
  }

  async findById(
    id: string,
    include?: Prisma.ProductInclude,
  ): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include,
    });
  }

  async findBySku(
    tenantId: string,
    sku: string,
  ): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: {
        tenantId_sku: {
          tenantId,
          sku,
        },
      },
    });
  }

  async update(
    id: string,
    data: Prisma.ProductUpdateInput,
  ): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async hardDelete(id: string): Promise<Product> {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async count(where?: Prisma.ProductWhereInput): Promise<number> {
    return this.prisma.product.count({ where });
  }

  // Category relations
  async addCategories(productId: string, categoryIds: string[]): Promise<void> {
    await this.prisma.productCategory.createMany({
      data: categoryIds.map(categoryId => ({
        productId,
        categoryId,
      })),
      skipDuplicates: true,
    });
  }

  async removeCategories(productId: string, categoryIds?: string[]): Promise<void> {
    if (categoryIds && categoryIds.length > 0) {
      await this.prisma.productCategory.deleteMany({
        where: {
          productId,
          categoryId: { in: categoryIds },
        },
      });
    } else {
      await this.prisma.productCategory.deleteMany({
        where: { productId },
      });
    }
  }

  // Variants
  async createVariants(productId: string, variants: Omit<Prisma.VariantCreateManyInput, 'productId'>[]): Promise<void> {
    await this.prisma.variant.createMany({
      data: variants.map(v => ({ ...v, productId })),
    });
  }

  async deleteVariants(productId: string): Promise<void> {
    await this.prisma.variant.deleteMany({
      where: { productId },
    });
  }

  // Addons
  async createAddons(productId: string, addons: Omit<Prisma.AddonCreateManyInput, 'productId'>[]): Promise<void> {
    await this.prisma.addon.createMany({
      data: addons.map(a => ({ ...a, productId })),
    });
  }

  async deleteAddons(productId: string): Promise<void> {
    await this.prisma.addon.deleteMany({
      where: { productId },
    });
  }
}
