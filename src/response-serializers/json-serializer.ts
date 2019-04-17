import {ResponseSerializer} from "../router-registry";

export class JsonSerializer implements ResponseSerializer{
    serializeResponse(response: any): string {
        return JSON.stringify(response);
    }

    serializeError(error: any): string {
        return JSON.stringify(error);
    }
}
