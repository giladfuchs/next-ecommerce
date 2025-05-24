import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Language as LanguageIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
} from "@mui/icons-material";

import { FOOTER_DATA, WHATSAPP_MESSAGE } from "lib/config";

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
