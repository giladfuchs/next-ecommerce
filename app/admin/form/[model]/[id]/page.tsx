"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { toast } from "sonner";
import { Container, Typography } from "@mui/material";

import FormChild from "components/admin/form/FormChild";
import {
  AGTableModelType,
  array_obj_to_obj_with_key,
  create_form_fields,
  form_fields_to_data,
  FormField,
  get_form_by_model,
  ModelType,
} from "lib/types";
import { cache, getCategories, getProducts, submitModel } from "lib/api";

export default function FormPage({
  params,
}: {
  params: { model: ModelType; id: string };
}) {
  const router = useRouter();
  const intl = useIntl();

  const { model, id } = params;
  const [fields, setFields] = useState<FormField[]>([]);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const is_add = id === "add";

  useEffect(() => {
    const init = async () => {
      const model_objs =
        model === ModelType.product
          ? await getProducts()
          : await getCategories();
      const obj = is_add
        ? {}
        : (array_obj_to_obj_with_key(model_objs, Number(id), "id") ?? {});
      const fields_to_set = create_form_fields(get_form_by_model(model), obj);
      setFields(fields_to_set);
    };

    void init();
  }, [model, id, is_add]);

  const title = is_add ? `form.add.${model}` : `form.edit.${model}`;

  const handleSubmit = async (send_fields: FormField[]) => {
    try {
      const data = form_fields_to_data(send_fields);

      if (model === ModelType.product) {
        if (!data.category) {
          throw "form.error.required.category_id";
        }

        const category = array_obj_to_obj_with_key(
          cache.getByModel(ModelType.category) ?? [],
          data.category,
          "title",
        );

        data.category_id = category?.id;
        delete data.category;
      }

      setFieldError(null);

      const result: AGTableModelType = (await submitModel(
        model,
        id,
        data,
      )) as AGTableModelType;

      toast.success(intl.formatMessage({ id: "form.success" }), {
        description: `ID: ${result.id}`,
      });

      router.push(`/admin/${model}`);
    } catch (err: any) {
      if (typeof err === "string") {
        setFieldError(err);
        return;
      }

      const rawMessage = err?.message || "Unknown error";
      const match = rawMessage.match(/Missing required field: (\w+)/i);
      const fieldKey = match?.[1]?.toLowerCase();

      const intlId = `form.error.required.${fieldKey}`;
      setFieldError(intlId);

      toast.error(intl.formatMessage({ id: "form.error" }), {
        description: rawMessage,
      });

      console.error("❌ Failed to submit:", err);
    }
  };

  return (
    <Container
      maxWidth="lg"
      disableGutters
      sx={{ py: 4, px: 2, overflowX: "hidden" }}
    >
      {fields.length > 0 && (
        <>
          <FormChild title={title} fields={fields} onSubmit={handleSubmit} />
          {fieldError && (
            <Typography
              data-testid={`form-error-message-${fieldError}`}
              color="error"
              textAlign="center"
              mt={4}
              fontWeight="bold"
              fontSize="2em"
            >
              <FormattedMessage id={fieldError} />
            </Typography>
          )}
        </>
      )}
    </Container>
  );
}
