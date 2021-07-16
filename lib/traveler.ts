

const obj_repository = require(`${__dirname}/../test/jest/fixtures/repository.json`);

const config = require(`../config/config.json`);

const get_concatenated_key = function (name, version) { return name + '' + config.concatSymbol + '' + version; };

const nodeFetch = require('node-fetch');


const repositoryFetch = {
    get: (name, version): Promise<Response> => {
        const key = get_concatenated_key(name, version);
        if (process.env?.NODE_ENV === 'xx') { return obj_repository[key] ; }
        else {
            console.log(config.url)
            throw new Error(config.url);
            return nodeFetch(config.url).
                then((data) => { return data.body }).
                catch((err) => { return err; });
        }
    }
}


//cache package.json data
//life-cicle: persistant db 
const cacheStore = {
    //key comprised of name and version
    data: obj_repository,
    get: (name, version) => {
        const key = get_concatenated_key(name, version);

        return cacheStore.data[key]
    },
    set: (name, version, value) => {
        const key = get_concatenated_key(name, version);

        cacheStore.data[key] = value;
    }
}

//life cycle: per instance
class CacheVisit {
    private data;
    //key comprised of name and version
    constructor() {
        this.data = {};
    }

    get(name, version): boolean {
        const key = get_concatenated_key(name, version);

        return this.data[key];
    };
    set(name: string, version: string): void {
        const key = get_concatenated_key(name, version);

        //use dictionary with minimal data just to sign a graph node should not be process
        this.data[key] = true;
    };

}



const Utils = {
    isEmpty: (obj: Object): boolean => {
        if (!obj) { throw new Error('not an object:'+ obj) }
        return (Object.keys(obj).length === 0);
    }
}

//input: name and version
//output: package.json content (includes: dependencies)
async function get_package_json(name, version) {

    //get from cache if exists
    let response_data = cacheStore.get(name, version);

    //fetch and store new data
    if (Utils.isEmpty(response_data)) {

        //Make a request (simulated)
        response_data = await repositoryFetch.get(name, version);
        cacheStore.set(name, version, response_data);
    }
    //return new data
    return response_data;
}

async function get_package_json_with_deps(name: string, version: string, cacheVisit: CacheVisit) {
    let package_json;

    if (!cacheVisit) throw new Error('invalid cacheVisit')
    if (!cacheVisit.get(name, version)) { package_json = await get_package_json(name, version); cacheVisit.set(name, version); }

    let package_json_aggregated = {
        name: package_json.name, version: package_json.version, dependencies: {}
    }
    let dependencies_override = {};

    //for each dependency of fetched package.json set equivalent dependency key (with a key name based on (pkg name+ pkg version) ) on the aggregated.dependencies object
    if (!Utils.isEmpty(package_json.dependencies)) {

        for (const [nameIt, versionIt] of Object.entries(package_json.dependencies) as any) {
            const res_cache_visit = cacheVisit.get(nameIt, versionIt);
            const key = get_concatenated_key(nameIt, versionIt);
            const ref = package_json_aggregated.dependencies;

            if (!res_cache_visit) {
                //first time travel on this tree to this unique package.json (based on name and version)
                ref[key] = await get_package_json_with_deps(nameIt, versionIt, cacheVisit);

            } else { //sign visit in order to lock any more 
                cacheVisit.set(nameIt, versionIt);
                ref[key] = "visited";
            }

        }
    }
    return package_json_aggregated;
}

export  function go_travel(name, value) {
    const cacheVisit = new CacheVisit();
    return get_package_json_with_deps(name, value, cacheVisit);
}