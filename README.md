# Introduction

Chori is a NodeJS library with focus on defining APIs using typescript decorators. 

## Installing

```
npm install https://github.com/jlundan/chori
```

## Bootstrapping
Create file in the root of your project

```typescript
import {Application} from "chori";
const port = 3000;
new Application({componentScan: __dirname}).start(port);
```

## Specifying controllers
Place a file somewhere in your project with following contents:

```typescript
import {Controller, Route, RouteContext} from "chori";

@Controller({
    prefix: "/"
})
export class TestController {
    constructor() {
    }

    @Route({ "method": "get", "path": "/hello/:name" })
    private hello (ctx: RouteContext) {
        return `Hello, ${ctx.request.params['name']}`
    }
}
```
Restart your node application and you should see the response at http:[your_host]:3000/hello/cnorris.

## Injecting services
Define a service somewhere in your project
```typescript
import {Service} from "chori";

@Service({
    name: "TestService"
})
export class TestService {
    sayHello(name: string): string {
        return `Hello, ${name}`
    }
}
```

And inject it to your controller
```typescript
import {Controller, Route, RouteContext, Inject} from "chori";
import {TestService} from "./test-service";

@Controller({
    prefix: "/"
})
export class TestController {
    constructor(@Inject("TestService") private _testService: TestService) {
    }

    @Route({ "method": "get", "path": "/hello/:name" })
    private hello (ctx: RouteContext) {
        return {message: this._testService.sayHello(ctx.request.params['name'])};
    }
}
```

## Chaining services
Services can inject another services. Define another service somewhere in your project
```typescript
import {Service} from "chori";

@Service({
    name: "SubService"
})
export class SubService {
    test(): string {
        return "foo";
    }
}

```
The go and modify the TestService from previous example:

```typescript
import {Service, Inject} from "chori";
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
```
