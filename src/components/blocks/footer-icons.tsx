import {
  FaInstagram,
  FaFacebookF,
  FaTiktok,
  FaLinkedinIn,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { HiOutlinePhone, HiOutlineMail } from "react-icons/hi";
import { TbWorld } from "react-icons/tb";

import type { FooterIconsBlock as FooterIconsBlockProps } from "@/payload-types";
import type { ReactNode } from "react";

import CmsLink from "@/components/shared/cms-link";

const ICONS: Record<string, ReactNode> = {
  instagram: <FaInstagram className="h-6 w-6 text-pink-600" />,
  facebook: <FaFacebookF className="h-6 w-6 text-blue-600" />,
  tiktok: <FaTiktok className="h-6 w-6" />,
  linkedin: <FaLinkedinIn className="h-6 w-6 text-blue-700" />,
  youtube: <FaYoutube className="h-6 w-6 text-red-600" />,
  x: <FaXTwitter className="h-6 w-6" />,
  whatsapp: <FaWhatsapp className="h-6 w-6 text-green-600" />,
  website: <TbWorld className="h-6 w-6 text-blue-600" />,
  phone: <HiOutlinePhone className="h-6 w-6 text-green-600" />,
  email: <HiOutlineMail className="h-6 w-6 text-red-600" />,
};

export default function FooterIconsBlock({
  title,
  items,
}: FooterIconsBlockProps) {
  return (
    <div className="col-span-2 flex min-w-0 flex-col gap-3 sm:col-span-3 md:col-span-4">
      {title ? (
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          {title}
        </h3>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        {(items ?? []).map((item, index) => {
          const icon = item.icon ? ICONS[item.icon] : null;
          if (!icon || !item.link) return null;

          return (
            <CmsLink
              key={index}
              link={item.link}
              appearance="link"
              className="flex items-center justify-center rounded-full transition hover:opacity-80"
            >
              {icon}
            </CmsLink>
          );
        })}
      </div>
    </div>
  );
}
