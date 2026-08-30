import appConfig from "@/lib/core/config";
import { getRevalidateTag } from "@/lib/core/util";

type FetchApiOptions = {
  tag?: string;
  tags?: string[];
  params?: Record<string, string | number | boolean | null | undefined>;
  select?: Record<string, true>;
  expect?: "docs" | "first" | "json";
  req?: Request;
};

export default class BaseApi {
  private static buildApiUrl(
    path: string,
    params?: Record<string, string | number | boolean | null | undefined>,
    select?: Record<string, true>,
  ) {
    const qs = new URLSearchParams();

    qs.set("pagination", "false");

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        qs.set(key, String(value));
      }
    }

    if (select) {
      for (const key of Object.keys(select)) {
        qs.set(`select[${key}]`, "true");
      }
    }

    if (!qs.has("limit")) {
      qs.set("limit", "100");
    }

    return `${appConfig.SERVER_URL}/api/${path}${qs.toString() ? `?${qs.toString()}` : ""}`;
  }

  private static async parseApiResponse<T>(
    res: Response,
    url: string,
    expect?: "docs" | "first" | "json",
  ): Promise<T> {
    if (!res.ok) {
      throw new Error(`fetchApi failed: ${res.status} ${url}`);
    }

    const json = await res.json();

    if (expect === "json") {
      return json as T;
    }

    if (expect === "first") {
      return (json.docs?.[0] ?? null) as T;
    }

    return (json.docs ?? []) as T;
  }

  static async fetchApi<T>(
    path: string,
    { tag, tags = [], params, select, expect, req }: FetchApiOptions = {},
  ): Promise<T> {
    const url = BaseApi.buildApiUrl(path, params, select);
    const cookie = req?.headers.get("cookie") ?? "";

    if (!tag && !tags.length) {
      const res = await fetch(url, {
        cache: "no-store",
        headers: cookie ? { cookie } : undefined,
      });

      return BaseApi.parseApiResponse<T>(res, url, expect);
    }

    const key = `${path}-${expect ?? "docs"}-${JSON.stringify(params ?? {})}-${JSON.stringify(select ?? {})}`;

    const res = await fetch(url, {
      cache: "force-cache",
      next: {
        tags: [tag, ...tags]
          .filter((value): value is string => Boolean(value))
          .map(getRevalidateTag),
      },
    });

    return BaseApi.parseApiResponse<T>(res, key, expect);
  }
}
