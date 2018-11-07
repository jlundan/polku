import {ComponentScope, ComponentType} from "./decorators";

export class ApplicationContext {
    private static _instance;
    public static getInstance(){
        if(!this._instance) {
            this._instance = new ApplicationContext();
        }
        return this._instance;
    }
    private _components: Map<string, any>;

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
        switch (type) {
            case ComponentType.SERVICE: {
                this._components.set(name, new ComponentWrapper(source, scope));
                break;
            }
            case ComponentType.CONTROLLER: {
                new source();
                break;
            }
            default: break;
        }
    }
}

class ComponentWrapper {
    private _instance: any;
    constructor(private _source: any, private _scope: ComponentScope) {
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
}
