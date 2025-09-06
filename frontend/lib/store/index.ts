export * from "./cartSlice";
export * from "./adminSlice";

import {
  configureStore,
  combineReducers,
  type Reducer,
} from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";

import cartReducer, { resetCartTransform } from "./cartSlice";
import adminReducer from "./adminSlice";

const rootReducer = combineReducers({
  cart: cartReducer,
  admin: adminReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const persistedReducer = persistReducer<RootState>(
  {
    key: "root",
    storage,
    whitelist: ["cart", "admin"],
    transforms: [resetCartTransform],
  },
  rootReducer as Reducer<RootState>,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (gDM) => gDM({ serializableCheck: false }),
});

void persistStore(store);

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
