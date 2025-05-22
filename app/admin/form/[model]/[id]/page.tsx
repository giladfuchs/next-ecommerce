"use client";

import { Container, Typography } from "@mui/material";
import FormChild from "../../../../../components/admin/form/FormChild";
import {
  array_obj_to_obj_with_key,
  create_form_fields,
  FormField,
  get_form_by_model,
  ModelType,
  Image,
  AGTableModelType,
} from "../../../../../lib/types";
import { useEffect, useState } from "react";
import {
  getCategories,
  getProducts,
  submitModel,
} from "../../../../../lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FormattedMessage, useIntl } from "react-intl";

export default function FormPage({
  params,
}: {
  params: { model: ModelType; id: string };
}) {
  const router = useRouter();
  const intl = useIntl();

  const { model, id } = params;
  const [list, setList] = useState<Record<string, any[]>>({
    products: [],
    categories: [],
  });
  const [fields, setFields] = useState<FormField[]>([]);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const is_add = id === "add";

  useEffect(() => {
    const init = async () => {
      const products = await getProducts();
      const categories = await getCategories();
      setList({ products, categories });

      const model_objs = model === ModelType.product ? products : categories;
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
    const data = Object.fromEntries(
      send_fields.map((f) => {
        let value = f.value;

        if (typeof value === "string") {
          value = value.trim();
          if (value === "") return [f.key, null];
        }

        if (f.type === "number" && typeof value === "string") {
          const num = parseFloat(value);
          return [f.key, isNaN(num) ? null : num];
        }

        return [f.key, value];
      }),
    );
    if (model === ModelType.product) {
      const images: Image[] = Array.isArray(data.images) ? data.images : [];

      const filteredImages = images
        .map((img) => ({
          url: (img.url ?? "").trim(),
          altText: (img.altText ?? "").trim(),
        }))
        .filter((img) => img.url !== "" || img.altText !== "");

      const hasInvalidImage = filteredImages.some(
        (img) => img.url === "" || img.altText === "",
      );

      if (filteredImages.length === 0) {
        setFieldError("form.error.required.images");
        return;
      }

      if (hasInvalidImage) {
        setFieldError("form.error.required.imageFields");
        return;
      }
      data.images = filteredImages;

      if (!data.category) {
        setFieldError("form.error.required.category_id");
        return;
      }
      const category = array_obj_to_obj_with_key(
        list.categories ?? [],
        data.category,
        "title",
      );
      data.category_id = category?.id;
      delete data.category;
    }

    setFieldError(null);

    try {
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
