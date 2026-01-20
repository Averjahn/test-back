import { Module, Global } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { ResourceAccessGuard } from './guards/resource-access.guard';

@Global()
@Module({
  providers: [JwtAuthGuard, RolesGuard, ResourceAccessGuard],
  exports: [JwtAuthGuard, RolesGuard, ResourceAccessGuard],
})
export class CommonModule {}
