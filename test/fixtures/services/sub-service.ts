import {Service} from "../../../src/";

@Service({
    name: "SubService"
})
export class SubService {
    foo(): string {
        return "foo";
    }
}