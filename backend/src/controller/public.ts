import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DB } from "../lib/db";
import { Product, Category, OrderItem, Order, User } from "../lib/entities";
import { sendAdminWhatsApp, sendOrderConfirmationEmail } from "../lib/service";
import { HttpError } from "../lib/util";

export class PublicController {
  static async checkout(body: any) {
    const { name, email, phone, cart } = body;

    const order = new Order();
    order.name = name;
    order.email = email;
    order.phone = phone;

    if (cart && Object.keys(cart).length !== 0) {
      order.totalQuantity = cart.totalQuantity;
      order.cost = cart.cost;

      order.items = cart.lines.map((item: any) =>
        Object.assign(new OrderItem(), { ...item }),
      );
    }

    const savedOrder = await DB.getRepository(Order).save(order);

    if (process.env.SEND_EMAIL_WHATSAPP === "true") {
      await sendOrderConfirmationEmail(savedOrder);
      await sendAdminWhatsApp(savedOrder.id);
    }

    return savedOrder;
  }

  static async getData(): Promise<{ categories: Category[]; products: any[] }> {
    const [products, categories] = (await Promise.all([
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
    ])) as [Product[], Category[]];

    const categories_map_id_handle = Object.fromEntries(
      categories.map((c) => [c.id, c.handle]),
    ) as Record<number, string>;

    const formatted_products = products.map((product: any) => ({
      ...product,
      category: categories_map_id_handle[product.category_id],
      featuredImage: product.images[0],
    }));

    return { products: formatted_products, categories };
  }

  static async login(body: any) {
    const { username, password } = body;

    const user = await DB.getRepository(User).findOneBy({ username });
    if (!user) {
      throw new HttpError(401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new HttpError(401, "Invalid credentials");
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: "8d" },
    );

    return { message: "Login successful", token };
  }

  static async register(body: any) {
    if (process.env.ALLOW_REGISTER !== "true") {
      throw new HttpError(403, "Registration is disabled");
    }
    const { username, email, password } = body;

    const existing = await DB.getRepository(User).findOneBy({ username });
    if (existing) {
      throw new HttpError(409, "Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = DB.getRepository(User).create({
      username,
      email,
      password: hashedPassword,
    });

    await DB.getRepository(User).save(user);

    return { message: "User registered successfully" };
  }

  static async resetMockDb() {
    if (process.env.ALLOW_RESET_MOCK_DATA !== "true") {
      throw new HttpError(403, "Reset Mock Data is disabled");
    }
    try {
      require("../../scripts/mock-data.json");
    } catch {
      throw new HttpError(403, "No mock-data.json File");
    }

    const resetDbStep1Delete = async () => {
      const orderRepo = DB.getRepository(Order);
      const categoryRepo = DB.getRepository(Category);

      await orderRepo.remove(await orderRepo.find());
      await categoryRepo.remove(await categoryRepo.find());

      await DB.query(`ALTER SEQUENCE "category_id_seq" RESTART WITH 1`);
      await DB.query(`ALTER SEQUENCE "product_id_seq" RESTART WITH 1`);
      await DB.query(`ALTER SEQUENCE "order_id_seq" RESTART WITH 1`);
    };
    const resetDbStep2Insert = async () => {
      const {
        categories,
        products,
        orders,
      } = require("../../scripts/mock-data.json");

      const orderRepo = DB.getRepository(Order);
      const categoryRepo = DB.getRepository(Category);

      const categoryMap = new Map<number, Category & { products: Product[] }>();

      for (const category of categories) {
        categoryMap.set(category.id, {
          ...category,
          products: [],
        } as unknown as Category);
      }

      for (const product of products) {
        const cat = categoryMap.get(product.category_id);
        if (!cat)
          throw new HttpError(
            500,
            `❌ No matching category_id=${product.category_id} for product ${product.title}`,
          );
        cat.products.push({
          ...product,
          category: cat,
        } as unknown as Product);
      }

      await categoryRepo.save(
        Array.from(categoryMap.values()) as unknown as Category[],
      );
      await orderRepo.save(orders as unknown as Order[]);
    };
    await resetDbStep1Delete();
    await resetDbStep2Insert();
    return { message: "Reset Mock Data Success" };
  }
}
