import React from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Create a Material Design 3 theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6750A4', // MD3 primary color
    },
    secondary: {
      main: '#625B71', // MD3 secondary color
    },
    error: {
      main: '#BA1A1A', // MD3 error color
    },
    background: {
      default: '#FFFBFE', // MD3 surface
      paper: '#FFFBFE',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12, // MD3 uses 12px border radius
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20, // MD3 button border radius
          textTransform: 'none', // MD3 doesn't use uppercase
        },
      },
    },
  },
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
