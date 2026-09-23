export type SeedIds = {
  seoMediaIds: number[];
  galleryMediaIds: number[];
  categoryIds: number[];
  // SEO media grouped by vendor, used for category cards and metadata.
  seoMediaIdsByVendor: Record<string, number[]>;
  // category id keyed by vendor, so products can find their category via product.vendor
  categoryIdsByVendor: Record<string, number>;
  // SEO/card image and gallery uploads, in the same order as mockData.products.
  productSeoMediaIds: number[];
  productGalleryMediaIds: number[][];
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

export function shuffle(array: any[]) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getRandomSlice(arr: any[], min = 1, max = 5) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  return shuffled.slice(0, count);
}

export function cartesianProduct<T>(groups: T[][]): T[][] {
  return groups.reduce<T[][]>(
    (combinations, group) =>
      combinations.flatMap((combination) =>
        group.map((item) => [...combination, item]),
      ),
    [[]],
  );
}

type RichTextNode = {
  type: string;
  version: number;
  [key: string]: unknown;
};

const makeTextNode = (text: string): RichTextNode => ({
  type: "text",
  detail: 0,
  format: 0,
  mode: "normal",
  style: "",
  text,
  version: 1,
});

const makeParagraph = (children: RichTextNode[]): RichTextNode => ({
  type: "paragraph",
  children,
  direction: "rtl",
  format: "",
  indent: 0,
  textFormat: 0,
  textStyle: "",
  version: 1,
});

const makeList = (items: RichTextNode[][]): RichTextNode => ({
  type: "list",
  children: items.map((children, index) => ({
    type: "listitem",
    children,
    direction: "rtl",
    format: "",
    indent: 0,
    value: index + 1,
    version: 1,
  })),
  direction: "rtl",
  format: "",
  indent: 0,
  listType: "bullet",
  start: 1,
  tag: "ul",
  version: 1,
});

const makeRichText = (children: RichTextNode[]) => ({
  root: {
    type: "root",
    children,
    direction: "rtl" as const,
    format: "" as const,
    indent: 0,
    version: 1,
  },
});

// Start a new line with "- " in mock descriptions to create a bullet item.
export function makeRichTextDescription(text: string) {
  const children: RichTextNode[] = [];
  let listItems: RichTextNode[][] = [];

  const flushList = () => {
    if (!listItems.length) return;
    children.push(makeList(listItems));
    listItems = [];
  };

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("- ")) {
      listItems.push([makeTextNode(line.slice(2).trim())]);
      continue;
    }

    flushList();

    const sentences = line
      .split(". ")
      .map((sentence, index, all) =>
        index < all.length - 1 ? `${sentence}.` : sentence,
      )
      .filter(Boolean);

    for (const sentence of sentences) {
      children.push(makeParagraph([makeTextNode(sentence)]));
    }
  }

  flushList();
  return makeRichText(children);
}

// מה מכיל החנות
// חנות אונליין מלאה: תשלום, איסוף עצמי, SEO, אנליטיקס והתראות — ללא עלות שרתים.
