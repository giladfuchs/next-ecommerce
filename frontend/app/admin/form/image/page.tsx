"use client";
import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import { toast } from "sonner";

import {
  UploadControls,
  UploadedImagePreview,
} from "@/components/admin/form/image-upload";
import { uploadImage } from "@/lib/api";
import { useLoading, setGlobalLoading } from "@/lib/provider/LoadingProvider";

export default function UploadImagePage() {
  const { loading } = useLoading();
  const intl = useIntl();

  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    try {
      setGlobalLoading(true);
      const url = await uploadImage(file);
      setImageUrl(url);
      toast.success(intl.formatMessage({ id: "image.upload.success" }), {
        description: `URL: ${url}`,
      });
    } catch (err: unknown) {
      const message =
        (err instanceof Error && err.message) ||
        intl.formatMessage({ id: "image.upload.retry" });

      toast.error(intl.formatMessage({ id: "image.upload.error" }), {
        description: message,
      });

      setImageUrl(null);
    } finally {
      setGlobalLoading(false);
    }
  };
  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4, p: 2 }}>
      <Box textAlign="center">
        <Typography variant="h5" mb={2}>
          <FormattedMessage id="image.upload.title" />
        </Typography>

        <Box
          mt={2}
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={1}
        >
          <UploadControls file={file} setFile={setFile} />
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

      {imageUrl && <UploadedImagePreview imageUrl={imageUrl} />}
    </Box>
  );
}
