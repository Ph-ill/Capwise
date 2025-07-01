# Capwise Frontend

This is the frontend for the CineSwipe application, built with React.

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    ```bash
    npm start
    ```

    This will open the application in your browser at `http://localhost:3000`.

## Project Structure

*   `public/`: Static assets.
*   `src/`: React components and application logic.
    *   `components/`: Reusable UI components (e.g., MovieCard, Buttons).
    *   `pages/`: Top-level components for different views (e.g., Home, Settings, Infographic).
    *   `api/`: Functions for interacting with the backend API.
    *   `context/`: React Context for global state management (e.g., user profile, movie data).
    *   `utils/`: Utility functions.

## Key Features (Frontend)

*   **Movie Card Display:** Renders movie details and handles swipe/button interactions.
*   **Animation:** Uses Framer Motion for smooth transitions and feedback.
*   **State Management:** Manages the current movie, user interactions, and watchlist.
*   **API Integration:** Communicates with the backend to fetch movie suggestions and send user feedback.
*   **Settings Page:** Allows users to input API keys.
*   **Infographic Page:** Visualizes user's movie taste.