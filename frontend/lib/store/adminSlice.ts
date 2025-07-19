import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { AGTableModelType, Category, ModelType } from "lib/types";
import { deleteModel, getData, getOrders } from "@/lib/api";
import { create_key_to_value_map } from "@/lib/helper";
import { RootState } from "@/lib/store/index";

type AdminState = {
  [key in ModelType]: AGTableModelType[];
};
const initialState: AdminState = Object.values(ModelType).reduce(
  (acc, model) => {
    acc[model as ModelType] = [];
    return acc;
  },
  {} as AdminState,
);

export const deleteRowById = createAsyncThunk<
  { model: ModelType; id: string | number },
  { model: ModelType; id: string | number }
>("models/delete_row", async ({ model, id }) => {
  await deleteModel(model, id as number);
  return { model, id };
});
export const fetchRowsByModel = createAsyncThunk<
  { updates: Partial<AdminState> },
  { model: ModelType }
>("models/fetch_by_model", async ({ model }) => {
  if (model === ModelType.order) {
    const data = await getOrders();
    return {
      updates: {
        [ModelType.order]: data,
      },
    };
  } else {
    const data = await getData();
    return {
      updates: {
        [ModelType.product]: data.products,
        [ModelType.category]: data.categories,
      },
    };
  }
});

export const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRowsByModel.fulfilled, (state, action) => {
        const updates = action.payload.updates;
        for (const key in updates) {
          const model = key as ModelType;
          (state[model] as AGTableModelType[]) = updates[model]!;
        }
      })
      .addCase(deleteRowById.fulfilled, (state, action) => {
        const { model, id } = action.payload;
        state[model] = state[model]!.filter((row) => row.id !== id);
      });
  },
});

export const selectCategoryTitleToIdMap = createSelector(
  (state: RootState) => state.admin.category,
  (categories) =>
    create_key_to_value_map(categories as Category[], "title", "id"),
);
export default adminSlice.reducer;
