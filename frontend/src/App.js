import React, { useState, useEffect, useCallback } from 'react';
import MovieCard from './components/MovieCard';
import { Container, Box, Typography, IconButton, Stack, CircularProgress, AppBar, Toolbar, Button, Tooltip } from '@mui/material';
import { Favorite, ThumbUpAlt, ThumbDownAlt, Block, Bookmark, DoNotDisturbOn, Settings as SettingsIcon, BarChart as BarChartIcon, HelpOutline as HelpIcon, Undo as UndoIcon, Home as HomeIcon } from '@mui/icons-material';
import { AnimatePresence, motion } from 'framer-motion';
import { recordInteraction, getMovieSuggestions } from './api/movies';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Settings from './pages/Settings';
import Infographic from './pages/Infographic';
import Watchlist from './pages/Watchlist'; // Import the Watchlist component
import HotkeyModal from './components/HotkeyModal'; // Import the HotkeyModal component
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { themes } from './themes'; // Import the themes

const API_BASE_URL = 'http://localhost:5001/api';

const undoLastInteraction = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/undo-last-interaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error undoing last interaction:', error);
    throw error;
  }
};

function MovieSwipePage({ hotkeyModalOpen, handleOpenHotkeyModal, handleCloseHotkeyModal }) {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [exitAnimation, setExitAnimation] = useState({});
  const [isInitialLoad, setIsInitialLoad] = useState(true); // New state for initial load
  const [initialFetchDone, setInitialFetchDone] = useState(false); // New state to track initial fetch

  // Initialize userId from localStorage or generate a new one
  useEffect(() => {
    let storedUserId = localStorage.getItem('cineswipeUserId');
    if (!storedUserId) {
      storedUserId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('cineswipeUserId', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  const fetchMovies = useCallback(async () => {
    if (!userId) return; // Wait for userId to be set

    setLoading(true);
    try {
      const data = await getMovieSuggestions(userId);
      if (data.movies && data.movies.length > 0) {
        setMovies(data.movies);
        setCurrentIndex(0);
      } else {
        setMovies([]);
        console.log("No new movie suggestions.");
      }
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [userId]); // Removed isInitialLoad from dependencies

  // Fetch initial movies
  useEffect(() => {
    if (userId && !initialFetchDone) {
      const performInitialFetch = async () => {
        await fetchMovies();
        setInitialFetchDone(true); // Mark initial fetch as done
        setIsInitialLoad(false); // Set initial load flag to false after the first fetch completes
      };
      performInitialFetch();
    }
  }, [userId, fetchMovies, initialFetchDone]);

  const currentMovie = movies[currentIndex];

  const handleInteraction = useCallback(async (action) => {
    if (!currentMovie || !userId) return;

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

    try {
      await recordInteraction(userId, currentMovie.id, action, {
        title: currentMovie.title,
        genres: currentMovie.genres,
        director: currentMovie.director,
        writers: currentMovie.writers,
        actors: currentMovie.actors,
        cover: currentMovie.cover,
        releaseYear: currentMovie.releaseYear,
        imdbId: currentMovie.imdbId,
      });
      console.log(`Movie ${currentMovie.title} - Action: ${action} recorded.`);
    } catch (error) {
      console.error("Error recording interaction:", error);
    }

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
  }, [currentIndex, currentMovie, fetchMovies, movies.length, userId]);

  const handleUndo = useCallback(async () => {
    if (!userId) return;

    try {
        const response = await undoLastInteraction(userId);

        if (response.message === 'Last interaction undone successfully' && response.movieDetails) {
            console.log('Last interaction undone. Restoring movie:', response.movieDetails.title);

            // Re-insert the undone movie at the current position in the array.
            // This places it back on top of the stack for the user to interact with again.
            setMovies(prevMovies => {
                const newMovies = [...prevMovies];
                newMovies.splice(currentIndex, 0, response.movieDetails);
                return newMovies;
            });

        } else {
            console.error('Failed to undo interaction:', response.message || 'No movie details returned.');
        }
    } catch (error) {
        console.error('Error during undo operation:', error);
    }
  }, [currentIndex, userId]);

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
    <Container maxWidth="lg">
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        

        <Box sx={{ position: 'relative', width: '90vw', maxWidth: 900, height: '70vh', maxHeight: 600, mb: 2 }}>
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
      </Box>
    </Container>
  );
}

function App() {
  const [hotkeyModalOpen, setHotkeyModalOpen] = useState(false);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(() => {
    const storedThemeIndex = localStorage.getItem('selectedThemeIndex');
    return storedThemeIndex ? parseInt(storedThemeIndex, 10) : 0;
  });

  const handleOpenHotkeyModal = () => setHotkeyModalOpen(true);
  const handleCloseHotkeyModal = () => setHotkeyModalOpen(false);

  const setThemeIndex = (index) => {
    setCurrentThemeIndex(index);
    localStorage.setItem('selectedThemeIndex', index);
  };

  const activeTheme = themes[currentThemeIndex];

  return (
    <ThemeProvider theme={activeTheme.theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ background: activeTheme.backgroundGradient, minHeight: '100vh' }}>
          <AppBar position="static" sx={{ background: activeTheme.appBarGradient }}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 1.5, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                Capwise
              </Typography>
              <Button color="inherit" component={Link} to="/">
                <HomeIcon sx={{ mr: 0.5 }} /> Home
              </Button>
              <Button color="inherit" component={Link} to="/infographic">
                <BarChartIcon sx={{ mr: 0.5 }} /> Infographic
              </Button>
              <Button color="inherit" component={Link} to="/watchlist">
                <Bookmark sx={{ mr: 0.5 }} /> Watchlist
              </Button>
              <Button color="inherit" component={Link} to="/settings">
                <SettingsIcon sx={{ mr: 0.5 }} /> Settings
              </Button>
              <Button color="inherit" onClick={handleOpenHotkeyModal}>
                <HelpIcon sx={{ mr: 0.5 }} /> Hotkeys
              </Button>
            </Toolbar>
          </AppBar>
          <Routes>
            <Route path="/" element={<MovieSwipePage hotkeyModalOpen={hotkeyModalOpen} handleOpenHotkeyModal={handleOpenHotkeyModal} handleCloseHotkeyModal={handleCloseHotkeyModal} />} />
            <Route path="/settings" element={<Settings setThemeIndex={setThemeIndex} currentThemeIndex={currentThemeIndex} />} />
            <Route path="/infographic" element={<Infographic />} />
            <Route path="/watchlist" element={<Watchlist />} />
          </Routes>
          <HotkeyModal open={hotkeyModalOpen} handleClose={handleCloseHotkeyModal} />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;