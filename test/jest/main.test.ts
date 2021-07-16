import { Traveler, cacheStore } from '../../lib/traveler'
// const config = require(`${__dirname}/../.../config.json`);

const obj_repository = require(`${__dirname}/fixtures/repository.json`);
const obj_repository_expected = require(`${__dirname}/fixtures/repository.expected.json`);

let traveler: Traveler;

describe('get package.json', () => {
    beforeEach(() => {
        traveler = new Traveler(obj_repository);
    })
    it('cache get & set', () => {
        const name = "A";
        const version = "3";
        const data = { k: 1 }

        cacheStore.set(name, version, data);

        const res = cacheStore.get(name, version,);
        expect(res).toBe(data)
    });

    it('get without deps', (done) => {
        const res_A_1 = obj_repository['A/1'];
        traveler.get_package_json("A", "1")
        .then((data) => {
            expect(data).toEqual(res_A_1);
            done();
        })
        // .catch((err) => {
        //     expect(err.message).toEqual(null);
        //     done();
        // });
        // ;


    });

    it('get with deps', async () => {
        traveler.get_package_json_with_deps("A", "1").then((data) => {
            expect(data).toEqual(obj_repository_expected);
        });
    });

  
});

