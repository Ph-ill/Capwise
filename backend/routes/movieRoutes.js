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
        console.log("--- Suggestion Request Debugging ---");
        console.log("User ID:", userId);
        console.log("User Profile Interactions Count:", userProfile.interactions.length);
        console.log("User Profile Suggested Movies Count:", userProfile.suggestedMovies.length);
        console.log("User Profile Suggested Movies (all):", userProfile.suggestedMovies);
        console.log("User Profile Interacted Movie IDs (all):", userProfile.interactions.map(i => i.movieId));

        const newSuggestions = [];
        const suggestedMovieIds = [];
        const suggestedMoviesWithTitles = [];
        // Use a Set for efficient checking of movies already added in this batch
        const currentBatchSuggestedIds = new Set(); // Initialize as empty Set

        // Function to fetch and filter popular movies
        const fetchAndFilterPopularMovies = async () => {
            let page = 1;
            while (newSuggestions.length < 5 && page < 20) { // Try more pages to find enough unique movies
                const tmdbPopular = await getPopularMoviesFromTMDB(page);
                if (tmdbPopular.length === 0) break; // No more popular movies

                for (const movie of tmdbPopular) {
                    if (newSuggestions.length >= 5) break; // Stop if we have enough unique suggestions

                    const isInteracted = userProfile.interactions.some(i => i.movieId === movie.id);
                    const isAlreadySuggestedInDb = userProfile.suggestedMovies.some(s => s.movieId === movie.id);
                    const isAlreadyInCurrentBatch = currentBatchSuggestedIds.has(Number(movie.id));

                    if (movie.title && !isInteracted && !isAlreadySuggestedInDb && !isAlreadyInCurrentBatch) {
                        const fullMovieDetails = await getMovieDetailsFromTMDB(movie.title); // Fetch full details for consistency
                        if (fullMovieDetails) { // Ensure fullMovieDetails is not null
                            newSuggestions.push(fullMovieDetails);
                            suggestedMovieIds.push(fullMovieDetails.id);
                            suggestedMoviesWithTitles.push({ movieId: fullMovieDetails.id, movieTitle: fullMovieDetails.title });
                            currentBatchSuggestedIds.add(Number(fullMovieDetails.id)); // Ensure it's a Number
                        }
                    }
                }
                page++;
            }
        };

        // Check if enough interactions for AI suggestions
        if (userProfile.interactions.length < INTERACTION_THRESHOLD) {
            // Cold start: Provide popular movies
            await fetchAndFilterPopularMovies();
        } else {
            // AI-powered suggestions with fallback
            try {
                const likedGenres = Object.entries(userProfile.tasteProfile.genres)
                    .filter(([, score]) => score > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([genre]) => genre);

                const dislikedGenres = Object.entries(userProfile.tasteProfile.genres)
                    .filter(([, score]) => score < 0)
                    .sort(([, a], [, b]) => a - b)
                    .map(([genre]) => genre);

                // Get titles of interacted and suggested movies for the prompt
                const interactedMovieTitles = userProfile.interactions.map(i => i.movieDetails ? i.movieDetails.title : '').filter(Boolean);
                const suggestedMovieTitles = userProfile.suggestedMovies.map(s => s.movieTitle).filter(Boolean);

                const excludedTitles = [...new Set([...interactedMovieTitles, ...suggestedMovieTitles])];

                let prompt = `Suggest 20 movies.`;

                if (likedGenres.length > 0) {
                    prompt += ` The user likes movies in genres such as ${likedGenres.join(', ')}.`;
                }
                if (dislikedGenres.length > 0) {
                    prompt += ` The user dislikes movies in genres such as ${dislikedGenres.join(', ')}.`;
                }
                if (excludedTitles.length > 0) {
                    prompt += ` DO NOT suggest any of the following movies: ${excludedTitles.join(', ')}.`;
                }

                prompt += ` Provide only the movie titles, one per line.`;
                console.log("Excluded Titles sent to Gemini:", excludedTitles);

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                const suggestedTitles = text.split('\n').map(title => title.trim()).filter(title => title.length > 0);

                for (const title of suggestedTitles) {
                    if (newSuggestions.length >= 5) break; // Stop if we have enough unique suggestions

                    const movieDetails = await getMovieDetailsFromTMDB(title);
                    if (movieDetails) {
                        const isInteracted = userProfile.interactions.some(i => i.movieId === movieDetails.id);
                        const isAlreadySuggestedInDb = userProfile.suggestedMovies.some(s => s.movieId === movieDetails.id);
                        const isAlreadyInCurrentBatch = currentBatchSuggestedIds.has(Number(movieDetails.id));

                        if (!isInteracted && !isAlreadySuggestedInDb && !isAlreadyInCurrentBatch) {
                            newSuggestions.push(movieDetails);
                            suggestedMovieIds.push(movieDetails.id);
                            suggestedMoviesWithTitles.push({ movieId: movieDetails.id, movieTitle: movieDetails.title });
                            currentBatchSuggestedIds.add(Number(movieDetails.id)); // Ensure it's a Number
                        }
                    }
                }
            } catch (geminiError) {
                console.error('Error calling Gemini API, falling back to popular movies:', geminiError);
                await fetchAndFilterPopularMovies(); // Fallback
            }
        }

        if (suggestedMoviesWithTitles.length > 0) {
            // Combine existing suggested movies with new suggestions
            const allSuggestedMovies = [...userProfile.suggestedMovies, ...suggestedMoviesWithTitles];
            await userStore.updateSuggestedMovies(userId, allSuggestedMovies);
            // Re-fetch the user profile to ensure it's up-to-date after the update
            userProfile = await userStore.getUserProfile(userId);
            console.log("User profile after re-fetch (suggestedMovies):");
            console.log(userProfile.suggestedMovies);
            console.log("Updated suggestedMovies for user:", userId, "with IDs:", suggestedMovieIds);
        }

        res.json({ movies: newSuggestions });

    } catch (error) {
        console.error('Error getting movie suggestions:', error);
        res.status(500).json({ error: 'Failed to get movie suggestions' });
    }
});

module.exports = router;
