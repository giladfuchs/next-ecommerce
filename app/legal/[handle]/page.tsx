"use client";

import { Box, Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";
import { notFound } from "next/navigation";
import { email } from "components/layout/Footer";
import { legalContent } from "../../../lib/assets/i18n/legalContent";
import { localeCache } from "../../../lib/api";

export default function LegalPage({ params }: { params: { handle: string } }) {
  const { handle } = params;

  if (!["terms", "accessibility"].includes(handle)) {
    notFound();
  }

  const content = legalContent[handle as "terms" | "accessibility"];

  return (
    <Box
      component="main"
      sx={{
        maxWidth: 800,
        mx: "auto",
        px: 2,
        py: 4,
        color: "var(--color-text)",
        bgcolor: "var(--color-bg)",
        direction: localeCache.dir(),
        ".high-contrast &": {
          color: "yellow",
          bgcolor: "black",
        },
      }}
    >
      {content.sections.map((section, idx) => (
        <section key={idx}>
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            mt={idx > 0 ? 4 : 0}
          >
            <FormattedMessage id={section.title} />
          </Typography>

          {section.paragraphs?.map((pid, i) => (
            <Typography paragraph key={i}>
              <FormattedMessage id={pid} />
            </Typography>
          ))}

          {section.list && (
            <ul>
              {section.list.map((lid, i) => (
                <li key={i}>
                  <FormattedMessage id={lid} />
                </li>
              ))}
            </ul>
          )}

          {section.contact && (
            <Typography mt={2}>
              <FormattedMessage
                id={section.contact}
                values={{
                  email: <a href={`mailto:${email}`}>{email}</a>,
                }}
              />
            </Typography>
          )}
        </section>
      ))}
    </Box>
  );
}
