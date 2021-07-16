const express = require( "express" );
const app = express();
const config = require(`${__dirname}/../.../config.json`);

// import {traveler} from './traveler';

const port = 8080; // default port to listen

// define a route handler for the default home page
app.get( "/repository", ( req, res ) => {
    // const name = req.params.name;
    // const version = req.params.version;

    res.send( "Hello world!" );
} );

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );