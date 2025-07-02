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

// In-memory cache and lock for pre-fetching suggestions
const suggestionCache = new Map();
const prefetchLock = new Map(); // Stores promises for ongoing fetches

// Helper to fetch movie details from TMDB by title
const getMovieDetailsFromTMDB = async (movieTitle) => {
    try {
        const searchResponse = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieTitle)}`);
        const searchData = await searchResponse.json();

        if (searchData.results && searchData.results.length > 0) {
            const movieId = searchData.results[0].id;
            const movieDetailsResponse = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`);
            const movieDetails = await movieDetailsResponse.json();

            const creditsResponse = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`);
            const creditsData = await creditsResponse.json();

            const director = creditsData.crew ? creditsData.crew.find(person => person.job === 'Director') : null;
            const writers = creditsData.crew ? creditsData.crew.filter(person => person.department === 'Writing') : [];
            const actors = creditsData.cast ? creditsData.cast.slice(0, 5) : [];

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
                imdbId: movieDetails.imdb_id || null,
                voteAverage: movieDetails.vote_average ? movieDetails.vote_average.toFixed(1) : 'N/A', // Add TMDB vote average
            };
        }
    } catch (error) {
        console.error(`Error fetching details for ${movieTitle}:`, error);
    }
    return null;
};

// Helper to fetch popular movies from TMDB
const getMoviesFromTMDB = async (type = 'popular', page = 1) => {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/${type}?api_key=${TMDB_API_KEY}&page=${page}`);
        const data = await response.json();
        return data.results ? data.results.map(movie => ({ ...movie, id: Number(movie.id) })) : [];
    } catch (error) {
        console.error(`Error fetching ${type} movies from TMDB:`, error);
        return [];
    }
};

// Endpoint to record user interactions
router.post('/interact', async (req, res) => {
    const { profileName, movieId, interactionType, movieDetails } = req.body;
    const userStore = req.db.userStore;

    if (!profileName || !movieId || !interactionType || !movieDetails) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await userStore.addInteraction(profileName, movieId, interactionType, movieDetails);
        res.status(200).json({ message: 'Interaction recorded successfully' });
    } catch (error) {
        console.error('Error recording interaction:', error);
        res.status(500).json({ error: 'Failed to record interaction' });
    }
});

