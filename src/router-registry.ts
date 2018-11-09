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

export interface RouterImplementation {
    registerRoute(url: string, method: string, controller:any, routeHandler: string);
    beforeComponentScan(): void;
    afterComponentScan(): void;
}

export class RouterRegistry {
    private static _instance: RouterRegistry;
    private _defaultRouterImplementation: RouterImplementation;

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
    registerRouter(routerImplementation: RouterImplementation) {
        this._defaultRouterImplementation = routerImplementation;
    }

    getRouter(): RouterImplementation {
        return this._defaultRouterImplementation;
    }
}