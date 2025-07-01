const express = require('express');
const router = express.Router();
const { default: fetch } = require('node-fetch');

router.post('/add-movie', async (req, res) => {
    const { radarrUrl, radarrApiKey, tmdbId, title } = req.body;

    if (!radarrUrl || !radarrApiKey || !tmdbId || !title) {
        return res.status(400).json({ error: 'Missing required Radarr parameters.' });
    }

    try {
        const radarrResponse = await fetch(`${radarrUrl}/api/v3/movie?apikey=${radarrApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tmdbId: tmdbId,
                title: title,
                qualityProfileId: 1, // Default, can be made configurable
                rootFolderPath: '/movies', // Default, can be made configurable
                monitored: true,
                searchForMovie: true,
            }),
        });

        const radarrData = await radarrResponse.json();

        if (radarrResponse.ok) {
            console.log(`Successfully added ${title} to Radarr. Response:`, radarrData);
            res.status(200).json({ message: `${title} added to Radarr successfully!`, data: radarrData });
        } else {
            console.error(`Failed to add ${title} to Radarr. Status: ${radarrResponse.status}, Response:`, radarrData);
            res.status(radarrResponse.status).json({ error: `Failed to add ${title} to Radarr: ${radarrData.message || radarrResponse.statusText || JSON.stringify(radarrData)}`, data: radarrData });
        }
    } catch (error) {
        console.error('Error communicating with Radarr:', error);
        res.status(500).json({ error: 'Failed to communicate with Radarr server.', details: error.message });
    }
});

module.exports = router;