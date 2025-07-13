"use client";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { useRouter, usePathname } from "next/navigation";
import MenuIcon from "@mui/icons-material/Menu";
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
import { ModelType } from "@/lib/types";
import { localeCache } from "@/lib/api";

const AdminNavItem = ({
  model,
  isActive,
  onClick,
}: {
  model: ModelType;
  isActive: boolean;
  onClick: () => void;
}) => (
  <ListItemButton
    key={model}
    onClick={onClick}
    data-testid={`admin-nav-${model}`}
    sx={{
      borderRadius: "12px",
      px: 3,
      py: 0.5,
      justifyContent: "flex-end",
      backgroundColor: isActive ? "var(--color-accent)" : "transparent",
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
            textAlign: localeCache.isRtl() ? "right" : "left",
          }}
        >
          <FormattedMessage id={`admin.${model}.title`} />
        </Typography>
      }
    />
  </ListItemButton>
);

const AdminNavItems = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width:768px)");
  const [open, setOpen] = useState(false);
  const toggleDrawer = () => setOpen(!open);

  const handleNavClick = (model: ModelType) => {
    router.push(`/admin/${model}`);
    setOpen(false);
  };

  const renderedItems = Object.values(ModelType).map((model: ModelType) => {
    const isActive = pathname === `/admin/${model}`;
    return (
      <AdminNavItem
        key={model}
        model={model}
        isActive={isActive}
        onClick={() => handleNavClick(model)}
      />
    );
  });

  if (isDesktop) {
    return (
      <Box display="flex" gap={2} flexDirection="row">
        {renderedItems}
      </Box>
    );
  }
  return (
    <>
      <IconButton
        color="primary"
        onClick={toggleDrawer}
        aria-label="Open admin menu"
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        anchor={localeCache.isRtl() ? "left" : "right"}
        open={open}
        onClose={toggleDrawer}
        transitionDuration={0}
        slots={{ transition: undefined }}
        slotProps={{
          paper: {
            sx: {
              height: "auto",
              maxHeight: 300,
              mt: 8,
            },
          },
        }}
      >
        <Box
          sx={{ width: 120, overflowY: "auto" }}
          dir={localeCache.dir()}
          textAlign={localeCache.isRtl() ? "right" : "left"}
        >
          <List>{renderedItems}</List>
        </Box>
      </Drawer>
    </>
  );
};

export default function AdminNav() {
  const isDesktop = useMediaQuery("(min-width:768px)");
  return isDesktop ? (
    <>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          md: { width: "33.3333%" },
          justifyContent: "center",
          px: 2,
        }}
      >
        <AdminNavItems />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          width: "auto",
          md: { width: "33.3%" },
        }}
      />
    </>
  ) : (
    <>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          md: { width: "33.3%" },
          justifyContent: "center",
          px: 2,
        }}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          width: "auto",
          md: { width: "33.3%" },
        }}
      >
        <AdminNavItems />
      </Box>
    </>
  );
}
