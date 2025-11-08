import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from './tenants.service';
import { TenantContext } from './tenant-context';
import { Tenant } from '@prisma/client';

// Extend Express Request to include tenant
declare global {
  namespace Express {
    interface Request {
      tenant?: Tenant;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantsService: TenantsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip tenant resolution for public endpoints
    if (this.isPublicEndpoint(req.path)) {
      return next();
    }

    try {
      let tenant: Tenant | null = null;

      // Strategy 1: Extract from X-Tenant-Id header
      const tenantIdHeader = req.headers['x-tenant-id'] as string;
      if (tenantIdHeader) {
        tenant = await this.tenantsService.findById(tenantIdHeader);
      }

      // Strategy 2: Extract from X-Tenant-Slug header
      if (!tenant) {
        const tenantSlug = req.headers['x-tenant-slug'] as string;
        if (tenantSlug) {
          tenant = await this.tenantsService.findBySlug(tenantSlug);
        }
      }

      // Strategy 3: Extract from subdomain (e.g., tenant1.example.com)
      if (!tenant) {
        const host = req.headers.host;
        if (host) {
          const subdomain = host.split('.')[0];
          if (subdomain && subdomain !== 'localhost' && !subdomain.match(/^\d+$/)) {
            tenant = await this.tenantsService.findBySlug(subdomain);
          }
        }
      }

      // Strategy 4: Extract from custom domain
      if (!tenant) {
        const host = req.headers.host;
        if (host) {
          tenant = await this.tenantsService.findByDomain(host);
        }
      }

      // Strategy 5: Extract from JWT payload (will be set by auth guard)
      // This is handled in the JWT strategy

      if (!tenant) {
        throw new UnauthorizedException('Tenant not found. Please provide X-Tenant-Id or X-Tenant-Slug header.');
      }

      if (!tenant.active) {
        throw new UnauthorizedException('Tenant is not active');
      }

      // Store tenant in request and AsyncLocalStorage context
      req.tenant = tenant;
      TenantContext.set(tenant);

      next();
    } catch (error) {
      next(error);
    }
  }

  private isPublicEndpoint(path: string): boolean {
    const publicPaths = [
      '/api/health',
      '/api/auth/register',
      '/api/auth/login',
    ];
    return publicPaths.some((publicPath) => path.startsWith(publicPath));
  }
}
