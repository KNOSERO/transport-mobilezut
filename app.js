const express = require('express');
const PORT = process.env.PORT || 3000;
const app = express();
const dateFormat = require("dateformat");

const Scraping = require('./script/scraping');
const RestClient = require('./script/restClient');

app.get('/:name', async (req, res, next) => {

    const date = new Date(req.query.date)

    const localization = (lat, lng) => {
        return `${lat}:${lng}`;
    }
 
    const restAPI = new RestClient();
    restAPI.findLocation(req.params.name)
        .then(async result => {

            const scraping = new Scraping();
            scraping.setRoutes(
                'szczecin',
                localization(result.where.lat, result.where.lng),
                localization(req.query.lat, req.query.lng),
                dateFormat(date, 'dd.mm.yyyy'),
                dateFormat(date, 'HH:MM'))
                .findHtml()
                .then(async () => {
                    const temp = scraping.returnRoutes();
                    res.status(200)
                    .json(temp);
                })
                .catch(() => {
                    res.status(201).json(null);
                });
        })
        .catch(() => {
            res.status(201).json(null);
        });
});

app.listen(PORT, () => {});