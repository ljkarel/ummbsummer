import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from './Loading';

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate()
  const { user, loading, login } = useAuth();

  if (loading) {
    return (
      <Loading />
    );
  }

  if (!user) {
    navigate('/login')
  }

  return children;
}