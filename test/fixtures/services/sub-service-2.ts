import {Service} from "../../../src/";

@Service({
    name: "SubService-2"
})
export class SubService2 {
    getName(): string {
        return "SubService-2";
    }
}
