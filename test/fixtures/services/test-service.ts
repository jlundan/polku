import {Service, Inject} from "../../../src/";
import {SubService} from "./sub-service";
import * as uuidv4 from'uuid/v4';

@Service({
    name: "TestService"
})
export class TestService {
    private _messages: Map<string, any>;

    constructor(@Inject("SubService") private _subService: SubService) {
        this._messages = new Map<string, any>();
    }

    echoMessage(message) {
        return {
            heading: "test",
            message: this._subService.injectToLiteral(message)
        };
    }

    addMessage(message: string) {
        const messageId = uuidv4();
        this._messages.set(messageId, message);
        return {
            id: messageId,
            message: message
        };
    }

    setMessages(message: string) {
        this._messages.set(uuidv4(), message);
    }

    getMessage(id: string) {
        if(!this._messages.has(id)) {
            return {
                statusCode: 404,
                message: "Message not found"
            }
        }

        return this._messages.get(id);
    }

    deleteMessage(id: string) {
        if(!this._messages.has(id)) {
            return {
                statusCode: 404,
                message: "Message not found"
            }
        }

        return this._messages.delete(id);
    }

    getMessages(){
        let msgs = [];

        this._messages.forEach((value: string, key: string) => {
            msgs.push({
                id: key,
                message: value
            })
        });

        return msgs;
    }
}
