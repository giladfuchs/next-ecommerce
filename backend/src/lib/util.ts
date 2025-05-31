export function title_to_handle(title: string): string {
  return title.trim().replace(/\s+/g, "-"); // Replace spaces with dash
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
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

export const email_data = {
  subjectPrefix: "אישור הזמנה - מס'",
  greeting: "שלום",
  confirmation: "ההזמנה שלך נקלטה.",
  orderNumberLabel: "מספר הזמנה:",
  totalLabel: `סה"כ לתשלום: ₪`,
};
