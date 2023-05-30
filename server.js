const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const axios = require('axios');
const cors = require('cors');

let stashedPrices = null;

app.use(cors({
    origin: '*'
}));

app.use(express.static('public'));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/prices', (req, res) => {
    getPrices().then((prices) => {
        res.send(prices);
    });
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});


async function getPrices() {
    if (stashedPrices) {
        return stashedPrices;
    };
    const prices = await axios.get('https://api.porssisahko.net/v1/latest-prices.json');
    stashedPrices = prices.data;
    console.log("Stashed prices");
    return prices.data;
};