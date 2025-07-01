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
        res.json({ profile: userProfile.tasteProfile });
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
        const numReplaced = await userStore.undoLastInteraction(userId);
        if (numReplaced > 0) {
            res.status(200).json({ message: 'Last interaction undone successfully' });
        } else {
            res.status(404).json({ message: 'No interactions to undo' });
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

module.exports = router;
