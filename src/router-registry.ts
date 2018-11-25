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

export interface RouterIntegration {
    registerRoute(url: string, method: string, controller:any, routeHandler: string);
    beforeComponentScan(): void;
    afterComponentScan(): void;
}

export class RouterRegistry {
    private static _instance: RouterRegistry;
    private _defaultRouterImplementation: RouterIntegration;

    static getInstance(): RouterRegistry {
        if(!RouterRegistry._instance) {
            RouterRegistry._instance = new RouterRegistry();
        }
        return RouterRegistry._instance;
    }

    private constructor() {
        this._defaultRouterImplementation = null;
    }

    /**
     *
     * @param routerImplementation The router implementation which will be used by the Route annotations to register routes
     */
    registerRouter(routerImplementation: RouterIntegration) {
        this._defaultRouterImplementation = routerImplementation;
    }

    getRouter(): RouterIntegration {
        return this._defaultRouterImplementation;
    }

    clear() {
        this._defaultRouterImplementation = null;
    }
}