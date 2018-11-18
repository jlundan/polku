import {Service} from "../../../src/";

@Service({
    name: "SubService"
})
export class SubService {
    test(): string {
        return "foo";
    }
}