import { createTheme } from '@mui/material/styles';

export const themes = [
  {
    name: 'Default',
    theme: createTheme({
      palette: {
        primary: {
          main: '#4CAF50',
        },
        secondary: {
          main: '#FFC107',
        },
        text: {
          primary: '#212121',
          secondary: '#757575',
        },
      },
      typography: {
        fontFamily: 'Arial, sans-serif',
      },
    }),
    backgroundGradient: 'linear-gradient(135deg, #E0F7FA 0%, #E8F5E9 100%)',
    appBarGradient: 'linear-gradient(45deg, #4CAF50 30%, #388E3C 90%)',
  },
  {
    name: 'Dracula',
    theme: createTheme({
      palette: {
        primary: {
          main: '#50fa7b',
        },
        secondary: {
          main: '#ff79c6',
        },
        background: {
          default: '#282a36',
          paper: '#282a36',
        },
        text: {
          primary: '#f8f8f2',
          secondary: '#6272a4',
        },
      },
      typography: {
        fontFamily: 'monospace',
      },
    }),
    backgroundGradient: null, // Solid background for Dracula
    appBarGradient: null,
  },
  {
    name: 'Monokai',
    theme: createTheme({
      palette: {
        primary: {
          main: '#A6E22E',
        },
        secondary: {
          main: '#F92672',
        },
        background: {
          default: '#272822',
          paper: '#272822',
        },
        text: {
          primary: '#F8F8F2',
          secondary: '#75715E',
        },
      },
      typography: {
        fontFamily: 'monospace',
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
  {
    name: 'Solarized Light',
    theme: createTheme({
      palette: {
        primary: {
          main: '#268bd2',
        },
        secondary: {
          main: '#859900',
        },
        background: {
          default: '#fdf6e3',
          paper: '#fdf6e3',
        },
        text: {
          primary: '#586e75',
          secondary: '#93a1a1',
        },
      },
      typography: {
        fontFamily: 'monospace',
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
  {
    name: 'Nord',
    theme: createTheme({
      palette: {
        primary: {
          main: '#88C0D0',
        },
        secondary: {
          main: '#8FBCBB',
        },
        background: {
          default: '#2E3440',
          paper: '#2E3440',
        },
        text: {
          primary: '#ECEFF4',
          secondary: '#6272a4',
        },
      },
      typography: {
        fontFamily: 'monospace',
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
  {
    name: 'One Dark Pro',
    theme: createTheme({
      palette: {
        primary: {
          main: '#61AFEF',
        },
        secondary: {
          main: '#C678DD',
        },
        background: {
          default: '#282C34',
          paper: '#282C34',
        },
        text: {
          primary: '#ABB2BF',
          secondary: '#5C6370',
        },
      },
      typography: {
        fontFamily: 'monospace',
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
  {
    name: 'Gruvbox Dark',
    theme: createTheme({
      palette: {
        primary: {
          main: '#FE8019',
        },
        secondary: {
          main: '#FABD2F',
        },
        background: {
          default: '#282828',
          paper: '#282828',
        },
        text: {
          primary: '#EBDBB2',
          secondary: '#928374',
        },
      },
      typography: {
        fontFamily: 'monospace',
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
  {
    name: 'Tokyo Night',
    theme: createTheme({
      palette: {
        primary: {
          main: '#7AA2F7',
        },
        secondary: {
          main: '#BB9AF7',
        },
        background: {
          default: '#1A1B26',
          paper: '#1A1B26',
        },
        text: {
          primary: '#C0CAF5',
          secondary: '#A9B1D6',
        },
      },
      typography: {
        fontFamily: 'monospace',
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
  {
    name: 'Catppuccin Macchiato',
    theme: createTheme({
      palette: {
        primary: {
          main: '#8AADF4',
        },
        secondary: {
          main: '#F5BDE6',
        },
        background: {
          default: '#24273A',
          paper: '#24273A',
        },
        text: {
          primary: '#CAD3F5',
          secondary: '#A5ADCB',
        },
      },
      typography: {
        fontFamily: 'monospace',
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
  {
    name: 'Ayu Dark',
    theme: createTheme({
      palette: {
        primary: {
          main: '#5CCFEE',
        },
        secondary: {
          main: '#FFB454',
        },
        background: {
          default: '#0A0E14',
          paper: '#0A0E14',
        },
        text: {
          primary: '#E6E1CF',
          secondary: '#B3B1AD',
        },
      },
      typography: {
        fontFamily: 'monospace',
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
];