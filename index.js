// START GENAI@CHATGPT4
var express = require('express');
var axios = require('axios');
var xml2js = require('xml2js');
var app = express();
console.log(process.env.mapkey);

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

            // Fetch the <Placemark> within <Folder>
            const placemark = result.kml.Document[0].Folder[0].Placemark[0];
            const extendedData = placemark.ExtendedData[0].Data;
            const lat = extendedData.find(data => data['$'].name === 'Latitude').value[0];
            const long = extendedData.find(data => data['$'].name === 'Longitude').value[0];
            const time = extendedData.find(data => data['$'].name === 'Time').value[0];

            // Send the values as the response
            res.send({ lat, long, time });
        });
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.listen(8080, function(){
    console.log('App is listening on port 8080');
});
