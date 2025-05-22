"use client";

import { usePathname } from "next/navigation";
import { green, red, blue } from "@mui/material/colors";
import { Box, Typography, IconButton, Stack, Grid } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { metadata_site_title } from "../../lib/assets/i18n/seo_heb";
import { FOOTER_DATA, WHATSAPP_MESSAGE } from "../../lib/config";
import { localeCache } from "../../lib/api";

export const [email, address, phone, instagram, facebook, website] =
  FOOTER_DATA.split(",");
const whatsappNumber = phone?.replace(/^0/, "972") ?? "";
const whatsappMessage = encodeURIComponent(WHATSAPP_MESSAGE || "Hi");

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
      <Box
        sx={{
          maxWidth: "1320px",
          mx: "auto",
          width: "100%",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={{ xs: 0, sm: 2 }}
          sx={{
            gap: { xs: 0, sm: 2 },
            rowGap: { xs: 0.5, sm: 0 },
          }}
        >
          <Grid
            container
            spacing={0.5}
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{
              flex: 1,
              flexWrap: "nowrap",
              overflow: "hidden",
            }}
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
              <h2
                style={{ fontSize: "1em", fontWeight: "bold", lineHeight: 1.3 }}
              >
                {metadata_site_title}
              </h2>
              <p
                style={{
                  fontSize: "0.85em",
                  fontWeight: "bold",
                  lineHeight: 1.3,
                }}
              >
                {address}
              </p>
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

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "25px",
              direction: localeCache.dir(),
            }}
          >
            <IconButton
              component="a"
              href={`https://instagram.com/${instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              sx={{
                color: "#E1306C",
                padding: "4px",
                "&:hover": { backgroundColor: "#fce4ec" },
              }}
            >
              <InstagramIcon fontSize="small" />
            </IconButton>

            <IconButton
              component="a"
              href={`https://facebook.com/${facebook}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              sx={{
                color: "#1877F2",
                padding: "4px",
                "&:hover": { backgroundColor: "#e3f2fd" },
              }}
            >
              <FacebookIcon fontSize="small" />
            </IconButton>

            <IconButton
              component="a"
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              sx={{
                color: "#25D366",
                padding: "4px",
                "&:hover": { backgroundColor: "#e8f5e9" },
              }}
            >
              <WhatsAppIcon fontSize="small" />
            </IconButton>

            <IconButton
              component="a"
              href={`tel:${phone}`}
              aria-label="Call"
              sx={{
                color: green[500],
                padding: "4px",
                "&:hover": { backgroundColor: green[50] },
              }}
            >
              <PhoneIcon fontSize="small" />
            </IconButton>

            <IconButton
              component="a"
              href={`mailto:${email}`}
              aria-label="Email"
              sx={{
                color: red[500],
                padding: "4px",
                "&:hover": { backgroundColor: red[50] },
              }}
            >
              <EmailIcon fontSize="small" />
            </IconButton>

            <IconButton
              component="a"
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Website"
              sx={{
                color: blue[500],
                padding: "4px",
                "&:hover": { backgroundColor: blue[50] },
              }}
            >
              <LanguageIcon fontSize="small" />
            </IconButton>
          </div>
        </Stack>
      </Box>
    </Box>
  );
}
