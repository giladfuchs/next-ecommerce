import { AGTableModelType, ModelType, OrderStatus } from "../types";
import { getCategories, getOrders, getProducts } from "../api";

export const statusOptions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.NEW]: [
    OrderStatus.READY,
    OrderStatus.DONE,
    OrderStatus.CANCELED,
  ],
  [OrderStatus.READY]: [OrderStatus.DONE, OrderStatus.CANCELED],
  [OrderStatus.DONE]: [],
  [OrderStatus.CANCELED]: [OrderStatus.NEW],
};
export const modelFetchers: Record<
  ModelType,
  (force?: boolean) => Promise<AGTableModelType[]>
> = {
  [ModelType.product]: (force?: boolean) => getProducts(force),
  [ModelType.category]: (force?: boolean) => getCategories(force),
  [ModelType.order]: (force?: boolean) => getOrders(force),
};
