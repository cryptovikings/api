# API ARCHITECTURE

The API is an Express Application which is configured with Endpoints that serve particular purposes so as to produce a RESTful API structure.

This document starts from the basics of Express and progresses into discussion of the API's actual implementation architecture, with the goal of providing full context and understanding for the APIs makeup and concepts and *why* the architecture is appropriate.

Designed to be consumed start-to-finish at any pace *without* requiring use of the API source as a referenece, so as to fully contextualise the API source.

Enjoy!


## Express Basics

Some background: Express functions as a **pipeline** of **Middleware**. Middleware perform an arbitrary function, and Middleware is executed in the order they're added to the Application with the function `use()`.

Here's an annotated example of an Express Middleware Configuration. Each `use()` is annoted with a `NAME` which will be used below to solidify the example:

```typescript
// the port the application will run on
const port = 8080;

// the Express application
const app: Application = express();

// set the port
app.set('port', port);

// use the built-in middleware `json()` to configure the Application to convert the Request Body into JSON
// NAME: json
app.use(express.json());

// configure CORS with a Middleware function
// NAME: CORS
app.use((req: Request, res: Response, next: NextFunction): void => {
	// middleware receives the 'Request', 'Response', and 'Next'

	// configure the Access-Control-Allow-Origin header on the 
	res.header('Access-Control-Allow-Origin', '*');

	// go to the next middleware in the pipeline
	next();
});

// configure Express with an Endpoint. If the first paramater of `use()` is a String, the Middleware is executed when the Request Path matches the String
// This effectively makes the Middleware defined here a response routine for the '/api/hello' endpoint
// NAME: /api/hello
app.use('/api/hello', (req: Request, res: Response): void => {
	
	// API responses are configured upon the Response object
	// This indicates that the /api/hello endpoint will return a JSON object of { hello: 'world' }, with the status code '200'
	res.status(200).json( { hello: 'world' } );
});

// configure Express with another Endpoint
// NAME: /api/world
app.use('/api/world', (req: Request, res: Response): void => {

    // /api/world responds with a different object
    res.status(200).json( { world: 'hello' } );
});

// configure Express with a Wildcard Endpoint. If the Request Path does not match any prior Endpoint Strings, Express will fall through to this catch-all
// NAME: Fallback
app.use('*', (req: Request, res: Response): void => {
	
	// For Endpoint Not Found, let's just return with a 404
	res.status(404).json( { message: 'Endpoint Not Found' } );
});

// if a Middleware has 4 parameters, then it is considered "error handling Middleware", where the first parameter is an Error
// If any Middleware in the stack calls `next()` with a parameter, Express will pipe through to the first Error Handling Middleware further on in the pipeline
// We can achieve centralised Error Handling by configuring an Error Handling Middleware *after* all of our Endpoints
// We can "throw" Errors in our Endpoints by just calling `next()` with a parameter
// NAME: Error
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
	
	// for Errors, let's just respond with information about the error and a status code '500'
	res.status(500).json( { error: err.name, message: err.message } );
});
```

Now that we've configured a viable Express Application, we wrap it up in a Node HTTP Server and then execute it with `listen()`:

```typescript
// initialise an http.Server based on the app we've configured
const server: http.Server = http.createServer(app);

// begin Server execution upon the port
server.listen(port);
```

When a Request is sent to the Express Application, that Request passes through *all* of the `use()`-configured Middleware **in order**. Where a Middleware has a first-parameter of String (and thereby indicates an Endpoint Response Middleware), Express will execute the Middleware only if the **Route Path** matches the **Endpoint String**. If no Endpoint Strings match the Route Path, Express will continue down the pipe - this is why we implement a **Wildcard Endpoint**, to catch all invalid Routes.

Example Request execution stacks:

**GET /api/hello**
- **EXECUTE: json** - transform Request Body into JSON format
- **EXECUTE: CORS** - set headers on the Response to configure CORS
- **MATCH PATH: '/api/hello'** - success
- **EXECUTE: /api/hello**
- **RESPOND WITH:** `{ hello: 'world' }`

