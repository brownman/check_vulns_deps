
let obj_repository: any = {};


const config = require(`../config/config.json`);

const nodeFetch = require('node-fetch');
type DependencyNext = {
    name: string;
    version: string;
    dependencies: Promise<DependencyNext>;
}

const repositoryFetch = {
    get: (name, version): Promise<Response> => {
        const key = Utils.get_concatenated_key(name, version);
        if (process.env?.NODE_ENV === 'testing') {
            return obj_repository[key];
        }
        else {
            //   return config.url;
            const pkgName = name;
            const pkgVersionOrTag = version;
            return nodeFetch(`${config.url}/${pkgName}/${pkgVersionOrTag}`)
                .then((data) => { return data.json(); })
                .catch((err) => { return err; });
        }
    }
}


//cache package.json data
//life-cicle: persistant db 
export const cacheStore = {
    //key comprised of name and version
    data: obj_repository,
    get: (name, version) => {
        const key = Utils.get_concatenated_key(name, version);

        return cacheStore.data[key]
    },
    set: (name, version, content) => {
        const key = Utils.get_concatenated_key(name, version);

        cacheStore.data[key] = content;
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
        const key = Utils.get_concatenated_key(name, version);

        return this.data[key];
    };
    set(name: string, version: string): void {
        const key = Utils.get_concatenated_key(name, version);

        //use dictionary with minimal data just to sign a graph node should not be process
        this.data[key] = true;
    };

}



const Utils = {
    get_concatenated_key: (name, version) => { return name + '' + config.concatSymbol + '' + version; },
    isObject: (obj) => {
        return typeof obj === 'object';
    },
    isObjectEmpty: (obj: Object): boolean => {
        // if (!obj) { throw new Error('not an object:'+ obj) }
        return (Utils.isObject(obj) && Object.keys(obj).length === 0);
    },
    isObjectWithData: (obj: Object): boolean => {
        // if (!obj) { throw new Error('not an object:'+ obj) }
        return (Utils.isObject(obj) && Object.keys(obj).length !== 0);
    }
}





export class Traveler {

    // private obj_repository: Object;

    private cacheVisit: CacheVisit;

    constructor(storage: Object | null = null) {
        obj_repository = storage;

        //single instance per a travel
        this.cacheVisit = new CacheVisit();
    }



    async get_package_json_with_deps(name: string, version: string): Promise<DependencyNext> {
        let package_json;
        console.log({ name, version });
        if (!this.cacheVisit.get(name, version)) {
            package_json = await this.get_package_json(name, version)
                .catch((err) => {
                    throw err;
                });
            this.cacheVisit.set(name, version);
        }
        // else { return "visited"; }

        let package_json_aggregated: DependencyNext = {} as DependencyNext;
        package_json_aggregated.name = package_json.name;
        package_json_aggregated.version = package_json.version;

        //for each dependency of fetched package.json set equivalent dependency key (with a key name based on (pkg name+ pkg version) ) on the aggregated.dependencies object
        if (Utils.isObjectWithData(package_json.dependencies)) {

            for (const [nameIt, versionIt] of Object.entries(package_json.dependencies) as any) {
                const key = Utils.get_concatenated_key(nameIt, versionIt);
                const ref_new_item_on_deps_obj = package_json_aggregated.dependencies;

                //first time travel on this tree to this unique package.json (based on name and version)
                ref_new_item_on_deps_obj[key] = this.get_package_json_with_deps(nameIt, versionIt);
            }
        } else if (Utils.isObject(package_json.dependencies)) {
            console.warn('setting dependencies with an empty object');
            package_json_aggregated.dependencies = {} as Promise<DependencyNext>;
        }
        return await package_json_aggregated;
    }

    //input: name and version
    //output: package.json content (includes: dependencies),   cache the results.
    async get_package_json(name, version): Promise<any> {
        // return await repositoryFetch.get(name, version);;
        // return await repositoryFetch.get(name, version);;
        //get from cache if exists
        let response_data = cacheStore.get(name, version);
        //fetch and store new data
        if (Utils.isObject(response_data)) {
            console.log('using cache instead of fetching new data for name,version: ' + name + '|' + version);
            console.log({ response_data })
        } else {
            console.log('fetch new item');
            //Make a request (simulated)
            response_data = await repositoryFetch.get(name, version);
            cacheStore.set(name, version, response_data);
        }
        //return new data
        return response_data;
    }
}
