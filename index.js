// index.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8080; // Set the server to listen on port 8080

// Middleware to parse incoming requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: `https://app-aagbtkrekue.canva-apps.com`,
    optionsSuccessStatus: 200,
  })
);

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public folder
app.use(express.static('public'));

// Load scores from a JSON file
let scores = require('./scores.json');

// Routes
app.get('/', (req, res) => {
  res.render('index', { scores });
});

app.get('/admin', (req, res) => {
  res.render('admin', { scores });
});

app.get('/presentation', (req, res) => {
  res.render('presentation', { scores });
});

app.post('/update-score', (req, res) => {
  const { team, delta } = req.body;

  // Validate input
  if (!['teamA', 'teamB', 'teamC'].includes(team) || isNaN(delta)) {
    return res.status(400).json({ success: false, message: 'Invalid input' });
  }

  // Update the score
  scores[team] += Number(delta);

  // Prevent negative scores
  if (scores[team] < 0) {
    scores[team] = 0;
  }

  // Save the updated scores to the JSON file
  fs.writeFile('./scores.json', JSON.stringify(scores, null, 2), (err) => {
    if (err) {
      console.error('Error writing to scores.json:', err);
      return res.status(500).json({ success: false, message: 'Failed to update score' });
    }
    console.log(`Updated ${team} score to ${scores[team]}`);
    res.json({ success: true, newScore: scores[team] });
  });
});

// Route to get current scores
app.get('/scores', (req, res) => {
  res.json(scores);
});

// This keeps the server running by listening on port 8080
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
