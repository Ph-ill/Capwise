import React, { useState, useEffect, useCallback, useContext } from 'react';
import MovieCard from './components/MovieCard';
import { Container, Box, Typography, IconButton, Stack, CircularProgress, AppBar, Toolbar, Button, Tooltip } from '@mui/material';
import { Favorite, ThumbUpAlt, ThumbDownAlt, Block, Bookmark, DoNotDisturbOn, Settings as SettingsIcon, BarChart as BarChartIcon, HelpOutline as HelpIcon, Undo as UndoIcon, Home as HomeIcon, Person as PersonIcon } from '@mui/icons-material';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Settings from './pages/Settings';
import Infographic from './pages/Infographic';
import Watchlist from './pages/Watchlist'; // Import the Watchlist component
import HotkeyModal from './components/HotkeyModal'; // Import the HotkeyModal component
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { themes } from './themes'; // Import the themes
import MatrixEffect from './components/MatrixEffect';
import BubbleEffect from './components/BubbleEffect';
import StarfieldEffect from './components/StarfieldEffect';
import BreakingBadEffect from './components/BreakingBadEffect';
import GlitchEffect from './components/GlitchEffect';
import VHSEffect from './components/VHSEffect';
import RainbowEffect from './components/RainbowEffect';
import PusheenEffect from './components/PusheenEffect';
import VHSErrorEffect from './components/VHSErrorEffect';
import GridEffect from './components/GridEffect';
import NeonRainEffect from './components/NeonRainEffect';
import WormholeEffect from './components/WormholeEffect';
import RuneEffect from './components/RuneEffect';
import FoldingEffect from './components/FoldingEffect';
import { MovieContext, MovieProvider } from './context/MovieContext'; // Import MovieContext and MovieProvider
import { NotificationProvider } from './notifications/NotificationContext';
import Notification from './notifications/Notification';
import UserSelection from './components/UserSelection';

function MovieSwipePage({ hotkeyModalOpen, handleOpenHotkeyModal, handleCloseHotkeyModal }) {
  const {
    movies,
    currentIndex,
    loading,
    profileName,
    isInitialLoad,
    fetchMovies,
    handleInteraction: contextHandleInteraction, // Rename to avoid conflict
    handleUndo: contextHandleUndo, // Rename to avoid conflict
    setCurrentIndex,
  } = useContext(MovieContext);

  const [exitAnimation, setExitAnimation] = useState({});

  const currentMovie = movies[currentIndex];

  const handleInteraction = useCallback(async (action) => {
    if (!currentMovie || !profileName) return;

    let animationProps = {};
    switch (action) {
      case 'dislike':
        animationProps = { x: -1000, opacity: 0, rotate: -10 };
        break;
      case 'like':
        animationProps = { x: 1000, opacity: 0, rotate: 10 };
        break;
      case 'strong_dislike':
        animationProps = { y: 1000, opacity: 0, scale: 0.5 };
        break;
      case 'strong_like':
        animationProps = { y: -1000, opacity: 0, scale: 0.5 };
        break;
      case 'watchlist':
        animationProps = { scale: 0.5, opacity: 0, transition: { duration: 0.3 } }; // Snazzy save
        break;
      case 'not_interested':
        animationProps = { rotate: 360, opacity: 0, transition: { duration: 0.3 } }; // Snazzy not interested
        break;
      default:
        break;
    }
    setExitAnimation(animationProps);

    // Use the handleInteraction from context
    // Use the handleInteraction from context
    await contextHandleInteraction(action, currentMovie, currentIndex);

    // Move to the next movie and fetch more if needed
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= movies.length) {
        fetchMovies(); // Fetch a new batch when the current one is exhausted
      } else {
        setCurrentIndex(nextIndex);
      }
      setExitAnimation({}); // Reset animation for next card
    }, 200); // Match with exit transition duration
  }, [currentIndex, currentMovie, fetchMovies, movies.length, profileName, contextHandleInteraction, setCurrentIndex]);

  const handleUndo = useCallback(async () => {
    if (!profileName) return;
    await contextHandleUndo();
  }, [profileName, contextHandleUndo]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!currentMovie) return;

      // Ctrl+Z for Undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        event.preventDefault();
        handleUndo();
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          handleInteraction('dislike');
          break;
        case 'ArrowRight':
          handleInteraction('like');
          break;
        case 'ArrowUp':
          handleInteraction('strong_like');
          break;
        case 'ArrowDown':
          handleInteraction('strong_dislike');
          break;
        case ' ': // Spacebar
          event.preventDefault();
          handleInteraction('watchlist');
          break;
        case 'Shift':
          event.preventDefault();
          handleInteraction('not_interested');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, currentMovie, handleInteraction, handleUndo]);

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
            {isInitialLoad ? <>Setting up your personalized movie experience<br />(this may take 1-3 minutes for the initial load, subsequent loads will be shorter)...</> : "Loading more movies..."}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!currentMovie && !loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <Typography variant="h6" sx={{ textAlign: 'center' }}>No more movies to suggest! Try refreshing or check your API keys.</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 64px)', // Full viewport height minus AppBar height
      alignItems: 'center',
      justifyContent: 'space-between', // Distribute space vertically
      pt: 2, // Padding top
      pb: 2, // Padding bottom
    }}>
      <Box sx={{ position: 'relative', width: '90vw', maxWidth: 900, height: '85vh', maxHeight: 750 }}>
        <AnimatePresence initial={false}>
          {currentMovie && (
            <motion.div
              key={currentMovie.id}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={exitAnimation}
              transition={{ duration: 0.2 }}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            >
              <MovieCard movie={currentMovie} />
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'center', width: '100%' }}>
        <Tooltip title="Strong Like (Arrow Up)">
          <IconButton color="success" size="large" onClick={() => handleInteraction('strong_like')}>
            <Favorite fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Dislike (Arrow Left)">
          <IconButton color="warning" size="large" onClick={() => handleInteraction('dislike')}>
            <ThumbDownAlt fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Like (Arrow Right)">
          <IconButton color="primary" size="large" onClick={() => handleInteraction('like')}>
            <ThumbUpAlt fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Strong Dislike (Arrow Down)">
          <IconButton color="error" size="large" onClick={() => handleInteraction('strong_dislike')}>
            <Block fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Save to Watchlist (Spacebar)">
          <IconButton color="secondary" size="large" onClick={() => handleInteraction('watchlist')}>
            <Bookmark fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Not Interested (Shift)">
          <IconButton color="info" size="large" onClick={() => handleInteraction('not_interested')}>
            <DoNotDisturbOn fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Undo Last Rating (Ctrl+Z)">
          <IconButton color="inherit" size="large" onClick={handleUndo}>
            <UndoIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Stack>

      <HotkeyModal open={hotkeyModalOpen} handleClose={handleCloseHotkeyModal} />
      <IconButton
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        }}
        onClick={handleOpenHotkeyModal}
      >
        <HelpIcon />
      </IconButton>
    </Box>
  );
}

