import * as fs from 'fs';
const config = require(`${__dirname}/fixtures/config.json`);

import { parsePackageJsonInfoOutput, extractNameAndVersionOrTag } from '../../lib/parsers/packageJsonParser';
// import { parseYarnInfoOutput } from '../../lib_old/cli-parsers/yarn-info-parser'; //parseYarnInfoOutput


// https://registry.npmjs.org/<package_name>/<version_or_tag>

// /<package_name>/<version_or_tag>

// describe('', () => {
//   it('should return a the name and version/tag of the devdependencies/dependencies\' record', () => {
//     extractNameAndVersionOrTag()

//     //parsePackageJsonInfoOutput
//     const result = parseYarnInfoOutput(packageJsonInfoOutput);
//     expect(result).toBe(1);
//   });
// });


describe('extract deps from package.json', () => {
  it('should return a joined object of the dependencies+devDependencies', () => {

    const packageJsonInfoOutput = fs.readFileSync(
      `${__dirname}/fixtures/package.json`,
      'utf8',
    );

    const packageJsonInfoOutputExtractDeps =  fs.readFileSync(
      `${__dirname}/fixtures/package.expect.dependencies.json`,
      'utf8',
    );

    //parsePackageJsonInfoOutput
    const extractedDeps = parsePackageJsonInfoOutput(packageJsonInfoOutput);
    expect(extractedDeps).toEqual(packageJsonInfoOutputExtractDeps);

    expect(extractNameAndVersionOrTag(extractedDeps)).toBe(666);
  });
});
