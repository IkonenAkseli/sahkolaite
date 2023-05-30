const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const axios = require('axios');
const cors = require('cors');

let stashedPrices = null;
let stashedPricesTimestamp = null;

const now = new Date();
now.setHours(now.getHours() + 12);
console.log(now);

app.use(cors({
    origin: '*'
}));

app.use(express.static('public'));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/api/prices', (req, res) => {
    getPrices().catch((e) =>{
        res.status(500).send(e);
    }).then((prices) => {
        res.send(prices);
    });
});


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});


async function getPrices() {
    if (stashedPrices) {
        const now = new Date();
        now.setHours(now.getHours() + 12);
        if (stashedPricesTimestamp < now) {
            console.log("Returning stashed prices");
            return stashedPrices;
        }

    };
    const prices = await axios.get('https://api.porssisahko.net/v1/latest-prices.json');
    stashedPrices = prices.data;
    stashedPricesTimestamp = new Date();
    console.log("Stashed prices");
    return prices.data;
};