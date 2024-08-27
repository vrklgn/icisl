// START GENAI@CHATGPT4
var express = require('express');
var axios = require('axios');
var app = express();

// Serve static files from the "public" directory
app.use(express.static('public'));

const fetchXMLFeed = async () => {
    const url = "https://share.garmin.com/Feed/Share/kebnekaise";
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

app.get('/fetch-feed', async (req, res) => {
    try {
        const data = await fetchXMLFeed();

        // Send the data as the response
        res.send(data);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.listen(8080, function(){
    console.log('App is listening on port 8080');
});
