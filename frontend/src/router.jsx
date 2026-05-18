import { createBrowserRouter, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Activity from './pages/Activity.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import StravaArt from './pages/StravaArt.jsx';
import Roster from './pages/Roster.jsx';
import SignIn from './pages/SignIn.jsx';
import { OnboardingStrava, OnboardingProfile, OnboardingDone } from './pages/Onboarding.jsx';
import { useAuth } from './contexts/AuthContext.jsx';

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (user === undefined) return null; // loading — render nothing until auth resolves
  if (user === null) return <Navigate to="/signin" replace />;
  return children;
}

function RedirectIfAuthed({ children }) {
  const { user } = useAuth();
  if (user === undefined) return null;
  if (user !== null) return <Navigate to="/" replace />;
  return children;
}

export const router = createBrowserRouter([
  { path: "/signin", element: <RedirectIfAuthed><SignIn /></RedirectIfAuthed> },
  { path: "/",                   element: <RequireAuth><Dashboard /></RequireAuth> },
  { path: "/activity",           element: <RequireAuth><Activity /></RequireAuth> },
  { path: "/leaderboard",        element: <RequireAuth><Leaderboard /></RequireAuth> },
  { path: "/art",                element: <RequireAuth><StravaArt /></RequireAuth> },
  { path: "/roster",             element: <RequireAuth><Roster /></RequireAuth> },
  { path: "/onboarding",         element: <RequireAuth><OnboardingStrava /></RequireAuth> },
  { path: "/onboarding/profile", element: <RequireAuth><OnboardingProfile /></RequireAuth> },
  { path: "/onboarding/done",    element: <RequireAuth><OnboardingDone /></RequireAuth> },
]);
