export function title_to_handle(title: string): string {
  return title.trim().replace(/\s+/g, "-"); // Replace spaces with dash
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

export function toHttpError(error: any): HttpError {
  if (error instanceof HttpError) return error;

  if (error instanceof Error && error.message === "no image") {
    return new HttpError(400, "Missing required field: images");
  }

  if (error instanceof Error && error.message === "no cart items") {
    return new HttpError(400, "Order must contain at least one item");
  }

  if (
    error?.name === "QueryFailedError" &&
    error?.code === "23505" &&
    typeof error?.detail === "string"
  ) {
    return new HttpError(400, error.detail);
  }

  if (
    error?.code === "23502" &&
    typeof error?.driverError?.column === "string"
  ) {
    return new HttpError(
      400,
      `Missing required field: ${error.driverError.column}`,
    );
  }

  if (
    error?.name === "QueryFailedError" &&
    error?.code === "23502" &&
    typeof error?.driverError?.column === "string"
  ) {
    return new HttpError(
      500,
      `Missing required field: ${error.driverError.column}`,
    );
  }

  if (
    error?.name === "QueryFailedError" &&
    error?.code === "22P02" &&
    typeof error?.driverError?.message === "string"
  ) {
    return new HttpError(500, error.driverError.message);
  }

  if (error?.name === "NotFoundError") {
    return new HttpError(404, error.message);
  }

  console.error("❌ Uncaught error:", error);
  return new HttpError(500, "Internal server error");
}

export enum ModelType {
  category = "category",
  order = "order",
  product = "product",
}

export enum OrderStatus {
  NEW = "new",
  READY = "ready",
  DONE = "done",
  CANCELED = "canceled",
}


const messages = {
  he: {
    subjectPrefix: "אישור הזמנה - מס'",
    greeting: "שלום",
    confirmation: "ההזמנה שלך נקלטה.",
    orderNumberLabel: "מספר הזמנה:",
    totalLabel: `סה"כ לתשלום: ₪`,
    adminOrderNotification: (id: number) =>
        `📦 התקבלה הזמנה חדשה באתר ${process.env.EMAIL_FROM_NAME}!\n\n🔗 לצפייה בהזמנה: ${process.env.STORE_BASE_URL}/admin/${ModelType.order}/${id}`,
    emailOrderHtml: {
      greeting: "שלום", // he
      confirmation: "ההזמנה שלך התקבלה בהצלחה.",
      total: "סה\"כ לתשלום:",
      orderNumber: "מספר הזמנה:",
      thanks: "תודה שקנית אצלנו 💚",
      headers: {
        image: "תמונה",
        product: "מוצר",
        quantity: "כמות",
        price: "מחיר",
        total: "סה\"כ",
      },
    },
  },
  en: {
    subjectPrefix: "Order Confirmation - No.",
    greeting: "Hello",
    confirmation: "Your order has been received.",
    orderNumberLabel: "Order Number:",
    totalLabel: "Total Amount: ₪",
    adminOrderNotification: (id: number) =>
        `📦 A new order has been placed on ${process.env.EMAIL_FROM_NAME}!\n\n🔗 View it here: ${process.env.STORE_BASE_URL}/admin/${ModelType.order}/${id}`,
    emailOrderHtml: {
      greeting: "Hello",
      confirmation: "Your order was received successfully.",
      total: "Total to Pay:",
      orderNumber: "Order Number:",
      thanks: "Thank you for shopping with us 💚",
      headers: {
        image: "Image",
        product: "Product",
        quantity: "Quantity",
        price: "Price",
        total: "Total",
      },
    },
  },};


export function getMessages(): typeof messages["en"] {
  const lang = process.env.LANG === "he" ? "he" : "en";
  return messages[lang];
}