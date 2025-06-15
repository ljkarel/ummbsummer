import { createTheme } from '@mui/material';

const Theme = createTheme({
  palette: {
    primary: { // maroon
        light: '#b48082',
        main: '#5c2c34',
        dark: '#4b1f29',
        contrastText: '#ffffff',
    },
    secondary: { // gold
        light: '#ffd858',
        main: '#ffb81e',
        dark: '#fe9518',
        contrastText: '#000000',
    },
  },
});

export default Theme