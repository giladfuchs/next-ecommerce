import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from "typeorm";
import { Order, Product } from "./entities";

@EventSubscriber()
export class ProductSubscriber implements EntitySubscriberInterface<Product> {
  listenTo() {
    return Product;
  }

  async beforeInsert(event: InsertEvent<Product>) {
    const product = event.entity;

    if (
      !product ||
      !Array.isArray(product.images) ||
      product.images.length === 0
    ) {
      throw new Error("no image");
    }
  }

  async beforeUpdate(event: UpdateEvent<Product>) {
    const product = event.entity;

    if (!product) return;

    if (!Array.isArray(product.images) || product.images.length === 0) {
      throw new Error("no image");
    }
  }
}

@EventSubscriber()
export class OrderSubscriber implements EntitySubscriberInterface<Order> {
  listenTo() {
    return Order;
  }

  async beforeInsert(event: InsertEvent<Order>) {
    const order = event.entity;

    if (!order.items || order.items.length === 0) {
      throw new Error("no cart items");
    }
  }
}
