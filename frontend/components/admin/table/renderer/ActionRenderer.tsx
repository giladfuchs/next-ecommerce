"use client";
import { useState } from "react";
import { deleteRowById } from "@/lib/store";
import Link from "next/link";
import { ICellRendererParams } from "ag-grid-community";
import { IconButton } from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { ModelType } from "@/lib/types";

import { toast } from "sonner";
import { useIntl } from "react-intl";
import { DeleteConfirmDialog } from "@/components/shared/elements-client";
import { useDispatch } from "react-redux";

export default function ActionRenderer({ data }: ICellRendererParams) {
  const [open, setOpen] = useState(false);
  const intl = useIntl();

  const id: number = data.id;
  const title: string = data.title;
  const isProduct = !!data.category;
  const isCategory = typeof data.position === "number";
  const isOrder = !isProduct && !isCategory;

  const model: ModelType | null = isProduct
    ? ModelType.product
    : isCategory
      ? ModelType.category
      : isOrder
        ? ModelType.order
        : null;

  const can_show = {
    view: isOrder || isProduct,
    edit: title && (isProduct || isCategory),
    delete: isProduct || isCategory,
  };

  const dispatch: any = useDispatch();

  const handleConfirmDelete = async () => {
    setOpen(false);
    if (!model || !id || isOrder) return;

    try {
      await dispatch(deleteRowById({ model, id }));
      toast.success(intl.formatMessage({ id: "delete.success" }, { title }));
    } catch (err) {
      toast.error(intl.formatMessage({ id: "delete.error" }, { title }));
    }
  };

  return (
    <>
      {can_show.view && (
        <Link
          href={
            isProduct
              ? `/${ModelType.product}/${data.handle}`
              : `/admin/${ModelType.order}/${id}`
          }
          target={isProduct ? "_blank" : undefined}
          rel={isProduct ? "noopener noreferrer" : undefined}
        >
          <IconButton
            size="small"
            aria-label="view"
            color="info"
            data-testid="action-view-button"
          >
            <VisibilityIcon fontSize="inherit" />
          </IconButton>
        </Link>
      )}

      {can_show.edit && (
        <Link href={`/admin/form/${model}/${id}`}>
          <IconButton
            size="small"
            aria-label="edit"
            color="primary"
            data-testid="action-edit-button"
          >
            <EditIcon fontSize="inherit" />
          </IconButton>
        </Link>
      )}

      {can_show.delete && (
        <>
          <IconButton
            size="small"
            aria-label="delete"
            color="error"
            onClick={() => setOpen(true)}
            data-testid="action-delete-button"
          >
            <DeleteIcon fontSize="inherit" />
          </IconButton>

          <DeleteConfirmDialog
            open={open}
            onClose={() => setOpen(false)}
            onConfirm={handleConfirmDelete}
            title={title}
            isCategory={isCategory}
          />
        </>
      )}
    </>
  );
}
