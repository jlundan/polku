import {RouterIntegration, RouteContext, ResponseSerializer, RouterRegistry} from "../router-registry";
import {JsonSerializer} from "../response-serializers/json-serializer";

import * as express from "express";
import * as path from "path";
import * as http from "http";
import * as bodyParser from "body-parser";
import {ApplicationContext} from "../application-context";
import {Server} from "http";

export class ExpressRouter implements RouterIntegration{
    private readonly _router: express.Router;
    private _responseSerializer: ResponseSerializer;

    public constructor(router: express.Router) {
        this._router = router;
        this._responseSerializer = new JsonSerializer();
    }

    registerRoute(url: string, method: string, controller: any, routeHandler: any) {
        this._router[method](url, (request: express.Request, response: express.Response) => {
            let ctx: RouteContext = {
                request: {
                    body: request.body,
                    headers: {},
                    params: {},
                    query: {},
                    path: request.path
                }
            };

            for(let header of Object.keys(request.headers)) {
                ctx.request.headers[header] = request.headers[header];
            }

            for(let param of Object.keys(request.params)) {
                ctx.request.params[param] = request.params[param];
            }

            for(let queryParam of Object.keys(request.query)) {
                ctx.request.query[queryParam] = request.query[queryParam];
            }

            try{
                let result = controller[routeHandler](ctx);

                if(result instanceof Promise) {
                    result.then((promiseResult: any) => {
                        if(!promiseResult) {
                            response.status(200).send(this._responseSerializer.serializeResponse(""));
                        } else {
                            response.status(promiseResult.statusCode || 200).send(this._responseSerializer.serializeResponse(promiseResult.body || promiseResult));
                        }
                    });
                } else {
                    if(!result) {
                        response.status(200).send(this._responseSerializer.serializeResponse(""));
                    } else {
                        response.status(result.statusCode || 200).send(this._responseSerializer.serializeResponse(result.body || result));
                    }
                }
            } catch (e) {
                response.status(e.statusCode || 500).send(this._responseSerializer.serializeError(e.message || e));
            }
        });
    }
}

export class DefaultExpressApplication {
    private readonly _componentPaths: string [];
    private readonly _app: express.Application;
    private readonly _router: express.Router;

    constructor(componentPaths: string[]) {
        this._componentPaths = componentPaths;
        this._app = express();
        this._router = express.Router();
        this._app.use(bodyParser.json());
        this._app.use(this._router);
    }

    public start(port?: number): Promise<Server> {
        return new Promise<Server>((resolve, reject) => {
            try {
                RouterRegistry.getInstance().registerRouter("router-1", new ExpressRouter(this._router), true);
                ApplicationContext.getInstance().scan(this._componentPaths);

                const server = http.createServer(this._app);

                server.on('error', (e) => {
                    reject(e);
                });

                server.listen(port || 3000, () => {
                    resolve(server);
                });
            } catch (e) {
                reject(e);
            }
        });
    }
}
