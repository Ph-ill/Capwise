import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, List, ListItem, ListItemText, Paper, Container, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';

const UserSelection = ({ onProfileSelected }) => {
  const [profiles, setProfiles] = useState([]);
  const [newProfileName, setNewProfileName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/users/profiles');
      const data = await response.json();
      if (response.ok) {
        setProfiles(data.profiles);
      } else {
        setError(data.error || 'Failed to fetch profiles');
      }
    } catch (err) {
      setError('Network error or server is down.');
      console.error('Error fetching profiles:', err);
    }
  };

  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) {
      setError('Profile name cannot be empty.');
      return;
    }
    setError('');
    try {
      const response = await fetch('http://localhost:5001/api/users/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileName: newProfileName }),
      });
      const data = await response.json();
      if (response.ok) {
        fetchProfiles();
        setNewProfileName('');
      } else {
        setError(data.error || 'Failed to create profile');
      }
    } catch (err) {
      setError('Network error or server is down.');
      console.error('Error creating profile:', err);
    }
  };

  const handleDeleteProfile = async (profileName) => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/profile/${profileName}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchProfiles();
        // If the deleted profile was the active one, clear selection
        const activeProfile = localStorage.getItem('activeProfile');
        if (activeProfile === profileName) {
          localStorage.removeItem('activeProfile');
          onProfileSelected(null);
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete profile');
      }
    } catch (err) {
      setError('Network error or server is down.');
      console.error('Error deleting profile:', err);
    }
  };

  const handleDeleteProfileById = async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/profile-by-id/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchProfiles();
        // If the deleted profile was the active one, clear selection
        // Note: Old profiles might not have an activeProfile entry, but good to be safe
        const activeProfile = localStorage.getItem('activeProfile');
        if (activeProfile === id) { // Assuming old userId was stored as activeProfile
          localStorage.removeItem('activeProfile');
          onProfileSelected(null);
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete profile by ID');
      }
    } catch (err) {
      setError('Network error or server is down.');
      console.error('Error deleting profile by ID:', err);
    }
  };

  const handleCleanUpOldProfiles = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/users/cleanup-old-profiles', {
        method: 'DELETE',
      });
      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchProfiles();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to clean up old profiles');
      }
    } catch (err) {
      setError('Network error or server is down.');
      console.error('Error cleaning up old profiles:', err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" gutterBottom>Select or Create Profile</Typography>
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        <Box sx={{ display: 'flex', width: '100%', mb: 3 }}>
          <TextField
            label="New Profile Name"
            variant="outlined"
            fullWidth
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateProfile();
              }
            }}
          />
          <Button variant="contained" sx={{ ml: 2 }} onClick={handleCreateProfile}>Create</Button>
        </Box>

        <Typography variant="h6" gutterBottom>Existing Profiles</Typography>
        
        {profiles.length === 0 ? (
          <Typography>No profiles found. Create one above!</Typography>
        ) : (
          <List sx={{ width: '100%', maxHeight: 300, overflow: 'auto' }}>
            {profiles.map((profile) => (
              <ListItem
                key={profile._id} // Use _id as key for all profiles
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => {
                    // Determine which delete API to call based on profileName existence
                    if (profile.profileName) {
                      handleDeleteProfile(profile.profileName);
                    } else if (profile._id) {
                      handleDeleteProfileById(profile._id);
                    }
                  }}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <Button fullWidth onClick={() => onProfileSelected(profile.profileName || profile.userId)} sx={{ justifyContent: 'flex-start' }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  <ListItemText 
                    primary={profile.profileName || `Unnamed Profile (ID: ${profile._id})`} 
                    secondary={profile.lastActive ? `Last active: ${new Date(profile.lastActive).toLocaleString()}` : 'Never active'} 
                  />
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default UserSelection;
