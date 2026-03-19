import { Octokit } from '@octokit/rest';

/**
 * Creates an Octokit REST client configured with the provided PAT and base URL.
 * The token is stored only in memory (caller's React state) and never persisted.
 */
export function createOctokitClient(token: string, baseUrl: string): Octokit {
  return new Octokit({
    auth: token,
    baseUrl,
  });
}

/**
 * Derives the REST API base URL from a user-supplied GitHub hostname.
 * - github.com (default) → https://api.github.com
 * - *.ghe.com (enterprise cloud subdomain) → https://api.SUBDOMAIN.ghe.com
 * - anything else (GHES self-hosted) → https://HOSTNAME/api/v3
 */
export function deriveBaseUrl(hostname: string): string {
  const trimmed = hostname.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');

  if (!trimmed || trimmed === 'github.com') {
    return 'https://api.github.com';
  }

  if (trimmed.endsWith('.ghe.com')) {
    const sub = trimmed.replace('.ghe.com', '');
    return `https://api.${sub}.ghe.com`;
  }

  // GHES self-hosted
  return `https://${trimmed}/api/v3`;
}
