import {RouterImplementation, RouteContext} from "../../../src/";


export class DummyRouter implements RouterImplementation{
    registerRoute(url: string, method: string, controller: any, routeHandler: any) {
    }

    afterComponentScan(): void {
    }

    beforeComponentScan(): void {
    }
}
