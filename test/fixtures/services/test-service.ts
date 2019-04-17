import {Service, Inject} from "../../..";
import {SubService} from "./sub-service";
import * as uuidv4 from'uuid/v4';
import {SubService2} from "./sub-service-2";

@Service({
    name: "TestService"
})
export class TestService {
    private _messages: Map<string, any>;

    constructor(
        @Inject("SubService") private _subService: SubService,
        @Inject("SubService-2") private _subService2: SubService2
    ) {
        this._messages = new Map<string, any>();
    }

    getName(): string {
        if(this._subService.getName() !== "SubService" || this._subService2.getName() !== "SubService-2") {
            throw "Sub services not injected properly!";
        }
        return "TestService";
    }

    echoMessage(message) {
        return {
            heading: "test",
            message: this._subService.injectToLiteral(message)
        };
    }

    addMessage(message: string) {
        const msg = {
            id: uuidv4(),
            message: message
        };
        this._messages.set(msg.id, msg);
        return msg;
    }

    setMessages(messages: any[]) {
        const newMessages = new Map<string, any>();
        for(const message of messages) {
            newMessages.set(message.id, message);
        }
        this._messages = newMessages;

        return messages;
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
        const deleted = this._messages.get(id);
        return this._messages.delete(id) ? deleted : null;
    }
}
