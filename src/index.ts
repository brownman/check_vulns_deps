const express = require("express");
const app = express();
const config = require(`../config/config.json`);

import { Traveler } from "../lib/traveler"

const port = 8080; // default port to listen
let travel: Traveler;

app.get("/cache", async (req, res) => {
    if (travel) {
        const result = await travel.get_cache_visit();
        res.json({ result });
    } else {
        res.send('no job is running');

    }
});


// define a route handler for the default home page
app.get("/", async (req, res) => {

    console.log('__', req.query)

    const name = req.query.name;
    const version = req.query.version;

    const query = {
        name, version
    };

    if (!travel) { travel = new Traveler();/*use as singleton*/ }

    const result = await travel.get_package_json_with_deps(name, version)
        .catch((e) => { console.log(e.message) })

    res.json({ query, result });
});
// define a route handler for the default home page
app.get("/default", async (req, res) => {

    console.log('__', req.query)

    const name = req.query.name || 'express';
    const version = req.query.version || '4.17.1';

    const query = {
        name, version
    };

    if (!travel) { travel = new Traveler();/*use as singleton*/ }

    const result = await travel.get_package_json_with_deps(name, version)
        .catch((e) => { console.log(e.message) })

    res.json({ query, result });
});

// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});