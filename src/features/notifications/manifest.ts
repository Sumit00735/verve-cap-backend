import { defineFeature } from '../../core/features/define-feature';

export default defineFeature({
  key: 'notifications',
  dependsOn: ['auth-sessions'],
  permissions: ['admin.emails.read'],
});
