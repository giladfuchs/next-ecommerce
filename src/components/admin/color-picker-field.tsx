"use client";

import {
  FieldDescription,
  FieldError,
  FieldLabel,
  useField,
} from "@payloadcms/ui";

import type { TextFieldClientComponent } from "payload";

import "./color-picker-field.scss";

const COLOR_PRESETS = [
  { label: "Black", value: "#111827" },
  { label: "Slate", value: "#475569" },
  { label: "White", value: "#FFFFFF" },
  { label: "Red", value: "#EF4444" },
  { label: "Orange", value: "#F97316" },
  { label: "Amber", value: "#F59E0B" },
  { label: "Yellow", value: "#EAB308" },
  { label: "Lime", value: "#84CC16" },
  { label: "Green", value: "#22C55E" },
  { label: "Teal", value: "#14B8A6" },
  { label: "Cyan", value: "#06B6D4" },
  { label: "Blue", value: "#3B82F6" },
  { label: "Indigo", value: "#6366F1" },
  { label: "Purple", value: "#A855F7" },
  { label: "Pink", value: "#EC4899" },
  { label: "Brown", value: "#92400E" },
  { label: "Beige", value: "#D6C7A1" },
  { label: "Rose gold", value: "#B76E79" },
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

export const ColorPickerField: TextFieldClientComponent = ({
  field,
  path: pathFromProps,
  readOnly,
}) => {
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

      <div className="color-picker-field__presets" aria-label="Color presets">
        {COLOR_PRESETS.map((preset) => {
          const selected =
            currentValue.toLocaleLowerCase() === preset.value.toLowerCase();

          return (
            <button
              key={preset.value}
              type="button"
              className="color-picker-field__preset"
              data-selected={selected || undefined}
              disabled={isReadOnly}
              title={preset.label}
              aria-label={`Use ${preset.label}`}
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
          title="Open color picker"
          style={{ background: preview }}
        >
          <input
            type="color"
            aria-label="Choose a custom color"
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
            aria-label="Color value"
            onChange={(event) => setValue(event.target.value)}
          />
        </div>

        {currentValue && !isReadOnly ? (
          <button
            type="button"
            className="color-picker-field__clear"
            onClick={() => setValue("")}
          >
            Clear
          </button>
        ) : null}
      </div>

      <FieldDescription description={description} path={path} />
    </div>
  );
};