**GET /something**
- **EXECUTE: json**
- **EXECUTE: CORS**
- **MATCH PATH: '/api/hello'** - fail
- **MATCH PATH: '/api/world'** - fail
- **MATCH PATH: '*'** - success
- **EXECUTE: Fallback**
- **RESPOND WITH:** `{ message: 'Endpoint Not Found' }`


## RESTful API

A **Route Collection** in a RESTful API is analogous to a *piece* of a *path*. **Endpoints** are defined as **Methods available on a given complete path**. Collections may be hierarchical, and infinitely nested. In the following route structure example, we define the **Collections** `api`, `hello` and `world`. We then define **Endpoints** for each of the common HTTP Methods within the `hello` and `world` Collections. The representative Request Path for each Endpoint is the concatenation of all the Path Pieces above it as well as its own Path Piece:

- /api
    - /hello
        - GET /     - GET /api/hello/
        - POST /    - POST /api/hello/
        - PUT /     - ...etc
        - DELETE /
    - /world
        - GET /
        - POST /
        - PUT /
        - DELETE /


**It is beneficial to structure an API with a hierarchy of Collections**. In a RESTful API, top-level Collections relate 1-to-1 with **Entities** (analogous in practical terms to Database Tables/Collections). Endpoints on a Collection's Route denote interactions for the entire **Entity Collection**, and subordinate Endpoints usually denote interactions with a **single Entity**.

Express supports **Request Parameters** which match Route Path pieces and allow you to generically define Entity Interactions:

```typescript
// Handler for the Hello Collection - all Hello Entities
// a Matching Route Path may be `/hello/`
express.use('/hello', (req: Request, res: Response): void => { ... } );

// Handler for a specific and singular Hello Entity, denoted by its id
// a Matching Route Path may be `/hello/1/`
express.use('/hello/:id', (req: Request, res: Response): void => {
    // req.params contains the key 'id' which will be the value provided in the Route Path
    const id = req.params.id; // => 1
});
```

So to extend the above example, we can denote a hierarchy of routes which clearly denote the ways you can interact with the Hello Entity:

- /api
    - /hello
        - /:id
            - GET /    - retrieve one Hello by ID
            - PUT /    - overwrite one Hello by ID
            - DELETE / - delete one Hello by ID
        - GET /        - retrieve many Hellos
        - POST /       - create a Hello
        - DELETE /     - delete all Hellos


**Note:** The nesting of all Collections under an `/api` Collection or similar is purely convention. The `api` Collection has no intrinsic meaning, and especially does not naturally associate with the concept of an Entity. A common pattern is to structure an API with all Endpoints nested RESTfully underneath something like `/api/v1/` - this convention is beneficial due to your ability as a developer to develop a new API under a separate Collection like `/api/v2` and switch over your front-end interactive functionality piece by piece.


## More Express

A note: the Endpoint Configurations made in Express Basics above *do not* specify the method that should be used to interact with the Endpoint and thereby any HTTP Method would work. Restricting methods can and should be done with alternative functions `get()`, `post()`, `put()`, `delete()`, etc:

```typescript
// Handler for GET /api/hello
app.get('/api/hello', ...); // handle the use-case of retrieving all Hellos

// Handler for POST /api/hello
app.post('/api/hello', ...); // handle the use-case of creating a Hello

// ...etc
```

Another note: `use()` can take **multiple Middleware**, which will be executed in provision order. When talking about Endpoint Configurations, provided Middleware will be executed when the Route Path matches in the order they're provided. This can be useful for performing routines like verifying authentication before actually executing a Handler. Here's an example that should make sense at this stage:

