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

app.get('/map-image', async (req, res) => {
    const { lat, long } = req.query;
    const url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${long}&zoom=14&maptype=hybrid&size=600x600&markers=icon:http://starfish-app-owgvm.ondigitalocean.app/IMG_3952.png%7C${lat},${long}&key=${process.env.mapkey}`;
    console.log(url)
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        res.send({ image: `data:${response.headers['content-type']};base64,${base64}` });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred while fetching the image.' });
    }
});

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
