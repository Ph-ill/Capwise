# Capwise Backend

This is the backend for the CineSwipe application, built with Node.js, Express.js, and NeDB.

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env` file in the `backend` directory with the following variables:
    ```
    PORT=5000
    GEMINI_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY
    TMDB_API_KEY=YOUR_TMDB_API_KEY
    ```
    *   `GEMINI_API_KEY`: Obtain this from the Google AI Studio.
    *   `TMDB_API_KEY`: Obtain this from The Movie Database (TMDB) website.

3.  **Run the Server:**
    ```bash
    node server.js
    ```

## Database

This backend uses [NeDB](https://github.com/louischatriand/nedb), a lightweight embedded database. Data will be stored in `.db` files within a `data/` directory inside the `backend` folder.

## API Endpoints (To be implemented)

*   `POST /api/movies/suggest`: Get movie suggestions based on user preferences.
*   `POST /api/users/interact`: Record user interactions (like, dislike, watchlist, not interested).
*   `GET /api/users/profile`: Get user's taste profile data.
*   `GET /api/movies/watchlist`: Get user's watchlist.