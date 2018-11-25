import "reflect-metadata";
import * as path from "path";
import {ApplicationContext, ComponentScope} from "./application-context";
import {RouterRegistry} from "./router-registry";

export interface ControllerDecoratorOptions {
    prefix: string
}

export function Controller(options?: ControllerDecoratorOptions): ClassDecorator {
    let afterObjectCreationHandler = function(target, options, newObject) {
        Reflect.defineMetadata('prefix', options.prefix, target.prototype);
        let topicFns: Array<(any) => void> = Reflect.getMetadata("topicCallbacks", target.prototype);
        if (topicFns) {
            topicFns.forEach((fn) => {
                fn(newObject)
            });
        }
    };

    return (target: any) => {
        let extendedConstructor = ObjectUtils.extendConstructor(
            target,
            ControllerUtils.parseOptions(options),
            afterObjectCreationHandler
        );

        Reflect.defineMetadata('Symbol(ComponentType)', "Controller", extendedConstructor);
        Reflect.defineMetadata('Symbol(ComponentScope)', ComponentScope.SINGLETON, extendedConstructor);

        return extendedConstructor;
    };
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

            let router = RouterRegistry.getInstance().getRouter();
            if(router) {
                router.registerRoute(path.join(controllerPrefix, routePath), options.method, obj, propertyKey);
            } else {
                console.log(`WARNING: no router integration configured, cannot register route: ${path.join(controllerPrefix, routePath)}\n`);
            }
        });
    }
}

export interface ServiceOptions {
    name: string;
    scope?: ComponentScope
}

export function Service(options?: ServiceOptions): ClassDecorator {
    return (target: any) => {
        let constr = ObjectUtils.extendConstructor(target);

        Reflect.defineMetadata('Symbol(ComponentType)', "Service", constr);
        Reflect.defineMetadata('Symbol(ComponentName)', options.name, constr);
        Reflect.defineMetadata('Symbol(ComponentScope)', options.scope || ComponentScope.SINGLETON, constr);

        return constr;
    }
}

export function ApplicationConfiguration(): ClassDecorator {
    return (target: any) => {
        return ObjectUtils. extendConstructor(target);
    }
}

export function Inject(name?: string) {
    return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
        Reflect.defineMetadata('Symbol(InjectArgs)', [name], target);
    }
}

export function Bean(options?: any) {
    return function (target: any, propertyKey: string) {

    }
}

class ControllerUtils {
    static parseOptions(original: ControllerDecoratorOptions) : ControllerDecoratorOptions{
        return original || {
            prefix: "/"
        }
    }
}

class ObjectUtils {
    static construct(constructor: any, args: any, injectArgs?: any) {
        let c : any = function () {
            return constructor.apply(this, injectArgs ? injectArgs.concat(args) : args);
        };
        c.prototype = constructor.prototype;
        return new c();
    }

    static extendConstructor(originalConstructor: any, options?, afterObjectCreation?) {
        let extendingConstructor : any = function (...args) {
            let injectArgs = Reflect.getMetadata('Symbol(InjectArgs)', originalConstructor);
            let injectedComponents = ApplicationContext.getInstance().getComponents(injectArgs);
            let newObject = ObjectUtils.construct(originalConstructor, args, injectedComponents);

            if(afterObjectCreation) {
                afterObjectCreation(originalConstructor, options, newObject);
            }

            return newObject;
        };

        // make instanceof work
        extendingConstructor.prototype = originalConstructor.prototype;
        return extendingConstructor;
    }
}
