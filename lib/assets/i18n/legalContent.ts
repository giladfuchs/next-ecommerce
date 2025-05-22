export const legalContent: Record<
  "terms" | "accessibility",
  {
    sections: {
      title: string;
      paragraphs?: string[];
      list?: string[];
      contact?: string;
    }[];
  }
> = {
  accessibility: {
    sections: [
      {
        title: "terms.accessibility.pickupTitle",
        paragraphs: ["terms.accessibility.pickup"],
      },
      {
        title: "terms.accessibility.title",
        paragraphs: ["terms.accessibility.intro"],
        list: [
          "accessibility.zoomIn",
          "accessibility.zoomOut",
          "accessibility.grayscale",
          "accessibility.contrast",
          "accessibility.invert",
          "accessibility.underline",
          "accessibility.readableFont",
        ],
        contact: "terms.accessibility.contact",
      },
    ],
  },
  terms: {
    sections: [
      {
        title: "terms.title",
        paragraphs: ["terms.intro"],
      },
      {
        title: "terms.section.exchanges",
        paragraphs: ["terms.exchanges"],
      },
      {
        title: "terms.section.privacy",
        paragraphs: ["terms.privacy"],
      },
      {
        title: "terms.section.contact",
        contact: "terms.contact",
      },
    ],
  },
};
