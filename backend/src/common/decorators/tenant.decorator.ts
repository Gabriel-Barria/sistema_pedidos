import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Tenant } from '@prisma/client';

/**
 * Decorator to extract the current tenant from the request
 * Usage: @CurrentTenant() tenant: Tenant
 */
export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Tenant => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant;
  },
);

/**
 * Decorator to extract only the tenant ID from the request
 * Usage: @TenantId() tenantId: string
 */
export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant?.id;
  },
);
