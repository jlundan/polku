import * as path from "path";
import * as fs from "fs";
import * as express from "express";
import * as helmet from "helmet";
import * as bodyParser from "body-parser";
import * as http from "http";

import {RouterRegistry} from "./routing";
import {ApplicationContext} from "./application-context";
import {ExpressRouter} from "./express/chori-express";

export interface ComponentScanOptions {
    base: string;
}
export interface ApplicationOptions {
    componentScan?: ComponentScanOptions
}

export class Application {
    private _routerRegistry;
    private _applicationContext: ApplicationContext;

    constructor(private _options?: ApplicationOptions){
        this._routerRegistry = RouterRegistry.getInstance();
        this._applicationContext = ApplicationContext.getInstance();
    }

    private scanComponents(){
        const scanPath = this._options && this._options.componentScan && this._options.componentScan.base
            ? this._options.componentScan.base : path.join(__dirname, "..", "..", "src");

        let components = this.getComponents(scanPath, {
            controllers: [],
            services: []
        });

        for(let service of components.services) {
            this._applicationContext.registerComponent(
                service,
                Reflect.getMetadata('Symbol(ComponentName)', service),
                Reflect.getMetadata('Symbol(ComponentScope)', service));
        }

        for(let controller of components.controllers) {
            new controller();
        }
    }

    private getComponents (dir, components){
        let files = fs.readdirSync(dir);
        for (let i in files){
            let name = path.join(dir, files[i]);
            if (fs.statSync(name).isDirectory()){
                this.getComponents(name, components);
            } else {
                if(name.endsWith(".js")) {
                    let exports: any = require(name);
                    Object.keys(exports).forEach( (objectKey: string) => {
                        try {
                            switch (Reflect.getMetadata('Symbol(ComponentType)', exports[objectKey])) {
                                case "Controller" : {
                                    components.controllers.push(exports[objectKey]);
                                    break;
                                }
                                case "Service" : {
                                    components.services.push(exports[objectKey]);
                                    break;
                                }
                            }

                        }catch (e) {
                        }
                    });
                }
            }
        }
        return components;
    }

    public start(port?: number){
        if(!this._routerRegistry.hasRouter) {
            let router = new ExpressRouter({
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

            this._routerRegistry.registerDefaultRouterImplementation(router);
            router.beforeComponentScan();
            this.scanComponents();
            router.afterComponentScan();
        }
    }
}
