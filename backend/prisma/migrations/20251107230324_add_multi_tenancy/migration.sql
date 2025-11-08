-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "config" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_domain_key" ON "tenants"("domain");

-- Insert default tenant for existing data
INSERT INTO "tenants" ("id", "name", "slug", "active", "created_at", "updated_at")
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Tenant', 'default', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable - Add tenant_id column with default value pointing to default tenant
ALTER TABLE "users" ADD COLUMN "tenant_id" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001';

-- Remove the default value constraint after populating existing rows
ALTER TABLE "users" ALTER COLUMN "tenant_id" DROP DEFAULT;

-- DropIndex - Remove old unique constraint on email
DROP INDEX "users_email_key";

-- CreateIndex - Add composite unique constraint on tenantId + email
CREATE UNIQUE INDEX "users_tenant_id_email_key" ON "users"("tenant_id", "email");

-- CreateIndex - Add index for tenant_id + email lookups
CREATE INDEX "users_tenant_id_email_idx" ON "users"("tenant_id", "email");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
