export const extractNameAndVersionOrTag = (deps: Object): Array<Array<string>>  => {
    return Object.entries(deps); //.map(value){return value;}
}
export const parsePackageJsonInfoOutput = (rawString): any => {
    const res = {
        ...JSON.parse(rawString)["dependencies"], ...JSON.parse(rawString)["devDependencies"]
    };
    return res;

}
// export const extractNameAndVersionOrTag = (str):string[] => {
//     let name, version;
//     const result = [name, version] = str.split('@');
//     return result;
// }