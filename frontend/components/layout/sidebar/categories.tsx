import NextLink from "next/link";
import { ListItemButton, ListItemText, Typography, Box } from "@mui/material";
import { Category, ModelType } from "@/lib/types";
import { localeCache } from "@/lib/api";
import { CategoryAutocomplete } from "@/components/shared/wrappers";

export const CategoryItemList = ({
  categories,
  currentPath,
}: {
  categories: Category[];
  currentPath?: string;
}) => (
  <>
    {categories.map((item) => {
      const isAll = item.handle === "all";
      const href = isAll ? "/" : `/${ModelType.category}/${item.handle}`;
      const isActive = (isAll && !currentPath) || item.handle === currentPath;

      return (
        <ListItemButton
          component={NextLink}
          href={href}
          key={href}
          prefetch
          data-testid="category-link"
          sx={{
            width:'10rem',
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
              >
                {isAll ? (localeCache.isRtl() ? "הכל" : "All") : item.title}
              </Typography>
            }
          />
        </ListItemButton>
      );
    })}
  </>
);

export default function Categories({
  categories,
  currentPath,
}: {
  currentPath?: string;
  categories: Category[];
}) {
  const allOption: Category = {
    handle: "all",
    title: localeCache.isRtl() ? "הכל" : "All",
  } as Category;

  const options = [allOption, ...categories];

  return (
    <nav>
      <Box sx={{ display: { xs: "none", md: "block" }, p: 2 }}>
        <CategoryItemList categories={options} currentPath={currentPath} />
      </Box>
      <Box sx={{ display: { xs: "block", md: "none" }, p: 2 }}>
        <div className="sr-only">
          <CategoryItemList categories={options} currentPath={currentPath} />
        </div>
        <CategoryAutocomplete options={options} />
      </Box>
    </nav>
  );
}
