import { AppConfigService } from '../config/config.service';
import { FeatureRegistryService } from './feature-registry.service';

function configWithFeatures(keys: string[]): AppConfigService {
  return {
    enabledFeatures: keys,
    env: { FEATURES_ENABLED: keys.join(',') },
  } as AppConfigService;
}

describe('FeatureRegistryService', () => {
  it('uses enabled-modules.ts when FEATURES_ENABLED is empty', () => {
    const service = new FeatureRegistryService(configWithFeatures([]));
    expect(service.getEnabledFeatures().map((f) => f.key)).toEqual(['health']);
  });

  it('rejects unknown feature keys', () => {
    const service = new FeatureRegistryService(
      configWithFeatures(['not-a-feature']),
    );
    expect(() => service.getEnabledFeatures()).toThrow(/Unknown feature/);
  });
});