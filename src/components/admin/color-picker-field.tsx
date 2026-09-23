"use client";

import {
  FieldDescription,
  FieldError,
  FieldLabel,
  useField,
} from "@payloadcms/ui";
import { useTranslations } from "next-intl";

import type { TextFieldClientComponent } from "payload";

import { withProviders } from "@/components/admin";

import "./color-picker-field.scss";

const COLOR_PRESETS = [
  { key: "black", value: "#111827" },
  { key: "slate", value: "#475569" },
  { key: "white", value: "#FFFFFF" },
  { key: "red", value: "#EF4444" },
  { key: "orange", value: "#F97316" },
  { key: "amber", value: "#F59E0B" },
  { key: "yellow", value: "#EAB308" },
  { key: "lime", value: "#84CC16" },
  { key: "green", value: "#22C55E" },
  { key: "teal", value: "#14B8A6" },
  { key: "cyan", value: "#06B6D4" },
  { key: "blue", value: "#3B82F6" },
  { key: "indigo", value: "#6366F1" },
  { key: "purple", value: "#A855F7" },
  { key: "pink", value: "#EC4899" },
  { key: "brown", value: "#92400E" },
  { key: "beige", value: "#D6C7A1" },
  { key: "roseGold", value: "#B76E79" },
] as const;

const normalizeHexForPicker = (value: string) => {
  const trimmed = value.trim();
  if (/^#[\da-f]{6}$/i.test(trimmed)) return trimmed;
  if (/^#[\da-f]{3}$/i.test(trimmed)) {
    const [r, g, b] = trimmed.slice(1);
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return "#3B82F6";
};

const ColorPickerFieldInner: TextFieldClientComponent = ({
  field,
  path: pathFromProps,
  readOnly,
}) => {
  const t = useTranslations("admin.colorPicker");
  const {
    admin: { description, placeholder } = {},
    label,
    localized,
    required,
  } = field;
  const { disabled, path, setValue, showError, value } = useField<string>({
    potentiallyStalePath: pathFromProps,
  });
  const currentValue = typeof value === "string" ? value : "";
  const isReadOnly = Boolean(readOnly || disabled);
  const preview = currentValue.trim() || "transparent";
  const inputID = `field-${path.replace(/\./g, "__")}`;

  return (
    <div className="color-picker-field">
      <div className="color-picker-field__label-row">
        <FieldLabel
          htmlFor={inputID}
          label={label}
          localized={localized}
          path={path}
          required={required}
        />
        {currentValue ? (
          <span className="color-picker-field__current">{currentValue}</span>
        ) : null}
      </div>

      <div
        className="color-picker-field__presets"
        aria-label={t("presetsLabel")}
      >
        {COLOR_PRESETS.map((preset) => {
          const selected =
            currentValue.toLocaleLowerCase() === preset.value.toLowerCase();
          const presetLabel = t(`presets.${preset.key}`);

          return (
            <button
              key={preset.value}
              type="button"
              className="color-picker-field__preset"
              data-selected={selected || undefined}
              disabled={isReadOnly}
              title={presetLabel}
              aria-label={t("usePreset", { label: presetLabel })}
              aria-pressed={selected}
              onClick={() => setValue(preset.value)}
            >
              <span style={{ background: preset.value }} />
            </button>
          );
        })}
      </div>

      <div className="color-picker-field__controls">
        <label
          className="color-picker-field__native"
          title={t("openPicker")}
          style={{ background: preview }}
        >
          <input
            type="color"
            aria-label={t("customColorLabel")}
            disabled={isReadOnly}
            value={normalizeHexForPicker(currentValue)}
            onChange={(event) => setValue(event.target.value.toUpperCase())}
          />
        </label>

        <div className="color-picker-field__text-wrap">
          <FieldError path={path} showError={showError} />
          <input
            id={inputID}
            name={path}
            type="text"
            value={currentValue}
            disabled={isReadOnly}
            placeholder={
              typeof placeholder === "string" ? placeholder : "#3B82F6"
            }
            aria-label={t("colorValueLabel")}
            onChange={(event) => setValue(event.target.value)}
          />
        </div>

        {currentValue && !isReadOnly ? (
          <button
            type="button"
            className="color-picker-field__clear"
            onClick={() => setValue("")}
          >
            {t("clear")}
          </button>
        ) : null}
      </div>

      <FieldDescription description={description} path={path} />
    </div>
  );
};

export const ColorPickerField = withProviders(ColorPickerFieldInner);
