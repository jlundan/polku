import {Service} from "../../../src/";

@Service({
    name: "SubService"
})
export class SubService {
    injectToLiteral(text: string): any {
        return {
            text: text
        };
    }
}