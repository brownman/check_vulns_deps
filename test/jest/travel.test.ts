'use strict'

import { Traveler, cacheStore } from '../../lib/traveler';

let obj_repository;
let obj_repository_expected;


let traveler: Traveler;


describe('check caching', () => {
    beforeEach(() => {
        obj_repository = require(`${__dirname}/fixtures/simple/repository.json`);
        traveler = new Traveler(obj_repository);
    })

    it('persistant caching', () => {
        const name = "A";
        const version = "3";
        const data = { "dependencies": { "A": 1 }, "name": "name1", "version": "version2" }

        cacheStore.set(name, version, data);

        const res = cacheStore.get(name, version,);
        expect(res).toEqual(data)
    });

    it('cache per travel instance', () => {
        const name = "octokit";
        const version = "1.1.2";
        const expected = { "octokit: 1.1.2": true };

        const cacheVisit = traveler.get_cache_visit_instance();
        cacheVisit.set(name, version);
        const res = cacheVisit.get_all();
        expect(res).toEqual(expected);
    });
})



describe('get package.json', () => {
    beforeEach(() => {
        obj_repository = require(`${__dirname}/fixtures/simple/repository.json`);
        obj_repository_expected = require(`${__dirname}/fixtures/simple/repository.expected.json`);

        traveler = new Traveler(obj_repository);
    })




    it('get without deps', async (done) => {
        const res_A_1 = obj_repository['A: 1'];
        const res = await traveler.get_package_json("A", "1");
        expect(res).toEqual(res_A_1);
        done();
    });

    it('get with deps', async (done) => {
        const res = await traveler.get_package_json_with_deps("A", "1");
        expect(res).toEqual(obj_repository_expected);
        done();
    });


});

describe.skip('get package.json', () => {
    beforeAll(() => {
        obj_repository = require(`${__dirname}/fixtures/real/res.json`);
        obj_repository_expected = require(`${__dirname}/fixtures/real/res.expected.json`);
    });

    beforeEach(() => {
        traveler = new Traveler(obj_repository);
    })




    it('get without deps', async (done) => {
        const xx = obj_repository['octokit: 1.1.0'];
        const res = await traveler.get_package_json("octokit", "1.1.0");
        expect(res).toEqual(xx);
        done();
    });

    it('get with deps', async (done) => {
        const res = await traveler.get_package_json_with_deps("octokit", "1.1.0")
        expect(res).toEqual(obj_repository_expected);
        done();
    });


});

