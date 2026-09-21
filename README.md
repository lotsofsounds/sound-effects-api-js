# Lots of Sounds JavaScript SDK

Lightweight, zero-runtime-dependency TypeScript client for the [Lots of Sounds sound effects API](https://www.lotsofsounds.com/docs). Use the free sound effects sample API without a key, or search and download the full CC0 catalog with an API key. A typed alternative for developers evaluating the Freesound API, AI agents, and MCP audio tools.

> Prepared for npm as `@lotsofsounds/sdk` version `0.1.0`; not published yet.

## Install

```bash
npm install github:lotsofsounds/js
```

## Free sample API (no key)

```ts
import { LotsOfSounds } from "@lotsofsounds/sdk";

const sounds = new LotsOfSounds();
const { data } = await sounds.listSamples({ q: "door knock", limit: 6 });
const preview = await sounds.streamSample(data[0].id);
console.log(preview.data.stream_url);
```

## Authenticated search and download

```ts
const sounds = new LotsOfSounds({ apiKey: process.env.LOS_API_KEY });
const { data } = await sounds.search({
  q: "gentle notification chime",
  category: "sfx",
  maxDuration: 2,
});
const sound = await sounds.get(data[0].id);
const download = await sounds.download(sound.data.id);
console.log(download.data.download_url);
```

Create a key from the [Lots of Sounds dashboard](https://www.lotsofsounds.com/dashboard/api-keys). Keep it server-side; do not expose it in browser bundles or public repositories.

## API

| Method | Auth | Endpoint |
| --- | --- | --- |
| `listSamples(options)` | None | `GET /api/v1/sounds/sample` |
| `streamSample(id)` | None | `GET /api/v1/sounds/sample/{id}/stream` |
| `search(options)` | `x-api-key` | `GET /api/v1/sounds` |
| `get(id)` | `x-api-key` | `GET /api/v1/sounds/{id}` |
| `download(id)` | `x-api-key` | `GET /api/v1/sounds/{id}/download` |

The client uses native `fetch` (Node.js 18+ and modern server runtimes), includes TypeScript declarations, and has no runtime dependencies. It returns the API JSON unchanged and throws `LotsOfSoundsError` for non-2xx responses. `download()` returns a temporary signed URL; this package does not store audio files.

## MCP for AI agents

Use the hosted Model Context Protocol server when an AI agent needs sound tools directly:

```text
https://api.lotsofsounds.com/mcp
```

See the [MCP setup guide](https://www.lotsofsounds.com/docs/mcp) for Claude, Cursor, ChatGPT, and other Streamable HTTP clients. `browse_samples` works without a key; full search and download tools require authenticated access.

## Development

```bash
npm install
npm test
```

Tests inject a mocked `fetch`, so CI does not call the live API.

## Links and license

- [API docs](https://www.lotsofsounds.com/docs)
- [MCP docs](https://www.lotsofsounds.com/docs/mcp)
- [Sign up / pricing](https://www.lotsofsounds.com/pricing)
- [Audio license](https://www.lotsofsounds.com/license)

SDK source is [MIT licensed](LICENSE). Audio returned by the API has separate Lots of Sounds license terms.
