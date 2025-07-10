"use client";
import {CSSProperties, useEffect, useState} from "react";
import { useIntl } from "react-intl";
import {
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button, Autocomplete, TextField,
} from "@mui/material";
import {Category, ModelType, OrderStatus} from "lib/types";
import {usePathname, useRouter} from "next/navigation";
import {safeDecodeURIComponent} from "../../lib/helper";
import {localeCache} from "../../lib/api";

type Props = {
  status: OrderStatus;
  size?: "small" | "large";
  clickable?: boolean;
  style?: CSSProperties; // allow parent to inject custom hover
};

export const OrderDisplay = ({
  status,
  size = "small",
  clickable = false,
  style = {},
}: Props) => {
  const intl = useIntl();

  const baseStyle: CSSProperties = {
    backgroundColor: `var(--color-status-${status})`,
    color: "var(--color-text-strong)",
    fontWeight: 600,
    fontSize: size === "large" ? "1rem" : "0.75rem",
    padding: size === "large" ? "10px 20px" : undefined,
    cursor: clickable ? "pointer" : "default",
    transition: "filter 0.2s ease",
    ...style,
  };

  return (
    <Chip
      label={intl.formatMessage({ id: `order.status.${status}` })}
      style={baseStyle}
      size={size === "large" ? "medium" : "small"}
    />
  );
};

export const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  isCategory,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isCategory: boolean;
}) => {
  const intl = useIntl();
  return (
    <Dialog open={open} onClose={onClose} slots={{ transition: undefined }}>
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
        <Button onClick={onClose}>
          {intl.formatMessage({ id: "delete.cancel" })}
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          data-testid="confirm-delete-button"
        >
          {intl.formatMessage({ id: "delete.confirm" })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


export const CategoryAutocomplete = ({
                                       options,
                                       allOption,
                                     }: {
  options: Category[];
  allOption: Category;
}) => {
  const intl = useIntl();
  const router = useRouter();
  const pathname = safeDecodeURIComponent(usePathname());

  const findSelected = () =>
      options.find((item) =>
          pathname.endsWith(`/${ModelType.category}/${item.handle}`),
      ) ?? (pathname === "/" ? allOption : undefined);

  const [selectedItem, setSelectedItem] = useState<Category | undefined>(
      findSelected(),
  );

  useEffect(() => {
    setSelectedItem(findSelected());
  }, [pathname, options]);

  return (
      <Autocomplete
          options={options}
          getOptionLabel={(option) => option.title}
          value={selectedItem}
          onChange={(event, value: Category | null) => {
            const selected = value ?? allOption;
            setSelectedItem(selected);
            router.push(
                selected.handle === "all"
                    ? "/"
                    : `/${ModelType.category}/${selected.handle}`,
            );
          }}
          isOptionEqualToValue={(option, value) => option.handle === value?.handle}
          disableClearable
          renderInput={(params) => (
              <TextField
                  {...params}
                  label={intl.formatMessage({
                    id: `${ModelType.category}.selectCategory`,
                  })}
                  InputProps={{
                    ...params.InputProps,
                    style: {
                      direction: localeCache.dir(),
                      fontSize: "1.1em",
                    },
                  }}
                  InputLabelProps={{
                    ...params.InputLabelProps,
                    style: {
                      direction: localeCache.dir(),
                      textAlign: localeCache.isRtl() ? "right" : "left",
                    },
                  }}
              />
          )}
      />
  );
};