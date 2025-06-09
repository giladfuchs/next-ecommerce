"use client";
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import { Grid, Button, Typography } from "@mui/material";
import FieldRenderer from "./field-renderer";
import { FormField } from "lib/types";

interface DynamicFormProps {
  title: string;
  fields: FormField[];
  onSubmit: (send_fields: FormField[]) => void;
}

export default function DynamicForm({
  title,
  fields,
  onSubmit,
}: DynamicFormProps) {
  const [localFields, setLocalFields] = useState<FormField[]>(fields);

  const handleChange = (value: any, key: string) => {
    const updatedFields = localFields.map((field) =>
      field.key === key ? { ...field, value } : field,
    );
    setLocalFields(updatedFields);
  };

  return (
    <Grid
      container
      justifyContent="center"
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(localFields);
      }}
    >
      <Grid item xs={12} sm={10} md={6} lg={4}>
        <Typography
          data-testid="form-title"
          variant="h4"
          textAlign="center"
          fontWeight="bold"
          mb={2}
        >
          <FormattedMessage id={title} />
        </Typography>

        <Grid container direction="column" spacing={3}>
          {localFields.map((field) => (
            <Grid item key={field.key}>
              <FieldRenderer field={field} onChange={handleChange} />
            </Grid>
          ))}

          <Grid item display="flex" justifyContent="center">
            <Button
              type="submit"
              data-testid="form-submit-button"
              variant="contained"
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