```typescript
// Authentication middleware
function authenticateUser(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
        // if no user on the Request, pipe an Error Message all the way through to the Error Handling Middleware
        next('User Not Authenticated');
    }
    else {
        // else, just move on to the next in the chain
        next();
    }
};

// endpoint handling middleware
function getHellos(req: Request, res: Response, next: NextFunction): Array<Hello> {
    return [ { hello: 'world', ...etc } ];
}

// When GET /api/hello is matched, authenticateUser is run before the final handler Middleware
// authenticateUser may prevent the execution of the Handler
app.get('/api/hello', authenticateUser, getHellos);
```

And for a visual demonstration of the genericness of `use()` - we could rewrite the pre-route-definition configuration stage like such. This is equivalent to the first example, except I define my own JSON-transforming Middleware for demonstration purposes:

```typescript
function json(req: Request, res: Response, next: NextFunction): void {
    req.body = JSON.parse(req.body);
    next();
}

function cors(req: Request, res: Response, next: NextFunction): void {
    res.header('Access-Control-Allow-Origin', '*');

    next();
}

// pipe both to the app in order
app.use(json, cors);
```

## Routers

By now it should be clear that an Express Application is effectively configured as a flat Pipeline of variously-purposed Middleware, where Endpoint Configuration should sit after critical configuration steps and before a centralised Error Handler.

It should also follow that configuring Endpoint Middleware is cumbersome for the following reasons:

- An Application may have many routes
- A RESTful Application will have consistently-nested routes
- Each Endpoint Configuration must specify the full path

At scale, this can be a tricky maintenance concern and prone to mistakes. In come **Routers** to make things easier.

**Routers** are a special Middleware which for all intents and purposes are functionally analogous to the core Application itself, with full configurability like `use()`, `get()`, `post()`, etc. They're sometimes referred to as **"mini-apps"**.

Routers allow us to abstract and solidify our API's route structure in a sensible and maintainable way. Routers can `use()` each other hierarchically.

It's a common pattern to have one **Router** per **Collection**. We can then split out the Router definitions into separate modules to keep things tidy. See the following single-module example for why this is useful:

```typescript
// application
const app: Application = express();

// the main APIRouter
const APIRouter = Router();

// the Router handling the /hello collection
const HelloRouter = Router();
HelloRouter.get('/', () => { ...get all hellos... });
HelloRouter.post('/', () => { ...create a Hello... });
HelloRouter.get('/:id', () => { ...get one Hello by ID... });

// set up the APIRouter to use the HelloRouter on match for '/hello'
APIRouter.use('/hello', HelloRouter);

// set up the Application to use the APIRouter on match for '/api'
app.use('/api', APIRouter);

// SUPPORTED ROUTES:
//   - GET  /api/hello/
//   - POST /api/hello/
//   - GET  /api/hello/:id
```

As shown, it's possible to pass Routers as the Middleware to `use()` calls, and Routers themselves are configured with Endpoint Handlers just like an Application can be. Routers can also be associated hierarchically with their own `use()`.

In this example, we no longer need to specify the full path per Endpoint Configuration, and if you imagine these Routers split out into separate modules, it's now *much simpler* to configure and ensure consistency on all System Routes. It's also much easier to refactor whole Collections at once. It also cleans up the core Application `index.ts`. Imagine that we have a module set denoting Routers:

```typescript
const app: Application = express();
app.set('port', 8080);

app.use(json, cors);

app.use(APIRouter);

app.use(errorHandler);

const server = http.Server(app);
server.listen(8080);
```

...where `APIRouter` is a Module exporting a `Router` which itself hierarchically imports and uses subordinate `Routers`.

This is great, and it allows us to define the "meat" of the Response-Handling Application in a repeatable fashion, but it has limitations.

For example, we're still defining Request Handling Middleware in the Router modules as simple functions - this becomes unmaintainable at scale, especially where across many Collections you may have want for consistent functionality (think: `GET /hello` and `GET /other` are effectively equivalent, except in the Entity they're retrieving).

To solve this problem, we'll abstract the Request Handling Middleware into a consistent and common structure, producing to-purpose modules that give us the ability to abstract as much as possible.

