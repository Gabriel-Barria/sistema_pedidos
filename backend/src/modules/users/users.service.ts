import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(createUserDto.password, 12);

    // Create user
    const { password, ...userData } = createUserDto;
    return this.usersRepository.create({
      ...userData,
      passwordHash,
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    active?: boolean;
  }): Promise<User[]> {
    return this.usersRepository.findAll({
      skip: params?.skip,
      take: params?.take,
      where: params?.active !== undefined ? { active: params.active } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
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
