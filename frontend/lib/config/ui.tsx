import { ReactNode } from "react";
import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Language as LanguageIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  InvertColors as InvertColorsIcon,
  Visibility as VisibilityIcon,
  Link as LinkIcon,
  RestartAlt as RestartAltIcon,
  ViewColumn as BarcodeIcon,
  Gavel as GavelIcon,
  PersonTwoTone,
  PhonelinkRingTwoTone,
  MailTwoTone,
  AccessTimeTwoTone,
  ShoppingBagTwoTone,
  MonetizationOnTwoTone,
  WhatsApp,
} from "@mui/icons-material";

import { Typography } from "@mui/material";
import { FOOTER_DATA, WHATSAPP_MESSAGE } from "@/lib/config/config";
import { blue, green, red, purple, lime, orange } from "@mui/material/colors";
import { Order } from "@/lib/types";
import { Price } from "@/components/shared/elements-ssr";
export const [email, address, phone, instagram, facebook, website] =
  FOOTER_DATA.split(",");

const whatsappNumber = phone?.replace(/^0/, "972") ?? "";
const whatsappMessage = encodeURIComponent(WHATSAPP_MESSAGE || "Hi");

export const SOCIAL_LINKS = [
  {
    icon: InstagramIcon,
    href: `https://instagram.com/${instagram}`,
    label: "Instagram",
    color: "#E1306C",
    hover: "#fce4ec",
  },
  {
    icon: FacebookIcon,
    href: `https://facebook.com/${facebook}`,
    label: "Facebook",
    color: "#1877F2",
    hover: "#e3f2fd",
  },
  {
    icon: WhatsAppIcon,
    href: `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`,
    label: "WhatsApp",
    color: "#25D366",
    hover: "#e8f5e9",
  },
  {
    icon: PhoneIcon,
    href: `tel:${phone}`,
    label: "Call",
    color: "#4CAF50",
    hover: "#e8f5e9",
  },
  {
    icon: EmailIcon,
    href: `mailto:${email}`,
    label: "Email",
    color: "#F44336",
    hover: "#fbe9e7",
  },
  {
    icon: LanguageIcon,
    href: website,
    label: "Website",
    color: "#2196F3",
    hover: "#e3f2fd",
  },
];

export const createAccessibilityButtons = (
  increaseFont: () => void,
  decreaseFont: () => void,
  reset: () => void,
  grayscale: boolean,
  setGrayscale: (v: boolean) => void,
  highContrast: boolean,
  setHighContrast: (v: boolean) => void,
  invert: boolean,
  setInvert: (v: boolean) => void,
  underlineLinks: boolean,
  setUnderlineLinks: (v: boolean) => void,
  readableFont: boolean,
  setReadableFont: (v: boolean) => void,
) => [
  {
    id: "accessibility.zoomIn",
    icon: <ZoomInIcon />,
    onClick: increaseFont,
  },
  {
    id: "accessibility.zoomOut",
    icon: <ZoomOutIcon />,
    onClick: decreaseFont,
  },
  {
    id: "accessibility.grayscale",
    icon: <BarcodeIcon />,
    onClick: () => setGrayscale(!grayscale),
    selected: grayscale,
  },
  {
    id: "accessibility.contrast",
    icon: <InvertColorsIcon />,
    onClick: () => setHighContrast(!highContrast),
    selected: highContrast,
  },
  {
    id: "accessibility.invert",
    icon: <VisibilityIcon />,
    onClick: () => setInvert(!invert),
    selected: invert,
  },
  {
    id: "accessibility.underline",
    icon: <LinkIcon />,
    onClick: () => setUnderlineLinks(!underlineLinks),
    selected: underlineLinks,
  },
  {
    id: "accessibility.readableFont",
    icon: <Typography fontWeight="bold">Aa</Typography>,
    onClick: () => setReadableFont(!readableFont),
    selected: readableFont,
  },
  {
    id: "accessibility.reset",
    icon: <RestartAltIcon />,
    onClick: reset,
  },
  {
    id: "terms.accessibility.title",
    icon: <GavelIcon />,
    onClick: () => window.open("/legal/accessibility", "_blank"),
  },
];

export type OrderInfoItem = {
  icon: JSX.Element;
  label: string;
  value: ReactNode;
  iconSx?: { color?: string };
  extra?: JSX.Element;
};
export const getOrderInfoSections = (
  order: Order,
): {
  left: OrderInfoItem[];
  right: OrderInfoItem[];
} => ({
  left: [
    {
      icon: <PersonTwoTone sx={{ fontSize: "1.3rem" }} />,
      label: "order.name",
      value: order.name,
      iconSx: { color: blue[700] },
    },
    {
      icon: <PhonelinkRingTwoTone sx={{ fontSize: "1.3rem" }} />,
      label: "order.phone",
      value: order.phone,
      iconSx: { color: green[500] },
      extra: (
        <a
          href={`https://wa.me/${order.phone.replace(/^0/, "972")}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#25D366" }}
        >
          <WhatsApp sx={{ fontSize: "1.3rem" }} />
        </a>
      ),
    },
    {
      icon: <MailTwoTone sx={{ fontSize: "1.3rem" }} />,
      label: "order.email",
      value: order.email,
      iconSx: { color: red[500] },
    },
  ],
  right: [
    {
      icon: <AccessTimeTwoTone sx={{ fontSize: "1.3rem" }} />,
      label: "order.date",
      value: new Date(order.createdAt).toLocaleDateString("he-IL"),
      iconSx: { color: purple[500] },
    },
    {
      icon: <ShoppingBagTwoTone sx={{ fontSize: "1.3rem" }} />,
      label: "order.quantity",
      value: order.totalQuantity,
      iconSx: { color: lime[700] },
    },
    {
      icon: <MonetizationOnTwoTone sx={{ fontSize: "1.3rem" }} />,
      label: "order.total",
      value: <Price amount={order.cost} />,
      iconSx: { color: orange[500] },
    },
  ],
});