In doing so, we'll use **Controllers** to produce a **Request Handling Layer** for the application.


## ARCHITECTURE: Controllers

Controllers define the Endpoint Handling Middleware that will be passed to `Router` Path configurations. Inkeeping with the RESTful idea that *Collections* relate to *Entities*, one Controller exists to contain all the functionality associated with each Collection.

A basic example of using a Controller may be, for the `Hello` Router:

```typescript
import { HelloController } from '../hello.controller';

// initialise a router, initialise a controller
const helloRouter = Router();
const helloController = new HelloController();

// configure the router with Controller methods as the Handling Middleware
helloRouter.get('/', helloController.getAll);
helloRouter.post('/', helloController.create);

// export the Router for inclusion in some parent APIRouter at the route /hello
export { helloRouter };
```

...where the `HelloController` implements the Endpoint Middleware:

```typescript
export class HelloController {

    public getAll(req: Request, res: Response, next: NextFunction): void {
        // respond with our Hellos
        res.status(200).json([
            { hello: 'world' },
            { world: 'hello' }
        ]);

        // to throw an error:
        // next(new Error('message'));
    }

    public create(req: Request, res: response, next: NextFunction): void {
        const hello = req.body;

        // ...create Hello

        // respond with the created Hello by RESTful convention
        res.status(201).json( { ...the created Hello });
    }
}
```

This is all well and good as a first step, however there are some issues with it:

- due to being passed as Middleware callbacks, the methods `getAll()` and `create()` lose their `this`
- Controller methods must know how to interact with the Express `Response` and `NextFunction` so as to effectively do things like return data to the outside world or "throw" errors (pass onto our error handling middleware)
- We still haven't solved that "shared functionality" problem, where given routes across many collections may naturally function the same way
- Controller authorship is therefore more cumbersome than we'd like.

To solve the first problem, we'd have to follow a pattern like this:

```typescript
const helloRouter = Router();
const helloController = new HelloController();

// bind the getAll to the helloController instance so as to ensure it has `this`
router.get('/', helloController.getAll.bind(helloController));

export { helloRouter };
```

...this then creates a little more effort in configuring Routers, at the benefit of giving Controllers the ability to work within themselves.

To solve the second problem, it'd be convenient if there were some *centralised* Request Processing method that knows how to interact with Express. This could then let Controller Methods just return values and throw errors in a framework-agnostic sense.

To solve all of these problems at once, we will **abstract** both the centralised Request Processing *and* the Common Functionality into an `AbstractController`. Here's a simplified example of the `AbstractController` found in the API Source, focusing on Request Processing:

```typescript
export abstract class AbstractController {

    // centralised request handler - to be passed as the middleware handler for *all* Routes
    // the 'callback' parameter is the actual Controller Method implementing the Request Handling
    // produces centralised error handling, and enables Controller Methods to just return values and throw errors
    public processRequest(callback: Function, req: request, res: Response, next: NextFunction): void {
        try {
            // execute the callback
            // pass the Request to it so that it can inspect things like `req.body` and `req.params`
            const result = callback(req);

            // respond to the outside world with whatever the method returned
            res.status(200).json(result);
        }
        catch (e) {
            // in the event of a thrown error, pass it to Express' Error Handling Middleware
            next(e);
        }
    }

    // perform the cumbersome Instance Binding we'd otherwise have to do in the Router so as to:
    //   - give processRequest() a `this`
    //   - give the actual Controller Method a `this`
    //   - provide the actual handler as the first parameter to processRequest()
    public bindRequestHandler(handler: Function): Function {
        const boundHandler = handler.bind(this);
        const boundProcessor = this.processRequest.bind(this, boundHandler);

        return boundProcessor;
    }
}
```

Now, the `HelloController`'s methods can be simplified. Take note of the final line:

