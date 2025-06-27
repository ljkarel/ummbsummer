import { useState, useEffect } from 'react';

import { styled, Box, CircularProgress, Alert, Snackbar, Typography, Badge } from '@mui/material';

// MUI icons
import QuestionMarkIcon from '@mui/icons-material/HelpOutline';
import CheckIcon from '@mui/icons-material/CheckCircleOutline';
import XIcon from '@mui/icons-material/HighlightOff'

import RegistrationMembers from '../components/RegistrationMembers';
import RegistrationQA from '../components/RegistrationQA';

import { BASE_URL, api } from '../utilities'

import connect_with_strava from '../assets/stravaConnect.svg'

const StyledBadge = styled(Badge)(() => ({
  '& .MuiBadge-badge': {
    right: -23,
    top: 15,
  }
}))


export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registeredMembers, setRegisteredMembers] = useState([]);
  const [unregisteredMembers, setUnregisteredMembers] = useState([]);
  const [registrationComplete, setRegistrationComplete] = useState(false);
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
      setRegistrationComplete(true);
      setSnackbarOpen(true);
    }
  }, []);

  // Get current user
  useEffect(() => {
    api
      .get('/auth/google/me', { withCredentials: true})
      .then((res) => setUser(res.data))
      .catch((err) => {
        if (err.response?.status === 403) {
          // If the user is not logged in, redirect to Google login page
          window.location.href = `${BASE_URL}/api/auth/google/`;
        } else {
          console.error("Unexpected error:", err);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Get registered and unregistered members
  useEffect(() => {
    const getRegisteredMembers = async () => {
      const res = await api.get(
        '/members?authenticated=true', { withCredentials: true }
      )
      setRegisteredMembers(res.data);
    };

    const getUnregisteredMembers = async () => {
      const res = await api.get(
        '/members?authenticated=false', { withCredentials: true }
      )
      setUnregisteredMembers(res.data);
    }

    getRegisteredMembers();
    getUnregisteredMembers();

    console.log(registeredMembers)
    console.log(unregisteredMembers)
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          height: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // TODO: handle this better
  if (!user) return null;


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
          <a href={`${BASE_URL}/api/strava`}>
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
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', m: 2, p: 2 }} id="registeredMembers">
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
            <StyledBadge
              badgeContent={registeredMembers.reduce((total, group) => total + group.members.length, 0)}
              color="primary"
            >
              <Typography variant="h5">Registered Members</Typography>
            </StyledBadge>
            <CheckIcon />
          </Box>
          <RegistrationMembers sections={registeredMembers} />
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', m: 2, p: 2 }}>
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
            <StyledBadge
              badgeContent={unregisteredMembers.reduce((total, group) => total + group.members.length, 0)}
              color="primary"
            >
              <Typography variant="h5">Unregistered Members</Typography>
            </StyledBadge>
            <XIcon />
          </Box>
          <RegistrationMembers sections={unregisteredMembers} />
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
            <QuestionMarkIcon />
          </Box>
          <RegistrationQA />
        </Box>
      </Box>

    </>
  )
  // return (
  //   <Box sx={{ p: 4 }}>
  //     <Typography variant="h4">
  //       Welcome, {user.first_name} {user.last_name}!
  //     </Typography>
  //     <Typography variant="body1" sx={{ mt: 2 }}>
  //       Strava status: {user.strava_authenticated ? '✅ Connected' : '❌ Not connected'}
  //     </Typography>
  //   </Box>
  // );
}






// const API_URL = 'http://127.0.0.1:8000/api'



// export default function HomePage() {
//   const [registeredMembers, setRegisteredMembers] = useState([]);
//   const [unregisteredMembers, setUnregisteredMembers] = useState([]);
//   const [registrationComplete, setRegistrationComplete] = useState(false);
//   const [snackbarOpen, setSnackbarOpen] = useState(false);

//   const snackbarClose = (event, reason) => {
//     if (reason === 'clickaway') {
//       return;
//     }
//     setSnackbarOpen(false);
//   }

//   useEffect(() => {
//     const register = async () => {
//       const urlParams = new URLSearchParams(window.location.search);
//     }
//   })
// }