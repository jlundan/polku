export interface RouteContext {
    request: Request;
}

export interface Request {
    body: any;
    params: any;
    query: any;
    headers: any;
    path: string;
}

export interface ResponseSerializer {
    serializeResponse(response: any): string;
    serializeError(error: any): string;
}

export interface RouterIntegration {
    registerRoute(url: string, method: string, controller:any, routeHandler: string);
}

export class RouterRegistry {
    private static _instance: RouterRegistry;
    private _activeRouterImplementation: RouterIntegration;
    private routers: Map<string, RouterIntegration>;

    static getInstance(): RouterRegistry {
        if(!RouterRegistry._instance) {
            RouterRegistry._instance = new RouterRegistry();
        }
        return RouterRegistry._instance;
    }

    private constructor() {
        this._activeRouterImplementation = null;
        this.routers = new Map<string, RouterIntegration>();
    }

    /**
     *
     * @param name
     * @param routerImplementation The router implementation which will be used by the Route annotations to register routes
     * @param activate
     */
    registerRouter(name: string, routerImplementation: RouterIntegration, activate?: boolean) {
        this.routers.set(name, routerImplementation);
        if(activate) {
            this._activeRouterImplementation = routerImplementation;
        }
    }

    activateRouter(name: string) {
        if(!this.routers.has(name)) {
            throw "Cannot find router: " + name;
        }
        this._activeRouterImplementation = this.routers.get(name);
    }

    getRouter(): RouterIntegration {
        return this._activeRouterImplementation;
    }

    clear() {
        this._activeRouterImplementation = null;
        this.routers.clear();
    }
}
