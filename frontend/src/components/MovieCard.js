import { Card, CardContent, Typography, CardMedia, Link as MuiLink, Box, Button } from '@mui/material';
import { AddCircleOutline, OpenInNew } from '@mui/icons-material';
import { useNotification } from '../notifications/NotificationContext';

const API_BASE_URL = 'http://localhost:5001/api';

const MovieCard = ({ movie }) => {
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

  const showRadarrButton = localStorage.getItem('radarrUrl') && localStorage.getItem('radarrApiKey');

  return (
    <Card sx={{
      width: '90vw', // Make it wider, relative to viewport width
      maxWidth: 1000, // Increased max width to accommodate wider content
      height: '85vh', // Make it taller, relative to viewport height
      maxHeight: 750, // Max height
      display: 'flex',
      margin: 'auto',
      mt: 2, // Reduced top margin to fill space
      boxShadow: 3,
    }}>
      <CardMedia
        component="img"
        sx={{ width: 'auto', height: '100%', objectFit: 'cover', flexShrink: 0, aspectRatio: '2 / 3' }} // Image width determined by height and aspect ratio
        image={movie.cover || 'https://via.placeholder.com/400x600?text=No+Image'}
        alt={movie.title}
      />
      <CardContent sx={{ width: 500, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 3 }}>
        <Box>
          <Typography gutterBottom variant="h4" component="div" sx={{ mb: 0 }}>
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0 }}>
              Genres: {movie.genres.join(', ')}
            </Typography>
          )}
          {movie.voteAverage && (
            <Typography variant="h6" color="text.secondary" sx={{ mt: 1, fontWeight: 'bold' }}>
              TMDB Rating: {movie.voteAverage}/10
            </Typography>
          )}
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            {movie.description}
          </Typography>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          {imdbUrl && (
            <Button
              variant="contained"
              color="info" // Using 'info' color for IMDb button
              startIcon={<OpenInNew />}
              href={imdbUrl}
              target="_blank"
              rel="noopener"
            >
              View on IMDb
            </Button>
          )}
          {showRadarrButton && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutline />}
              onClick={handleAddToRadarr}
            >
              Add to Radarr
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MovieCard;