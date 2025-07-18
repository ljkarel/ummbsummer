import { createContext, useContext, useEffect, useState } from 'react';
import { api, BASE_URL } from '../utilities';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get current user
  useEffect(() => {
    api
      .get('/auth/', { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch((err) => {
        if (err.response?.status !== 403) {
          console.error('Unexpected error:', err);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (bypass_hd=false) => {
    window.location.href = `${BASE_URL}/api/auth/init/?bypass_hd=${bypass_hd}`;
  };

  const logout = () => {
    setUser(null);
    api.post('/auth/logout/', null, { withCredentials: true });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext)
}