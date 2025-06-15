import { Box } from '@mui/material'

import stravaPowered from '../assets/stravaPowered.svg'

export default function Footer() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'primary.dark',
        position: 'sticky',
      }}
    >
      <a href='https://www.strava.com/'>
        <img src={stravaPowered} height={40}></img>
      </a>
    </Box>
  )
}