// Main function to robustly fetch a batch of suggestions
const fetchSuggestionBatch = async (userProfile) => {
    const BATCH_SIZE = 40;
    const seenMovieIds = new Set(userProfile.suggestedMovies.map(m => m.movieId).concat(userProfile.interactions.map(i => i.movieId)));
    console.log(`[fetchSuggestionBatch] Initial seenMovieIds count: ${seenMovieIds.size}`);

    const fetchFallbackMovies = async (seenMovieIds, excludeRecent = false) => {
    const uniqueFallbackSuggestions = [];
    const movieTypes = ['popular', 'top_rated', 'upcoming'];
    const MAX_PAGES_PER_TYPE = 50; // Increased search depth

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    for (const type of movieTypes) {
        let page = 1;
        while (uniqueFallbackSuggestions.length < BATCH_SIZE && page <= MAX_PAGES_PER_TYPE) {
            const movies = await getMoviesFromTMDB(type, page++);
            if (!movies || movies.length === 0) break;

            const detailedPromises = movies.map(m => getMovieDetailsFromTMDB(m.title));
            const detailedMovies = (await Promise.all(detailedPromises)).filter(Boolean);

            for (const movie of detailedMovies) {
                if (uniqueFallbackSuggestions.length >= BATCH_SIZE) break;
                if (!seenMovieIds.has(movie.id)) { // Only add if not already seen
                    if (excludeRecent) {
                        const releaseDate = movie.release_date ? new Date(movie.release_date) : null;
                        if (releaseDate && releaseDate > sixMonthsAgo) {
                            console.log(`[fetchFallbackMovies] Skipping recent movie (initial batch): ${movie.title} (Released: ${movie.release_date})`);
                            continue; // Skip this movie if it's too recent
                        }
                    }
                    uniqueFallbackSuggestions.push(movie);
                    console.log(`[fetchFallbackMovies] Adding unique movie: ${movie.title} (ID: ${movie.id})`);
                } else {
                    console.log(`[fetchFallbackMovies] Skipping seen movie: ${movie.title} (ID: ${movie.id})`);
                }
            }
        }
        if (uniqueFallbackSuggestions.length >= BATCH_SIZE) break; // Stop if we have enough movies
    }
    console.log(`[fetchFallbackMovies] Found ${uniqueFallbackSuggestions.length} unique and unseen movies from fallback sources.`);
    return uniqueFallbackSuggestions;
};

    const fetchAI = async () => {
        let suggestions = []; // Initialize suggestions here
        try {
            const likedMovies = userProfile.interactions.filter(i => i.type === 'like').map(i => i.movieDetails.title);
            const strongLikedMovies = userProfile.interactions.filter(i => i.type === 'strong_like').map(i => i.movieDetails.title);
            const dislikedMovies = userProfile.interactions.filter(i => i.type === 'dislike').map(i => i.movieDetails.title);
            const strongDislikedMovies = userProfile.interactions.filter(i => i.type === 'strong_dislike').map(i => i.movieDetails.title);
            const excludedTitles = [...new Set(userProfile.suggestedMovies.map(m => m.movieTitle))];

            let prompt = `Suggest ${BATCH_SIZE * 3} movies. Use the following films to understand my taste, but do not suggest any of them again.`; // Fetch more to allow for filtering
            if (strongLikedMovies.length > 0) prompt += ` These are films I really liked: ${strongLikedMovies.join(', ')}.`;
            if (likedMovies.length > 0) prompt += ` These are films I liked: ${likedMovies.join(', ')}.`;
            if (strongDislikedMovies.length > 0) prompt += ` These are films I hate: ${strongDislikedMovies.join(', ')}.`;
            if (dislikedMovies.length > 0) prompt += ` These are films I dislike: ${dislikedMovies.join(', ')}.`;
            if (excludedTitles.length > 0) prompt += ` Also, do not suggest these titles: ${excludedTitles.join(', ')}.`;
            prompt += ` Provide only movie titles, one per line.`;

            console.log(`[fetchAI] Sending prompt to Gemini: ${prompt}`);
            const result = await model.generateContent(prompt);
            const titles = result.response.text().split('\n').filter(Boolean);
            console.log(`[fetchAI] Gemini returned ${titles.length} titles.`);

            const moviePromises = titles.map(getMovieDetailsFromTMDB);
            const allFetched = (await Promise.all(moviePromises)).filter(Boolean);
            console.log(`[fetchAI] Successfully fetched details for ${allFetched.length} movies from TMDB based on Gemini titles.`);

            const suggestions = [];
            for (const movie of allFetched) {
                if (suggestions.length >= BATCH_SIZE) break;
                if (!seenMovieIds.has(movie.id)) {
                    suggestions.push(movie);
                    seenMovieIds.add(movie.id);
                }
            }
            console.log(`[fetchAI] Found ${suggestions.length} unique and unseen movies from AI suggestions.`);

            // Fallback if AI gives too few new suggestions
            if (suggestions.length < BATCH_SIZE) {
                console.log(`[fetchAI] AI suggestions insufficient (${suggestions.length}/${BATCH_SIZE}), falling back to popular movies.`);
                const fallbackMovies = await fetchFallbackMovies(seenMovieIds);
                for (const movie of fallbackMovies) {
                    if (suggestions.length >= BATCH_SIZE) break;
                    suggestions.push(movie);
                    seenMovieIds.add(movie.id); // Add to seen set
                }
                console.log(`[fetchAI] After initial fallback, total suggestions: ${suggestions.length}`);

                // If still not enough, fill with duplicates from fallbackMovies
                let fallbackIndex = 0;
                while (suggestions.length < BATCH_SIZE && fallbackMovies.length > 0) {
                    suggestions.push(fallbackMovies[fallbackIndex % fallbackMovies.length]);
                    fallbackIndex++;
                }
                console.log(`[fetchAI] After filling with duplicates, total suggestions: ${suggestions.length}`);
            }
            return suggestions;
        } catch (e) {
            console.error('[fetchAI] AI fetch failed, falling back to popular movies:', e);
            const fallbackMovies = await fetchFallbackMovies(seenMovieIds);
            for (const movie of fallbackMovies) {
                if (suggestions.length >= BATCH_SIZE) break;
                suggestions.push(movie);
                seenMovieIds.add(movie.id); // Add to seen set
            }
            // If still not enough, fill with duplicates from fallbackMovies
            let fallbackIndex = 0;
            while (suggestions.length < BATCH_SIZE && fallbackMovies.length > 0) {
                suggestions.push(fallbackMovies[fallbackIndex % fallbackMovies.length]);
                fallbackIndex++;
            }
            return suggestions;
        }
    };

    const initialSuggestions = userProfile.interactions.length < INTERACTION_THRESHOLD ? await fetchFallbackMovies(seenMovieIds, true) : await fetchAI();

    // Ensure initialSuggestions always has BATCH_SIZE movies
    let finalSuggestions = [...initialSuggestions];
    let fallbackIndex = 0;
    while (finalSuggestions.length < BATCH_SIZE && initialSuggestions.length > 0) {
        finalSuggestions.push(initialSuggestions[fallbackIndex % initialSuggestions.length]);
        fallbackIndex++;
    }
    console.log(`[fetchSuggestionBatch] Final batch size: ${finalSuggestions.length}`);
    return finalSuggestions;
};

