import { defineFeature } from '../../core/features/define-feature';

export default defineFeature({
  key: 'activity-log',
  dependsOn: ['admin-users'],
  permissions: ['admin.activity.read'],
});