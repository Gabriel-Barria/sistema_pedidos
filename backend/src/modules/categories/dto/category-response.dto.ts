import { Category } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class CategoryResponseDto {
  id!: string;
  name!: string;
  description!: string | null;
  image!: string | null;
  sortOrder!: number;
  active!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  @Exclude()
  tenantId!: string;

  constructor(partial: Partial<Category>) {
    Object.assign(this, partial);
  }
}
