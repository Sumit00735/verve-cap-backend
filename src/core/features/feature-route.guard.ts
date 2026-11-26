import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AppException } from '../errors/app.exception';
import { FeatureRegistryService } from './feature-registry.service';

export function RequireFeature(featureKey: string): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata('featureKey', featureKey, target);
  };
}

@Injectable()
export class FeatureRouteGuard implements CanActivate {
  constructor(private readonly registry: FeatureRegistryService) {}

  canActivate(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const controller = context.getClass();
    const featureKey =
      (Reflect.getMetadata('featureKey', handler) as string | undefined) ??
      (Reflect.getMetadata('featureKey', controller) as string | undefined);

    if (!featureKey) {
      return true;
    }

    const enabled = new Set(
      this.registry.getEnabledFeatures().map((feature) => feature.key),
    );
    if (!enabled.has(featureKey)) {
      const request = context.switchToHttp().getRequest<FastifyRequest>();
      void request;
      throw new AppException('not_found', 'Not found', 404);
    }

    return true;
  }
}