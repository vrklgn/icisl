// app.js

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // To parse JSON bodies
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static('public'));

// Load scores from a JSON file
let scores = require('./scores.json');

// Existing routes...

// New route to handle score updates
app.post('/update-score', (req, res) => {
  const { team, delta } = req.body;

  // Validate input
  if (!['teamA', 'teamB', 'teamC'].includes(team) || isNaN(delta)) {
    return res.status(400).json({ success: false, message: 'Invalid input' });
  }

  // Update the score
  scores[team] += Number(delta);

  // Prevent negative scores (optional)
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