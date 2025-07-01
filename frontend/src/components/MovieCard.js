import React from 'react';
import { Card, CardContent, Typography, CardMedia, Link as MuiLink, Box } from '@mui/material';

const MovieCard = ({ movie }) => {
  const imdbUrl = movie.imdbId ? `https://www.imdb.com/title/${movie.imdbId}/` : null;

  return (
    <Card sx={{
      width: '90vw', // Make it wider, relative to viewport width
      maxWidth: 900, // Max width to prevent it from getting too big on very wide screens
      height: '70vh', // Make it taller, relative to viewport height
      maxHeight: 600, // Max height
      display: 'flex',
      margin: 'auto',
      mt: 5,
      boxShadow: 3,
    }}>
      <CardMedia
        component="img"
        sx={{ width: '40%', height: '100%', objectFit: 'cover', flexShrink: 0 }} // Image takes 40% width, fills height
        image={movie.cover || 'https://via.placeholder.com/400x600?text=No+Image'}
        alt={movie.title}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 3 }}>
        <Box>
          <Typography gutterBottom variant="h4" component="div">
            {imdbUrl ? (
              <MuiLink href={imdbUrl} target="_blank" rel="noopener" color="inherit" underline="hover">
                {movie.title}
              </MuiLink>
            ) : (
              movie.title
            )}
            {' '}({movie.releaseYear})
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            {movie.description}
          </Typography>
        </Box>
        {imdbUrl && (
          <Box sx={{ mt: 2 }}>
            <MuiLink href={imdbUrl} target="_blank" rel="noopener" variant="body2">
              View on IMDb
            </MuiLink>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MovieCard;