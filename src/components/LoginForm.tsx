import { EyeClosedIcon, EyeIcon, LockIcon, MarkGithubIcon } from '@primer/octicons-react';
import {
  Box,
  Button,
  Details,
  Flash,
  FormControl,
  Heading,
  Spinner,
  Text,
  TextInput,
  useDetails,
} from '@primer/react';
import { FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createOctokitClient } from '../services/githubClient';
import { validateToken } from '../services/costCentersService';
import type { AppError } from '../types';

interface LoginFormProps {
  onSuccess: (userLogin: string) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const { getDetailsProps } = useDetails({ closeOnOutsideClick: false });

  const [token, setToken] = useState('');
  const [enterprise, setEnterprise] = useState('');
  const [hostname, setHostname] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const enterpriseHasSpaces = enterprise.includes(' ');
  const isValid = token.trim().length > 0 && enterprise.trim().length > 0 && !enterpriseHasSpaces;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);
    setError(null);

    try {
      const resolvedHostname = hostname.trim() || 'github.com';
      const { deriveBaseUrl } = await import('../services/githubClient');
      const baseUrl = deriveBaseUrl(resolvedHostname);
      const octokit = createOctokitClient(token.trim(), baseUrl);

      const user = await validateToken(octokit);
      login(token.trim(), enterprise.trim(), resolvedHostname);
      onSuccess(user.login);
    } catch (err) {
      setError(err as AppError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'canvas.default',
        px: 3,
      }}
    >
      <Box
        as="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: 440,
          bg: 'canvas.subtle',
          border: '1px solid',
          borderColor: 'border.default',
          borderTop: '4px solid',
          borderTopColor: 'accent.fg',
          borderRadius: 2,
          p: 5,
          boxShadow: 'shadow.medium',
        }}
      >
        {/* Logo + Title */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box sx={{ color: 'fg.default', mb: 2, display: 'inline-flex' }}>
            <MarkGithubIcon size={48} />
          </Box>
          <Heading as="h1" sx={{ fontSize: 3, fontWeight: 'bold', color: 'fg.default' }}>
            Cost Centers Dashboard
          </Heading>
          <Text sx={{ color: 'fg.muted', fontSize: 1, mt: 1, display: 'block' }}>
            GitHub Enterprise Billing
          </Text>
        </Box>

        {/* Error flash */}
        {error && (
          <Flash variant="danger" sx={{ mb: 4 }}>
            <Text sx={{ fontWeight: 'bold', display: 'block' }}>
              {error.status ? `Error ${error.status}` : 'Authentication failed'}
            </Text>
            <Text>{error.message}</Text>
          </Flash>
        )}

        {/* Enterprise slug */}
        <FormControl sx={{ mb: 3 }} required>
          <FormControl.Label>Enterprise slug</FormControl.Label>
          <TextInput
            value={enterprise}
            onChange={(e) => setEnterprise(e.target.value)}
            placeholder="my-org"
            disabled={loading}
            block
            size="large"
            autoComplete="off"
            validationStatus={enterpriseHasSpaces ? 'error' : undefined}
          />
          {enterpriseHasSpaces ? (
            <FormControl.Validation variant="error">
              Slugs don&apos;t contain spaces — use the hyphenated URL slug, not the display name (e.g. &quot;my-org&quot; not &quot;My org&quot;)
            </FormControl.Validation>
          ) : (
            <FormControl.Caption>
              The URL slug from{' '}
              <Text as="code" sx={{ fontFamily: 'mono', fontSize: 0 }}>
                github.com/enterprises/<strong>slug</strong>
              </Text>{' '}
              — lowercase with hyphens, not the display name
            </FormControl.Caption>
          )}
        </FormControl>

        {/* Personal Access Token */}
        <FormControl sx={{ mb: 3 }} required>
          <FormControl.Label>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LockIcon size={14} />
              Personal Access Token
            </Box>
          </FormControl.Label>
          <TextInput
            type={showToken ? 'text' : 'password'}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_… or github_pat_…"
            disabled={loading}
            block
            size="large"
            autoComplete="new-password"
            trailingAction={
              <TextInput.Action
                onClick={() => setShowToken((v) => !v)}
                icon={showToken ? EyeClosedIcon : EyeIcon}
                aria-label={showToken ? 'Hide token' : 'Show token'}
              />
            }
          />
          <FormControl.Caption>
            Needs <Text as="code" sx={{ fontFamily: 'mono', fontSize: 0 }}>manage_billing:enterprise</Text> or{' '}
            <Text as="code" sx={{ fontFamily: 'mono', fontSize: 0 }}>read:enterprise</Text> scope.
            Token is never stored and is cleared on page close.
          </FormControl.Caption>
        </FormControl>

        {/* Advanced: custom hostname */}
        <Details {...getDetailsProps()} sx={{ mb: 4 }}>
          <Box
            as="summary"
            sx={{
              cursor: 'pointer',
              color: 'fg.muted',
              fontSize: 1,
              mb: 2,
              listStyle: 'none',
              '&::-webkit-details-marker': { display: 'none' },
            }}
          >
            ▶ Advanced options (GitHub Enterprise Server)
          </Box>
          <FormControl>
            <FormControl.Label>GitHub hostname</FormControl.Label>
            <TextInput
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
              placeholder="github.example.com"
              disabled={loading}
              block
              autoComplete="off"
            />
            <FormControl.Caption>
              Leave blank for GitHub.com or GitHub Enterprise Cloud (*.ghe.com)
            </FormControl.Caption>
          </FormControl>
        </Details>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="large"
          block
          sx={{ mt: 2 }}
          disabled={!isValid || loading}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <Spinner size="small" />
              Connecting…
            </Box>
          ) : (
            'Connect Dashboard'
          )}
        </Button>

        <Flash variant="default" sx={{ mt: 4, py: 2, px: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ color: 'fg.muted', display: 'flex' }}>
            <LockIcon size={16} />
          </Box>
          <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
            Your token is held in browser memory only and is never stored or transmitted to any third party.
          </Text>
        </Flash>
      </Box>
    </Box>
  );
}
