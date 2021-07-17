## how to

status
-------------
- The app is running in a singleton mode - so kill the process if you want to experiment it with different inputs.

```sh
Endpoints:
-  /<pkg-name>/<pkg-version> - generate a new dependency graph
-  /default - triggering a sample job for the npm module: express/4.17.1
-  /cache - show status of cache(store)
-  /status - show the current dependency graph
```

## refs:
- speed: for loop+await - VS - promise.all: https://stackoverflow.com/questions/45285129/any-difference-between-await-promise-all-and-multiple-await
- semver convertions (when fetching a semantic version fails): https://github.com/npm/node-semver

todos:
-------
- add github actions as CI
- live update using websocket
- decouple api and compute workers  
- scaling: deploy to kubernetes
- distribute jobs among workers
- central monitoring

extended features (not yet implemented)
-----
- start/stop/pause process
