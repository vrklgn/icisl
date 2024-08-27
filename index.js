var express = require('express');
var app = express();

// Serve static files from the "public" directory
app.use(express.static('public'));

app.listen(3000, function(){
    console.log('App is listening on port 3000');
});