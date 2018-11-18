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
    private _components: Map<string, ComponentWrapper>;

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

    registerComponent(source: any, name: string, scope: ComponentScope, type: ComponentType) {
        this._components.set(name, new ComponentWrapper(source, scope, type));
    }

    public initializeWithDirectoryScan (dir) {
        let scannedComponents = this.scanDirectory(dir);
        let controllers = [];
        for(let scannedComponent of scannedComponents) {
            this.registerComponent(
                scannedComponent.componentSource,
                Reflect.getMetadata('Symbol(ComponentName)', scannedComponent.componentSource) || scannedComponent.exportName,
                Reflect.getMetadata('Symbol(ComponentScope)', scannedComponent.componentSource),
                scannedComponent.componentType);

            if(scannedComponent.componentType === ComponentType.CONTROLLER) {
                controllers.push(Reflect.getMetadata('Symbol(ComponentName)', scannedComponent.componentSource) || scannedComponent.exportName);
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

class ComponentWrapper {
    private _instance: any;
    constructor(private _source: any, private _scope: ComponentScope, private _type: ComponentType) {
        this._instance = null;
    }

    get instance() {
        if(this._scope === ComponentScope.PROTOTYPE){
            return new this._source();
        }

        if(!this._instance) {
            this._instance = new this._source();
        }
        return this._instance;
    }

    get type() {
        return this._type;
    }
}
