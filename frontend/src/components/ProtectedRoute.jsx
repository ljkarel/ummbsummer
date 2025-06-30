import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

export default function ProtectedRoute({ children }) {
  const { user, loading, login } = useAuth();

  if (loading) {
    return (
      <Box sx={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    login();
    return null;
  }

  return children;
}