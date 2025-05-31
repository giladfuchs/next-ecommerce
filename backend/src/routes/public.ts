import { Request, Response, Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { DB } from "../lib/db";
import { Product, Category, OrderItem, Order, User } from "../lib/entities";
import {
  sendAdminWhatsApp,
  sendOrderConfirmationEmail,
  withErrorHandler,
} from "../lib/service";

const router = Router();

// Submit order using cart data as-is (no price validation against DB)
router.post(
  "/checkout",
  withErrorHandler(async (req: Request, res: Response) => {
    const { name, email, phone, cart } = req.body;

    const order = new Order();
    order.name = name;
    order.email = email;
    order.phone = phone;
    if (cart && Object.keys(cart).length !== 0) {
      order.totalQuantity = cart.totalQuantity;
      order.cost = cart.cost;

      order.items = cart.lines.map((item: any) => {
        const orderItem = new OrderItem();
        orderItem.productId = item.productId;
        orderItem.handle = item.handle;
        orderItem.title = item.title;
        orderItem.imageUrl = item.imageUrl;
        orderItem.imageAlt = item.imageAlt;
        orderItem.quantity = item.quantity;
        orderItem.unitAmount = item.unitAmount;
        orderItem.totalAmount = item.totalAmount;
        return orderItem;
      });
    }

    const savedOrder = await DB.getRepository(Order).save(order);

    if (process.env.SEND_EMAIL_WHATSAPP === "true") {
      await sendOrderConfirmationEmail(savedOrder);
      await sendAdminWhatsApp(savedOrder.id);
    }

    res.status(201).json(savedOrder);
  }),
);

router.get(
  "/data",
  withErrorHandler(async (req: Request, res: Response) => {
    const [products, categories] = await Promise.all([
      DB.getRepository(Product).find({
        relations: ["images"],
        order: {
          updatedAt: "DESC",
          images: {
            position: "ASC",
          },
        },
      }),
      DB.getRepository(Category).find({
        order: { position: "ASC" },
      }),
    ]);

    const categories_map_id_handle = Object.fromEntries(
      categories.map((c) => [c.id, c.handle]),
    ) as Record<number, string>;

    const formatted_products = products.map((product: any) => ({
      ...product,
      category: categories_map_id_handle[product.category_id],
      featuredImage: product.images[0],
    }));

    res.json({ products: formatted_products, categories });
  }),
);

router.post(
  "/login",
  withErrorHandler(async (req, res) => {
    const { username, password } = req.body;

    const user = await DB.getRepository(User).findOneBy({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: "8d" },
    );

    res.json({ message: "Login successful", token });
  }),
);

export default router;
