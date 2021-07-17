## Objectives: build a dependencies tree for a given npm module (by supplying a name and version/tag):

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
- live update using websocket
- decouple api and workers  
- start/stop/pause process (app level vs kubernates level)
- distribute jobs among workers
- central monitoring
- add github actions as CI
- deploy to kubernetes
