import LoginFirstTime from '@/components/login/LoginFirstTime';
import LoginUser from '@/components/login/LoginUser';
import { useState } from 'react';

export default function LoginScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState<boolean>(false);

  return <>{!isFirstTimeLogin ? <LoginUser /> : <LoginFirstTime />}</>;
}
