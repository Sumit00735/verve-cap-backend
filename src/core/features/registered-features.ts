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
    key: 'user-dashboard',
    dependsOn: ['auth-sessions'],
    permissions: [],
  }),
  defineFeature({
    key: 'profile',
    dependsOn: ['auth-sessions'],
    permissions: [],
  }),
  defineFeature({
    key: 'companies',
    dependsOn: ['auth-sessions'],
    permissions: [],
  }),
  defineFeature({
    key: 'api-integration',
    dependsOn: ['companies'],
    permissions: [],
  }),
  defineFeature({
    key: 'admin-dashboard',
    dependsOn: ['auth-sessions'],
    permissions: [],
  }),
  defineFeature({
    key: 'admin-users',
    dependsOn: ['admin-dashboard'],
    permissions: [],
  }),
  defineFeature({
    key: 'activity-log',
    dependsOn: ['admin-dashboard'],
    permissions: [],
  }),
  defineFeature({
    key: 'matters',
    dependsOn: ['auth-sessions'],
    permissions: [],
  }),
  defineFeature({
    key: 'dd-requests',
    dependsOn: ['matters'],
    permissions: [],
  }),
  defineFeature({
    key: 'documents',
    dependsOn: ['matters'],
    permissions: [],
  }),
  defineFeature({
    key: 'document-review',
    dependsOn: ['documents', 'dd-requests'],
    permissions: [],
  }),
  defineFeature({
    key: 'investor-invites',
    dependsOn: ['matters'],
    permissions: [],
  }),
  defineFeature({
    key: 'nda-consent',
    dependsOn: ['investor-invites'],
    permissions: [],
  }),
  defineFeature({
    key: 'deal-room',
    dependsOn: ['documents', 'nda-consent'],
    permissions: [],
  }),
  defineFeature({
    key: 'ai-search',
    dependsOn: ['documents', 'deal-room'],
    permissions: [],
  }),
  defineFeature({
    key: 'reports',
    dependsOn: ['matters'],
    permissions: [],
  }),
];
