import { Box, PageLayout, Text, IconButton, Label, UnderlineNav } from '@primer/react';
import { SyncIcon } from '@primer/octicons-react';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createOctokitClient } from '../services/githubClient';
import { fetchBudgets, fetchCostCenters } from '../services/costCentersService';
import type { AppError, Budget, BudgetSortKey, CostCenter, SortDirection } from '../types';
import { BudgetsList } from './BudgetsList';
import { CostCentersList } from './CostCentersList';
import { ErrorState } from './ErrorState';
import { Header } from './Header';
import { LoadingState } from './LoadingState';
import { SearchBar } from './SearchBar';

interface DashboardProps {
  userLogin: string;
}

export function Dashboard({ userLogin }: DashboardProps) {
  const { authState } = useAuth();
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [budgetsError, setBudgetsError] = useState<AppError | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'cost-centers' | 'budgets'>('cost-centers');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetSearchQuery, setBudgetSearchQuery] = useState('');
  const [budgetSortKey, setBudgetSortKey] = useState<BudgetSortKey>('productSku');
  const [budgetSortDirection, setBudgetSortDirection] = useState<SortDirection>('asc');

  const load = useCallback(async () => {
    if (!authState) return;

    setLoading(true);
    setError(null);
    setBudgetsError(null);

    try {
      const octokit = createOctokitClient(authState.token, authState.baseUrl);
      const [ccResult, budgetsResult] = await Promise.allSettled([
        fetchCostCenters(octokit, authState.enterprise),
        fetchBudgets(octokit, authState.enterprise),
      ]);

      if (ccResult.status === 'fulfilled') {
        setCostCenters(ccResult.value);
      } else {
        setError(ccResult.reason as AppError);
      }

      if (budgetsResult.status === 'fulfilled') {
        setBudgets(budgetsResult.value);
      } else {
        setBudgetsError(budgetsResult.reason as AppError);
      }
    } finally {
      setLoading(false);
    }
  }, [authState]);

  const handleBudgetSort = useCallback((key: BudgetSortKey) => {
    if (key === budgetSortKey) {
      setBudgetSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setBudgetSortKey(key);
      setBudgetSortDirection('asc');
    }
  }, [budgetSortKey]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Box sx={{ minHeight: '100vh', bg: 'canvas.default' }}>
      <Header userLogin={userLogin} />

      <PageLayout>
        <PageLayout.Content>
          {/* Toolbar row */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 3,
              mb: 4,
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Text as="h2" sx={{ fontSize: 3, fontWeight: 'bold', color: 'fg.default', m: 0 }}>
                  {activeTab === 'cost-centers' ? 'Cost Centers' : 'Budgets'}
                </Text>
                <Box sx={{ color: 'fg.muted', display: 'flex' }}>
                  <IconButton
                    aria-label={activeTab === 'cost-centers' ? 'Refresh cost centers data' : 'Refresh budgets data'}
                    icon={SyncIcon}
                    variant="invisible"
                    size="small"
                    onClick={load}
                  />
                </Box>
              </Box>
              {!loading && !error && activeTab === 'cost-centers' && (
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Label variant="secondary" size="large">
                    {costCenters.length} cost center{costCenters.length !== 1 ? 's' : ''}
                  </Label>
                  <Label variant="secondary" size="large">
                    {costCenters.reduce((sum, cc) => sum + cc.resources.length, 0)} total users
                  </Label>
                </Box>
              )}
              {!loading && !error && !budgetsError && activeTab === 'budgets' && (
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Label variant="secondary" size="large">
                    {budgets.length} budget{budgets.length !== 1 ? 's' : ''}
                  </Label>
                </Box>
              )}
            </Box>
            {activeTab === 'cost-centers' ? (
              <SearchBar onSearch={setSearchQuery} />
            ) : (
              <SearchBar
                placeholder="Search budgets…"
                onSearch={setBudgetSearchQuery}
              />
            )}
          </Box>

          <UnderlineNav aria-label="Billing navigation" sx={{ mb: 3 }}>
            <UnderlineNav.Item
              aria-current={activeTab === 'cost-centers' ? 'page' : undefined}
              onSelect={(e) => {
                e?.preventDefault();
                setActiveTab('cost-centers');
              }}
              href="#"
            >
              Cost Centers
            </UnderlineNav.Item>
            <UnderlineNav.Item
              aria-current={activeTab === 'budgets' ? 'page' : undefined}
              onSelect={(e) => {
                e?.preventDefault();
                setActiveTab('budgets');
              }}
              href="#"
            >
              Budgets
            </UnderlineNav.Item>
          </UnderlineNav>

          {/* Content area */}
          {loading && (
            <LoadingState message="Fetching billing data from GitHub Enterprise…" />
          )}
          {!loading && error && <ErrorState error={error} onRetry={load} />}
          {!loading && !error && activeTab === 'cost-centers' && (
            <CostCentersList costCenters={costCenters} searchQuery={searchQuery} />
          )}
          {!loading && activeTab === 'budgets' && budgetsError && (
            <ErrorState error={budgetsError} onRetry={load} />
          )}
          {!loading && !error && !budgetsError && activeTab === 'budgets' && (
            <BudgetsList
              budgets={budgets}
              costCenters={costCenters}
              searchQuery={budgetSearchQuery}
              sortKey={budgetSortKey}
              sortDirection={budgetSortDirection}
              onSort={handleBudgetSort}
            />
          )}
        </PageLayout.Content>
      </PageLayout>
    </Box>
  );
}
