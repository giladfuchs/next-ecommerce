"use client";
import { usePathname } from "next/navigation";
import { Box, Typography, IconButton, Stack, Grid } from "@mui/material";
import { metadata_site_title } from "lib/assets/i18n/localizedMetadata";
import { FOOTER_DATA } from "lib/config/config";
import { localeCache } from "lib/api";
import { SOCIAL_LINKS } from "lib/config/ui";
export const [email, address, phone, instagram, facebook, website] =
  FOOTER_DATA.split(",");

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <Box
      component="footer"
      sx={{
        position: "sticky",
        bottom: 0,
        width: "100%",
        bgcolor: "var(--color-bg)",
        color: "var(--color-text-strong)",
        borderTop: "1px solid var(--color-border)",
        px: 2,
        py: { xs: 1, sm: 2 },
        zIndex: 10,
        direction: localeCache.dir(),
      }}
    >
      <Box sx={{ maxWidth: "1320px", mx: "auto", width: "100%" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={{ xs: 0, sm: 2 }}
          sx={{ gap: { xs: 0, sm: 2 }, rowGap: { xs: 0.5, sm: 0 } }}
        >
          <Grid
            container
            spacing={0.5}
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ flex: 1, flexWrap: "nowrap", overflow: "hidden" }}
          >
            <Grid
              item
              sx={{
                minWidth: 120,
                textAlign: localeCache.isRtl() ? "right" : "left",
                whiteSpace: "nowrap",
                mx: localeCache.isRtl() ? 1 : 0,
              }}
            >
              <Typography variant="h6" fontWeight="bold" lineHeight={1.3}>
                {metadata_site_title}
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                fontSize="0.85rem"
                lineHeight={1.3}
              >
                {address}
              </Typography>
            </Grid>

            <Grid
              item
              sx={{
                textAlign: localeCache.isRtl() ? "left" : "right",
                ml: localeCache.isRtl() ? 0 : { xs: 1, sm: 2 },
                mr: localeCache.isRtl() ? { xs: 1, sm: 2 } : 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 200,
              }}
            >
              <Typography variant="body2" fontSize="0.75rem" lineHeight={1.3}>
                {phone}
              </Typography>
              <Typography variant="body2" fontSize="0.75rem" lineHeight={1.3}>
                {email}
              </Typography>
            </Grid>
          </Grid>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "25px",
              direction: localeCache.dir(),
            }}
          >
            {SOCIAL_LINKS.map(({ icon: Icon, href, label, color, hover }) => (
              <IconButton
                key={label}
                component="a"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                sx={{
                  color,
                  padding: "4px",
                  "&:hover": { backgroundColor: hover },
                }}
              >
                <Icon fontSize="small" />
              </IconButton>
            ))}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
