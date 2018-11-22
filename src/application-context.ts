import * as fs from "fs";
import * as path from "path";

export enum ComponentType {
    CONTROLLER,
    SERVICE
}

export enum ComponentScope {
    SINGLETON,
    PROTOTYPE
}

export class ApplicationContext {
    private static _instance;
    public static getInstance(){
        if(!this._instance) {
            this._instance = new ApplicationContext();
        }
        return this._instance;
    }
    private _components: Map<string, ComponentDefinition>;

    constructor() {
        this._components = new Map<string, any>();
    }

    getComponent(name: string) {
        return this._components.get(name) ? this._components.get(name).instance : null;
    }

    getComponents(names: string[]) {
        if(!names){
            return [];
        }

        let cmps = [];
        for(let name of names) {
            cmps.push(this._components.get(name) ? this._components.get(name).instance : null);
        }
        return cmps;
    }

    getComponentDefinitions(names: string[]) {
        if(!names){
            return [];
        }

        let cmps = [];
        for(let name of names) {
            cmps.push(this._components.get(name) ? this._components.get(name) : null);
        }
        return cmps;
    }

    public initializeWithDirectoryScan (dir) {
        let scannedComponents = this.scanDirectory(dir);
        let controllers = [];

        for(let scannedComponent of scannedComponents) {
            const componentName = Reflect.getMetadata('Symbol(ComponentName)', scannedComponent.componentSource) || scannedComponent.exportName;

            this._components.set(componentName, scannedComponent);

            if(scannedComponent.componentType === ComponentType.CONTROLLER) {
                controllers.push(componentName);
            }
        }

        return this.getComponents(controllers);
    }

    private scanDirectory (dir) {
        let components = [];
        let files = fs.readdirSync(dir);
        for (let file of files){
            let filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()){
                components = components.concat(this.scanDirectory(filePath));
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
                        scannedExports.push(new ComponentDefinition(exports[objectKey], ComponentType.CONTROLLER, objectKey));
                        break;
                    }
                    case "Service" : {
                        scannedExports.push(new ComponentDefinition(exports[objectKey], ComponentType.SERVICE, objectKey));
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

class ComponentDefinition {
    private _instance: any;

    constructor(private _componentSource: any, private _componentType: ComponentType, private _exportName: string) {
        this._instance = null;
    }

    get componentSource() {
        return this._componentSource;
    }

    get componentType() {
        return this._componentType;
    }

    get componentScope() {
        return Reflect.getMetadata('Symbol(ComponentScope)', this.componentSource)
    }

    get exportName() {
        return this._exportName;
    }

    get instance() {
        if(this.componentScope === ComponentScope.PROTOTYPE){
            return new this.componentSource();
        }

        if(!this._instance) {
            this._instance = new this.componentSource();
        }
        return this._instance;
    }
}
