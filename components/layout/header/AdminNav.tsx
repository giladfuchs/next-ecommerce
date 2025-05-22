"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { FormattedMessage } from "react-intl";
import { ModelType } from "../../../lib/types";
import { localeCache } from "../../../lib/api";

const adminRoutes: ModelType[] = [
  ModelType.order,
  ModelType.product,
  ModelType.category,
];

export function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width:768px)");

  const [open, setOpen] = useState(false);
  const toggleDrawer = () => setOpen(!open);

  const handleNavClick = (model: ModelType) => {
    router.push(`/admin/${model}`);
    setOpen(false);
  };

  const renderList = (
    <List>
      {adminRoutes.map((model) => {
        const isActive = pathname === `/admin/${model}`;
        return (
          <ListItemButton
            key={model}
            onClick={() => handleNavClick(model)}
            sx={{
              backgroundColor: isActive ? "var(--color-accent)" : "transparent",
              "&:hover": { backgroundColor: "var(--color-accent)" },
              justifyContent: "flex-end", // align entire button content right
            }}
          >
            <ListItemText
              primary={
                <Typography
                  sx={{
                    color: isActive ? "white" : "black",
                    fontWeight: isActive ? "bold" : "normal",
                  }}
                >
                  <FormattedMessage id={`admin.${model}.title`} />
                </Typography>
              }
              sx={{ textAlign: "right" }} // align text inside ListItemText
            />
          </ListItemButton>
        );
      })}
    </List>
  );

  if (isDesktop) {
    return (
      <Box display="flex" gap={2} flexDirection="row">
        {adminRoutes.map((model) => {
          const isActive = pathname === `/admin/${model}`;
          return (
            <ListItemButton
              key={model}
              data-testid={`admin-nav-${model}`}
              onClick={() => router.push(`/admin/${model}`)}
              sx={{
                borderRadius: "12px",
                px: 3,
                py: 0.5,
                backgroundColor: isActive
                  ? "var(--color-accent)"
                  : "transparent",
                transition: "background-color 0.2s ease",
                "&:hover": {
                  backgroundColor: "var(--color-accent)",
                },
              }}
            >
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    sx={{
                      color: isActive ? "white" : "black",
                      fontWeight: isActive ? "bold" : "normal",
                      textAlign: "right",
                    }}
                  >
                    <FormattedMessage id={`admin.${model}.title`} />
                  </Typography>
                }
              />
            </ListItemButton>
          );
        })}
      </Box>
    );
  }

  return (
    <>
      <IconButton color="primary" onClick={toggleDrawer}>
        <MenuIcon />
      </IconButton>
      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer}
        transitionDuration={0}
        PaperProps={{
          sx: {
            height: "auto", // don't fill full height
            maxHeight: 300, // control height (adjust as needed)
            mt: 8, // some top margin to not stick to top
          },
        }}
      >
        <Box
          sx={{ width: 120, overflowY: "auto" }}
          dir={localeCache.dir()}
          textAlign="right"
        >
          {renderList}
        </Box>
      </Drawer>
    </>
  );
}
