const express = require('express');
const router = express.Router();

// Route to get all user profiles
router.get('/profiles', async (req, res) => {
    const userStore = req.db.userStore;
    try {
        const profiles = await userStore.getAllProfiles();
        res.json({ profiles });
    } catch (error) {
        console.error('Error fetching all profiles:', error);
        res.status(500).json({ error: 'Failed to fetch profiles' });
    }
});

// Route to create a new user profile
router.post('/create-profile', async (req, res) => {
    const { profileName } = req.body;
    const userStore = req.db.userStore;

    if (!profileName) {
        return res.status(400).json({ error: 'Profile name is required' });
    }

    try {
        const existingProfile = await userStore.getUserProfile(profileName);
        if (existingProfile) {
            return res.status(409).json({ error: 'Profile with this name already exists' });
        }
        const newProfile = await userStore.findOrCreate(profileName);
        res.status(201).json({ message: 'Profile created successfully', profile: newProfile });
    } catch (error) {
        console.error('Error creating profile:', error);
        res.status(500).json({ error: 'Failed to create profile' });
    }
});

// Route to delete a user profile
router.delete('/profile/:profileName', async (req, res) => {
    const { profileName } = req.params;
    const userStore = req.db.userStore;

    try {
        const numRemoved = await userStore.deleteProfile(profileName);
        if (numRemoved === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.status(200).json({ message: 'Profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ error: 'Failed to delete profile' });
    }
});

// Route to update last active timestamp
router.post('/update-last-active', async (req, res) => {
    const { profileName } = req.body;
    const userStore = req.db.userStore;

    if (!profileName) {
        return res.status(400).json({ error: 'Profile name is required' });
    }

    try {
        await userStore.updateLastActive(profileName);
        res.status(200).json({ message: 'Last active timestamp updated' });
    } catch (error) {
        console.error('Error updating last active timestamp:', error);
        res.status(500).json({ error: 'Failed to update last active timestamp' });
    }
});

router.get('/profile/:profileName', async (req, res) => {
    const { profileName } = req.params;
    const userStore = req.db.userStore;

    try {
        const userProfile = await userStore.getUserProfile(profileName);
        if (!userProfile) {
            return res.status(404).json({ error: 'User profile not found' });
        }
        res.json({ profile: userProfile });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

router.post('/undo-last-interaction', async (req, res) => {
    const { profileName } = req.body;
    const userStore = req.db.userStore;

    if (!profileName) {
        return res.status(400).json({ error: 'Missing profileName' });
    }

    try {
        const result = await userStore.undoLastInteraction(profileName);
        if (result.undone) {
            res.status(200).json({ message: 'Last interaction undone successfully', movieDetails: result.movieDetails });
        } else {
            res.status(404).json({ message: result.message || 'No interactions to undo' });
        }
    } catch (error) {
        console.error('Error undoing last interaction:', error);
        res.status(500).json({ error: 'Failed to undo last interaction' });
    }
});

router.get('/watchlist/:profileName', async (req, res) => {
    const { profileName } = req.params;
    const userStore = req.db.userStore;

    if (!profileName) {
        return res.status(400).json({ error: 'Missing profileName' });
    }

    try {
        const userProfile = await userStore.getUserProfile(profileName);
        if (!userProfile) {
            return res.status(404).json({ error: 'User profile not found' });
        }

        const watchlistMovies = userProfile.interactions
            .filter(interaction => interaction.type === 'watchlist')
            .map(interaction => interaction.movieDetails);

        res.json({ watchlist: watchlistMovies });
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
});

router.post('/reset-profile', async (req, res) => {
    const { profileName } = req.body;
    const userStore = req.db.userStore;

    if (!profileName) {
        return res.status(400).json({ error: 'Missing profileName' });
    }

    try {
        await userStore.resetUserProfile(profileName);
        res.status(200).json({ message: 'User profile reset successfully' });
    } catch (error) {
        console.error('Error resetting user profile:', error);
        res.status(500).json({ error: 'Failed to reset user profile' });
    }
});

router.delete('/interaction/:profileName/:movieId', async (req, res) => {
    const { profileName, movieId } = req.params;
    const userStore = req.db.userStore;

    if (!profileName || !movieId) {
        return res.status(400).json({ error: 'Missing profileName or movieId' });
    }

    try {
        const result = await userStore.removeInteraction(profileName, Number(movieId));
        if (result.removedCount > 0) {
            res.status(200).json({ message: 'Interaction removed successfully', removedCount: result.removedCount });
        } else {
            res.status(404).json({ message: 'Movie interaction not found for this user.' });
        }
    } catch (error) {
        console.error('Error removing interaction:', error);
        res.status(500).json({ error: 'Failed to remove interaction' });
    }
});

router.get('/taste-profile/:profileName', async (req, res) => {
    const { profileName } = req.params;
    const userStore = req.db.userStore;

    try {
        const userProfile = await userStore.getUserProfile(profileName);
        if (!userProfile) {
            return res.status(404).json({ error: 'User profile not found' });
        }
        // Return only the tasteProfile for the infographic
        res.json({ tasteProfile: userProfile.tasteProfile });
    } catch (error) {
        console.error('Error fetching user taste profile:', error);
        res.status(500).json({ error: 'Failed to fetch user taste profile' });
    }
});



// New route to delete a profile by its _id
router.delete('/profile-by-id/:id', async (req, res) => {
    const { id } = req.params;
    const userStore = req.db.userStore;

    try {
        const numRemoved = await new Promise((resolve, reject) => {
            userStore.db.remove({ _id: id }, {}, (err, n) => {
                if (err) return reject(err);
                resolve(n);
            });
        });

        if (numRemoved === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.status(200).json({ message: 'Profile deleted successfully by ID' });
    } catch (error) {
        console.error('Error deleting profile by ID:', error);
        res.status(500).json({ error: 'Failed to delete profile by ID' });
    }
});

module.exports = router;
