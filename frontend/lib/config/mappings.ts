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
  () => Promise<AGTableModelType[]>
> = {
  [ModelType.product]: getProducts,
  [ModelType.category]: getCategories,
  [ModelType.order]: getOrders,
};
