import { Box, PageLayout, Text, IconButton, Label } from '@primer/react';
import { SyncIcon } from '@primer/octicons-react';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createOctokitClient } from '../services/githubClient';
import { fetchCostCenters } from '../services/costCentersService';
import type { AppError, CostCenter } from '../types';
import { CostCentersList } from './CostCentersList.tsx';
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
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(async () => {
    if (!authState) return;

    setLoading(true);
    setError(null);

    try {
      const octokit = createOctokitClient(authState.token, authState.baseUrl);
      const data = await fetchCostCenters(octokit, authState.enterprise);
      setCostCenters(data);
    } catch (err) {
      setError(err as AppError);
    } finally {
      setLoading(false);
    }
  }, [authState]);

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
                  Cost Centers
                </Text>
                <Box sx={{ color: 'fg.muted', display: 'flex' }}>
                  <IconButton
                    aria-label="Refresh cost centers data"
                    icon={SyncIcon}
                    variant="invisible"
                    size="small"
                    onClick={load}
                  />
                </Box>
              </Box>
              {!loading && !error && (
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Label variant="secondary" size="large">
                    {costCenters.length} cost center{costCenters.length !== 1 ? 's' : ''}
                  </Label>
                  <Label variant="secondary" size="large">
                    {costCenters.reduce((sum, cc) => sum + cc.resources.length, 0)} total users
                  </Label>
                </Box>
              )}
            </Box>
            <SearchBar onSearch={setSearchQuery} />
          </Box>

          {/* Content area */}
          {loading && <LoadingState message="Fetching cost centers from GitHub Enterprise…" />}
          {!loading && error && <ErrorState error={error} onRetry={load} />}
          {!loading && !error && (
            <CostCentersList costCenters={costCenters} searchQuery={searchQuery} />
          )}
        </PageLayout.Content>
      </PageLayout>
    </Box>
  );
}
