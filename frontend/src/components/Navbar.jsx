// react
import { useState } from 'react';

// MUI components
import AppBar from '@mui/material/AppBar';
import ToolBar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';

// MUI icons          
import RegisterIcon from '@mui/icons-material/PersonAdd';   
import MyActivitiesIcon from '@mui/icons-material/DirectionsRun'            
import MenuIcon from '@mui/icons-material/Menu';

// project components
import NavbarButton from './NavbarButton';
import NavbarMenuItem from './NavbarMenuItem';

// project assets
import blockM from '../assets/blockM.png';

export default function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState(null); // anchor element for pop up nav menu

  const handleOpenNavMenu = (event) => { // opens the pop up nav menu
    setAnchorElNav(event.currentTarget);
  }
  const handleCloseNavMenu = () => { // closes the pop up nav menu
    setAnchorElNav(null);
  }

  return (
    <AppBar 
      sx={{
        backgroundColor: 'primary.dark',
        borderBottom: 3,
        borderBottomColor: 'secondary.main'
      }}
      position="static"
    >
      <ToolBar>
        <img src={blockM} height={40}></img>
        <Typography 
        variant='h5'
        sx={{
          flexGrow: 1, 
          ml: 2, 
          fontSize: {xs: '1rem', sm: '1.5rem'},
        }}
        >
          UMMB Summer Workout Tracking
        </Typography>
        
        <Box sx={{display: { xs: 'flex', lg: 'none' }}}>
          <IconButton
            size='large'
            sx={{boxShadow: 'none', 
              backgroundColor: 'primary.dark', 
              color: 'primary.contrastText',
              ':hover': {
                bgcolor: 'primary.main',
              },
            }}
            onClick={handleOpenNavMenu}
          >
            <MenuIcon />
          </IconButton>

          <Menu
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{
              display: {xs: 'block', lg: 'none'},
            }}
          >
            <NavbarMenuItem text='Registration' to='/' icon={<RegisterIcon />} onClick={handleCloseNavMenu}/>
            <NavbarMenuItem text='My Activities' to='/activities' icon={<MyActivitiesIcon />} onClick={handleCloseNavMenu}/>
          </Menu>
        </Box>
        
        <Box sx={{display: {xs: 'none', lg: 'flex'}}}>
          <NavbarButton text='Registration' to='/' startIcon={<RegisterIcon />} />
          <NavbarButton text='My Activities' to='/activities' startIcon={<MyActivitiesIcon />} />
        </Box>
      </ToolBar>
    </AppBar>
  );
}