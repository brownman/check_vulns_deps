const express = require("express");
const app = express();
const config = require(`../config/config.json`);

import { Traveler } from "../lib/traveler"

const port = 8080; // default port to listen

// define a route handler for the default home page
app.get("/", async (req, res) => {
    // return  res.send(process.env?.NODE_ENV);

    console.log('__', req.query)

    const name = req.query.name || 'octokit';
    const version = req.query.version || 'latest';

    const query = {
        name, version
    };

    const travel = new Traveler();
    const result = await travel.get_package_json_with_deps(name, version)
        .catch((e) => { console.log(e.message) })

    res.json({ query, result });

});

// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});