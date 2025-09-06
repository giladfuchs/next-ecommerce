export function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export const getStaticHandleParams = (list: { handle: string }[]) =>
  list.map((item) => ({ handle: item.handle }));

export async function getDecodedHandle(
  paramsPromise: Promise<{ handle: string }>,
) {
  const { handle } = await paramsPromise;
  return safeDecodeURIComponent(handle);
}

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

export const array_obj_to_obj_with_key = (
  iterable: any[],
  value: any,
  key: string,
) => iterable.find((o: any) => o[key]?.toString() === value.toString());

export const create_key_to_value_map = (
  items: any[],
  key_field: string,
  value_field: string,
): Record<string | number, any> => {
  return items.reduce(
    (acc, curr) => {
      const key = curr[key_field];
      const value = curr[value_field];
      if (typeof key === "string" || typeof key === "number") {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string | number, any>,
  );
};

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
