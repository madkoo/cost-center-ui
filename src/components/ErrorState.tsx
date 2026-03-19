import { AlertIcon } from '@primer/octicons-react';
import { Box, Button, Flash, Text } from '@primer/react';
import type { AppError } from '../types';

interface ErrorStateProps {
  error: AppError;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <Box sx={{ py: 6, px: 4 }}>
      <Flash variant="danger">
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <AlertIcon size={16} />
          <Box>
            <Text sx={{ fontWeight: 'bold', display: 'block' }}>
              {error.status ? `Error ${error.status}` : 'Something went wrong'}
            </Text>
            <Text sx={{ display: 'block', mt: 1 }}>{error.message}</Text>
          </Box>
        </Box>
      </Flash>
      <Box sx={{ mt: 3 }}>
        <Button onClick={onRetry}>Try again</Button>
      </Box>
    </Box>
  );
}
