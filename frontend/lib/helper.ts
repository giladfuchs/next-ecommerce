export function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
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
