import LoginFirstTime from '@/components/login/LoginFirstTime';
import LoginUser from '@/components/login/LoginUser';
import { useState } from 'react';

export default function LoginScreen() {
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState<boolean>(false);
  const handleFirstTimeLogin = (val: boolean) => {
    setIsFirstTimeLogin(val);
  };
  return (
    <>
      {!isFirstTimeLogin ? (
        <LoginUser handleFirstTimeLogin={handleFirstTimeLogin} />
      ) : (
        <LoginFirstTime handleFirstTimeLogin={handleFirstTimeLogin} />
      )}
    </>
  );
}
