const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const INTERACTION_THRESHOLD = 0; // Number of interactions before AI suggestions kick in

// Helper to fetch movie details from TMDB by title
const getMovieDetailsFromTMDB = async (movieTitle) => {
    try {
        const searchResponse = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieTitle)}`);
        const searchData = await searchResponse.json();

        if (searchData.results && searchData.results.length > 0) {
            const movieId = searchData.results[0].id;
            const movieDetailsResponse = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`);
            const movieDetails = await movieDetailsResponse.json();

            // Extract director, writers, actors
            const creditsResponse = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`);
            const creditsData = await creditsResponse.json();

            const director = creditsData.crew.find(person => person.job === 'Director');
            const writers = creditsData.crew.filter(person => person.department === 'Writing');
            const actors = creditsData.cast.slice(0, 5); // Top 5 actors

            const imdbId = movieDetails.imdb_id || null;
            console.log(`Fetched IMDb ID for ${movieDetails.title}: ${imdbId}`);
            return {
                id: Number(movieDetails.id),
                title: movieDetails.title,
                releaseYear: movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : 'N/A',
                description: movieDetails.overview,
                cover: movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` : null,
                genres: movieDetails.genres ? movieDetails.genres.map(g => g.name) : [],
                director: director ? director.name : null,
                writers: writers.map(w => w.name),
                actors: actors.map(a => a.name),
                imdbId: imdbId,
            };
        }
    } catch (error) {
        console.error("Error fetching movie details from TMDB:", error);
    }
    return null;
};

// Helper to fetch popular movies from TMDB
const getPopularMoviesFromTMDB = async (page = 1) => {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`);
        const data = await response.json();
        return data.results ? data.results.map(movie => ({ ...movie, id: Number(movie.id) })) : [];
    } catch (error) {
        console.error("Error fetching popular movies from TMDB:", error);
        return [];
    }
};

// Endpoint to record user interactions
router.post('/interact', async (req, res) => {
    const { userId, movieId, interactionType, movieDetails } = req.body;
    const userStore = req.db.userStore;

    if (!userId || !movieId || !interactionType || !movieDetails) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await userStore.addInteraction(userId, movieId, interactionType, movieDetails);
        res.status(200).json({ message: 'Interaction recorded successfully' });
    } catch (error) {
        console.error('Error recording interaction:', error);
        res.status(500).json({ error: 'Failed to record interaction' });
    }
});

// Endpoint to get movie suggestions
router.post('/suggest', async (req, res) => {
    const { userId } = req.body;
    const userStore = req.db.userStore;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        let userProfile = await userStore.findOrCreate(userId);
        const BATCH_SIZE = 20; // Number of suggestions to fetch at once

        // Filter out movies the user has already interacted with or that have been suggested
        const filterSeenMovies = (movies) => {
            const interactedMovieIds = new Set(userProfile.interactions.map(i => i.movieId));
            const suggestedMovieIds = new Set(userProfile.suggestedMovies.map(m => m.movieId));
            return movies.filter(movie => !interactedMovieIds.has(movie.id) && !suggestedMovieIds.has(movie.id));
        };

        // Function to fetch a batch of suggestions from popular movies
        const fetchBatchSuggestions = async () => {
            const suggestions = [];
            let page = 1;

            while (suggestions.length < BATCH_SIZE && page < 20) { // Increased page limit
                const popularMovies = await getPopularMoviesFromTMDB(page);
                if (popularMovies.length === 0) break;

                const uniqueMovies = filterSeenMovies(popularMovies);
                
                for (const movie of uniqueMovies) {
                    if (suggestions.length >= BATCH_SIZE) break;
                    
                    const fullDetails = await getMovieDetailsFromTMDB(movie.title);
                    if (fullDetails) {
                        // Final check to ensure we don't add a duplicate that might have slipped through
                        if (filterSeenMovies([fullDetails]).length > 0) {
                            suggestions.push(fullDetails);
                        }
                    }
                }
                page++;
            }
            return suggestions;
        };

        // AI-powered suggestions with fallback
        const fetchAiSuggestions = async () => {
            try {
                const likedGenres = Object.entries(userProfile.tasteProfile.genres)
                    .filter(([, score]) => score > 0)
                    .map(([genre]) => genre);
                const dislikedGenres = Object.entries(userProfile.tasteProfile.genres)
                    .filter(([, score]) => score < 0)
                    .map(([genre]) => genre);

                const excludedTitles = [
                    ...new Set([
                        ...userProfile.interactions.map(i => i.movieDetails.title),
                        ...userProfile.suggestedMovies.map(s => s.movieTitle)
                    ])
                ];

                let prompt = `Suggest ${BATCH_SIZE} movies.`;
                if (likedGenres.length > 0) prompt += ` The user likes movies in genres such as ${likedGenres.join(', ')}.`;
                if (dislikedGenres.length > 0) prompt += ` The user dislikes movies in genres such as ${dislikedGenres.join(', ')}.`;
                if (excludedTitles.length > 0) prompt += ` Do not suggest any of the following movies: ${excludedTitles.join(', ')}.`;
                prompt += ` Provide only the movie titles, one per line.`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                const titles = text.split('\n').map(t => t.trim()).filter(Boolean);

                const moviePromises = titles.map(title => getMovieDetailsFromTMDB(title));
                let movies = (await Promise.all(moviePromises)).filter(Boolean);
                
                // Filter out seen movies from AI suggestions
                movies = filterSeenMovies(movies);

                // If AI gives fewer unique suggestions than needed, top up with popular ones
                if (movies.length < BATCH_SIZE) {
                    const popularFallback = await fetchBatchSuggestions();
                    const combined = [...movies, ...popularFallback];
                    const movieIds = new Set();
                    // Ensure final list is unique
                    movies = combined.filter(movie => {
                        if (movieIds.has(movie.id)) {
                            return false;
                        }
                        movieIds.add(movie.id);
                        return true;
                    }).slice(0, BATCH_SIZE);
                }
                
                return movies;

            } catch (error) {
                console.error('Error with Gemini API, falling back to popular movies:', error);
                return await fetchBatchSuggestions();
            }
        };

        const suggestions = userProfile.interactions.length < INTERACTION_THRESHOLD
            ? await fetchBatchSuggestions()
            : await fetchAiSuggestions();

        if (suggestions.length > 0) {
            const newSuggestedMovies = suggestions.map(m => ({ movieId: m.id, movieTitle: m.title }));
            await userStore.updateSuggestedMovies(userId, [...userProfile.suggestedMovies, ...newSuggestedMovies]);
        }

        res.json({ movies: suggestions });

    } catch (error) {
        console.error('Error getting movie suggestions:', error);
        res.status(500).json({ error: 'Failed to get movie suggestions' });
    }
});

module.exports = router;
