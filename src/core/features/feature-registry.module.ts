import { Global, Module } from '@nestjs/common';
import { FeatureRegistryService } from './feature-registry.service';

@Global()
@Module({
  providers: [FeatureRegistryService],
  exports: [FeatureRegistryService],
})
export class FeatureRegistryModule {}