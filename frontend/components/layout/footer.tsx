import { Box, Typography, IconButton, Grid } from "@mui/material";
import { metadata_site_title } from "@/lib/assets/i18n/localizedMetadata";
import { localeCache } from "@/lib/api";
import { SOCIAL_LINKS, email, address, phone } from "@/lib/config";

export default function Footer() {
  return (
    <Box
      component="footer"
      className="hide-in-admin"
      sx={{
        position: "sticky",
        bottom: 0,
        width: "100%",
        bgcolor: "var(--color-bg)",
        color: "var(--color-text-strong)",
        borderTop: "1px solid var(--color-border)",
        py: { xs: 1, md: 2 },
        zIndex: 10,
        direction: localeCache.dir(),
      }}
    >
      <Grid
        container
        sx={{
          maxWidth: "60rem",
          width: "100%",
          mx: "auto",
          justifyContent: "space-between",

          columnGap: { md: 2 },
          rowGap: { xs: 1, md: 0 },
        }}
      >
        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{
            display: "flex",
            flexDirection: { xs: "row", md: "column" },
            justifyContent: { xs: "center", md: "flex-start" },

            alignItems: { xs: "center", md: "flex-start" },
            gap: { xs: "0.5rem", md: "0.25rem" },
            whiteSpace: "nowrap",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.2}>
            {metadata_site_title}
          </Typography>
          <Typography variant="body2" fontWeight="bold" lineHeight={1.2}>
            <Box
              component="span"
              sx={{ display: { xs: "inline", md: "none" } }}
            >
              &nbsp;|&nbsp;
            </Box>
            {address}
          </Typography>
        </Grid>

        <Grid
          size={{ xs: 12, md: 3 }}
          sx={{
            display: { xs: "none", md: "block" },
            textAlign: localeCache.isRtl() ? "left" : "right",
            whiteSpace: "nowrap",
          }}
        >
          <Typography variant="body2" lineHeight={1.2} sx={{ m: 0 }}>
            {phone}
          </Typography>
          <Typography variant="body2" lineHeight={1.2} sx={{ m: 0 }}>
            {email}
          </Typography>
        </Grid>

        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{ display: "flex", alignItems: "center" }}
          justifyContent="center"
          alignItems="center"
          wrap="nowrap"
          columnSpacing={2}
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
                mx: "0.3rem",
                "&:hover": { backgroundColor: hover },
              }}
            >
              <Icon sx={{ fontSize: "1.7rem" }} />
            </IconButton>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
}
