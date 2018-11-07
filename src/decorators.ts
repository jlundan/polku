import "reflect-metadata";
import * as path from "path";
import {ApplicationContext} from "./application-context";
import {RouterRegistry} from "./router-registry";

export interface RouteContext {
    request: Request;
}

export interface Request {
    body: any;
    params: [string, string][];
    query: [string, string][];
    headers: [string, string][];
    path: string;
}

export interface ControllerDecoratorOptions {
    prefix: string
}

export function Controller(options?: ControllerDecoratorOptions): ClassDecorator {
    if(!options) {
        options = {
            prefix: "/"
        }
    }
    return (target: any) => {
        let original = target;

        function construct(constructor, args, injectArgs) {
            let c : any = function () {
                return constructor.apply(this, injectArgs.concat(args));
            };
            c.prototype = constructor.prototype;
            return new c();
        }

        let f : any = function (...args) {

            let newObj = construct(original, args, ApplicationContext.getInstance().getComponents(Reflect.getMetadata('Symbol(InjectArgs)', target)));

            Reflect.defineMetadata('prefix', options.prefix, target.prototype);
            let topicFns: Array<(any) => void> = Reflect.getMetadata("topicCallbacks", target.prototype);
            if (topicFns) {
                topicFns.forEach((fn) => {
                    fn(newObj)
                });
            }

            return newObj;
        };

        // make instanceof work
        f.prototype = original.prototype;

        Reflect.defineMetadata('Symbol(ComponentType)', "Controller", f);

        return f;
    }
}

export interface RouteDecoratorOptions {
    method: string
    path: string
}

export function Route(options: RouteDecoratorOptions) {
    return function (target: any, propertyKey: string) {
        let topicFns: Array<(any) => void> = Reflect.getMetadata("topicCallbacks", target);
        if (!topicFns) {
            Reflect.defineMetadata("topicCallbacks", topicFns = [], target);
        }
        topicFns.push((obj:any) => {
            let controllerPrefix = Reflect.getMetadata('prefix', target);
            let routePath = options.path;
            RouterRegistry.getInstance().getRouter()
                .registerRoute(path.join(controllerPrefix, routePath), options.method, obj, propertyKey);
        });
    }
}

export function ApplicationConfiguration(): ClassDecorator {
    return (target: any) => {
        return makeConstructor(target);
    }
}

export enum ComponentScope {
    SINGLETON,
    PROTOTYPE
}

export enum ComponentType {
    CONTROLLER,
    SERVICE
}

export interface ServiceOptions {
    name: string;
    scope?: ComponentScope
}

export function Service(options?: ServiceOptions): ClassDecorator {
    return (target: any) => {
        let constr = makeConstructor(target);

        Reflect.defineMetadata('Symbol(ComponentType)', "Service", constr);
        Reflect.defineMetadata('Symbol(ComponentName)', options.name, constr);
        Reflect.defineMetadata('Symbol(ComponentScope)', options.scope || ComponentScope.SINGLETON, constr);

        return constr;
    }
}

export function Bean(options?: any) {
    return function (target: any, propertyKey: string) {

    }
}

export function Inject(name?: string) {
    return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
        Reflect.defineMetadata('Symbol(InjectArgs)', [name], target);
    }
}

function makeConstructor(original: any, metadataKeys?: [string,string][]) {
    function construct(constructor, args) {
        let c : any = function () {
            return constructor.apply(this, args);
        };
        c.prototype = constructor.prototype;
        return new c();
    }

    let f : any = function (...args) {
        let newObj = construct(original, args);

        if(metadataKeys) {
            metadataKeys.forEach((value: [string, string])=>{
                Reflect.defineMetadata(value[0], value[1], original.prototype);
            })
        }

        return newObj;
    };

    // make instanceof work
    f.prototype = original.prototype;
    //Reflect.defineMetadata('Symbol(ComponentType)', type, f);
    return f;
}