import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getMovieSuggestions, recordInteraction, undoLastInteraction } from '../api/movies';

export const MovieContext = createContext();

export const MovieProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  // Initialize userId from localStorage or generate a new one
  useEffect(() => {
    let storedUserId = localStorage.getItem('cineswipeUserId');
    if (!storedUserId) {
      storedUserId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('cineswipeUserId', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  const fetchMovies = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const data = await getMovieSuggestions(userId);
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
  }, [userId]);

  // Fetch initial movies
  useEffect(() => {
    if (userId && !initialFetchDone) {
      const performInitialFetch = async () => {
        await fetchMovies();
        setInitialFetchDone(true);
        setIsInitialLoad(false);
      };
      performInitialFetch();
    }
  }, [userId, fetchMovies, initialFetchDone]);

  const handleInteraction = useCallback(async (action, movie, movieIndex) => {
    if (!movie || !userId) return;

    try {
      await recordInteraction(userId, movie.id, action, {
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
  }, [movies.length, fetchMovies, userId]); // Removed currentIndex from dependencies

  const handleUndo = useCallback(async () => {
    if (!userId) return;

    try {
        const response = await undoLastInteraction(userId);

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
  }, [currentIndex, userId]);

  const value = {
    movies,
    currentIndex,
    loading,
    userId,
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