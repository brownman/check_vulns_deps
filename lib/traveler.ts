const semver = require('semver')

let obj_repository: any = {};


const config = require(`../config/config.json`);

const nodeFetch = require('node-fetch');
type DependencyNext = {
    name: string;
    version: string;
    dependencies: Promise<DependencyNext> | {}
}

const repositoryFetch = {
    get: async (name, version): Promise<Response> => {
        const key = Utils.get_concatenated_key(name, version);
        if (process.env?.NODE_ENV === 'testing') {
            return obj_repository[key];
        }
        else {
            //   return config.url;
            const pkgName = name;
            const pkgVersionOrTag = version;
            const nextUrl = `${config.url}/${pkgName}/${pkgVersionOrTag}`;
            console.log('______________________', { nextUrl });
            const res = await nodeFetch(nextUrl).catch((err) => { console.error(err); throw err; });
            return res.json();
        }
    }
}


//cache package.json data
//life-cicle: persistant db 
export const cacheStore = {
    //key comprised of name and version
    data: obj_repository,
    get(name, version) {
        const key = Utils.get_concatenated_key(name, version);
        return cacheStore.data[key]
    },
    set(t_name, t_version, t_content) {
        const key = Utils.get_concatenated_key(t_name, t_version);
        if (t_content) {
            const { name, version, dependencies } = t_content;
            cacheStore.data[key] = { name, version, dependencies };
        } else {
            cacheStore.data[key] = 'invalid request';
        }
    },
    get_all() {
        return cacheStore.data;
    }
}

//life cycle: per instance
class CacheVisit {
    private data;
    private counter;
    //key comprised of name and version
    constructor() {
        this.data = {};
        this.counter = 0;
    }

    get(name, version): boolean {
        const key = Utils.get_concatenated_key(name, version);

        return this.data[key];
    };
    set(name: string, version: string): void {
        const key = Utils.get_concatenated_key(name, version);

        //use dictionary with minimal data just to sign a graph node should not be process
        this.data[key] = this.counter++;
    };
    get_all() {
        return { data: this.data, counter: this.counter };
    }

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
    private package_json_aggregated_instance: any = {};

    constructor(storage: Object | null = null) {
        obj_repository = storage;
        //single instance per a travel
        this.cacheVisit = new CacheVisit();
    }
    get_cache_visit_instance() {
        return this.cacheVisit;
    }
    get_cache_visit() {
        return { visits: this.cacheVisit.get_all(), pkg_content: cacheStore.get_all() };
    }

    get_status(): Promise<DependencyNext | string> {
        return this.package_json_aggregated_instance.ptr;
    }

    init_get_package_json_with_deps(name: string, version: string, level: number = config.default_max_level): any {
        let was_running = true;
        console.log({ package_json_aggregated_instance: this.package_json_aggregated_instance })
        if (!this.package_json_aggregated_instance.hasOwnProperty('ptr')) {
            this.package_json_aggregated_instance.ptr = this.next_get_package_json_with_deps(name, version, level).catch(e => {
                this.package_json_aggregated_instance.ptr = e.message;
                console.log(e.message);
            })
            was_running = false;
        }
        return { was_running };
    }

    async next_get_package_json_with_deps(name: string, version: string, level: number): Promise<DependencyNext | string> {

        let package_json;
        let package_json_aggregated: DependencyNext = {} as DependencyNext;

        //STOP ANOTHER RECURSION BASED ON THE LIMIT LEVEL
        if (level == 0) {
            return "reach level:" + config.default_max_level;
        }

        //EXPAND CURRENT DEPENDENCY IF NOT ALREADY EXISTS 
        if (!this.cacheVisit.get(name, version)) {
            //lock access for getting the following package another time.
            this.cacheVisit.set(name, version);

            package_json = await this.get_package_json(name, version)
                .catch((err) => {
                    console.log(err.message);
                    // throw err;
                    return err.message as Promise<string>;
                });
        }
        else { return "visited"; }


        package_json_aggregated.name = package_json.name;
        package_json_aggregated.version = package_json.version;
        //next we will need to create a dependency key for every item under the package.json>dependencies object
        package_json_aggregated.dependencies = {};

        //for each dependency of fetched package.json set equivalent dependency key (with a key name based on (pkg name+ pkg version) ) on the aggregated.dependencies object
        if (Utils.isObjectWithData(package_json.dependencies)) {

            for (let [nameIt, versionIt] of Object.entries(package_json.dependencies) as any) {
                // versionIt = semver.coerce(versionIt)
                const key = Utils.get_concatenated_key(nameIt, versionIt);
                const ref_new_item_on_deps_obj = package_json_aggregated.dependencies;
                try {
                    ref_new_item_on_deps_obj[key] = await this.next_get_package_json_with_deps(nameIt, versionIt, level--);
                } catch (err) {
                    console.log(err);
                    ref_new_item_on_deps_obj[key] = err.message;

                    throw err;
                }
                //first time travel on this tree to this unique package.json (based on name and version)
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
        let error_msg;
        //get from cache if exists
        let response_data = cacheStore.get(name, version);
        //fetch and store new data
        if (Utils.isObject(response_data)) {
            console.log('using cache instead of fetching new data for name,version: ' + name + '|' + version);
            // console.log({ response_data })
        } else {
            console.log('fetch new item');
            //Make a request (simulated)
            try {
                response_data = await repositoryFetch.get(name, version);
                console.log('fetched: ' + response_data.name);
            } catch (e) {
                console.error('error fetching' + e.message);
                // throw e;
                error_msg = e.message;
            }
            if (response_data) {
                cacheStore.set(name, version, response_data);
                this.cacheVisit.set(name, version);
            } else {
                //save the error instead the fetched content
                response_data = { error_msg }
                cacheStore.set(name, version, error_msg);
                this.cacheVisit.set(name, version);//cacheVisit is not an indicator for content integrity but only for a visit.
            }

        }
        //return new data
        return response_data;
    }
}
