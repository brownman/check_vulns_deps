const express = require("express");
const app = express();
const config = require(`../config/config.json`);

import { go_travel } from "../lib/traveler"

const port = 8080; // default port to listen

// define a route handler for the default home page
app.get("/", async (req, res) => {

    console.log(req.query)

    const name = req.query.name;
    const version = req.query.version;

    const query = {
        name, version
    }

    const result = await go_travel(name, version).catch((e) => { console.log(e.message) })
    res.json({ query, result });

});

// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});