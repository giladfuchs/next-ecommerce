"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, use } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIntl } from "react-intl";
import { toast } from "sonner";
import { Container } from "@mui/material";
import {
  fetchRowsByModel,
  RootState,
  selectCategoryTitleToIdMap,
} from "@/lib/store";
import DynamicForm from "@/components/admin/form";
import { FormFieldError } from "@/components/shared/messages";
import {
  AGTableModelType,
  create_form_fields,
  form_fields_to_data,
  FormField,
  get_form_by_model,
  ModelType,
  transform_data_to_body,
} from "@/lib/types";
import { submitModel } from "@/lib/api";
import {
  array_obj_to_obj_with_key,
  create_key_to_value_map,
  extract_missing_field,
} from "@/lib/helper";

export default function FormPage({
  params,
}: {
  params: Promise<{ model: ModelType; id: string }>;
}) {
  const { model, id } = use(params);
  const router = useRouter();
  const intl = useIntl();
  const dispatch: any = useDispatch();

  const [fields, setFields] = useState<FormField[]>([]);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const data: AGTableModelType[] = useSelector(
    (state: RootState) => state.admin[model],
  ) as AGTableModelType[];

  const isAdd = id === "add";

  const loadData = useCallback(() => {
    const obj = isAdd
      ? {}
      : (array_obj_to_obj_with_key(data, Number(id), "id") ?? {});

    const fields_to_set = create_form_fields(get_form_by_model(model), obj);
    setFields(fields_to_set);
  }, [data, model, id, isAdd]);

  useEffect(() => {
    void loadData();
    dispatch(fetchRowsByModel({ model }));
  }, []);

  const categoryTitleToIdMap: Record<string, number> = useSelector(
    selectCategoryTitleToIdMap,
  );
  const handleSubmit = async (send_fields: FormField[]) => {
    setFieldError(null);
    try {
      const data = form_fields_to_data(send_fields);

      const body = transform_data_to_body(model, data, categoryTitleToIdMap);

      const result: AGTableModelType = (await submitModel(
        model,
        id,
        body,
      )) as AGTableModelType;

      toast.success(intl.formatMessage({ id: "form.success" }), {
        description: `ID: ${result.id}`,
      });

      router.push(`/admin/${model}`);
    } catch (err: any) {
      let intlId = typeof err === "string" ? err : "form.error";

      if (typeof err !== "string") {
        const rawMessage = err?.message || "Unknown error";
        const fieldKey = extract_missing_field(rawMessage);
        intlId = fieldKey ? `form.error.required.${fieldKey}` : "form.error";
        console.error("❌ Failed to submit:", err);
      }

      setFieldError(intlId);
      toast.error(intl.formatMessage({ id: "form.error" }), {
        description: intl.formatMessage({ id: intlId }),
      });
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
          <DynamicForm
            title={isAdd ? `form.add.${model}` : `form.edit.${model}`}
            fields={fields}
            onSubmit={handleSubmit}
          />
          {fieldError && <FormFieldError fieldError={fieldError} />}
        </>
      )}
    </Container>
  );
}
