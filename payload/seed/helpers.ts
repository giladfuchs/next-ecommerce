export type SeedIds = {
  mediaIds: number[];
  categoryIds: number[];
  variantTypeIds: Record<string, number>;
  variantOptionIds: Record<string, number[]>;
};
export function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function randFloat(min: number, max: number, decimals = 2) {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}
export function getRandom(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}
export function getRandomSlice(arr: any[], min = 1, max = 5) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  return shuffled.slice(0, count);
}
export function makeRichTextDescription(text: string) {
  const sentences = text
    .split(". ")
    .map((s, i, arr) => (i < arr.length - 1 ? s + "." : s))
    .filter(Boolean);

  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      children: sentences.map((sentence) => ({
        type: "paragraph",
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            mode: "normal",
            text: sentence,
            type: "text",
            style: "",
            detail: 0,
            format: 0,
            version: 1,
          },
        ],
        direction: null,
        textStyle: "",
        textFormat: 0,
      })),
      direction: null,
    },
  };
}
