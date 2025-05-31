import { ColDef } from "ag-grid-community";
import { Category, Order, Product } from "./entities";
import { ModelType } from "./enums";

export type AGTableModelType = Product | Category | Order;
export const columns_product: ColDef<Product>[] = [
  {
    field: "title",
    width: 130,
  },
  {
    field: "id",
    cellRenderer: "ActionRenderer",
    width: 130,
  },
  {
    field: "price",
    width: 80,
  },
  {
    field: "category",
    width: 150,
  },
] as ColDef<Product>[];
export const columns_order: ColDef<Order>[] = [
  {
    field: "name",
    width: 122,
  },
  {
    field: "id",
    cellRenderer: "ActionRenderer",
    width: 100,
  },
  {
    field: "email",
    width: 222,
  },
  {
    field: "phone",
    width: 120,
  },
  {
    field: "totalQuantity",
    width: 70,
  },
  {
    field: "cost",
    width: 80,
  },
  {
    field: "items",
    width: 220,
    autoHeight: true,

    cellRenderer: "OrderItemsRenderer",
  },
  {
    field: "status",
    width: 100,
    cellRenderer: "OrderStatusRenderer",
  },
] as ColDef<Order>[];

export const columns_category: ColDef<Category>[] = [
  {
    field: "title",
    width: 122,
  },
  {
    field: "id",
    cellRenderer: "ActionRenderer",
    width: 100,
  },
  {
    field: "position",
    width: 100,
  },
] as ColDef<Category>[];
export const get_columns_ag_by_model = (
  model: ModelType,
): ColDef<AGTableModelType>[] => {
  let columns;
  switch (model) {
    case ModelType.product:
      columns = [...columns_product];
      break;

    case ModelType.order:
      columns = [...columns_order];
      break;
    case ModelType.category:
      columns = [...columns_category];
      break;

    default:
      columns = [...columns_product];
  }

  return columns as ColDef<AGTableModelType>[];
};
