import dotenv from "dotenv";
import {
  findOrThrow,
  sendAdminWhatsApp,
  sendOrderConfirmationEmail,
} from "../src/lib/service";
import { Order } from "../src/lib/entities";
import { ModelType } from "../src/lib/util";
import { DB } from "../src/lib/db";

dotenv.config();
/**
 * Example usage — comment/uncomment what you want to test
 *
 * With seed DB (local Docker):
 SEED=true pnpm tsx scripts/test_order_notifications.ts
 *
 * Without SEED (default DB config - possibly production!):
 pnpm tsx scripts/test_order_notifications.ts
 *
 * ⚠️ WARNING: If SEED=true is not set, this script will use your default DB config — possibly production!
 * This script is intended for local development with a local DB (e.g. Docker).
 */

const order_id = -1; // if negative, fallback to random order

DB.initialize()
  .then(async () => {
    let order: Order;

    if (order_id < 0) {
      order = (await DB.getRepository(Order)
        .createQueryBuilder("order")
        .leftJoinAndSelect("order.items", "items")
        .orderBy("RANDOM()")
        .limit(1)
        .getOne()) as Order;

      if (!order) throw new Error("No orders found in database.");
    } else {
      order = await findOrThrow(ModelType.order, order_id, ["items"]);
    }

    // Optional: mutate order before sending
    order.name = "email test";
    // order.email="test@gmail.com"

    await sendOrderConfirmationEmail(order);
    await sendAdminWhatsApp(order.id);

    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Failed to run order notification test", err);
    process.exit(1);
  });
