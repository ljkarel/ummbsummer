import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Activity from './pages/Activity.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import StravaArt from './pages/StravaArt.jsx';
import Roster from './pages/Roster.jsx';
import SignIn from './pages/SignIn.jsx';
import { OnboardingStrava, OnboardingProfile, OnboardingDone } from './pages/Onboarding.jsx';
import NotFound from './pages/NotFound.jsx';
import NotOnRoster from './pages/NotOnRoster.jsx';
import RosterRequest from './pages/RosterRequest.jsx';
import ErrorPage from './pages/ErrorPage.jsx';
import { useAuth } from './contexts/AuthContext.jsx';

function RequireAuth() {
  const { user } = useAuth();
  if (user === undefined) return null; // loading — render nothing until auth resolves
  if (user === null) return <Navigate to="/signin" replace />;
  return <Outlet />;
}

function RedirectIfAuthed() {
  const { user } = useAuth();
  if (user === undefined) return null;
  if (user !== null) return <Navigate to="/" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    errorElement: <ErrorPage />,
    children: [
      // Public routes — no auth check
      { path: '/not-on-roster', element: <NotOnRoster /> },
      { path: '/roster-request', element: <RosterRequest /> },
      { path: '*', element: <NotFound /> },

      // Redirect authed users away from sign-in
      {
        element: <RedirectIfAuthed />,
        children: [
          { path: '/signin', element: <SignIn /> },
        ],
      },

      // Auth-required routes
      {
        element: <RequireAuth />,
        errorElement: <ErrorPage />,
        children: [
          { path: '/',                   element: <Dashboard /> },
          { path: '/activity',           element: <Activity /> },
          { path: '/leaderboard',        element: <Leaderboard /> },
          { path: '/art',                element: <StravaArt /> },
          { path: '/roster',             element: <Roster /> },
          { path: '/onboarding',         element: <OnboardingStrava /> },
          { path: '/onboarding/profile', element: <OnboardingProfile /> },
          { path: '/onboarding/done',    element: <OnboardingDone /> },
        ],
      },
    ],
  },
]);
