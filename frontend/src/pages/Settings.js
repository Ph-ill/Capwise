import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { themes } from '../themes';
import { useTheme } from '@mui/material/styles';

function Settings({ setThemeIndex, currentThemeIndex }) {
  const theme = useTheme();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('cineswipeUserId');

    if (storedUserId) setUserId(storedUserId);
  }, []);

  const handleSaveApiKeys = () => {
    localStorage.setItem('geminiApiKey', geminiApiKey);
    localStorage.setItem('tmdbApiKey', tmdbApiKey);
    alert('API Keys saved!');
  };

  const handleResetProfile = async () => {
    if (!userId) return;
    if (window.confirm('Are you sure you want to reset your profile? This cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:5001/api/users/reset-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });
        const data = await response.json();
        if (response.ok) {
          alert(data.message);
          // Optionally, clear local storage related to user profile or refresh
          localStorage.removeItem('selectedThemeIndex'); // Reset theme to default
          window.location.reload(); // Reload app to reflect changes
        } else {
          alert(data.error || 'Failed to reset profile');
        }
      } catch (error) {
        console.error('Error resetting profile:', error);
        alert('Error resetting profile.');
      }
    }
  };

  const handleThemeChange = (event) => {
    setThemeIndex(event.target.value);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>

        <Box sx={{ width: '100%', mt: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            API Key Management
          </Typography>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', p: 2, mt: 2, backgroundColor: theme.palette.background.paper }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              To update your API keys, please follow these steps:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
              <li>1. Locate the <code>.env</code> file in your backend project directory (e.g., <code>/path/to/your/project/backend/.env</code>).</li>
              <li>2. Open the <code>.env</code> file in a text editor.</li>
              <li>3. Update the <code>GEMINI_API_KEY</code> and <code>TMDB_API_KEY</code> values with your new keys.</li>
              <li>4. Save the <code>.env</code> file.</li>
              <li>5. Restart your backend server for the changes to take effect.</li>
            </Typography>
          </Box>
        </Box>

        <Box sx={{ width: '100%', mt: 5 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            App Theme
          </Typography>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="theme-select-label">Select Theme</InputLabel>
            <Select
              labelId="theme-select-label"
              id="theme-select"
              value={currentThemeIndex}
              label="Select Theme"
              onChange={handleThemeChange}
            >
              {themes.map((theme, index) => (
                <MenuItem key={theme.name} value={index}>
                  {theme.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ width: '100%', mt: 5 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            User Profile
          </Typography>
          <Button variant="contained" color="error" onClick={handleResetProfile} sx={{ mt: 2 }}>
            Reset My Profile
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Settings;
