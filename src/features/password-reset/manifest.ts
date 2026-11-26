import { defineFeature } from '../../core/features/define-feature';

export default defineFeature({
  key: 'password-reset',
  dependsOn: ['auth-sessions'],
  permissions: [],
});