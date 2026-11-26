import { defineFeature } from '../../core/features/define-feature';

export default defineFeature({
  key: 'roles-access',
  dependsOn: ['admin-users'],
  permissions: ['admin.users.write'],
});
