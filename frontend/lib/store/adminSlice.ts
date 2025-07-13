import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { AGTableModelType, ModelType } from "lib/types";
import { deleteModel } from "@/lib/api";
import { modelFetchers } from "@/lib/config/mappings";
import { create_key_to_value_map } from "@/lib/helper";
import { RootState } from "@/lib/store/index";

type AdminState = {
  [key in ModelType]?: AGTableModelType[];
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
  { model: ModelType; data: AGTableModelType[] },
  { model: ModelType }
>("models/fetch_by_model", async ({ model }) => {
  const data = await modelFetchers[model]();
  return { model, data };
});

export const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRowsByModel.fulfilled, (state, action) => {
        const { model, data } = action.payload;
        (state[model] as AGTableModelType[]) = data;
      })
      .addCase(deleteRowById.fulfilled, (state, action) => {
        const { model, id } = action.payload;
        state[model] = state[model]!.filter((row) => row.id !== id);
      });
  },
});

export const selectCategoryTitleToIdMap = createSelector(
  (state: RootState) => state.admin.category,
  (categories) => create_key_to_value_map(categories, "title", "id"),
);
export default adminSlice.reducer;
