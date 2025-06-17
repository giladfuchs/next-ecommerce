import dotenv from "dotenv";
import { Order } from "../src/lib/entities";
import { sendOrderConfirmationEmail } from "../src/lib/service";

dotenv.config();



console.log("Script started ✅");
sendOrderConfirmationEmail({
  id: 4,
  name: "lorem",
  email: "cambio0101@gmail.com",
  phone: "0345324322",
  totalQuantity: 2,
  cost: 112.33,
  items: [
    {
      title: "שרך בוסטון",
      quantity: 1,
      unitAmount: "11",
      totalAmount: 11,
      imageUrl: "https://racit0uja2cckwpw.public.blob.vercel-storage.com/products/pexels-photo-3952031.jpg",
      imageAlt: "a",
      id: 1,
      productId: 123,
      handle: "srach-boston",
      order: undefined as any, // or skip if optional
    },
    {
      title: "קיסוס",
      quantity: 1,
      unitAmount: "101.33",
      totalAmount: 101.33,
      imageUrl: "https://racit0uja2cckwpw.public.blob.vercel-storage.com/products/photo-1667385372949-ce58045f9d79.jpg",
      imageAlt: "b",
      id: 2,
      productId: 124,
      handle: "kisos",
      order: undefined as any,
    },
  ],
  status: "new",
  createdAt: new Date().toISOString(),
} as unknown as Order);
