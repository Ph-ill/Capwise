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
          paper: '#383a4a', // Slightly lighter for contrast
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
          paper: '#373832', // Slightly lighter for contrast
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
          paper: '#eee8d5', // Slightly darker for contrast
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
          paper: '#3B4252', // Slightly lighter for contrast
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
          paper: '#3A3F4B', // Slightly lighter for contrast
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
          paper: '#3C3836', // Slightly lighter for contrast
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
          paper: '#24283B', // Slightly lighter for contrast
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
          paper: '#363A4F', // Slightly lighter for contrast
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
          paper: '#1A1E24',
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
  {
    name: 'Ballerina Cappuccina',
    theme: createTheme({
      palette: {
        primary: {
          main: '#D4A373', // Soft, warm brown/tan
        },
        secondary: {
          main: '#F5E6CC', // Creamy yellow/gold
        },
        background: {
          default: '#F8F0E3', // Creamy off-white, like frothed milk
          paper: '#EAD7C7', // Slightly darker, warm beige, like coffee
        },
        text: {
          primary: '#4A4A4A', // Soft dark grey/brown
          secondary: '#888888', // Medium grey
        },
      },
      typography: {
        fontFamily: 'serif', // Elegant font
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
  {
    name: 'Skibidi Toilet',
    theme: createTheme({
      palette: {
        primary: {
          main: '#4A90E2', // Blue, like water
        },
        secondary: {
          main: '#FFD700', // Gold/yellow, for a quirky accent
        },
        background: {
          default: '#F0F8FF', // Alice Blue, light and clean
          paper: '#E0FFFF', // Light Cyan, slightly different for contrast
        },
        text: {
          primary: '#2F4F4F', // Dark Slate Gray
          secondary: '#696969', // Dim Gray
        },
      },
      typography: {
        fontFamily: 'Comic Sans MS, cursive', // A playful, meme-like font
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
  {
    name: 'Capybara',
    theme: createTheme({
      palette: {
        primary: {
          main: '#8B4513', // SaddleBrown - earthy, like capybara fur
        },
        secondary: {
          main: '#6B8E23', // OliveDrab - natural, like their habitat
        },
        background: {
          default: '#F5DEB3', // Wheat - warm, light, natural
          paper: '#D2B48C', // Tan - slightly darker, like damp earth
        },
        text: {
          primary: '#4F4F4F', // Dim Gray - soft, natural dark
          secondary: '#8B8B7A', // Dark Khaki - muted, subtle
        },
      },
      typography: {
        fontFamily: 'Georgia, serif', // Calm, slightly rustic font
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
  {
    name: 'The Matrix',
    theme: createTheme({
      palette: {
        primary: {
          main: '#00FF41', // Matrix green
        },
        secondary: {
          main: '#008F11', // Darker green
        },
        background: {
          default: '#000000', // Black
          paper: '#0A0A0A', // Slightly off-black
        },
        text: {
          primary: '#00FF41', // Matrix green
          secondary: '#008F11', // Darker green
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
    name: 'Spongebob',
    theme: createTheme({
      palette: {
        primary: {
          main: '#FFD700', // Gold (Spongebob's yellow)
        },
        secondary: {
          main: '#00BFFF', // Deep Sky Blue (water/sky)
        },
        background: {
          default: '#6495ED', // Cornflower Blue (ocean)
          paper: '#87CEEB', // Sky Blue (lighter water)
        },
        text: {
          primary: '#8B4513', // SaddleBrown (like his pants)
          secondary: '#228B22', // ForestGreen (seaweed)
        },
      },
      typography: {
        fontFamily: 'Impact, sans-serif', // Bold, cartoonish font
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
  {
    name: 'Star Wars',
    theme: createTheme({
      palette: {
        primary: {
          main: '#FFE81F', // Star Wars yellow
        },
        secondary: {
          main: '#4CAF50', // Green for lightsabers
        },
        background: {
          default: '#000000', // Space black
          paper: '#1A1A1A', // Dark grey for contrast
        },
        text: {
          primary: '#FFE81F', // Star Wars yellow
          secondary: '#BBBBBB', // Light grey
        },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', // A more classic, readable font
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
  {
    name: 'Breaking Bad',
    theme: createTheme({
      palette: {
        primary: {
          main: '#00BFFF', // Deep Sky Blue for "blue meth"
        },
        secondary: {
          main: '#D2B48C', // Tan for New Mexico desert
        },
        background: {
          default: '#FAEBD7', // AntiqueWhite for a light desert background
          paper: '#D2B48C', // Tan for contrast
        },
        text: {
          primary: '#36454F', // Charcoal for readability
          secondary: '#696969', // Dim Gray
        },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
    }),
    backgroundGradient: 'linear-gradient(180deg, #87CEEB 0%, #F5DEB3 100%)', // Sky blue to desert sand
    appBarGradient: null,
  },
  {
    name: 'The Grudge',
    theme: createTheme({
      palette: {
        primary: {
          main: '#424242', // Dark grey
        },
        secondary: {
          main: '#B71C1C', // Dark red
        },
        background: {
          default: '#212121', // Very dark grey
          paper: '#303030', // Slightly lighter dark grey
        },
        text: {
          primary: '#E0E0E0', // Light grey
          secondary: '#9E9E9E', // Medium grey
        },
      },
      typography: {
        fontFamily: '"Creepster", cursive', // A horror-themed font if available, otherwise fallback
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
  {
    name: 'VHS',
    theme: createTheme({
      palette: {
        primary: {
          main: '#8B0000', // Dark Red (subtle)
        },
        secondary: {
          main: '#006400', // Dark Green (subtle)
        },
        background: {
          default: '#121212', // Very dark grey
          paper: '#212121', // Dark grey
        },
        text: {
          primary: '#C0C0C0', // Silver (faded white)
          secondary: '#696969', // Dim Gray
        },
      },
      typography: {
        fontFamily: '"Press Start 2P", cursive', // Pixelated font if available, otherwise fallback
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
  {
    name: 'Rainbow Dash',
    theme: createTheme({
      palette: {
        primary: {
          main: '#00BFFF', // Deep Sky Blue
        },
        secondary: {
          main: '#FF1493', // Deep Pink
        },
        background: {
          default: '#87CEEB', // Sky Blue
          paper: '#ADD8E6', // Light Blue
        },
        text: {
          primary: '#FFFFFF', // White
          secondary: '#000000', // Black
        },
      },
      typography: {
        fontFamily: '"Comic Sans MS", cursive', // Playful font
      },
    }),
    backgroundGradient: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)', // Rainbow gradient
    appBarGradient: null,
  },
  {
    name: 'Pusheen',
    theme: createTheme({
      palette: {
        primary: {
          main: '#FFC0CB', // Pink
        },
        secondary: {
          main: '#B0E0E6', // Powder Blue
        },
        background: {
          default: '#F0F8FF', // Alice Blue
          paper: '#FFF0F5', // Lavender Blush
        },
        text: {
          primary: '#556B2F', // Dark Olive Green
          secondary: '#808080', // Gray
        },
      },
      typography: {
        fontFamily: '"Pacifico", cursive', // Playful, rounded font
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
  {
    name: 'The Ring',
    theme: createTheme({
      palette: {
        primary: {
          main: '#424242', // Dark grey
        },
        secondary: {
          main: '#616161', // Medium grey
        },
        background: {
          default: '#212121', // Very dark grey
          paper: '#303030', // Slightly lighter dark grey
        },
        text: {
          primary: '#BDBDBD', // Light grey
          secondary: '#757575', // Medium grey
        },
      },
      typography: {
        fontFamily: '"Creepster", cursive', // A horror-themed font if available, otherwise fallback
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
  {
    name: 'Tron',
    theme: createTheme({
      palette: {
        primary: {
          main: '#00FFFF', // Electric Blue
        },
        secondary: {
          main: '#FF4500', // OrangeRed (for accents)
        },
        background: {
          default: '#000000', // Black
          paper: '#0A0A0A', // Slightly off-black
        },
        text: {
          primary: '#00FFFF', // Electric Blue
          secondary: '#B0E0E6', // Powder Blue
        },
      },
      typography: {
        fontFamily: '"Share Tech Mono", monospace', // Digital-like font
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
  {
    name: 'Blade Runner',
    theme: createTheme({
      palette: {
        primary: {
          main: '#00008B', // Dark Blue
        },
        secondary: {
          main: '#FF4500', // OrangeRed (for neon accents)
        },
        background: {
          default: '#1A1A2E', // Very dark blue-purple
          paper: '#2C2C4A', // Slightly lighter dark blue-purple
        },
        text: {
          primary: '#E0E0E0', // Light grey
          secondary: '#A9A9A9', // Dark grey
        },
      },
      typography: {
        fontFamily: '"Roboto Condensed", sans-serif', // Sci-fi feel
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
  {
    name: 'Interstellar',
    theme: createTheme({
      palette: {
        primary: {
          main: '#6A0DAD', // Dark Purple
        },
        secondary: {
          main: '#FFD700', // Gold
        },
        background: {
          default: '#000000', // Black
          paper: '#1A001A', // Very dark purple
        },
        text: {
          primary: '#E0FFFF', // Light Cyan
          secondary: '#B0C4DE', // Light Steel Blue
        },
      },
      typography: {
        fontFamily: '"Orbitron", sans-serif', // Futuristic font
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
  {
    name: 'The Lord of the Rings',
    theme: createTheme({
      palette: {
        primary: {
          main: '#4CAF50', // Forest Green
        },
        secondary: {
          main: '#CD853F', // Peru (Earthy Brown)
        },
        background: {
          default: '#2E8B57', // Sea Green (for forests)
          paper: '#8B4513', // Saddle Brown (for earth/wood)
        },
        text: {
          primary: '#F5DEB3', // Wheat (parchment-like)
          secondary: '#D2B48C', // Tan
        },
      },
      typography: {
        fontFamily: '"Cinzel Decorative", serif', // Fantasy/ancient feel
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
  {
    name: 'Inception',
    theme: createTheme({
      palette: {
        primary: {
          main: '#424242', // Dark Grey
        },
        secondary: {
          main: '#757575', // Medium Grey
        },
        background: {
          default: '#212121', // Very Dark Grey
          paper: '#303030', // Slightly lighter dark grey
        },
        text: {
          primary: '#E0E0E0', // Light Grey
          secondary: '#BDBDBD', // Lighter Grey
        },
      },
      typography: {
        fontFamily: '"Roboto Condensed", sans-serif', // Modern, clean font
      },
    }),
    backgroundGradient: null,
    appBarGradient: null,
  },
];