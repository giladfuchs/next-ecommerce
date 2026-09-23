import adminHe from "./admin.he.json";

import type { Block, Config, Field, Plugin } from "payload";

import appConfig from "@/lib/core/config";

type EntityLabels = {
  plural: string;
  singular: string;
};

type TranslationMap = Record<string, string>;
type EntityTranslationMap = Record<string, EntityLabels>;
type LocalizedText = { en: string; he: string };
type NavigationGroup = LocalizedText & { entities: string[] };
type TranslationObject = Record<string, unknown>;

const collections = adminHe.collections as EntityTranslationMap;
const blocks = adminHe.blocks as EntityTranslationMap;
const globals = adminHe.globals as TranslationMap;
const navigationGroups = Object.values(
  adminHe.navigationGroups,
) as NavigationGroup[];
const fields = adminHe.fields as TranslationMap;
const arrayLabels = adminHe.arrayLabels as EntityTranslationMap;
const tabs = adminHe.tabs as TranslationMap;
const labels = adminHe.labels as TranslationMap;
const options = adminHe.options as TranslationMap;
const groups = adminHe.groups as TranslationMap;
const breakpoints = adminHe.breakpoints as TranslationMap;
const descriptions = adminHe.descriptions as TranslationMap;

const isTranslationObject = (value: unknown): value is TranslationObject =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const mergeTranslations = (
  current: TranslationObject,
  additions: TranslationObject,
): TranslationObject => {
  const merged = { ...current };

  for (const [key, value] of Object.entries(additions)) {
    merged[key] =
      isTranslationObject(value) && isTranslationObject(merged[key])
        ? mergeTranslations(merged[key], value)
        : value;
  }

  return merged;
};

const applyNavigationGroups = (config: Config): void => {
  const groupByEntity = new Map<string, NavigationGroup>();
  const entityOrder = new Map<string, number>();
  let order = 0;

  for (const group of navigationGroups) {
    for (const entity of group.entities) {
      groupByEntity.set(entity, group);
      entityOrder.set(entity, order++);
    }
  }

  for (const collection of config.collections ?? []) {
    const group = groupByEntity.get(collection.slug);

    if (group) {
      collection.admin = {
        ...collection.admin,
        group: group[appConfig.LOCAL.lang],
      };
    }
  }

  config.collections = [...(config.collections ?? [])].sort((left, right) => {
    const leftOrder = entityOrder.get(left.slug) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = entityOrder.get(right.slug) ?? Number.MAX_SAFE_INTEGER;

    return leftOrder - rightOrder;
  });

  for (const global of config.globals ?? []) {
    const group = groupByEntity.get(global.slug);

    if (group) {
      global.admin = {
        ...global.admin,
        group: group[appConfig.LOCAL.lang],
      };
    }
  }
};

const translateLabel = (label: unknown, key?: string): string | undefined => {
  if (typeof label === "string" && labels[label]) {
    return labels[label];
  }

  return key ? fields[key] : undefined;
};

const translateDescription = (
  description: unknown,
): LocalizedText | undefined => {
  if (typeof description !== "string" || !descriptions[description]) {
    return undefined;
  }

  return {
    en: description,
    he: descriptions[description],
  };
};

const translateBlock = (block: Block): void => {
  const translation = blocks[block.slug];

  if (translation) {
    block.labels = translation;
  }

  if (typeof block.admin?.group === "string" && groups[block.admin.group]) {
    block.admin.group = groups[block.admin.group];
  }

  translateFields(block.fields);
};

const translateFields = (schemaFields: Field[]): void => {
  for (const field of schemaFields) {
    const localizableField = field as Field & {
      admin?: { description?: unknown };
      label?: unknown;
    };
    const fieldName =
      "name" in field && typeof field.name === "string"
        ? field.name
        : undefined;
    const translatedLabel = translateLabel(localizableField.label, fieldName);

    if (
      localizableField.label !== false &&
      typeof localizableField.label !== "function" &&
      translatedLabel
    ) {
      localizableField.label = translatedLabel;
    }

    if (fieldName && "labels" in field && arrayLabels[fieldName]) {
      field.labels = arrayLabels[fieldName];
    }

    if (localizableField.admin) {
      const translatedDescription = translateDescription(
        localizableField.admin.description,
      );

      if (translatedDescription) {
        localizableField.admin.description = translatedDescription;
      }
    }

    if ("options" in field && Array.isArray(field.options)) {
      for (const option of field.options) {
        if (
          typeof option === "object" &&
          option !== null &&
          typeof option.value === "string" &&
          typeof option.label !== "function" &&
          options[option.value]
        ) {
          option.label = options[option.value];
        }
      }
    }

    if (field.type === "tabs") {
      for (const tab of field.tabs) {
        const tabName =
          "name" in tab && typeof tab.name === "string" ? tab.name : undefined;
        const translatedTabLabel =
          translateLabel(tab.label) ?? (tabName ? tabs[tabName] : undefined);

        if (translatedTabLabel && typeof tab.label !== "function") {
          tab.label = translatedTabLabel;
        }

        translateFields(tab.fields);
      }
    } else if ("fields" in field && Array.isArray(field.fields)) {
      translateFields(field.fields);
    }

    if (field.type === "blocks") {
      for (const block of field.blocks) {
        translateBlock(block);
      }

      for (const block of field.blockReferences ?? []) {
        if (typeof block !== "string") {
          translateBlock(block);
        }
      }
    }
  }
};

const mergeHebrewI18n = (config: Config): void => {
  const currentTranslations = config.i18n?.translations ?? {};
  const currentHebrew = (currentTranslations.he ?? {}) as TranslationObject;

  config.i18n = {
    ...config.i18n,
    translations: {
      ...currentTranslations,
      he: mergeTranslations(currentHebrew, adminHe.i18n as TranslationObject),
    },
  };
};

export const adminTranslationsPlugin: Plugin = (config) => {
  applyNavigationGroups(config);

  if (appConfig.LOCAL.lang !== "he") {
    return config;
  }

  mergeHebrewI18n(config);

  for (const collection of config.collections ?? []) {
    const translation = collections[collection.slug];

    if (translation) {
      collection.labels = translation;
    }

    if (
      typeof collection.admin?.group === "string" &&
      groups[collection.admin.group]
    ) {
      collection.admin.group = groups[collection.admin.group];
    }

    const translatedDescription = translateDescription(
      collection.admin?.description,
    );

    if (translatedDescription && collection.admin) {
      collection.admin.description = translatedDescription;
    }

    translateFields(collection.fields);
  }

  for (const global of config.globals ?? []) {
    if (globals[global.slug]) {
      global.label = globals[global.slug];
    }

    if (typeof global.admin?.group === "string" && groups[global.admin.group]) {
      global.admin.group = groups[global.admin.group];
    }

    translateFields(global.fields);
  }

  for (const block of config.blocks ?? []) {
    translateBlock(block);
  }

  for (const breakpoint of config.admin?.livePreview?.breakpoints ?? []) {
    if (breakpoints[breakpoint.name]) {
      breakpoint.label = breakpoints[breakpoint.name];
    }
  }

  return config;
};

adminTranslationsPlugin.order = 100;
