const express = require('express');
const router = express.Router();

router.get('/profile/:userId', async (req, res) => {
    const { userId } = req.params;
    const userStore = req.db.userStore;

    try {
        const userProfile = await userStore.getUserProfile(userId);
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
    const { userId } = req.body;
    const userStore = req.db.userStore;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        const result = await userStore.undoLastInteraction(userId);
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

router.get('/watchlist/:userId', async (req, res) => {
    const { userId } = req.params;
    const userStore = req.db.userStore;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        const userProfile = await userStore.getUserProfile(userId);
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
    const { userId } = req.body;
    const userStore = req.db.userStore;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        await userStore.resetUserProfile(userId);
        res.status(200).json({ message: 'User profile reset successfully' });
    } catch (error) {
        console.error('Error resetting user profile:', error);
        res.status(500).json({ error: 'Failed to reset user profile' });
    }
});

router.delete('/interaction/:userId/:movieId', async (req, res) => {
    const { userId, movieId } = req.params;
    const userStore = req.db.userStore;

    if (!userId || !movieId) {
        return res.status(400).json({ error: 'Missing userId or movieId' });
    }

    try {
        const result = await userStore.removeInteraction(userId, Number(movieId));
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

router.get('/taste-profile/:userId', async (req, res) => {
    const { userId } = req.params;
    const userStore = req.db.userStore;

    try {
        const userProfile = await userStore.getUserProfile(userId);
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

module.exports = router;
