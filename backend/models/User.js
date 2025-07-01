const Datastore = require('nedb');

class UserStore {
    constructor(db) {
        this.db = db.users;
    }

    async findOrCreate(userId) {
        return new Promise((resolve, reject) => {
            this.db.findOne({ userId }, (err, doc) => {
                if (err) return reject(err);
                if (doc) return resolve(doc);

                const newUser = {
                    userId,
                    interactions: [], // { movieId, type: 'like' | 'dislike' | 'strong_like' | 'strong_dislike' | 'watchlist' | 'not_interested', timestamp, movieDetails }
                    tasteProfile: {
                        genres: {},
                        directors: {},
                        writers: {},
                        actors: {},
                    },
                    suggestedMovies: [], // To keep track of movies already suggested (array of { movieId, movieTitle })
                };
                this.db.insert(newUser, (err, newDoc) => {
                    if (err) return reject(err);
                    resolve(newDoc);
                });
            });
        });
    }

    async addInteraction(userId, movieId, interactionType, movieDetails) {
        return new Promise((resolve, reject) => {
            this.db.findOne({ userId }, (err, user) => {
                if (err) return reject(err);
                if (!user) return reject(new Error('User not found'));

                // Add the new interaction
                console.log(`Adding interaction for movieId: ${movieId} (Type: ${typeof movieId})`);
                user.interactions.push({ movieId, type: interactionType, timestamp: new Date(), movieDetails });

                // Recalculate taste profile from scratch for accuracy
                user.tasteProfile = this._recalculateTasteProfile(user.interactions);

                this.db.update(
                    { userId },
                    { $set: { interactions: user.interactions, tasteProfile: user.tasteProfile } },
                    { upsert: true },
                    (err, numReplaced) => {
                        if (err) return reject(err);
                        resolve(numReplaced);
                    }
                );
            });
        });
    }

    async undoLastInteraction(userId) {
        return new Promise((resolve, reject) => {
            this.db.findOne({ userId }, (err, user) => {
                if (err) return reject(err);
                if (!user || user.interactions.length === 0) {
                    return resolve({ undone: false, message: 'No interactions to undo.' });
                }

                const lastInteraction = user.interactions.pop();
                user.tasteProfile = this._recalculateTasteProfile(user.interactions);

                this.db.update(
                    { userId },
                    { $set: { interactions: user.interactions, tasteProfile: user.tasteProfile } },
                    {},
                    (err, numReplaced) => {
                        if (err) return reject(err);
                        if (numReplaced > 0) {
                            resolve({ undone: true, movieDetails: lastInteraction.movieDetails });
                        } else {
                            resolve({ undone: false, message: 'Failed to undo interaction.' });
                        }
                    }
                );
            });
        });
    }

    async resetUserProfile(userId) {
        return new Promise((resolve, reject) => {
            this.db.update(
                { userId },
                { $set: { interactions: [], tasteProfile: { genres: {}, directors: {}, writers: {}, actors: {} }, suggestedMovies: [] } },
                {}, // Options, no upsert needed here as user should exist
                (err, numReplaced) => {
                    if (err) return reject(err);
                    resolve(numReplaced);
                }
            );
        });
    }

    _sanitizeKey(key) {
        return key.replace(/\./g, '_'); // Replace dots with underscores
    }

    _recalculateTasteProfile(interactions) {
        const newTasteProfile = {
            genres: {},
            directors: {},
            writers: {},
            actors: {},
        };

        interactions.forEach(interaction => {
            const { type, movieDetails } = interaction;

            // Ensure movieDetails exists before processing
            if (!movieDetails) {
                console.warn("Skipping interaction due to missing movieDetails:", interaction);
                return; // Skip this interaction
            }

            const score = (type === 'like' || type === 'strong_like') ? 1 : -1;

            // Update genres
            if (movieDetails.genres && Array.isArray(movieDetails.genres)) {
                movieDetails.genres.forEach(genre => {
                    const sanitizedGenre = this._sanitizeKey(genre);
                    newTasteProfile.genres[sanitizedGenre] = (newTasteProfile.genres[sanitizedGenre] || 0) + score;
                });
            }

            // Update director
            if (movieDetails.director) {
                const sanitizedDirector = this._sanitizeKey(movieDetails.director);
                newTasteProfile.directors[sanitizedDirector] = (newTasteProfile.directors[sanitizedDirector] || 0) + score;
            }

            // Update writers
            if (movieDetails.writers && Array.isArray(movieDetails.writers)) {
                movieDetails.writers.forEach(writer => {
                    const sanitizedWriter = this._sanitizeKey(writer);
                    newTasteProfile.writers[sanitizedWriter] = (newTasteProfile.writers[sanitizedWriter] || 0) + score;
                });
            }

            // Update actors
            if (movieDetails.actors && Array.isArray(movieDetails.actors)) {
                movieDetails.actors.forEach(actor => {
                    const sanitizedActor = this._sanitizeKey(actor);
                    newTasteProfile.actors[sanitizedActor] = (newTasteProfile.actors[sanitizedActor] || 0) + score;
                });
            }
        });

        return newTasteProfile;
    }

    async updateSuggestedMovies(userId, suggestedMovies) {
        return new Promise((resolve, reject) => {
            this.db.update(
                { userId },
                { $set: { suggestedMovies: suggestedMovies } },
                { upsert: true },
                (err, numReplaced) => {
                    if (err) return reject(err);
                    resolve(numReplaced);
                }
            );
        });
    }

    async getUserProfile(userId) {
        return new Promise((resolve, reject) => {
            this.db.findOne({ userId }, (err, doc) => {
                if (err) return reject(err);
                resolve(doc);
            });
        });
    }
}

module.exports = UserStore;
