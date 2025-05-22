"use client";

import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { toast } from "sonner";
import { setGlobalLoading, uploadImage } from "../../../../lib/api";
import { MAX_FILE_SIZE_MB } from "../../../../lib/config";
import { useIntl, FormattedMessage } from "react-intl";
import { useLoading } from "../../../../lib/provider/LoadingProvider";

export default function UploadImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { loading } = useLoading();
  const intl = useIntl();

  const handleUpload = async () => {
    if (!file) return;

    try {
      setGlobalLoading(true);
      const url = await uploadImage(file);
      setImageUrl(url);

      toast.success(intl.formatMessage({ id: "image.upload.success" }), {
        description: `URL: ${url}`,
      });
    } catch (err: any) {
      toast.error(intl.formatMessage({ id: "image.upload.error" }), {
        description:
          err?.message || intl.formatMessage({ id: "image.upload.retry" }),
      });
      setImageUrl(null);
    } finally {
      setGlobalLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!imageUrl) return;
    await navigator.clipboard.writeText(imageUrl);
    toast.success(intl.formatMessage({ id: "image.copy.success" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const isImage = selectedFile.type.startsWith("image/");
    const isTooLarge = selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024;

    if (!isImage) {
      toast.error(intl.formatMessage({ id: "image.invalid.type" }));
      return;
    }

    if (isTooLarge) {
      toast.error(intl.formatMessage({ id: "image.too.large" }));
      return;
    }

    setFile(selectedFile);
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4, p: 2 }}>
      <Box textAlign="center">
        <Typography variant="h5" mb={2}>
          <FormattedMessage id="image.upload.title" />
        </Typography>

        <Box mt={2}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={1}
          >
            <input
              accept="image/*"
              type="file"
              id="upload-input"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            <label htmlFor="upload-input">
              <Button variant="outlined" component="span">
                {file ? "🔁 " : "📁 "}
                <FormattedMessage
                  id={file ? "image.upload.change" : "image.upload.choose"}
                />
              </Button>
            </label>
          </Box>

          {file && (
            <Typography
              variant="body1"
              mt={1}
              sx={{
                bgcolor: "#f4f4f4",
                px: 2,
                py: 1,
                borderRadius: 1,
                border: "1px solid #ccc",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#333",
                display: "inline-block",
              }}
            >
              📎 {file.name}
            </Typography>
          )}
        </Box>

        <Box mt={2}>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!file || loading}
          >
            <FormattedMessage id="image.upload.button" />
          </Button>
        </Box>
      </Box>

      {imageUrl && (
        <Box mt={4} textAlign="center">
          <Typography variant="body1" gutterBottom>
            <FormattedMessage id="image.upload.url.label" />
          </Typography>

          <Box mt={3}>
            <Box
              display="flex"
              gap={4}
              justifyContent="center"
              alignItems="center"
              sx={{
                fontSize: "inherit",
                "& button": {
                  fontSize: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  padding: "0.5em 1em",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "inherit",
                },
                "& svg": {
                  fontSize: "1.8em",
                },
              }}
            >
              <button onClick={copyToClipboard}>
                <FormattedMessage id="image.copy.tooltip" />
                <ContentCopyIcon />
              </button>

              <button onClick={() => window.open(imageUrl as string, "_blank")}>
                <FormattedMessage id="image.open.tooltip" />
                <OpenInNewIcon />
              </button>
            </Box>

            <Typography
              variant="body2"
              mt={1}
              sx={{
                wordBreak: "break-all",
                fontSize: "0.875rem",
                color: "#333",
                p: 1,
                borderRadius: 1,
                bgcolor: "#f4f4f4",
                border: "1px solid #ccc",
              }}
            >
              {imageUrl}
            </Typography>
          </Box>

          <Box mt={2} p={1} border="1px solid #ccc" borderRadius={2}>
            <img
              src={imageUrl}
              alt="Uploaded"
              style={{ maxWidth: "100%", borderRadius: 8 }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
