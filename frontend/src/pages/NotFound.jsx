import { Box, Typography, Container } from '@mui/material'

export default function NotFound() {
  return (
    <Container maxWidth='sm'>
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
        <Typography variant='h3' gutterBottom>
          404 - Not Found
        </Typography>
        <Typography variant="body1">
          Sorry, the page you are looking for does not exist.
        </Typography>
      </Box>    
    </Container>
  )
}