import * as path from "path";
import * as fs from "fs";
import * as express from "express";
import * as helmet from "helmet";
import * as bodyParser from "body-parser";
import * as http from "http";

import {RouterRegistry} from "./router-registry";
import {ApplicationContext, ComponentType} from "./application-context";
import {ExpressRouter} from "./express/polku-express";

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
        this._applicationContext.initializeWithDirectoryScan(ApplicationHelpers.resolveScanPath(this._options));
        ApplicationHelpers.callRouterHook(router, "afterComponentScan");

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


