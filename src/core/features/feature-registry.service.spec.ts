import { AppConfigService } from '../config/config.service';
import { FeatureRegistryService } from './feature-registry.service';

function configWithFeatures(keys: string[]): AppConfigService {
  return {
    enabledFeatures: keys,
    env: { FEATURES_ENABLED: keys.join(',') },
  } as AppConfigService;
}

describe('FeatureRegistryService', () => {
  it('enables all registered features when FEATURES_ENABLED is empty', () => {
    const service = new FeatureRegistryService(configWithFeatures([]));
    expect(service.getEnabledFeatures().map((f) => f.key)).toEqual([
      'health',
      'auth-registration',
      'auth-sessions',
      'password-reset',
      'admin-users',
      'admin-dashboard',
      'activity-log',
    ]);
  });

  it('rejects unknown feature keys', () => {
    const service = new FeatureRegistryService(
      configWithFeatures(['not-a-feature']),
    );
    expect(() => service.getEnabledFeatures()).toThrow(/Unknown feature/);
  });
});