function App() {
  const [hotkeyModalOpen, setHotkeyModalOpen] = useState(false);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(() => {
    const storedThemeIndex = localStorage.getItem('selectedThemeIndex');
    const parsedIndex = storedThemeIndex ? parseInt(storedThemeIndex, 10) : 0;
    // Ensure the stored index is within the bounds of the themes array
    return (parsedIndex >= 0 && parsedIndex < themes.length) ? parsedIndex : 0;
  });
  const [selectedProfileName, setSelectedProfileName] = useState(localStorage.getItem('activeProfile'));

  const handleOpenHotkeyModal = () => setHotkeyModalOpen(true);
  const handleCloseHotkeyModal = () => setHotkeyModalOpen(false);

  const setThemeIndex = (index) => {
    setCurrentThemeIndex(index);
    localStorage.setItem('selectedThemeIndex', index);
  };

  const handleProfileSelected = (profileName) => {
    setSelectedProfileName(profileName);
    localStorage.setItem('activeProfile', profileName);
  };

  const activeTheme = themes[currentThemeIndex];

  return (
    <ThemeProvider theme={activeTheme.theme}>
      <CssBaseline />
      <Router>
        <NotificationProvider>
          <Box sx={{ background: activeTheme.backgroundGradient, minHeight: '100vh' }}>
            {activeTheme.name === 'The Matrix' && <MatrixEffect />}
            {activeTheme.name === 'Spongebob' && <BubbleEffect />}
            {activeTheme.name === 'Star Wars' && <StarfieldEffect />}
            {activeTheme.name === 'Breaking Bad' && <BreakingBadEffect />}
            {activeTheme.name === 'The Grudge' && <GlitchEffect />}
            {activeTheme.name === 'The Ring' && <VHSErrorEffect />}
            {activeTheme.name === 'VHS' && <VHSEffect />}
            {activeTheme.name === 'Rainbow Dash' && <RainbowEffect />}
            {activeTheme.name === 'Pusheen' && <PusheenEffect />}
            {activeTheme.name === 'Tron' && <GridEffect />}
            {activeTheme.name === 'Blade Runner' && <NeonRainEffect />}
            {activeTheme.name === 'Interstellar' && <WormholeEffect />}
            {activeTheme.name === 'The Lord of the Rings' && <RuneEffect />}
            {activeTheme.name === 'Inception' && <FoldingEffect />}
            <AppBar position="static" sx={{ background: activeTheme.appBarGradient }}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 1.5, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                Capwise
              </Typography>
              <Button color="inherit" component={Link} to="/">
                <HomeIcon sx={{ mr: 0.5 }} /> Home
              </Button>
              <Button color="inherit" component={Link} to="/infographic">
                <BarChartIcon sx={{ mr: 0.5 }} /> INFO
              </Button>
              <Button color="inherit" component={Link} to="/watchlist">
                <Bookmark sx={{ mr: 0.5 }} /> Records
              </Button>
              <Button color="inherit" component={Link} to="/settings">
                <SettingsIcon sx={{ mr: 0.5 }} /> Settings
              </Button>
              {selectedProfileName && (
                <Button color="inherit" component={Link} to="/" onClick={() => {
                  localStorage.removeItem('activeProfile');
                  setSelectedProfileName(null);
                }}>
                  <PersonIcon sx={{ mr: 0.5 }} /> {selectedProfileName}
                </Button>
              )}
            </Toolbar>
          </AppBar>
          {selectedProfileName ? (
            <MovieProvider profileName={selectedProfileName}>
              <Routes>
                <Route path="/" element={<MovieSwipePage hotkeyModalOpen={hotkeyModalOpen} handleOpenHotkeyModal={handleOpenHotkeyModal} handleCloseHotkeyModal={handleCloseHotkeyModal} />} />
                <Route path="/settings" element={<Settings setThemeIndex={setThemeIndex} currentThemeIndex={currentThemeIndex} />} />
                <Route path="/infographic" element={<Infographic />} />
                <Route path="/watchlist" element={<Watchlist />} />
              </Routes>
            </MovieProvider>
          ) : (
            <UserSelection onProfileSelected={handleProfileSelected} />
          )}
          <HotkeyModal open={hotkeyModalOpen} handleClose={handleCloseHotkeyModal} />
          <Notification />
        </Box>
      </NotificationProvider>
    </Router>
    </ThemeProvider>
  );
}

export default App;