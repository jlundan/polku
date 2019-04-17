import {Controller, Route, RouteContext, Inject} from "../../../";
import {TestService} from "../services/test-service";
import {TestService2} from "../services/test-service-2";

@Controller({
    prefix: "/"
})
export class TestController {
    constructor(
        @Inject("TestService") private _testService: TestService,
        @Inject("TestService-2") private _testService2: TestService2
    ) {
    }

    @Route({ "method": "get", "path": "/test" })
    private test () {
        if(this._testService.getName() !== "TestService" || this._testService2.getName() !== "TestService-2") {
            throw "Services not injected properly!";
        }
        return {
            message: "test-controller-1"
        };
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

    @Route({ "method": "get", "path": "/api/messages/:id" })
    private getMessage (ctx: RouteContext) {
        return this._testService.getMessage(ctx.request.params['id']);
    }

    @Route({ "method": "put", "path": "/api/messages" })
    private updateMessages (ctx: RouteContext) {
        return this._testService.setMessages(ctx.request.body);
    }

    @Route({ "method": "delete", "path": "/api/messages/:id" })
    private deleteMessage (ctx: RouteContext) {
        return this._testService.deleteMessage(ctx.request.params['id']);
    }
}
