import { Box, ThemeProvider } from '@mui/material';
import Theme from './components/Themes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Outlet, useLocation } from 'react-router-dom';

export default function App() {
  const location = useLocation();
  const hideLayout = location.pathname.replace(/\/$/, '') === '/login';

  return (
    <ThemeProvider theme={Theme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {!hideLayout && <Navbar />}
        <Box sx={{flexGrow: 1}}>
          <Outlet />
        </Box>
        {!hideLayout && <Footer />}
      </Box>
    </ThemeProvider>
  )
}
