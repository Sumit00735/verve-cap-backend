import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../config/config.service';
import { AppException } from '../errors/app.exception';
import type { FeatureDefinition } from './define-feature';
import { enabledModules, type ModuleKey } from './enabled-modules';
import { registeredFeatures } from './registered-features';

@Injectable()
export class FeatureRegistryService {
  constructor(private readonly config: AppConfigService) {}

  getEnabledFeatures(): FeatureDefinition[] {
    const enabledKeys = this.resolveEnabledKeys();
    const enabledSet = new Set(enabledKeys);
    const known = new Map(
      registeredFeatures.map((feature) => [feature.key, feature]),
    );

    for (const key of enabledKeys) {
      if (!known.has(key)) {
        throw new AppException(
          'unknown_feature',
          `Unknown feature key: ${key}`,
          500,
        );
      }
    }

    for (const key of enabledKeys) {
      const feature = known.get(key);
      if (!feature?.dependsOn?.length) {
        continue;
      }
      for (const dependency of feature.dependsOn) {
        if (!enabledSet.has(dependency)) {
          throw new AppException(
            'feature_dependency',
            `Feature ${key} requires ${dependency}`,
            500,
          );
        }
      }
    }

    return enabledKeys.map((key) => known.get(key)!);
  }

  getEnabledPermissions(): string[] {
    const permissions = new Set<string>();
    for (const feature of this.getEnabledFeatures()) {
      for (const permission of feature.permissions ?? []) {
        permissions.add(permission);
      }
    }
    return [...permissions];
  }

  private resolveEnabledKeys(): string[] {
    const configured = this.config.enabledFeatures;
    if (configured.length > 0) {
      return configured;
    }
    return (Object.keys(enabledModules) as ModuleKey[]).filter(
      (key) => enabledModules[key],
    );
  }
}