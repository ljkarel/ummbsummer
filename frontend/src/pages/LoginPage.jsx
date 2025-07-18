import { Alert, Box, Snackbar, Typography } from '@mui/material';
import frontPage from '../assets/frontPage.jpg';
import googleSignIn from '../assets/googleSignIn.svg';

import {useAuth } from '../contexts/AuthContext'
import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const {login} = useAuth();
  const [searchParams] = useSearchParams();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const errorCode = searchParams.get('error')
    if (errorCode) {
      const errorMessages = {
        missing_state: "We couldn't verify your login session. Please try signing in again.",
        missing_code: "Google did not return an authorization code. Please try signing in again.",
        email_not_verified: "Your Google account email isn't verified. Please use a verified UMN Google account.",
        nonexistant_member: "This email isn't associated with a member account. Please contact a staff member to be added.",
        non_admin_user: "You aren't currently authorized to log in. Only staff and registered members can access the platform.",
        unknown: "Something went wrong during login. Please try again later or contact support.",
      };
      setError(errorMessages[errorCode] || errorMessages['unknown']);
      setSnackbarOpen(true);
    }
  }, [searchParams]);

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  }

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundImage: `url(${frontPage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 0,
          }}
        />

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            backgroundColor: 'white',
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 4,
            boxShadow: 4,
            textAlign: 'center',
            width: '100%',
            maxWidth: { xs: 260, sm: 300, md: 320 },
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.5rem' },
            }}
          >
            Welcome to UMMB Summer!
          </Typography>

          <Box
            component="img"
            src={googleSignIn}
            alt="Sign in with Google"
            onClick={() => login(false)}
            sx={{
              width: '80%',
              mt: 2,
              cursor: 'pointer',
            }}
          />
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            <Link
              href="#"
              underline="hover"
              onClick={() => login(true)}
            >
              Non-UMN student login
            </Link>
          </Typography>
        </Box>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center'}}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}
