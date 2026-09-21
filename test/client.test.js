import assert from "node:assert/strict";
import test from "node:test";

import { LotsOfSounds, buildUrl } from "../dist/index.js";

test("buildUrl encodes search parameters", () => {
  const url = buildUrl("https://api.example/", "/api/v1/sounds", {
    q: "door knock",
    tags: ["wood", "room"],
  });
  assert.equal(
    url.toString(),
    "https://api.example/api/v1/sounds?q=door+knock&tags=wood%2Croom",
  );
});

test("authenticated methods send x-api-key", async () => {
  let request;
  const fetch = async (url, init) => {
    request = { url, init };
    return new Response('{"data":[],"pagination":{}}');
  };
  const client = new LotsOfSounds({
    apiKey: "los_test",
    baseUrl: "https://api.example",
    fetch,
  });

  await client.search({ q: "rain" });

  assert.equal(request.url.toString(), "https://api.example/api/v1/sounds?q=rain");
  assert.equal(new Headers(request.init.headers).get("x-api-key"), "los_test");
});

test("sample methods do not leak an API key", async () => {
  let headers;
  const fetch = async (_url, init) => {
    headers = new Headers(init.headers);
    return new Response('{"data":[],"pagination":{},"meta":{}}');
  };
  const client = new LotsOfSounds({ apiKey: "los_test", fetch });

  await client.listSamples({ limit: 6 });

  assert.equal(headers.has("x-api-key"), false);
});
