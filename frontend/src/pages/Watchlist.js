import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Container, Typography, Box, CircularProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';
import WatchlistItem from '../components/WatchlistItem'; // Import the new WatchlistItem component
import { MovieContext } from '../context/MovieContext';

const API_BASE_URL = 'http://localhost:5001/api';

function Watchlist() {
  const { profileName } = useContext(MovieContext);
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('watchlist'); // Default filter to watchlist

  const getWatchlist = useCallback(async () => {
    if (!profileName) {
      setLoading(false);
      return; // Ensure profileName is available before fetching
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile/${profileName}`);
      if (response.ok) {
        const data = await response.json();
        setWatchlistMovies(data.profile.interactions || []);
      } else {
        console.error('Error fetching user profile for watchlist filtering');
        setWatchlistMovies([]);
      }
    } catch (error) {
      console.error('Network error or server is down:', error);
      setWatchlistMovies([]);
    } finally {
      setLoading(false);
    }
  }, [profileName]); // Dependency on profileName

  useEffect(() => {
    getWatchlist();
  }, [getWatchlist]); // Dependency on getWatchlist

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) { // Prevent unselecting all
      setFilter(newFilter);
    }
  };

  const filteredMovies = watchlistMovies.filter(movie => {
    if (filter === 'all') return true;
    return movie.type === filter;
  });

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
    <Container maxWidth="md">
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          aria-label="movie interaction filter"
          sx={{ mb: 3 }}
        >
          <ToggleButton value="all" aria-label="all movies">All</ToggleButton>
          <ToggleButton value="strong_like" aria-label="super liked">Super Liked</ToggleButton>
          <ToggleButton value="like" aria-label="liked">Liked</ToggleButton>
          <ToggleButton value="dislike" aria-label="disliked">Disliked</ToggleButton>
          <ToggleButton value="strong_dislike" aria-label="super disliked">Super Disliked</ToggleButton>
          <ToggleButton value="not_interested" aria-label="not interested">Not Interested</ToggleButton>
          <ToggleButton value="watchlist" aria-label="watchlist">Watchlist</ToggleButton>
        </ToggleButtonGroup>

        {filteredMovies.length > 0 ? (
          <Box sx={{ width: '100%' }}>
            {filteredMovies.map((movie) => (
              <WatchlistItem key={movie.movieDetails.id} movie={movie.movieDetails} profileName={profileName} onRemove={getWatchlist} />
            ))}
          </Box>
        ) : (
          <Typography variant="h6">No movies found for this filter.</Typography>
        )}
      </Box>
    </Container>
  );
}

export default Watchlist;
