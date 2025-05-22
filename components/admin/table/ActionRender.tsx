"use client";

import { useState } from "react";
import Link from "next/link";
import { ICellRendererParams } from "ag-grid-community";
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ModelType } from "../../../lib/types";
import { deleteModel } from "../../../lib/api";
import { toast } from "sonner";
import { useIntl } from "react-intl";

const ActionRender = ({ data }: ICellRendererParams) => {
  const [open, setOpen] = useState(false);
  const intl = useIntl();

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

  const id: number = data.id;
  const title: string = data.title;

  const handleDeleteClick = () => setOpen(true);

  const handleConfirmDelete = async () => {
    setOpen(false);
    if (!model || !id || isOrder) return;

    try {
      await deleteModel(model, id);

      toast.success(intl.formatMessage({ id: "delete.success" }, { title }));

      window.location.reload();
    } catch (err) {
      toast.error(intl.formatMessage({ id: "delete.error" }, { title }));
    }
  };

  return (
    <>
      {(isOrder || isProduct) && (
        <Link
          href={
            isProduct
              ? `/${ModelType.product}/${data.handle}`
              : `/admin/${ModelType.order}/${data.id}`
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

      {title && (isProduct || isCategory) && (
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

      {(isProduct || isCategory) && (
        <>
          <IconButton
            size="small"
            aria-label="delete"
            color="error"
            onClick={handleDeleteClick}
            data-testid="action-delete-button"
          >
            <DeleteIcon fontSize="inherit" />
          </IconButton>

          <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>
              {intl.formatMessage({ id: "delete.title" }, { title })}
            </DialogTitle>
            <DialogContent>
              {intl.formatMessage({ id: "delete.description" })}
              {isCategory && (
                <div style={{ marginTop: 8, color: "red", fontWeight: 500 }}>
                  {intl.formatMessage({ id: "delete.cascadeWarning" })}
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>
                {intl.formatMessage({ id: "delete.cancel" })}
              </Button>
              <Button
                onClick={handleConfirmDelete}
                color="error"
                variant="contained"
                data-testid="confirm-delete-button"
              >
                {intl.formatMessage({ id: "delete.confirm" })}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
};

export default ActionRender;
