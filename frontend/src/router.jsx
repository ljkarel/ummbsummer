import { createBrowserRouter } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Activity from './pages/Activity.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import StravaArt from './pages/StravaArt.jsx';
import Roster from './pages/Roster.jsx';
import SignIn from './pages/SignIn.jsx';
import { OnboardingStrava, OnboardingProfile, OnboardingDone } from './pages/Onboarding.jsx';

export const router = createBrowserRouter([
  { path: "/",              element: <Dashboard /> },
  { path: "/activity",      element: <Activity /> },
  { path: "/leaderboard",   element: <Leaderboard /> },
  { path: "/art",           element: <StravaArt /> },
  { path: "/roster",        element: <Roster /> },
  { path: "/signin",        element: <SignIn /> },
  { path: "/onboarding",    element: <OnboardingStrava /> },
  { path: "/onboarding/profile", element: <OnboardingProfile /> },
  { path: "/onboarding/done",    element: <OnboardingDone /> },
]);
