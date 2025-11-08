import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TenantsService } from '../tenants/tenants.service';
import { TenantContext } from '../tenants/tenant-context';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly tenantsService: TenantsService,
  ) {}

  async create(createUserDto: CreateUserDto & { tenantSlug?: string }): Promise<User> {
    // Resolve tenant
    let tenantId: string;
    if (createUserDto.tenantSlug) {
      const tenant = await this.tenantsService.findBySlug(createUserDto.tenantSlug);
      if (!tenant) {
        throw new BadRequestException(`Tenant with slug "${createUserDto.tenantSlug}" not found`);
      }
      tenantId = tenant.id;
    } else {
      throw new BadRequestException('tenantSlug is required');
    }

    // Check if user already exists in this tenant
    const existingUser = await this.usersRepository.findByEmail(
      createUserDto.email,
      tenantId,
    );
    if (existingUser) {
      throw new ConflictException('Email already registered in this tenant');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(createUserDto.password, 12);

    // Create user
    const { password, tenantSlug, ...userData } = createUserDto;

    return this.usersRepository.create({
      ...userData,
      tenant: { connect: { id: tenantId } },
      passwordHash,
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    active?: boolean;
  }): Promise<User[]> {
    // Get tenant from context
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const where: any = { tenantId };
    if (params?.active !== undefined) {
      where.active = params.active;
    }

    return this.usersRepository.findAll({
      skip: params?.skip,
      take: params?.take,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<User> {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate user belongs to current tenant
    if (user.tenantId !== tenantId) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string, tenantId?: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email, tenantId);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Check if user exists
    await this.findById(id);

    return this.usersRepository.update(id, updateUserDto);
  }

  async delete(id: string): Promise<User> {
    // Check if user exists
    await this.findById(id);

    return this.usersRepository.delete(id);
  }

  async validatePassword(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }
}
