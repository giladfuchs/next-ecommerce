import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DB } from "../lib/db";
import { Product, Category, OrderItem, Order, User } from "../lib/entities";
import {sendAdminWhatsApp, sendOrderConfirmationEmail} from "../lib/service";
import {HttpError} from "../lib/util";


export const checkout = async (body: any) => {
    const { name, email, phone, cart } = body;

    const order = new Order();
    order.name = name;
    order.email = email;
    order.phone = phone;

    if (cart && Object.keys(cart).length !== 0) {
        order.totalQuantity = cart.totalQuantity;
        order.cost = cart.cost;

        order.items = cart.lines.map((item: any) =>
            Object.assign(new OrderItem(), { ...item })
        );
    }

    const savedOrder = await DB.getRepository(Order).save(order);

    if (process.env.SEND_EMAIL_WHATSAPP === "true") {
        await sendOrderConfirmationEmail(savedOrder);
        await sendAdminWhatsApp(savedOrder.id);
    }

    return savedOrder;
};
export async function getData(): Promise<{ categories: Category[]; products: any[] }> {
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
    ]) as [Product[], Category[]];

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

export const login = async (body: any) => {
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
};