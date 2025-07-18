import { createBrowserRouter  } from 'react-router-dom';
import App from './App';
import ProtectedRoute from './components/ProtectedRoute';
import RegistrationPage from './pages/RegistrationPage';
import ActivityPage from './pages/ActivityPage';
import LoginPage from './pages/LoginPage'
import NotFound from './pages/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <RegistrationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'registration',
        element: (
          <ProtectedRoute>
            <RegistrationPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'activities',
        element: (
          <ProtectedRoute>
            <ActivityPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'login',
        element: (
          <LoginPage />
        )
      }
    ],
    errorElement: <NotFound />,
  },
]);

export default router;