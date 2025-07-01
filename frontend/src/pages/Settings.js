import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Alert, Link } from '@mui/material';

const API_BASE_URL = 'http://localhost:5001/api';

const resetUserProfile = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/reset-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error resetting user profile:', error);
    throw error;
  }
};

function Settings() {
  const [message, setMessage] = useState({ type: '', text: '' });
  const userId = localStorage.getItem('cineswipeUserId');

  const handleResetProfile = async () => {
    if (!userId) {
      setMessage({ type: 'error', text: 'User ID not found.' });
      return;
    }

    if (window.confirm("Are you sure you want to reset your entire movie taste profile? This action cannot be undone.")) {
      try {
        const response = await resetUserProfile(userId);
        if (response.message === 'User profile reset successfully') {
          setMessage({ type: 'success', text: 'Your movie taste profile has been reset.' });
          // Optionally, clear local storage or redirect to home to force a fresh start
          localStorage.removeItem('cineswipeUserId');
          // You might want to refresh the page or redirect the user
          window.location.reload();
        } else {
          setMessage({ type: 'error', text: `Failed to reset profile: ${response.error || 'Unknown error'}` });
        }
      } catch (error) {
        setMessage({ type: 'error', text: `Error resetting profile: ${error.message}` });
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" gutterBottom>
          To enable movie suggestions, you need to configure your API keys in the backend.
        </Typography>

        <Alert severity="info" sx={{ width: '100%', mt: 2 }}>
          <Typography variant="body2">
            Your Google Gemini API Key and TMDB API Key should be placed in the `.env` file located in the `backend` directory of your CineSwipe project.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Example `.env` file content:
          </Typography>
          <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px', overflowX: 'auto' }}>
            <code>
PORT=5000
GEMINI_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY
TMDB_API_KEY=YOUR_TMDB_API_KEY
            </code>
          </pre>
          <Typography variant="body2" sx={{ mt: 1 }}>
            You can obtain your API keys from:
            <ul>
              <li>Google Gemini API: <Link href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">Google AI Studio</Link></li>
              <li>TMDB API: <Link href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener">The Movie Database (TMDB)</Link></li>
            </ul>
          </Typography>
          <Typography variant="body2">
            After updating the `.env` file, restart your backend server for the changes to take effect.
          </Typography>
        </Alert>

        <Box sx={{ mt: 4, width: '100%' }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Reset Profile
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={handleResetProfile}
            fullWidth
          >
            Reset My Movie Taste Profile
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will clear all your movie interactions and suggested movies, starting your profile from scratch.
          </Typography>
        </Box>

        {message.text && (
          <Alert severity={message.type} sx={{ width: '100%', mt: 2 }}>
            {message.text}
          </Alert>
        )}
      </Box>
    </Container>
  );
}

export default Settings;
