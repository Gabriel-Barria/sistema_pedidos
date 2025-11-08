import { Role } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserResponseDto {
  id!: string;
  email!: string;

  @Exclude()
  passwordHash!: string;

  firstName!: string | null;
  lastName!: string | null;
  phone!: string | null;
  roles!: Role[];
  active!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
