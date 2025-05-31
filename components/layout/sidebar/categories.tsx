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
import { localeCache } from "lib/api";

const CategoryItemList = ({ categories }: { categories: Category[] }) => {
  const router = useRouter();
  const pathname = safeDecodeURIComponent(usePathname());

  return (
    <>
      {categories.map((item: Category) => {
        const isAll = item.handle === "all";
        const isActive =
          pathname.endsWith(`/${ModelType.category}/${item.handle}`) ||
          (isAll && pathname === "/");

        return (
          <ListItemButton
            key={item.handle}
            data-testid="category-link"
            onClick={() =>
              router.push(isAll ? "/" : `/${ModelType.category}/${item.handle}`)
            }
            sx={{
              borderRadius: 2,
              mb: 0.5,
              py: 1,
              px: 2,
              textAlign: localeCache.isRtl() ? "right" : "left",
              backgroundColor: isActive
                ? "var(--category-active-bg, #e0f7fa)"
                : "transparent",
              transition: "background-color 0.2s",
              "&:hover, &:focus": {
                backgroundColor: "var(--category-hover-bg, #e0f7fa)",
              },
            }}
          >
            <ListItemText
              primary={
                <Typography
                  variant="subtitle2"
                  fontWeight={isActive ? "bold" : "normal"}
                  color="black"
                  className="category-title"
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
};
const CategoryAutocomplete = ({
  options,
  selectedItem,
  setSelectedItem,
  allOption,
}: {
  options: Category[];
  selectedItem: Category | undefined;
  setSelectedItem: (val: Category) => void;
  allOption: Category;
}) => {
  const intl = useIntl();
  const router = useRouter();

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
export default function Categories({ categories }: { categories: Category[] }) {
  const pathname = safeDecodeURIComponent(usePathname());
  const intl = useIntl();

  const allOption: Category = {
    handle: "all",
    title: intl.formatMessage({ id: `${ModelType.category}.all` }),
  } as Category;

  const options = [allOption, ...categories];
  const findSelected = () =>
    categories.find((item) =>
      pathname.endsWith(`/${ModelType.category}/${item.handle}`),
    ) ?? (pathname === "/" ? allOption : undefined);

  const [selectedItem, setSelectedItem] = useState<Category | undefined>(
    findSelected(),
  );

  useEffect(() => {
    setSelectedItem(findSelected());
  }, [pathname, categories]);

  return (
    <nav>
      {/* Desktop */}
      <div className="hidden md:block p-2">
        <CategoryItemList categories={options} />
      </div>
      {/* Mobile */}
      <div className="md:hidden p-2">
        <CategoryAutocomplete
          options={options}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          allOption={allOption}
        />
      </div>
    </nav>
  );
}
