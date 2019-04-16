import {Controller, Route, RouteContext, Inject} from "../../../src/";
import {TestService} from "../services/test-service";

@Controller({
    prefix: "/"
})
export class TestController {
    constructor(@Inject("TestService") private _testService: TestService) {
    }

    @Route({ "method": "get", "path": "/echo/:message" })
    private echo (ctx: RouteContext) {
        return {response: this._testService.echoMessage(ctx.request.params['message'])};
    }

    @Route({ "method": "get", "path": "/fail/with/:status" })
    private failWithStatusCode (ctx: RouteContext) {
        throw {
            message: "Request failed",
            statusCode: ctx.request.params['status']
        };
    }

    @Route({ "method": "post", "path": "/api/messages" })
    private createNewMessage (ctx: RouteContext) {
        return this._testService.addMessage(ctx.request.body.message);
    }
}
