"use client";
import Link from "next/link";
import { useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "sonner";
import { ICellRendererParams } from "ag-grid-community";
import { IconButton } from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

import { ModelType } from "@/lib/types";
import { deleteRowById, useAppDispatch } from "@/lib/store";

import { DeleteConfirmDialog } from "@/components/shared/elements-client";

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

  const dispatch = useAppDispatch();

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
      <Link
        href={
          !isOrder
            ? `/${model}/${data.handle}`
            : `/admin/${ModelType.order}/${id}`
        }
        target={!isOrder ? "_blank" : undefined}
        rel={!isOrder ? "noopener noreferrer" : undefined}
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

      {!isOrder && (
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

      {!isOrder && (
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
