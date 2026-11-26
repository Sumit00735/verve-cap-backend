import { defineFeature } from '../../core/features/define-feature';

export default defineFeature({
  key: 'profile',
  dependsOn: ['auth-sessions'],
  permissions: [],
});
