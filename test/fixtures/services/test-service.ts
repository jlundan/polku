import {Service, Inject} from "../../../src/";
import {SubService} from "./sub-service";

@Service({
    name: "TestService"
})
export class TestService {
    constructor(@Inject("SubService") private _subService: SubService) {
    }

    sayHello(name): string {
        return `Hello, ${name}! And the sub-service says: ${this._subService.test()}`;
    }
}