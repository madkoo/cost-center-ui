// Authentication state stored ONLY in React component memory
export interface AuthState {
  token: string;
  enterprise: string;
  baseUrl: string;
}

// A single resource within a cost center (user, repo, or org)
export interface CostCenterResource {
  type: 'User' | 'Repo' | 'Org';
  name: string; // login for User, "Org/Repo" for Repo, slug for Org
}

// A single cost center returned by the GitHub Enterprise billing API
export interface CostCenter {
  id: string;
  name: string;
  state: 'active' | 'deleted';
  resources: CostCenterResource[];
}

// Top-level API response shape (actual shape from GitHub API)
export interface CostCentersResponse {
  costCenters: CostCenter[];
}

// Alert configuration for a budget
export interface BudgetAlerting {
  willAlert: boolean;
  alertRecipients: string[];
}

// Scope enum from official GitHub billing API schema
export type BudgetScope = 'enterprise' | 'organization' | 'repository' | 'cost_center';

// A single budget returned by the GitHub Enterprise billing API
export interface Budget {
  id: string;
  budgetType: 'ProductPricing' | 'SkuPricing' | string; // schema: ProductPricing|SkuPricing; BundlePricing seen in practice
  productSku: string; // e.g. "actions", "codespaces", "premium_requests"
  scope: BudgetScope;
  budgetAmount: number;
  preventFurtherUsage: boolean;
  entityName: string;
  alerting: BudgetAlerting;
}

// Top-level API response for budgets
export interface BudgetsResponse {
  budgets: Budget[];
  hasNextPage: boolean;
  totalCount: number;
}

// Sort keys for the budgets table
export type BudgetSortKey = 'productSku' | 'budgetType' | 'budgetAmount' | 'scope';

// Sort order direction for budget list sorting
export type SortDirection = 'asc' | 'desc';

// Typed application error for display in the UI
export interface AppError {
  message: string;
  status?: number;
}

// Shape returned after token validation
export interface AuthenticatedUser {
  login: string;
  name: string | null;
}
