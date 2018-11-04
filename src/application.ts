import {RouterRegistry} from "./routing";
import {ExpressRouter} from "./express/express-router";
import * as path from "path";
import * as fs from "fs";
import {ApplicationContext} from "./application-context";

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

    /**
     * Enable express-router
     * @param engine
     * @param config
     */
    withRouting(engine: string, config?: any): Application {
        let router = new ExpressRouter(config);
        this._routerRegistry.registerDefaultRouterImplementation(router);

        router.beforeComponentScan();
        this.scanComponents();
        router.afterComponentScan();

        return this;
    }

    private scanComponents(){
        const scanPath = this._options && this._options.componentScan && this._options.componentScan.base
            ? this._options.componentScan.base : path.join(__dirname, "..", "src");

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
}
