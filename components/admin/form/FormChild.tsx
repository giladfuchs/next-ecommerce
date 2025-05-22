"use client";

import React, { useEffect, useState } from "react";
import {
  Grid,
  Button,
  TextField,
  Autocomplete,
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { FormField, FormType, Image, ModelType } from "../../../lib/types";
import ImagesEditor from "./ImagesEditor";
import { getCategories } from "../../../lib/api";
import { FormattedMessage, useIntl } from "react-intl";

type FormFieldProps = {
  field: FormField;
  onChange: (value: any, key: string) => void;
};

export const FieldRenderer = ({ field, onChange }: FormFieldProps) => {
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
    loadOptions();
  }, [field]);

  switch (field.type) {
    case FormType.ImagesEditor:
      return (
        <ImagesEditor
          placeholder={placeholder}
          images={Array.isArray(field.value) ? (field.value as Image[]) : []}
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
                              borderWidth: "0.0625rem"
                          },
                      }
                      : undefined
              }
          />
      );
  }
};

interface FormChildProps {
  title: string;
  fields: FormField[];
  onSubmit: (send_fields: FormField[]) => void;
}

export default function FormChild({ title, fields, onSubmit }: FormChildProps) {
  const [localFields, setLocalFields] = useState<FormField[]>(fields);
  const intl = useIntl();

  const handleChange = (value: any, key: string) => {
    const updatedFields = localFields.map((field) =>
      field.key === key ? { ...field, value } : field,
    );
    setLocalFields(updatedFields);
  };

  const handleSubmit = () => {
    onSubmit(localFields);
  };

  return (
    <Grid container justifyContent="center">
      <Grid item xs={12} sm={10} md={6} lg={4}>
        <Typography
          data-testid="form-title"
          variant="h4"
          textAlign="center"
          fontWeight="bold"
          mb={2}
        >
          {intl.formatMessage({ id: title })}
        </Typography>

        <Grid container direction="column" spacing={3}>
          {localFields.map((field) => (
            <Grid item key={field.key}>
              <FieldRenderer field={field} onChange={handleChange} />
            </Grid>
          ))}

          <Grid item display="flex" justifyContent="center">
            <Button
              data-testid="form-submit-button"
              variant="contained"
              onClick={handleSubmit}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: "bold",
                backgroundColor: "var(--color-accent)",
                "&:hover": {
                  backgroundColor: "var(--color-accent)",
                  opacity: 0.9,
                },
              }}
            >
              <FormattedMessage id="form.button.submit" />
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
