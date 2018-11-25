import 'mocha';
import "reflect-metadata";
import * as request from 'supertest';
import * as express from "express";
import * as http from "http";

import { expect } from 'chai';
import * as path from "path";

import {Application, RouterRegistry} from "../../src";
import {ExpressRouter} from "../../src/express/polku-express";

const TEST_PORT = 4444;

describe('test-controller', () => {
    let server;

    before(() => {
        return new Promise((resolve) => {
            const componentScanPaths = [
                path.join(__dirname, "..", "fixtures", "services"),
                path.join(__dirname, "..", "fixtures", "controllers")
            ];

            new Application({componentScan: componentScanPaths})
                .withRouting(new ExpressRouter({
                    beforeRouterSetup: (app: express.Application)=>{
                    },
                    afterRouterSetup: (app: express.Application) => {
                        server = http.createServer(app);
                        server.listen(TEST_PORT, () => {
                            resolve();
                        });
                    }
                }))
                .start();
        });
    });

    it('should say hello', async () => {
        const result = await request('http://localhost:4444').get('/hello/cnorris');
        expect(result.statusCode).to.eq(200);
        expect(result.text).to.eq('{"message":"Hello, cnorris! And the sub-service says: foo"}');
    });

    after(() => {
        RouterRegistry.getInstance().clear();
        server.close();
    })
});
