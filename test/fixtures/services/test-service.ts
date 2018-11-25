import {Service, Inject} from "../../../src/";
import {SubService} from "./sub-service";

@Service({
    name: "TestService"
})
export class TestService {
    constructor(@Inject("SubService") private _subService: SubService) {
    }

    echoMessage(message) {
        return {
            heading: "test",
            message: this._subService.injectToLiteral(message)
        };
    }
}