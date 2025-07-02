const API_BASE_URL = 'http://localhost:5001/api';

export const recordInteraction = async (profileName, movieId, interactionType, movieDetails) => {
    try {
        const response = await fetch(`${API_BASE_URL}/movies/interact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ profileName, movieId, interactionType, movieDetails }),
        });
        return await response.json();
    } catch (error) {
        console.error('Error recording interaction:', error);
        throw error;
    }
};

export const getMovieSuggestions = async (profileName) => {
    try {
        const response = await fetch(`${API_BASE_URL}/movies/suggest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ profileName }),
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching movie suggestions:', error);
        throw error;
    }
};

export const undoLastInteraction = async (profileName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/undo-last-interaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profileName }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error undoing last interaction:', error);
    throw error;
  }
};
