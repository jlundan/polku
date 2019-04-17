import {Service} from "../../../";

@Service({
    name: "SubService"
})
export class SubService {
    getName(): string {
        return "SubService";
    }

    injectToLiteral(text: string): any {
        return {
            text: text
        };
    }
}
