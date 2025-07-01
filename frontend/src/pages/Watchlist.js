import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Grid } from '@mui/material';
import MovieCard from '../components/MovieCard'; // Assuming MovieCard can display full movie details

const API_BASE_URL = 'http://localhost:5001/api';

const fetchWatchlist = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/watchlist/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.watchlist;
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return [];
  }
};

function Watchlist() {
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('cineswipeUserId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // Handle case where userId is not found (e.g., redirect to home or show a message)
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      const getWatchlist = async () => {
        setLoading(true);
        const movies = await fetchWatchlist(userId);
        setWatchlistMovies(movies);
        setLoading(false);
      };
      getWatchlist();
    }
  }, [userId]);

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading Watchlist...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Watchlist
        </Typography>
        {watchlistMovies.length > 0 ? (
          <Grid container spacing={3}>
            {watchlistMovies.map((movie) => (
              <Grid item key={movie.id} xs={12} sm={6} md={4}>
                {/* MovieCard might need adjustments to display nicely in a grid */}
                <MovieCard movie={movie} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="h6">Your watchlist is empty. Start swiping to add movies!</Typography>
        )}
      </Box>
    </Container>
  );
}

export default Watchlist;
