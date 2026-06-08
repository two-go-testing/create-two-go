import { test } from "node:test";
import { go } from "two-go";

test("GET /todos/1 returns a todo", async () => {
  await go("https://jsonplaceholder.typicode.com")
    .get("/todos/1")
    .expectStatus(200)
    .expectJson("id", 1);
});
