import {Controller, Route, RouteContext, Inject} from "../../../src/";
import {TestService} from "../services/test-service";

@Controller({
    prefix: "/"
})
export class TestController {
    constructor(@Inject("TestService") private _testService: TestService) {
    }

    @Route({ "method": "get", "path": "/hello/:name" })
    private hello (ctx: RouteContext) {
        return {message: this._testService.sayHello(ctx.request.params['name'])};
    }

    @Route({ "method": "get", "path": "/fail/with/:status" })
    private failWithStatusCode (ctx: RouteContext) {
        throw {
            message: "Request failed",
            statusCode: ctx.request.params['status']
        };
    }
}
