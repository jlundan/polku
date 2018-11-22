import {RouterIntegration, RouteContext} from "../../../src/";


export class DummyRouter implements RouterIntegration{
    registerRoute(url: string, method: string, controller: any, routeHandler: any) {
    }

    afterComponentScan(): void {
    }

    beforeComponentScan(): void {
    }
}
