import './App.css'

import { Box, ThemeProvider } from '@mui/material';
import Theme from './components/Themes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Outlet } from 'react-router-dom';

export default function App() {
  return (
    <ThemeProvider theme={Theme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}>
        <Navbar />
        <Box sx={{flexGrow: 1}}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  )
}
