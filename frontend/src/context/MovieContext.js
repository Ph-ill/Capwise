import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getMovieSuggestions, recordInteraction, undoLastInteraction } from '../api/movies';

export const MovieContext = createContext();

export const MovieProvider = ({ children, profileName: propProfileName }) => {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState(propProfileName);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  // Update profileName state when propProfileName changes
  useEffect(() => {
    setProfileName(propProfileName);
    // Reset initial fetch state when profile changes
    setIsInitialLoad(true);
    setInitialFetchDone(false);
  }, [propProfileName]);

  // Remove automatic userId generation
  useEffect(() => {
    const storedProfileName = localStorage.getItem('activeProfile');
    if (storedProfileName) {
      setProfileName(storedProfileName);
    }
  }, []);

  const fetchMovies = useCallback(async () => {
    if (!profileName) return;

    setLoading(true);
    try {
      const data = await getMovieSuggestions(profileName);
      if (data.movies && data.movies.length > 0) {
        setMovies(data.movies);
        setCurrentIndex(0);
      } else {
        setMovies([]);
        console.log("No new movie suggestions.");
      }
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [profileName]);

  // Fetch initial movies
  useEffect(() => {
    if (profileName && !initialFetchDone) {
      const performInitialFetch = async () => {
        await fetchMovies();
        setInitialFetchDone(true);
        setIsInitialLoad(false);
      };
      performInitialFetch();
    }
  }, [profileName, fetchMovies, initialFetchDone]);

  const handleInteraction = useCallback(async (action, movie, movieIndex) => {
    if (!movie || !profileName) return;

    try {
      await recordInteraction(profileName, movie.id, action, {
        id: movie.id, // Ensure movie ID is stored in movieDetails
        title: movie.title,
        genres: movie.genres,
        director: movie.director,
        writers: movie.writers,
        actors: movie.actors,
        cover: movie.cover,
        releaseYear: movie.releaseYear,
        imdbId: movie.imdbId,
      });
      console.log(`Movie ${movie.title} - Action: ${action} recorded.`);
    } catch (error) {
      console.error("Error recording interaction:", error);
    }

    // Move to the next movie and fetch more if needed
    const nextIndex = movieIndex + 1; // Use the passed movieIndex
    if (nextIndex >= movies.length) {
      fetchMovies(); // Fetch a new batch when the current one is exhausted
    } else {
      setCurrentIndex(nextIndex);
    }
  }, [movies.length, fetchMovies, profileName]); // Removed currentIndex from dependencies

  const handleUndo = useCallback(async () => {
    if (!profileName) return;

    try {
        const response = await undoLastInteraction(profileName);

        if (response.message === 'Last interaction undone successfully' && response.movieDetails) {
            console.log('Last interaction undone. Restoring movie:', response.movieDetails.title);

            setMovies(prevMovies => {
                const newMovies = [...prevMovies];
                newMovies.splice(currentIndex, 0, response.movieDetails);
                return newMovies;
            });
            // Do not change currentIndex here, as the movie is inserted at the current position

        } else {
            console.error('Failed to undo interaction:', response.message || 'No movie details returned.');
        }
    } catch (error) {
        console.error('Error during undo operation:', error);
    }
  }, [currentIndex, profileName]);

  const value = {
    movies,
    currentIndex,
    loading,
    profileName,
    setProfileName,
    isInitialLoad,
    fetchMovies,
    handleInteraction,
    handleUndo,
    setCurrentIndex, // Expose setCurrentIndex for MovieSwipePage to update
  };

  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );
};