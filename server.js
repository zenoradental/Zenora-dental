// Root proxy entry point for cloud deployment platforms (Render, Vercel, Heroku)
// This ensures that whether the platform executes 'node server.js' or 'npm start', the backend starts correctly.
const app = require('./backend/server.js');
module.exports = app;
