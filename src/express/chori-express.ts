import * as express from "express";
import {RouteContext} from "../decorators";
import {RouterImplementation} from "../router-registry";

export type BeforeRouterSetup = (application: express.Application) => any;
export type AfterRouterSetup = (application: express.Application, router: express.Router) => any;

export interface ExpressRouterOptions {
    beforeRouterSetup?: BeforeRouterSetup
    afterRouterSetup?: AfterRouterSetup
}

export class ExpressRouter implements RouterImplementation{
    private readonly _app: express.Application;
    private readonly _router: express.Router;
    private readonly _beforeRouterSetup: BeforeRouterSetup;
    private readonly _afterRouterSetup: AfterRouterSetup;

    public constructor(options?: ExpressRouterOptions) {
        this._app = express();
        this._router = express.Router();
        this._beforeRouterSetup = options && options.beforeRouterSetup ? options.beforeRouterSetup : null;
        this._afterRouterSetup = options && options.afterRouterSetup ? options.afterRouterSetup : null;
    }

    registerRoute(url: string, method: string, controller: any, routeHandler: any) {
        this._router.get(url, (request: express.Request, response: express.Response) => {
            let ctx: RouteContext = {
                request: {
                    body: request.body,
                    headers: [],
                    params: [],
                    query: [],
                    path: request.path
                }
            };

            for(let header of Object.keys(request.headers)) {
                ctx.request.headers.push([header, request.headers[header] as string|undefined])
            }

            for(let param of Object.keys(request.params)) {
                ctx.request.params.push([param, request.params[param] as string|undefined]);
            }

            for(let queryParam of Object.keys(request.query)) {
                ctx.request.query.push([queryParam, request.query[queryParam] as string|undefined]);
            }

            let result = controller[routeHandler](ctx);

            if(result instanceof Promise) {
                result.then((result: any) => {
                    response.status(200).send(result);
                });
            } else {
                response.status(200).send(result);
            }
        });
    }

    beforeComponentScan(): void {
        if(this._afterRouterSetup){
            this._afterRouterSetup(this._app, this._router);
        }

        this._app.use(this._router);
    }

    afterComponentScan(): void {
        if(this._beforeRouterSetup){
            this._beforeRouterSetup(this._app);
        }
    }
}
