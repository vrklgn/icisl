// START GENAI@CHATGPT4
var express = require('express');
var axios = require('axios');
var xml2js = require('xml2js');
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

        // Parse the XML data
        xml2js.parseString(data, (err, result) => {
            if (err) {
                console.error('Error:', err);
                return res.status(500).send(err.toString());
            }

            // Fetch the <Name> within <Document>
            const name = result.kml.Document[0].name[0];

            // Send the name as the response
            res.send(name);
        });
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.listen(8080, function(){
    console.log('App is listening on port 8080');
});
