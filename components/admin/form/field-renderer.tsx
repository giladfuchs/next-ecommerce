"use client";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import {
  TextField,
  Autocomplete,
  FormControlLabel,
  Switch,
} from "@mui/material";

import ImagesEditor from "./images-editor";
import { FormField, FormType, ProductImage, ModelType } from "lib/types";
import { getCategories } from "lib/api";

type FormFieldProps = {
  field: FormField;
  onChange: (value: any, key: string) => void;
};

export default function FieldRenderer({ field, onChange }: FormFieldProps) {
  const intl = useIntl();
  const placeholder = intl.formatMessage({ id: `form.label.${field.key}` });
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      if (
        field.type === FormType.AutoComplete &&
        field.key === ModelType.category
      ) {
        const categories = (await getCategories()).map((c) => c.title);
        setOptions(categories);
      }
    };
    void loadOptions();
  }, [field]);

  switch (field.type) {
    case FormType.ImagesEditor:
      return (
        <ImagesEditor
          placeholder={placeholder}
          images={
            Array.isArray(field.value) ? (field.value as ProductImage[]) : []
          }
          onChange={(updatedImages) => onChange(updatedImages, field.key)}
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
