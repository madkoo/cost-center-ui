import { Box, Spinner, Text } from '@primer/react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading cost centers…' }: LoadingStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        py: 8,
      }}
    >
      <Spinner size="large" />
      <Text sx={{ color: 'fg.muted', fontSize: 1 }}>{message}</Text>
    </Box>
  );
}
