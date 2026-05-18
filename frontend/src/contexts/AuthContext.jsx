import { createContext, useContext, useEffect, useState } from 'react';
import { getAuthStatus } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // undefined = loading, null = not authenticated, object = authenticated
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    getAuthStatus()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
