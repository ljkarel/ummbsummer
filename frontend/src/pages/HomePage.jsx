import { useState, useEffect } from 'react';

import { 
  Alert,
  Box,
  Snackbar, 
  Typography 
} from '@mui/material';

// MUI icons
import QuestionAnswerIcon from '@mui/icons-material/HelpOutline';
import RosterIcon from '@mui/icons-material/Groups';

import RegistrationMembers from '../components/RegistrationMembers';
import RegistrationQA from '../components/RegistrationQA';

import { useAuth } from '../contexts/AuthContext';

import { BASE_URL, api } from '../utilities'

import connect_with_strava from '../assets/stravaConnect.svg'


export default function HomePage() {
  const { user } = useAuth();
  const [sections, setSections] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const snackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  }
 
  // Detect if redirected back from backend after successful Strava registration
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const registrationFlag = urlParams.get('registration_complete');

    if (registrationFlag === 'true') {
      setSnackbarOpen(true);
    }
  }, []);

  // Get sections with their member registrations
  const fetchSections = async () => {
    const res = await api.get('/members', { withCredentials: true });
    setSections(res.data);
  }

  useEffect(() => {
    fetchSections();
  }, []);

  return (
    <>
      <Box sx={{ p: 4 }}>
        <Typography variant="h4">
          Welcome, {user.first_name}!
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Strava status: {user.strava_authenticated ? '✅ Connected' : '❌ Not connected'}
        </Typography>
      </Box>

      {!user.strava_authenticated && (
        <Box 
          sx={{
            m:2,
            mt:4,
            p:1,
            backgroundColor: 'primary.dark',
            color: 'white',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <Typography sx={{pb:2,}} variant='h6' align='center'>
            Press the button below to authenticate with Strava and allow for your minutes to be tracked.
          </Typography>
          <a href={`${BASE_URL}/api/strava/login/`}>
              <img src={connect_with_strava} width='250'/>
          </a>
        </Box>
      )}

      {user.strava_authenticated && (
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={snackbarClose}
        >
          <Alert
            onClose={snackbarClose}
            severity="success"
            sx={{ backgroundColor: 'green', color: 'white' }}
          >
            Authentication Successful
          </Alert>
        </Snackbar>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', m: 2, p: 2 }} id="roster">
          <Box
            sx={{
              px: 2,
              py: 1,
              mb: 3,
              backgroundColor: 'secondary.main',
              color: 'primary.dark',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h5">Roster</Typography>
            <RosterIcon />
          </Box>
          <RegistrationMembers sections={sections} />
          
        </Box>

        <Box sx={{ flex: 1, flexDirection: 'column', display: 'flex', m: 2, p: 2 }}>
          <Box
            sx={{
              px: 2,
              py: 1,
              mb: 3,
              backgroundColor: 'secondary.main',
              color: 'primary.dark',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography align="center" variant="h5">
              Q & A
            </Typography>
            <QuestionAnswerIcon />
          </Box>
          <RegistrationQA />
        </Box>
      </Box>
    </>
  );
}






