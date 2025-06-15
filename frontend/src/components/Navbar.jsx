import { AppBar, Toolbar, Typography } from '@mui/material'

import blockM from '../assets/blockM.png';

export default function Navbar() {
  return (
    <AppBar
      sx={{
        backgroundColor: 'primary.dark',
        borderBottom: 3,
        borderBottomColor: 'secondary.main',
      }}
      position='static'
    >
      <Toolbar>
        <img src={blockM} height={40}/>
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
      </Toolbar>
    </AppBar>
  );
}