import { useState } from 'react';
import { Box, Typography, Button, Card, Avatar, Dialog } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import stravaConnect from '../assets/stravaConnect.svg';

import { BASE_URL } from '../utilities';

export default function StravaStatusCard({ stravaStatus, user }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => setDialogOpen(true);
  const handleDialogClose = () => setDialogOpen(false);

  const isRegistered = stravaStatus?.registered;
  const inClub = stravaStatus?.in_club;
  const scope = stravaStatus?.scope || '';
  const fullAccess = scope.includes('activity:read') && scope.includes('activity:read_all');

  return (
    <>
      <Card 
        sx={{ 
          display: 'flex', 
          p: 3, 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap' 
        }}
      >
        <Box sx={{ flex: 1, minWidth: 250 }}>
          <Typography variant="h6" gutterBottom>
            Welcome, {user.display_name}!
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: isRegistered ? 'green' : 'red',
              fontWeight: 600,
              mb: 2,
            }}
          >
            Status: {isRegistered ? 'Registered' : 'Unregistered'}
          </Typography>

          {!isRegistered ? (
            <Box
              component="a"
              href={`${BASE_URL}/api/strava/init/`}
              sx={{
                display: 'inline-block',
                border: '2px solid',
                borderColor: 'secondary.main',
                borderRadius: 1,
                p: 1,
              }}
            >
              <Box
                component="img"
                src={stravaConnect}
                alt="Connect with Strava"
                sx={{ width: 200, display: 'block' }}
              />
            </Box>
          ) : (
            <Button
              variant="contained"
              color="primary"
              href={`https://www.strava.com/clubs/ummb2025`}
            >
              {inClub ? 'Go to Club' : 'Join the Club'}
            </Button>
          )}
        </Box>

        {isRegistered && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flex: 1,
              minWidth: 250,
              mt: { xs: 2, sm: 0 },
            }}
          >
            <Avatar src={stravaStatus.profile_picture} sx={{ width: 64, height: 64 }} />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {fullAccess ? <VisibilityIcon color="action" /> : <VisibilityOffIcon color="action" />}
                <Typography>
                  {fullAccess ? 'All activities shared' : 'Private activities hidden'}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{ mt: 1, color: 'text.secondary', cursor: 'pointer' }}
                onClick={handleDialogOpen}
              >
                Wrong account?
              </Typography>
            </Box>
          </Box>
        )}

        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          {/* Dialog content can be filled in later */}
        </Dialog>
      </Card>
    </>
  );
}
