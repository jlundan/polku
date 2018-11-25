import * as path from "path";
import * as express from "express";
import * as helmet from "helmet";
import * as bodyParser from "body-parser";
import * as http from "http";

import {ResponseSerializer, RouterIntegration, RouterRegistry} from "./router-registry";
import {ApplicationContext} from "./application-context";
import {ExpressRouter} from "./express/polku-express";
import {JsonSerializer} from "./response-serializers/json-serializer";

const DEFAULT_PORT = 3000;

export interface ApplicationOptions {
    componentScan?: string | Array<string>;
}

export interface DefaultRoutingOptions {
    port: number;
}

export class Application {
    private _routerRegistry;
    private readonly _applicationContext: ApplicationContext;
    private _defaultIntegrationPort;
    private _responseSerializer: ResponseSerializer;

    constructor(private _options?: ApplicationOptions){
        this._routerRegistry = RouterRegistry.getInstance();
        this._applicationContext = ApplicationContext.getInstance();
        this._defaultIntegrationPort = null;
    }

    public withRouting(integration: RouterIntegration) {
        this._routerRegistry.registerRouter(integration);
        return this;
    }

    public withDefaultRouting(options: DefaultRoutingOptions) {
        this._defaultIntegrationPort = options.port;
        return this;
    }

    public start(){
        let router = this._routerRegistry.getRouter();

        if(!router) {
            router = ApplicationHelpers.createDefaultRouter(this._defaultIntegrationPort || DEFAULT_PORT);
            this._routerRegistry.registerRouter(router);
        }

        router.setResponseSerializer(this._responseSerializer || new JsonSerializer());

        ApplicationHelpers.callRouterHook(router, "beforeComponentScan");
        this._applicationContext.initializeWithDirectoryScan(ApplicationHelpers.resolveScanPaths(this._options));
        ApplicationHelpers.callRouterHook(router, "afterComponentScan");
    }
}

class ApplicationHelpers {
    static resolveScanPaths (options?: ApplicationOptions){
        if(!options || !options.componentScan) {
            return path.join(__dirname, "..", "..", "..");
        }

        return Array.isArray(options.componentScan) ? options.componentScan : [options.componentScan];
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


