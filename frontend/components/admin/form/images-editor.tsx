"use client";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { toast } from "sonner";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import {
  Image as ImageIcon,
  ContentPaste as ContentPasteIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { ProductImage } from "lib/types";
import { MAX_IMAGES } from "lib/config/config";

export default function ImagesEditor({
  placeholder,
  images,
  onChange,
}: {
  placeholder: string;
  images: ProductImage[];
  onChange: (value: any) => void;
}) {
  const intl = useIntl();
  const [imagesState, setImagesState] = useState<ProductImage[]>(images);
  const handleChange = (
    index: number,
    field: keyof ProductImage,
    value: string,
  ) => {
    setImagesState((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value } as ProductImage;
      onChange(updated);

      return updated;
    });
  };
  const handleClipboardPaste = async (index: number) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.startsWith("http")) {
        handleChange(index, "url", text);
        toast.success(<FormattedMessage id="admin.image.clipboard.success" />, {
          description: text,
        });
      } else {
        toast.error(<FormattedMessage id="admin.image.clipboard.invalid" />);
      }
    } catch {
      toast.error(<FormattedMessage id="admin.image.clipboard.error" />, {
        description: <FormattedMessage id="admin.image.clipboard.retry" />,
      });
    }
  };

  return (
    <Box sx={{ mt: 2 }} data-testid="form-input-images">
      <Typography
        fontSize="1em"
        color="text.secondary"
        paragraph
        maxWidth={300}
      >
        <FormattedMessage id="admin.image.instructions" />
      </Typography>
      <SimpleTreeView>
        <TreeItem
          itemId="images"
          label={<span data-testid="form-toggle-images">{placeholder}</span>}
        >
          <Grid container direction="column" spacing={3}>
            <Button
              sx={{ mt: 4, maxWidth: 300, alignSelf: "center" }}
              variant="outlined"
              onClick={() => window.open("/admin/form/image", "_blank")}
              startIcon={<ImageIcon />}
            >
              <FormattedMessage id="admin.product.image" />
            </Button>
            {Array.from({ length: MAX_IMAGES }, (_, index) => (
              <Grid
                item
                xs={12}
                key={index}
                data-testid={`form-image-${index}`}
              >
                <Typography fontWeight="bold" mb={1}>
                  <FormattedMessage
                    id="admin.image.label"
                    values={{ index: index + 1 }}
                  />
                </Typography>

                <Grid container spacing={1} alignItems="center">
                  <Grid item xs>
                    <TextField
                      fullWidth
                      size="small"
                      label={<FormattedMessage id="admin.image.url" />}
                      value={imagesState[index]?.url || ""}
                      onChange={(e) =>
                        handleChange(index, "url", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item>
                    <IconButton
                      onClick={() => handleClipboardPaste(index)}
                      size="small"
                      aria-label="Paste from clipboard"
                      sx={{
                        border: "1px solid #ccc",
                        background: "#f9f9f9",
                        borderRadius: 1,
                        height: 40,
                        width: 40,
                      }}
                    >
                      <ContentPasteIcon fontSize="small" />
                    </IconButton>
                  </Grid>
                </Grid>

                <Grid item xs={12} mt={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label={<FormattedMessage id="admin.image.alt" />}
                    value={imagesState[index]?.altText || ""}
                    onChange={(e) =>
                      handleChange(index, "altText", e.target.value)
                    }
                  />
                </Grid>

                {imagesState[index]?.url?.trim() && (
                  <Box
                    m={1}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    width="100%"
                  >
                    <Box
                      component="img"
                      src={imagesState[index].url}
                      alt={intl.formatMessage({ id: "image.preview.alt" })}
                      sx={{
                        width: 200,
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 2,
                      }}
                    />
                  </Box>
                )}

                <Divider />
              </Grid>
            ))}
          </Grid>
        </TreeItem>
      </SimpleTreeView>
    </Box>
  );
}
