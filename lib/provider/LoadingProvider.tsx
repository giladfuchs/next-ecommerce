"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { subscribeGlobalLoading } from "../api";

const LoadingContext = createContext({
  loading: false,
});

export const useLoading = () => useContext(LoadingContext);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return subscribeGlobalLoading(setLoading);
  }, []);

  return (
    <LoadingContext.Provider value={{ loading }}>
      {children}
    </LoadingContext.Provider>
  );
}
