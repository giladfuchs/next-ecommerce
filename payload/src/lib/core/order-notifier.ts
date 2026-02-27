import type { Media, Order, Product } from "@/lib/core/types/payload-types";
import type { Payload } from "payload";

import appConfig from "@/lib/core/config";
import { RoutePath, OrderItem } from "@/lib/core/types/types";
import { messages } from "@/lib/intl/request";

type EmailItem = {
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  imageUrl: string;
  imageAlt: string;
};

export class OrderNotifier {
  constructor(private readonly payload: Payload) {}

  async send(order: Order) {
    await this.sendEmail(order);
    await this.sendWhatsappAdmin(Number(order.id));
  }

  private async sendEmail(order: Order) {
    const emailItems = await this.buildEmailItems(order);
    const html = this.generateOrderEmailHtml(order, emailItems);

    try {
      await this.payload.sendEmail({
        to: order.email,
        subject: `${messages.order.email.subjectPrefix}${order.id}`,
        html,
      });
      console.log(`✅ Order email sent #${order.id}`);
    } catch (error) {
      console.error(`❌ Order email failed #${order.id}`, error);
    }
  }

  private async sendWhatsappAdmin(orderId: number) {
    const text = `${messages.order.adminNotification}${appConfig.BASE_URL}/admin/collections/orders/${orderId}`;
    const url = `https://api.callmebot.com/whatsapp.php?phone=${appConfig.WHATSAPP_NUMBER}&text=${encodeURIComponent(
      text,
    )}&apikey=${appConfig.CALLMEBOT_API_KEY}`;

    try {
      await fetch(url);
      console.log(`✅ whatsapp sent #${orderId}`);
    } catch (error) {
      console.error(`❌ whatsapp failed #${orderId}`, error);
    }
  }

  private async buildEmailItems(order: Order): Promise<EmailItem[]> {
    const items = (order.items || []) as OrderItem[];
    if (!items.length) return [];

    const productIds = Array.from(
      new Set(
        items
          .map((i) =>
            typeof i.product === "number"
              ? i.product
              : i.product && typeof i.product === "object"
                ? Number((i.product as Product).id)
                : undefined,
          )
          .filter((x): x is number => typeof x === "number"),
      ),
    );

    const productsRes = await this.payload.find({
      collection: `${RoutePath.product}s`,
      depth: 0,
      limit: 0,
      pagination: false,
      where: { id: { in: productIds } },
      select: { id: true, gallery: true },
    });

    const products = productsRes.docs as Product[];
    const productById = new Map(products.map((p) => [Number(p.id), p]));

    const mediaIds = Array.from(
      new Set(
        products
          .map((p) => p.gallery?.[0]?.image as number | undefined)
          .filter((x): x is number => typeof x === "number"),
      ),
    );

    const mediaRes = await this.payload.find({
      collection: "media",
      depth: 0,
      limit: 0,
      pagination: false,
      where: { id: { in: mediaIds } },
      select: { id: true, url: true, alt: true },
    });

    const mediaById = new Map(
      (mediaRes.docs as Media[]).map((m) => [Number(m.id), m]),
    );

    return items
      .map((item) => {
        const product = productById.get(
          (item.product as Product).id,
        ) as Product;
        if (!product) return null;
        const media = mediaById.get(
          product.gallery![0].image as number,
        ) as Media;

        return {
          title: item.title,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
          imageUrl: `${appConfig.BASE_URL}${media.url}`,
          imageAlt: String(media?.alt ?? ""),
        } satisfies EmailItem;
      })
      .filter((x): x is EmailItem => Boolean(x));
  }

  private generateOrderEmailHtml(order: Order, emailItems: EmailItem[]) {
    const currency = "$";

    const itemsHtml = emailItems
      .map(
        (item) => `
<tr style="border-bottom: 1px solid #ddd; text-align: center;">
  <td style="padding: 8px;">
    <img src="${item.imageUrl}" alt="${item.imageAlt}" width="50" height="50" style="border-radius: 4px; object-fit: cover;" />
  </td>
  <td style="padding: 8px;">${item.title}</td>
  <td style="padding: 8px;">${item.quantity}</td>
  <td style="padding: 8px;">${currency}${item.unitPrice.toFixed(2)}</td>
  <td style="padding: 8px;"><strong>${currency}${item.lineTotal.toFixed(2)}</strong></td>
</tr>
`,
      )
      .join("");

    return `
<div dir="ltr" style="font-family: sans-serif; padding: 10px; max-width: 600px; margin: auto;">
  <h2 style="margin-bottom: 10px;">
    ${messages.order.email.greeting} ${order.name},
  </h2>

  <p style="margin: 0 0 20px 0;">
    ${messages.order.email.confirmation}
  </p>

  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <thead style="background-color: #f5f5f5;">
      <tr style="text-align: center;">
        <th style="padding: 10px;">${messages.order.email.headers.image}</th>
        <th style="padding: 10px;">${messages.order.email.headers.product}</th>
        <th style="padding: 10px;">${messages.order.email.headers.quantity}</th>
        <th style="padding: 10px;">${messages.order.email.headers.price}</th>
        <th style="padding: 10px;">${messages.order.email.headers.total}</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <h3 style="margin-top: 20px;">
    ${messages.order.email.total} ${currency}${Number(order.amount ?? 0).toFixed(2)}
  </h3>

  <p>
    ${messages.order.email.orderNumber}
    <strong>#${order.id}</strong>
  </p>

  <p>
    ${messages.order.email.thanks}
  </p>
</div>
`;
  }
}
