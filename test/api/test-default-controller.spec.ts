import 'mocha';
import "reflect-metadata";
import * as bodyParser from "body-parser";
import * as request from 'supertest';
import * as express from "express";
import * as http from "http";

import { expect } from 'chai';
import * as path from "path";

import {RouterRegistry} from "../../src";
import {DefaultExpressApplication, ExpressRouter} from "../../src/express/polku-express";

const TEST_PORT = 4444;

describe('test-controller with default config', () => {
    let server;

    before(async () => {
        const componentScanPaths = [
            path.join(__dirname, "..", "fixtures", "services"),
            path.join(__dirname, "..", "fixtures", "controllers")
        ];
        server = await new DefaultExpressApplication(componentScanPaths).start(TEST_PORT);


        // return new Promise((resolve) => {
        //     const componentScanPaths = [
        //         path.join(__dirname, "..", "fixtures", "services"),
        //         path.join(__dirname, "..", "fixtures", "controllers")
        //     ];
        //
        //     const opts = {componentScan: componentScanPaths};
        //
        //     // new Application(opts).start().then((_server) => {
        //     //     server = _server;
        //     //     resolve();
        //     // });
        // });
    });

    it('should say hello', async () => {
        const result = await request(`http://localhost:${TEST_PORT}`).get('/echo/cnorris');
        expect(result.statusCode).to.eq(200);
        expect(result.text).to.eq('{"response":{"heading":"test","message":{"text":"cnorris"}}}');
    });

    it('fails with status code', async () => {
        const result = await request(`http://localhost:${TEST_PORT}`).get('/fail/with/400');
        expect(result.statusCode).to.eq(400);
        expect(JSON.parse(result.text)).to.eq('Request failed');
    });

    it('handles post correctly', async () => {
        const result = await request(`http://localhost:${TEST_PORT}`).post('/api/messages').send({message: 'test message'});
        expect(result.statusCode).to.eq(200);
        const res = JSON.parse(result.text);
        expect(res.id).not.to.be.empty;
        expect(res.message).not.to.be.empty;
    });

    after(() => {
        RouterRegistry.getInstance().clear();
        server.close();
    })
});
