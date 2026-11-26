import { defineFeature } from './define-feature';

export const registeredFeatures = [
  defineFeature({ key: 'health', permissions: [] }),
  defineFeature({ key: 'auth-registration', permissions: [] }),
  defineFeature({
    key: 'auth-sessions',
    permissions: [],
  }),
  defineFeature({
    key: 'password-reset',
    dependsOn: ['auth-sessions'],
    permissions: [],
  }),
  defineFeature({
    key: 'admin-users',
    dependsOn: ['auth-sessions'],
    permissions: ['admin.users.read', 'admin.users.write'],
  }),
  defineFeature({
    key: 'admin-dashboard',
    dependsOn: ['admin-users'],
    permissions: ['admin.dashboard.read'],
  }),
  defineFeature({
    key: 'activity-log',
    dependsOn: ['admin-users'],
    permissions: ['admin.activity.read'],
  }),
];