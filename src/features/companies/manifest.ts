import { defineFeature } from '../../core/features/define-feature';

export default defineFeature({
  key: 'companies',
  dependsOn: ['roles-access'],
  permissions: [],
});
