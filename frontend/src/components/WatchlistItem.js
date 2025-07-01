import React from 'react';
import { Card, CardContent, Typography, CardMedia, Box, Link as MuiLink, Button, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AddCircleOutline, OpenInNew, Close as CloseIcon } from '@mui/icons-material';
import { useNotification } from '../notifications/NotificationContext';

const API_BASE_URL = 'http://localhost:5001/api';

const WatchlistItem = ({ movie, userId, onRemove }) => {
  const theme = useTheme();
  const imdbUrl = movie.imdbId ? `https://www.imdb.com/title/${movie.imdbId}/` : null;
  const { showNotification } = useNotification();

  const handleAddToRadarr = async () => {
    const radarrUrl = localStorage.getItem('radarrUrl');
    const radarrApiKey = localStorage.getItem('radarrApiKey');

    if (!radarrUrl || !radarrApiKey) {
      showNotification('Please configure Radarr URL and API Key in settings.', 'warning');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/radarr/add-movie`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          radarrUrl,
          radarrApiKey,
          tmdbId: movie.id,
          title: movie.title,
        }),
      });

      if (response.ok) {
        showNotification(`${movie.title} added to Radarr successfully!`, 'success');
      } else {
        const errorData = await response.json();
        showNotification(`Failed to add ${movie.title} to Radarr: ${errorData.error || errorData.message || JSON.stringify(errorData)}`, 'error');
      }
    } catch (error) {
      console.error('Error adding to Radarr:', error);
      showNotification(`Error adding ${movie.title} to Radarr. Details: ${error.message}`, 'error');
    }
  };

  const handleRemove = async () => {
    if (!userId || !movie.id) {
      showNotification('Cannot remove movie: Missing user or movie ID.', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/interaction/${userId}/${movie.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showNotification(`${movie.title} removed from records.`, 'success');
        onRemove(movie.id); // Notify parent to update list
      } else {
        const errorData = await response.json();
        showNotification(`Failed to remove ${movie.title}: ${errorData.message || JSON.stringify(errorData)}`, 'error');
      }
    } catch (error) {
      console.error('Error removing interaction:', error);
      showNotification(`Error removing ${movie.title}. Details: ${error.message}`, 'error');
    }
  };

  const showRadarrButton = localStorage.getItem('radarrUrl') && localStorage.getItem('radarrApiKey');

  return (
    <Card sx={{
      display: 'flex',
      mb: 2, // Margin bottom for spacing between items
      height: 120, // Fixed height for a short vertical card
      width: 'calc(100% - 32px)', // Almost full width with padding
      mx: 2, // Horizontal margin for padding
      boxShadow: 1,
      backgroundColor: theme.palette.background.paper, // Use theme paper color
      position: 'relative', // For positioning the remove button
    }}>
      <IconButton
        aria-label="remove"
        size="small"
        onClick={handleRemove}
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          color: theme.palette.error.main, // Red color
          zIndex: 1, // Ensure it's above other content
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      <CardMedia
        component="img"
        sx={{
          width: 80, // Small fixed width for the poster
          height: '100%',
          objectFit: 'cover',
          flexShrink: 0,
          aspectRatio: '2 / 3', // Maintain aspect ratio
        }}
        image={movie.cover || 'https://via.placeholder.com/400x600?text=No+Image'}
        alt={movie.title}
      />
      <CardContent sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        py: 1, // Reduced vertical padding
        '&:last-child': { pb: 1 }, // Ensure padding is consistent
      }}>
        <Typography variant="h6" component="div" sx={{ lineHeight: 1.2 }}>
          {imdbUrl ? (
            <MuiLink href={imdbUrl} target="_blank" rel="noopener" color="inherit" underline="hover">
              {movie.title}
            </MuiLink>
          ) : (
            movie.title
          )}
          {' '}({movie.releaseYear})
        </Typography>
        {movie.genres && movie.genres.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Genres: {movie.genres.join(', ')}
          </Typography>
        )}
        {movie.voteAverage && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            TMDB Rating: {movie.voteAverage}/10
          </Typography>
        )}
        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
          {imdbUrl && (
            <Button
              variant="contained"
              color="info"
              size="small"
              startIcon={<OpenInNew />}
              href={imdbUrl}
              target="_blank"
              rel="noopener"
            >
              IMDb
            </Button>
          )}
          {showRadarrButton && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<AddCircleOutline />}
              onClick={handleAddToRadarr}
            >
              Radarr
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default WatchlistItem;