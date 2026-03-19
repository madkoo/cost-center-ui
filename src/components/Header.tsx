import { MarkGithubIcon, SignOutIcon } from '@primer/octicons-react';
import { Box, Button, Header as PrimerHeader, Text } from '@primer/react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  userLogin: string;
}

export function Header({ userLogin }: HeaderProps) {
  const { authState, logout } = useAuth();

  return (
    <PrimerHeader>
      <PrimerHeader.Item>
        <PrimerHeader.Link href="#" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ color: 'header.logo', display: 'flex' }}>
            <MarkGithubIcon size={32} />
          </Box>
          <Text sx={{ fontSize: 1, fontWeight: 'bold', color: 'header.text' }}>
            Cost Centers Dashboard
          </Text>
        </PrimerHeader.Link>
      </PrimerHeader.Item>

      <PrimerHeader.Item full />

      {authState && (
        <PrimerHeader.Item>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
              <Text sx={{ fontSize: 0, color: 'header.text', opacity: 0.8, lineHeight: 1.2 }}>
                {authState.enterprise}
              </Text>
              <Text sx={{ fontSize: 1, color: 'header.text', fontWeight: 'bold', lineHeight: 1.2 }}>
                @{userLogin}
              </Text>
            </Box>
            <Button
              variant="invisible"
              size="small"
              onClick={logout}
              leadingVisual={SignOutIcon}
              sx={{ color: 'header.text', '&:hover': { color: 'header.text', opacity: 0.8 } }}
            >
              Sign out
            </Button>
          </Box>
        </PrimerHeader.Item>
      )}
    </PrimerHeader>
  );
}
