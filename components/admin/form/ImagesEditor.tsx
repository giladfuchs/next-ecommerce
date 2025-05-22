"use client";

import * as React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import {
  Box,
  Button,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "sonner";
import ImageIcon from "@mui/icons-material/Image";
import { Image } from "lib/types";

export default function ImagesEditor({
  placeholder,
  images,
  onChange,
}: {
  placeholder: string;
  images: Image[];
  onChange: (value: any) => void;
}) {
  const intl = useIntl();
  const [imagesState, setImagesState] = React.useState<Image[]>(images);

  const handleChange = (index: number, field: keyof Image, value: string) => {
    const updated = [...imagesState];
    updated[index] = { ...updated[index], [field]: value } as Image;
    onChange(updated);
    setImagesState(updated);
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
            {Array.from({ length: 5 }, (_, index) => (
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
                    <button
                      type="button"
                      title="📋"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          if (text && text.startsWith("http")) {
                            handleChange(index, "url", text);
                            toast.success(
                              <FormattedMessage id="admin.image.clipboard.success" />,
                              {
                                description: text,
                              },
                            );
                          } else {
                            toast.error(
                              <FormattedMessage id="admin.image.clipboard.invalid" />,
                            );
                          }
                        } catch (err) {
                          toast.error(
                            <FormattedMessage id="admin.image.clipboard.error" />,
                            {
                              description: (
                                <FormattedMessage id="admin.image.clipboard.retry" />
                              ),
                            },
                          );
                        }
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 6,
                        border: "1px solid #ccc",
                        background: "#f9f9f9",
                        borderRadius: 4,
                        cursor: "pointer",
                        height: 40,
                        fontSize: 16,
                      }}
                    >
                      📋
                    </button>
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
                    mt={2}
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

                <Divider   />
              </Grid>
            ))}
          </Grid>
        </TreeItem>
      </SimpleTreeView>
    </Box>
  );
}
