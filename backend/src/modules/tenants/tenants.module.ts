import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsRepository } from './tenants.repository';

@Module({
  providers: [TenantsService, TenantsRepository],
  exports: [TenantsService, TenantsRepository],
})
export class TenantsModule {}
