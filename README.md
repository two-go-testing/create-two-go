# create-two-go

Scaffold a new [two-go](https://github.com/two-go-testing/two-go) API test project with a single command.

`two-go` is a zero-dependency fluent service and API testing library for Node. You build an HTTP request with a chainable API, attach checks, and `await` it.

## Usage

```bash
npm create two-go@latest my-app
```

You can also pass any other project name, or omit it to use the default `two-go-app`:

```bash
npm create two-go@latest
```

## What it generates

The command creates a new directory containing a ready-to-run two-go project:

```
my-app/
  package.json     # type: module, test script, two-go dependency
  api.test.mjs     # a sample API test using the two-go fluent API
  .gitignore       # ignores node_modules and log files
```

The generated `package.json` uses your chosen project name and depends on `two-go`.

## Running the generated tests

After scaffolding, install dependencies and run the test suite:

```bash
cd my-app
npm install
npm test
```

The sample test calls a public placeholder API and asserts on the response:

```js
import { test } from "node:test";
import { go } from "two-go";

test("GET /todos/1 returns a todo", async () => {
  await go("https://jsonplaceholder.typicode.com")
    .get("/todos/1")
    .expectStatus(200)
    .expectJson("id", 1);
});
```

## Requirements

- Node.js >= 18

## License

MIT
