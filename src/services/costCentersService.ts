import { Octokit } from '@octokit/rest';
import type {
  AppError,
  AuthenticatedUser,
  Budget,
  CostCenter,
} from '../types';

/**
 * Throws a typed AppError with an HTTP status and human-readable message.
 */
function toAppError(status: number | undefined, fallbackMessage: string): AppError {
  if (status === 401) {
    return {
      status,
      message:
        'Invalid token or insufficient scope. The token needs the `manage_billing:enterprise` or `read:enterprise` scope.',
    };
  }
  if (status === 403) {
    return {
      status,
      message:
        "Your token doesn't have permission to access this enterprise's billing data.",
    };
  }
  if (status === 404) {
    return {
      status,
      message:
        'Enterprise not found (404). Make sure you entered the URL slug, not the display name. ' +
        'The slug is the identifier in your enterprise URL: github.com/enterprises/YOUR_SLUG. ' +
        'It is lowercase with hyphens and never contains spaces (e.g. "my-org", not "My Org").',
    };
  }
  return { status, message: fallbackMessage };
}

/**
 * Validates the provided token by calling GET /user.
 * Cheap call, always available regardless of enterprise settings.
 */
export async function validateToken(octokit: Octokit): Promise<AuthenticatedUser> {
  try {
    const { data } = await octokit.rest.users.getAuthenticated();
    return { login: data.login, name: data.name ?? null };
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    throw toAppError(e.status, e.message ?? 'Failed to authenticate with GitHub.');
  }
}

/**
 * Fetches all cost centers for the given enterprise, paginating automatically.
 */
export async function fetchCostCenters(
  octokit: Octokit,
  enterprise: string
): Promise<CostCenter[]> {
  const allCostCenters: CostCenter[] = [];
  let page = 1;
  const perPage = 100;

  try {
    while (true) {
      const response = await octokit.request(
        'GET /enterprises/{enterprise}/settings/billing/cost-centers',
        {
          enterprise,
          per_page: perPage,
          page,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28',
          },
        }
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = response.data as any;

      // Real API returns camelCase "costCenters"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawList: any[] = data.costCenters ?? data.cost_centers ?? [];

      const costCenters: CostCenter[] = rawList.map((cc: any) => ({
        id: String(cc.id),
        name: String(cc.name),
        state: cc.state === 'deleted' ? 'deleted' : 'active',
        resources: (cc.resources ?? []).map((r: any) => ({
          type: r.type as 'User' | 'Repo' | 'Org',
          name: String(r.name),
        })),
      }));

      allCostCenters.push(...costCenters);

      if (rawList.length < perPage) {
        break;
      }

      page++;
    }
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    throw toAppError(e.status, e.message ?? 'Failed to fetch cost centers.');
  }

  return allCostCenters;
}

/**
 * Fetches all budgets for the given enterprise, paginating automatically.
 */
export async function fetchBudgets(
  octokit: Octokit,
  enterprise: string
): Promise<Budget[]> {
  const allBudgets: Budget[] = [];
  let page = 1;
  const perPage = 100;

  try {
    while (true) {
      const response = await octokit.request(
        'GET /enterprises/{enterprise}/settings/billing/budgets',
        {
          enterprise,
          per_page: perPage,
          page,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28',
          },
        }
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = response.data as any;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawList: any[] = data.budgets ?? data.budget_list ?? [];

      const budgets: Budget[] = rawList.map((b: any) => ({
        id: String(b.id),
        budgetType: String(b.budget_type ?? ''),
        productSku: String(b.budget_product_sku ?? ''),
        scope: String(b.budget_scope ?? '') as Budget['scope'],
        budgetAmount: Number(b.budget_amount ?? 0),
        preventFurtherUsage: Boolean(b.prevent_further_usage),
        entityName: String(b.budget_entity_name ?? ''),
        alerting: {
          willAlert: Boolean(b.budget_alerting?.will_alert),
          alertRecipients: (b.budget_alerting?.alert_recipients ?? []).map(String),
        },
      }));

      allBudgets.push(...budgets);

      if (!data.has_next_page) {
        break;
      }

      page++;
    }
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    throw toAppError(e.status, e.message ?? 'Failed to fetch budgets.');
  }

  return allBudgets;
}
