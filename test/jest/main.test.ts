
//

let data = {};

//start with: "A": "1"
data["A_1"] = {
    "dependencies": {
        "B": "1"
    }
}

data["B_1"] = {
    "dependencies": {
        "B": "1"
    }
}

data["C_1"] = {
    "dependencies": {
        "A": "1"
    }
}
function get_package_json(name, version) {
    let key = `${name}_${version}`
    return data[key];
}
function get_deps(name, version, aggregatedResult) {
    //set current node: pkg-name  pkg-version, replace dependencies with next recursive call
    //if same node already been fetched - tag the value as visited
    aggregatedResult.name = name;
    aggregatedResult.version = version;

    const pkgJson = get_package_json(name, version);
    const dependencies = pkgJson?.dependencies;


    for ({ t_name, t_version } in dependencies) {
        pkgJson.dependencies[t_name] = get_deps(t_name, t_version, aggregatedResult)
    }
    return aggregatedResult;
    // aggregatedResult[pkgJson.name] = {{ name }, { version }, {dependencies}};
}


// return get_deps()
// {name, version , dependenciesget_deps};

const expected_data = {
    "version": "A",
    "name": "1",
    "dependencies": {
        "B": {
            "name": "B"
            "version": "1"
            "dependencies": {
                "C": {
                    "name": "C",
                    "value": "1"
                    "dependencies": {
                        "A": "visited"
                    }
                }
            }
        }
    }
}

describe('extract deps from package.json', () => {
    it('should return a joined object of the dependencies+devDependencies', () => {

        expect(get_deps("A", "1", {})).toBe(expected_data);
    });
});