import { Box, Typography, Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '80vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h3" gutterBottom>
          404 - Not Found
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Sorry, the page you are looking for does not exist.
        </Typography>

        <Button variant="contained" color="primary" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </Box>
    </Container>
  );
}
