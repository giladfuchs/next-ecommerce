"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import {
  Autocomplete,
  TextField,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";

import { Category, ModelType } from "lib/types";
import { safeDecodeURIComponent } from "lib/helper";
import { localeCache } from "../../../lib/api";

// Desktop list
function CategoriesItemList({ list }: { list: Category[] }) {
  const router = useRouter();
  const pathname = safeDecodeURIComponent(usePathname());

  return (
    <>
      {list.map((item: Category, index: number) => {
        const isAll = item.handle === "all";
        const isActive =
          pathname.endsWith(`/${ModelType.category}/${item.handle}`) ||
          (isAll && pathname === "/");

        return (
          <ListItemButton
            key={index}
            data-testid="category-link"
            onClick={() =>
              router.push(isAll ? "/" : `/${ModelType.category}/${item.handle}`)
            }
            sx={{
              borderRadius: "8px",
              mb: 0.5,
              py: 1,
              px: 2,
              textAlign: localeCache.isRtl() ? "right" : "left",
              backgroundColor: isActive
                ? "var(--category-active-bg, #e0f7fa)"
                : "transparent",
              transition: "background-color 0.2s",
              "&:hover": {
                backgroundColor: "var(--category-hover-bg, #e0f7fa)",
              },
            }}
          >
            <ListItemText
              primary={
                <Typography
                  component="span"
                  className="category-title"
                  sx={{
                    fontSize: "1.1em",
                    fontWeight: isActive ? "bold" : "normal",
                    color: "black",
                    textDecoration: "inherit",
                  }}
                >
                  {isAll ? (
                    <FormattedMessage id={`${ModelType.category}.all`} />
                  ) : (
                    item.title
                  )}
                </Typography>
              }
            />
          </ListItemButton>
        );
      })}
    </>
  );
}

export default function Categories({ list }: { list: Category[] }) {
  const router = useRouter();
  const pathname = safeDecodeURIComponent(usePathname());
  const intl = useIntl();

  const all_option = {
    handle: "all",
    title: intl.formatMessage({ id: `${ModelType.category}.all` }),
  } as Category;

  const options = [all_option, ...list];

  const initialItem =
    list.find((item) =>
      pathname.endsWith(`/${ModelType.category}/${item.handle}`),
    ) ?? (pathname === "/" ? options[0] : undefined);

  const [selectedItem, setSelectedItem] = useState<Category | undefined>(
    initialItem,
  );

  useEffect(() => {
    const matching =
      list.find((item) =>
        pathname.endsWith(`/${ModelType.category}/${item.handle}`),
      ) ?? (pathname === "/" ? options[0] : undefined);
    setSelectedItem(matching);
  }, [pathname, list]);
  return (
    <nav>
      {/* Desktop */}
      <div className="hidden md:block p-2">
        <CategoriesItemList list={options} />
      </div>

      {/* Mobile */}
      <div className="md:hidden p-2">
        <Autocomplete<Category>
          options={options}
          getOptionLabel={(option) => option.title}
          value={selectedItem}
          onChange={(event, value) => {
            const selected = (value ?? all_option) as Category;
            setSelectedItem(selected);
            router.push(
              selected.handle === "all"
                ? "/"
                : `/${ModelType.category}/${selected.handle}`,
            );
          }}
          isOptionEqualToValue={(option, value) =>
            option.handle === value?.handle
          }
          {...({
            disableClearable: true,
          } as any)}
          renderInput={(params) => {
            return (
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
                    textDecoration: "inherit",
                  },
                }}
                InputLabelProps={{
                  ...params.InputLabelProps,
                  style: {
                    direction: localeCache.dir(),
                    textAlign: "right",
                  },
                }}
              />
            );
          }}
        />
      </div>
    </nav>
  );
}
