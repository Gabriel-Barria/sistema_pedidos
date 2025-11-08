import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard to ensure that a valid tenant is present in the request.
 * This guard should be used after TenantMiddleware has run.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if endpoint is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenant = request.tenant;

    if (!tenant) {
      throw new UnauthorizedException(
        'Tenant context not found. Ensure TenantMiddleware is configured.',
      );
    }

    if (!tenant.active) {
      throw new UnauthorizedException('Tenant is not active');
    }

    return true;
  }
}
