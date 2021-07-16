https://registry.npmjs.org/octokit/latest

   requestIt(url) {
        const url = config.url;

        return nodeFetch(url).then(function (u) {
            return u.json().then(function (val) {
                console.log(val);
            });
        }).catch(function (err) {
            // handle error here
        });
    }