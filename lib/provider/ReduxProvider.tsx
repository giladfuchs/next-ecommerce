"use client";

import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { makeStore } from "lib/store";

const store = makeStore();

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const [persistor, setPersistor] = useState<any>(null);

  useEffect(() => {
    const p = persistStore(store);
    setPersistor(p);
  }, []);

  if (!persistor) return null;

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
