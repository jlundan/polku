import 'mocha';
import "reflect-metadata";
import * as path from "path";
import { expect } from 'chai';
import {ApplicationContext, RouterRegistry} from "../../src";

describe('application-context', () => {
    let applicationContext;

    before(() => {
        applicationContext = ApplicationContext.getInstance();
        applicationContext.initializeWithDirectoryScan([
            path.join(__dirname, "..", "fixtures", "services"),
            path.join(__dirname, "..", "fixtures", "controllers")
        ]);
    });

    it('should return one controller- and two service component definitions', () => {
        const componentNames = ["TestController", "TestService", "SubService"];
        const componentDefinitions = applicationContext.getComponentDefinitions(componentNames);

        expect(componentDefinitions.length).to.eq(3);

        expect(Reflect.getMetadata('Symbol(ComponentType)', componentDefinitions[0].componentSource)).to.eq("Controller");
        expect(Reflect.getMetadata('Symbol(ComponentType)', componentDefinitions[1].componentSource)).to.eq("Service");
        expect(Reflect.getMetadata('Symbol(ComponentType)', componentDefinitions[2].componentSource)).to.eq("Service");

        expect(componentDefinitions[0].instance).not.to.be.null;
        expect(componentDefinitions[1].instance).not.to.be.null;
        expect(componentDefinitions[2].instance).not.to.be.null;
    });

    it('should return three components which are not null', () => {
        const componentNames = ["TestController", "TestService", "SubService"];
        const components = applicationContext.getComponents(componentNames);

        expect(components.length).to.eq(3);

        expect(components[0]).not.to.be.null;
        expect(components[1]).not.to.be.null;
        expect(components[2]).not.to.be.null;
    });

    it('should return SubService', () => {
        const componentNames = ["SubService"];
        const components = applicationContext.getComponents(componentNames);
        expect(components[0]).have.property("foo");
        expect((typeof components[0].foo)).to.eq("function");
        expect(components[0].foo()).eq("foo");
    });


    it('should return TestService', () => {
        const componentNames = ["TestService"];
        const components = applicationContext.getComponents(componentNames);
        expect(components[0]).have.property("sayHello");
        expect((typeof components[0].sayHello)).to.eq("function");
        expect(components[0]).have.property("_subService");
        expect(components[0]._subService).not.to.be.null;
        expect(components[0].sayHello("cnorris")).eq(`Hello, cnorris! And the sub-service says: foo`);
    });

    it('should return TestController', () => {
        const componentNames = ["TestController"];
        const components = applicationContext.getComponents(componentNames);
        expect(components[0]).have.property("hello");
        expect((typeof components[0].hello)).to.eq("function");
        expect(components[0]).have.property("_testService");
        expect(components[0]._testService).not.to.be.null;
    });

    it('clears components', () => {
        applicationContext.clear();
        const componentNames = ["TestController", "TestService", "SubService"];
        const components = applicationContext.getComponents(componentNames);

        expect(components.length).to.eq(3);

        expect(components[0]).to.be.null;
        expect(components[1]).to.be.null;
        expect(components[2]).to.be.null;
    });

    it('loads properly with wide component scan', () => {
        applicationContext.initializeWithDirectoryScan([
            path.join(__dirname, "..", "fixtures")
        ]);

        const componentNames = ["TestController", "TestService", "SubService"];
        const components = applicationContext.getComponents(componentNames);

        expect(components.length).to.eq(3);

        expect(components[0]).not.to.be.null;
        expect(components[1]).not.to.be.null;
        expect(components[2]).not.to.be.null;
    });

    after(() => {
        applicationContext.clear();
        RouterRegistry.getInstance().clear();
    })
});
