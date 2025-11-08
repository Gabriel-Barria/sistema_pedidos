import { Product, Variant, Addon, ProductCategory } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class VariantResponseDto {
  id!: string;
  name!: string;
  priceDelta!: number;
  sortOrder!: number;

  @Exclude()
  productId!: string;

  constructor(partial: Partial<Variant>) {
    Object.assign(this, partial);
  }
}

export class AddonResponseDto {
  id!: string;
  name!: string;
  price!: number;
  sortOrder!: number;

  @Exclude()
  productId!: string;

  constructor(partial: Partial<Addon>) {
    Object.assign(this, partial);
  }
}

export class CategoryMinimalDto {
  id!: string;
  name!: string;

  constructor(partial: { id: string; name: string }) {
    Object.assign(this, partial);
  }
}

export class ProductResponseDto {
  id!: string;
  name!: string;
  description!: string | null;
  sku!: string;
  price!: number;
  taxRate!: number;
  stock!: number;
  images!: string[];
  active!: boolean;
  deletedAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;

  variants?: VariantResponseDto[];
  addons?: AddonResponseDto[];
  categories?: CategoryMinimalDto[];

  @Exclude()
  tenantId!: string;

  constructor(partial: Partial<Product> & {
    variants?: Variant[];
    addons?: Addon[];
    categories?: ProductCategory[];
  }) {
    Object.assign(this, partial);

    if (partial.variants) {
      this.variants = partial.variants.map(v => new VariantResponseDto(v));
    }

    if (partial.addons) {
      this.addons = partial.addons.map(a => new AddonResponseDto(a));
    }

    if (partial.categories) {
      this.categories = partial.categories.map(pc =>
        new CategoryMinimalDto({
          id: (pc as any).category?.id || '',
          name: (pc as any).category?.name || ''
        })
      );
    }
  }
}
