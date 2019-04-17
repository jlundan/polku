import {ApplicationContext, RouterRegistry} from "../../core";
import {ExpressRouter} from "../../express";
import { expect } from 'chai';

import * as helmet from "helmet";
import * as bodyParser from "body-parser";
import * as request from 'supertest';
import * as express from "express";
import * as http from "http";
import * as path from "path";

import 'mocha';
import "reflect-metadata";

const TEST_PORT_1 = 4444;
const TEST_PORT_2 = 4445;

describe('test-controller with custom config', () => {
    let server1;
    let server2;
    let applicationContext: ApplicationContext = ApplicationContext.getInstance();
    let routerRegistry: RouterRegistry = RouterRegistry.getInstance();

    before(() => {
        return new Promise((resolve) => {
            const componentScanPaths1 = [
                path.join(__dirname, "..", "fixtures", "services"),
                path.join(__dirname, "..", "fixtures", "controllers")
            ];

            const componentScanPaths2 = [
                path.join(__dirname, "..", "fixtures", "controllers-2")
            ];

            const app1 =  express();
            const router1 = express.Router();

            const app2 =  express();
            const router2 = express.Router();

            app1.use(helmet());
            app1.use(bodyParser.json());
            app1.use(router1);

            app2.use(helmet());
            app2.use(bodyParser.json());
            app2.use(router2);

            routerRegistry.registerRouter("router-1", new ExpressRouter(router1), true);
            routerRegistry.registerRouter("router-2", new ExpressRouter(router2));

            applicationContext.scan(componentScanPaths1);
            routerRegistry.activateRouter("router-2");
            applicationContext.scan(componentScanPaths2);

            server1 = http.createServer(app1);
            server2 = http.createServer(app2);

            server1.listen(TEST_PORT_1, () => {
                server2.listen(TEST_PORT_2, () => {
                    resolve();
                });
            });
        });
    });

    it('should respond with test message on first controller', async () => {
        const result = await request(`http://localhost:${TEST_PORT_1}`).get('/test');
        expect(result.statusCode).to.eq(200);
        expect(result.text).to.eq('{"message":"test-controller-1"}');
    });

    it('should respond with test message on second controller', async () => {
        const result = await request(`http://localhost:${TEST_PORT_2}`).get('/test');
        expect(result.statusCode).to.eq(200);
        expect(result.text).to.eq('{"message":"test-controller-2"}');
    });

    after(() => {
        routerRegistry.clear();
        applicationContext.clear();
        server1.close();
        server2.close();
    })
});
