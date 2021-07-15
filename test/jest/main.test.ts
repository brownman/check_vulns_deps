
const data = {};
const config = {concatSymbol: "/"} 
//start with: "A": "1"
data[`A${config.concatSymbol}1`] = {
    "dependencies": {
        "B": "1"
    }
};
data[`B${config.concatSymbol}1`] = {
    "dependencies": {
        "C": "1"
    }
};
data[`C${config.concatSymbol}1`] = {
    "dependencies": {
        "D": "1"
    }
};
data[`D${config.concatSymbol}1`] = {
    "dependencies": {}
};
function get_package_json(name, version) {
    let key = `${name}_${version}`;
    if (!data.hasOwnProperty(key)) {
        return null;
    }
    return data[key];
}
function get_deps_parent() {
    let storeVisited = {}; //new Map();
    const get_concatenated_key = function (name, version) { return name + '' + config.concatSymbol + '' + version; };
    return function get_deps(name, version, current_node) {
        //set current node: pkg-name  pkg-version, replace dependencies with next recursive call
        //if same node already been fetched - tag the value as visited
        // let t_name, t_version;
        current_node.name = name;
        current_node.version = version;
        const concatenated_key = get_concatenated_key(name, version);
        if (concatenated_key) {
            storeVisited[concatenated_key] = true;
        }
        const pkgJson = get_package_json(name, version);
        console.log({ name, version pkgJson });
        const pkgDependencies = pkgJson.dependencies?  pkgJson.dependencies : null;

        current_node.dependencies = {};

        if (Object.entries(pkgDependencies).length > 0) {
            console.log(`pkgDependencies:: ${JSON.stringify(pkgDependencies)}`);
            for (const [name, version] of Object.entries(pkgDependencies)) {
                console.log(name, version);
                const concatenated_key = get_concatenated_key(name, version);

                if (storeVisited[concatenated_key]) {
                    current_node.dependencies[name] = 'visited';
                }
                else {
                    console.log({ name });
                    current_node.dependencies[name] = get_deps(name, pkgDependencies[name], current_node);
                }
            }

        }
        else {
            current_node.dependencies = {};
        }
        console.log({ current_node });
        return current_node;
        // aggregatedResult[pkgJson.name] = {{ name }, { version }, {dependencies}};
    };
}
// return get_deps()
// {name, version , dependenciesget_deps};
const expected_data = {
    "version": "A",
    "name": "1",
    "dependencies": {
        "B": {
            "name": "B",
            "version": "1",
            "dependencies": {
                "C": {
                    "name": "C",
                    "value": "1",
                    "dependencies": {
                        "A": "visited"
                    }
                }
            }
        }
    }
};
describe('extract deps from package.json', () => {
    it('should return a joined object of the dependencies+devDependencies', () => {
        expect(get_deps_parent()("A", "1", {})).toBe('expected_data');
    });
});

