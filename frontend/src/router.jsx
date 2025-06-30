import { createBrowserRouter  } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import ActivityPage from './pages/ActivityPage';
import ProtectedRoute from './components/ProtectedRoute';
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
            <HomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'activities',
        element: (
          <ProtectedRoute>
            <ActivityPage />
          </ProtectedRoute>
        )
      }
    ],
    errorElement: <NotFound />,
  },
]);

export default router;