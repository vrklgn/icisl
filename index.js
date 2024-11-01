// index.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080; // Set the server to listen on port 8080

// Middleware to parse incoming requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

app.get('/oembed', (req, res) => {
  const { url, format } = req.query;

  // Check if 'format' is JSON (oEmbed only supports JSON, not XML in most cases)
  if (format !== 'json') {
    return res.status(400).json({ error: 'Only JSON format is supported.' });
  }

  // Verify that the URL parameter is present and matches a valid page on your site
  if (!url || !url.startsWith('https://badcombina.com:8080/')) {
    return res.status(400).json({ error: 'Invalid URL parameter.' });
  }

  // Generate the embed HTML for displaying the scores
  const embedHtml = `
    <div style="border: 1px solid #ddd; padding: 10px; max-width: 600px;">
      <h2>Quiz Scores</h2>
      <div>Team A: ${scores.teamA}</div>
      <div>Team B: ${scores.teamB}</div>
      <div>Team C: ${scores.teamC}</div>
    </div>
  `;

  // Construct the oEmbed JSON response
  const oEmbedResponse = {
    version: "1.0",
    type: "rich",
    provider_name: "Quiz Scoreboard",
    provider_url: "https://badcombina.com:8080",
    title: "Quiz Scores",
    html: embedHtml,
    width: 600,
    height: 150,
  };

  res.json(oEmbedResponse);
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
