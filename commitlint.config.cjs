// NEXT — Conventional Commits enforcement
// Scope corresponds to top-level domain: web, mobile, auth, media, recommendation, etc.

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // new feature
        'fix', // bug fix
        'perf', // performance improvement
        'refactor', // refactor without behavior change
        'docs', // documentation only
        'test', // tests only
        'build', // build system / deps
        'ci', // CI config
        'chore', // misc maintenance
        'style', // formatting only
        'revert', // revert a prior commit
        'security', // security-related fix
        'infra', // infrastructure changes
        'breaking', // breaking change
      ],
    ],
    'subject-case': [2, 'always', ['sentence-case', 'lower-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 120],
    'scope-enum': [
      2,
      'always',
      [
        // Apps
        'web',
        'mobile',
        'admin',
        'studio',
        'tv',
        'immersive',
        // Services
        'identity',
        'auth',
        'profile',
        'session',
        'device-graph',
        'trust',
        'identity-graph',
        'creator-identity',
        'access-control',
        'account-recovery',
        'notification-auth',
        'auth-portal',
        'account-center',
        'identity-types',
        'session-utils',
        'security-utils',
        'permissions',
        'trust-events',
        'media',
        'upload',
        'live',
        'feed',
        'recommendation',
        'search',
        'community',
        'payment',
        'notification',
        'moderation',
        'analytics',
        'event-gateway',
        'api-gateway',
        // AI
        'ai',
        'ml-rec',
        'ml-semantic',
        'ml-video',
        'ml-multimodal',
        'ml-copilot',
        'ml-moderation',
        'ml-search',
        'ml-vector',
        // Shared
        'ui',
        'design',
        'config',
        'types',
        'events',
        'auth-sdk',
        'logger',
        'telemetry',
        'database',
        'api-client',
        'feature-flags',
        // Infra
        'infra',
        'k8s',
        'terraform',
        'helm',
        'ci',
        'observability',
        'security',
        'kafka',
        // Meta
        'deps',
        'repo',
        'docs',
      ],
    ],
  },
};
