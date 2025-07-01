require('dotenv').config();
const express = require('express');
const Datastore = require('nedb');
const path = require('path');

const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
// Middleware
app.use(cors());
app.use(express.json());

// Initialize NeDB databases
const db = {};
db.movies = new Datastore({ filename: path.join(__dirname, 'data', 'movies.db'), autoload: true });
db.users = new Datastore({ filename: path.join(__dirname, 'data', 'users.db'), autoload: true });

const UserStore = require('./models/User');
db.userStore = new UserStore(db);

// Make db object available to routes
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Import routes
const movieRoutes = require('./routes/movieRoutes');
const userRoutes = require('./routes/userRoutes');

// Use routes
app.use('/api/movies', movieRoutes);
app.use('/api/users', userRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('CineSwipe Backend API');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});