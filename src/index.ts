const express = require("express");
const app = express();
const config = require(`../config/config.json`);

import { Traveler } from "../lib/traveler"

const port = 8080; // default port to listen
let traveler: Traveler;

app.get("/cache", async (req, res) => {
    if (traveler) {
        const result = await traveler.get_cache_visit();
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
    if (!name || !version) {
        res.send('please supply name and version in the form: host:port/?name=express&version=4.17.1');
        return;
    }
    if (!traveler) { traveler = new Traveler();/*use as singleton*/ }

    const result = await traveler.init_get_package_json_with_deps(name, version)

    res.json({ query, result });
});

app.get("/status", async (req, res) => {
    if (!traveler) {
        return res.send('no job is running, start it by visiting endpoints: / or /default');
    }
    const result = await traveler.get_status();
    res.json(result);
});


// define a route handler for the default home page
app.get("/default", async (req, res) => {

    console.log('__', req.query)

    const name = req.query.name || 'express';
    const version = req.query.version || '4.17.1';

    const query = {
        name, version
    };

    if (!traveler) { traveler = new Traveler();/*use as singleton*/ }

    const res_was_running = traveler.init_get_package_json_with_deps(name, version)

    res.json({ query, res_was_running });
});

// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});