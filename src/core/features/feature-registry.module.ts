import { Global, Module } from '@nestjs/common';
import { FeatureRegistryService } from './feature-registry.service';
import { FeatureRouteGuard } from './feature-route.guard';

@Global()
@Module({
  providers: [FeatureRegistryService, FeatureRouteGuard],
  exports: [FeatureRegistryService, FeatureRouteGuard],
})
export class FeatureRegistryModule {}
