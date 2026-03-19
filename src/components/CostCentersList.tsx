import { Box, Text } from '@primer/react';
import { useMemo, useState } from 'react';
import type { CostCenter } from '../types';
import { CostCenterCard } from './CostCenterCard';

interface CostCentersListProps {
  costCenters: CostCenter[];
  searchQuery: string;
}

export function CostCentersList({ costCenters, searchQuery }: CostCentersListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return costCenters;

    return costCenters.filter((cc) => {
      if (cc.name.toLowerCase().includes(q)) return true;
      return cc.resources.some((r) => r.name.toLowerCase().includes(q));
    });
  }, [costCenters, searchQuery]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (filtered.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          color: 'fg.muted',
        }}
      >
        <Text sx={{ fontSize: 2 }}>
          {searchQuery
            ? `No cost centers or users match "${searchQuery}"`
            : 'No cost centers found for this enterprise.'}
        </Text>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {filtered.map((cc) => (
        <CostCenterCard
          key={cc.id}
          costCenter={cc}
          isExpanded={expandedIds.has(cc.id)}
          onToggle={() => toggleExpanded(cc.id)}
        />
      ))}
    </Box>
  );
}