```typescript
class HelloController extends AbstractController {

    // Controller Methods receive the Express Request, return values, and throw errors - we're now Express-agnostic!
    public getAll(req: Request): Array<Hello> {
        return [
            { hello: 'world' },
            { world: 'hello' }
        ];

        // to throw an error:
        // throw new Error('message');
    }

    public create(req: Request): Hello {
        const hello = req.body;

        // ...create Hello

        return createdHello;
    }
}

// NOTE: export a singleton instance of the HelloController, to avoid needing to construct it in the Router module
export const helloController = new HelloController();
```

...and the `Router` configuration:

```typescript
import { helloController } from '../hello.controller';

const helloRouter = Router();

// pass the bound request handler `helloController.getAll()` as the Handling Middleware
// remember that `bindRequestHandler()` actually returns `processRequest()`, which will call `getAll()` as a callback
router.get('/', helloController.bindRequestHandler(helloController.getAll));

export { helloRouter };
```

And that's Controllers! We now have a maintainable, sensible, and simple-to-author Request Processing Application Layer.

We'll go on to implement the **Common Functionality** in the AbstractController to standardise the algorithmic approach for serving requests like "Get all of a given Entity" or "Get one of a given Entity" - creating a series of **Entity-agnostic** behaviors.

In summary:

- processRequest() is the actual Express Middleware passed to *all* Router Endpoint Configurations
- processRequest() may implement centralised all-request concerns like authentication, authorisation, etc
- processRequest() is bound so as to receive the Handler callback as its first parameter, which it may choose to execute or not execute
- Controllers are authored with methods which return values and throw errors in a framework-agnostic fashion
- Routers are authored on a per-Collection basis, and associaed hierarchically with one another so as to simplify the authorship of standardised and well-structured RESTful Endpoints
- One Controller exists per Route Collection


## ARCHITECTURE: Services

At this stage, we have a **Request Processing Layer** which helps us to write the Request Handling portion of the Application.

Next, we need a **Database Interaction Layer** which can interact with a Database.

Remembering that a `Controller` associates 1-to-1 with a `Route Collection`, it follows then that each `Controller` **intrinsically** associates with a single `Entity`. Consider Entities in an API like this as `Database Tables / Collections`.

By defining a `Service` which knows how to interact with the Database, we have the opportunity to define a full-stack solution to handling given Entities.

For example, for the Entity `Hello`:

- `HelloRouter`, defining the Routes associated with Hellos at the `/hello` collection
- `HelloController`, defining the Request Processing methods for `/hello` Endpoints
- `HelloService`, defining the Database Interactivity for the `Hello` Database Table / Collection

We may then solidify this architecture by ensuring that a Controller always has a Service by improving the `AbstractController`.

The following are code snippets describing a simplified example of the full potential implementation of the `Database Layer`, including a pointer on how we go about implementing the **Common Functionality** (Entity-agnostic) for both Services and Controllers:

**index.ts**
```typescript
// application
const app = express();

// json + cors middleware
app.use(json, cors);

// DATABASE CONNECTION HANDLER - connect to the database before serving the Request
app.use((req: Request, res: Response, next: NextFunction): void => {
    (databaseDriver).connect();
});

// System router - individual router configurations still use the (controller).bindRequestHandler() pattern
app.use(APIRouter);

// ...etc
```

**AbstractService**
```typescript
export abstract class AbstractService {

    // tableName
    public tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    // ...get(), update(), create() methods which use the Database Driver to implement DB interaction
    // these represent the Common Functionality (Entity-agnostic) of core Service behavior
    public get(req: Request): any {
        return (databaseDriver).get(this.tableName);
    }
}
```

**HelloService**
```typescript
class HelloService {
    constructor() {
        // pass the table name to the parent and store it
        super('hello');
    }

    // ...custom methods that may be associated only with Hellos
    // remember that the HelloService has generic get(), update(), etc from the parent class, defining the Common Functionality
}

// NOTE: export a singleton!
export const helloService = new HelloService();
```

