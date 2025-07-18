import { useState, useEffect } from 'react';

import { 
  Alert,
  Box,
  Snackbar, 
  useMediaQuery,
  useTheme
} from '@mui/material';

// MUI icons
import RegistrationStatusIcon from '@mui/icons-material/HowToReg'
import QuestionAnswerIcon from '@mui/icons-material/HelpOutline';
import RosterIcon from '@mui/icons-material/Groups';

import RegistrationMembers from '../components/RegistrationMembers';
import RegistrationQA from '../components/RegistrationQA';

import { useAuth } from '../contexts/AuthContext';

import { api } from '../utilities'

import StravaStatusCard from '../components/StravaStatusCard';
import RegistrationSection from '../components/RegistrationSection';
import Loading from '../components/Loading';


export default function RegistrationPage() {
  const { user } = useAuth();

  const [sections, setSections] = useState([]);
  const [stravaStatus, setStravaStatus] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));


  const snackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  }
 
  // Get Strava registration status
  const fetchStravaStatus = async () => {
    try {
      const res = await api.get('/strava', { withCredentials: true });
      setStravaStatus(res.data);
    } catch (err) {
      console.error('Failed to fetch Strava status:', err);
    }
  };

  // Get sections with their member registrations
  const fetchSections = async () => {
    try {
      const res = await api.get('/members', { withCredentials: true });
      setSections(res.data);
    } catch (err) {
      console.error('Failed to fetch section data:', err);
    }
  };

  useEffect(() => {
    fetchStravaStatus();
    fetchSections();
  }, []);

  // Detect if redirected back from backend after successful Strava registration
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const registrationFlag = urlParams.get('registration_complete');

    if (registrationFlag === 'true') {
      setSnackbarOpen(true);
    }
  }, []);


  return (
    <>
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

      {stravaStatus === null || sections.length === 0 ? (
        <Loading />
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            width: '100%',
            gap: 0
          }}
        >
          {/* LEFT COLUMN */}
          <Box
            sx={{
              width: { xs: '100%', lg: '50%' },
            }}
          >
            <RegistrationSection title="Registration Status" icon={<RegistrationStatusIcon />} id="status">
              <StravaStatusCard user={user} stravaStatus={stravaStatus} />
            </RegistrationSection>

            {isLargeScreen && (
              <RegistrationSection title="Q & A" icon={<QuestionAnswerIcon />}>
                <RegistrationQA />
              </RegistrationSection>
            )}
          </Box>

          {/* RIGHT COLUMN */}
          <Box
            sx={{
              width: { xs: '100%', lg: '50%' },
            }}
          >
            <RegistrationSection title="Roster" icon={<RosterIcon />} id="roster">
              <RegistrationMembers sections={sections} scroll={isLargeScreen}/>
            </RegistrationSection>

            {!isLargeScreen && (
              <RegistrationSection title="Q & A" icon={<QuestionAnswerIcon />}>
                <RegistrationQA />
              </RegistrationSection>
            )}
          </Box>
        </Box>
      )}
    </>
  );
}






