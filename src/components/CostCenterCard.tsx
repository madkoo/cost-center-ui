import {
  ChevronDownIcon,
  ChevronUpIcon,
  OrganizationIcon,
  PersonIcon,
  RepoIcon,
} from '@primer/octicons-react';
import {
  Avatar,
  Box,
  CounterLabel,
  Label,
  Link,
  Text,
} from '@primer/react';
import type { CostCenter, CostCenterResource } from '../types';

interface CostCenterCardProps {
  costCenter: CostCenter;
  isExpanded: boolean;
  onToggle: () => void;
}

function ResourceIcon({ type }: { type: CostCenterResource['type'] }) {
  if (type === 'Repo') return <RepoIcon size={14} />;
  if (type === 'Org') return <OrganizationIcon size={14} />;
  return <PersonIcon size={14} />;
}

function resourceHref(resource: CostCenterResource): string {
  if (resource.type === 'Repo') return `https://github.com/${resource.name}`;
  if (resource.type === 'Org') return `https://github.com/${resource.name}`;
  return `https://github.com/${resource.name}`;
}

export function CostCenterCard({ costCenter, isExpanded, onToggle }: CostCenterCardProps) {
  const isDeleted = costCenter.state === 'deleted';
  const userCount = costCenter.resources.filter((r) => r.type === 'User').length;
  const totalCount = costCenter.resources.length;

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: isDeleted ? 'border.subtle' : 'border.default',
        borderRadius: 2,
        overflow: 'hidden',
        bg: 'canvas.default',
        opacity: isDeleted ? 0.6 : 1,
      }}
    >
      {/* Card header */}
      <Box
        as="button"
        onClick={onToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          px: 4,
          py: 3,
          bg: isExpanded ? 'canvas.subtle' : 'canvas.default',
          border: 'none',
          cursor: 'pointer',
          gap: 2,
          '&:hover': { bg: 'canvas.subtle' },
          transition: 'background-color 0.15s ease',
        }}
        aria-expanded={isExpanded}
      >
        <Box sx={{ color: 'fg.muted', flexShrink: 0, display: 'flex' }}>
          <OrganizationIcon size={16} />
        </Box>
        <Text
          sx={{
            fontWeight: 'bold',
            fontSize: 2,
            color: isDeleted ? 'fg.muted' : 'fg.default',
            flex: 1,
            textAlign: 'left',
          }}
        >
          {costCenter.name}
        </Text>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isDeleted && (
            <Label variant="secondary" size="small">deleted</Label>
          )}
          <CounterLabel>
            <PersonIcon size={12} />
            &nbsp;{userCount} user{userCount !== 1 ? 's' : ''}
          </CounterLabel>
          {totalCount > userCount && (
            <CounterLabel>
              {totalCount - userCount} other
            </CounterLabel>
          )}
          <Box sx={{ color: 'fg.muted', display: 'flex' }}>
            {isExpanded ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
          </Box>
        </Box>
      </Box>

      {/* Expanded resource list */}
      {isExpanded && (
        <Box
          className="animate-slide-down"
          sx={{
            borderTop: '1px solid',
            borderColor: 'border.default',
            borderLeft: '3px solid',
            borderLeftColor: 'accent.muted',
          }}
        >
          {totalCount === 0 ? (
            <Box sx={{ px: 4, py: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Box sx={{ color: 'fg.subtle', display: 'flex' }}>
                <PersonIcon size={24} />
              </Box>
              <Text sx={{ color: 'fg.muted', fontSize: 1 }}>
                No resources assigned to this cost center.
              </Text>
            </Box>
          ) : (
            <Box as="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 1 }}>
              <Box
                as="thead"
                sx={{ bg: 'canvas.subtle', borderBottom: '1px solid', borderColor: 'border.default' }}
              >
                <tr>
                  <Box as="th" sx={{ px: 4, py: 2, textAlign: 'left', fontWeight: 'semibold', color: 'fg.muted', width: '15%' }}>
                    Type
                  </Box>
                  <Box as="th" sx={{ px: 4, py: 2, textAlign: 'left', fontWeight: 'semibold', color: 'fg.muted' }}>
                    Name
                  </Box>
                </tr>
              </Box>
              <tbody>
                {costCenter.resources.map((resource, idx) => (
                  <Box
                    as="tr"
                    key={`${resource.type}-${resource.name}-${idx}`}
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: 'border.subtle',
                      '&:last-child': { borderBottom: 'none' },
                      '&:hover': { bg: 'canvas.subtle' },
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <Box as="td" sx={{ px: 4, py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'fg.muted' }}>
                        <ResourceIcon type={resource.type} />
                        <Text sx={{ fontSize: 0, color: 'fg.muted' }}>{resource.type}</Text>
                      </Box>
                    </Box>
                    <Box as="td" sx={{ px: 4, py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {resource.type === 'User' && (
                          <Avatar
                            src={`https://github.com/${resource.name}.png?size=24`}
                            size={24}
                            alt={resource.name}
                          />
                        )}
                        <Link
                          href={resourceHref(resource)}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ fontWeight: resource.type === 'User' ? 'semibold' : 'normal' }}
                        >
                          {resource.name}
                        </Link>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </tbody>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