**AbstractController**
```typescript
export abstract class AbstractController {

    // store a single Service we'll use for DB interaction
    public service: AbstractService;

    // retrieve the Service on construction
    constructor(service: AbstractService) {
        this.service = service;
    }

    // as before
    public bindRequestHandler() { } 

    // as before
    public processRequest() { } 

    // getAll(), getOne(), update(), create(), etc - standard abstract Request Handling methods which use `this.service`
    // these represent the Common Functionality (Entity-agnostic) of core Controller behavior
    public getAll(req: Request): any {
        return this.service.get();
    }
}
```

**HelloController**
```typescript
// we're gonna use the HelloService
import { helloService } from '../services/hello.service';

class HelloController extends AbstractController {

    constructor() {
        // pass the HelloService to the parent class to store it
        super(helloService);
    }

    // ...custom methods that may be associated only with Hellos
    // remember that the HelloController has generic get(), update(), etc from the parent class, defining the Common Functionality
}

// NOTE: export a singleton!
export const helloController = new HelloController();
```

Note that this example does not incorporate the concept of **Models**, for simplicity.

**Models** do not need their own section - they're simply `Interfaces` which describe the data structure of given `Entites` as stored in the Database. You may associate a `Model` directly with a `Service` and `Controller` so as to allow both to generically type-safe their data interaction and request processing behaviours.

What this structure gives us is effectively a **System of Vertical Slices** - where a **Slice** is defined as the **Request Processing** and **Database Interaction** components of the handling for a given **Rotue Collection/Entity**.

We also have room in the `Abstract` Classes to define the **Common Functionality** as a set of standardised algorithmic responses to *any* Route Collection's "get all", "get one", "update", "create", etc - thereby *dramatically* simplifying the authorship of these **Vertical Slices**. This is extra beneficial for `POST` and `PUT` as we have the ability in the Request Processing Layer to implement configurable and agnostic **Validation**.

In this Vertical Slice approach, we have the power to create an easy-to-author, standardised, expressive RESTful API with many Route Collections and Entities.


## ARCHITECTURE: Helpers

With this **Vertical Slice** setup associating Routes with Controllers with Services with Models, there is one more piece of the puzzle to give us the full flexibility to implement a scalable API.

I call this piece of a puzzle a **Helper**.

Simply, a **Helper** is a self-contained **Static Class** of functionality that may be **reused** for many Vertical Slices.

Helpers **do not** associate with a given Route Collection or Entity, so they're **transportable** between slices.

Helpers are useful for working with non-Database data representations, or performing common and repeatable tasks like error construction, etc.

The basic makeup of a Helper is as such. Note that there is no `AbstractHelper` as `static` methods may not be inherited:

```typescript
export class RandomHelper {

    // all methods are static
    public static getRandomNumber(max: number, min: number): number {
        return Math.random() * (max - min) + 1;
    }
}
```

This helper may then be used in the `HelloController` like such:

```typescript
import { RandomHelper } from '../helpers/random.helper';

class HelloController extends AbstractController {

    constructor() {
        super(helloService);
    }

    // custom handler for responding to a request like `/hello/random`
    public getRandomHello(): Hello {
        // get the number of Hellos by asking the Service to count the Database rows
        const numHellos = this.service.count();

        // generate a random number between 0 and the max hellos with the RandomHelper
        // this is representative of the Hello's ID
        const id = RandomHelper.getRandomNumber(0, numHellos);

        // return the randomly-selected Hello by asking the Service to retrieve it by ID
        return this.service.getOne(id);
    }
}
```

As seen, Helpers are useful for performing reusable functionality.

The ideal Helper does not do any Database interaction, however **they can if necessary**. If you think in the context of the **Controller + Service + Model Vertical Slice**, it follows that a Controller **may not** interact with multiple Database Tables/Collections so as to achieve its goals. To do so would be an **anti-pattern** in this architecture and in the worst case may create **Circular Dependencies**.

