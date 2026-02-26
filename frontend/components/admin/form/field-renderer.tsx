"use client";
import {
  TextField,
  Autocomplete,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useIntl } from "react-intl";

import { useAppSelector } from "@/lib/store";
import { FormType, ModelType } from "@/lib/types";

import ImagesEditor from "./images-editor";

import type {
  FieldValue,
  FormField,
  ProductImage,
  Category,
} from "@/lib/types";

type FormFieldProps = {
  field: FormField;
  onChange: (value: FieldValue, key: string) => void;
};

export default function FieldRenderer({ field, onChange }: FormFieldProps) {
  const intl = useIntl();
  const placeholder = intl.formatMessage({ id: `form.label.${field.key}` });
  const categories = useAppSelector(
    (state) => state.admin[ModelType.category],
  ) as Category[];

  let options: string[] = [];

  if (
    field.key === ModelType.category &&
    field.type === FormType.AutoComplete
  ) {
    options = categories.map((c) => c.title);
  }
  switch (field.type) {
    case FormType.ImagesEditor:
      return (
        <ImagesEditor
          placeholder={placeholder}
          images={
            Array.isArray(field.value) ? (field.value as ProductImage[]) : []
          }
          onChange={(updatedImages) =>
            onChange(updatedImages as unknown as FieldValue, field.key)
          }
        />
      );

    case FormType.AutoComplete:
      return (
        <Autocomplete
          disablePortal
          options={options}
          value={field.value as string}
          onChange={(e, value) => onChange(value, field.key)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={placeholder}
              data-testid={`form-input-${field.key}`}
            />
          )}
        />
      );

    case FormType.Switch:
      return (
        <FormControlLabel
          control={
            <Switch
              data-testid={`form-input-${field.key}`}
              onChange={(e, value) => onChange(value, field.key)}
              checked={!!field.value as boolean}
            />
          }
          label={placeholder}
        />
      );

    case FormType.TEXT:
    case FormType.TEXTAREA:
    case FormType.NUMBER:
    default:
      return (
        <TextField
          fullWidth
          variant="outlined"
          label={intl.formatMessage({ id: `form.label.${field.key}` })}
          placeholder={placeholder}
          value={field.value}
          type={field.type === FormType.NUMBER ? "number" : "text"}
          multiline={field.type === FormType.TEXTAREA}
          rows={field.type === FormType.TEXTAREA ? 5 : undefined}
          onChange={(e) => onChange(e.target.value, field.key)}
          data-testid={`form-input-${field.key}`}
          sx={
            field.type === FormType.TEXTAREA
              ? {
                  "& .MuiInputBase-root": {
                    alignItems: "flex-start",
                    padding: 0,
                  },
                  "& textarea": {
                    maxHeight: "6rem",
                    overflowY: "auto",
                    padding: "0.75rem",
                    fontSize: "1rem",
                    lineHeight: 1.5,
                    resize: "none",
                    boxSizing: "border-box",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderWidth: "0.0625rem",
                  },
                }
              : undefined
          }
        />
      );
  }
}
