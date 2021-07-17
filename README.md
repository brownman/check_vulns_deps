## how to

- Note: the app is running in singleton mode - so kill the process if you want to experiment it with different inputs.

- options:de

---

```sh
Endpoints:
-  /<pkg-name>/<pkg-version> - generate a new dependency graph
-  /default - triggering a sample job for the npm module: express/4.17.1
-  /cache - show status of cache(store)
-  /status - show the current dependency graph
```

# qa - farther investigations:

- speed: for loop+await - VS - promise.all

## refs:

- https://github.com/npm/node-semver

todos:
-------
- add github actions as CI
- live update using websocket
- decouple api and compute workers  
- scaling: deploy to kubernetes
- distribute jobs among workers
- central monitoring