In cases where multi-table interaction is necessary or useful - for example, when working with a **Derived Model** which is not stored in the database and instead calculated as the product of multiple Database objects - a **Multi-Service Helper** may be created which utilises multiple `Services` to achieve that goal.

In this three-part example, we have a Route Collection `/whatever/` which is not backed by a Database Table, and therefore no Service.

By convention, a Multi-Service Helper should be named so as to match the derived data type it provides.

Note that the code is for demonstration only. If/when this use-case crops up, it would be sensible to split `AbstractController` into two pieces - one for generic request processing, and one for Entity-Service interactivty. This example forgoes this split for brevity.

**WhateverController**
```typescript
class WhateverController extends AbstractController {
    constructor() {
        // there is no Service
        super(null);
    }

    // the abstract methods get(), etc cannot be used - this is why we'd split the AbstractController

    // all this Controller's functionality is custom
    // handler for responding to a request like `/whatever/calculated`
    public getCalculatedData(req: Request): CalculatedData {
        // defer to the CalculatedDataHelper to retreive our CalculatedData based on the request body data
        // avoids the need for the Controller to refer to multiple Services
        return CalculatedDataHelper.calculateData(req.body.helloId, req.body.otherId);
    }
}
```

**CalculatedDataHelper**
```typescript
import { helloService } from '../services/hello.service';
import { otherService } from '../services/other.service';

// a Multi-Service Helper implementing Derived Data functionality for the derived model `CalculatedData`
export class CalculatedDataHelper {

    public static calculateData(helloId: number, otherId: number): CalculatedData {
        // retrieve the designated Hello and Other by deferring to their Services
        const hello = helloService.getOne(helloId);
        const other = otherService.getOne(otherId);

        // construct some data type that is a calculated merger of the two individual sources
        return {
            helloName: hello.name,
            otherName: other.name,
            product: hello.number + other.number
        };
    }
}
```

**WhateverRouter**
```typescript
// router serving the `/whatever` Route Collection
const whateverRouter = Router();

whateverRouter.post('/', whateverController.bindRequestHandler(whateverController.getCalculatedData));
```

As seen, **Helpers** complete the architectural needs of the API by providing for two use-cases:

- reusable non-database-interactive functionality that many Vertical Slices may want to use
- multiple-database-table-interactive functionality that may be useful for retrieving non-stored data or derived data types

In a sense, Helpers may be considered as a **Bridge between Vertical Slices**.


## Conclusion

Hopefully, at this stage, it is clear why it is beneficial to architect an API in this fashion.

Leveraging Express' **Application** and **Router** functionality, we define a concrete method of creating **Vertical Slices** which associate **Route Collections** with **Database Entities**.

We have the ability to define **Helpers** which perform simple reusable functionality for many **Slices**.

We have the architectural space to implement **Derived Data Collections** by way of implementing **Multi-Service Helpers**.

By incorporating an **AbstractController** which centralises the **Request Processing Logic**, providing a **single** method that will serve as the top-level Middleware of **all** Routes, we gain the ability to implement our API's **Business Logic** in an almost completely **framework-agnostic** way.

By incorporating an **AbstractService** which centralises the **Database Interaction Logic**, we gain the ability to implement our API's **Database Interaction** in an easily-upgradable way.

The combination of the standard **Router**, **Controller** and **Service** authorship approach allows us to define Entity-agnostic **Common Functionality** so as to abstractedly define and handle standard RESTful Entity interactions.

The bulk of the system's codebase is a series of Classes which are simple to author, strongly associated with one another, abstractable and cooperative.

The sum total is that producing a maintainable and scalable REST API becomes a reasonably trivial process not prone to simple flaws and mistakes.

In the project source, analogous structures are/will be found in:

- `src/controllers`
- `src/helpers`
- `src/models`
- `src/routes`
- `src/services`

... with the main Express configuration/system executable being found in `src/index.ts`.

Le fin.
