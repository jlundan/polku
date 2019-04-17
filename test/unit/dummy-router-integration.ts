import {RouterIntegration} from "../../index";

export class DummyRouterIntegration implements RouterIntegration{

    public constructor() {
    }

    registerRoute(url: string, method: string, controller: any, routeHandler: any) {
    }
}
