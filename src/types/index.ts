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
