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

