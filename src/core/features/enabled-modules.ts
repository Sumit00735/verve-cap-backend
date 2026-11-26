/** Plug-and-play switchboard. Set a key to true to mount it. FEATURES_ENABLED env overrides when set. */
export const enabledModules = {
  health: true,

  'auth-registration': true,
  'auth-sessions': true,
  'password-reset': true,

  'admin-users': true,
  'admin-dashboard': true,
  'activity-log': true,
  notifications: true,
  'roles-access': true,
  profile: true,
  companies: true,
} as const;

export type ModuleKey = keyof typeof enabledModules;
