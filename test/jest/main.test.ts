import {go_travel} from '../../lib/traveler'
// const config = require(`${__dirname}/../.../config.json`);

const obj_repository = require(`${__dirname}/fixtures/repository.json`);
const obj_repositoryInspected = require(`${__dirname}/fixtures/repository.expected.json`);



describe('get package.json', () => {
    // it('get without deps', () => {
    //     //    expect(repository).toBe('');
    //     const expected = { "dependencies": { "B": "1" }, "name": "A", "version": "1" };
    //     expect(get_package_json("A", "1")).toEqual(expected);
    // });

    it('get with deps', () => {
        const expected_data = obj_repositoryInspected;
        const res = go_travel("A", "1", obj_repository);
        // expect(res).toEqual(1);
        expect(expected_data).toEqual(res);


    });

});

