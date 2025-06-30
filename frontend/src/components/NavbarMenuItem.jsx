// react
import { Link } from 'react-router-dom';

// MUI components
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

export default function NavbarMenuItem(props) {
  return (
    <MenuItem
      sx={{
        boxShadow: 'none', 
        p:1,
        ':hover': {
          color: 'secondary.main',
        },
      }}
      component={Link}
      to={props.to}
      variant='contained'
      onClick={props.onClick}
    >
      {props.icon}
      <Typography sx={{ml: 3}}>{props.text}</Typography>
    </MenuItem>
  ); 
}