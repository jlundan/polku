import {Controller, Route} from "../../../";

@Controller({
    prefix: "/"
})
export class TestController2 {
    constructor() {
    }

    @Route({ "method": "get", "path": "/test" })
    private test () {
        return {
            message: "test-controller-2"
        };
    }
}
