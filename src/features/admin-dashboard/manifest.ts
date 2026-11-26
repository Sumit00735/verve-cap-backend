import { defineFeature } from '../../core/features/define-feature';

export default defineFeature({
  key: 'admin-dashboard',
  dependsOn: ['admin-users'],
  permissions: ['admin.dashboard.read'],
});
