const DEFAULT_BASE_URL = "https://api.lotsofsounds.com";

export interface Sound {
  id: string;
  name: string;
  description?: string | null;
  tags: string[];
  duration: number;
  stream_url: string;
  download_url?: string;
  category?: "SFX" | "MUSIC" | "LOFI" | "AMBIENT" | null;
  license?: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListSamplesOptions {
  q?: string;
  tags?: string[];
  limit?: number;
}

export interface SearchOptions extends ListSamplesOptions {
  category?: "sfx" | "music" | "lofi" | "ambient";
  minDuration?: number;
  maxDuration?: number;
  sort?: "created_at" | "duration" | "name";
  order?: "asc" | "desc";
  page?: number;
}

export interface LotsOfSoundsOptions {
  apiKey?: string | undefined;
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
}

export class LotsOfSoundsError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message);
    this.name = "LotsOfSoundsError";
  }
}

export class LotsOfSounds {
  readonly #apiKey: string | undefined;
  readonly #baseUrl: string;
  readonly #fetch: typeof globalThis.fetch;

  constructor(options: LotsOfSoundsOptions = {}) {
    this.#apiKey = options.apiKey;
    this.#baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.#fetch = options.fetch ?? globalThis.fetch;

    if (!this.#fetch) {
      throw new Error("A Fetch API implementation is required.");
    }
  }

  listSamples(options: ListSamplesOptions = {}) {
    return this.#get<{
      data: Sound[];
      pagination: Pagination;
      meta: { message?: string; upgrade_url?: string };
    }>("/api/v1/sounds/sample", sampleQuery(options));
  }

  streamSample(id: string) {
    return this.#get<StreamResponse>(
      `/api/v1/sounds/sample/${encodeURIComponent(id)}/stream`,
    );
  }

  search(options: SearchOptions = {}) {
    return this.#get<{ data: Sound[]; pagination: Pagination }>(
      "/api/v1/sounds",
      {
        ...sampleQuery(options),
        category: options.category,
        min_duration: options.minDuration,
        max_duration: options.maxDuration,
        sort: options.sort,
        order: options.order,
        page: options.page,
      },
      true,
    );
  }

  get(id: string) {
    return this.#get<{ data: Sound }>(
      `/api/v1/sounds/${encodeURIComponent(id)}`,
      {},
      true,
    );
  }

  download(id: string) {
    return this.#get<{
      data: {
        id: string;
        name: string;
        download_url: string;
        expires_in: number;
      };
    }>(`/api/v1/sounds/${encodeURIComponent(id)}/download`, {}, true);
  }

  async #get<T>(path: string, query: Query = {}, authenticated = false) {
    if (authenticated && !this.#apiKey) {
      throw new Error("This method requires a Lots of Sounds API key.");
    }

    const headers = new Headers({ accept: "application/json" });
    if (authenticated) headers.set("x-api-key", this.#apiKey!);

    const response = await this.#fetch(buildUrl(this.#baseUrl, path, query), {
      headers,
    });
    const body: unknown = await response.json();

    if (!response.ok) {
      const message =
        isApiError(body) ? body.error : `Request failed with HTTP ${response.status}`;
      throw new LotsOfSoundsError(message, response.status, body);
    }

    return body as T;
  }
}

export interface StreamResponse {
  data: { id: string; name: string; stream_url: string };
}

type Query = Record<string, string | number | string[] | undefined>;

export function buildUrl(baseUrl: string, path: string, query: Query = {}) {
  const url = new URL(path, `${baseUrl.replace(/\/+$/, "")}/`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      url.searchParams.set(key, Array.isArray(value) ? value.join(",") : `${value}`);
    }
  }
  return url;
}

function sampleQuery(options: ListSamplesOptions): Query {
  return { q: options.q, tags: options.tags, limit: options.limit };
}

function isApiError(body: unknown): body is { error: string } {
  return (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
  );
}
