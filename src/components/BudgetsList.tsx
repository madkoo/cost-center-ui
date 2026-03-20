import { TriangleDownIcon, TriangleUpIcon } from '@primer/octicons-react';
import { Box, Label, Text } from '@primer/react';
import { useMemo } from 'react';
import type { Budget, BudgetSortKey, CostCenter, SortDirection } from '../types';

interface BudgetsListProps {
  budgets: Budget[];
  costCenters: CostCenter[];
  searchQuery: string;
  sortKey: BudgetSortKey;
  sortDirection: SortDirection;
  onSort: (key: BudgetSortKey) => void;
}

function formatSku(sku: string): string {
  return sku.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatBudgetType(type: string): string {
  return type.replace(/([A-Z])/g, ' $1').trim();
}

function ScopeCell({ budget, costCenters }: { budget: Budget; costCenters: CostCenter[] }) {
  if (budget.scope === 'cost_center') {
    const match = costCenters.find((cc) => cc.name.toLowerCase() === budget.entityName.toLowerCase());

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Label variant="accent" size="small">
          Cost Center
        </Label>
        <Text sx={{ fontSize: 0, color: match ? 'fg.default' : 'fg.muted' }}>
          {budget.entityName}
          {!match && ' (not found)'}
        </Text>
      </Box>
    );
  }

  const scopeLabel: Record<string, string> = {
    enterprise: 'Enterprise',
    organization: 'Organization',
    repository: 'Repository',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Label variant="secondary" size="small">
        {scopeLabel[budget.scope] ?? budget.scope}
      </Label>
      <Text sx={{ fontSize: 0, color: 'fg.muted' }}>{budget.entityName}</Text>
    </Box>
  );
}

export function BudgetsList({
  budgets,
  costCenters,
  searchQuery,
  sortKey,
  sortDirection,
  onSort,
}: BudgetsListProps) {
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();

    const matchingBudgets = !q
      ? budgets
      : budgets.filter((budget) => {
          return (
            budget.productSku.toLowerCase().includes(q) ||
            budget.budgetType.toLowerCase().includes(q) ||
            budget.scope.toLowerCase().includes(q) ||
            budget.entityName.toLowerCase().includes(q)
          );
        });

    const sorted = [...matchingBudgets].sort((a, b) => {
      switch (sortKey) {
        case 'productSku':
          return a.productSku.localeCompare(b.productSku);
        case 'budgetType':
          return a.budgetType.localeCompare(b.budgetType);
        case 'budgetAmount':
          return a.budgetAmount - b.budgetAmount;
        case 'scope':
          return a.scope.localeCompare(b.scope);
        default:
          return 0;
      }
    });

    if (sortDirection === 'desc') {
      return [...sorted].reverse();
    }

    return sorted;
  }, [budgets, searchQuery, sortDirection, sortKey]);

  const renderSortableHeader = (
    label: string,
    key: BudgetSortKey,
    textAlign: 'left' | 'right' = 'left'
  ) => {
    const isActiveSort = sortKey === key;

    return (
      <Box
        as="th"
        sx={{
          px: 4,
          py: 2,
          textAlign,
          fontWeight: 'semibold',
          color: 'fg.muted',
        }}
      >
        <Box
          as="button"
          type="button"
          onClick={() => onSort(key)}
          sx={{
            border: 'none',
            bg: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 0,
            color: 'fg.default',
            fontWeight: 'semibold',
            fontSize: 1,
            justifyContent: textAlign === 'right' ? 'flex-end' : 'flex-start',
            width: '100%',
          }}
        >
          {label}
          <Box
            as="span"
            sx={{
              display: 'flex',
              color: isActiveSort ? 'fg.default' : 'fg.subtle',
            }}
          >
            {isActiveSort ? (
              sortDirection === 'asc' ? (
                <TriangleUpIcon size={12} />
              ) : (
                <TriangleDownIcon size={12} />
              )
            ) : (
              <TriangleDownIcon size={12} />
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  if (filtered.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, color: 'fg.muted' }}>
        <Text sx={{ fontSize: 2 }}>
          {searchQuery ? `No budgets match "${searchQuery}"` : 'No budgets found for this enterprise.'}
        </Text>
      </Box>
    );
  }

  return (
    <Box as="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 1 }}>
      <Box
        as="thead"
        sx={{
          bg: 'canvas.subtle',
          borderBottom: '1px solid',
          borderColor: 'border.default',
        }}
      >
        <Box as="tr">
          {renderSortableHeader('Product', 'productSku')}
          {renderSortableHeader('Scope', 'scope')}
          {renderSortableHeader('Type', 'budgetType')}
          {renderSortableHeader('Budget Amount', 'budgetAmount', 'right')}
          <Box
            as="th"
            sx={{
              px: 4,
              py: 2,
              textAlign: 'center',
              fontWeight: 'semibold',
              color: 'fg.muted',
            }}
          >
            <Text>Prevent Usage</Text>
          </Box>
          <Box
            as="th"
            sx={{
              px: 4,
              py: 2,
              textAlign: 'left',
              fontWeight: 'semibold',
              color: 'fg.muted',
            }}
          >
            <Text>Alert Recipients</Text>
          </Box>
        </Box>
      </Box>
      <Box as="tbody">
        {filtered.map((budget) => {
          return (
            <Box
              key={budget.id}
              as="tr"
              sx={{
                borderBottom: '1px solid',
                borderColor: 'border.subtle',
                '&:last-child': { borderBottom: 'none' },
                '&:hover': { bg: 'canvas.subtle' },
                transition: 'background-color 0.15s ease',
              }}
            >
              <Box as="td" sx={{ px: 4, py: 2 }}>
                <Text sx={{ fontWeight: 'semibold' }}>{formatSku(budget.productSku)}</Text>
              </Box>
              <Box as="td" sx={{ px: 4, py: 2 }}>
                <ScopeCell budget={budget} costCenters={costCenters} />
              </Box>
              <Box as="td" sx={{ px: 4, py: 2 }}>
                <Label variant="secondary" size="small">
                  {formatBudgetType(budget.budgetType)}
                </Label>
              </Box>
              <Box as="td" sx={{ px: 4, py: 2, textAlign: 'right' }}>
                <Text>{budget.budgetAmount.toLocaleString()}</Text>
              </Box>
              <Box as="td" sx={{ px: 4, py: 2, textAlign: 'center' }}>
                {budget.preventFurtherUsage ? (
                  <Label variant="danger" size="small">
                    Blocked
                  </Label>
                ) : (
                  <Label variant="success" size="small">
                    Allowed
                  </Label>
                )}
              </Box>
              <Box as="td" sx={{ px: 4, py: 2, textAlign: 'left' }}>
                {budget.alerting.willAlert && budget.alerting.alertRecipients.length > 0 ? (
                  <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
                    {budget.alerting.alertRecipients.join(', ')}
                  </Text>
                ) : (
                  <Text sx={{ color: 'fg.muted' }}>—</Text>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
