import { BaseStyles, ThemeProvider } from '@primer/react';
import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { LoginForm } from './components/LoginForm';
import { useAuth } from './context/AuthContext';

export function App() {
  const { authState } = useAuth();
  const [userLogin, setUserLogin] = useState<string>('');

  const handleLoginSuccess = (login: string) => {
    setUserLogin(login);
  };

  return (
    <ThemeProvider colorMode="light">
      <BaseStyles>
        {authState && userLogin ? (
          <Dashboard userLogin={userLogin} />
        ) : (
          <LoginForm onSuccess={handleLoginSuccess} />
        )}
      </BaseStyles>
    </ThemeProvider>
  );
}
