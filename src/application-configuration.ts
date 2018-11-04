import "reflect-metadata";

export function ApplicationConfiguration(): ClassDecorator {
    return (target: any) => {
        return makeConstructor(target);
    }
}

export enum ComponentScope {
    SINGLETON,
    PROTOTYPE
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