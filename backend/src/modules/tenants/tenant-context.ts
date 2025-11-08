import { AsyncLocalStorage } from 'async_hooks';
import { Tenant } from '@prisma/client';

/**
 * TenantContext manages the current tenant for each request using AsyncLocalStorage.
 * This allows us to access the tenant anywhere in the request lifecycle without
 * passing it explicitly through function parameters.
 */
export class TenantContext {
  private static storage = new AsyncLocalStorage<Tenant>();

  /**
   * Set the current tenant for the async context
   */
  static set(tenant: Tenant): void {
    this.storage.enterWith(tenant);
  }

  /**
   * Get the current tenant from the async context
   */
  static get(): Tenant | undefined {
    return this.storage.getStore();
  }

  /**
   * Get the current tenant ID from the async context
   */
  static getTenantId(): string | undefined {
    return this.storage.getStore()?.id;
  }

  /**
   * Clear the current tenant context
   */
  static clear(): void {
    this.storage.disable();
  }
}
