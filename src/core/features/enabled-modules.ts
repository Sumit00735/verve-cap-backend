/** Plug-and-play switchboard. Set a key to true to mount it. FEATURES_ENABLED env overrides when set. */
export const enabledModules = {
  health: true,

  "auth-registration": false,
  "auth-sessions": false,
  "password-reset": false,

  "user-dashboard": false,
  profile: false,
  companies: false,
  "api-integration": false,

  "admin-dashboard": false,
  "admin-users": false,
  "activity-log": false,

  matters: false,
  "dd-requests": false,
  documents: false,
  "document-review": false,
  "investor-invites": false,
  "nda-consent": false,
  "deal-room": false,
  "ai-search": false,
  reports: false,
} as const;

export type ModuleKey = keyof typeof enabledModules;
