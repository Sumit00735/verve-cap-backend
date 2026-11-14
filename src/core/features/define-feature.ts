export type FeatureDefinition = {
  key: string;
  dependsOn?: string[];
  permissions?: string[];
  publishes?: string[];
};

export function defineFeature(definition: FeatureDefinition): FeatureDefinition {
  return definition;
}