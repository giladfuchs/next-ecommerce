"use client";
import {CSSProperties, RefObject, useEffect, useRef, useState} from "react";
import { useIntl } from "react-intl";
import {
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Autocomplete,
    TextField, AutocompleteRenderInputParams,
} from "@mui/material";
import { Category, ModelType, OrderStatus } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";
import { safeDecodeURIComponent } from "@/lib/helper";
import ProductGalleryClient from "@/components/products/single/product-gallery";

type Props = {
  status: OrderStatus;
  size?: "small" | "large";
  clickable?: boolean;
  style?: CSSProperties; // allow parent to inject custom hover
};

export const OrderStatusDisplay = ({
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
    <div className="order-status-vars">
      <Chip
        label={intl.formatMessage({ id: `order.status.${status}` })}
        style={baseStyle}
        size={size === "large" ? "medium" : "small"}
      />
    </div>
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

export const CategoryAutocompleteClient = ({ options }: { options: Category[] }) => {
  const intl = useIntl();
  const router = useRouter();
  const pathname = safeDecodeURIComponent(usePathname());

  const allOption: Category = options[0]!;

  const findSelected = () =>
    options.find((item) => pathname.endsWith(`${item.handle}`)) ?? allOption;

  const [selectedItem, setSelectedItem] = useState<Category>(allOption);

  useEffect(() => {
    setSelectedItem(findSelected());
  }, [pathname, options]);

  return (
      <Autocomplete
          disablePortal
          options={options}
          getOptionLabel={(option) => option.title}
          value={selectedItem}
          onChange={(event, value: Category | null) => {
              if (!value) return;

              setSelectedItem(value);
              router.push(
                  value.handle === "all"
                      ? "/"
                      : `/${ModelType.category}/${value.handle}`
              );
              (event?.target as HTMLInputElement)?.blur();
          }}

          renderInput={(params:AutocompleteRenderInputParams) => (
              <TextField
                  {...params}
                  label={intl.formatMessage({
                      id: `${ModelType.category}.selectCategory`,
                  })}
                  inputProps={{
                      ...params.inputProps,
                      readOnly: true,
                  }}
              />
          )}
      />
  );
};


export function useInfiniteScroll<T>(
    allItems: T[],
    itemsPerPage: number,
    sessionKey: string,
): {
    visibleItems: T[];
    hasMore: boolean;
    sentinelRef: RefObject<HTMLDivElement>;
} {
    const [page, setPage] = useState(() => {
        const stored = sessionStorage.getItem(sessionKey);
        return stored ? parseInt(stored) : 1;
    });

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const loadingRef = useRef(false);

    const visibleItems = allItems.slice(0, page * itemsPerPage);
    const hasMore = visibleItems.length < allItems.length;

    useEffect(() => {
        sessionStorage.setItem(sessionKey, String(page));
    }, [page, sessionKey]);

    useEffect(() => {
        if (!hasMore) return;

        const node = sentinelRef.current;
        if (!node) return;

        observer.current?.disconnect();

        const newObserver = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry?.isIntersecting && !loadingRef.current) {
                    loadingRef.current = true;
                    setPage((prev) => prev + 1);
                }
            },
            { threshold: 0.1 },
        );

        newObserver.observe(node);
        observer.current = newObserver;

        return () => newObserver.disconnect();
    }, [hasMore, page, allItems]);

    useEffect(() => {
        loadingRef.current = false;
    }, [page]);

    return { visibleItems, hasMore, sentinelRef };
}
