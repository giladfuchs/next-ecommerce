import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { HiOutlinePhone, HiOutlineMail } from "react-icons/hi";
import { TbWorld } from "react-icons/tb";

import DAL from "@/lib/core/dal";

export default async function Footer() {
  const settings = await DAL.querySiteSettings();
  const footer = settings?.footer;

  if (!footer) return null;

  return (
    <footer className="w-full border-t bg-[var(--color-bg)] text-[var(--color-text-strong)]">
      <div className="container mx-auto flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-center gap-1 text-sm md:items-start">
          {footer.title && <div className="font-bold">{footer.title}</div>}
          {footer.address && <div>{footer.address}</div>}
        </div>

        <div className="hidden flex-col gap-1 text-sm md:flex md:items-end">
          {footer.phone && (
            <a href={`tel:${footer.phone}`} className="hover:underline">
              {footer.phone}
            </a>
          )}
          {footer.email && (
            <a href={`mailto:${footer.email}`} className="hover:underline">
              {footer.email}
            </a>
          )}
        </div>

        <div className="flex items-center justify-center gap-2">
          {footer.social?.instagram && (
            <a
              href={`https://instagram.com/${footer.social.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-pink-100 transition"
            >
              <FaInstagram className="text-pink-600 text-lg" />
            </a>
          )}

          {footer.social?.facebook && (
            <a
              href={`https://facebook.com/${footer.social.facebook}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-blue-100 transition"
            >
              <FaFacebookF className="text-blue-600 text-lg" />
            </a>
          )}

          {footer.social?.whatsappNumber && (
            <a
              href={`https://wa.me/${footer.social.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-green-100 transition"
            >
              <FaWhatsapp className="text-green-600 text-lg" />
            </a>
          )}

          {footer.phone && (
            <a
              href={`tel:${footer.phone}`}
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-green-100 transition"
            >
              <HiOutlinePhone className="text-green-600 text-lg" />
            </a>
          )}

          {footer.email && (
            <a
              href={`mailto:${footer.email}`}
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-red-100 transition"
            >
              <HiOutlineMail className="text-red-600 text-lg" />
            </a>
          )}

          {footer.website && (
            <a
              href={footer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-blue-100 transition"
            >
              <TbWorld className="text-blue-600 text-lg" />
            </a>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 text-sm md:hidden">
          {footer.phone && <a href={`tel:${footer.phone}`}>{footer.phone}</a>}
          {footer.phone && footer.email && <span>|</span>}
          {footer.email && (
            <a href={`mailto:${footer.email}`}>{footer.email}</a>
          )}
        </div>
      </div>
    </footer>
  );
}