// Function to manage pre-fetching movies and caching
const getMoviesForUser = async (profileName, userStore) => {
    // If a fetch is already in progress for this user, wait for it to complete.
    if (prefetchLock.has(profileName)) {
        console.log(`Request for ${profileName} is waiting for an ongoing prefetch...`);
        return prefetchLock.get(profileName);
    }

    // Check the cache for ready-to-serve suggestions.
    if (suggestionCache.has(profileName)) {
        const suggestions = suggestionCache.get(profileName);
        suggestionCache.delete(profileName);
        console.log(`Serving ${suggestions.length} movies from cache for ${profileName}.`);
        
        // Get the current user profile to get the *already suggested* movies
        const userProfile = await userStore.getUserProfile(profileName);

        // Update the user's suggestedMovies in the DB with the *newly served* movies
        const newSuggestedMovies = suggestions.map(m => ({ movieId: m.id, movieTitle: m.title }));
        const updatedSuggestedMoviesList = [...userProfile.suggestedMovies, ...newSuggestedMovies];
        await userStore.updateSuggestedMovies(profileName, updatedSuggestedMoviesList);

        // Create a profile for the *next* prefetch that includes all suggested movies so far
        const profileForNextPrefetch = { ...userProfile, suggestedMovies: updatedSuggestedMoviesList };

        // Asynchronously pre-fetch the next batch using the updated profile
        const prefetchPromise = fetchSuggestionBatch(profileForNextPrefetch);
        prefetchLock.set(profileName, prefetchPromise);

        prefetchPromise.then(nextBatch => {
            suggestionCache.set(profileName, nextBatch);
            console.log(`Successfully pre-fetched ${nextBatch.length} movies for ${profileName}.`);
        }).catch(err => {
            console.error(`Prefetch failed for ${profileName}:`, err);
        }).finally(() => {
            prefetchLock.delete(profileName);
        });

        return suggestions;
    }

    // If cache is empty and no fetch is in progress, fetch a new batch now.
    console.log(`Cache miss for ${profileName}. Fetching a new batch...`);
    const userProfile = await userStore.findOrCreate(profileName);

    const fetchPromise = fetchSuggestionBatch(userProfile);
    prefetchLock.set(profileName, fetchPromise);

    const suggestions = await fetchPromise;
    console.log(`Fetched ${suggestions.length} movies for ${profileName}.`);
    
    // Update user profile with the newly fetched suggestions
    const newSuggestedMovies = suggestions.map(m => ({ movieId: m.id, movieTitle: m.title }));
    const updatedSuggestedMoviesList = [...userProfile.suggestedMovies, ...newSuggestedMovies];
    await userStore.updateSuggestedMovies(profileName, updatedSuggestedMoviesList);

    prefetchLock.delete(profileName);

    // Trigger the next prefetch immediately after the current batch is served and saved
    const profileForNextPrefetch = { ...userProfile, suggestedMovies: updatedSuggestedMoviesList };
    const nextPrefetchPromise = fetchSuggestionBatch(profileForNextPrefetch);
    prefetchLock.set(profileName, nextPrefetchPromise);

    nextPrefetchPromise.then(nextBatch => {
        suggestionCache.set(profileName, nextBatch);
        console.log(`Successfully pre-fetched ${nextBatch.length} movies for ${profileName} into cache.`);
    }).catch(err => {
        console.error(`Prefetch failed for ${profileName}:`, err);
    }).finally(() => {
        prefetchLock.delete(profileName);
    });

    return suggestions;
};


router.post('/suggest', async (req, res) => {
    const { profileName } = req.body;
    const userStore = req.db.userStore;

    if (!profileName) {
        return res.status(400).json({ error: 'Missing profileName' });
    }

    try {
        const movies = await getMoviesForUser(profileName, userStore);
        res.json({ movies });
    } catch (error) {
        console.error(`Failed to get suggestions for ${profileName}:`, error);
        prefetchLock.delete(profileName); // Ensure lock is released on error
        res.status(500).json({ error: 'Failed to get movie suggestions' });
    }
});

module.exports = router;
