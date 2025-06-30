// react
import { Link } from 'react-router-dom';

// MUI components
import Button from '@mui/material/Button';

export default function NavbarButton(props) {
  return (
    <Button
      sx={{
        boxShadow: 'none', 
        mr: 1,
        backgroundColor: 'primary.dark', 
        color: 'primary.contrastText',
        ':hover': {
          bgcolor: 'primary.main',
        },
      }}
      component={Link}
      to={props.to}
      variant='contained'
      startIcon={props.startIcon} 
    >
      {props.text}
    </Button>
  );
}