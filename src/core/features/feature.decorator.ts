import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { FeatureRouteGuard } from './feature-route.guard';

export function Feature(featureKey: string) {
  return applyDecorators(
    SetMetadata('featureKey', featureKey),
    UseGuards(FeatureRouteGuard),
  );
}