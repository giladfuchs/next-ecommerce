import { FormattedMessage, useIntl } from "react-intl";
import { ChangeEvent } from "react";
import { toast } from "sonner";
import {
  ContentCopy as ContentCopyIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import { image_upload_style } from "@/lib/assets/styles/style";
import { MAX_FILE_SIZE_MB } from "@/lib/config/config";
import { Box, Button, Typography } from "@mui/material";

export const UploadControls = ({
  file,
  setFile,
}: {
  file: File | null;
  setFile: (file: File) => void;
}) => {
  const intl = useIntl();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      toast.error(intl.formatMessage({ id: "image.invalid.type" }));
      return;
    }

    if (selected.size > MAX_FILE_SIZE_MB) {
      toast.error(intl.formatMessage({ id: "image.too.large" }));
      return;
    }

    setFile(selected);
  };

  return (
    <>
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
      {file && (
        <Typography variant="body1" mt={1} sx={image_upload_style.fileName}>
          📎 {file.name}
        </Typography>
      )}
    </>
  );
};
export const UploadedImagePreview = ({ imageUrl }: { imageUrl: string }) => {
    const intl = useIntl();
  const copyToClipboard = async () => {

    if (!imageUrl) return;
    await navigator.clipboard.writeText(imageUrl);
    toast.success(intl.formatMessage({ id: "image.copy.success" }));
  };
  return (
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
          sx={image_upload_style.actionButtons}
        >
          <Button onClick={copyToClipboard}>
            <FormattedMessage id="image.copy.tooltip" />
            <ContentCopyIcon />
          </Button>
          <Button onClick={() => window.open(imageUrl, "_blank")}>
            <FormattedMessage id="image.open.tooltip" />
            <OpenInNewIcon />
          </Button>
        </Box>
        <Typography variant="body2" mt={1} sx={image_upload_style.urlBox}>
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
  );
};
