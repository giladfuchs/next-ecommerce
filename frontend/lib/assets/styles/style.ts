import { localeCache } from "@/lib/api";

export const image_upload_style = {
  fileName: {
    bgcolor: "#f4f4f4",
    px: 2,
    py: 1,
    borderRadius: 1,
    border: "1px solid #ccc",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#333",
    display: "inline-block",
  },
  urlBox: {
    wordBreak: "break-all",
    fontSize: "0.875rem",
    color: "#333",
    p: 1,
    borderRadius: 1,
    bgcolor: "#f4f4f4",
    border: "1px solid #ccc",
  },
  actionButtons: {
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
  },
};
export const formikHelperTextSx = {
  textAlign: localeCache.isRtl() ? "right" : "left",
  marginInlineStart: localeCache.isRtl() ? 0 : 1,
  marginInlineEnd: localeCache.isRtl() ? 1 : 0,
};
export const formikTextFieldSx = {
  mt: 1,
  mb: 1,
  fontSize: "inherit",
  "& > label": {
    top: 5,
    left: localeCache.isRtl() ? "unset" : 14,
    right: localeCache.isRtl() ? 14 : "unset",
    position: "absolute",
    transformOrigin: localeCache.isRtl() ? "top right" : "top left",
    transform: "translate(0, -1.5px) scale(0.75)",
    fontSize: "inherit",
    color: "#9e9e9e",
    '&[data-shrink="false"]': { top: 5 },
  },
  "& legend": { display: "none" },
  "& fieldset": { top: 0 },
};
