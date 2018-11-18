import { expect } from 'chai';
import 'mocha';
import {ApplicationContext, RouterRegistry} from "../../src";
import * as path from "path";
import {DummyRouter} from "../fixtures/router-integrations/dummy-router";

describe('application-context', () => {
    let applicationContext;

    before(() => {
        RouterRegistry.getInstance().registerRouter(new DummyRouter());
        applicationContext = ApplicationContext.getInstance();
        applicationContext.initializeWithDirectoryScan(path.join(__dirname, "..", "fixtures"));
    });

    it('should return one controller', () => {
        const components = ["TestController", "TestService", "Subservice"];
        expect(applicationContext.getComponents(components).length).to.eq(3);
    });
});
