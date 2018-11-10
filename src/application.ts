import * as path from "path";
import * as fs from "fs";
import * as express from "express";
import * as helmet from "helmet";
import * as bodyParser from "body-parser";
import * as http from "http";

import {RouterRegistry} from "./router-registry";
import {ApplicationContext, ComponentType} from "./application-context";
import {ExpressRouter} from "./express/chori-express";

export interface ApplicationOptions {
    componentScan?: string
}

export class Application {
    private _routerRegistry;
    private readonly _applicationContext: ApplicationContext;

    constructor(private _options?: ApplicationOptions){
        this._routerRegistry = RouterRegistry.getInstance();
        this._applicationContext = ApplicationContext.getInstance();
    }

    public start(port?: number){
        let scannedComponents;
        let router = this._routerRegistry.getRouter();

        if(!router) {
            router = ApplicationHelpers.createDefaultRouter(port);
            this._routerRegistry.registerRouter(router);
        }

        ApplicationHelpers.callRouterHook(router, "beforeComponentScan");
        scannedComponents = this.scanComponents(ApplicationHelpers.resolveScanPath(this._options));
        ApplicationHelpers.callRouterHook(router, "afterComponentScan");

        ApplicationContextHelpers.registerComponents(scannedComponents, this._applicationContext);
    }

    private scanComponents (dir){
        let components = [];
        let files = fs.readdirSync(dir);
        for (let file of files){
            let filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()){
                components = components.concat(this.scanComponents(filePath));
            } else {
                components = components.concat(this.getExportedComponents(filePath));
            }
        }
        return components;
    }

    private getExportedComponents(filePath) {
        if(!filePath.endsWith(".js")) {
            return [];
        }

        let exports;
        try{
            exports = require(filePath);
        } catch (e) {
            return [];
        }

        let scannedExports = [];
        Object.keys(exports).forEach( (objectKey: string) => {
            try {
                switch (Reflect.getMetadata('Symbol(ComponentType)', exports[objectKey])) {
                    case "Controller" : {
                        scannedExports.push(new ExportedComponent(exports[objectKey], ComponentType.CONTROLLER, objectKey));
                        break;
                    }
                    case "Service" : {
                        scannedExports.push(new ExportedComponent(exports[objectKey], ComponentType.SERVICE, objectKey));
                        break;
                    }
                    default: break
                }

            }catch (e) {
                console.log(e);
            }
        });

        return scannedExports;
    }
}

class ExportedComponent {
    constructor(private _componentSource: any, private _componentType: ComponentType, private _exportName: string) {
    }

    get componentSource() {
        return this._componentSource;
    }

    get componentType() {
        return this._componentType;
    }

    get exportName() {
        return this._exportName;
    }
}

class ApplicationHelpers {
    static resolveScanPath (options?: ApplicationOptions){
        if(!options || !options.componentScan) {
            return path.join(__dirname, "..", "..", "src");
        }

        return options.componentScan;
    }

    static createDefaultRouter(port: number){
        return new ExpressRouter({
            beforeRouterSetup: (app: express.Application)=>{
                app.use(helmet());
                app.use(bodyParser.json());
            },
            afterRouterSetup: (app: express.Application) => {
                let server = http.createServer(app);
                server.listen(port || 3000, () => {
                    console.log("Service listening on port: " + port || 3000);
                });
            }
        });
    }

    static callRouterHook(router, hook: string){
        router[hook]();
    }
}

class ApplicationContextHelpers {
    static registerComponents (scannedComponents, applicationContext) {
        let controllers = [];
        for(let scannedComponent of scannedComponents) {
            applicationContext.registerComponent(
                scannedComponent.componentSource,
                Reflect.getMetadata('Symbol(ComponentName)', scannedComponent.componentSource) || scannedComponent.exportName,
                Reflect.getMetadata('Symbol(ComponentScope)', scannedComponent.componentSource),
                scannedComponent.componentType);

            if(scannedComponent.componentType === ComponentType.CONTROLLER) {
                controllers.push(Reflect.getMetadata('Symbol(ComponentName)', scannedComponent.componentSource) || scannedComponent.exportName);
            }
        }

        applicationContext.getComponents(controllers);
    }
}
