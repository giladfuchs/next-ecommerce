export * from "./cartSlice";
export * from "./adminSlice";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import cartReducer, { resetCartTransform } from "./cartSlice";
import adminReducer from "./adminSlice";
const isBrowser = typeof window !== "undefined";

const createNoopStorage = () => ({
  getItem: (_key: string) => Promise.resolve(null),
  setItem: (_key: string, _value: string) => Promise.resolve(),
  removeItem: (_key: string) => Promise.resolve(),
});

const safeStorage = isBrowser
  ? require("redux-persist/lib/storage").default
  : createNoopStorage();

const rootReducer = combineReducers({
  cart: cartReducer,
  admin: adminReducer,
});

const persistConfig = {
  key: "root",
  storage: safeStorage,
  whitelist: ["cart", "admin"],
  transforms: [resetCartTransform],
};

const persistedReducer = persistReducer<
  typeof rootReducer extends (...args: any) => infer R ? R : never
>(persistConfig, rootReducer);

export function makeStore() {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
}
export const store = makeStore();
export type RootState = ReturnType<ReturnType<typeof makeStore>["getState"]>;
