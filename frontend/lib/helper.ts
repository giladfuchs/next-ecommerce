import type { FieldValue } from "@/lib/types";

export function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function getDecodedHandle(
  paramsPromise: Promise<{ handle: string }>,
) {
  const { handle } = await paramsPromise;
  return safeDecodeURIComponent(handle);
}

export const getStaticHandleParams = (list: { handle: string }[]) =>
  list.map((item) => ({ handle: item.handle }));

export function filterBySearch<T extends object>(
  items: T[],
  searchValue: string,
): T[] {
  if (!searchValue) return items;

  const escaped = searchValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");

  return items.filter((item) =>
    regex.test(
      Object.values(item)
        .filter((v) => typeof v === "string")
        .join(" "),
    ),
  );
}
export const extract_missing_field = (message: string): string | null => {
  const match = message.match(/Missing required field: (\w+)/i);
  return match?.[1]?.toLowerCase() || null;
};

export function array_obj_to_obj_with_key<
  T extends Record<string, unknown>,
  K extends keyof T,
>(iterable: T[], value: unknown, key: K): T | undefined {
  return iterable.find((o) => o[key]?.toString() === value?.toString());
}
export function create_key_to_value_map<T extends Record<string, unknown>>(
  items: T[],
  key_field: keyof T,
  value_field: keyof T,
): Record<string | number, FieldValue> {
  return items.reduce(
    (acc, curr) => {
      const key = curr[key_field];
      const value = curr[value_field];

      if (typeof key === "string" || typeof key === "number") {
        acc[key] = value as FieldValue;
      }

      return acc;
    },
    {} as Record<string | number, FieldValue>,
  );
}
export const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i] as T;
    result[i] = result[j] as T;
    result[j] = temp;
  }
  return result;
};
