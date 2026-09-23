"use client";

import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { FormConfig, FormFieldConfig } from "@/lib/core/types/form";
import type {
  FieldPathValue,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";

import { Button, Input, Message, Rating } from "@/components/ui";
import Label from "@/components/ui/label";
import { cn } from "@/lib/core/util";

type GenericFormProps<T extends FieldValues, Result> = {
  config: FormConfig<T>;
  onSubmit: (data: T) => Promise<Result>;
  onSuccess?: (result: Result) => Promise<void> | void;
  onCancel?: () => void;
  disabled?: boolean;
  /** Extra content rendered inside the <form>, after the fields and before the actions. */
  children?: ReactNode;
};

export default function GenericForm<T extends FieldValues, Result = void>({
  config,
  onSubmit,
  onSuccess,
  onCancel,
  disabled,
  children,
}: GenericFormProps<T, Result>) {
  const {
    translationNamespace,
    fields,
    defaultValues,
    successMessageKey,
    fallbackErrorMessageKey,
    className,
    fieldsClassName,
    actionsClassName,
    errorClassName,
    cancel,
    submit,
  } = config;
  const t = useTranslations(translationNamespace);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<T>({
    mode: "onChange",
    defaultValues,
    delayError: 800,
  });
  const { formState, handleSubmit, register } = form;
  const { isSubmitting, isValid } = formState;

  const translate = (key: string, values?: Record<string, number | string>) =>
    t(key as never, values as never);

  const getRules = (field: FormFieldConfig<T>): RegisterOptions<T, Path<T>> => {
    const validation = field.validation;
    if (!validation) return {};

    return {
      ...(validation.requiredKey
        ? { required: translate(validation.requiredKey) }
        : {}),
      ...(validation.pattern
        ? {
            pattern: {
              value: validation.pattern.value,
              message: translate(validation.pattern.messageKey),
            },
          }
        : {}),
      ...(validation.minLength
        ? {
            minLength: {
              value: validation.minLength.value,
              message: translate(validation.minLength.messageKey, {
                field: translate(field.labelKey),
                min: validation.minLength.value,
              }),
            },
          }
        : {}),
      ...(validation.maxLength
        ? {
            maxLength: {
              value: validation.maxLength.value,
              message: translate(validation.maxLength.messageKey, {
                field: translate(field.labelKey),
                max: validation.maxLength.value,
              }),
            },
          }
        : {}),
    };
  };

  const submitForm = async (data: T) => {
    setError(null);

    try {
      const result = await onSubmit(data);

      if (successMessageKey) toast.success(translate(successMessageKey));
      await onSuccess?.(result);
    } catch (submitError: unknown) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : translate(fallbackErrorMessageKey);

      setError(message);
      toast.error(message);
    }
  };

  return (
    <form className={className} onSubmit={handleSubmit(submitForm)}>
      <div className={fieldsClassName}>
        {fields.map((field) => {
          const fieldState = form.getFieldState(field.name, formState);
          const labelId = `${field.name}-label`;
          const rules = getRules(field);
          const rating =
            field.kind === "rating" ? Number(form.watch(field.name) || 0) : 0;

          return (
            <div key={field.name} className={field.className}>
              <Label
                id={labelId}
                htmlFor={field.kind === "rating" ? undefined : field.name}
              >
                {translate(field.labelKey)}
              </Label>

              {field.kind === "rating" ? (
                <Rating
                  id={field.name}
                  aria-labelledby={labelId}
                  value={rating}
                  max={field.max}
                  getAriaLabel={(value) =>
                    translate(field.ariaLabelKey, { value })
                  }
                  onChange={(value) =>
                    form.setValue(
                      field.name,
                      value as FieldPathValue<T, Path<T>>,
                      {
                        shouldValidate: true,
                        shouldDirty: true,
                      },
                    )
                  }
                />
              ) : field.kind === "textarea" ? (
                <textarea
                  {...field.textareaProps}
                  id={field.name}
                  aria-invalid={Boolean(fieldState.error)}
                  {...register(field.name, rules)}
                />
              ) : (
                <Input
                  {...field.inputProps}
                  id={field.name}
                  aria-invalid={Boolean(fieldState.error)}
                  {...register(field.name, rules)}
                />
              )}

              {fieldState.error?.message ? (
                <Message error={String(fieldState.error.message)} />
              ) : null}
            </div>
          );
        })}
      </div>

      {children}

      <div className={cn("mx-auto", actionsClassName)}>
        {cancel ? (
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            variant={cancel.variant}
          >
            {translate(cancel.labelKey)}
          </Button>
        ) : null}

        <Button
          type="submit"
          disabled={!isValid || isSubmitting || disabled}
          eventName={submit.eventName}
          variant={submit.variant}
        >
          {isSubmitting
            ? translate(submit.submittingLabelKey)
            : translate(submit.labelKey)}
        </Button>
      </div>

      {error ? (
        <div className={errorClassName}>
          <Message error={error} />
        </div>
      ) : null}
    </form>
  );
}
