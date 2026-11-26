import { defineFeature } from '../../core/features/define-feature';

export default defineFeature({
  key: 'admin-users',
  dependsOn: ['auth-sessions'],
  permissions: ['admin.users.read', 'admin.users.write'],
});