import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  tenantSlug!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}
